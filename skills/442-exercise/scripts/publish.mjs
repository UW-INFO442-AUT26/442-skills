#!/usr/bin/env node
// Publish one exercise folder as a public GitHub Pages site.
//
//   node publish.mjs <dir> --name <repo> [--dry-run] [--no-qr] [--user <login>]
//
// <dir> holds index.html (required) plus anything else it needs. The script
// makes the folder a git repo, commits it, creates <you>/<repo> as a public
// repo, pushes, turns on GitHub Pages, and prints the live URL and a QR code
// so the student can open it on a phone. Nothing outside <dir> is touched.
//
// Runs offline except for git and gh. No dependencies.

import { spawnSync } from "node:child_process";
import { existsSync, realpathSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";

const USAGE = `Publish one exercise folder as a public GitHub Pages site.

  node publish.mjs <dir> --name <repo> [--dry-run] [--no-qr] [--user <login>]

  <dir>        folder holding index.html, for example ./exercises/442-big-o
  --name       GitHub repo name, for example 442-big-o (becomes the URL)
  --dry-run    print the plan, create nothing
  --no-qr      skip the QR code
  --user       GitHub account, defaults to the one gh is signed in as
  --help       this text
`;

/* ------------------------------------------------------------------ *
 * QR code: byte mode, error correction level M, versions 1 to 10.
 * Kept here so publishing needs no network and no dependency.        *
 * ------------------------------------------------------------------ */

// Data bytes that fit, per version, at level M.
const QR_CAPACITY_M = [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213];
// Error correction codewords per block, and the data codewords per block.
const QR_EC_M = {
  1: { ec: 10, data: [16] },
  2: { ec: 16, data: [28] },
  3: { ec: 26, data: [44] },
  4: { ec: 18, data: [32, 32] },
  5: { ec: 24, data: [43, 43] },
  6: { ec: 16, data: [27, 27, 27, 27] },
  7: { ec: 18, data: [31, 31, 31, 31] },
  8: { ec: 22, data: [38, 38, 39, 39] },
  9: { ec: 22, data: [36, 36, 36, 37, 37] },
  10: { ec: 26, data: [43, 43, 43, 43, 44] },
};
// Alignment pattern centres per version.
const QR_ALIGN = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};
// The eight data masks. Each returns true where a module is inverted.
const MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = (x << 1) ^ (x & 0x80 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]]);

function bitLength(n) {
  let len = 0;
  while (n !== 0) {
    len += 1;
    n >>>= 1;
  }
  return len;
}

function rsGenerator(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data, ecLength) {
  const gen = rsGenerator(ecLength);
  const buf = new Uint8Array(data.length + ecLength);
  buf.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = buf[i];
    if (coef === 0) continue;
    for (let j = 0; j < gen.length; j++) buf[i + j] ^= gfMul(gen[j], coef);
  }
  return Array.from(buf.slice(data.length));
}

function formatBits(ecBits, mask) {
  const data = (ecBits << 3) | mask;
  let d = data << 10;
  while (bitLength(d) - bitLength(0x537) >= 0) d ^= 0x537 << (bitLength(d) - bitLength(0x537));
  return ((data << 10) | d) ^ 0x5412;
}

function versionBits(version) {
  let d = version << 12;
  while (bitLength(d) - bitLength(0x1f25) >= 0) d ^= 0x1f25 << (bitLength(d) - bitLength(0x1f25));
  return (version << 12) | d;
}

function chooseVersion(byteLength) {
  for (let v = 1; v <= 10; v++) if (byteLength <= QR_CAPACITY_M[v]) return v;
  return 0;
}

function makeCodewords(bytes, version) {
  const { ec, data } = QR_EC_M[version];
  const capacity = data.reduce((a, b) => a + b, 0);
  const bits = [];
  const push = (value, length) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  push(0b0100, 4); // byte mode
  push(bytes.length, version >= 10 ? 16 : 8);
  for (const byte of bytes) push(byte, 8);

  const total = capacity * 8;
  if (bits.length > total) throw new Error("payload does not fit version " + version);
  for (let i = 0; i < 4 && bits.length < total; i++) bits.push(0); // terminator
  while (bits.length % 8 !== 0) bits.push(0);

  const words = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let k = 0; k < 8; k++) byte = (byte << 1) | bits[i + k];
    words.push(byte);
  }
  const pad = [0xec, 0x11];
  let p = 0;
  while (words.length < capacity) words.push(pad[p++ % 2]);

  const blocks = [];
  let offset = 0;
  for (const length of data) {
    const chunk = words.slice(offset, offset + length);
    offset += length;
    blocks.push({ data: chunk, ec: rsEncode(chunk, ec) });
  }

  const out = [];
  const widest = Math.max(...data);
  for (let i = 0; i < widest; i++) for (const block of blocks) if (i < block.data.length) out.push(block.data[i]);
  for (let i = 0; i < ec; i++) for (const block of blocks) out.push(block.ec[i]);
  return out;
}

function buildMatrix(version, mask) {
  const size = version * 4 + 17;
  const m = Array.from({ length: size }, () => new Array(size).fill(null));

  const finder = (row, col) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r;
        const cc = col + c;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        const ring = (r >= 0 && r <= 6 && (c === 0 || c === 6)) || (c >= 0 && c <= 6 && (r === 0 || r === 6));
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        m[rr][cc] = ring || core;
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  for (let i = 8; i <= size - 9; i++) {
    const dark = i % 2 === 0;
    m[6][i] = dark;
    m[i][6] = dark;
  }

  const centres = QR_ALIGN[version];
  if (centres.length) {
    const first = centres[0];
    const last = centres[centres.length - 1];
    for (const r of centres) {
      for (const c of centres) {
        if ((r === first && c === first) || (r === first && c === last) || (r === last && c === first)) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            m[r + dr][c + dc] = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          }
        }
      }
    }
  }

  m[size - 8][8] = true; // the always dark module

  if (version >= 7) {
    const bits = versionBits(version);
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >> i) & 1) === 1;
      m[Math.floor(i / 3)][(i % 3) + size - 11] = dark;
      m[(i % 3) + size - 11][Math.floor(i / 3)] = dark;
    }
  }

  // Reserve the format information areas: row 8 and column 8, skipping the
  // timing line that already set its own modules.
  for (let i = 0; i <= 8; i++) {
    if (m[8][i] === null) m[8][i] = false;
    if (m[i][8] === null) m[i][8] = false;
  }
  for (let i = 0; i < 8; i++) {
    if (m[8][size - 1 - i] === null) m[8][size - 1 - i] = false;
    if (m[size - 1 - i][8] === null) m[size - 1 - i][8] = false;
  }
  return m;
}

function placeData(m, codewords, mask) {
  const size = m.length;
  const maskFn = MASKS[mask];
  let bit = 7;
  let word = 0;
  let inc = -1;
  let row = size - 1;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;
    for (;;) {
      for (let k = 0; k < 2; k++) {
        const c = col - k;
        if (m[row][c] === null) {
          let dark = false;
          if (word < codewords.length) dark = ((codewords[word] >>> bit) & 1) === 1;
          if (maskFn(row, c)) dark = !dark;
          m[row][c] = dark;
          bit -= 1;
          if (bit === -1) {
            word += 1;
            bit = 7;
          }
        }
      }
      row += inc;
      if (row < 0 || row >= size) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }
}

function drawFormat(m, mask) {
  const size = m.length;
  const bits = formatBits(0b00, mask); // level M
  for (let i = 0; i < 15; i++) {
    const dark = ((bits >> i) & 1) === 1;
    if (i < 6) m[i][8] = dark;
    else if (i < 8) m[i + 1][8] = dark;
    else m[size - 15 + i][8] = dark;
  }
  for (let i = 0; i < 15; i++) {
    const dark = ((bits >> i) & 1) === 1;
    if (i < 8) m[8][size - i - 1] = dark;
    else if (i < 9) m[8][7] = dark;
    else m[8][14 - i] = dark;
  }
  m[size - 8][8] = true;
}

function penalty(m) {
  const size = m.length;
  let score = 0;

  const runScore = (run) => (run >= 5 ? 3 + run - 5 : 0);
  for (let r = 0; r < size; r++) {
    let run = 1;
    for (let c = 1; c < size; c++) {
      if (m[r][c] === m[r][c - 1]) run += 1;
      else {
        score += runScore(run);
        run = 1;
      }
    }
    score += runScore(run);
  }
  for (let c = 0; c < size; c++) {
    let run = 1;
    for (let r = 1; r < size; r++) {
      if (m[r][c] === m[r - 1][c]) run += 1;
      else {
        score += runScore(run);
        run = 1;
      }
    }
    score += runScore(run);
  }

  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = m[r][c];
      if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
    }
  }

  const p1 = [true, false, true, true, true, false, true, false, false, false, false];
  const p2 = [false, false, false, false, true, false, true, true, true, false, true];
  const hit = (get, at, pattern) => {
    for (let k = 0; k < 11; k++) if (get(at + k) !== pattern[k]) return false;
    return true;
  };
  for (let r = 0; r < size; r++) {
    const row = m[r];
    for (let c = 0; c <= size - 11; c++) {
      if (hit((i) => row[i], c, p1) || hit((i) => row[i], c, p2)) score += 40;
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 11; r++) {
      if (hit((i) => m[i][c], r, p1) || hit((i) => m[i][c], r, p2)) score += 40;
    }
  }

  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (m[r][c]) dark += 1;
  score += Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10;
  return score;
}

/** The finished QR modules for `text`, as an array of boolean rows. */
export function qrMatrix(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = chooseVersion(bytes.length);
  if (!version) throw new Error("text too long for the built-in QR encoder (" + bytes.length + " bytes, max 213)");
  const codewords = makeCodewords(bytes, version);

  let best = null;
  let bestMask = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const m = buildMatrix(version, mask);
    placeData(m, codewords, mask);
    const score = penalty(m);
    if (score < bestScore) {
      bestScore = score;
      best = m;
      bestMask = mask;
    }
  }
  drawFormat(best, bestMask);
  return best;
}

/** The QR for `text` as half block characters, for a terminal. */
export function qrTerminal(text, quiet = 2) {
  const m = qrMatrix(text);
  const size = m.length;
  const n = size + quiet * 2;
  const dark = (r, c) => {
    const rr = r - quiet;
    const cc = c - quiet;
    return rr >= 0 && cc >= 0 && rr < size && cc < size && m[rr][cc] === true;
  };
  const lines = [];
  for (let r = 0; r < n; r += 2) {
    let line = "";
    for (let c = 0; c < n; c++) {
      const top = dark(r, c);
      const bottom = r + 1 < n && dark(r + 1, c);
      line += top && bottom ? "\u2588" : top ? "\u2580" : bottom ? "\u2584" : " ";
    }
    lines.push(line);
  }
  // Black on white, explicitly, so the code scans from any terminal theme.
  return lines.map((line) => "\x1b[30;47m" + line + "\x1b[0m").join("\n");
}

/* ------------------------------------------------------------------ *
 * The publish command                                                 *
 * ------------------------------------------------------------------ */

const say = (msg) => process.stdout.write(msg + "\n");
const warn = (msg) => process.stderr.write("warning: " + msg + "\n");
const fail = (msg) => {
  process.stderr.write("error: " + msg + "\n");
  process.exit(1);
};

function tryRun(cmd, args, opts) {
  const r = spawnSync(cmd, args, Object.assign({ encoding: "utf8" }, opts || {}));
  return {
    ok: !r.error && r.status === 0,
    out: [r.stdout, r.stderr].filter(Boolean).join("").trim(),
  };
}

function hasBinary(cmd) {
  const r = spawnSync(cmd, ["--version"], { encoding: "utf8" });
  return !r.error && r.status === 0;
}

function quote(s) {
  return /^[A-Za-z0-9_./=:@+-]+$/.test(s) ? s : "'" + String(s).replace(/'/g, "'\\''") + "'";
}

// The QR is a convenience for the phone; a URL too long to encode must not
// fail a publish that already succeeded.
function showQr(url) {
  try {
    say(qrTerminal(url));
  } catch (err) {
    warn("no QR code for this URL (" + err.message + ")");
  }
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run" || arg === "--no-qr") flags[arg.slice(2)] = true;
    else if (arg === "--name" || arg === "--user") {
      if (i + 1 >= argv.length) fail(arg + " needs a value");
      flags[arg.slice(2)] = argv[++i];
    } else if (arg === "--help" || arg === "-h") flags.help = true;
    else if (arg.startsWith("--")) fail("unknown option " + arg);
    else positional.push(arg);
  }
  return { positional, flags };
}

function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  if (flags.help) {
    process.stdout.write(USAGE);
    return;
  }

  const dirArg = positional[0];
  if (!dirArg) fail("pass the exercise folder: node publish.mjs ./exercises/my-topic --name 442-my-topic");
  const name = flags.name ? String(flags.name) : "";
  if (!name) fail("--name is required; it becomes the repo and the URL");
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)) {
    fail("--name must start with a letter or digit and hold only letters, digits, dots, dashes or underscores");
  }

  const dir = resolve(dirArg);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) fail("there is no folder at " + dir);
  if (!existsSync(join(dir, "index.html"))) {
    fail(dir + " has no index.html. Build the page from assets/exercise.html first.");
  }

  const dryRun = flags["dry-run"] === true;
  const quiet = flags["no-qr"] === true;

  if (!hasBinary("git")) fail("git is not installed or not on PATH. Install git first.");
  const ghThere = hasBinary("gh");
  if (!ghThere && !dryRun) {
    fail("the GitHub CLI is not installed or not on PATH. Install it with: brew install gh");
  }
  if (!ghThere) warn("gh was not found, so the account checks below are skipped");

  let authed = false;
  if (ghThere) authed = spawnSync("gh", ["auth", "status"], { encoding: "utf8" }).status === 0;
  if (ghThere && !authed && !dryRun) fail("gh is not signed in. Run: gh auth login");
  if (ghThere && !authed) warn("gh is not signed in, so the account checks below are skipped");

  let login = flags.user ? String(flags.user) : "";
  if (!login && ghThere && authed) login = tryRun("gh", ["api", "user", "-q", ".login"]).out.trim();
  const known = Boolean(login);
  if (!known && !dryRun) fail("could not read your GitHub login. Pass --user <login>.");
  if (!login) login = "<login>";

  const slug = login + "/" + name;
  const isUserSite = name.toLowerCase() === (login + ".github.io").toLowerCase();
  const url = known && isUserSite ? "https://" + login + ".github.io/" : "https://" + login + ".github.io/" + name + "/";

  const isRepo = existsSync(join(dir, ".git"));
  const remoteThere = isRepo && tryRun("git", ["-C", dir, "remote", "get-url", "origin"]).ok;
  let repoThere = false;
  if (known) repoThere = tryRun("gh", ["repo", "view", slug]).ok;

  const identity = tryRun("git", ["-C", dir, "config", "user.email"]).ok
    ? []
    : ["-c", "user.name=" + (known ? login : "INFO 442 exercise"), "-c", "user.email=" + (known ? login + "@users.noreply.github.com" : "noreply@example.com")];

  const message = "Add " + name + " exercise";
  const plan = [];
  const step = (text, run) => plan.push({ text, run });

  if (!isRepo) {
    step("git init -b main " + quote(dir), () => {
      const first = tryRun("git", ["init", "-b", "main"], { cwd: dir });
      if (first.ok) return;
      if (!tryRun("git", ["init"], { cwd: dir }).ok) fail("git init failed in " + dir);
      if (!tryRun("git", ["checkout", "-b", "main"], { cwd: dir }).ok) fail("could not create the main branch in " + dir);
    });
  }
  step("git -C " + quote(dir) + " add -A", () => {
    if (!tryRun("git", ["-C", dir, "add", "-A"]).ok) fail("git add failed in " + dir);
  });
  step("git -C " + quote(dir) + " commit -m " + quote(message), () => {
    const r = tryRun("git", ["-C", dir].concat(identity, ["commit", "-m", message]));
    if (!r.ok && !/nothing to commit|no changes added/i.test(r.out)) fail("git commit failed:\n" + r.out);
  });

  if (!repoThere) {
    step(
      "gh repo create " + slug + " --public --source " + quote(dir) + " --push",
      () => {
        const r = tryRun("gh", ["repo", "create", slug, "--public", "--source", dir, "--push", "--description", "INFO 442 practice exercise"]);
        if (!r.ok) fail("gh repo create failed:\n" + r.out);
      }
    );
  } else {
    if (!remoteThere) {
      step("git -C " + quote(dir) + " remote add origin https://github.com/" + slug + ".git", () => {
        const r = tryRun("git", ["-C", dir, "remote", "add", "origin", "https://github.com/" + slug + ".git"]);
        if (!r.ok) fail("could not add the origin remote:\n" + r.out);
      });
    }
    step("git -C " + quote(dir) + " push -u origin main", () => {
      const r = tryRun("git", ["-C", dir, "push", "-u", "origin", "main"]);
      if (!r.ok) fail("git push failed:\n" + r.out);
    });
  }

  step(
    "gh api -X POST repos/" + slug + "/pages -f source[branch]=main -f source[path]=/",
    () => {
      const post = tryRun("gh", ["api", "-X", "POST", "repos/" + slug + "/pages", "-f", "source[branch]=main", "-f", "source[path]=/"]);
      if (post.ok) return;
      // Pages are already on: point them at main and the repo root instead.
      const put = tryRun("gh", ["api", "-X", "PUT", "repos/" + slug + "/pages", "-f", "source[branch]=main", "-f", "source[path]=/"]);
      if (!put.ok) fail("could not enable GitHub Pages:\n" + post.out + "\n" + put.out);
    }
  );

  if (dryRun) {
    say("Dry run. Nothing was created, committed, or pushed.");
    say("");
    plan.forEach((s, i) => say("  " + (i + 1) + ". " + s.text));
    say("");
    say("Would publish to: " + url);
    if (!quiet && known) {
      say("");
      showQr(url);
    }
    return;
  }

  for (const s of plan) {
    say("  " + s.text);
    s.run();
  }

  say("");
  say("Published: " + url);
  say("GitHub builds Pages once; the link is live in about a minute.");
  say("");
  say("Open it on your phone, answer before you check, and redo the misses tomorrow.");
  if (!quiet) {
    say("");
    showQr(url);
  }
}

const isDirectRun = () => {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
};

if (isDirectRun()) main();

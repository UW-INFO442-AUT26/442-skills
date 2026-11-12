#!/usr/bin/env node
// Looks at a running page the way a user would, and reports what is wrong.
// Read only: it writes screenshots into .browser-use/ and nothing else.
//
//   node <this-skill>/scripts/shoot.mjs http://localhost:5173
//   node <this-skill>/scripts/shoot.mjs                (starts the dev server itself)
//   node <this-skill>/scripts/shoot.mjs --project ../app --wait 1500
//
// Exit 0 clean, 1 findings, 2 setup needed, 3 could not run.
// Needs playwright and a chromium-family browser. It says exactly what to
// install and stops, rather than installing anything itself.
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const VALUE_FLAGS = new Set(["project", "wait"]);
const flags = new Map();
const positionals = [];
for (let i = 0; i < args.length; i++) {
  const current = args[i];
  if (!current.startsWith("--")) {
    positionals.push(current);
    continue;
  }
  const name = current.slice(2);
  flags.set(name, VALUE_FLAGS.has(name) && args[i + 1] ? args[++i] : true);
}
const projectDir = resolve(flags.get("project") ?? ".");
const waitMs = Number(flags.get("wait") ?? 900);
const explicitUrl = positionals[0];
const wantStart = !explicitUrl || flags.has("start");

const MOBILE = { width: 360, height: 800 };
const DESKTOP = { width: 1280, height: 800 };

function setupNeeded(line) {
  console.error(line);
  console.error("setup needed: run the command above, then try again.");
  process.exit(2);
}

// The skill lives outside the student's project, so playwright is looked up
// from the project, where npm put it, and not from this file's own folder.
const requireFromProject = createRequire(join(projectDir, "package.json"));

let playwright;
try {
  playwright = requireFromProject("playwright");
} catch {
  setupNeeded(
    `playwright is not installed here. From ${projectDir}:\n` +
      "  npm i -D playwright && npx playwright install chromium",
  );
}

const outDir = join(projectDir, ".browser-use");
mkdirSync(outDir, { recursive: true });

// A dev server may need starting. Vite prints its own URL, so read it from the
// output rather than guessing the port.
let server = null;
async function startServer() {
  const pkgFile = join(projectDir, "package.json");
  if (!existsSync(pkgFile)) return null;
  const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));
  const script = pkg.scripts?.dev ? "dev" : pkg.scripts?.start ? "start" : null;
  if (!script) return null;
  // detached puts npm and everything it starts in one process group, so the
  // whole dev server dies with one signal instead of leaving a vite on the port.
  server = spawn("npm", ["run", script], {
    cwd: projectDir,
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  let seen = "";
  const url = await new Promise((done) => {
    const timer = setTimeout(() => done(null), 30000);
    const read = (chunk) => {
      seen += chunk.toString();
      const found = seen.match(/http:\/\/localhost:(\d+)/);
      if (found) {
        clearTimeout(timer);
        done(found[0]);
      }
    };
    server.stdout.on("data", read);
    server.stderr.on("data", read);
    server.on("exit", () => {
      clearTimeout(timer);
      done(null);
    });
  });
  if (!url) return null;
  for (let i = 0; i < 40; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return url;
    } catch {
      // not up yet, keep waiting
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return url;
}

let browser = null;
let usedBrowser = "bundled chromium";
const findings = [];
const note = (kind, where, detail) => findings.push({ kind, where, detail });

try {
  const url = explicitUrl ?? (wantStart ? await startServer() : null);
  if (!url) {
    console.error(`could not find a URL and could not start a dev server in ${projectDir}`);
    process.exit(3);
  }

  // Prefer the Chrome the student already has, so nobody waits on a 130 MB
  // download for a screenshot. Fall back to the bundled build.
  for (const channel of ["chrome", "chromium"]) {
    try {
      browser = await playwright.chromium.launch({ channel });
      usedBrowser = channel === "chrome" ? "installed Chrome" : "bundled chromium";
      break;
    } catch {
      // try the next one
    }
  }
  if (!browser) {
    setupNeeded("no browser could be launched. From " + projectDir + ":\n  npx playwright install chromium");
  }

  for (const [label, viewport] of [
    ["360", MOBILE],
    ["1280", DESKTOP],
  ]) {
    const page = await browser.newPage({ viewport });
    page.on("console", (m) => {
      if (m.type() === "error") note(`${label} console error`, "console", m.text().slice(0, 160));
    });
    page.on("pageerror", (e) => {
      note(`${label} uncaught error`, "runtime", String(e.message).slice(0, 160));
    });
    page.on("requestfailed", (r) => {
      const why = r.failure()?.errorText ?? "failed";
      if (!/favicon/i.test(r.url())) note(`${label} failed request`, r.url().slice(0, 120), why);
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    try {
      await page.waitForLoadState("networkidle", { timeout: 8000 });
    } catch {
      // a poll or a live connection never goes idle; carry on
    }
    await page.waitForTimeout(waitMs);
    await page.screenshot({ path: join(outDir, `${label}.png`), fullPage: true });

    const survey = await page.evaluate(() => {
      const problems = [];
      const label = (el) => {
        const tag = el.tagName.toLowerCase();
        if (el.id) return `${tag}#${el.id}`;
        const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/)[0] : "";
        return cls ? `${tag}.${cls}` : tag;
      };
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      if (overflow > 1) {
        problems.push({
          kind: "overflow",
          where: "document",
          detail: `page is ${overflow}px wider than the ${window.innerWidth}px viewport`,
        });
      }
      // A container with children but no height draws as a strip. This is the
      // map-with-no-height bug, and it catches collapsed cards the same way.
      // Only the outermost one is reported: its children are collapsed too, and
      // naming them all is the same bug said four times.
      const flat = [];
      for (const el of document.querySelectorAll("body *")) {
        const box = el.getBoundingClientRect();
        if (box.width > 8 && box.height < 2) flat.push(el);
      }
      const outermost = flat.filter((el) => !flat.includes(el.parentElement));
      for (const el of outermost) {
        if (el.children.length === 0 && !el.textContent?.trim()) continue;
        problems.push({ kind: "collapsed", where: label(el).slice(0, 60), detail: "has content but no height" });
      }
      for (const el of document.querySelectorAll("img")) {
        if (!el.complete || el.naturalWidth === 0) {
          problems.push({ kind: "broken image", where: String(el.currentSrc || el.src).slice(0, 120), detail: "did not load" });
        }
      }
      const interactive = [...document.querySelectorAll("a, button, input, select")];
      const tiny = interactive.filter((el) => {
        const box = el.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && (box.width < 24 || box.height < 24);
      });
      if (tiny.length) {
        problems.push({
          kind: "small target",
          where: `${tiny.length} control${tiny.length > 1 ? "s" : ""}`,
          detail: "smaller than 24px, hard to tap",
        });
      }
      return problems;
    });
    for (const p of survey) note(`${label} ${p.kind}`, p.where, p.detail);

    await page.close();
  }
} catch (error) {
  console.error(`could not run: ${error.message}`);
  process.exit(3);
} finally {
  if (browser) await browser.close();
  if (server) {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      server.kill();
    }
    await new Promise((r) => setTimeout(r, 400));
    try {
      process.kill(-server.pid, "SIGKILL");
    } catch {
      // already gone, which is the good case
    }
  }
}

const report = {
  url: explicitUrl ?? "started dev server",
  browser: usedBrowser,
  screenshots: [join(outDir, "360.png"), join(outDir, "1280.png")],
  findings,
};

console.log(JSON.stringify(report, null, 2));

if (!findings.length) {
  console.log("clean: nothing broken at 360px or 1280px");
  process.exit(0);
}
// The same error often lands twice, once per viewport. Say so once.
const seen = new Set();
const unique = [];
for (const f of findings) {
  const key = `${f.kind.replace(/^\d+ /, "")}|${f.where}|${f.detail}`;
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(f);
}
console.log(`\n${unique.length} distinct problem${unique.length > 1 ? "s" : ""}`);
for (const f of unique.slice(0, 10)) console.log(`  ${f.kind}: ${f.where} (${f.detail})`);
process.exit(1);

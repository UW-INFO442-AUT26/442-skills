#!/usr/bin/env node
// Deterministic gate for the 442-skills repo. Run before every commit:
//   node scripts/check-repo.mjs [root]
// Exit 0 = pass. It validates every skill against the Agent Skills spec
// (frontmatter, name, description, links) and the repo's own conventions, then
// runs the installer test in throwaway directories. The root defaults to this
// repo; scripts/test-check-repo.sh passes a fixture instead.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.argv[2]
  ? resolve(process.argv[2])
  : join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(root, "skills");
const errors = [];
const warnings = [];

const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// The frontmatter fields the Agent Skills spec defines. Anything else gets a
// warning: harness-specific behavior is supposed to live under `metadata`.
const SPEC_FIELDS = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
  "disable-model-invocation",
]);

// A plain (unquoted) YAML scalar is only valid if it does not start with, or
// contain, an indicator a parser reads as structure. A description that trips
// this is the most common way a skill breaks quietly, because the whole file
// stops parsing and the agent never sees the name or the description at all.
const UNSAFE_PLAIN = /^[|>#&*!%@`{}[\]"',]|^[-?:](\s|$)|\s#|:\s|\t/;

// Split the file into frontmatter lines and body. Strict on purpose: the
// opening and closing delimiters are single lines holding exactly `---`.
function splitFrontmatter(text) {
  const lines = text.split("\n");
  if (lines[0]?.trim() !== "---") return { ok: false };
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
  if (end === -1) return { ok: false, unclosed: true };
  return { ok: true, head: lines.slice(1, end), body: lines.slice(end + 1).join("\n") };
}

// Reject the plain scalars YAML would not read as a string, and accept the ones
// it would. This is a validator for the subset the spec uses, not a YAML parser.
function checkScalar(dir, field, value) {
  if (!value) return;
  const doubleQuoted = value.startsWith('"');
  const singleQuoted = value.startsWith("'");
  if (doubleQuoted || singleQuoted) {
    const quote = doubleQuoted ? '"' : "'";
    if (!value.endsWith(quote) || value.length === 1) {
      err(`${dir}: ${field} has an unclosed ${quote === '"' ? "double" : "single"} quote`);
    }
    return;
  }
  if (UNSAFE_PLAIN.test(value)) {
    err(
      `${dir}: ${field} is unquoted and starts with or contains YAML punctuation, ` +
        `so the file will not parse. Wrap the whole value in quotes: ` +
        JSON.stringify(value.length > 50 ? `${value.slice(0, 47)}...` : value)
    );
  }
}

function checkFrontmatter(dir, text) {
  if (/\r\n/.test(text)) warn(`${dir}: SKILL.md has CRLF line endings; commit it with LF`);
  if (text.charCodeAt(0) === 0xfeff) {
    err(`${dir}: SKILL.md starts with a byte order mark; parsers read that as content, not frontmatter`);
  }

  const fm = splitFrontmatter(text.replace(/^\uFEFF/, ""));
  if (!fm.ok) {
    err(
      `${dir}: ${fm.unclosed
        ? "frontmatter is not closed by a line holding only ---"
        : "SKILL.md must start with a line holding only --- to open the frontmatter"}`
    );
    return;
  }
  if (fm.head.some((line) => line.includes("\t"))) {
    err(`${dir}: the frontmatter contains a tab; YAML forbids tabs for indentation`);
  }

  const fields = new Map();
  const metadata = new Map();
  let inMetadata = false;
  for (const raw of fm.head) {
    if (!raw.trim() || raw.trimStart().startsWith("#")) continue;
    if (/^\s/.test(raw)) {
      if (!inMetadata) {
        err(`${dir}: frontmatter line "${raw.trim()}" is indented, and nothing above it opens a block`);
        continue;
      }
      const nested = raw.match(/^ {2}([A-Za-z0-9_.\/-]+): (.*)$/);
      if (!nested || !nested[2].trim()) {
        err(`${dir}: metadata line "${raw.trim()}" should be two spaces, a key, and a value`);
        continue;
      }
      checkScalar(dir, `metadata ${nested[1]}`, nested[2].trim());
      if (/^(true|false|-?\d+(\.\d+)?)$/.test(nested[2].trim())) {
        warn(`${dir}: metadata ${nested[1]} is not quoted; the spec types metadata values as strings`);
      }
      metadata.set(nested[1], nested[2].trim());
      continue;
    }
    inMetadata = false;
    const line = raw.match(/^([A-Za-z0-9_-]+):[ ]?(.*)$/);
    if (!line) {
      err(`${dir}: frontmatter line "${raw.trim()}" is not a key and a value`);
      continue;
    }
    const [, key, value] = line;
    if (fields.has(key)) err(`${dir}: frontmatter sets ${key} twice`);
    fields.set(key, value.trim());
    if (key === "metadata") {
      inMetadata = true;
      if (value.trim()) err(`${dir}: metadata should be a block of indented key: value lines, not "${value.trim()}"`);
    } else if (SPEC_FIELDS.has(key)) {
      checkScalar(dir, key, value.trim());
    }
  }

  for (const key of fields.keys()) {
    if (!SPEC_FIELDS.has(key)) {
      warn(`${dir}: frontmatter field "${key}" is not one the spec defines; put harness-specific behavior under metadata`);
    }
  }

  const name = fields.get("name");
  if (!name) err(`${dir}: frontmatter has no name`);
  else {
    if (name !== dir) err(`${dir}: frontmatter name "${name}" must equal the directory name`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
      err(`${dir}: name "${name}" must be lowercase letters, digits, and single hyphens`);
    }
    if (name.length > 64) err(`${dir}: name is longer than the 64 characters the spec allows`);
    if (!name.startsWith("442-")) err(`${dir}: name must carry the 442- prefix`);
  }

  const description = fields.get("description");
  if (!description) err(`${dir}: frontmatter has no description`);
  else {
    const value = description.replace(/^["']|["']$/g, "");
    if (value.length < 40) warn(`${dir}: description is thin (${value.length} chars)`);
    if (value.length > 700) err(`${dir}: description too long (${value.length} chars), it is always-loaded`);
    if (!/use when/i.test(value)) warn(`${dir}: description has no "Use when" trigger branch`);
  }

  const body = fm.body.trim();
  if (!body) err(`${dir}: SKILL.md has no body after the frontmatter`);
  else if (body.length > 20000) warn(`${dir}: the body is ${body.length} chars; the guide wants it under about 20,000`);
}

const skillsPresent = existsSync(skillsDir);
const skills = skillsPresent
  ? readdirSync(skillsDir).filter((e) => statSync(join(skillsDir, e)).isDirectory())
  : [];

if (!skillsPresent) err("skills/ is missing");
else if (skills.length === 0) err("skills/ is empty");

const readmeText = existsSync(join(root, "README.md"))
  ? readFileSync(join(root, "README.md"), "utf8")
  : "";

for (const dir of skills) {
  const skillFile = join(skillsDir, dir, "SKILL.md");
  if (!existsSync(skillFile)) {
    err(`${dir}: missing SKILL.md`);
    continue;
  }
  const text = readFileSync(skillFile, "utf8");
  checkFrontmatter(dir, text);

  if (/—/.test(text)) err(`${dir}: contains an em dash; rewrite the sentence`);
  if (/\bas an AI\b/i.test(text)) err(`${dir}: "as an AI"`);
  if (!/what'?s next/i.test(text)) warn(`${dir}: no "What's next" line`);

  // Every relative markdown link must resolve.
  for (const m of text.matchAll(/\]\((?!https?:|#)([^)]+)\)/g)) {
    const target = join(skillsDir, dir, m[1].split("#")[0]);
    if (!existsSync(target)) err(`${dir}: broken link -> ${m[1]}`);
  }

  // The README table is the catalogue a student reads to find a skill.
  if (!readmeText.includes(`\`${dir}\``)) warn(`${dir}: not listed in the README skill table`);
}

for (const doc of ["README.md", "CONTRIBUTING.md", "AGENTS.md", "install.sh"]) {
  if (!existsSync(join(root, doc))) err(`missing ${doc}`);
}

// The scripts under test run for real, in throwaway directories: the installer
// against a fake HOME, and this gate against fixture repos. Nothing on the
// machine is touched.
function runTestScript(name, label) {
  const file = join(root, "scripts", name);
  if (!existsSync(file)) {
    warn(`scripts/${name} is missing, so it was not run`);
    return;
  }
  const run = spawnSync("bash", [file], { encoding: "utf8" });
  const output = `${run.stdout ?? ""}${run.stderr ?? ""}`;
  const failures = output.split("\n").filter((line) => line.includes("FAIL"));
  if (run.status !== 0) {
    if (failures.length === 0) err(`scripts/${name} failed without naming a check`);
    for (const line of failures) err(`${label}: ${line.trim().replace(/^FAIL\s+/, "")}`);
  }
}

// The installer has to stay additive: an existing AGENTS.md keeps its content,
// and a skill already in the target folder is left where it is.
const gitAvailable = spawnSync("git", ["--version"], { encoding: "utf8" }).status === 0;
if (!gitAvailable) warn("git is not available, so the installer test was skipped");
else runTestScript("test-install.sh", "install");

// A validator that cannot prove it catches anything is worse than none: it gets
// trusted. These fixtures are the proof.
runTestScript("test-check-repo.sh", "validator");

// Em dashes are banned repo-wide (house style). scripts/ is exempt: it holds
// the detector itself.
const textExt = /\.(md|css|sh|mjs|js|jsx|json|html|txt|yml|yaml)$/;
for (const path of readdirSync(root, { recursive: true })) {
  const p = join(root, path);
  if (!statSync(p).isFile()) continue;
  const rel = path.toString();
  if (rel.startsWith("scripts/") || rel.startsWith(".git/")) continue;
  if (!textExt.test(rel)) continue;
  if (/—/.test(readFileSync(p, "utf8"))) err(`${rel}: contains an em dash; rewrite the sentence`);
}

for (const w of warnings) console.warn(`warn: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
console.log(
  `\n${skills.length} skills checked. ${errors.length} error(s), ${warnings.length} warning(s).`
);
process.exit(errors.length ? 1 : 0);

#!/usr/bin/env node
// Deterministic gate for the 442-skills repo. Run before every commit:
//   node scripts/check-repo.mjs
// Exit 0 = pass. Checks structure, not prose quality.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(root, "skills");
const errors = [];
const warnings = [];

const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return null;
  const fm = {};
  for (const line of text.slice(4, end).split("\n")) {
    const m = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].trim();
  }
  return fm;
}

const skills = readdirSync(skillsDir).filter((e) =>
  statSync(join(skillsDir, e)).isDirectory()
);

if (skills.length === 0) err("skills/ is empty");

for (const dir of skills) {
  const skillFile = join(skillsDir, dir, "SKILL.md");
  if (!existsSync(skillFile)) {
    err(`${dir}: missing SKILL.md`);
    continue;
  }
  const text = readFileSync(skillFile, "utf8");
  const fm = parseFrontmatter(text);

  if (!fm) err(`${dir}: SKILL.md has no frontmatter`);
  else {
    if (fm.name !== dir) err(`${dir}: frontmatter name "${fm.name}" != directory`);
    if (!fm.name?.startsWith("442-")) err(`${dir}: name must carry the 442- prefix`);
    if (!fm.description) err(`${dir}: missing description`);
    else {
      if (fm.description.length < 40) warn(`${dir}: description is thin (${fm.description.length} chars)`);
      if (fm.description.length > 700) err(`${dir}: description too long (${fm.description.length} chars) — it is always-loaded`);
      if (!/use when/i.test(fm.description)) warn(`${dir}: description has no "Use when" trigger branch`);
    }
  }

  if (/—/.test(text)) err(`${dir}: contains an em dash; rewrite the sentence`);
  if (/\bas an AI\b/i.test(text)) err(`${dir}: "as an AI"`);
  if (!/what'?s next/i.test(text)) warn(`${dir}: no "What's next" line`);

  // Every relative markdown link must resolve.
  for (const m of text.matchAll(/\]\((?!https?:|#)([^)]+)\)/g)) {
    const target = join(skillsDir, dir, m[1].split("#")[0]);
    if (!existsSync(target)) err(`${dir}: broken link -> ${m[1]}`);
  }
}

for (const doc of ["README.md", "CONTRIBUTING.md", "AGENTS.md", "install.sh"]) {
  if (!existsSync(join(root, doc))) err(`missing ${doc}`);
}

for (const file of ["README.md", "CONTRIBUTING.md", "AGENTS.md"]) {
  const p = join(root, file);
  if (existsSync(p) && /—/.test(readFileSync(p, "utf8")))
    err(`${file}: contains an em dash`);
}

for (const w of warnings) console.warn(`warn: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
console.log(
  `\n${skills.length} skills checked. ${errors.length} error(s), ${warnings.length} warning(s).`
);
process.exit(errors.length ? 1 : 0);

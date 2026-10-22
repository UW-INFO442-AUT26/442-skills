#!/usr/bin/env node
// Start a practice problem project from the class template.
//
//   node scaffold-problem.mjs <dir> --title "Boolean && rendering" [--slug <slug>]
//
// Copies assets/practice-problem/ into <dir>, sets the package name and the
// page title, and prints what to do next. Refuses to write into a folder that
// already holds something, so it can never overwrite a student's work.
//
// Every check runs before the first copy, so a bad argument leaves nothing
// half made.

import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, "..", "assets", "practice-problem");

const USAGE = `Start a practice problem project from the class template.

  node scaffold-problem.mjs <dir> --title "Boolean && rendering" [--slug <slug>]

  <dir>      the folder to create, for example practice/boolean-and-rendering
  --title    what the page says at the top. It becomes the browser tab title
  --slug     the folder and package name. Default: the last part of <dir>
`;

function fail(message) {
  process.stderr.write("scaffold-problem: " + message + "\n");
  process.exit(1);
}

const args = { dir: "", title: "", slug: "" };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === "--help" || arg === "-h") {
    process.stdout.write(USAGE);
    process.exit(0);
  }
  if (arg === "--title") {
    args.title = argv[++i] || "";
    continue;
  }
  if (arg === "--slug") {
    args.slug = argv[++i] || "";
    continue;
  }
  if (arg.startsWith("-")) fail("unknown option: " + arg + "\n\n" + USAGE);
  if (args.dir) fail("only one folder at a time\n\n" + USAGE);
  args.dir = arg;
}

if (!args.dir) fail("give me a folder\n\n" + USAGE);
if (!args.title.trim()) fail("--title is required, because the page shows it\n\n" + USAGE);

const target = resolve(args.dir);
const slug = (args.slug || basename(target)).trim().toLowerCase();
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  fail("slug must be lower case letters, digits and dashes: got " + JSON.stringify(slug));
}
if (!existsSync(TEMPLATE)) fail("the template is missing: " + TEMPLATE);
if (existsSync(target) && readdirSync(target).length > 0) {
  fail(target + " is not empty, so nothing was written");
}

cpSync(TEMPLATE, target, { recursive: true });

// The template ships a worked example. Only the two identifiers change here;
// the page body and the TODO comments are the topic's job.
const pkgPath = join(target, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.name = slug;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

const htmlPath = join(target, "index.html");
const escaped = args.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const html = readFileSync(htmlPath, "utf8").replace(/<title>[^<]*<\/title>/, "<title>" + escaped + " · INFO 442</title>");
writeFileSync(htmlPath, html);

process.stdout.write(
  [
    "Created " + target,
    "  name:  " + slug,
    "  title: " + args.title,
    "",
    "Next:",
    "  1. Rewrite src/App.jsx for the topic, keeping the page working at every save.",
    "  2. Rewrite README.md: what to fix, and what done looks like.",
    "  3. cd " + args.dir + " && npm i && npm run dev",
    "  4. npm run lint",
    "",
  ].join("\n")
);

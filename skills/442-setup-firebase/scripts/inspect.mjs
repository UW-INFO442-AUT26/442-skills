#!/usr/bin/env node
// Read-only project inspector for 442-setup-firebase.
//
//   node scripts/inspect.mjs [dir]
//
// Prints what Firebase setup can learn from the files alone: the framework,
// the package manager, the build output, the Firebase files already present,
// the environment-variable convention, and the git state. It writes nothing,
// installs nothing, and makes no network calls. The agent reads the whole
// output; a student can read it too.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.argv[2] ?? ".");
if (!existsSync(root) || !statSync(root).isDirectory()) {
  console.error(`inspect: no directory at ${root}`);
  process.exit(1);
}

const out = [];
const say = (key, value) => out.push(`${key}: ${value}`);

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
};

const listEnvFiles = () =>
  readdirSync(root)
    .filter((name) => name === ".env" || name.startsWith(".env."))
    .sort();

const walk = (dir, limit = 400) => {
  const found = [];
  const stack = [dir];
  while (stack.length && found.length < limit) {
    const here = stack.pop();
    let entries;
    try {
      entries = readdirSync(here, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const full = join(here, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else found.push(full);
    }
  }
  return found;
};

const git = (...args) => {
  const run = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  return run.status === 0 ? run.stdout.trim() : null;
};

// ---- package.json and the framework ---------------------------------

const pkg = readJson(join(root, "package.json"));
const deps = pkg ? { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) } : {};
const has = (...names) => names.some((name) => name in deps);

say("root", root);
say("package.json", pkg ? "yes" : "no");
if (pkg?.name) say("name", pkg.name);

const LOCKFILES = [
  ["package-lock.json", "npm"],
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
];
const lock = LOCKFILES.find(([file]) => existsSync(join(root, file)));
say(
  "package manager",
  pkg?.packageManager
    ? `${pkg.packageManager.split("@")[0]} (packageManager field)`
    : lock
      ? `${lock[1]} (${lock[0]})`
      : "unknown (no lockfile)",
);

// Order matters: the outer framework wins, and the flavour is the view layer.
const FRAMEWORKS = [
  ["next", "next", "out (static export; confirm in next.config)"],
  ["@remix-run/react", "remix", "build/client"],
  ["nuxt", "nuxt", ".output/public"],
  ["@sveltejs/kit", "sveltekit", "build"],
  ["astro", "astro", "dist"],
  ["react-scripts", "create react app", "build"],
  ["vite", "vite", "dist"],
  ["@angular/core", "angular", "dist"],
];
const flavour = has("react") ? "react" : has("vue") ? "vue" : has("svelte") ? "svelte" : null;
const framework = FRAMEWORKS.find(([dep]) => has(dep));
if (framework) {
  say("framework", framework[1] + (flavour ? ` + ${flavour}` : "") + ` (dependency: ${framework[0]})`);
} else if (pkg) {
  say("framework", "not recognized from dependencies; read package.json scripts yourself");
} else {
  say("framework", "no package.json, so probably a static site; check for an index.html at the root");
}

const EXPECTED_OUT = framework ? framework[2] : "unknown";
const outDir = EXPECTED_OUT.split(" ")[0];
say(
  "build output",
  outDir === "unknown"
    ? "unknown"
    : `${outDir} (${existsSync(join(root, outDir)) ? "exists" : "missing; build first"})`,
);

const scripts = pkg?.scripts ?? {};
const scriptList = ["build", "dev", "test", "lint"]
  .map((name) => `${name}=${scripts[name] ? JSON.stringify(scripts[name]) : "-"}`)
  .join(" ");
say("scripts", scriptList || "none");

// ---- Firebase, in the packages --------------------------------------

say("firebase sdk", deps.firebase ? `firebase@${deps.firebase}` : "not installed");
say("firebase-admin", deps["firebase-admin"] ? `firebase-admin@${deps["firebase-admin"]}` : "no");
say("router", has("react-router-dom", "react-router", "@reach/router") ? "react-router (client-side routing likely)" : has("next") ? "next routing" : "none found");

// ---- Firebase, in the files -----------------------------------------

const firebaseJsonPath = join(root, "firebase.json");
const firebaseJson = existsSync(firebaseJsonPath) ? readJson(firebaseJsonPath) : null;
say("firebase.json", existsSync(firebaseJsonPath) ? "yes" : "no");

const hostingBlocks = firebaseJson
  ? Array.isArray(firebaseJson.hosting)
    ? firebaseJson.hosting
    : firebaseJson.hosting
      ? [firebaseJson.hosting]
      : []
  : [];
for (const [i, block] of hostingBlocks.entries()) {
  const label = hostingBlocks.length > 1 ? `hosting[${i}]` : "hosting";
  const rewrites = Array.isArray(block.rewrites) ? block.rewrites.length : 0;
  say(`  ${label}`, `public=${JSON.stringify(block.public ?? "")}, rewrites=${rewrites} (single page)`);
}
if (firebaseJson?.firestore) say("  firestore", `rules=${JSON.stringify(firebaseJson.firestore.rules ?? "")}`);
if (firebaseJson?.database) say("  database", `rules=${JSON.stringify(firebaseJson.database.rules ?? "")}`);
if (firebaseJson?.storage) say("  storage", `rules=${JSON.stringify(firebaseJson.storage.rules ?? "")}`);
if (firebaseJson?.emulators) say("  emulators", Object.keys(firebaseJson.emulators).filter((k) => k !== "ui").join(", ") || "ui only");

const firebaserc = existsSync(join(root, ".firebaserc")) ? readJson(join(root, ".firebaserc")) : null;
say(
  ".firebaserc",
  firebaserc
    ? `project ${JSON.stringify(firebaserc.projects?.default ?? "unnamed")}`
    : "no (nothing points at a Firebase project yet)",
);

const ruleFiles = ["firestore.rules", "firestore.indexes.json", "database.rules.json", "storage.rules"];
say(
  "rule files",
  ruleFiles.map((file) => `${file} ${existsSync(join(root, file)) ? "yes" : "no"}`).join(", "),
);

const configured = [
  firebaseJson?.firestore || existsSync(join(root, "firestore.rules")) ? "firestore" : null,
  firebaseJson?.database || existsSync(join(root, "database.rules.json")) ? "database" : null,
  hostingBlocks.length ? "hosting" : null,
  deps.firebase ? "firebase sdk" : null,
].filter(Boolean);
say("configured from files", configured.length ? configured.join(", ") : "nothing yet");
say("unknown from files", "authentication and the providers are console settings; check them with the CLI or the student");

// ---- environment variables ------------------------------------------

const envFiles = listEnvFiles();
say("env files", envFiles.length ? envFiles.join(", ") : "none");
const gitignore = existsSync(join(root, ".gitignore")) ? readFileSync(join(root, ".gitignore"), "utf8") : null;
const envIgnored = gitignore
  ? gitignore
      .split("\n")
      .map((line) => line.trim())
      .some((line) => ["/.env", ".env", ".env*", "*.env", "**/.env"].includes(line))
  : false;
say(
  "  .env gitignored",
  envIgnored ? "yes" : gitignore ? "no (add it to .gitignore before you create it)" : "no .gitignore yet",
);
const sourceFiles = [...new Set(walk(root).filter((f) => /\.(jsx?|tsx?)$/.test(f)))].slice(0, 200);
const sourceText = sourceFiles.map((file) => {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}).join("\n");
const prefixes = ["import.meta.env.VITE_", "process.env.REACT_APP_", "process.env.NEXT_PUBLIC_"].filter((p) => sourceText.includes(p));
say("env prefix in source", prefixes.length ? prefixes.map((p) => p.split(".").pop()).join(", ") : "none found");

// ---- layout, tests, git ---------------------------------------------

const srcFiles = existsSync(join(root, "src")) ? walk(join(root, "src")).map((f) => f.slice(root.length + 1)) : [];
say("src", srcFiles.length ? `${srcFiles.length} files, entry candidates: ${srcFiles.filter((f) => /main|index|app/i.test(f)).slice(0, 4).join(", ")}` : "no src/ folder");
say("index.html at root", existsSync(join(root, "index.html")) ? "yes" : "no");

const testFiles = walk(root).filter((f) => /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f));
say("tests", `${testFiles.length} test files, npm test script ${scripts.test ? "yes" : "no"}`);

const branch = git(...["rev-parse", "--abbrev-ref", "HEAD"]);
const dirty = git(...["status", "--porcelain"]);
say("git", branch ? `branch ${branch}, ${dirty ? dirty.split("\n").length : 0} changed files` : "not a git repository");

console.log("442-setup-firebase inspector");
console.log(out.join("\n"));
console.log("Nothing was changed.");

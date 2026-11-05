#!/usr/bin/env node
// Reads a React project and reports what it already has for Leaflet.
// Read only: no network, no writes. Run it before you touch a file.
//
//   node <this-skill>/scripts/inspect.mjs [project-dir]
//
// Exit 0 when the folder exists, 1 when it does not.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, relative } from "node:path";

const root = resolve(process.argv[2] ?? ".");
if (!existsSync(root) || !statSync(root).isDirectory()) {
  console.error(`no such folder: ${root}`);
  process.exit(1);
}

const out = [];
const say = (label, value) => out.push(`${label}: ${value}`);
const read = (file) => {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
};
const pkgFile = join(root, "package.json");
const pkg = pkgFile && existsSync(pkgFile) ? JSON.parse(read(pkgFile)) : null;
const deps = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };
const installed = (name) => {
  const file = join(root, "node_modules", name, "package.json");
  return existsSync(file) ? JSON.parse(read(file)).version : null;
};
const major = (version) => (version ? Number(String(version).replace(/^[^0-9]*/, "").split(".")[0]) : null);

// Every source file, minus the noise a build or install leaves behind.
const SKIP = new Set(["node_modules", "dist", "build", ".git", ".vite", "coverage"]);
const sources = [];
const walk = (dir, depth = 0) => {
  if (depth > 6) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name) || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, depth + 1);
    else if (/\.(jsx?|tsx?|css)$/.test(entry.name)) sources.push(full);
  }
};
walk(root);
const rel = (file) => relative(root, file) || ".";

say("project", root);
say("package.json", pkg ? "yes" : "no");

if (pkg) {
  const vite = deps.vite ? "vite" : null;
  const cra = deps["react-scripts"] ? "create-react-app" : null;
  say("framework", [vite ?? cra ?? "unknown bundler", deps.react ? "react" : null].filter(Boolean).join(" + "));
  say("react", deps.react ?? "not installed");
  say("leaflet", deps.leaflet ? `${deps.leaflet} (installed ${installed("leaflet") ?? "no"})` : "not installed");
  say(
    "react-leaflet",
    deps["react-leaflet"] ? `${deps["react-leaflet"]} (installed ${installed("react-leaflet") ?? "no"})` : "not installed"
  );

  const reactMajor = major(installed("react") ?? deps.react);
  const rlMajor = major(installed("react-leaflet") ?? deps["react-leaflet"]);
  const leafletVersion = installed("leaflet") ?? deps.leaflet;
  const leafletMajor = major(leafletVersion);
  let fit = "ok";
  if (rlMajor === 5 && reactMajor !== null && reactMajor < 19) {
    fit = `mismatch: react-leaflet 5 needs react 19, this project has react ${reactMajor}`;
  }
  if (leafletMajor !== null && leafletMajor >= 2) {
    fit = `mismatch: leaflet ${leafletMajor} is the 2.0 beta, react-leaflet 5 needs leaflet 1.9`;
  }
  if (!deps["react-leaflet"] || !deps.leaflet) fit = "leaflet is not installed yet";
  say("version fit", fit);
  say("npm scripts", Object.keys(pkg.scripts ?? {}).join(", ") || "none");
}

const cssImports = sources.filter((file) => /leaflet\/(dist\/leaflet|styles)\.css/.test(read(file)));
say("leaflet css", cssImports.length ? `imported in ${cssImports.map(rel).join(", ")}` : "not imported");
if (cssImports.some((file) => /leaflet\/styles\.css/.test(read(file)))) {
  say("css path", "leaflet/styles.css is the 2.0 beta path, use leaflet/dist/leaflet.css");
}

const html = ["index.html", "public/index.html"].map((p) => join(root, p)).find((p) => existsSync(p));
say("html entry", html ? rel(html) : "none found");
const htmlText = html ? read(html) : "";
say("unpkg css link", /unpkg\.com\/leaflet/.test(htmlText) ? "yes, remove it and import the package css instead" : "no");

const mapFiles = sources.filter((file) => /<MapContainer[\s>]/.test(read(file)));
say("map container", mapFiles.length ? `MapContainer in ${mapFiles.map(rel).join(", ")}` : "no MapContainer yet");

const mapText = mapFiles.map(read).join("\n");
const tileUrl = mapText.match(/url=["'{`]([^"'`]*)/);
if (tileUrl) {
  say("tile url", tileUrl[1]);
  say("tile subdomains", /\{s\}/.test(tileUrl[1]) ? "yes, the {s} form is deprecated by the tile policy" : "no");
  say("tile over http", /^http:/.test(tileUrl[1]) ? "yes, use https" : "no");
} else if (mapFiles.length) {
  say("tile url", "no TileLayer url found, the map will be blank");
}
if (mapFiles.length) {
  say("attribution", /attribution/.test(mapText) ? "yes" : "no, the tile policy requires it");
  const height = /height:\s*['"]?[\w.%]/.test(mapText) ? "set on the container" : "no height found, the map will be 0px tall";
  say("container height", height);
  say("icon fix", /Icon\.Default/.test(mapText) ? "Icon.Default patched" : "no, markers will be invisible after a build");
}

say("source files", `${sources.length} scanned`);
out.push("Nothing was changed.");
console.log(out.join("\n"));

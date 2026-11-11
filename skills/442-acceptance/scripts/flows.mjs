#!/usr/bin/env node
// Reads the flow map from an acceptance run and reports where it stands.
//
//   node <this-skill>/scripts/flows.mjs                    # ./acceptance/flows.md
//   node <this-skill>/scripts/flows.mjs --dir path/to/acceptance
//   node <this-skill>/scripts/flows.mjs --json
//
// Exit 0 when the map is consistent, 1 when it is not, 2 on a usage error.
// It only reads. The map is the source of truth, never this file.
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const STATUSES = new Set([
  "pass",
  "bug",
  "unexpected",
  "blocked",
  "fixed",
  "approved",
]);
const NEEDS_EVIDENCE = new Set(["pass", "bug", "unexpected", "fixed", "approved"]);
const NEEDS_DETAIL = new Set(["bug", "unexpected", "blocked"]);
const ORDER = ["pass", "bug", "unexpected", "blocked", "fixed", "approved"];

const args = process.argv.slice(2);
let dir = "acceptance";
let asJson = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--dir" && args[i + 1]) dir = args[++i];
  else if (args[i] === "--json") asJson = true;
  else {
    console.error(`unknown argument: ${args[i]}`);
    process.exit(2);
  }
}

const root = resolve(dir);
const mapFile = join(root, "flows.md");
if (!existsSync(mapFile)) {
  console.error(`no flow map at ${mapFile}. Create it before running the check.`);
  process.exit(2);
}

const text = readFileSync(mapFile, "utf8");
const lines = text.split("\n");
const errors = [];
const warnings = [];

// The map is the first table whose header names an ID and a Status column.
function cells(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

const headerIndex = lines.findIndex((line) => {
  if (!line.trim().startsWith("|")) return false;
  const names = cells(line).map((c) => c.toLowerCase());
  return names.includes("id") && names.includes("status");
});
if (headerIndex === -1) {
  console.error("flows.md has no table with ID and Status columns");
  process.exit(2);
}

const header = cells(lines[headerIndex]).map((c) => c.toLowerCase());
const column = (name) => header.indexOf(name);
const idAt = column("id");
const statusAt = column("status");
const evidenceAt = column("evidence");
const flowAt = column("flow");
const expectAt = column("expect");

const flows = [];
const seen = new Set();
for (let i = headerIndex + 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim().startsWith("|")) break;
  const row = cells(line);
  if (row.every((cell) => /^:?-{2,}:?$/.test(cell) || cell === "")) continue;
  const id = row[idAt] ?? "";
  const status = (row[statusAt] ?? "").toLowerCase();
  const evidence = evidenceAt === -1 ? "" : (row[evidenceAt] ?? "");
  if (!id) {
    errors.push(`row ${i + 1} has no ID`);
    continue;
  }
  const slug = /^[A-Z][0-9]+$/.test(id);
  if (!slug) errors.push(`${id}: an ID is one capital letter and digits, like F07`);
  if (seen.has(id)) errors.push(`${id}: appears twice; one flow is one row`);
  seen.add(id);
  if (!STATUSES.has(status)) {
    errors.push(`${id}: status "${status || "(empty)"}" is not one of ${[...STATUSES].join(", ")}`);
  }
  if (evidence && evidence !== "-") {
    const target = join(root, evidence);
    if (!existsSync(target)) errors.push(`${id}: evidence ${evidence} does not exist`);
    else if (statSync(target).isDirectory() && !readdir(target).length) {
      errors.push(`${id}: evidence folder ${evidence} is empty`);
    }
  } else if (NEEDS_EVIDENCE.has(status)) {
    errors.push(`${id}: status ${status} needs a recording in the Evidence column`);
  }
  if (NEEDS_DETAIL.has(status)) {
    const heading = new RegExp(`^#{2,4}\\s+${id}[\\s:]`, "m");
    if (!heading.test(text)) {
      warnings.push(`${id}: status ${status} has no detail section explaining it`);
    }
  }
  flows.push({
    id,
    flow: flowAt === -1 ? "" : (row[flowAt] ?? ""),
    expect: expectAt === -1 ? "" : (row[expectAt] ?? ""),
    status,
    evidence,
  });
}

function readdir(path) {
  try {
    return readdirSync(path);
  } catch {
    return [];
  }
}

if (flows.length === 0) errors.push("the table has no flow rows");

const counts = Object.fromEntries(ORDER.map((s) => [s, 0]));
for (const flow of flows) if (flow.status in counts) counts[flow.status] += 1;
const open = flows.filter((f) => f.status === "bug" || f.status === "unexpected");
const blocked = flows.filter((f) => f.status === "blocked");
const awaiting = flows.filter((f) => f.status === "fixed");

if (asJson) {
  console.log(JSON.stringify({ map: mapFile, count: flows.length, counts, flows, open, blocked, awaiting }, null, 2));
  process.exit(errors.length ? 1 : 0);
}

const line = (flow, width) =>
  `  ${flow.id.padEnd(5)} ${flow.flow.slice(0, 34).padEnd(34)} ${flow.status.padEnd(10)} ${flow.evidence}`;

console.log(`${mapFile}`);
console.log(
  `${flows.length} flows: ` +
    ORDER.filter((s) => counts[s]).map((s) => `${counts[s]} ${s}`).join(", ")
);
if (open.length) {
  console.log(`\nOpen (${open.length}), pick the ones to fix:`);
  for (const flow of open) console.log(line(flow));
}
if (awaiting.length) {
  console.log(`\nFixed and waiting on your review (${awaiting.length}):`);
  for (const flow of awaiting) console.log(line(flow));
}
if (blocked.length) {
  console.log(`\nCould not test (${blocked.length}):`);
  for (const flow of blocked) console.log(line(flow));
}
if (open.length + blocked.length + awaiting.length === 0) {
  console.log("\nEvery flow might be clean. Open a few recordings before believing it.");
}

for (const warning of warnings) console.warn(`warn: ${warning}`);
for (const error of errors) console.error(`error: ${error}`);
process.exit(errors.length ? 1 : 0);

#!/usr/bin/env node
// Prints the current documentation as plain text, so you read the page
// instead of a search result about it.
//
//   node <this-skill>/scripts/docs.mjs ref <anchor>          one Leaflet 1.9.4 section
//   node <this-skill>/scripts/docs.mjs ref --list <word>     anchors whose name contains <word>
//   node <this-skill>/scripts/docs.mjs page <slug>           one React-Leaflet page
//   node <this-skill>/scripts/docs.mjs page --list           the page slugs that exist
//
// The reference URL is pinned to 1.9.4 on purpose. leafletjs.com now serves
// the 2.0 beta at reference.html, and its API does not match React-Leaflet 5.
// Needs network. Writes nothing.
const REFERENCE = "https://leafletjs.com/reference-1.9.4.html";
const REACT_LEAFLET = "https://react-leaflet.js.org/docs/";

const PAGES = [
  "start-installation",
  "start-setup",
  "api-map",
  "api-components",
  "start-introduction",
  "core-api",
  "example-popup-marker",
  "example-events",
  "example-vector-layers",
  "example-external-state",
  "example-view-bounds",
  "example-layers-control",
  "example-draggable-marker",
  "example-tooltips",
  "example-other-layers",
];

const strip = (html) =>
  html
    .replace(/<(script|style|svg|nav|footer)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|pre)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&copy;/g, "(c)")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

async function get(url) {
  const response = await fetch(url, { headers: { "user-agent": "442-leaflet-skill" } });
  if (!response.ok) throw new Error(`${response.status} from ${url}`);
  return response.text();
}

const [, , mode, arg] = process.argv;
const usage = `usage:
  node docs.mjs ref <anchor>        a Leaflet 1.9.4 reference section
  node docs.mjs ref --list <word>   anchors matching <word>
  node docs.mjs page <slug>         a React-Leaflet docs page
  node docs.mjs page --list         the page slugs`;

try {
  if (mode === "ref") {
    const html = await get(REFERENCE);
    const anchors = [...html.matchAll(/<h([23])\s+id='([^']+)'/g)].map((m) => ({
      level: m[1],
      id: m[2],
      index: m.index,
    }));
    if (arg === "--list" || !arg) {
      const word = process.argv[4] ?? "";
      const hits = anchors.filter((a) => a.id.includes(word)).map((a) => a.id);
      console.log(hits.length ? hits.join("\n") : `no anchor contains "${word}"`);
    } else {
      const at = anchors.findIndex((a) => a.id === arg);
      if (at === -1) {
        console.error(`no section "${arg}". Try: node docs.mjs ref --list ${arg}`);
        process.exit(1);
      }
      const start = anchors[at];
      const next = anchors.slice(at + 1).find((a) => Number(a.level) <= Number(start.level));
      const end = next ? next.index : html.length;
      console.log(`# ${REFERENCE}#${arg}\n`);
      console.log(strip(html.slice(start.index, end)));
    }
  } else if (mode === "page") {
    if (arg === "--list" || !arg) {
      console.log(PAGES.join("\n"));
    } else {
      const slug = arg.replace(/^\/|\/$/g, "");
      console.log(`# ${REACT_LEAFLET}${slug}/\n`);
      console.log(strip(await get(`${REACT_LEAFLET}${slug}/`)));
    }
  } else {
    console.log(usage);
    process.exit(1);
  }
} catch (error) {
  console.error(`${error.message}\nThe page did not load. Say so instead of writing from memory.`);
  process.exit(1);
}

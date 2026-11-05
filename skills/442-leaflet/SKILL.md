---
name: 442-leaflet
description: "How the class writes, reads, and debugs Leaflet and React-Leaflet code: which versions a project is on, the exact doc URLs to check before writing, the small set of patterns that cover most maps, and how to prove a map works in a browser. Use when writing, reviewing, or debugging map code, when a map is blank, grey, or missing markers, or when auditing AI-written Leaflet code."
---

# Leaflet, kept small

Map code fails in boring ways, and almost every one of them comes from
reading the wrong version of the documentation or assuming a prop
updates. This skill is the short version: which docs to trust, how the
two libraries divide the work, the patterns that cover most maps, and
what counts as proof.

Setting up a map from nothing is a different job. Call
`442-setup-leaflet` for that.

## 1. Know which Leaflet you are on

Two versions are live, and the site now leads with the wrong one.

| Version | Status | In this class |
|---|---|---|
| Leaflet 1.9.4 | stable | yes, with `react-leaflet` 5 |
| Leaflet 2.0.0-beta.1 | prerelease | no, React-Leaflet does not support it |

`leafletjs.com/reference.html` is the beta. `react-leaflet.js.org` is
version 5, which wraps Leaflet 1.9. So the reference you read is
`https://leafletjs.com/reference-1.9.4.html`, always.

Neither site publishes an `llms.txt`, so there is no index to fetch. The
URLs are in [references/docs.md](references/docs.md), and
`node <this-skill>/scripts/docs.mjs` reads them for you.

**Done when** you have read `leaflet` and `react-leaflet` out of
`package.json` and can say which pair the project is on.

## 2. Read the doc for the one thing you are about to use

Before writing a component or a prop you have not used in this project:

1. List the Leaflet components and options the change needs.
2. Fetch each one:
   `node <this-skill>/scripts/docs.mjs ref marker-option` or
   `node <this-skill>/scripts/docs.mjs page api-components`.
3. Only then write the code.

This is the same instruction the week 6 slides give to students about
their own agents. It is worth following for the same reason: the API is
large, and a plausible-looking prop that does not exist fails silently.

When a fetch fails, say which URL failed and write from memory with that
said out loud. Do not present remembered API as verified.

**Done when** every non-trivial prop in your change traces to a section
you actually read, and you can name the section.

## 3. Keep the two libraries' jobs apart

React renders the container. Leaflet draws inside it. That split explains
every surprising behavior:

- React never renders a tile or a marker as an element. Leaflet does.
- Props are Leaflet options at mount. They are read once unless the
  component's docs list that prop as mutable.
- The map object is reached with `useMap()`, events with
  `useMapEvents()`. Anything imperative goes through those two.
- `MapContainer` props are immutable. Changing `center` later moves
  nothing; a child calls `map.setView`.

**Done when** your change passes props through React and reaches for
`useMap` only for actions, never to create the map.

## 4. Use the patterns that exist

[references/patterns.md](references/patterns.md) holds eight verified
snippets: a map, data as markers, shapes with `pathOptions`, events, move
the map from state, fit to bounds, a conditional layer, and a popup with
JSX. Most map work is two of those.

A new pattern is worth writing only when the docs show one you cannot
reach from these. When you add one, run it before you trust it.

**Done when** the code is one of the patterns, or you can say which doc
section the new one came from.

## 5. Review map code, including your own

The full list is in [references/debug.md](references/debug.md). The four
that catch the most:

- `eventHandlers` on `MapContainer` is ignored. It belongs on a child, or
  in `useMapEvents`.
- A tile URL with `{s}.` in it, or `http://`, is out of date.
- A container with no height renders nothing.
- A marker with no icon fix disappears after `npm run build`, with no
  error.

Generated map code passes a build and still fails all four. That is why
the next step exists.

**Done when** every line of the diff has been checked against that list,
and the ones that do not apply have been ruled out on purpose.

## 6. Debug by looking, not by rewriting

Order: console, then DOM, then network, then the doc for the one prop
that is not working. [references/debug.md](references/debug.md) maps each
symptom to its cause.

The single most useful measurement: the height of `.leaflet-container`,
and whether the `img.leaflet-tile` children have `naturalWidth > 0`. That
splits "broken" into rendering, sizing, or network in one look.

**Done when** you can name the cause before you change a line.

## 7. Prove it in a browser

[references/browser-check.md](references/browser-check.md) has the exact
checks and the snippet. Report the numbers: container height, tiles
loaded, markers loaded, and the console errors that are not cancelled
tiles.

Check the dev server and the built page. The marker image is the one
thing that works in dev and breaks in a build, so dev alone is not proof.

**Done when** you have the numbers from both, and a screenshot of the map.

## What's next

Open the map on a phone-sized window and try to use it with one thumb.
Anything you cannot reach is a real bug for a real user.

---
name: 442-setup-leaflet
description: "Adds an interactive map to an existing React project with Leaflet and React-Leaflet: picks versions that work together, writes the map component, fixes the marker icons that break on a production build, proves it renders in a browser, and commits. Use when a student wants a map, pins, markers, map tiles, or a location picker, or asks to install Leaflet or React-Leaflet."
---

# Set up Leaflet

Takes a React project with no map to a map on screen and committed. The
agent writes the code. The student picks the page and approves the
commit.

Leaflet needs little. Most of this skill is four decisions: which
versions, which file, which tiles, and what counts as proof.

## Rules that hold on every step

1. **Ask in the chat.** One question, with numbered options, in a normal
   reply. Collect the whole set instead of interrupting for each answer.
2. **The versions are not free.** `leaflet` 1.9.4 and `react-leaflet` 5,
   on React 19. Leaflet 2.0 is in beta and React-Leaflet does not support
   it yet, so it is not an option here.
3. **Evidence, not compiling code.** The map works when a browser shows
   tiles and a visible marker. A file that builds proves nothing.
4. **The student owns the commit.** Show the diff and the message before
   you run `git commit`.

## 1. Inspect the project

Run the inspector from this skill's folder and read all of its output:

```sh
node <this-skill>/scripts/inspect.mjs .
```

`<this-skill>` is where this skill lives: `~/.agents/skills/442-setup-leaflet`
for a global install, `~/.claude/skills/442-setup-leaflet` for Claude Code,
or `.omp/skills/442-setup-leaflet` in a project install. It reads files
only: no network, no writes.

It reports the React version, the Leaflet packages, where the CSS is
imported, where a map component already lives, the tile URL, and whether
the marker icon fix is in place.

**Done when** you can say which React major the project runs and whether
it already has a map. If it already has one, repair that map instead of
adding a second.

## 2. Ask where the map goes

One question, with the project's real files as the options:

> 1. `src/App.jsx`, the page everyone lands on.
> 2. Its own file, `src/Map.jsx`, so it can move later.
> 3. A page you already have at `/places`.

Name your pick and why in one line. A map that is the point of the page
belongs in `App.jsx`; a map that is one part of a bigger page gets its
own file.

**Done when** you know the file, and whether the map is the whole page or
one part of it.

## 3. Install the two packages

```sh
npm install leaflet@1.9.4 react-leaflet@5
```

`react-leaflet` 5 needs React 19, which the class template ships. On
React 18 the install succeeds and the app fails at runtime: use
`react-leaflet@4` and say why.

**Done when** `package.json` lists both, `npm ls leaflet react-leaflet`
exits 0, and the inspector's `version fit` line reads `ok`.

## 4. Import the stylesheet once

In `src/main.jsx`, above the app import:

```js
import 'leaflet/dist/leaflet.css'
```

One import, one place. If you find a `<link>` to `unpkg.com/leaflet` in
`index.html` or `public/index.html`, delete it: that is the old Create
React App instruction, it pins a second copy of the version, and a Vite
project has no `public/index.html` at all.

**Done when** the inspector reports the CSS imported in one file and no
unpkg link.

## 5. Write the map

Copy the component from [references/map-code.md](references/map-code.md)
and change three things: the center, the zoom, and the markers. Keep the
rest, including the icon fix, which the reference explains.

The four parts to understand: `MapContainer` holds the map, `TileLayer`
fetches the background images, `Marker` with `Popup` puts something
clickable on it, and the `style` height is what makes any of it visible.

**Done when** the inspector reports a `MapContainer`, a tile URL on
`tile.openstreetmap.org`, `attribution: yes`, a container height, and
`Icon.Default patched`.

## 6. Prove it in a browser

Start the dev server, open the page, and check three things:

- at least one `img.leaflet-tile` with `naturalWidth > 0`
- one `img.leaflet-marker-icon` with `naturalWidth > 0`
- an empty console error list

Then run `npm run build` and check the marker again on the built page.
The marker image is the one thing that works in dev and breaks in a
build, so the dev check alone is not proof. The exact commands are in
[the browser check](../442-leaflet/references/browser-check.md).

**Done when** you have shown tiles, a marker, and a clean console on both
the dev server and the built page, and said the numbers.

## 7. Commit

One commit, with the trailer the class rules require:

```sh
git add -A
git commit -m "Add Leaflet map to <page>

Co-authored-by: <their name> <their email>"
```

Read the name and email from `git config user.name` and
`git config user.email`, or from `gh api user`. Ask if either is missing.
Leave the blank line before the trailer.

**Done when** `git log -1` shows the commit with the `Co-authored-by:`
trailer, and the student has seen both.

## When it breaks

Read [references/troubleshoot.md](references/troubleshoot.md). It maps
each symptom to its cause: a blank page, a grey box, tiles that never
load, a marker that is not there, a map with no height.

## What's next

Add a marker for something real in your app, click it, and read the
popup. That loop is the rest of the map work.

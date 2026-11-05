# Where the real documentation is

Neither site publishes an `llms.txt`. Checked on 2026-11-04: `/llms.txt`,
`/llms-full.txt`, and `/.well-known/llms.txt` all return 404 on
`leafletjs.com` and `react-leaflet.js.org`. So there is no machine index to
read. Use the URLs below, and fetch them with
`node <this-skill>/scripts/docs.mjs` instead of writing from memory.

## The version trap

Two Leaflet versions are live at once:

| URL | What it documents | Usable here? |
|---|---|---|
| `https://leafletjs.com/reference.html` | **Leaflet 2.0.0-beta.1**, a prerelease | No |
| `https://leafletjs.com/reference-1.9.4.html` | Leaflet 1.9.4, the stable release | Yes |
| `https://leafletjs.com/examples/quick-start/` | the 2.0 beta quick start | No |

The site defaults to the beta now. Its API differs in ways that break
React-Leaflet:

- `L.map()` is `new LeafletMap()`, and `L.tileLayer()` is `new TileLayer()`
- the stylesheet is `leaflet/styles.css`, not `leaflet/dist/leaflet.css`
- the quick start uses an import map and ES modules from a CDN

`react-leaflet` 5 declares `leaflet: ^1.9.0` as its peer dependency, so it
does not support the beta at all. Every Leaflet URL you read has to be the
1.9.4 one, and every example has to use `L.` factories or React-Leaflet
components.

## The pages worth fetching

| Question | URL |
|---|---|
| What options does a marker take? | `https://leafletjs.com/reference-1.9.4.html#marker-option` |
| How do tiles work, and what is `{z}`? | `https://leafletjs.com/reference-1.9.4.html#tilelayer` |
| What can I pass to `MapContainer`? | `https://react-leaflet.js.org/docs/api-map/` |
| Which props are mutable on each component? | `https://react-leaflet.js.org/docs/api-components/` |
| Why do props not update? | `https://react-leaflet.js.org/docs/start-introduction/` |
| How do I get the map object? | `https://react-leaflet.js.org/docs/api-map/` (hooks section) |
| A working example of a feature | `https://react-leaflet.js.org/docs/example-<name>/` |
| Event handling | `https://react-leaflet.js.org/docs/example-events/` |
| Panning to new coordinates | `https://react-leaflet.js.org/docs/example-external-state/` |
| Fitting the map to a set of points | `https://react-leaflet.js.org/docs/example-view-bounds/` |
| Tile server rules | `https://operations.osmfoundation.org/policies/tiles/` |

React-Leaflet example slugs: `popup-marker`, `events`, `vector-layers`,
`external-state`, `view-bounds`, `layers-control`, `draggable-marker`,
`tooltips`, `other-layers`, `panes`, `animated-panning`, `svg-overlay`,
`react-control`, `map-placeholder`.

## The script

```sh
node <this-skill>/scripts/docs.mjs ref --list marker     # anchors containing "marker"
node <this-skill>/scripts/docs.mjs ref marker-option     # that section, as text
node <this-skill>/scripts/docs.mjs page --list           # React-Leaflet page slugs
node <this-skill>/scripts/docs.mjs page api-components   # that page, as text
```

`ref` always reads `reference-1.9.4.html`, so it cannot hand you the beta
by accident. When the script exits non-zero, the page did not load: say
so, and say which URL failed, rather than writing code from memory.

## Two things the docs get wrong, or leave out

**The tile URL.** Every React-Leaflet example still shows
`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`. The tile policy now
says to use exactly `https://tile.openstreetmap.org/{z}/{x}/{y}.png`,
because "other subdomains or hostnames may be slower or withdrawn without
notice". Use the form without `{s}`.

**The marker images.** The docs assume a bundler that keeps Leaflet's
`images/` folder intact. Vite inlines those images into the CSS, Leaflet's
runtime path lookup then fails, and the marker vanishes with no error.
The fix is in `442-setup-leaflet/references/map-code.md`.

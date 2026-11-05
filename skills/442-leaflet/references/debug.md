# Debugging a map

A map fails in a small number of ways, and each one has a visible cause.
Work in this order and stop at the first thing that is wrong.

## 1. Read the console

A React error names the file and the line. Fix that before looking at the
map. Three errors cover most of them:

- `useMap() may be used only in the context of a <MapContainer>`: the
  component is outside the map. Move it inside.
- `Map container is already initialized`: two maps are sharing one node,
  or hot reload kept the old one. Reload the page; if it persists, give
  each map its own container.
- `Cannot find module 'leaflet/dist/leaflet.css'`: the package is missing
  or the import path is the 2.0 beta one.

## 2. Look at the DOM, not the code

In the browser, inspect the map's container and answer three questions:

1. Does `.leaflet-container` exist? If not, the component never rendered.
2. What is its height? `0px` means the map is there and invisible.
3. Are there `img.leaflet-tile` children, and do they have
   `naturalWidth > 0`? Zero means the images failed to load, not that the
   component is wrong.

These three answers separate every "the map is broken" report into a
rendering problem, a sizing problem, or a network problem.

## 3. Check the network

A tile request that returns 403 or 429 is the tile server refusing this
client. A tile request that returns 404 is a wrong URL template. A tile
request that never happens means the `url` prop is missing or empty.

## 4. Then read the doc for the one prop that is not working

Use `node <this-skill>/scripts/docs.mjs page api-components` and look the
component up in the mutable-props table. Most "my prop does nothing"
reports end there: the prop is read once at mount and the code expects it
to update.

## Smells when reading map code

These are the patterns that turn up in generated code. Each one is a real
defect, not a style preference.

| In the code | What it means |
|---|---|
| `eventHandlers` on `MapContainer` | Silently ignored. Move it into a `useMapEvents` child |
| `center` or `zoom` passed as state to `MapContainer` | Read once. The map will not follow the state |
| `L.map('map')` next to a `MapContainer` | Two map instances fighting over the DOM |
| A `<div id="map">` | The container `MapContainer` creates is the map. This div does nothing |
| `url="http://..."` for tiles | The tile policy requires https |
| `url="https://{s}.tile..."` | The `{s}` subdomains are withdrawn without notice. Drop the `{s}.` |
| No `attribution` | Required by the tile policy |
| `fillColor: '#blue'` | Not a color. The shape silently uses the default |
| No height on the container | A map nobody can see |
| `import 'leaflet/dist/leaflet.css'` inside a component | Works, but it belongs once in `main.jsx` |
| `key={index}` on markers | Wrong marker reused when the list reorders |
| A `setInterval` that calls `map.setView` | The map fights the user's panning |
| `useRef` holding the map, filled by `ref` on `MapContainer` | Works, but `useMap()` is the supported way in |

## Symptom to cause

| Symptom | Cause | Fix |
|---|---|---|
| Blank area, no error | No height on the container | `style={{ height: '400px' }}` |
| Grey box, zoom control visible | Tiles not loaded | Network tab, then the `url` prop |
| Map shows the ocean | Latitude and longitude swapped | `[lat, lng]`, Seattle is `47.6, -122.3` |
| Map is half cut off in the corner | Created while hidden, for example in a closed tab | Create it when visible, or `map.invalidateSize()` |
| Marker missing, no error | Icon path lookup failed in a build | The icon fix in `442-setup-leaflet/references/map-code.md` |
| Marker appears twice | Two `Marker` elements, or a list without stable keys | One marker per record, key by id |
| Popup opens empty | The `Popup` is a sibling of `Marker`, not a child | Nest it inside |
| Map re-centers on every render | `setView` in an effect with a dependency that changes every render | Depend on the value, not on an object literal |
| Zoom snaps back after a click | `setView` in a `click` handler on the map | Read `map.getZoom()` and pass it back |

## What to say when it is not your code

If the cause is the tile server, the network, or a browser extension,
say that plainly and show the evidence: the status code, the failing URL,
the console line. Do not rewrite working code to hide someone else's
outage.

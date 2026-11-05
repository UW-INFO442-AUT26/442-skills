# When the map does not show up

Find the symptom, apply the fix, then re-run
`node <this-skill>/scripts/inspect.mjs .` and the browser check. Do not
change two things at once.

| Symptom | Cause | Fix |
|---|---|---|
| The page is blank, nothing at all | The component is not rendered, or it threw | Open the browser console. A React error names the file and line |
| A grey box where the map should be | The container has no height | `style={{ height: '400px' }}` on `MapContainer`, or a CSS rule for `.leaflet-container` |
| A grey box with a working zoom control | Tiles never loaded | Check the network tab for 403 or 429 from the tile host, and that the `url` prop is set |
| The map is there but shows the ocean | `center` is wrong, or latitude and longitude are swapped | `center` is `[latitude, longitude]`. Seattle is `47.6, -122.3` |
| Everything is in the top left corner, half cut off | The map was created while its container was hidden, for example inside a closed tab or a modal | Create it after the container is visible, or call `map.invalidateSize()` once it is |
| The marker does not appear, no console error | Leaflet's image path lookup failed. Normal after `npm run build` | The three icon imports and `L.Icon.Default.imagePath = ''` in [map-code.md](map-code.md) |
| The marker image is a broken icon | Same cause, dev server | Same fix. A relative `src` like `/marker-icon-2x.png` in the DOM is the tell |
| `TypeError: Cannot read properties of undefined (reading 'appendChild')` | A React-Leaflet component sits outside `MapContainer` | Move it inside |
| `useMap() may be used only in the context of a <MapContainer>` | Same cause | Move the component inside `MapContainer` |
| `Cannot find module 'leaflet/dist/leaflet.css'` | The package is not installed, or the path is the 2.0 beta path | `npm install leaflet@1.9.4`, then `import 'leaflet/dist/leaflet.css'` |
| The map renders twice, or flickers in dev | React Strict Mode mounts twice on purpose | Leave it. It is a dev-only check, not a bug |
| `Uncaught Error: Map container is already initialized` | Two maps share one DOM node, or hot reload reused one | Give each `MapContainer` its own container, and reload after adding one |
| Tiles load in dev, and the built site shows a blank map | The tile request is blocked by the deploy host, or the URL is relative | Open the built page, check the network tab, keep the tile URL absolute |
| The map works, but the pins are gone after a deploy | The icon fix is missing | Same fix as above. This is the most common one |

## Two errors worth reading twice

**A 403 or 429 from `tile.openstreetmap.org`** is the tile server refusing
this client, not your code. It happens with heavy reloading or many
students behind one campus address. Wait, then reload. For a class demo
it is not a reason to switch providers.

**`react-leaflet` 5 on React 18** fails at runtime, not at install, with
a React internal error rather than a message about versions. The
inspector's `version fit` line is the fastest way to see it. Install
`react-leaflet@4` and keep the rest of the code the same.

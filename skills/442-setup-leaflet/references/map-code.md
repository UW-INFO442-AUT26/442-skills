# The map component

Verified against `leaflet` 1.9.4 and `react-leaflet` 5.0.0 on React 19.3.1,
in a Vite project, in dev and in a production build.

## The whole file

`src/Map.jsx`:

```jsx
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

// Leaflet looks for its marker images at a path it works out at runtime. A
// production build rewrites that path and the lookup fails, so the marker
// silently disappears. Point it at the files the bundler emitted instead.
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })
L.Icon.Default.imagePath = ''

const UW = [47.655548, -122.3032]

export default function Map() {
  return (
    <MapContainer center={UW} zoom={15} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={UW}>
        <Popup>UW Seattle</Popup>
      </Marker>
    </MapContainer>
  )
}
```

Then `src/App.jsx` renders `<Map />`, and `src/main.jsx` imports
`leaflet/dist/leaflet.css`.

## Why each part is there

| Part | What it does | What breaks without it |
|---|---|---|
| `MapContainer` | Creates the Leaflet map and gives every child access to it | Nothing renders |
| `center` and `zoom` | Where the map starts and how close | Required; the map throws |
| `style={{ height }}` | Gives the container a height | A grey or empty box, zero pixels tall |
| `TileLayer` | Fetches the square images that form the map | A blank background with a marker on it |
| `url` | The tile template. `{z}` is zoom, `{x}` and `{y}` are the tile grid | No tiles |
| `attribution` | The credit line. The tile policy requires it | You are using their servers without credit |
| `Marker` | One pin at a latitude and longitude | Nothing to click |
| `Popup` | The card that opens when the marker is clicked | A pin that does nothing |
| The three icon imports | Real URLs for the pin images | Invisible pin after `npm run build` |
| `imagePath = ''` | Stops Leaflet guessing a folder and prefixing it | Doubled path, invisible pin in dev |

## Markers from your own data

Props are plain values, so the usual React mapping works:

```jsx
const spots = [
  { id: 1, name: 'Suzzallo Library', position: [47.6555, -122.3086] },
  { id: 2, name: 'Husky Stadium', position: [47.6504, -122.3015] },
]

<MapContainer center={UW} zoom={14} style={{ height: '400px' }}>
  <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
  {spots.map((spot) => (
    <Marker key={spot.id} position={spot.position}>
      <Popup>{spot.name}</Popup>
    </Marker>
  ))}
</MapContainer>
```

Use a stable `key`, never the array index.

## Moving the map after it starts

`center` and `zoom` are read once. Changing them later does nothing, by
design: every `MapContainer` prop is immutable after the first render.

To move the map, a child asks for the map object and calls a method on it:

```jsx
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

function Recenter({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}
```

Render `<Recenter center={selected} />` inside `MapContainer`. Verified:
the map center moves from `47.655548, -122.3032` to `47.6097, -122.3422`
when the prop changes.

## Shapes instead of pins

`Circle`, `CircleMarker`, `Polyline`, `Polygon`, and `Rectangle` take
`positions` or `center` plus `radius`. Style them through `pathOptions`,
not as loose props:

```jsx
<Circle center={UW} radius={200} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }} />
```

`pathOptions` is the mutable one: change the object and the shape updates.

## Events

`eventHandlers` works on child components. On `MapContainer` it is
silently ignored, because `MapContainer` passes its props to the Leaflet
map constructor and nothing reads that key. Use a child:

```jsx
import { useMapEvents } from 'react-leaflet'

function ClickHandler() {
  useMapEvents({
    click: (event) => console.log('clicked', event.latlng),
    zoomend: () => console.log('zoom ended'),
  })
  return null
}
```

Verified: a click fires the `useMapEvents` handler and never the
`eventHandlers` prop on `MapContainer`.

## What is mutable, and what is not

From the React-Leaflet docs, and worth knowing before you debug a prop
that "does nothing":

- Mutable: `TileLayer` `url`, `opacity`, `zIndex`, `attribution`; `Marker`
  `position`; `Circle` and `CircleMarker` `center` and `radius`;
  `pathOptions`; `Popup` `position`; `ZoomControl` `position`.
- Everything else is read once, at mount. To change it, change the `key`
  so React mounts a new element.

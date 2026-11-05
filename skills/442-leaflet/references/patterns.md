# The patterns, and nothing else

Every snippet here was run against `leaflet` 1.9.4 and `react-leaflet`
5.0.0 on React 19, in a Vite project, in a production build. If a map
task is not one of these, it is two of these.

## 1. A map that renders

```jsx
<MapContainer center={[47.6555, -122.305]} zoom={14} style={{ height: '400px' }}>
  <TileLayer
    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  />
</MapContainer>
```

The height is not optional. Without it the container is zero pixels tall
and the page shows nothing.

## 2. Your data as markers

```jsx
const spots = [
  { id: 1, name: 'Suzzallo Library', position: [47.6555, -122.3086] },
  { id: 2, name: 'Husky Stadium', position: [47.6504, -122.3015] },
]

{spots.map((spot) => (
  <Marker key={spot.id} position={spot.position}>
    <Popup>{spot.name}</Popup>
  </Marker>
))}
```

`key` is the record's own id. An index key makes React reuse the wrong
marker when the list changes order.

## 3. Shapes, styled with `pathOptions`

```jsx
<Circle center={[47.6555, -122.305]} radius={300}
  pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }} />
<Polygon positions={box} pathOptions={{ color: 'purple' }} />
<Polyline positions={trail} pathOptions={{ color: 'red', weight: 4 }} />
```

`radius` is metres. `color` is the outline, `fillColor` the inside. Both
take a real CSS color: `'blue'`, not `'#blue'`.

## 4. Events

```jsx
import { useMapEvents } from 'react-leaflet'

function Clicks() {
  useMapEvents({
    click: (event) => console.log('clicked', event.latlng),
    zoomend: () => console.log('zoom ended'),
  })
  return null
}
```

Put `<Clicks />` inside `MapContainer`. `eventHandlers` on a child
component such as `Marker` also works. On `MapContainer` it does nothing,
and nothing warns you.

## 5. Move the map from state

```jsx
function Recenter({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}
```

`center` on `MapContainer` is read once, at mount. Changing it later does
nothing. This child is how the map follows your app's state.

## 6. Fit the map to a set of points

```jsx
function Fit({ points }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(points, { padding: [20, 20] })
  }, [map, points])
  return null
}
```

`points` is an array of `[lat, lng]` pairs, or a `LatLngBounds`. Verified:
the map's bounds came out as the box plus the padding.

## 7. Show a layer only sometimes

```jsx
{showCircle && <Circle center={spot} radius={300} />}
```

Verified: removing the condition removes the layer from the map. Plain
React, no Leaflet call needed.

## 8. Popup content is React

```jsx
<Popup>
  <strong>{spot.name}</strong>
  <br />
  open today
</Popup>
```

Anything you can render, you can put in a popup, including a button with
an `onClick`. It is React, so it re-renders with your state.

## What a pattern never needs

- `L.map(...)` or `L.tileLayer(...)` called by hand. The components do it.
- `useRef` on the map. `useMap()` is the supported way in.
- `whenCreated`, `whenReady` for normal work. Both exist for edge cases;
  `whenCreated` was removed in React-Leaflet 4 anyway.
- A `div` with an `id` for Leaflet to find. `MapContainer` owns its node.
- `dangerouslySetInnerHTML` for popup text. Put JSX in the popup.

# Proving a map works

A map that compiles is not a map that works. These checks are what
"verified" means for map code. Run them on the dev server and again on
the built page, because the marker image breaks only in a build.

To run these checks, drive the page with [`442-browser`](../../442-browser/SKILL.md):
it installs on demand through npx, opens the page, and evaluates the snippets below.
For a one-command check that screenshots at 360 and 1280 and reports a container with
no height, which is the bug that turns a map into a grey strip, use
[`442-browser-use`](../../442-browser-use/SKILL.md). The numbers below are what to read
once the page is actually open.

## Start the app

```sh
npm run dev      # then open the URL it prints
npm run build    # then npm run preview for the built page
```

## The three numbers

In a browser automation harness, evaluate this in the page and report the
result:

```js
(() => {
  const tiles = [...document.querySelectorAll('img.leaflet-tile')]
  const markers = [...document.querySelectorAll('img.leaflet-marker-icon')]
  const container = document.querySelector('.leaflet-container')
  return {
    container: container ? Math.round(container.getBoundingClientRect().height) : null,
    tiles: tiles.length,
    tilesLoaded: tiles.filter((t) => t.complete && t.naturalWidth > 0).length,
    markers: markers.length,
    markersLoaded: markers.filter((m) => m.complete && m.naturalWidth > 0).length,
  }
})()
```

- `container` is a positive number, not `0`.
- `tilesLoaded` is greater than zero.
- `markersLoaded` equals `markers`. This is the check that catches the
  build-only icon bug.

Then open a popup by clicking a marker, and read its text back.

## The console

Count errors, and ignore tile requests that were cancelled by a pan:

```js
const ignored = (text) => /tile\.openstreetmap\.org.*ERR_ABORTED/.test(text)
```

A pan or zoom cancels tiles that were in flight, so a page with a few
`net::ERR_ABORTED` tile lines is healthy. A React error, a `404` on
`marker-icon`, or anything mentioning `leaflet` is not.

## With the omp browser tools

```js
const tab = await browser.open({ name: 'map', url: 'http://localhost:5173/' })
await tab.waitForSelector('.leaflet-container', { timeout: 15000 })
const result = await tab.evaluate(`<the snippet above>`)
```

`tab.run` runs in a separate runtime without a DOM, so `document` is not
defined there. Use `tab.evaluate` with the snippet as a string, or
`tab.run` with `page.evaluate` inside it.

Take a screenshot of the map element as the visual proof:

```js
await tab.screenshot({ format: 'png', selector: '.leaflet-container' })
```

## What a good run looks like

```
container: 400
tiles: 15
tilesLoaded: 15
markers: 2
markersLoaded: 2
```

Any zero in that list is a bug you can name, and a bug you can name is one
step from a fix. [debug.md](debug.md) maps each zero to its cause.

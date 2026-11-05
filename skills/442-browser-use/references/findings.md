# What a finding means

Six kinds. Each one names the likely cause and the usual fix, in the order they are
worth fixing.

## `console error`

A JavaScript error the page threw, or logged with `console.error`. The message is the
first thing to read: it usually names the file and the line.

- `Cannot read properties of undefined` means something the code expected was not
  there yet. Common with Firebase data before the first snapshot arrives.
- A React warning about a missing `key` shows up here too. Harmless looking, worth
  fixing, because it makes every later warning harder to spot.

## `uncaught error`

The page crashed after load. Almost always an import that did not resolve, or a
component thrown during render. The white screen and this message are the same bug.

## `failed request`

A fetch, an image, or a data call returned nothing. Check the URL: a hardcoded
`localhost` in a deployed build fails here and nowhere else.

Favicon failures are ignored on purpose. Every page has one and nobody asked.

## `overflow`

The page is wider than the phone. A student sees this as "the phone is zoomed out",
which is the same bug.

- A fixed `width: 520px` on a card. Use `max-width` and `width: 100%`.
- A long unbroken string, like a URL in a paragraph. `overflow-wrap: anywhere`.
- A table or a map that never learned its parent's width.

## `collapsed`

An element with content inside it that drew with no height. This is the one that
baffles people, and it is the most common bug in the whole class.

A Leaflet map is the classic case: Leaflet needs the container to have a height it
can read, and `width: 100%` gives it nothing to divide. A collapsed card is the same
thing with flexbox. The fix is a real height on the element that holds the content:

```css
#map { height: 400px; width: 100%; }
```

Only the outermost collapsed element is reported. Its children are collapsed too, and
they are the same bug.

## `small target`

A link or button under 24px tall. Hard to hit on a phone, and hard for anyone with an
unsteady hand. Section 5 of the class standard asks for 44px, so a control that fails
this one will fail the accessibility review in week 6.

## `broken image`

An `img` whose source did not load. Check the path's case: `Hero.png` and `hero.png`
are different files on a deployed server and the same file on a Mac. That difference
costs people an afternoon every quarter.

## What to fix first

1. `console error` and `uncaught error`. Nothing else matters if the page is throwing.
2. `collapsed` and `overflow`. These are the ones a user sees immediately.
3. `failed request` and `broken image`.
4. `small target`. Real, but not urgent, and week 6 will raise it again.

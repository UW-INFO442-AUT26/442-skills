# Boolean && rendering

INFO 442 lab practice, week 4. Three TODO comments in `src/App.jsx`, and a page
that does not work until you fix them.

Start it:

```bash
npm run dev
```

Open the address it prints, usually http://localhost:5173.

## What to fix

Read the comments in `src/App.jsx` top to bottom. Each one starts with `TODO`
and says what is wrong and what the idea is.

1. A counter where a boolean belongs.
2. A card that renders no matter what.
3. A `0` that shows up on the page when the condition is a number.

Change one TODO, save the file, and look at the page. Vite redraws it for you.

## Done when

- Clicking **Toggle the card** shows the card, and clicking again hides it.
- Nothing is left behind when the card is hidden. A stray `0` means your
  condition is a number, not a boolean.
- `npm run lint` is clean.

## Where the colours come from

`src/tokens.css` is a copy of the class design tokens, so the page already
looks like the rest of INFO 442, light and dark. Build your own screens with
those tokens rather than new hex values. The rules behind them are in
`442-brand/STYLE.md` in the class skills repo.

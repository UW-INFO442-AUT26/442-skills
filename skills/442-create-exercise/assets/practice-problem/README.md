# Boolean && rendering

INFO 442 lab practice, week 4.

`src/App.jsx` has three TODO comments. The page is broken in three small ways.
Fix them one at a time.

## Start it

```bash
npm run dev
```

Open the address it prints, usually http://localhost:5173.

## What to fix

Read the comments from top to bottom. Each one says what is wrong, and what
the idea is.

1. A counter where a boolean belongs. A boolean is a value that is either true
   or false.
2. A card that always shows. Nothing is guarding it yet.
3. A 0 on the page that should not be there.

Change one thing. Save the file. Look at the page. It updates by itself.

## Done when

- The button shows the card. The same button hides it again.
- Nothing is left behind when the card is hidden. A lone 0 means the
  condition is still a number.
- `npm run lint` has nothing to say.

## Where the colors come from

`src/tokens.css` is a copy of the class design tokens. The page already looks
like the rest of INFO 442, in light and in dark. Build your own screens with
those tokens. Do not type new color values. The rules behind them are in
`442-brand/STYLE.md` in the class skills repo.

# Board spec

What the component board must contain, and how to wire it. The starter in
`../assets/board.html` already implements every item below against tokens, so the
work is usually rewriting three direction blocks and deleting what the product
does not use.

## Why a board and not a mockup

A mockup shows one screen the team already imagines. A board shows the parts in
every state, which is where inconsistency actually lives: a disabled button nobody
designed, an error field that only exists in the code, a hover state that was never
decided. States are the design, and they are invisible in a mockup.

## The component and state matrix

Every row must render. Delete a row only when the product genuinely has no such
thing, and say so in `design.md`.

| Component | States and variants to show |
|---|---|
| Button | primary, secondary, ghost, destructive. Each in default, hover, focus, active, disabled. Primary also loading. |
| Text input | rest, focus, error (with message), disabled. Plus placeholder text visible in the rest one. |
| Select and textarea | rest and focus |
| Checkbox, radio | on and off |
| Toggle | on and off, drawn as one control with a visible label |
| Badge | neutral, accent, success, warning, error |
| Card | plain, interactive with hover, status edge, with metadata line |
| List row | default, hover, with status badge, with monospace data |
| Table | header plus three rows, one row in hover |
| Tabs | selected, unselected, hover, disabled |
| Alert | info, success, warning, error |
| Empty state | one line, one sentence, one action |
| Dialog | one question, two buttons |
| Avatar with name | one row |
| Type scale | every step in the ladder, labelled with its token name |
| Type behaviour | a paragraph at the measure, the same paragraph unconstrained, two weights, and numerals in a column |
| Palette | every token as a swatch with its name |
| Spacing ladder | every step as a bar |
| Rhythm | the same three blocks spaced at two different steps, so the difference is visible |
| Grid | one column at 360px, then the card grid at laptop width |
| Motifs | four candidate signature marks side by side, applied to a row rather than drawn alone |
| Radius | the radius tokens applied to real cards |

## Why the board carries more than components

Half of a design system is not a component. The type scale, the spacing rhythm, the
grid, and the motifs are what a team will improvise badly in the app if the board does
not show them. Words are the other half and they live in their own skill,
`442-create-brand-voice`, with their own board.

- **The measure demo** puts a paragraph at the token width and the same paragraph
  full width. The difference is the argument, and it does not need explaining.
- **The rhythm demo** spaces three identical blocks at two ladder steps. Teams argue
  about "more space" until they see it.
- **The motif row** shows four candidates applied to a real list row, not floating
  alone, because a mark that only works in isolation is not a motif.

## Wiring rules

1. **All three directions in one file.** `body[data-dir="a|b|c"]` selects a token
   block. The switch sets the attribute and nothing else. Three files means three
   boards that drift.
2. **Forced state classes.** `.s-hover`, `.s-focus`, `.s-active`, `.s-disabled`,
   `.s-error`, `.s-loading`. Real `:hover` and `:focus-visible` stay too, for
   checking against the forced version, but the forced classes are what the board
   displays.
3. **Density is a second switch, not a second board.** `body[data-density]` swaps
   the space and type ladder only. If density changes anything other than space,
   line height, and text size, the tokens are wired wrong.
4. **No hard-coded values below the token block.** If a color or a size appears in
   component CSS, it will not move with the direction and the board is lying.
5. **One file, no build.** Inline the CSS and the script. It has to open from the
   file system by double-click.
6. **No webfont by default.** System stacks keep the board fast and dependency
   free. A team that wants a webfont may add one, and then the board should show
   the fallback stack too, because the first paint is what most people see.

## Naming contract

`design/tokens.css` and the board must use the same names, and the board prints the
active direction's block so it can be copied straight across:

```
--bg --surface --surface-2 --ink --ink-2 --muted --border --edge
--accent --accent-ink --accent-soft
--success --warning --error --error-soft
--font-sans --font-mono
--text-xs --text-sm --text-base --text-lg --text-xl --text-2xl --text-3xl
--leading --leading-tight
--space-1 ... --space-8
--radius --radius-sm --shadow-1 --focus --target
--duration --ease
```

Two border tokens, not one, and this is the detail most palettes get wrong:
`--border` is decoration (a divider, a card hairline) and can be nearly invisible,
while `--edge` is a control boundary (an input outline, a secondary button, a
toggle track) and needs 3:1 against its surface. Fold them into one token and you
either get invisible inputs or a page covered in heavy lines.

Roles, not colors: `--accent`, never `--purple`. A role survives a direction
change; a color name does not.

## The accessibility gates, on the board

These are checked on the board before the tokens go anywhere near the app, because
fixing a palette here costs one edit and fixing it in twenty components costs a
day.

- **Contrast.** Body pairs 4.5:1, large text and control edges 3:1. Write the
  measured number in the table at the bottom of the board and copy it into
  `design.md`.
- **Focus is visible on every control**, in every direction, on both densities.
  The `.s-focus` row exists so this is checkable without tabbing.
- **Hit targets.** 44 by 44 pixels on mobile, enforced by `--target` rather than by
  eye. The board sets `min-height` on controls for this reason.
- **No state by color alone.** Every badge carries a word, every error carries a
  message, every status edge is paired with text.
- **Reduced motion.** The spinner and every transition collapse under
  `prefers-reduced-motion`.
- **One direction may be dark.** If one of the three is a dark surface, run the
  contrast table again for it. Dark palettes pass or fail on their own numbers,
  and light-mode intuition is usually wrong about them.

## What to cut

A board that shows every component in a design system is a board nobody reads. Keep
what the product uses: a four-screen app rarely needs a table, and a data tool
rarely needs a dialog. Cutting rows is what keeps the board a working page rather
than a specimen library, and `design.md` records what was cut and why.

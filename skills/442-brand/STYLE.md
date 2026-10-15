# INFO 442 style guide

Reference for the `442-brand` skill. Read `tokens.css` for the values;
this file is the rules for using them.

## Palette usage

| Token | Use | Do not |
|---|---|---|
| `--bg` / `--surface` | page and card backgrounds | n/a |
| `--ink` / `--ink-2` | body text, secondary text | body text below `--ink-2` |
| `--accent` | the one primary action, the one thing to look at | spreading it across many elements |
| `--uw-purple` | brand mark: a heading rule, a logo, a small badge | large fills behind body text |
| `--uw-gold` | a single deliberate accent: a highlight, a divider, a stat | pairing it with the accent on the same element |
| `--success` / `--warning` / `--error` | real state only | decoration |

The UW signal is a *mark*, not a theme. A page whose only purple is a
short heading rule and a badge still reads as UW; a page painted purple
reads as neither UW nor professional.

**Contrast:** `--ink` on `--bg`, `--ink` on `--surface`, and
`--accent-ink` on `--accent` all clear 4.5:1. `--muted` is for labels and
captions only. Never put `--uw-gold` text on `--bg`.

## Type scale

Use the largest step that fits, and keep each screen to three sizes.

| Token | Size | Use |
|---|---|---|
| `--text-3xl` | 2.25rem | page title, one per page |
| `--text-2xl` | 1.75rem | section heading |
| `--text-xl` | 1.375rem | card / sub-heading |
| `--text-lg` | 1.125rem | lead paragraph |
| `--text-base` | 1rem | body, the mobile floor |
| `--text-sm` / `--text-xs` | 0.875 / 0.75rem | labels, captions, metadata |

Body text never goes below `--text-base` on mobile. Headings use
`--leading-tight`; body uses `--leading`. Code and identifiers use
`--font-mono`.

## Space and layout

Spacing is the `--space-*` ladder (4 px base): `2` inside a control, `4`
between related items, `6` to `8` between blocks, `12` between sections.

- **Mobile first.** Build one 360 px column. A single `--space-4` gutter.
  Only after the mobile pass looks right, widen with a `max-width` and
  let the column center; do not build desktop down.
- Content column caps at 68ch; a card grid is `repeat(auto-fit,
  minmax(15rem, 1fr))` with `--space-4` gaps.
- Vertical rhythm beats borders. Reach for space before a line.

## Components

Keep these shapes consistent across every 442 artifact.

- **Card**: `--surface`, `--radius`, `--shadow-1`, `--space-4`/`--space-6`
  padding, optional `--border` hairline instead of the shadow.
- **Button**: primary is `--accent` fill, `--accent-ink` label,
  `--radius-sm`, min height `--tap`. Secondary is transparent fill with a
  `--border` stroke and `--ink` label. One primary button per screen.
- **Badge / tag**: `--radius-pill`, `--text-xs`, an `--*-soft` background
  with its matching dark text. Use a UW-purple badge for course identity.
- **Input**: `--surface`, `--border` stroke, `--radius-sm`, min height
  `--tap`, focus ring in `--accent`.
- **Callout**: a 3 px `--accent` left border on `--accent-soft`, or the
  matching soft/solid pair for `--success` / `--warning` / `--error`.

## Accessibility gate

Before calling a design done, check every one:

- Body text contrast of 4.5:1 or better; large text and UI strokes 3:1.
- Every interactive target at least 44 x 44 px, with a visible focus style.
- The page is usable at 360 px width with no horizontal scroll.
- Meaning never rides on color alone; pair it with text or an icon.
- `prefers-reduced-motion` is honored; nothing essential animates.
- Keyboard reaches and operates every control in a sensible order.

## Done when

- `tokens.css` is imported and no raw hex appears in the project's own CSS.
- The mobile 360 px pass is complete and scrolls vertically only.
- Exactly one accent-colored primary action is visible per screen.
- UW purple/gold appear as marks, not as fields.
- The accessibility gate above passes item by item.

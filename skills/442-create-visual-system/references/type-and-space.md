# Type and space

The two scales that make a system look deliberate. Decide them once, then never
improvise a size or a gap again.

## The type scale

Pick a **ratio**, then multiply. Four ratios cover almost every product:

| Ratio | Feel | Use when |
|---|---|---|
| 1.125 | quiet, dense, editorial | lots of text, little hierarchy, dashboards |
| 1.2 | neutral, the safest default | most products |
| 1.25 | clear hierarchy, marketing-ish | few words per screen, strong headings |
| 1.333 | loud, poster-like | a landing page, a demo cover slide |

Base is 16px, because that is the browser default and the floor for body text on
mobile. Round every step to a whole pixel so nothing renders blurry. Six or seven
steps is right; twelve is a catalogue nobody uses.

```text
--text-xs    0.75rem   labels, metadata, mono data
--text-sm    0.875rem  controls, secondary text
--text-base  1rem      body copy, the mobile floor
--text-lg    1.125rem  lead paragraph
--text-xl    1.375rem  card heading
--text-2xl   1.75rem   section heading
--text-3xl   2.25rem   page title, one per page
```

Rules that make the scale hold:

- **Three sizes per screen, maximum.** Title, body, label. A fourth size is usually
  a mistake dressed as hierarchy.
- **Never a size that is not a token.** A `font-size: 1.05rem` written once becomes
  the reason the type looks nearly-but-not-quite consistent.
- **Line height moves opposite to size.** Roughly 1.5 at body size, 1.2 to 1.15 at
  display sizes. Large text with body line height looks loose; small text with tight
  leading is unreadable.
- **Track large text tighter**, around -0.01em above 2rem. Leave body tracking alone.
- **Use tabular numerals** (or a mono) for anything that sits in a column or changes
  in place: times, amounts, counts. Proportional numerals make a list jump.

## The measure

Line length is a readability decision, not an aesthetic one: 45 to 75 characters
per line, and about 65 is the sweet spot. Write it as a width, not a habit:

```css
p, li { max-width: 62ch; }
```

`ch` is the width of a zero in the current font, so the limit survives a font
change. A full-width paragraph on a laptop is the single most common reason a
student project reads as unfinished.

## The spacing ladder

One base unit, almost always 4px, multiplied into a ladder. Name the steps by what
they are for, because a ladder without purposes gets used randomly.

| Token | Value | For |
|---|---|---|
| `--space-1` | 4px | inside a tight control, icon to label |
| `--space-2` | 8px | related items, badge padding |
| `--space-3` | 12px | control padding, list row interior |
| `--space-4` | 16px | the default gutter, inside a card |
| `--space-5` | 24px | between blocks in a card |
| `--space-6` | 32px | between cards, section interior |
| `--space-7` | 48px | between sections |
| `--space-8` | 64px | page top and bottom, before a footer |

Rules:

- **Space before lines.** If two things feel separate, add space before adding a
  border. Borders are the expensive way to create rhythm.
- **Vertical rhythm beats cleverness.** The same gap between peer blocks, everywhere.
  Uneven gaps read as a bug even when the content varies.
- **Whitespace is a texture, not a gap.** Dense products spend space in small steps;
  sparse products spend it in large ones. Pick one and stay in that register.
- **Compact density changes only space, leading, and body size.** If a density switch
  changes radii or colors, the system has two systems.

## The grid and the breakpoints

Build one 360px column first, then widen. Desktop-down design is what produces a
mobile layout that looks like a squeezed spreadsheet.

```text
content width     68rem max, 62ch for text
gutter            --space-4
columns           one by default; repeat(auto-fit, minmax(15rem, 1fr)) for cards
breakpoints       45rem (tablet), 72rem (laptop)
```

Two breakpoints are enough for a class project and three is defensible. A breakpoint
that exists because one element broke is a layout bug, not a breakpoint.

## Radius and elevation

- **Radius scale: two steps.** `--radius-sm` for controls, `--radius` for containers.
  A third step is a decision nobody will remember.
- **Borders or shadows, rarely both.** A bordered card with a shadow looks like two
  designers disagreed. Pick one language and note it in `design.md`.
- **Shadow is depth, not decoration.** If everything floats, nothing is on top.

## How to settle an argument about type or space

Ask which token is wrong, not which value looks better. If the answer is "none of
them", the scale is wrong, and changing one screen will not fix it. That single
question turns a taste argument into an edit.

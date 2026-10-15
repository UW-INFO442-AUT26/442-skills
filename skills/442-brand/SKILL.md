---
name: 442-brand
description: The INFO 442 visual language: color tokens, type scale, spacing, and component patterns for anything a student or the agent builds or designs (web pages, exercises, slide-adjacent web artifacts, React apps). Use when a task involves choosing colors, fonts, layout, or styling for INFO 442 work, or when another skill needs the class design tokens.
---

# INFO 442 brand

The single source of truth for how INFO 442 things look. Any skill or
project that renders something visual calls this skill first, instead of
re-inventing a palette.

**Voice of the design:** you can tell it is UW, but only faintly. UW
purple is the signature, not the wallpaper. The surface is a quiet
technical neutral; a single saturated accent carries interaction; UW
purple and gold appear as deliberate marks, never as the background.

## Use it

1. Read [`STYLE.md`](STYLE.md): the rules, in order, and the component
   patterns.
2. Copy [`tokens.css`](tokens.css) into the project (for a web page, the
   top of the stylesheet or a linked `src/index.css`). Do not hand-type
   hex values from memory; use the tokens.
3. Nothing in `tokens.css` changes per project. Change a token only when
   you also change `STYLE.md`, so every consumer moves together.

## The rules that matter most

- **Mobile first.** Design the 360 px column first, full pass, before any
  wider layout. Every interactive target is at least 44 x 44 px.
- **Contrast is a hard gate.** Body text hits WCAG AA (4.5:1); large text
  and UI strokes hit 3:1. No gray-on-gray.
- **One accent per screen.** The accent color marks the single primary
  action or the one thing to look at. Purple and gold are brand marks,
  not second and third accents.
- **Type:** a system stack or one preloaded family; never a webfont that
  blocks first paint. Scale comes from `--text-*`, not ad-hoc sizes.
- **Motion:** 120 to 200 ms, eased, and never required to understand the
  page. Respect `prefers-reduced-motion`.

## Pointers

- [`STYLE.md`](STYLE.md): palette usage, type scale, spacing, components, accessibility
- [`tokens.css`](tokens.css): the CSS custom properties every project imports

## What's next

Load [`tokens.css`](tokens.css) into the project and run the accessibility
gate in `STYLE.md` before shipping the first screen.

## Boundary

This skill is a **reference**, not a generator. It does not scaffold a
project or write an app; it hands tokens and rules to the skill or task
that does.

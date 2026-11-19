---
name: 442-create-visual-system
description: "Interviews a team about their product's look, builds a component board in HTML they can open and react to, iterates until it lands, and writes design.md. Use when a project needs its own look, when a screen looks generic or accidentally like a template, when a demo needs to feel designed, or when no design decisions are written down."
---

# Build the visual system

A design system is not a palette with a font. It is the small set of decisions that
every future screen and every future sentence can be built from: what the type
scale is, how space is spent, what color is for, which shapes repeat, how motion
behaves, and how the product talks. Left alone, a project gets default fonts, a
framework blue, and copy written one string at a time, which is why so many demos
look and read like the same demo.

This skill makes those decisions explicit, puts them on one page you can look at,
and keeps changing the tokens and the words until the page feels like the product.

Three files come out of it:

- `design/board.html` opens by double-clicking. Every component and state, the type
  specimen, the spacing and grid, the motifs, and the density switch, with a switch
  between directions.
- `design/tokens.css` is the same tokens, ready to import into the app.
- `design.md` is the system: direction, typography, spacing, color, geometry,
  components, motifs, motion, contrast numbers, and what you rejected.

Words are a separate job with their own document. Call the Skill tool with
`442-create-brand-voice` for how the product talks, and run it after this one, since
copy read aloud against a real type scale is a different decision than copy read in a
list.

**Boundary with `442-brand`.** The class brand owns class-facing artifacts: the
course page, exercises, slides, anything presented as 442 material. Read it with
the Skill tool first when that is what you are building. A product's own identity
is different work, and it is this skill. When a project is half class artifact,
treat the class tokens as one of the three directions rather than as the answer.

## Two modes, decided from the invocation

The default is fast. The word `detailed` in the request switches to the full
interview.

| Invocation | What happens |
|---|---|
| `/442-create-visual-system for a shift app` | Ask the four questions only the team can answer, decide the rest yourself, and announce every decision in one line so it can be overruled. About ten minutes. |
| `/442-create-visual-system detailed, a claim tracker for caseworkers` | Ask the full bank in [references/question-set.md](references/question-set.md), one at a time, and let the team make each call. |

Detect `detailed` anywhere in the request, in any case. When in doubt, take the
default: a team that wanted the longer interview will ask for it, and a twelve
question interview about a logo-less MVP gets abandoned half way.

In default mode the decisions you make alone are still written down with a reason,
because an unexplained rule gets broken the first time somebody disagrees with it.

## 1. Read before you ask

Collect in writing: the product in one line, who uses it, where it runs, the
screens that exist, and an inventory of what already exists in the code. Read
`README.md`, the spec, `src/index.css`, and the two most finished components.

Also grep the source for user-facing strings. You are not rewriting them here, but
they tell you the register the product already has, and how much text each surface
carries, which is what the density and type decisions rest on.

If the product has no name and no mark, say so in one line and offer to proceed: a
visual system does not need a logo, but the mark will have to match later (Call the
Skill tool with `442-create-names`, then `442-logo`).

*Done when:* the product line, audience, surfaces, existing tokens, and a list of at
least ten real UI strings are written down.

## 2. Interrogate, one question at a time

Ask one question per message, each with your recommended answer inside it so the
student can reply "yes" or correct you. Offer "you decide" as a real answer and take
it as final.

**Default mode, the four questions only the team can answer:** the register (who is
looking and what they are doing), two interfaces they find easy or hard to look at,
the density the busiest screen forces, and corners versus borders versus shadows.
Those four set type, color, spacing ladder, and geometry, and everything else is
derivable.

**Detailed mode** adds type personality, the job of color, and the one signature
mark. Full bank with the recommendation to carry into each:
[references/question-set.md](references/question-set.md).

Two rules while asking:

- **Ask about reactions, not adjectives.** "Show me a product whose interface you
  find easy to look at" produces an answer. "Do you want it clean and modern"
  produces "yes" and tells you nothing.
- **Write each answer into the running list** after the reply, so a wrong turn shows
  up while it is still cheap.

*Done when:* every question in the chosen mode is answered or delegated, every
decision you made alone is written down with a reason, and each answer is one line in
a running list.

## 3. Set the scales before the look

The type scale and the spacing ladder are the two decisions that make a system look
professional or accidental, and they are cheap to get right now and expensive
later. Decide them in reference to the density answer, not by taste:
[references/type-and-space.md](references/type-and-space.md) has the ratios, the
line height rule, the measure rule, and the breakpoints.

Write down the outcome as values, not adjectives: the scale as token names and
sizes, the spacing ladder with what each step is for, the content width, and the
two or three breakpoints.

*Done when:* the type scale, spacing ladder, measure, and breakpoints exist as a
written list of tokens with a one-line purpose each.

## 4. Draft three directions, named

A direction is a stance, not a color. Each one carries type, spacing rhythm, color
roles, corner and border geometry, and a signature motif. Each one also gets **one
real string written in its register** on the same page: a look and a voice that
disagree read as two products, and a single sentence is enough to catch it.

An example line, for a shift app, is the empty state: `No shifts yet` in one
direction, `Nothing on the rota. Add the first shift.` in another. Same screen,
different product. The full voice job is `442-create-brand-voice`; this is a
sanity check, not a substitute.

Derive them, do not decorate: the register picks the type, the density picks the
spacing, the domain picks the color roles and the motif, and the audience picks the
sentence. Each direction gets one line of rationale tied to an answer from step
2. Recommend one, then let the student pick.

*Done when:* three named directions exist, each with type, spacing rhythm, color
roles, geometry, motif, a sample sentence, and a rationale citing an answer, and one
is chosen.

## 5. Build the board

Copy [`assets/board.html`](assets/board.html) to `design/board.html` and rewrite the
token blocks with the three directions, keeping all three on one page behind a
switch. The full matrix is in [references/board-spec.md](references/board-spec.md):
components and states, the type specimen with a measure demo, the spacing and rhythm
demonstration, the grid, and the motifs.

Three constraints make it usable:

- **No build step, no server.** It must open from the file system, because the
  student will double-click it.
- **States are shown, not hovered.** A state you can only see with a mouse cannot be
  compared or shown to a teammate, so every state gets a forced class and sits in a
  row.
- **The board shows the system, not one screen.** If a team cannot see the spacing
  ladder and the type scale on the board, they will invent new values in the app.

*Done when:* `design/board.html` opens by double-click with every item in the spec
rendered, the switch changes all three directions, and the density switch changes
only space and type.

## 6. Iterate on tokens and on words

Show the board, ask what feels wrong in their own words, and change a token or a
line of copy. Never patch a single component: if one button looks wrong, the token
is wrong, and fixing the button hides that.

| They say | Move this |
|---|---|
| "too corporate", "like a bank" | loosen type, raise radius, warm the neutral, drop the shadow |
| "too playful", "like a toy" | tighten radius, cut the accent to one role, straighten the geometry |
| "cramped", "busy" | step the spacing ladder up one, raise line height, cut to one accent |
| "washy", "low contrast" | darken the ink one step, then measure rather than trust your eye |
| "flat", "no depth" | add a hairline border before adding a shadow |
| "doesn't feel like us" | revisit the motif from step 4, not the palette |
| "the copy sounds like a robot" | cut the hedge, name the actor, use the second person, delete the adverb |

One change set per round, written down. Two rounds is normal. Four rounds means the
direction is wrong, not the tokens.

*Done when:* the student says it is right, or two consecutive rounds end with
nothing changed.

## 7. Run the gates

**Contrast.** Measure, do not estimate. Body text needs 4.5:1, large text and
control boundaries need 3:1. Keep decoration and control edges as two tokens
(`--border` and `--edge`), because a hairline that reads well between sections is
too faint to mark an input, and a line dark enough for an input makes every card
look boxed. Write the measured numbers into `design.md`.

**The rest of the physical gate.** A visible focus ring on every control, hit
targets of at least 44 by 44 pixels on mobile, no state carried by color alone, and
motion that stops under `prefers-reduced-motion`.

Words are not gated here. If a team has no `voice.md` yet, say so in one line and
point at `442-create-brand-voice`, because the copy is the next thing that will look
unfinished.

*Done when:* every pair has a measured ratio and the physical checks pass.

## 8. Write design.md

Eleven sections. Each one short, because a design system nobody reads is a design
system that gets ignored.

```markdown
# <product> visual system

## What it is
<one line, who uses it, where it runs>

## Direction
<name>, because <the answer it came from>.

## Typography
<families and why, the scale with token names and sizes, weights, line heights,
the measure, tracking, numerals. One line per rule.>

## Spacing and layout
<the ladder and what each step is for, the content width, the grid, the
breakpoints, and the rhythm rule>

## Color
<roles not colors: background, surface, ink, edge, accent, status. What each is
for and what it must never be used for.>

## Geometry and elevation
<radius scale, borders versus shadows, and the rule that keeps them consistent>

## Components
<two or three rules that apply across components, and the states that exist>

## Motifs
<the one or two repeating marks, where they appear, and where they must not>

## Motion
<durations, easing, what moves and what never moves>

## Measured contrast
<pair: ratio>. <what it is used for>

## Rejected directions
<name>: <why it lost>. <what was learned and carried forward>.
```

The last section is not paperwork. It is what stops a team reopening a settled
question in week eight.

*Done when:* `design.md` exists with all eleven sections and the contrast numbers
are real measurements.

## 9. Hand off

Copy `design/tokens.css` into the app and import it once. Then say the two rules
that keep a system alive: a color or a size that a token already names never gets
typed again, and a string is not a design decision so it does not belong here.

*Done when:* the app imports the token file, no component hard-codes a value a token
names, and the team knows where `design.md` lives.

## What's next

Commit `design/` and `design.md`, then Call the Skill tool with
`442-create-brand-voice` so the words match the look, and `442-page-check` to see the
first real screen at phone and laptop width with these tokens applied.

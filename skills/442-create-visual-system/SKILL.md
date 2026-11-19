---
name: 442-create-visual-system
description: "Interviews a team about their product's visual and verbal system, builds a component board in HTML they can open and react to, and iterates until it lands, then writes design.md and voice.md. Use when a project needs its own look and its own way of talking, when a screen looks generic or accidentally like a template, when the copy sounds like a robot, when a demo needs to feel designed, or when no design decisions are written down."
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

Four files come out of it:

- `design/board.html` opens by double-clicking. Every component and state, the type
  specimen, the spacing and grid, the motifs, and a copy panel, with a switch
  between directions.
- `design/tokens.css` is the same tokens, ready to import into the app.
- `design.md` is the visual system: direction, typography, spacing, color,
  geometry, components, motifs, motion, contrast numbers, and what you rejected.
- `voice.md` is the verbal system: how the product talks, tone by situation,
  capitalization and punctuation, microcopy patterns, and banned phrasing.

Two files for two kinds of decision. A team edits the words far more often than the
palette, and burying the words inside a design doc means nobody reads them.

**Boundary with `442-brand`.** The class brand owns class-facing artifacts: the
course page, exercises, slides, anything presented as 442 material. Read it with
the Skill tool first when that is what you are building. A product's own identity
is different work, and it is this skill. When a project is half class artifact,
treat the class tokens as one of the three directions rather than as the answer.

## 1. Read before you ask

Collect in writing: the product in one line, who uses it, where it runs, the
screens that exist, and an inventory of what already exists in the code. Read
`README.md`, the spec, `src/index.css`, the two most finished components, and
**every user-facing string you can find** (`grep` for button labels, error
messages, empty states, page titles).

The strings matter as much as the colors. Voice work on invented examples produces
a voice nobody can use; voice work on the strings that already exist produces one
they can see is wrong.

If the product has no name and no mark, say so in one line and offer to proceed: a
visual system does not need a logo, but the mark will have to match later (Call the
Skill tool with `442-create-names`, then `442-logo`).

*Done when:* the product line, audience, surfaces, existing tokens, and a list of at
least ten real UI strings are written down.

## 2. Interrogate, one question at a time

Ask one question per message, each with your recommended answer inside it so the
student can reply "yes" or correct you. Offer "you decide" as a real answer and
take it as final. Ten questions is the whole interview; twenty gets abandoned.

The bank is in [references/question-set.md](references/question-set.md): six visual
questions (register, references, density, type, the job of color, geometry) and
four verbal ones (how it addresses one person, how much it explains, whether it
apologizes, what it refuses to say). Ask the verbal four even when the team came in
asking only about colors, because copy is where most projects sound identical.

Two rules while asking:

- **Ask about reactions, not adjectives.** "Show me a product whose interface you
  find easy to look at" produces an answer. "Do you want it clean and modern"
  produces "yes" and tells you nothing.
- **Write each answer into the running list** after the reply, so a wrong turn shows
  up while it is still cheap.

*Done when:* every question is answered or delegated, and each answer is one line
in a running decision list.

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
roles, corner and border geometry, a signature motif, and **one line of copy written
in that direction's voice**, because a look and a voice that disagree read as two
products.

An example line, for a shift app, is the empty state: `No shifts yet` in one
direction, `Nothing on the rota. Add the first shift.` in another. Same screen,
different product.

Derive them, do not decorate: the register picks the type, the density picks the
spacing, the domain picks the color roles and the motif, and the verbal answers pick
the sentence. Each direction gets one line of rationale tied to an answer from step
2. Recommend one, then let the student pick.

*Done when:* three named directions exist, each with type, spacing rhythm, color
roles, geometry, motif, a sample sentence, and a rationale citing an answer, and one
is chosen.

## 5. Build the board

Copy [`assets/board.html`](assets/board.html) to `design/board.html` and rewrite the
token blocks with the three directions, keeping all three on one page behind a
switch. The full matrix is in [references/board-spec.md](references/board-spec.md):
components and states, the type specimen with a measure demo, the spacing and rhythm
demonstration, the grid, the motifs, and the copy panel.

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

**The verbal gate.** Read the ten real strings from step 1 against `voice.md` out
loud. Every one should be understandable with no context, name what happened, and
say what to do next. Delete the words that survive in every product: seamlessly,
empower, simply, easily, robust, leverage, world-class, delight.

*Done when:* every pair has a measured ratio, the physical checks pass, and the ten
strings have been rewritten or confirmed.

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

## 9. Write voice.md

Separate file, because words change more often than colors and because a teammate
writing a button label will not open a design system. Content, in this order, is
specified in [references/voice.md](references/voice.md).

The short version: voice is constant, tone changes by situation. A refused payment,
an empty list, and a success message are three different tones from one voice, and a
team that only writes the success message will invent the other two under deadline.

*Done when:* `voice.md` exists with the voice description, the four dials, a
situation table covering at least errors, empty states, success, destructive
actions, and onboarding, the capitalization and punctuation rules, the microcopy
patterns, and the banned list.

## 10. Hand off

Copy `design/tokens.css` into the app and import it once. Then say the two rules
that keep a system alive: a color or a size that a token already names never gets
typed again, and a new string gets checked against `voice.md` before it ships.

*Done when:* the app imports the token file, no component hard-codes a value a token
names, and the team knows where the two documents live.

## What's next

Commit `design/`, `design.md`, and `voice.md`, then Call the Skill tool with
`442-page-check` to see the first real screen at phone and laptop width with these
tokens applied, and rewrite its copy against `voice.md` while you are there.

---
name: 442-create-brand-voice
description: "Decides how a product talks and writes it down as voice.md, with a copy board showing the same strings written two ways. Interviews the team about register, explanation, and what the product refuses to say. Use when copy sounds like a robot or like a different product on every screen, when a project needs its own voice, when writing errors, buttons, empty states, or confirmations, or when no writing rules exist."
---

# Give the product a voice

Voice is the part of a brand that gets skipped, and then four teammates write four
different products. This skill decides how the thing talks, shows the decisions as
real strings you can look at, and writes them into `voice.md` so the next label
somebody writes is not a guess.

Outputs:

- `voice.md` is the verbal system: the voice, the dials, tone by situation,
  mechanics, patterns, and the banned list.
- `copy/copy.html` opens by double-click. The same strings written two ways, the
  tone table, and the banned list, rendered in your own type so you can see whether
  a sentence works at your measure.

**Voice is not the same as tone, and the distinction is the whole document.** Voice
is constant: the product always sounds like the same character. Tone moves with the
situation. A failed payment, an empty list, and a saved record are three tones from
one voice. A voice doc that only describes the voice produces strings that all sound
alike and none of them fit.

**Related skill.** The look is separate work: Call the Skill tool with
`442-create-visual-system` for type, color, spacing, and components. Read its
`design/tokens.css` if it exists, so the copy board renders in the real type rather
than in a default.

## Two modes, decided from the invocation

The default is fast. The word `detailed` in the request switches to the full
interview.

| Invocation | What happens |
|---|---|
| `/442-create-brand-voice for a shift app` | Ask the three questions that change the most, decide the rest yourself, and announce every decision in one line so it can be overruled. About five minutes. |
| `/442-create-brand-voice detailed, a claim tracker for caseworkers` | Ask the full bank in [references/question-set.md](references/question-set.md), one at a time, and let the team make each call. |

Detect `detailed` anywhere in the request, in any case. When in doubt, take the
default: a team that wanted the long interview will say so.

In default mode the decisions you make alone still get written down with a reason,
because an unexplained rule gets broken the first time somebody disagrees with it.

## 1. Collect the strings that already exist

Do not invent examples when real ones are lying around. Read `README.md`, the spec,
the screens, and then `grep` the source for user-facing text: button labels, page
titles, error messages, empty states, confirmations, placeholder text.

Ten real strings is enough, and they are the most valuable input in this skill,
because a team recognizes its own bad copy instantly and argues about abstract
principles forever.

*Done when:* at least ten real strings are written down, grouped by surface (button,
error, empty, success, destructive, onboarding).

## 2. Ask, then decide the rest

One question per message, each with your recommended answer inside it so the team
can reply "yes" or correct you. `you decide` is a real answer and is taken as final.

**Default mode, three questions:**

1. Does it say "you" or "the user"? (Recommend second person everywhere, including
   errors.)
2. How much does it explain? (Recommend from how often the audience sees the screen:
   daily screens can say `Saved.`, rare screens must say what and where.)
3. What does it refuse to say? (Recommend three words. Teams have strong instincts
   here and it gives the banned list real owners.)

**Detailed mode** adds: does it joke, does it apologize, capitalization,
punctuation, how dates and numbers are written, what onboarding sounds like, and
whether any surface needs a formal register. Full list, with the recommendation to
carry into each:
[references/question-set.md](references/question-set.md).

Everything not asked, you decide. Write each decision as one line with its reason,
in the running list, as you go.

*Done when:* every question in the chosen mode is answered or delegated, and every
decision you made alone is written down with a reason.

## 3. Fix the voice, then move the tone

Write the voice as four dials with a position **and a boundary**, because a position
alone is meaningless:

| Dial | Example of a usable answer |
|---|---|
| Formality | "Contractions everywhere except legal and destructive text." |
| Warmth | "Warm, never jokey. No exclamation marks." |
| Brevity | "One sentence, then one action. A second sentence means a different message." |
| Authority | "We tell people what to do. Never it may be advisable to." |

Then set tone per situation. At minimum: errors, empty states, success,
destructive confirmation, loading, onboarding. The situations that get skipped under
deadline are the error and the destructive confirmation, and those are the two that
cost the most when they are wrong.

*Done when:* four dials carry a boundary each, and six situations carry a tone and
one real example string.

## 4. Build the copy board

Copy this skill's [`assets/copy.html`](assets/copy.html) to `copy/copy.html` and fill
it with the product's own strings. If `design/tokens.css` exists, the page picks it
up automatically and the copy appears in the product's type.

Why a page and not a list: words look different at your measure, in your font, at
your size. Copy decided in a document and never seen in place gets rewritten in the
app, usually by whoever is closest to the deadline.

*Done when:* the page opens by double-click, shows every surface with a before and
after, and the banned list is on it.

## 5. Test the strings

Cheap tests, run on the ten real strings:

1. **Read aloud.** Anything you would not say to a colleague is wrong.
2. **The swap test.** Put a competitor's name in the sentence. If it still reads
   fine, the sentence says nothing about this product.
3. **The stranger test.** Show the error to someone who did not cause it. If they
   cannot say what to do next, rewrite it.
4. **The one-sentence test.** If a string needs a second sentence to be true, it is
   two messages and one belongs elsewhere.

*Done when:* all ten strings have been rewritten or explicitly confirmed, and the
banned list has caught at least one word in them.

## 6. Write voice.md

Six sections, under two pages. The content of each, with worked examples, is in
[references/voice-doc.md](references/voice-doc.md).

```markdown
# <product> voice

## The voice in one line
<Character, in a sentence a teammate can repeat.>

## The four dials
<Position plus boundary, one line each.>

## Tone by situation
<Table: situation, tone, one real example.>

## Mechanics
<Capitalization, contractions, punctuation, person, numbers.>

## Patterns
<Button, error, empty, destructive, success. Good and bad side by side.>

## Banned
<The word list, and the two rules.>
```

Keep it under two pages on purpose. A long voice doc gets read once; a short one gets
opened every time somebody writes a label.

*Done when:* `voice.md` exists with all six sections, under two pages, and every
example in it is a string the product actually uses.

## What's next

Commit `voice.md` and `copy/`, then grep the app for user-facing strings and rewrite
them against it, or Call the Skill tool with `442-create-visual-system` if the look
is still undecided, since a voice and a look that disagree read as two products.

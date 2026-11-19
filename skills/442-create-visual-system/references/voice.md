# Voice, and how to write voice.md

What goes in `voice.md` and why each part earns its place. Voice is the part of a
design system that gets skipped, and then every teammate writes a different
product.

## The distinction that makes it usable

**Voice is constant. Tone moves.** The product always sounds like the same
character, and it changes register with the situation. A payment failing, an empty
list, and a saved record are three tones from one voice.

A `voice.md` that only describes the voice produces strings that all sound alike and
none of them fit. The situation table is what people actually use.

## The four dials

Describe the voice on four axes, each with a position and a boundary. Positions
alone are meaningless; the boundary is the instruction.

| Dial | One end | Other end | What to write |
|---|---|---|---|
| Formality | plain, spoken | formal, procedural | "We use contractions everywhere except legal and destructive confirmations." |
| Warmth | matter of fact | friendly, human | "We are warm, we do not joke. No exclamation marks." |
| Brevity | compressed | explanatory | "One sentence, then one action. If it needs a second sentence, it is a different message." |
| Authority | suggests | instructs | "We tell people what to do. No 'you may want to consider'." |

## The situation table

The core of the document. One row per surface, with the tone named and one real
example. Cover at least these:

| Situation | Tone | Example |
|---|---|---|
| Errors | plain, specific, no blame, next action | `Could not save the shift. Check your connection and try again.` |
| Empty states | matter of fact, one action | `Nothing on the rota. Add the first shift.` |
| Success | short, past tense, no celebration | `Shift saved.` |
| Destructive confirmation | serious, names the thing | `Delete the 4pm shift? This cannot be undone.` |
| Loading | present, honest | `Saving...` then `Saved.` |
| Onboarding | one instruction at a time | `Tap a row to see the hours behind it.` |
| Refusal or limit | state the rule, then the way forward | `You can add five roles on this plan.` |
| Legal or account | formal, no contractions | `Your account will be closed in 30 days.` |

## Grammar and mechanics

The rules that stop drift, each one a line:

- **Capitalization:** sentence case for headings and buttons. Title Case reads as a
  marketing brochure.
- **Contractions:** yes, except in legal and destructive text.
- **Punctuation:** no exclamation marks. One period per sentence. No ellipses except
  a real loading state.
- **Second person, active voice.** "We could not save it" over "the record was not
  saved".
- **No abbreviations** the interface does not define. Write `saved`, not `svd`.
- **Numbers:** numerals for data, words for small counts in prose.
- **Never blame the person.** "That date is in the past" over "you entered an
  invalid date".

## Microcopy patterns

These are the reusable shapes, and they cover most of the strings a project writes.

| Surface | Pattern | Bad | Good |
|---|---|---|---|
| Button | verb plus object | Submit, OK, Go | Save shift, Add role |
| Error | what happened, then what to do | Invalid input | Enter a date after today. |
| Empty state | what this is, then one action | No data | Nothing on the rota. Add the first shift. |
| Destructive | name the thing, name the loss | Are you sure? | Delete the 4pm shift? This cannot be undone. |
| Success | past tense, three words | Successfully saved! | Shift saved. |
| Field hint | the rule, before the error | (nothing) | Use 4 digits, for example 0142. |
| Confirmation | restate the outcome | Done | Break logged for 14:00 to 14:40. |

## The banned list

Words that appear in every product and mean nothing. Name them explicitly so nobody
has to argue about it later:

```text
seamlessly  empower  simply  easily  robust  leverage  world-class  delight
effortless  cutting-edge  revolutionary  next-generation  unlock  supercharge
solution  platform  ecosystem  synergy  best-in-class  state-of-the-art
```

Two more bans worth writing: no adjective in a button label, and no sentence that
would still be true if the product's name were swapped for a competitor's.

## How to test it

Cheap tests that catch most bad copy:

1. **Read it aloud.** Anything you would not say to a colleague is wrong.
2. **The swap test.** Put a competitor's name in the sentence. If it still reads
   fine, the sentence says nothing about this product.
3. **The stranger test.** Show the error to someone who did not cause it. If they
   cannot say what to do next, rewrite it.
4. **The one-sentence test.** If a string needs a second sentence to be true, it is
   two messages and one of them belongs elsewhere.

## What voice.md looks like

Six sections, in this order, no more:

```markdown
# <product> voice

## The voice in one line
<Character, in a sentence a teammate can repeat.>

## The four dials
<Formality, warmth, brevity, authority. Position plus boundary.>

## Tone by situation
<The table, with one real example per row.>

## Mechanics
<Capitalization, contractions, punctuation, person, numbers.>

## Patterns
<Button, error, empty, destructive, success. Good and bad side by side.>

## Banned
<The word list, and the two rules.>
```

Keep it under two pages. A voice doc that runs long gets read once, and a doc that
fits on two pages gets opened every time someone writes a label.

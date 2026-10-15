---
name: 442-prioritize
description: Sorts a raw pile of requirements or ideas into three tiers, P0 (must ship for the project to work), P1 (should ship, high value), and P2 (nice to have, defer or cut first), gives every item a one-line reason, and writes the ranked list to REQUIREMENTS.md at the repo root. Use when a student dumps a list of features with no order, when a spec or brainstorm needs triage before work starts, when a scope cut is needed, or when someone asks what to build first.
---

# Prioritize requirements

A student arrives with a pile of ideas and no order. This skill turns the
pile into three tiers, writes them down, and names the first thing to
build.

A quarter is finite, so the useful output is a decision about order, not a
promise to build everything.

## The tiers

- **P0** must ship for the project to work or be usable. The project is
  broken or unusable without it.
- **P1** should ship. High value; the project still works without it, but
  the experience is weak.
- **P2** nice to have. Defer it, and cut it first when time runs short.

## The three lenses

Every tier call comes from the same three questions, asked in this order.

1. **Risk.** Could this item kill the project if it turns out impossible
   (an API that will not do what you need, a dataset that may not exist)?
   A project-killer is P0 even when it looks small, because the answer
   changes what the rest of the plan is worth.
2. **Dependency.** Does another item need this one first? A prerequisite
   is usually P0, because everything behind it is blocked until it lands.
3. **Value.** How much does the item move the project's stated goal? High
   value puts it at P1 or above; low value drops it to P2.

The lenses settle most items on their own. An item that survives all three
with no clear answer is ambiguous, which is what step 4 is for.

## Steps

### 1. Collect the pile

Ask for the whole list in one go, in any order, unfiltered. Number every
item as it arrives; those numbers carry through the rest of the sort.

Done when every idea the student named is a numbered line, in their words.

### 2. Pin the goal

Value is only measurable against a goal, so write the goal before any
tier: one sentence naming who the project serves and what it does for
them. When the student has not stated it, ask one question and wait for
the answer ("In one sentence, who is this for and what does it do for
them?").

Done when one goal sentence is written down and the student has confirmed
it.

### 3. Place every item

Walk the numbered list and give each item one tier and one line of why,
using the three lenses. The why names the lens that decided it, as in
`P0: signing in is the only way anything saves`. Then recheck the P0 pile:
a P0 count near the size of the list means items have drifted up, so take
the weakest ones and ask whether the project works without them.

Done when every numbered item carries a tier and a one-line reason.

### 4. Ask about the ambiguous items

Sorting always leaves items placed on a guess. Ask about those, one
question at a time, waiting for each answer before the next question, and
re-place only the items that answer touches. An item the student chooses
to leave open keeps its tier with `(assumed: ...)` naming the basis for
the guess.

Done when no tier rests on an unspoken guess, or the guess sits on the
record as an assumption.

### 5. Write REQUIREMENTS.md

Write the file at the repo root, the project's top folder. Update it in
place when it already exists, keeping the student's wording for items that
are already there. Tiers are headings, items are checkboxes so they can be
ticked off, reasons stay to one line:

```
# Requirements

Goal: <the sentence from step 2>

## P0
- [ ] <item>: <why>

## P1
- [ ] <item>: <why>

## P2
- [ ] <item>: <why>
```

Done when REQUIREMENTS.md exists at the repo root with a goal line, the
three tier headings, every item from the list, and a reason on each line.

### 6. Name the first two steps

Order the P0 items: a project-killer first, then whichever prerequisite
unblocks the most other P0 work. Then give the student two next actions,
the first P0 with its why and the step that follows it, in your reply and
under `## Next` in the file.

Done when the reply names two next actions, each with a why, and those two
lines are in the file.

## What's next

Build the first P0 in `REQUIREMENTS.md`; when the rest of the quarter needs
sequencing, call the Skill tool with `442-create-roadmap`.

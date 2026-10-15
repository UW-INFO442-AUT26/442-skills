---
name: 442-create-personas
description: Write 3 to 5 deep, realistic user personas from a project problem statement, so design decisions have someone specific on the other side of them. Use when a student asks for personas, user profiles, target users, audience, or "who is this for", and before roadmap, prioritization, or interface work needs a cast of users to reason about. Interviews once for the problem statement if it is missing and offers to save the result as PERSONAS.md.
---

# Write user personas

A persona is a decision tool, not a decoration. It earns its place when it
changes at least one design decision, which means it has to be specific
enough to argue with. A persona is a **real person you could recognize**:
specific enough that a detail surprises you, and distinct enough that no
two of them are interchangeable. "Busy professional, 30s, likes mobile"
is a cliche, and cliches survive because they are true of everyone and
therefore useful to no one.

## 1. Get the problem statement

If the student pasted a problem statement, use it. If not, ask exactly one
question and wait for the answer:

> Paste your problem statement: the product, who it affects, and what
> those people use today instead.

Ask once. Do not invent a problem statement and do not proceed on a
placeholder. Personas are derived from the problem, so a missing problem
statement means the whole output would be fiction.

Done when: you can state the problem in one sentence that names who has
it, what they do today, and why that falls short.

## 2. Cast 3 to 5 personas

Cast them like an ensemble: every member has a distinct job in the story.
Separate them by their relationship to the problem, not by demographics
alone. The recurring roles:

- the primary user who does the work every day
- the person who approves, pays, or can veto
- the skeptic who resists adoption and says why
- the adjacent professional who refers, hands off, or inherits the output
- the power user who pushes the product past its intended shape

Use 3 personas when one person uses it and one person approves it. Use 5
when using, approving, and paying are three different people, or when the
product crosses a handoff between two teams.

Done when: no two personas could trade places without changing which
decisions follow from the cast, and each one holds a different stance on
the product's central tradeoff (privacy versus speed, control versus
convenience, depth versus simplicity).

## 3. Fill every field for every persona

- **Core identity**: name, age, location, occupation, and a one-line
  archetype that carries the point ("the one who keeps the spreadsheet
  everyone else trusts").
- **Background and context**: their week, their constraints, and the
  tools already in their hands. Name the tools ("a shared Google Sheet
  with three tabs", "SAP through a Citrix window").
- **Goals and motivations**: the goal they would state out loud, plus one
  **hidden goal** they would not (looking competent, avoiding blame, not
  being the last to know, protecting a relationship).
- **Pain points and frustrations**: the functional failure, the emotional
  cost of it, and the **workaround** they use today. The workaround is the
  strongest evidence the pain is real, so name it concretely.
- **Behaviors and decision patterns**: how they evaluate options, who they
  ask before deciding, and what makes them stop, switch, or abandon.
- **Needs and opportunities**: what would have to be true for them to
  change what they do today.
- **Quote**: one line in their voice, using their vocabulary rather than
  the product's vocabulary.
- **Product implications**: one to three decisions this persona should
  shape, written as decisions: "put the export action in the empty state",
  not "cares about exporting".

Done when: every field is filled for every persona with something a
reader could not have guessed from the problem statement alone.

## 4. Stress-test the cast

Run four tests over the whole set and revise until each one passes.

- **Swap test**: if two personas could trade quotes, they are one persona.
  Merge them or recast one.
- **Receipt test**: every claim carries a concrete detail (a tool, a time,
  a number, a habit). Add one wherever it is missing.
- **Tension test**: each persona names what they would trade away and what
  they would never trade. A persona with no tension is a costume.
- **Decision test**: each persona changes at least one design decision,
  and no two change the same decision in the same direction.

Then write one short paragraph on what the cast forces the product to give
up. The cast is useful exactly because it cannot all be satisfied at once,
and that paragraph is where the tension becomes a decision.

Done when: all four tests pass and the paragraph names the tradeoff the
product is accepting.

## 5. Offer to save

Ask: "Want these saved as `PERSONAS.md` in your repo?" If yes, write
`PERSONAS.md` at the repo root: a two-line cast overview, then one `##`
heading per persona with the field names as bold labels.

Done when: the student has the personas either in the conversation or in
the file they chose.

## What's next

Pick the loudest product implication from your cast, name the one screen
or flow it changes, and change it before you build anything else. When you
plan the work, call the Skill tool with `442-create-roadmap` and make each phase
name the persona it serves.

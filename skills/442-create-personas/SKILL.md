---
name: 442-create-personas
description: "Guides a student through building 3 to 5 user personas the way a UX researcher does: settle what the personas must decide, take stock of the evidence, choose the tension and the cast together, then let the agent write the profiles. Use when a student asks for personas, user profiles, target users, or who the product is for, or before roadmap, prioritization, or interface work needs a cast of users to reason about."
---

# Build user personas

A persona is a decision tool. It earns its place by changing at least one
decision, which means it has to be specific enough to argue with. "Busy
professional, 30s, likes mobile" is true of everyone, so it decides
nothing.

This skill is an interview with four human calls in it, then the writing.
The student makes the calls. You make the writing good, consistent, and
fast.

## Who does what

| The call | Who | Why it stays there |
|---|---|---|
| What these personas must decide | student | only they know what is stuck |
| Which evidence counts | student | they know who they talked to |
| The tension the product is betting on | student, from your options | it is a product decision |
| Who is in the cast | student, from your options | it is their product's people |
| The profiles, the prose, the names, the coherence | you | repetitive, and needs one voice |
| The file | you | mechanical |

Three rules for the whole run:

1. **One question per message**, in plain prose, with your recommended
   answer inside the sentence. Let the student type a reply.
2. **Never write a profile the student has not approved the shape of.**
   Cast first, prose second.
3. **If they say "you decide",** name the choice you are about to make in
   one line and get a yes before you move on.

## 1. Ask what these personas must decide

Read [references/brief-questions.md](references/brief-questions.md),
section A, and ask the first question that the student's brief or code
does not already answer. Read the problem statement or `README.md` first
so you never ask for something already written down.

Your question carries a recommendation, built from what you read:

> "These look like they need to settle whether the reminder is opt-in or
> always on. Is that the decision, or is something else stuck?"

**Done when** you can state, in one sentence, the decision this set
exists to settle and who is stuck on it. If the student cannot name one,
say so plainly and stop: personas without a decision are decoration.

## 2. Take stock of the evidence

Ask who they have actually talked to, and what surprised them. Then teach
the three labels once, in a sentence each:

- `told` from a real conversation
- `read` from a survey, a review, an article, or the course material
- `assumed` from pattern matching

Then ask the question that makes the rest honest:

> "The part about the district manager, is that something someone told
> you, or is it your read on how it probably works?"

**Done when** the student has agreed which parts of this cast are
evidence and which are a labeled guess. Both are allowed. Only one may be
presented as research.

## 3. Pick the tension

A cast is built around one tradeoff the product cannot fully satisfy. It
is what makes the personas disagree, and disagreement is the useful part.

Propose two or three tensions that come from the problem, in one message,
each with a sentence on what it would force the product to give up:

> 1. **Speed against auditability.** Fast entry for the counter staff,
>    but the manager cannot see who changed what.
> 2. **One tool against two.** Replace the clipboard and the sheet, or
>    fit between them.
> 3. **Individual against store.** Optimize one person's shift, or the
>    district's comparison across stores.

Ask which one the product is actually betting on, and say which you would
pick and why.

**Done when** the student has named one tension in their own words, and
you have written one sentence on what it forces the product to give up.

## 4. Cast the roles

Cast like an ensemble: each persona has a distinct job in the argument,
separated by their relationship to the problem, not by demographics.

Propose 3 to 5, and for each one give the role, the stance on the tension,
and one concrete detail. Then ask the question that hands it back:

> "That is the cast I would start with. Cut anyone, merge two, or add
> someone you have actually met?"

The roles that recur: the person who does the work every day, the person
who approves or pays, the skeptic who resists and says why, the adjacent
professional who hands work over, the power user who pushes past the
intended shape.

Use 3 when one person uses it and one person approves it. Use 5 when
using, approving, and paying are three different people, or when the work
crosses a handoff.

**Done when** the cast is fixed by the student, every persona holds a
different stance on the tension, and no two could trade places without
changing which decisions follow.

## 5. Give each persona a job

This is the step most persona sets skip, and it is the one that makes them
useful. For each persona, propose one to three decisions they should
shape, written as decisions:

- `Put the discrepancy list on the same screen as the count.`
- `Ask for a login only after the first count is saved.`

Ask the student to keep, change, or delete each one.

**Done when** every persona has at least one decision the student
approved, and no two personas pull the same decision in the same
direction.

## 6. Write the profiles

Now the bulk work is yours. Read
[references/persona-anatomy.md](references/persona-anatomy.md) and fill
every field for every persona, in one pass, in one voice.

- Keep the evidence labels on the details a decision rests on.
- Write the quote in the persona's vocabulary, never the product's.
- Half a page each. A profile that needs a page and a half is two people.
- Do not invent a detail that contradicts what the student told you. If
  you need one and cannot find it, ask one question.

Present all of them in the conversation and ask for a read, before you
save anything.

**Done when** the student has read the profiles and said which lines are
wrong, and you have fixed them.

## 7. Stress test the cast with the student

Run the four tests in
[references/stress-tests.md](references/stress-tests.md) over the whole
set: swap, receipt, tension, decision. Report each failure as a question,
not as a rewrite:

> "Priya and Marcus could trade quotes. Merge them, or is one of them
> missing the thing that makes them different?"

The student decides to merge, recast, or keep. Then write the paragraph
that names what the cast forces the product to give up. That paragraph is
the proof the cast is doing work.

**Done when** all four tests have been run, the student has ruled on each
failure, and the give-up paragraph is written.

## 8. Save `PERSONAS.md`

Ask where it goes: the repo root (the default), `docs/personas.md`, or
nowhere and the conversation is enough. Use
[assets/personas-template.md](assets/personas-template.md) as the shape:
the why block, the cast table, then one `##` section per persona.

**Done when** the file exists where the student chose, and it opens with
what the personas decide and what the cast gives up.

## What's next

Take the loudest decision from the cast and name the one screen or flow it
changes. Then call the Skill tool with `442-create-roadmap` and make each
phase name the persona it serves.

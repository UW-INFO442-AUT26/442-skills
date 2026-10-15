---
name: 442-create-exercise
description: Builds a mobile-first practice exercise on any topic as one self-contained web page, then publishes it to the student's own GitHub account as a public GitHub Pages site and hands back the live link and a QR code. The author picks the interaction that teaches the idea best, which is often not a quiz: a simulation to play with, an order to rebuild, a set of items to sort, a pair of lists to match. Use when a student asks for practice, drills, a quiz, self-testing, or to be quizzed on a topic, or wants notes turned into something to rehearse on their phone.
---

# Build an exercise

Turn a topic into one web page the student finishes on a phone, then publish it
to their own GitHub account and hand back a link.

**Interactivity is the priority.** Before you write a step, ask what the
student should DO to learn this idea, then pick the interaction that makes them
do it. A quiz is right when one answer wins among believable rivals. It is the
wrong tool for a process, a set of families, a trade-off, or anything that
moves. A page the student drives and watches teaches more than a page that asks
them to recall a sentence, whenever the idea is about relations or change.

Two rules hold on every step:

- **Nothing reveals the answer before submit.** Not the prompt, not the option
  list, not a `figure`, not a `widget`.
- **Write simply.** Short sentences. Common words. Explain a term the first
  time it is used. That holds for the page's own copy and for every `prompt`,
  `feedback`, and `misconception` string you write.

Read [references/learning-science.md](references/learning-science.md) before you
write steps. It is the authority for this skill: where it and your taste
disagree about length, order, or feedback, it wins.

## 1. Interview the student

Four questions, one short round, and take their words for the answers:

- **Topic.** What should this be about?
- **Capability.** What is the one thing you must be able to do afterward? Push
  back on a topic-sized answer ("everything about React") until it is one act
  ("decide whether a component should hold its own state").
- **Starting point.** What do you already know about it? This sets how hard the
  first steps are and what counts as a fair wrong answer.
- **Length.** 5, 10, or 20 minutes. That decides the number of steps, not the
  other way round.

**Done when** you can write one sentence for each of the four, and the
capability sentence names something the student can do rather than a subject
they have seen.

## 2. Pick the interaction the capability needs

For each idea the capability touches, ask what the student should do with it,
then take the kind that does it. Often the answer is not a question at all.

| `kind` | What the student does | Reach for it when |
|---|---|---|
| `choice` | Taps one option | One right answer among believable rivals |
| `multi` | Taps all that apply | Several things are true at once, and they must be separated |
| `short` | Types the answer from memory | They must produce the word or the number with no options in front of them |
| `order` | Taps the items into the right order, with undo | The sequence, or the order of decisions, is the idea |
| `sort` | Puts each item into a bucket | Items fall into two or three families |
| `match` | Pairs each left item with a right item | Two lists are easy to confuse, so they must be paired up |
| `explore` | Plays with a `widget` and taps Continue | The idea has parts, a trade-off, or a number that moves |

`explore` is the interactive one, and it is **ungraded**: nothing is scored on
it and it never counts toward `minCorrect`. Put it first on an idea the student
has not handled before, so they play before you explain (rule 13).

Reach for a `widget` when a number, a range, or a trade-off carries the idea,
and for a `figure` when structure carries it. Mark the parts of a figure with
`data-reveal` so the student can tap or hover to name them (rule 16).

**Done when** every idea in the capability has a kind chosen for it, at least
one step is something other than a question, and you can say in one line why
each kind fits its idea.

## 3. Write the spec

Copy [assets/exercise.spec.json](assets/exercise.spec.json) to
`exercises/<slug>/spec.json` and replace the worked example with this topic.
Its `_guide` key documents every field, so you do not need another reference.

The rules that are not negotiable:

- **6 to 12 steps** for a 10 minute exercise. Fewer for 5 minutes.
- Every graded step carries `feedback` that explains **why**, not whether, and
  `choice` and `multi` carry a `misconception` naming the tempting wrong
  belief.
- **Interleave.** Neighbouring steps change kind, and they change sub-topic
  through `tag`, instead of blocking all the questions on one idea together.
  A `tag` is for you alone: the page never renders it, and the student never
  sees it.
- **Fade.** An early step on a new idea may carry a `hint`. The last step on
  that idea is a `short` recall with no hint.
- `meta.criterion` states the bar in the student's words, and
  `meta.criterion.minCorrect` agrees with that text. It counts graded steps
  only.
- No prompt, option list, figure, or widget gives an answer away before
  submit.

Then check it with [scripts/validate-spec.mjs](scripts/validate-spec.mjs):

```bash
node scripts/validate-spec.mjs exercises/<slug>/spec.json
```

It prints one line and exits 0 when the spec follows the contract. Otherwise it
prints every problem it found, one per line, and exits non-zero. Fix all of
them before you build the page.

**Done when** the validator exits 0, every step has a prompt, a kind, a
correct answer, feedback, and the misconception its kind needs, no answer
appears in its own prompt, and the step count fits `meta.minutes`.

## 4. Build the page

Make the folder for the exercise if you have not already, and copy the template
[assets/exercise.html](assets/exercise.html) into it:

```bash
mkdir -p exercises/<slug>
cp ~/.agents/skills/442-create-exercise/assets/exercise.html exercises/<slug>/index.html
```

Then replace the JSON inside the `<script type="application/json" id="spec">`
tag of `exercises/<slug>/index.html` with your spec, using the Edit tool on
everything between the tags. The page reads that island at load and needs no
network access.

Run the validator again, now that `spec.json` sits beside `index.html`. It
checks the page too, for the two things the page must not carry: a long dash,
and a rendered tag chip or the removed header badge.

The template is already finished: brand tokens are vendored inline from
`442-brand`, it makes no network requests, every control is at least 44 by 44
px, and it lays out for a 360 px phone column first. It renders all seven
kinds, the `figure` types, the `data-reveal` toggle, and the `widget` controls
from the spec. Ship it as it is. If you need a visual element it does not have,
call the Skill tool with `442-brand` and take the tokens from there.

**Done when** opening `exercises/<slug>/index.html` shows the title, the intro
with the step count, and step 1, and nothing on the page reveals an answer
until a step has been submitted.

## 5. Publish

Run the publisher [scripts/publish.mjs](scripts/publish.mjs) from the skill
folder. If the skills are installed in `~/.claude/skills` rather than
`~/.agents/skills`, use that path; both point at the same files. `--name` is
`meta.slug`, and it becomes the repo name and so the URL.

```bash
node ~/.agents/skills/442-create-exercise/scripts/publish.mjs exercises/<slug> --name <slug> --dry-run
node ~/.agents/skills/442-create-exercise/scripts/publish.mjs exercises/<slug> --name <slug>
```

The script makes the folder a git repo on `main`, commits it, creates
`<you>/<slug>` as a public repo, pushes, turns on GitHub Pages, and prints the
URL plus a QR code. It needs the GitHub CLI signed in (`gh auth login`), and it
stops with a clear message when `gh` is missing or not signed in. `--dry-run`
prints the plan and touches nothing.

**Done when** the second command exits 0 and prints
`Published: https://<you>.github.io/<slug>/`.

## 6. Hand over the link and the QR

Give the student three things, in this order:

1. The URL as plain text on its own line, so it copies cleanly.
2. The QR code the script printed, which is for their phone camera.
3. One instruction: do it now on the phone, then redo the misses tomorrow.

GitHub builds Pages once, so the link goes live about a minute after the
command. A 404 for the first minute is normal; reload before believing it
failed.

**Done when** the student has the URL, has the QR, and knows the page is theirs
to keep, edit, and re-publish.

## What's next

Open the link on your phone and finish every step once before you look anything
up.

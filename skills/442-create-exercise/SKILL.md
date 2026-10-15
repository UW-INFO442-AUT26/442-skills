---
name: 442-create-exercise
description: Builds a mobile-first practice exercise on any topic as one self-contained web page, then publishes it to the student's own GitHub account as a public GitHub Pages site and hands back the live link and a QR code. Use when a student asks for practice, drills, a quiz, self-testing, or to be quizzed on a topic, or wants notes turned into something to rehearse on their phone.
---

# Build an exercise

Turn a topic into one web page the student finishes on a phone, then
publish it to their own GitHub account and hand back a link. The page
makes them answer before it shows anything, which is the part that does
the work.

Read [references/learning-science.md](references/learning-science.md)
before you write questions. It is the authority for this skill: where it
and your taste disagree about length, order, or feedback, it wins.

## 1. Interview the student

Four questions, one short round, and take their words for the answers:

- **Topic.** What should this be about?
- **Capability.** What is the one thing you must be able to do afterward?
  Push back on a topic-sized answer ("everything about React") until it
  is one act ("decide whether a component should hold its own state").
- **Starting point.** What do you already know about it? This sets how
  hard the first steps are and what counts as a fair wrong answer.
- **Length.** 5, 10, or 20 minutes. That decides the number of steps, not
  the other way round.

**Done when** you can write one sentence for each of the four, and the
capability sentence names something the student can do rather than a
subject they have seen.

## 2. Write the spec

Copy [assets/exercise.spec.json](assets/exercise.spec.json) and replace
the worked example with this topic. Its `_guide` key documents every
field, so you do not need another reference.

The rules that are not negotiable:

- **6 to 12 steps** for a 10 minute exercise. Fewer for 5 minutes.
- Every step carries `feedback` that explains **why**, not whether, and a
  `misconception` naming the tempting wrong belief.
- **Interleave.** Neighbouring steps alternate `choice` and `short`, and
  alternate sub-topics through `tag`, instead of blocking all the
  questions on one idea together.
- **Fade.** An early step on a new idea may carry a `hint`. The last step
  on that idea is a `short` recall with no hint.
- `meta.criterion` states the bar in the student's words, and
  `meta.criterion.minCorrect` agrees with that text.
- No `prompt` contains its own answer, and no option list gives it away.

**Done when** every step has a prompt, a kind, an answer, feedback and a
misconception, the answer appears in no prompt, and the step count fits
`meta.minutes`.

## 3. Build the page

Make a folder for the exercise and copy the template into it:

```bash
mkdir -p exercises/<slug>
cp ~/.agents/skills/442-create-exercise/assets/exercise.html exercises/<slug>/index.html
```

Then replace the JSON inside the `<script type="application/json"
id="spec">` tag of `exercises/<slug>/index.html` with your spec, using
the Edit tool on everything between the tags. Save the same spec beside
it as `exercises/<slug>/spec.json` so the exercise can be rebuilt and
edited later.

The template is already finished: brand tokens are vendored inline from
`442-brand`, it makes no network requests, every control is at least
44 by 44 px, and it lays out for a 360 px phone column first. Ship it as
it is. If you want a visual element it does not have, call the Skill tool
with `442-brand` and take the tokens from there.

**Done when** opening `exercises/<slug>/index.html` shows the title, the
intro with the step count, and question 1, and no answer is visible on
the page until a question has been answered.

## 4. Publish

Run the publisher from the skill folder. If the skills are installed in
`~/.claude/skills` rather than `~/.agents/skills`, use that path; both
point at the same files. `--name` is `meta.slug`, and it becomes the repo
name and therefore the URL.

```bash
node ~/.agents/skills/442-create-exercise/scripts/publish.mjs exercises/<slug> --name <slug> --dry-run
node ~/.agents/skills/442-create-exercise/scripts/publish.mjs exercises/<slug> --name <slug>
```

The script makes the folder a git repo on `main`, commits it, creates
`<you>/<slug>` as a public repo, pushes, turns on GitHub Pages, and
prints the URL plus a QR code. It needs the GitHub CLI signed in
(`gh auth login`), and it stops with a clear message when `gh` is
missing or not signed in. `--dry-run` prints the plan and touches
nothing.

**Done when** the second command exits 0 and prints
`Published: https://<you>.github.io/<slug>/`.

## 5. Hand over the link and the QR

Give the student three things, in this order:

1. The URL as plain text on its own line, so it copies cleanly.
2. The QR code the script printed, which is for their phone camera.
3. One instruction: do it now on the phone, then redo the misses
   tomorrow.

GitHub builds Pages once, so the link goes live about a minute after the
command. A 404 for the first minute is normal; reload before believing
it failed.

**Done when** the student has the URL, has the QR, and knows the page is
theirs to keep, edit, and re-publish.

## What's next

Open the link on your phone and answer every question once before you look anything up.

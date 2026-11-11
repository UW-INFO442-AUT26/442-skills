---
name: 442-acceptance
description: "Runs an acceptance pass over a whole web app: maps every feature, screen, and control into a checked flow map, drives each flow in a real browser, records a video of every run as evidence, and marks each flow pass, bug, unexpected, or blocked. After the pass it fixes the flows the student picks, one at a time, and records a before and after pair for review. Uses 442-browser for the browser work. Use when the student asks to test the whole app, find what is broken, run an acceptance or end to end pass, check every feature before a milestone, demo, or final presentation, or prove the app works."
---

# Run the whole app

A milestone is a claim that the app works. Nobody has clicked every control
in it, so the claim rests on hope. This skill replaces the hope with a map:
every flow the app offers, each one driven in a real browser, each one
recorded, each one marked.

Two rules hold the whole run together:

- **One flow is one row.** The map is the record of what was tested, so a
  flow that is not in it was not tested.
- **The pass records, it does not repair.** Finding a bug and fixing it in
  the same breath hides the bug from the student and hides the fix from the
  next flow. Repairs happen after the pass, on the flows the student picks.

The browser work is [`442-browser`](../442-browser/SKILL.md). Read it once
before starting; this skill never repeats its commands.

The one script here runs as `node <this-skill>/scripts/flows.mjs`, where
`<this-skill>` is `~/.agents/skills/442-acceptance` for a global install, or
`.omp/skills/442-acceptance` in a project install.

## 1. Map every flow

Read the app's source, not its idea of itself. The router, the nav and layout
components, every form, every button with a handler, and the empty, error,
and signed-out states. Write them into `acceptance/flows.md`.

The bar is the point of this step: **every route and every control that does
something appears in at least one flow.** A list of the dialogs the
signed-in user can open is a good sign; a list of five pages is not, because
a page is what the code has, and a flow is what the user does with it.

[`references/flows.md`](references/flows.md) has the row format, the ID
scheme, and the enumeration checklist that catches the flows people forget.

**Done when** every route and every control in the source is in a row, and
`node <this-skill>/scripts/flows.mjs` runs without an error.

## 2. Prove the map is reachable

Start the app and open each entry point once.

```bash
npm run dev        # the URL it prints, usually http://localhost:5173
```

A wrong URL, a route that 404s, or a screen that needs a sign-in turns every
recording after it into wasted footage. Two minutes here saves an hour there.

Use the built page when the milestone is a deploy, because
`npm run build && npm run preview` is where a missing asset or a hardcoded
`localhost` shows up.

**Done when** every route in the map has been opened once and no route
answers with a blank page or a router error.

## 3. Drive every flow, and record every run

Work down the map in order: entry and sign-in first, then each feature, then
the settings and sign-out flows. Sign-in flows first keeps the session usable
for the rest.

Each flow gets its own folder and its own recording:

```bash
mkdir -p acceptance/evidence/F03-add-a-task
npx -y @playwright/cli@latest video-start acceptance/evidence/F03-add-a-task/run.webm --cursor
```

Stop the recording, then read the verdict off it. A flow that needs a clean
state starts from a fresh `open` or a `reload`, so one flow's leftover state
does not pass for another flow's success.

**If your harness can dispatch subagents, dispatch one per flow or per
screen.** Hand each one the row, the URL, the expected result, the folder,
and the rule that it records but does not fix. Keep one owner for
`flows.md`: parallel writers to one file lose rows. Without subagents, run
them in sequence yourself, and do not shorten the map to save time.

**Done when** every row has a recording, and each recording shows the flow
from its first action to its observable result.

## 4. Mark each flow

One status per row, and the reason under the table.

| Status | Means |
| --- | --- |
| `pass` | Did what the row expects, first try, no console error from the app's own code |
| `bug` | The thing is broken, or the console threw |
| `unexpected` | It works, but not the way a user would expect |
| `blocked` | Could not be tested at all, and the detail says why |
| `fixed` | Repaired after the pass, awaiting the student's review |
| `approved` | The student watched the after recording and agreed |

`pass` is the only status that ends a row's work, and it needs the recording
that proves it. A flow that works on the second attempt, after a reload, is
not a pass; half the bugs in a student app are the first attempt.

**Done when** `node <this-skill>/scripts/flows.mjs` reports counts, every row it calls
open has a detail section, and no row says `pass` without a recording.

## 5. Hand the map over and ask

```bash
node <this-skill>/scripts/flows.mjs
```

Lead with the counts, name the flows that failed in one line each, and say
where the recordings are. Then ask the one question this whole run exists to
ask:

> Which of these do you want me to fix?

Take the answer as the work order. A flow the student leaves open stays open,
and that is a decision, not an oversight.

**Done when** the student has the counts, the locations, and one question,
and no code has changed yet.

## 6. Fix what was picked, one at a time

Per flow: reproduce it in the browser, find the cause, change the code, then
record the same flow again. Move the original recording to
`acceptance/fixes/<id>-<slug>/before.webm` and record the rerun as
`after.webm` beside it, so the pair is one folder. Mark the row `fixed`.

[`references/fixing.md`](references/fixing.md) has the loop, the pair
assembly, and the review gate.

**Done when** each fixed row has a before and an after recording, and the
after recording shows the expected result from step 1.

## 7. Ask for the review, then close the row

Send the student the before and after. `approved` is their word, given after
watching: the row moves only when they say so, and the reason goes in the
detail section.

**Done when** every `fixed` row is either `approved` by the student or
reopened as `bug` with their words recorded.

## What's next

Commit `acceptance/flows.md` with the code. Next milestone, run the same map
again: the rows that are already `approved` are regression tests with a video
attached, and the run is faster than the one that made it.

---
name: 442-create-roadmap
description: Turns an INFO 442 project brief and team list into an execution-ready development roadmap: phases and milestones, a sized task breakdown with dependencies, team allocation with an explicit reason per assignment, a week-by-week plan with buffer, risks with mitigations, and an execution strategy. Use when a team is starting a project, asking for a work plan or schedule, dividing tasks among members, or planning around milestone deadlines and busy weeks.
---

# Build a development roadmap

A roadmap turns "we want to build X" into milestones that each have an
owner and a date, so the team hits the hard parts in week two instead of
the night before the demo. Plan like a senior technical program manager:
pragmatic, not idealistic. The plan exists to be executed, so the load on
each member has to be survivable.

INFO 442 defaults (state them as assumptions when the brief does not say
otherwise): a team of five students, React on the front end, Firebase for
auth, data, and hosting, and one deliverable per course milestone.

## Steps

### 1. Gap-check the brief and the team list

Read what the student gave you. Every roadmap needs these inputs. If one
is missing, ask for it. Batch the questions into one message instead of
interrogating one at a time.

- Goal: the user problem the app solves, in one sentence.
- Success criteria: what "done" looks like at the final milestone, as
  observable outcomes, not vague quality words.
- Scope: the feature list, split into must-ship and nice-to-have.
- Timeline: the course milestone dates and any hard deadline.
- Team: for each of the five members, name, strengths, weaknesses, and
  hours available per week, including known busy weeks (midterms, other
  courses, travel).
- Constraints: stack, course rules, no budget, anything already built
  (repo, prototypes, prior milestones).

**Completion:** every input above is either supplied by the student or
restated as an explicit assumption in the next step.

### 2. Make assumptions explicit

For each missing input, choose the realistic value and write it down
where the team can disagree with it. A silent assumption is the failure
mode this step exists to prevent. Keep an "Assumptions" list at the top
of the roadmap, one line each. When you default to a five-person, 10
week, React plus Firebase project, say so.

**Completion:** the roadmap opens with an Assumptions list, and every
gap from step 1 appears in it.

### 3. Set the phases and their milestones

Use five phases: setup, core development, iteration, polish, deployment.
For each phase write its deliverables and the single milestone that ends
it, with a target week. A milestone is a demoable state, not a date on a
calendar: "auth works end to end and the walking skeleton is deployed",
not "finish backend".

Front-load risk. The setup phase ends with a deployed walking skeleton,
one real feature wired through React, Firebase, and hosting, so
integration problems surface early.

**Completion:** five phases, each with deliverables and one milestone,
each milestone tied to a week.

### 4. Sequence the work: dependencies and parallel tracks

Order the features by what must exist before what. Draw the critical path
(the chain of tasks where a slip delays the whole project) and mark it
clearly. Then find genuinely independent tracks, for example auth and
data modelling, that can run in parallel across members.

Where a task hides an unknown, insert a spike: a time-boxed
investigation whose deliverable is a decision, not code.

**Completion:** every task has its dependencies named, the critical path
is marked, and at least two parallel tracks are identified.

### 5. Break the work into tasks with relative sizes

Split features into tasks a single member can finish in one sitting.

- **S** roughly half a day.
- **M** roughly a day.
- **L** two or more days, and it should probably be split further.

Sizes stay relative to each other; do not convert them to hours. Give
each task an ID, a one-line description, its size, and its dependencies.
If a task has more than two dependencies, it is a sign it should be
split.

**Completion:** every must-ship feature is broken into sized tasks, each
with its dependencies listed.

### 6. Allocate the team, with a reason per assignment

Assign each task an owner. State why in one clause: a strength it uses,
a weakness it grows, or the availability that makes it fit. Balance the
load so no member carries more L tasks in a given week than the others
carry combined, and nobody is scheduled past their stated hours. Pair a
weakness with a strength: if a member is new to Firebase security rules,
buddy them with the member who is not.

Keep one member as the integration owner for merges and the deploy, and
rotate the demo driver so everyone presents at least once.

**Completion:** every task has an owner, every assignment has a stated
why, and no member is overloaded in any week.

### 7. Write the week-by-week plan

Lay the tasks onto the course weeks in a table: week, focus, each
member's task that week, and the milestone due. Mark known busy weeks and
reduce the load there instead of pretending it is free. Keep a buffer of
about 20 percent of each phase, and place a buffer week before every hard
deadline. The plan should show the critical path finishing before the
last deadline, not on it.

**Completion:** every week from kickoff to the final milestone has a row,
busy weeks are reflected, and buffer is reserved before each deadline.

### 8. Name the risks and their mitigations

List the five to eight risks most likely to sink this project, given the
actual team and stack. For each, give the risk, why it matters, the
mitigation, and an owner. Cover at least: scope creep, a member's
availability collapsing, Firebase cost or rule mistakes, integration
breakage, and the demo failing live.

**Completion:** every risk has a why-it-matters, a concrete mitigation,
and a named owner.

### 9. Define the execution strategy

State how the team works day to day:

- Git workflow: feature branches, one task per branch, one PR per task.
- Reviews: one teammate reviews every PR, never the author, before merge
  to main.
- Communication: a fixed weekly standup plus one async channel, with
  blockers raised the day they appear.
- Testing and QA: a manual smoke checklist run before each milestone and
  Firebase security rules checked before any data feature ships.
- Demo checkpoints: at the end of each phase, demo the milestone to each
  other and to the instructor if the course allows.

**Completion:** each of the five areas is specified concretely enough
that a new member could follow it without asking.

### 10. Assemble the roadmap and offer to save it

Emit clean Markdown with headers, tables, and bullets, in this section
order: Assumptions, Phases and Milestones, Dependencies and Parallel
Tracks, Task Breakdown, Team Allocation, Week-by-Week Plan, Risks and
Mitigations, Execution Strategy.

Then offer to write it to `ROADMAP.md` in the student's repo, and write
it there if they agree.

**Completion:** the full roadmap is delivered in the section order above,
and the student has been offered the file.

## What's next

Take the roadmap to your team, fill in the two or three assumptions they
push back on, and assign the first milestone's tasks at your next
standup.

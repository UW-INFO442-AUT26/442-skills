---
name: 442-grill
description: A one-question-at-a-time decision interview that turns a vague idea into a written spec. It triages which decisions need a human, researches the rest itself, proposes a recommended answer to each question, and keeps a running list of what was decided. Use when an idea is fuzzy or missing requirements, when a student asks where to start on a project, or before design work begins.
---

# Grill an idea into a spec

A grill is a decision interview. You are the interviewer and the student is
the decision maker: you walk their fuzzy idea one question at a time, and
every question arrives with your recommended answer. It is worth the ten
minutes because an undecided question does not stay undecided. It gets
answered by accident while someone writes code, and undoing that costs an
afternoon. The grill ends with a `SPEC.md` the student can build against.

Resolve decisions only. Design and implementation are the next conversation,
not this one.

## Steps

1. **Pin the problem in one line.** Ask what they are building and who it is
   for, in a sentence. Say it back in your own words and name the outcome they
   want.
   *Done when:* the student confirms your one-line problem or corrects it.

2. **Triage before you ask anything.** List the decisions you can see in the
   idea, then sort each one into a pile: obvious, so it is skipped; answerable
   from the code or the docs, so you find the answer yourself; a small detail
   you can choose and announce in one line; or genuinely consequential or
   ambiguous, so it becomes a question. Only the last pile is asked.
   *Done when:* the question list holds only decisions that need a human, and
   the pile you are answering yourself is named in one line.

3. **Research before you ask.** Read what informs the current question first:
   the assignment brief, `README.md`, the existing code, any docs the project
   keeps. Then ask in this shape: "I'd pick X because `<fact>` unless you see a
   reason not to." The recommendation is a starting point, not the answer.
   *Done when:* the question you ask carries the facts you found and the answer
   you would choose.

4. **Offer genuine options only.** Two or three real approaches that a
   reasonable engineer could defend. An option that cannot win on its merits is
   a strawman, and a strawman makes your recommendation look free when a real
   trade-off is at stake.
   *Done when:* every option you list could be chosen.

5. **Keep the running list.** After each answer, restate the decisions so far in
   one short block: the decision, the choice, and the student's reason. Do this
   in the conversation after every answer, so a wrong turn shows up while it is
   still cheap.
   *Done when:* the list shows every decided question with the reason behind
   it.

6. **One question per exchange, then check the tree.** Wait for the answer
   before opening the next branch, so the student never faces a wall of
   choices. If they answer several at once, log each one and skip what is now
   covered. If they say "you decide", name the choice you are about to make and
   get a yes first. When the branches run out, ask whether any consequential
   question is left.
   *Done when:* no consequential question remains unasked, and every question
   you did ask has an answer.

7. **Write the spec.** Save `SPEC.md` at the project root, or extend
   `requirements.md` if the project already keeps requirements there. Three
   sections, in this order:

   ```markdown
   # <project> spec

   ## Problem
   <the one-line problem and who it serves>

   ## Decisions
   - <decision>: <choice>. Why: <the student's reason>.

   ## Open questions
   - <question>. Who can answer it: <person or source>.
   ```

   *Done when:* the file exists with all three sections, every decision carries
   its reason, and every open question names who or what can close it.

8. **Hand back.** Read the spec back in three lines and give the student one
   named next action. An open question goes to the person listed beside it. A
   settled problem goes to planning: Call the Skill tool with `442-create-roadmap`.
   *Done when:* the student can name their single next step without asking you.

## What's next

Put your `SPEC.md` where your team can see it, then Call the Skill tool with
`442-create-roadmap` to turn it into a week-by-week plan.

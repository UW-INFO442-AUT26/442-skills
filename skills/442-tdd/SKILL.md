---
name: 442-tdd
description: "Test-first development for INFO 442 code, run one behavior at a time: list the behaviors, write one test, watch it fail, write the smallest code that passes, refactor with the suite green, then take the next one. Coaches the student through every pass out loud: the red run quoted, the change named, the green run shown, then a closing line on what the pass did and what is next. Adapts to the stack (React, JavaScript, Firebase) and sets a runner up when the project has none. Use when adding a feature, fixing a bug, or changing behavior in a React, JavaScript, or Firebase project, or when the student asks for tests, TDD, vitest, or proof that a change works."
---

# Test first

Every line of production code arrives because a test was red and demanded it.
That is the whole discipline, and it is what makes the suite worth trusting:
there is nowhere for untested code to hide, because code that nothing asked
for was never written.

The suite is not there to please a QA group and not to prove the app works.
It is there so you can **refactor**. With a suite you trust, ugly code is a
thing you clean up on a Tuesday. With a suite you doubt, every cleanup is a
gamble, so nobody touches the mess, and it rots until the team is afraid of
its own work. A suite you can trust is the only thing that lets you look at
code you wrote and say "that looks like a mess" and then fix it without fear.

A test written after its code passes on the very first run, so nobody has seen
it catch anything. It is a description of what the code happens to do, not a
demand for what it should do. When you find one, delete it and write it first,
or accept that the line it covers is untested.

Work one behavior per pass. A request holding three behaviors is three trips
around the loop, each leaving the suite green.

## What the student sees

The student is learning this loop, and they cannot see your terminal. A pass
that runs quietly looks like files changing for no reason, and the one lesson
worth teaching, that the red run came before the code, is exactly the part
they miss. So every pass produces three messages, at three moments, in this
shape:

```text
It "submitting with no title shows Title is required" is red.

  $ npm test -- src/TitleField.test.jsx
  FAIL src/TitleField.test.jsx
  AssertionError: expected '' to be 'Title is required'
    at src/TitleField.test.jsx:9:42
```

Then the change, and the run it turned green:

```text
Green: TitleField now renders the error paragraph when title is empty.
  $ npm test
  Test Files  3 passed (3)
       Tests  12 passed (12)
```

Then, once the refactor is done or skipped:

```text
Pass done. TitleField renders "Title is required" for an empty title, one
test added, suite green, refactor skipped because the change was one line.
Next: "a saved draft with an empty title keeps the previous title".
```

The rules behind the shape:

- **Quote the output, do not describe it.** "The test fails" is a claim. The
  `AssertionError` line is proof, and proof is what makes a student trust the
  loop instead of tolerating it. Three to six lines of output, not the whole
  log.
- **Send the red message before you write the implementation.** It is the
  moment the loop is won or lost, and it is unpublishable after the fact.
- **Name the change in one clause.** What the code now does, not which file
  you opened.
- **Close the pass with the count and the next line.** That closing message is
  what turns a run of edits into a lesson: one behavior, one test, suite
  green, here is what is next.

When a pass needs a decision, ask it as one plain sentence in the
conversation and wait for the reply, because a picker hands you a click where
you wanted the student's words.

**Done when** a student who read nothing but your three messages could say
what was tested, what went red, what changed, and what they would see next.

## 1. List the behaviors

Write the list before writing anything else: every behavior the request
contains, one line each, in words a user would use.

> Submitting the form with no title shows "Title is required".
> Submitting a saved draft with an empty title keeps the previous title.

Split on "and". "Users can add a task and delete one" is two lines and two
passes. For a bug, the line is the correct behavior, not the symptom:
"saving keeps the previous title", not "fix the save bug".

Show the list to the student with its count, then take the top line.

**Done when** the list names every behavior the request contains, each line
holds one observable outcome, the student has seen it, and the first line is
small enough that one test can state it.

## 2. Get a green baseline

Read `package.json` for a `test` script, then look for `vitest.config.*`,
`jest.config.*`, or existing `*.test.*` files.

- **Runner present**: use it and leave it alone. Run the whole suite now, in
  front of the student, and quote the result. That baseline is what tells you
  whether a failure later is yours.
- **No runner**: recommend the default for the stack in one sentence and ask
  in the same message, so they answer with a word instead of a search. A
  freshly scaffolded Vite React project has none.
  [`references/test-runners.md`](references/test-runners.md) has the install
  and config for Vitest with React Testing Library, `node:test` for plain
  JavaScript, and the Firebase Emulator Suite.

**Done when** one command runs the whole suite, you have run it, it was green,
and the student saw the output.

## 3. Red: one test, run it, read the failure

One test for the top line of the list, named with that line. Then run it,
alone first, so the output is only about this behavior:

```bash
npm test -- src/TitleField.test.jsx     # vitest or jest, one file
node --test src/title.test.js           # node:test, one file
```

Assert on what the outside sees, never on how the code is built:

- **React**: render the component, then assert on screen text and roles
  (`screen.getByRole`, `screen.getByText`). Props in, visible output out.
- **JavaScript**: call the exported function and assert its return value, or
  the state it changed.
- **Firebase**: call your own module's function and assert what it returns or
  writes. The emulator is right for a real query or a transaction, and the
  assertion stays on your boundary rather than on SDK internals.

Then run the whole suite. Two failures mean two passes, and you have started
the second too early.

The failure has to come from your assertion. A typo, a missing import, or a
file the runner never collected is a broken test, not a red one: fix it and
run again.

A test that passes on its first run stops the pass. Either the behavior
already exists, so the line comes off the list instead of getting a test, or
the assertion is weaker than the sentence, so tighten it until it fails for
the reason the sentence describes. The one thing it does not become is a test
nobody saw fail.

**Done when** the output shows this one test failing on its own assertion,
you have sent the student that behavior and that quoted line, and you can say
in one sentence why it fails. The message goes out before step 4 begins: red
first, then the code, or the loop did not happen.

## 4. Green: the smallest code that passes

Write the least code that makes the assertion pass, and no more. A hardcoded
return is fine when it is what the one test asks for; the next behavior is the
next pass, and it is what turns the constant into real logic. Options, extra
cases, and generalization are code for behaviors nobody has tested yet.

Run the new test, then the whole suite. Write no production code this pass
after the suite goes green, because anything added now arrives without a test
asking for it.

If the smallest pass drags in code that has nothing to do with the sentence,
the sentence held more than one behavior: go back to step 1 and take the
smaller one.

**Done when** the test that was red a moment ago passes, the whole suite is
green, you can name the line that made the difference, and the student has the
green run in front of them: the command and the pass counts, in the same
message as the change.

## 5. Refactor, and prune the tests

Now, and only now, improve the code: names, duplication, and where each piece
lives. Behavior does not change. One edit at a time, suite after each, so a
red suite points at the edit that caused it.

Hold the tests to the same bar. Each one names a behavior. Delete a test that
pins something incidental, an exact call count, a private helper, a CSS class,
or a snapshot of markup nobody decided, because it breaks on a rename and
teaches nothing. Deleting a test is safe here in a way it will never be
later: you watched this behavior's test fail, so you know what it catches.

**Done when** the suite is green after the last edit, every remaining test
name describes an outcome a user could notice, and if there was nothing worth
changing you have said so in one clause instead of skipping the step silently.

## 6. Say what the pass did

Send the closing message. It is one short block, and it is the part the
student keeps:

```text
Pass done. TitleField renders "Title is required" for an empty title, one
test added, suite green, refactor skipped because the change was one line.
Next: "a saved draft with an empty title keeps the previous title".
```

Say what changed for the user, how the suite moved, what the refactor did or
why it was skipped, and what comes next. No praise and no summary of the
conversation, because the student already read that.

Then paste it nowhere and edit nothing: the message is the record until the
commit at the end.

**Done when** the message has been sent and it names the behavior, the suite
state, the refactor, and the next line.

## 7. Next line, or stop

Mark the behavior done in the list, take the next line, and go back to step 3.

Stop when the list is empty, not when the session is long. Then report the
count in one line: how many behaviors, how many tests, and that each test was
seen failing before the code existed.

Do not ask permission between passes. The narration is the check-in, and the
only two places you stop for the student are a decision in step 1 and a runner
in step 2.

**Done when** every line in the list has a test that was watched failing, and
the student can see the whole list ticked off.

## The stop rules

These hold on every pass, whatever the deadline says:

- No production code without a red test in this pass. If a line got in
  another way, delete it or write the test that demands it.
- One red test at a time. A second test while the first is red means the
  first one is no longer driving the code.
- Refactor with the suite green, never while it is red, and never in the same
  edit as a new behavior.
- A test that has never failed is fixed or deleted. Keeping it is a green
  light over code nobody checked.
- Every test name is a behavior. A name like `it("calls setTitle")` is a
  rewrite, because it pins how the code works instead of what a person sees.
- A request with an "and" in it is two passes. Say so before starting.
- The red message goes out before the implementation exists. If code went in
  first, revert it, take the test red again, and send the failure: a pass the
  student did not watch go red is a pass they have to take on faith.
- No test for the next line until the pass's closing message is sent. The seam
  between passes is where the lesson lands, and it is the first thing dropped
  when the work gets busy.

## What's next

Run the suite one last time in front of the student, then commit the test and
the code together, with the behavior named in the message:

```bash
git add -A && git commit -m "Add title validation, tested first"
```

The history is the argument for the next pass: a commit whose test failed in
the commit before it is the one thing that proves the loop was run.

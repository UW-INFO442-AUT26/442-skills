---
name: 442-tdd
description: Test-first development for INFO 442 code. Write one failing test that states the behavior (red), make it pass with the smallest change (green), then refactor with the suite still green. Adapts to the project's stack (React, JavaScript, Firebase) and test runner, and sets one up when the project has none. Use when adding a feature, fixing a bug, or changing behavior in a React, JavaScript, or Firebase project, and when the student asks for tests, TDD, vitest, or proof that a change works.
---

# Test first

Drive one change through the loop, one test at a time:

- **red**: write a test for the behavior, run it, watch it fail for the right reason.
- **green**: write the smallest code that makes it pass.
- **refactor**: clean the code up with the test still passing.

The test comes first. A test written after the code has never been seen to fail, so nothing tells you it detects anything; a test you watched fail proves the assertion can catch the behavior's absence. That is the whole reason to pay the cost of writing it first.

Work one behavior per pass. A request with three behaviors is three trips around the loop, each leaving the suite green.

## 1. Name the behavior in one sentence

Ask what the user can do after this change that they cannot do now, and answer with something observable:

> Submitting the form with no title shows "Title is required".

For a bug, name the correct behavior in the same shape: "Saving a draft with an empty title keeps the previous title". Pick the smallest behavior that is worth a test and would fail today.

Done when: one sentence names one observable outcome, with no "and" holding a second outcome inside it.

## 2. Find the test runner, or set one up

Read `package.json` for a `test` script, then look for `vitest.config.*`, `jest.config.*`, or existing `*.test.*` files.

- **Runner present**: use it. Run the suite once now, before touching anything, and note what passes. That baseline is what tells you later whether a failure is yours.
- **No runner**: ask the student which one they want, recommending the default for their stack. A freshly scaffolded Vite React project has none. [`references/test-runners.md`](references/test-runners.md) has the install and config for Vitest with React Testing Library, `node:test` for plain JavaScript, and the Firebase Emulator Suite.

Done when: one command runs the whole suite, you have run it, and it is green before your change.

## 3. Red: write one failing test

Name the test with the sentence from step 1. Add one test this pass: with a batch of new tests you cannot tell which assertion is driving the code. Assert on what the outside sees, never on how the code is built:

- **React**: render the component, then assert on what is on screen (`screen.getByRole`, `screen.getByText`). Props in, visible output out.
- **JavaScript**: call the exported function and assert its return value, or the state it changed.
- **Firebase**: call your own module's function and assert what it returns or writes. Use the emulator for behavior that is really a query or a transaction, and keep the assertion at your boundary rather than on SDK internals.

Run it. It must fail, and the failure must be your assertion, not a typo, a missing import, or a test the runner never collected. If it passes, the behavior already exists or the test is not checking what you think.

Done when: the new test runs, fails on its own assertion, and you can say in one sentence why it fails.

## 4. Green: the smallest code that passes

Write the least code that makes the assertion pass. It may be specific to the one case and slightly ugly; that is expected, because the next behavior is the next trip around the loop. Options, extra cases, and generalization are code for behaviors you have not tested yet.

Run the new test, then the whole suite. If passing it drags in unrelated code, the sentence from step 1 held more than one behavior; return to step 1 and take the smaller one.

Done when: the whole suite passes, including the test that failed a moment ago.

## 5. Refactor, and prune the tests

Improve the code with the tests green: names, duplication, and where each piece lives. Change the implementation only; the behavior from step 1 stays where it is.

Hold the tests to the same bar. Each one names a behavior. Delete a test that pins something incidental (an exact call count, a private helper, a CSS class, a snapshot of markup nothing decided), because those break on a rename and hide the behavior that matters. Run the suite after each edit.

Done when: the suite is green after the last edit, and every remaining test name describes an outcome a user could notice.

## 6. Next behavior, or stop

Take the next behavior from the request and start again at step 1. Stop when the request is satisfied, not when you run out of ideas.

Done when: every behavior in the request has a test, and every test was seen failing before the code that makes it pass existed.

## What's next

Run the suite one more time in front of the student, then commit the test and the code together (`git add -A && git commit -m "Add <behavior>, tested first"`) so the history shows which test failed first.

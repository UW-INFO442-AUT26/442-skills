# The flow map

`acceptance/flows.md` is the single record of what has been tested. The
recording folder holds the proof; the map holds the verdict. Nothing else is
allowed to disagree with it.

## Shape

```markdown
# Flows

- App: http://localhost:5173
- Mapped: 2026-11-11
- Commit: 1a2b3c4

| ID | Flow | Expect | Status | Evidence |
| --- | --- | --- | --- | --- |
| F01 | Open the home page | Heading, three cards, no console error | pass | evidence/F01-home/run.webm |
| F02 | Sign in with a test account | Lands on the dashboard, name in the nav | pass | evidence/F02-sign-in/run.webm |
| F03 | Add a task | Row appears, box clears, survives reload | pass | evidence/F03-add-a-task/run.webm |
| F07 | Save preferences | Toast, tick still set after reload | bug | evidence/F07-save-prefs/run.webm |
| F09 | Share a list | Opens read-only for a signed-out visitor | blocked | - |

## F07 Save preferences

Expected: the toast appears, and the tick is still set after a reload.
Actual: the toast appears, the tick clears. Console shows nothing.
Likely cause: the write goes to state, not to Firestore.
```

Column rules:

- **ID** is one capital letter and digits, `F07`. It names the folder, the
  finding, and the sentence you say to the student. Never renumber; a new
  flow takes the next free number.
- **Flow** is what the user does, in their words, short enough to read in a
  table. "Add a task", not "TaskForm submit handler".
- **Expect** is the observable result. Something a person can see. Not "works
  correctly".
- **Status** is one of the six in the skill: `pass`, `bug`, `unexpected`,
  `blocked`, `fixed`, `approved`. Lowercase.
- **Evidence** is the path from the acceptance folder, or `-` when a flow is
  `blocked`.

Detail sections come after the table, one per flow that is not a pass. They
start `## <ID> <name>` and say what was expected, what happened, and what the
console said. `node <this-skill>/scripts/flows.mjs` checks the map and prints the counts;
it reads this table, so a row it cannot parse is a row nobody can find.

## Enumerating: the flows people forget

Read the source and answer each line for this app. What is not in this list
is still worth a look; what is in it is what a demo exposes.

1. **Every route** in the router, including nested ones. Deep link each one
   directly in the address bar: a built app without a hosting rewrite answers
   404, and a refresh on a nested route is the classic failure.
2. **Every link** in the nav, the footer, and a card. A link that goes
   nowhere is common and invisible until someone clicks it.
3. **Every button** with a handler, including the icon buttons: delete,
   edit, copy, close, cancel.
4. **Every form**: empty submit, one required field missing, a very long
   value, a value with an apostrophe, submit twice fast.
5. **Every modal and drawer**: open, cancel, confirm, close with Escape,
   close by clicking the backdrop, and open again after closing once.
6. **Signed out and signed in.** Every screen has two versions of this
   question, and the signed-out version is the one that crashes on
   `currentUser.displayName`.
7. **Empty and loading.** A new account with no data, and the first second
   before the snapshot arrives.
8. **Persistence.** Do the flow, reload, check it is still there. This is
   where state and database get confused.
9. **Browser controls.** Back after a change, forward again, refresh mid
   flow.
10. **Sign out**, and the screen that should be closed after it.
11. **Search, filter, and sort**, if the app has them, with a query that
    matches nothing.
12. **Upload**, if the app has it, with a wrong file type and with a large
    one.
13. **Error path.** Mock the API to fail and check the app says something.
    `npx -y @playwright/cli@latest route "**/api/**" --status=500` is enough.

Two flows can share a screen. That is fine, and it is why the row is the
flow and not the page: "add a task" and "delete a task" are two rows even
though they never leave one URL.

## Keeping it honest

- A row is added when the flow is found, not when it is run. The map is the
  work queue.
- When the app changes, the map changes in the same commit, or it starts
  describing an app that no longer exists.
- A `pass` with no recording is a rumour. That is the one rule the checker
  enforces and the one worth keeping when the deadline is close.

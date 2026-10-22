# A practice problem the student clones

The other track. Use it when the capability is work in an editor: wiring state,
reading a component somebody else wrote, changing code an agent produced. The
student clones a small React project, finds TODO comments, and fixes them.

The rules that hold on both tracks still hold: the copy rule from step 3 of
[../SKILL.md](../SKILL.md) (write the way a teacher talks), the look from
`442-brand`, and never make the student guess what done looks like. One rule
changes. A quiz must not reveal its answer; a practice problem may, because the
student is learning to do the work, not to recall it.

## 1. Grill for the work, not the answer

Run the same interview as the page track (`442-grill`), with three questions
added:

- **What does the page show while it is broken, and what does it show when it
  works?** Both have to be visible in a browser, or the student has no signal.
- **Which one idea is the work?** A fifteen minute problem carries one idea.
  Two ideas make a tutorial.
- **What can they already write?** INFO 442 students arrive knowing React from
  INFO 340. The problem should ask for one thing they have not done, inside code
  they can already read.

**Done when** you can state the broken behaviour, the fixed behaviour, and the
single idea between them, one line each, and the student has agreed.

## 2. Scaffold it

```bash
node ~/.agents/skills/442-create-exercise/scripts/scaffold-problem.mjs practice/<slug> --title "<the topic>"
```

You get a Vite + React project that already runs: the class tokens vendored in
`src/tokens.css`, one page on the 442 theme, an ESLint config, and a README. It
refuses a folder that is not empty, so it cannot overwrite work.

**Done when** the command exits 0 and the folder holds `src/App.jsx`.

## 3. Write the problem

Rewrite `src/App.jsx` for the topic. The example in the template is a finished
problem, so keep its shape and change its content.

- **Two to four TODO comments, each with a visible effect.** Read the page after
  each one. A TODO whose symptom the student cannot see is a riddle.
- **Each TODO works alone.** Fix one, save, watch something change. Order them
  so the page never needs two fixes at once to make sense.
- **Name the idea and the symptom.** The fix may appear as one line of example
  code under the comment. Remember which track you are on.
- **Keep the page running at every save.** No red screen, no console error. A
  page that crashes teaches the student where the terminal is and nothing else.
- **Name the trap by what happens, not by what it is called.** "0 is falsy"
  belongs in a book. The student needs the behaviour: React shows `0`, and hides
  `false` and `null`. The same goes for render, truthy, instance, and every other
  word that names a thing instead of showing it.
- **Leave one trap.** The naive fix should fail in a way they can see, and a
  comment should say how to notice it. The zero trap is the model: a number in
  front of `&&` renders a bare `0` on the page.
- **Under 50 lines.** One component plus the whole page. `src/App.jsx` is the
  file they read.
- **The reference box holds the pattern and nothing else**, because that is the
  one thing worth having on screen while they type.

Rewrite `README.md` to match: what to fix, what done looks like, and how to run
it.

**Done when** every comment names an idea rather than restating the code beneath
it, and the README's done-list is exactly what the fixed page does.

## 4. Run it twice

```bash
cd practice/<slug>
npm i
npm run dev     # the broken page: check every symptom the comments promise
npm run lint    # must be clean
```

Then copy the folder to `/tmp`, apply the fix yourself, run that copy, and check
the done-list item by item. Take the naive route too, and confirm the trap fires
the way the comment says. A promise in a comment that the code does not keep is
worse than no comment.

**Done when** the broken page matches its comments, the fixed page matches its
README, and lint is clean on both.

## 5. Put it on the class site

A practice problem lives in the shared exercises site, in two folders:

- `practice/<slug>/` the project the student clones.
- `exercises/<slug>/index.html` the landing page: title, goal, the four commands
  (`git clone`, `cd`, `npm i`, `npm run dev`), what to fix, done when.

Then add the entry to `exercises.json` and rebuild the home page. The site's
own README lists every field; an interactive entry also carries
`"kind": "interactive"`, `"practice": "practice/<slug>"`, and `"questions": 0`,
since nothing on it is scored.

```bash
node scripts/build-index.mjs
node scripts/build-index.mjs --check
```

**Done when** `--check` exits 0, the landing page opens at
`exercises/<slug>/`, and the card on the home page lists the problem as
Interactive.

## 6. Hand it over

Give the student the landing page link as plain text, the clone command if they
are in lab, and one instruction: run it, fix one TODO, look at the page, then
fix the next. Say out loud that this one is on a laptop rather than a phone.

**Done when** the student has the link and can name the first TODO they will
fix.

---
name: 442-browser
description: "Drives a real browser from a shell with playwright-cli, installed on demand by npx and kept open between commands: open a page, read a snapshot of what is on it, click and type by ref, read the console and the network, screenshot, and record video. Harness agnostic, so it works the same in omp, opencode, Claude Code, Codex, or any tool that can run a command. Use when the student asks you to click through their app, test one feature in a browser, reproduce a bug that only appears in the UI, fill in a form or sign in, or record a video of the app working."
---

# Drive a browser

The page is the only proof. A claim about a button that came from reading the
code is a guess. This skill is the hands: open a page, act on it, read back
what it did.

The tool is `playwright-cli`, run through `npx` so nothing is added to the
project. The browser stays open between commands, and every command attaches
to the same page.

Come back for
[`references/commands.md`](references/commands.md) when you need a command
these steps do not show,
[`references/recording.md`](references/recording.md) when the run is evidence
someone will watch, and
[`references/troubleshooting.md`](references/troubleshooting.md) when a
command refuses.

## 1. Open a session

```bash
npx -y @playwright/cli@latest open http://localhost:5173
```

The first run downloads the CLI into the npm cache and takes a few seconds.
Every run after that starts in about three. Nothing lands in
`package.json`, and there is nothing to uninstall.

The browser is the Google Chrome already on the machine, headless, and it
stays alive after the command returns. That is what makes a twenty-step flow
possible one command at a time: the signed-in session, the filled form, and
the half-finished flow all survive.

Give the session a name when another agent may be driving a browser at the
same time, and pass the same name to every command:

```bash
npx -y @playwright/cli@latest -s=checkout open http://localhost:5173
```

**Done when** the command reports the browser opened and the page URL you
asked for. If it fails on a missing browser, the error names the install
command; [`references/troubleshooting.md`](references/troubleshooting.md) has
the one line to run.

## 2. Read the snapshot before touching anything

Every command prints a snapshot: the page as a tree of roles, names, and
refs.

```yaml
- generic [ref=e1]:
  - heading "Task list" [level=1] [ref=e2]
  - textbox "What needs to be done?" [ref=e3]
  - button "Add" [ref=e4]
  - list [ref=e6]:
    - listitem [ref=e7]: walk the dog
```

The tree is close to what a screen reader announces, so a control that is
missing from it is missing for a real user too. Refs are the handles you act
on, and they are regenerated whenever the page changes. Take the snapshot,
act, then take it again: a ref from two commands ago is stale.

The snapshot is written to a file and the CLI prints the link. Use
`--raw snapshot` to print it inline, and `find "text"` to search a large one
instead of reading it all.

**Done when** you can name the role and the accessible name of the control
you are about to use.

## 3. Act

```bash
npx -y @playwright/cli@latest fill e3 "walk the dog"
npx -y @playwright/cli@latest click e4
npx -y @playwright/cli@latest press Enter
```

Use the ref. When there is no ref, or the page has several similar controls,
name the element in the same words the snapshot uses:

```bash
npx -y @playwright/cli@latest click "getByRole('button', { name: 'Add' })"
npx -y @playwright/cli@latest click "getByTestId('submit-button')"
```

One action per command, then read the snapshot it returns. A page that is
slow to settle is the usual reason the next click misses; wait with
`eval "() => new Promise(r => setTimeout(r, 500))"` rather than clicking
twice.

**Done when** the snapshot taken after the action shows the change you
expected. An unchanged snapshot means the action did nothing, and
[`references/troubleshooting.md`](references/troubleshooting.md) names the
three usual reasons.

## 4. Read what the page did

A visible change is half the answer. Three readings finish it:

```bash
npx -y @playwright/cli@latest console
npx -y @playwright/cli@latest requests
npx -y @playwright/cli@latest eval "() => document.querySelectorAll('li').length"
```

`console` lists every message with its file and line. `requests` numbers
each network call, and `request 5` opens one. `eval` is how you assert a
number instead of eyeballing a list.

Read the console after the flow, not only after the load. A React error that
appears on the third click is invisible at step 1. A `404` for `favicon.ico`
is noise; anything naming your own file is not.

**Done when** you have a stated answer for what the page shows, what the
console says, and what the network carried.

## 5. Record when someone will watch

A screenshot proves a state. A video proves the steps that led to it, which
is what a reviewer, a teammate, or a bug report needs.

```bash
npx -y @playwright/cli@latest video-start run.webm --cursor
npx -y @playwright/cli@latest video-chapter "Add an item" --duration=1500
npx -y @playwright/cli@latest click e4
npx -y @playwright/cli@latest video-stop
```

The file is written where the command ran, and it is only final after
`video-stop`. Keep it to the flow and nothing before or after it.

**Done when** the file exists, plays, and shows the flow you are describing.

## 6. Close

```bash
npx -y @playwright/cli@latest close
```

A headless session also closes itself after an hour of no commands. When a
command answers that the browser is not open, run `open` again.

**Done when** no browser you started is still running. `list` still holding a
session you forgot about is what leaves a laptop fan spinning.

## What's next

Say what the browser showed, in the words of the flow you ran: which click
did what, what the console said, and where the recording is. What to do about
it is the next skill's job, or the student's question. For a one-command
render check at phone and laptop width, use `442-browser-use` instead.

---
name: 442-page-check
description: "Runs a one-command render audit of a page that is already running: opens it at 360px and 1280px in a real browser, screenshots both, and reports what is actually wrong, including console errors, a page wider than the phone, containers that have content but no height, images that did not load, and taps that are too small. Use when a student asks whether their page renders, whether it looks right on a phone, why the map, navbar, or image does not appear, or before a milestone. For clicking through a flow or recording one, use 442-browser instead."
---

# Check the page

A React app compiles whether or not it works. A map with no height compiles, renders
as a grey strip, and passes every check you can run from a terminal. The only thing
that tells you it works is a browser showing it.

So this skill opens the page in a real browser, screenshots it at **360px** (a phone)
and **1280px** (a laptop), and reports what it found. The screenshots are the point:
a student believes a picture of their own broken page faster than they believe a
description of it.

## 1. Run it

From the project folder:

```bash
node <this-skill>/scripts/shoot.mjs
```

With no URL it starts the dev server itself, reads the port out of the output, and
stops it afterwards. To point it at a page that is already running:

```bash
node <this-skill>/scripts/shoot.mjs http://localhost:5173
```

**Done when** you have a report with `findings` and two screenshot paths.

Exit codes: `0` clean, `1` findings, `2` something to install, `3` it could not run.
Each means something different, so read the code before reading the output.

## 2. If it exits 2, it needs a browser

The script does not install anything by itself, because a 130MB download is the
student's decision and not a surprise. Tell them the command, run it, then run the
check again:

```bash
npm i -D playwright && npx playwright install chromium
```

It tries the Chrome already on the machine first and only falls back to the
downloaded build, so on most laptops this never runs. **Done when** the check runs
and reports.

## 3. Open the screenshots

Read `.browser-use/360.png` and `.browser-use/1280.png`. Do this before you touch any
file. Most of the time the picture explains the fix faster than the report does.

They land in `.browser-use/`, which belongs in the project's `.gitignore`. Add it if
it is not there.

Two honest notes about the pictures:

- The phone screenshot is wider than 360px whenever the page overflows. That is not a
  bug in the screenshot, it is the overflow, visible.
- A phone screenshot of a tall page is long. That is `fullPage`, and it is what shows
  a footer pushed off the bottom.

**Done when** you can say in one sentence what a person would see that is wrong.

## 4. Report the count, then one thing

Lead with the number, then hand the student the highest-value finding. The report
groups duplicates across the two widths on purpose: one bug is one bug, not two.

Read [`references/findings.md`](references/findings.md) for what each kind means and
the usual cause. Do not read the whole table out loud.

**Done when** the student knows what is broken and which one you are fixing first.

## 5. Fix one, then run it again

Change one thing, run the check, watch the count drop. Two fixes at once and a
count that moves tells you nothing about which one worked.

**Done when** the count is lower and you can name the finding that went away.

## 6. Clean is the definition of working

When it reports `clean`, the page displays and behaves at both widths. That is the
bar for "it works", not "it compiles" and not "npm run dev is running".

Then commit, and say what the check proved.

## What it cannot see

Say this out loud once, because a green report is not a finished product:

- **Whether the content is right.** It checks that things render, not that a food
  bank's hours are correct.
- **Contrast and screen-reader use.** Week 6 covers that with WAVE.
- **Text clipped inside a box**, which needs a person looking at the screenshot.
- **Anything behind a click**, unless the page reaches it on load.

For a map, this check catches a collapsed container, which is the bug that makes it a
grey strip. The three numbers that prove a map actually works, container height and
tiles and markers loaded, are in
[the Leaflet guide](../442-leaflet/references/browser-check.md) instead.

## What's next

Run it after every visual change and before every milestone. If a finding does not
make sense, read the screenshot again before reading the report again.

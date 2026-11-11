# Recording

A recording is evidence. It answers "what did the app do when you clicked
that" without the reviewer repeating your 12 commands, so it is worth the one
extra step when the result will be watched by a person.

`pwc` below stands for `npx -y @playwright/cli@latest`.

## The three commands

```bash
pwc video-start run.webm --cursor
pwc video-chapter "Sign in" --duration=1500
pwc video-stop
```

- The file land where the command ran, so cut a folder first:
  `mkdir -p evidence/F03-sign-in`.
- Nothing is written until `video-stop`. A recording without a stop is lost.
- `--cursor` draws a moving pointer, which is what makes a click readable in
  a video. Without it the page changes for no visible reason.

WebM is the container (VP8 or VP9). Chrome plays it, macOS QuickTime does
not, and every browser and GitHub play it.

## Chapters name the steps

A chapter is a card that blurs the page, names the step, and lasts as long as
you say. Two or three chapters turn 40 seconds of clicking into a story.

```bash
pwc video-start evidence/F07-save-prefs/bug.webm --cursor
pwc video-chapter "Open settings" --description="Starting from the signed-in home page"
pwc click e6
pwc video-chapter "Untick email updates" --duration=1200
pwc click e14
pwc press Tab
pwc video-chapter "After save, the box stays ticked" --duration=2000
pwc video-stop
```

Keep a recording to one flow. A 40-second recording gets watched; a
four-minute one gets skipped.

## Annotate the action

```bash
pwc video-show-actions --duration=800 --position=top-right \
  --highlight-style="outline: 2px solid #333; background: rgba(0,128,255,.15)"
pwc video-hide-actions
```

That draws a box on the target and a callout naming the action, which is how
a reviewer sees what you clicked instead of guessing. Options:
`--duration`, `--position` (`top-left`, `top`, `top-right`, `bottom-left`,
`bottom`, `bottom-right`), `--point-style`, `--highlight-style`,
`--title-style`, plain CSS declarations. Overlays ignore the pointer, so they
never swallow a click.

## A polished recording, when it earns it

The CLI pacing is honest but quick. When the recording is a demo rather than
a bug report, drive the page with Playwright code so you control the pauses.
Write the file, then run it:

```js
// demo.js
async page => {
  await page.screencast.start({ path: 'demo.webm', size: { width: 1280, height: 800 }, fps: 60 });
  await page.screencast.showActions({ duration: 800, style: { title: 'display: none' } });
  await page.goto('http://localhost:5173');
  await page.screencast.showChapter('Adding a task', { duration: 1800 });
  await page.getByRole('textbox', { name: 'New task' }).pressSequentially('walk the dog', { delay: 60 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  await page.screencast.stop();
}
```

```bash
pwc run-code --filename=demo.js
```

`page.screencast.showOverlay(html, { duration })` puts your own label on the
page, which is how a recording says "this is the bug" at the moment the bug
appears.

## Screenshots

A video is for a sequence. A screenshot is for one state a reviewer must see
at a glance.

```bash
pwc screenshot --filename=evidence/F07/before.png
pwc screenshot e5 --filename=evidence/F07/button.png   # one element
pwc screenshot --hires
pwc pdf --filename=page.pdf
```

Screenshot the state, not the flow. A page that overflows its phone width is
the case to keep in mind: the picture is wider than 360px, and that width is
the bug, visible.

## Size

Record at the size you opened. `resize 1280 800` before `video-start` keeps
the file small and the text readable. A 30-second flow at that size is a few
hundred kilobytes.

Delete a recording when the flow passes again and the evidence is replaced.
A folder of stale videos is worse than none, because nobody can tell which
one is current.

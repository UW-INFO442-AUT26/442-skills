# Evidence

A recording is what makes a verdict checkable. The student was not in the
room, so the video is the room. Every non-`pass` row exists to make somebody
watch one, so the recording has to be watchable.

## Folder layout

```text
acceptance/
  flows.md
  evidence/
    F01-home/run.webm
    F03-add-a-task/run.webm
    F07-save-prefs/run.webm
  fixes/
    F07-save-prefs/before.webm
    F07-save-prefs/after.webm
```

One folder per flow, named `<ID>-<slug>`, the same ID as the row. A flow
that needs two recordings to explain itself gets `part-1.webm` and
`part-2.webm` in the same folder, and the row points at the folder.

`fixes/` holds the pairs. The original bug recording moves there as
`before.webm` when the fix lands, so a video is never in two places and the
folder a reviewer opens has both halves of the story.

Keep the recordings out of git unless the team wants them committed:
`acceptance/evidence/` in `.gitignore`, `flows.md` in the repo.

## Recording a run

```bash
mkdir -p acceptance/evidence/F07-save-prefs
npx -y @playwright/cli@latest video-start acceptance/evidence/F07-save-prefs/run.webm --cursor
npx -y @playwright/cli@latest video-chapter "Open settings"
# the steps of the flow
npx -y @playwright/cli@latest video-chapter "Untick email updates"
# the steps that show the result
npx -y @playwright/cli@latest video-stop
```

- Two or three chapters, named after the steps a person would say out loud.
- `--cursor` on, so a click is visible as a click.
- Start the recording at the first action of the flow, not at browser start
  and not before a sign-in that the flow does not test.
- End it on the result, and hold that result for a second and a half. A
  recording that stops the instant the bug appears shows a reviewer nothing.

`resize 1280 800` before recording keeps text readable and the file small.

## Deciding the verdict

The verdict is about the app, not the flow. Ask: would a user of this app
call what just happened correct?

**`pass`** means the expected result on the first attempt. Favicon `404` and
cancelled requests are noise and do not spoil it. A React warning does: it is
a `bug` when the result broke with it, and `unexpected` when it did not.

**`bug`** means something did not happen, happened wrong, or threw. The
detail section says what you clicked, what appeared, and what the console
said. That section is the bug report; the recording is its proof.

**`unexpected`** is the hard one, and the one worth being honest about:
nothing crashed, the data is right, and the app still does not behave the
way a person would predict. A form that clears itself on a validation error.
A save with no confirmation, so the user clicks twice and creates two rows.
A back button that loses the scroll position and the search. It works. It is
still wrong.

**`blocked`** means the flow could not be tested: a service that is down, a
credential nobody has, a third-party widget that needs a real phone. The
detail says what would unblock it. `blocked` is not a soft `bug`; if you
could run it, run it.

## Reading the run back

Before you write a verdict, look at all three:

1. **The recording.** Watch the last two seconds. That is where the result
   is, and that is where the missed step hides.
2. **The console.** `npx -y @playwright/cli@latest console error` after the
   flow, not only after the load.
3. **The network.** `requests` and `request <n>` answer "did it even ask",
   which separates a rendering bug from a backend bug in one look.

A verdict without those three is a guess with a timestamp.

## Size and cleanup

Ten flows at 30 seconds each is a few megabytes, which is fine. Two minutes
per flow is a recording nobody watches: split it, or drop the chapters that
are just navigation.

When a flow passes again and its evidence is replaced, delete the old file.
Two recordings of the same flow with different results is the state that
wastes a reviewer's afternoon.

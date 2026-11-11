# Fixing what was picked

The pass recorded. Now the student names the flows, and each one goes around
one loop. One flow at a time: two fixes and one replaced recording tells you
nothing about which change did it.

## The loop

1. **Reproduce it in the browser**, from the flow's own first step. A bug you
   cannot make happen is a bug you do not understand yet, and the recording
   in `evidence/` is the repro you already wrote down.
2. **Find the cause**, in the code the flow touched. Read the console line
   and the failing request before the source; they point at the file.
3. **Change one thing.** One cause, one edit.
4. **Record the same flow again**, same steps, same chapters, into
   `acceptance/fixes/<ID>-<slug>/after.webm`. Move the original to
   `before.webm` in that folder first.

The before and after must be the same flow. A tighter after recording is a
demo; the pair is supposed to be an experiment, so both halves run the same
steps at the same window size.

## Assembling the pair

Two files in one folder is the minimum, and it is enough: a reviewer plays
one, then the other.

When they should play together, and `ffmpeg` is on the machine, one command
makes a single file with both halves side by side:

```bash
ffmpeg -i before.webm -i after.webm \
  -filter_complex "[0:v]scale=640:-2[l];[1:v]scale=640:-2[r];[l][r]hstack" \
  -c:v libvpx-vp9 -b:v 1M -an side-by-side.webm
```

`ffmpeg -version` decides. Without it, skip the merge and say the pair is two
files. A missing tool is a smaller problem than an invented command.

## Marking it

```markdown
| F07 | Save preferences | Toast, tick still set after reload | fixed | fixes/F07-save-prefs/after.webm |
```

The status is `fixed`, the evidence column points at the after recording, and
the detail section below the table gains two lines:

```markdown
## F07 Save preferences

Fixed: the write went to React state only. It now calls `updateDoc` on the
user document and awaits it before the toast.
Before: fixes/F07-save-prefs/before.webm
After: fixes/F07-save-prefs/after.webm
```

## The review gate

`fixed` is the agent's word. `approved` is the student's, and it moves only
after they have watched the pair.

Ask once, with the paths:

> F07 is fixed. Before and after are in `acceptance/fixes/F07-save-prefs/`.
> Does that look right?

Three answers, three moves:

- **Yes**: the row becomes `approved`, and the detail says who agreed and
  when.
- **Not quite**: the row goes back to `bug` with their words in the detail,
  and the loop runs again from step 1.
- **Silence**: it stays `fixed`. Never mark a row `approved` on your own
  reading of the recording, and never on the reasoning that the fix is
  obviously right.

An `approved` row is the strongest thing in the map: a flow that failed, was
repaired, and was watched working. That is the row to show at a milestone.

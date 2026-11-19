# Prompt assembly

The mechanical half. Copy the blocks, keep the line breaks, change only the
bracketed slots.

## The template

```text
A flat monochrome brand mark for [NAME, one clause on what it does].
The subject of the mark is [SUBJECT].
The mark is built from [CONSTRUCTION].

Solid black #000000 on pure white #FFFFFF, two values only. Every area
is filled with flat black; edges are hard and closed, no gaps in the
outline. Uniform thickness, no line thinner than one tenth of the mark's
width. One idea, one silhouette, centred in the square with a white
margin all round. Drawn as a vector pictogram, readable as a 32 pixel
favicon. Black on white, flat, high contrast.
```

Three slots, and that is the whole interface.

| Slot | Length | How to fill it |
|---|---|---|
| Name | one clause | `"Tandem", a shared calendar for two people`. Context for taste, not an instruction. |
| Subject | eight words at most | One noun, or one transformation: `a leaf whose stem becomes a droplet`. Two nouns maximum; a third and you get an illustration. |
| Construction | one clause | Geometry from [concept-directions.md](concept-directions.md). What it is made of, not what it means. |

## Why the technical paragraph reads like that

Do not edit it. Each line is doing a job:

- **"two values only, #000000 on pure white"** names a count, and a count is what
  suppresses grey midtones and soft shadows, which are the usual reason a mark
  cannot be traced.
- **"hard and closed, no gaps in the outline"** because open paths and hairlines
  are what fall apart when traced.
- **"no line thinner than one tenth"** because thin elegant curves look best on
  screen and are the worst thing to vectorise.
- **"one silhouette, centred, white margin"** keeps the outline off the frame, so
  the trace does not run to the edge of the canvas.
- **"readable as a 32 pixel favicon"** forces simplicity harder than any number of
  minimalist or clean adjectives.
- **no lettering clause** because text in generated images is still the weakest
  part. Set the wordmark yourself.

## Gemini, and other image models

The student pastes the template as written into gemini.google.com and asks for
four variations in the same chat. Two notes for that conversation:

- **Ask for the same prompt four times, not four prompts.** Then the differences
  are the model's, and comparing them is meaningful.
- **One change per round.** When none of the four work, change exactly one slot or
  one line, and say which in the handoff, so the next round is a test rather than a
  gamble.

For a model with a negative-prompt field, put prohibitions there:

```text
gradient, greyscale gradient, soft shadow, drop shadow, bevel, emboss, glow, texture, noise, 3d render, specular highlight, outline only, hairline stroke, open path, lettering, text, watermark, colour, background detail, frame border, mockup, multiple logos, sketch, pencil lines
```

For Midjourney, tighten the whole thing to one line and use `--no`:

```text
flat black brand mark for [NAME], subject: [SUBJECT], [CONSTRUCTION], one silhouette, solid black on pure white, hard edges, centred, minimal, no shading --ar 1:1 --style raw --no gradient, shadow, texture, outline, colour, text
```

Recraft V4 Vector and Ideogram Vector return real SVG. When a student has access
to one of those, use it and skip the trace entirely.

## The QA gate

Score every candidate. A mark that fails any row marked hard is dead, whatever it
looks like.

| Check | Hard | What a failure looks like | Fix |
|---|---|---|---|
| Pure black and pure white | Yes | grey fringe, soft shadow under the mark | threshold it. If it survives, the model ignored the spec, so regenerate. |
| One idea | Yes | two objects, or an object plus a symbol | cut the subject to one noun |
| One closed silhouette | Yes | open strokes, broken arcs, outline-only rings | ask for filled shapes, closed, hard edges |
| Nothing under a tenth of the width | Yes | elegant thin lines, a taper to a point | raise the stroke floor, drop the taper |
| Nothing inside the mark | Yes | detail, texture, a nested second shape | add no detail inside the mark |
| The gap between parts holds up | Yes | a gap that closes to a hairline at 16 pixels | widen the gap. A gap is a stroke and obeys the same floor. |
| Margin all round | No | the mark touches or crosses the frame | raise the margin, regenerate at 1:1 |
| Reads at 32 pixels | No | detail clogs when shrunk | fewer elements, not a bigger mark |
| No lettering | No | a mangled letter, a stray letterform | regenerate. Never trace a mangled letter. |

Reject on silhouette, not taste. The keeper is the one you could trace in a single
pass.

## Trace pipeline

1. Download the largest square PNG, 1:1.
2. Force two values so nothing survives as grey:

   ```bash
   magick logo.png -colorspace gray -threshold 55% logo-bw.png
   ```

3. Knock out the white if the tool wants transparency:

   ```bash
   magick logo-bw.png -fuzz 8% -transparent white logo.png
   ```

4. Trace. Inkscape: **Path, Trace Bitmap, Brightness cutoff**, threshold around
   0.45, corner smoothing 1.0, optimise 0.2. Illustrator: **Image Trace**, the
   *Black and White Logo* preset, threshold around 50. Then delete the background
   path and recolour the one that is left.
5. Check at 16 pixels. If the detail clogs, simplify a slot and generate again
   rather than fixing nodes by hand. Hand-fixing a bad trace is slower than a
   second generation, and the trace is the evidence that the mark was too
   complicated.

Skip steps 2 to 4 when the model returned SVG.

## Worked example

Input: `"Tandem", a shared calendar for exactly two people. Calm and equal.`

Character: calm and equal, because the product's whole promise is two people on
one footing.

```text
A flat monochrome brand mark for "Tandem", a shared calendar app for two people.
The subject of the mark is two equal forms sharing one weight.
The mark is built from two identical thick strokes set parallel with a gap
between them, mirrored across a diagonal, the gap of constant width from end
to end.

Solid black #000000 on pure white #FFFFFF, two values only. Every area is
filled with flat black; edges are hard and closed, no gaps in the outline.
Uniform thickness, no line thinner than one tenth of the mark's width. One
idea, one silhouette, centred in the square with a white margin all round.
Drawn as a vector pictogram, readable as a 32 pixel favicon. Black on white,
flat, high contrast.
```

Two identical strokes, mirrored, constant gap: that is the geometry of equality.
Nothing in it is a crescent, and nothing in it would have appeared for a wind app.

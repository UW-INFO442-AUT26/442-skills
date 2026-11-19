---
name: 442-logo
description: "Interviews a student about their product's logo, writes a logo brief, and hands over one paste-ready image prompt for Gemini along with the steps to use it and review what comes back. Use when a project needs a logo, icon, brand mark, app icon, or favicon; when a student asks for a logo prompt; and when a generated mark comes back unusable for tracing."
---

# Make a logo

You do not generate images. Your agent almost certainly cannot, and the ones that
can give you a mark you cannot edit. So this skill does the part that decides
quality, which is the brief, and then hands you one prompt to paste into an image
model, plus the steps to judge what comes back.

The output is three things: a `logo.md` brief, a single copy-ready prompt, and a
review loop. The prompt is a **spec**, not a wish. The technical half of it never
changes because it is what makes the result traceable; the concept half is derived
from this product and nothing else.

**The one failure to avoid.** A prompt with a fixed style block returns the same
mark every time. Run it for a wind app, a food bank, and a tutoring tool and you
get three crescents, because the style block decided the shape before the product
got a vote. So the style half stays fixed and the concept half is built from the
answer to step 1, every time.

## 1. Pin the product and the name

One line each: the name, what it does, who it is for. Read the project first
(`README.md`, the spec, the home page) rather than asking what you can look up.

If there is no name yet, say so and stop: Call the Skill tool with
`442-create-names`. A mark built for a placeholder name gets built twice.

*Done when:* the name, the one-line product, and the audience exist in writing.

## 2. Triage before you ask anything

List every decision the logo needs and sort them into three piles: obvious, so it
is skipped; answerable from the project, so you find it yourself; and genuinely a
human's call, so it becomes a question. Only the last pile is asked, and you name
the pile you are deciding yourself in one line.

Usually only three or four things need asking. Asking ten questions about a logo
is how a student loses interest in a task that should take ten minutes.

*Done when:* the question list holds only decisions a human must make, and the
pile you are handling is named.

## 3. Ask one question at a time, with a recommendation

Ask one plain question per message, with your recommended answer inside it, so the
student can reply "yes" or correct you. Offer "you decide" as a real option, and
take it as the answer when they say it.

The four that usually matter:

1. **What should the mark feel like?** Recommend the character from the product's
   felt benefit, in one or two words, and say why: "I would pick steady and
   protective, because the product's promise is that the budget is watched."
2. **Is there an object or image you already associate with it?** Anything is
   usable. If the answer is "no idea", that is a decision you now own.
3. **Icon only, or icon plus the name?** Recommend icon only, generated here, with
   the name set as type afterwards. Generated lettering is still the weakest part
   of an image model, and a mangled letter ruins an otherwise clean mark.
4. **Anything it must not look like?** A competitor's mark, a shape that misreads,
   a symbol that means something else somewhere. Write the answers down.

Resolve decisions only. Do not start describing shapes yet.

*Done when:* every question on the list is answered or explicitly delegated, and
each answer is recorded in one line.

## 4. Offer three directions from three different families

This is the step that stops the sameness, so do it properly. Pick three **different
families** from [references/concept-directions.md](references/concept-directions.md):
object, transformation, implied form, letterform, diagram, container, motion.

Three marks from three families is a set a person can choose between. Three
variations on one family is one idea in three hats, and the choice becomes
arbitrary.

Write each direction as two lines of geometry, no adjectives:

```text
A. transformation  a rectangle whose right edge becomes a rounded tab that lifts away
B. diagram         two bars of equal length, one shorter by exactly a third, flush left
C. container       a rounded square with one torn corner
```

Recommend one and say why in a sentence. Then let the student pick, or pick for
them if they said "you decide".

*Done when:* three directions from three distinct families are written down, one
is chosen, and the character line from step 3 still matches the choice.

## 5. Write the brief

Save `logo.md` at the project root. Five sections, no more:

```markdown
# <product> logo

## What it is
<name, one-line product, audience>

## Character
<one or two words>. Why: <the felt benefit it comes from>.

## The mark
Family: <family>. <two lines of geometry>

## Must not
<the avoid list from step 3, and the wordmark decision>

## Brand skeleton
Descriptor: <six words or fewer, what the product is>
Lockup: <icon + name set in <typeface class>, icon left>
```

The descriptor is the one-line answer to "what is this" that sits under the name
everywhere. Six words or fewer, the same words on the home page, the README, and
the demo slide. That is the part students skip and later need.

*Done when:* `logo.md` exists with all five sections filled.

## 6. Build the prompt

Fill the template in [references/prompt-assembly.md](references/prompt-assembly.md).
The technical block is copied verbatim from that file. The concept block takes the
chosen direction's words, and nothing else changes.

Four rules that are not negotiable, each one earned:

- **No "no" in the prompt text.** Models latch onto the word after it, so "no
  gradient" summons a gradient. Prohibitions go in a negative field, or nowhere.
- **Do not write "black and white logo".** Name the count: two values only, solid
  black on pure white. That phrase is what suppresses grey midtones.
- **Do not write "minimalist"** and expect simplicity. Ask for a mark readable as
  a 32 pixel favicon and let that do the work.
- **Do not ask for an SVG.** "Flat vector" describes an appearance, not a file
  format. The trace step at the end is what makes a real vector.

*Done when:* the prompt is one copy-ready block, with nothing left for the student
to fill in.

## 7. Hand it to Gemini

Say plainly that you cannot generate the image, then give the errand in numbered
steps the student can follow without thinking:

1. Open gemini.google.com.
2. Start a new chat and paste the whole prompt, unedited.
3. Ask for four variations of the same prompt.
4. Keep the images that are solid black on white with a clean silhouette. Ignore
   anything with grey shading, soft shadows, lettering, or detail inside the mark.
5. Come back with them and say which one you liked, or just say "these came back".

Then wait. Do not invent what the model produced, and do not score an image you
have not seen.

*Done when:* the student has the prompt, the steps, and knows to return with the
images.

## 8. Review what came back

Score the candidates against the gate in
[references/prompt-assembly.md](references/prompt-assembly.md). Reject on
silhouette, not taste: the keeper is the one whose outline you could trace in one
pass.

When every candidate fails, say which single line of the prompt caused it and
change that line only. Changing two things at once is how an afternoon disappears.
Two rounds is normally enough; after that, the direction is wrong, not the wording,
so go back to step 4 and pick a different family.

*Done when:* one candidate passes the gate, or the student picks one anyway and
knows what it will cost when traced.

## 9. Finish the asset

A PNG is not a logo. Two commands and one trace turn it into something recolourable,
and the full pipeline with the exact settings is in
[references/prompt-assembly.md](references/prompt-assembly.md):

```bash
magick logo.png -colorspace gray -threshold 55% logo-bw.png
```

Then trace it in Inkscape or Illustrator, delete the background path, and recolour
the one path that is left. Skip this entirely if the model gave you an SVG.

When the mark goes into the app, Call the Skill tool with `442-brand` and use its
tokens for the surrounding interface rather than picking colours by eye.

*Done when:* a single-colour vector file exists and has been checked at 16 pixels.

## What's next

Paste `logo.md` into your repo root so the team can see the character line and the
descriptor, put the traced mark in your app using the `442-brand` tokens, and reuse
the same descriptor everywhere the product is named.

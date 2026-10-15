# AGENTS.md: the 442-skills repo

The operating contract for any AI agent working **in this repository**
(adding or editing a skill). Students using the installed skills are
governed by the block the installer adds to their `AGENTS.md`, not
by this file.

## Before you write a skill

**Call the Skill tool with `442-write-skill`.** It is Matt Pocock's guide
to writing skills for agents, vendored at `skills/442-write-skill/`. A
skill that violates it is a skill that will not be merged. If it is not
installed in your harness, read
[`skills/442-write-skill/SKILL.md`](skills/442-write-skill/SKILL.md)
directly first.

## The shape of a skill

- One directory per skill: `skills/<name>/SKILL.md`, plus any
  `references/`, `assets/`, or `scripts/` it owns.
- Frontmatter is `name` and `description` only. `name` equals the
  directory name and carries the `442-` prefix.
- The `description` is the skill's pointer: state what it is and the
  branches that should trigger it. It is model-facing and always loaded,
  so it earns the hardest pruning in the file.
- Put reference behind a pointer, not in the body; keep the body to the
  steps and the completion criterion.
- End every skill with a **"What's next"** line the student can act on.
  These skills are for students, so they instruct.

## House rules for this repo

- **No em dashes**, no "as an AI", no filler. Plain technical English.
- The class voice is the one in `.agents/AGENTS.md` on the contributor's
  machine (the working agreements), and `jeremy-writing-style` where it
  applies.
- **Design work reads `442-brand`.** Never hand-type a color; use the
  tokens. If a skill produces something visual, it calls `442-brand`
  first.
- Keep each meaning in one place. `442-brand` owns the palette;
  `442-write-skill` owns the skill rules. Do not copy them around.
- Skills are **model-invoked** unless a skill is genuinely only ever
  typed by a human, in which case set `disable-model-invocation: true`
  and make the `description` human-facing.

## Contribute

Read [`CONTRIBUTING.md`](CONTRIBUTING.md). Every change arrives by pull
request and is reviewed before merge.

## Done when

- The skill's `description` names its trigger branches and its name
  carries the `442-` prefix.
- The body is steps plus one completion criterion; reference is behind a
  pointer.
- A **What's next** line ends the skill.
- No em dashes; no raw color values where `442-brand` supplies tokens.
- `scripts/check-repo.mjs` passes. If you touched `install.sh` or
  `uninstall.sh`, its run of `scripts/test-install.sh` passes too.

# Contributing to the INFO 442 skills

Anyone in the class can contribute a skill. The flow is the same for every
change: open a pull request, it gets reviewed, then it merges.

## Before you write

1. **Check it is not already here.** Read the table in [`README.md`](README.md).
   If an existing skill almost does it, improve that one instead of adding a
   near-duplicate.
2. **Read [`AGENTS.md`](AGENTS.md).** It is short and it is the contract.
3. **Read the skill-writing guide.** Your agent should call the Skill tool with
   `442-write-skill` before writing a `SKILL.md`. It is the standard your
   submission is judged against.

## Make a skill

1. Branch: `git checkout -b feat/<skill-name>`.
2. Create `skills/442-<name>/SKILL.md` with frontmatter:

   ```yaml
   ---
   name: 442-<name>
   description: <what it is>. Use when <the branches that trigger it>.
   ---
   ```

   The `name` must match the directory. The `description` is what the agent
   reads to decide whether to fire your skill, so name the real triggers.

3. Put anything long (references, templates, scripts) in the skill's own folder
   and point at it from `SKILL.md`. Keep the body to steps and one completion
   criterion.
4. End with a **What's next** line a student can act on.
5. If your skill renders anything visual, it reads `442-brand` and uses the
   tokens. Do not hard-code colors.

## Before you open the PR

Run the gate and make it pass:

```bash
node scripts/check-repo.mjs
```

Then verify the thing actually works, not just that the file exists. Run the
skill once, end to end, and paste what came back in the PR description. A skill
that has never been run is not ready to merge.

## The pull request

- Title: `feat: <what the skill does>` or `fix: <what it fixes>`.
- Body: one line on what the skill is for, one line on the trigger, and the
  evidence from your run. Keep it short.
- One skill per PR. Small PRs merge faster.
- A reviewer reads your `SKILL.md` against the guide and tries the skill. Expect
  a comment if the `description` does not name its triggers or the body is
  carrying reference it should disclose.

## Rules of the road

- **No em dashes.** Rewrite the sentence.
- **One meaning, one home.** Do not copy the palette out of `442-brand` or the
  rules out of `442-write-skill`.
- **Keep it for students.** Explain the *why* in one line where a step is
  unfamiliar.
- **No student data.** No names, IDs, grades, or student work in a skill, an
  example, or a commit. This repo is public.

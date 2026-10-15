# INFO 442 skills

A set of agent skills for **INFO 442, Cooperative Software Development**. Install
them once, then your AI agent can scaffold a project, build you a practice
exercise, plan a roadmap, write a spec, and more, all with the class conventions
built in.

Built for the course, usable by anyone.

## Install

One line in your terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/UW-INFO442-AUT26/442-skills/main/install.sh | bash
```

It asks one question first:

```
  Install the INFO 442 skills for:

    1) this project only   /Users/you/projects/my-app   (default)
    2) every project       /Users/you

  Choose 1 or 2 [1]:
```

**Project is the default**, and it is the right answer for coursework: the skills
are available when your agent runs in that directory and nowhere else. Pick 2 to
make them available in every session on the machine.

To skip the question, pass the choice to bash:

```bash
# this project only
curl -fsSL .../install.sh | bash -s -- --project

# every project on this machine
curl -fsSL .../install.sh | bash -s -- --global
```

Then restart your agent and try one: *"build me a new React project"*. Re-run the
same line any time to update.

Prefer to read before you run? Open [`install.sh`](install.sh).

### What it writes, and what it will not touch

Installing is **additive**. Nothing you already have is replaced.

| Where | Project install | Global install |
|---|---|---|
| The skills | `.omp/skills/442-*` in this directory, plus `.agents/skills` or `.claude/skills` if those directories already exist | `~/.omp/agent/skills`, `~/.agents/skills`, and `~/.claude/skills` if you use Claude Code |
| The rules | the `AGENTS.md` in this directory, or `.omp/AGENTS.md` or `CLAUDE.md` if that is the rules file you already have | `~/.agents/AGENTS.md` |

- **An existing `AGENTS.md` keeps its content.** The rules go in as a stamped
  block, `<!-- BEGIN 442-skills` to `<!-- END 442-skills -->`. Re-running the
  installer refreshes that block and leaves everything around it exactly as it
  was.
- **A skills folder keeps its skills.** Only symlinks that point into the INFO 442
  checkout are ever replaced. A skill of your own is left alone, and if one of
  your names collides with a class skill, the installer says so and skips it
  rather than overwriting anything.
- **A global install leaves your projects alone**, and a project install leaves
  every other project alone.

The skills themselves live in `~/.442-skills` and are symlinked into place, so
"update" is just running the installer again. That has one consequence worth
knowing: the links point at your home directory, so if you commit a project, add
`.omp/skills/` to its `.gitignore`. A teammate who cloned your project would
otherwise get links that point nowhere.

### Uninstall

```bash
bash ~/.442-skills/uninstall.sh              # this project, and this machine
bash ~/.442-skills/uninstall.sh --project    # only the directory you are in
bash ~/.442-skills/uninstall.sh --global     # only this machine
```

It removes the symlinks it made and the managed rules block, and nothing else. The
checkout at `~/.442-skills` is left in place; `rm -rf ~/.442-skills` when you want
it gone.

## The skills

| Skill | What it does |
|---|---|
| `442-react-init` | Scaffolds a clean Vite + React project (default boilerplate stripped) with an INFO 442 home page. |
| `442-create-exercise` | Turns any topic into a mobile-first interactive practice exercise, published to GitHub Pages at a public link. |
| `442-create-roadmap` | Turns a project brief and a team's constraints into a phased, week-by-week development roadmap. |
| `442-create-personas` | Generates deep, non-generic user personas for a problem statement. |
| `442-create-names` | A naming partner that produces a distinctive product name and tests it for believability. |
| `442-tdd` | Drives a change test-first: a failing test, then the smallest code to pass, then refactor. |
| `442-prioritize` | Sorts a raw pile of requirements or ideas into P0 / P1 / P2. |
| `442-grill` | Interviews you one question at a time to sharpen a vague idea into a written spec. |
| `442-brand` | The INFO 442 design tokens and style rules. Other skills read it; you rarely invoke it directly. |
| `442-write-skill` | How to write a skill for this repo. Read before contributing. |

Prefix every skill with `442-` when you invoke it by name.

## What the installer adds to AGENTS.md

Two class rules, so AI use is visible and attributed:

- **Cite AI-written code** with an inline comment naming what the AI did and how
  it was used.
- **Co-author AI commits**: an AI must never be the sole author; every commit it
  makes carries a `Co-authored-by:` trailer.

Both are spelled out in the managed block; edit that block in
[`reference/agents-block.md`](reference/agents-block.md), not on your machine.

## Contributing

Students are encouraged to contribute. Every change arrives by pull request and
is reviewed before merge. See [`CONTRIBUTING.md`](CONTRIBUTING.md) and, before
you write anything, [`AGENTS.md`](AGENTS.md).

## Layout

```
skills/     one directory per skill (<name>/SKILL.md + its own files)
reference/  source documents the skills cite, including the AGENTS.md block
scripts/    check-repo.mjs, the pre-commit gate, and the installer test
install.sh  the one-line installer
```

## License

MIT. The skill-writing guide in `skills/442-write-skill/` is adapted from
[Matt Pocock's skills](https://github.com/mattpocock/skills) (MIT).

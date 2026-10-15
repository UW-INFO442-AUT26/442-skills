# INFO 442 skills

A set of agent skills for **INFO 442, Cooperative Software Development**. Install
once, then your AI agent can scaffold a project, build you a practice exercise,
plan a roadmap, write a spec, and more, all with the class conventions built in.

Built for the course, usable by anyone.

## Install

One line in your terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/UW-INFO442-AUT26/442-skills/main/install.sh | bash
```

That clones the repo to `~/.442-skills`, links every skill into
`~/.agents/skills` (and `~/.claude/skills` if you use Claude Code), and adds the
INFO 442 rules to `~/.agents/AGENTS.md`. **Re-run the same line any time to
update.**

Then restart your agent and try one: *"build me a new React project"*.

Prefer to read before you run? Open [`install.sh`](install.sh). To remove it:
`~/.442-skills/uninstall.sh`.

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

## What the installer adds to your global AGENTS.md

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
reference/  source documents the skills cite
scripts/    check-repo.mjs, the pre-commit gate
install.sh  the one-line installer
```

## License

MIT. The skill-writing guide in `skills/442-write-skill/` is adapted from
[Matt Pocock's skills](https://github.com/mattpocock/skills) (MIT).

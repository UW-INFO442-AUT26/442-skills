# INFO 442 skills

Agent skills for INFO 442, Cooperative Software Development. Install them once,
and your agent can set up a React project, build you a practice exercise, plan a
roadmap, and write a spec, using the class conventions.

They're written for this course, but nothing stops you from using them elsewhere.

## Install

Run this in your project directory:

```bash
curl -fsSL https://raw.githubusercontent.com/UW-INFO442-AUT26/442-skills/main/install.sh | bash
```

It asks one question:

```
  Install the INFO 442 skills for:

    1) this project only   /Users/you/projects/my-app   (default)
    2) every project       /Users/you

  Choose 1 or 2 [1]:
```

Press Enter for your project. That's the usual answer for coursework: the skills
work in that directory and nowhere else. Choose 2 if you want them in every
project on your machine.

You can answer in advance instead, if you'd rather not be asked:

```bash
curl -fsSL .../install.sh | bash -s -- --project   # this project
curl -fsSL .../install.sh | bash -s -- --global    # this machine
```

Then restart your agent and ask for something: "build me a new React project".
Running the installer again is how you update.

Read [`install.sh`](install.sh) first if you want to see what it does. It's short.

## What it changes, and what it leaves alone

Installing only adds. Nothing you already have gets replaced.

|  | This project (the default) | This machine (option 2) |
|---|---|---|
| Skills go to | `.omp/skills/442-*` in this directory, and `.agents/skills` or `.claude/skills` if your project already has one | `~/.omp/agent/skills`, `~/.agents/skills`, and `~/.claude/skills` if you have Claude Code |
| Rules go to | your `AGENTS.md` | `~/.agents/AGENTS.md` |

If your project already keeps its rules in `.omp/AGENTS.md` or `CLAUDE.md`, the
installer writes into that file rather than making a second one.

**Your `AGENTS.md` keeps its content.** The class rules go in as a block between
two markers. Run the installer again and it rewrites that block, leaving the rest
of the file exactly as it was.

**Your own skills stay put.** The installer only replaces links that it made
itself. If you happen to have a skill with the same name as a class skill, it
tells you and skips that one.

**Projects stay separate.** A project install touches that directory only. A
machine install touches no project at all.

One thing worth knowing: the skills live in `~/.442-skills` and are linked into
place, so those links point at your home folder. If you commit a project, add
`.omp/skills/` to its `.gitignore`, or a teammate who clones it gets links that
go nowhere.

## Remove it

```bash
bash ~/.442-skills/uninstall.sh              # this project, and this machine
bash ~/.442-skills/uninstall.sh --project    # just this directory
bash ~/.442-skills/uninstall.sh --global     # just this machine
```

It removes the links and the rules block, and leaves everything else alone. The
checkout stays at `~/.442-skills` until you delete it yourself.

## The skills

| Skill | What it does |
|---|---|
| `442-react-init` | Sets up a clean Vite + React project: default boilerplate removed, INFO 442 home page in its place. |
| `442-create-exercise` | Turns a topic into a mobile-first practice exercise, and publishes it as a link you can open on your phone. |
| `442-create-roadmap` | Turns a project brief and your team's constraints into a week-by-week plan. |
| `442-create-personas` | Writes realistic user personas for a problem statement. |
| `442-create-names` | Works with you on a product name, and tests it against the alternatives. |
| `442-tdd` | Builds a change test first: write the failing test, make it pass, then clean it up. |
| `442-prioritize` | Sorts a pile of requirements and ideas into P0, P1, and P2. |
| `442-grill` | Asks you one question at a time until a vague idea becomes a written spec. |
| `442-brand` | The class colors, type, and spacing. Other skills read it, so you rarely call it yourself. |
| `442-write-skill` | How to write a skill for this repo. Read it before you contribute one. |

Call a skill by name, with the `442-` prefix. Or just describe what you want, and
your agent picks the one that fits.

## What goes into your AGENTS.md

Two class rules about AI use, so that anyone reading your work can see how it was
made:

- **Say which code an AI wrote**, in a comment that names what it did and how you
  used it.
- **Add a `Co-authored-by:` line to every commit an AI makes.** An AI is never the
  only author of a commit.

The installer writes both. The exact wording lives in
[`reference/agents-block.md`](reference/agents-block.md), so if the class changes
those rules, change them there rather than on your own machine.

## Contribute a skill

If you write a skill worth sharing, open a pull request. Every change gets
reviewed before it lands. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first, and
[`AGENTS.md`](AGENTS.md) for the rules this repo follows.

## Layout

```
skills/     one directory per skill: <name>/SKILL.md, plus whatever it needs
reference/  source documents the skills cite, including the AGENTS.md block
scripts/    check-repo.mjs, the gate, and the installer test
install.sh  the installer
```

## License

MIT. The skill-writing guide in `skills/442-write-skill/` is adapted from
[Matt Pocock's skills](https://github.com/mattpocock/skills), also MIT.

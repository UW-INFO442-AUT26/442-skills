---
name: 442-update
description: Brings the installed INFO 442 skills up to date. Use when a student asks whether their class skills are current, asks for a skill the class just added, or asks to update or refresh the skills.
---

# Update the class skills

Every install of these skills is a link into one checkout on the machine,
`~/.442-skills`, and the checkout is a git clone of the class repo. So an edit to
an existing skill arrives with a pull, but a skill added after someone installed
has to be linked in. One command does both, for every place this machine
installed.

## 1. Run the update

```bash
bash ~/.442-skills/install.sh --update
```

Run it from anywhere. It reads `~/.442-skills-installs`, which records one line
per project plus one for a machine-wide install, and refreshes each of them. It
also refreshes the class rules block in each project's `AGENTS.md`, so a change
to the rules reaches projects that were installed months ago.

If the checkout itself is gone, the same command rebuilds it, because it clones
before it reads the record:

```bash
curl -fsSL https://raw.githubusercontent.com/UW-INFO442-AUT26/442-skills/main/install.sh | bash -s -- --update
```

**Done when** the last line of the output says "Already at the latest" or
"Updated N place(s)".

## 2. Report what changed

The command names the skills that are new, changed, or gone upstream. Give the
student those names and nothing else, in one or two lines. If nothing changed,
say that plainly instead of describing the update.

## 3. Say that the agent needs a restart

A skill that arrived in this update was not in the agent's list when the session
started, so it cannot be invoked until the agent restarts. Say so once, and name
the new skills so the student knows what to try.

## 4. When it fails

- **"Could not reach"**: no network to GitHub. The installed skills still work.
- **"has changes that stop it updating"**: someone edited the checkout by hand.
  Copy out anything wanted, then `rm -rf ~/.442-skills` and run the install
  one-liner again.
- **"No install is recorded on this machine"**: nothing is installed here yet, so
  there is nothing to update. `cd` into the project and run the installer from
  the repo README without `--update`.

## What's next

Restart the agent, then ask for one of the skills the update named by name, or
describe the task and let the agent pick.

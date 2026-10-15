#!/usr/bin/env bash
# Exercises install.sh and uninstall.sh in throwaway directories. The point is
# the promise that installing is additive: an existing AGENTS.md keeps its
# content, and skills that are already in the target folder are left alone.
#
#   bash scripts/test-install.sh
set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

FAILED=0
ok()   { printf '  ok   %s\n' "$*"; }
fail() { printf '  FAIL %s\n' "$*" >&2; FAILED=1; }
check() { if [ "$1" = "0" ]; then ok "$2"; else fail "$2"; fi; }
contains()  { grep -qF "$2" "$1"; check $? "$3"; }
not_contains() { grep -qF "$2" "$1"; [ $? -ne 0 ]; check $? "$3"; }
count_of()  { printf '%s' "$(grep -cF "$2" "$1")"; }

# A snapshot of the working tree as a one-commit git repo, so the installer's
# clone path runs against exactly the files under test.
SRC="$WORK/src"
mkdir -p "$SRC"
cp -R "$REPO_DIR/." "$SRC/"
rm -rf "$SRC/.git"
git -C "$SRC" init -q -b main
git -C "$SRC" add -A
git -C "$SRC" -c user.name=test -c user.email=test@example.com commit -qm snapshot

HOME_DIR="$WORK/home"
mkdir -p "$HOME_DIR"

# Runs the installer with a fake HOME and its own checkout, so nothing on the
# real machine is touched. stdin is /dev/null: no terminal, so it must fall
# back to the project scope on its own.
run_install() {
  ( cd "$1" && shift && env HOME="$HOME_DIR" INFO442_SKILLS_HOME="$WORK/checkout" \
      INFO442_SKILLS_REPO="$SRC" bash "$REPO_DIR/install.sh" "$@" ) < /dev/null
}
run_uninstall() {
  ( cd "$1" && shift && env HOME="$HOME_DIR" INFO442_SKILLS_HOME="$WORK/checkout" \
      bash "$REPO_DIR/uninstall.sh" "$@" ) < /dev/null
}

printf '\n1. a fresh project, no terminal to ask on\n'
P="$WORK/fresh"
mkdir -p "$P"
run_install "$P" > "$WORK/log1" 2>&1
check $? "installer exits clean"
[ -f "$P/AGENTS.md" ]; check $? "AGENTS.md was created"
contains "$WORK/log1" "No terminal to ask on" "defaulted to the project scope"
[ -L "$P/.omp/skills/442-brand" ]; check $? "skills are linked into .omp/skills"
[ -L "$P/.opencode/skills/442-brand" ]; check $? "skills are linked into .opencode/skills"
[ -f "$P/.omp/skills/442-brand/SKILL.md" ]; check $? "the link resolves to a real SKILL.md"
[ -d "$P/.claude" ]; [ $? -ne 0 ]; check $? "no .claude directory was invented"
[ -f "$HOME_DIR/.agents/AGENTS.md" ]; [ $? -ne 0 ]; check $? "the global AGENTS.md was left alone"
[ -d "$HOME_DIR/.config/opencode" ]; [ $? -ne 0 ]; check $? "no OpenCode config directory was invented"
[ -f "$P/.gitignore" ]; [ $? -ne 0 ]; check $? "no .gitignore was invented outside a repository"
contains "$WORK/log1" "is not a git repository" "and the folder was questioned"

printf '\n2. a project that already has an AGENTS.md and a skills folder\n'
P="$WORK/existing"
mkdir -p "$P/.omp/skills/keep-me" "$P/.omp/skills/442-react-init" "$P/.claude"
printf '# My project\n\nSome house rules.\n' > "$P/AGENTS.md"
printf '# not ours\n' > "$P/.omp/skills/keep-me/SKILL.md"
printf '# a skill of mine\n' > "$P/.omp/skills/442-react-init/SKILL.md"
run_install "$P" > "$WORK/log2" 2>&1
check $? "installer exits clean"
contains "$P/AGENTS.md" "Some house rules." "the existing AGENTS.md content survived"
contains "$P/AGENTS.md" "<!-- BEGIN 442-skills" "the rules block was added"
not_contains "$P/AGENTS.md" "This machine has" "the block does not claim a machine-wide install"
[ -f "$P/.omp/skills/keep-me/SKILL.md" ]; check $? "an unrelated skill survived"
[ -L "$P/.omp/skills/442-react-init" ]; [ $? -ne 0 ]; check $? "a name clash was not overwritten"
contains "$P/.omp/skills/442-react-init/SKILL.md" "a skill of mine" "the clashing file is untouched"
contains "$WORK/log2" "leaving it alone" "the clash was reported"
[ -L "$P/.claude/skills/442-brand" ]; check $? "the existing .claude directory got the skills too"
[ "$(count_of "$P/AGENTS.md" "<!-- BEGIN 442-skills")" = "1" ]; check $? "exactly one rules block"

printf '\n3. running it again changes nothing\n'
cp "$P/AGENTS.md" "$WORK/before.md"
run_install "$P" > "$WORK/log3" 2>&1
check $? "re-running exits clean"
contains "$WORK/log3" "Refreshed the INFO 442 rules block" "the block is refreshed, not appended again"
diff -q "$WORK/before.md" "$P/AGENTS.md" > /dev/null; check $? "AGENTS.md is byte for byte the same"
[ "$(count_of "$P/AGENTS.md" "Some house rules.")" = "1" ]; check $? "the existing content is still there once"

printf '\n4. an AGENTS.md that is only an empty file, and a CLAUDE.md project\n'
P="$WORK/bare"
mkdir -p "$P"
: > "$P/AGENTS.md"
run_install "$P" > /dev/null 2>&1
contains "$P/AGENTS.md" "<!-- BEGIN 442-skills" "an empty AGENTS.md still gets the block"
[ "$(count_of "$P/AGENTS.md" "<!-- BEGIN 442-skills")" = "1" ]; check $? "and only one of them"

P="$WORK/claude-only"
mkdir -p "$P"
printf '# Claude rules\n' > "$P/CLAUDE.md"
run_install "$P" > /dev/null 2>&1
contains "$P/CLAUDE.md" "Claude rules" "a CLAUDE.md project keeps its file"
contains "$P/CLAUDE.md" "<!-- BEGIN 442-skills" "and gets the block"
[ -f "$P/AGENTS.md" ]; [ $? -ne 0 ]; check $? "no second rules file was created"

P="$WORK/omp-rules"
mkdir -p "$P/.omp"
printf '# Project rules, kept in .omp\n' > "$P/.omp/AGENTS.md"
run_install "$P" > /dev/null 2>&1
contains "$P/.omp/AGENTS.md" "kept in .omp" "a project using .omp/AGENTS.md keeps its file"
contains "$P/.omp/AGENTS.md" "<!-- BEGIN 442-skills" "and gets the block there"
[ -f "$P/AGENTS.md" ]; [ $? -ne 0 ]; check $? "no root AGENTS.md was invented beside it"
run_uninstall "$P" --project > /dev/null 2>&1
contains "$P/.omp/AGENTS.md" "kept in .omp" "uninstall leaves that file's content"
not_contains "$P/.omp/AGENTS.md" "<!-- BEGIN 442-skills" "and takes the block back out"

printf '\n5. --global leaves the project alone\n'
P="$WORK/global"
mkdir -p "$P" "$HOME_DIR/.agents"
printf '# Global rules\n' > "$HOME_DIR/.agents/AGENTS.md"
run_install "$P" --global > "$WORK/log5" 2>&1
check $? "installer exits clean"
[ -L "$HOME_DIR/.omp/agent/skills/442-brand" ]; check $? "linked into the OMP user directory"
[ -L "$HOME_DIR/.agents/skills/442-brand" ]; check $? "linked into the shared user directory"
contains "$HOME_DIR/.agents/AGENTS.md" "Global rules" "the global AGENTS.md content survived"
contains "$HOME_DIR/.agents/AGENTS.md" "<!-- BEGIN 442-skills" "and gained the block"
[ -d "$P/.omp" ]; [ $? -ne 0 ]; check $? "the project was not touched"
contains "$WORK/log5" "Installed for every project on this machine" "the summary says what happened"

printf '\n6. a project install in the home directory is treated as global\n'
run_install "$HOME_DIR" > "$WORK/log6" 2>&1
check $? "installer exits clean"
contains "$WORK/log6" "would apply everywhere under it" "the trap was called out"
contains "$WORK/log6" "Installed for every project on this machine" "and resolved to a global install"
[ -d "$HOME_DIR/.omp/skills" ]; [ $? -ne 0 ]; check $? "no ancestor skills folder was created"

printf '\n7. uninstall takes out only what it put in\n'
P="$WORK/existing"
run_uninstall "$P" --project > "$WORK/log7" 2>&1
check $? "uninstaller exits clean"
contains "$P/AGENTS.md" "Some house rules." "the project's own content is still there"
not_contains "$P/AGENTS.md" "<!-- BEGIN 442-skills" "the rules block is gone"
[ -L "$P/.omp/skills/442-brand" ]; [ $? -ne 0 ]; check $? "the links are gone"
[ -f "$P/.omp/skills/keep-me/SKILL.md" ]; check $? "an unrelated skill survived"
[ -f "$P/.omp/skills/442-react-init/SKILL.md" ]; check $? "the clashing skill survived"
[ -d "$P/.claude/skills" ]; check $? "the skills folder itself is left in place"

run_uninstall "$P" --global > "$WORK/log8" 2>&1
not_contains "$HOME_DIR/.agents/AGENTS.md" "<!-- BEGIN 442-skills" "the global block is gone"
contains "$HOME_DIR/.agents/AGENTS.md" "Global rules" "and the global content survived"
[ -L "$HOME_DIR/.omp/agent/skills/442-brand" ]; [ $? -ne 0 ]; check $? "the global links are gone"

printf '\n8. a file where a symlink would go is reported, not deleted\n'
P="$WORK/fileclash"
mkdir -p "$P/.omp/skills"
printf 'not a directory\n' > "$P/.omp/skills/442-brand"
run_install "$P" > "$WORK/log9" 2>&1
check $? "installer exits clean"
[ -f "$P/.omp/skills/442-brand" ]; check $? "the file is still a file"
contains "$WORK/log9" "leaving it alone" "and it was reported"

printf '\n9. a machine with OpenCode configured\n'
P="$WORK/opencode"
mkdir -p "$P" "$HOME_DIR/.config/opencode"
run_install "$P" --global > "$WORK/log10" 2>&1
check $? "installer exits clean"
[ -f "$HOME_DIR/.config/opencode/AGENTS.md" ]; check $? "the OpenCode rules file was created"
contains "$HOME_DIR/.config/opencode/AGENTS.md" "<!-- BEGIN 442-skills" "and got the rules block"
run_uninstall "$P" --global > /dev/null 2>&1
not_contains "$HOME_DIR/.config/opencode/AGENTS.md" "<!-- BEGIN 442-skills" "uninstall takes it back out"

printf '\n10. a rules file that is a symlink\n'
P="$WORK/symlinked"
mkdir -p "$P" "$WORK/dotfiles"
printf '# My rules, kept in a dotfiles repo\n' > "$WORK/dotfiles/AGENTS.md"
ln -s "$WORK/dotfiles/AGENTS.md" "$P/AGENTS.md"
run_install "$P" > "$WORK/log11" 2>&1
check $? "installer exits clean"
[ -L "$P/AGENTS.md" ]; check $? "the symlink is still a symlink"
contains "$WORK/log11" "not writing through it" "and following it was refused"
not_contains "$WORK/dotfiles/AGENTS.md" "<!-- BEGIN 442-skills" "the file it points at was not edited"
[ -L "$P/.opencode/skills/442-brand" ]; check $? "the skills installed anyway"

# A block an older installer left through the link is still cleaned up, and
# the link survives the cleanup.
printf '# My rules\n\n<!-- BEGIN 442-skills (old run) -->\nleft behind\n<!-- END 442-skills -->\n' > "$WORK/dotfiles/AGENTS.md"
run_uninstall "$P" --project > "$WORK/log12" 2>&1
contains "$WORK/dotfiles/AGENTS.md" "My rules" "uninstall keeps the linked file's own content"
not_contains "$WORK/dotfiles/AGENTS.md" "<!-- BEGIN 442-skills" "and removes the block through the link"
[ -L "$P/AGENTS.md" ]; check $? "the symlink survived the uninstall"

printf '\n11. standing in a subfolder of a project\n'
P="$WORK/subfolder"
mkdir -p "$P/src/components"
git -C "$P" init -q -b main
# The installer reports the resolved path (pwd -P), so compare like for like.
P="$(cd "$P" && pwd -P)"
run_install "$P/src/components" > "$WORK/log13" 2>&1
check $? "installer exits clean"
contains "$WORK/log13" "subfolder of the project at $P" "the subfolder was called out"
[ -L "$P/.omp/skills/442-brand" ]; check $? "the skills went to the project root"
[ -d "$P/src/components/.omp" ]; [ $? -ne 0 ]; check $? "nothing was left in the subfolder"
contains "$P/AGENTS.md" "<!-- BEGIN 442-skills" "the rules went to the root AGENTS.md"
[ -f "$P/src/components/AGENTS.md" ]; [ $? -ne 0 ]; check $? "and no rules file was made in the subfolder"
contains "$P/.gitignore" ".omp/skills/" "the links were added to .gitignore"
contains "$P/.gitignore" ".opencode/skills/" "both folders were"
run_install "$P/src/components" > /dev/null 2>&1
[ "$(count_of "$P/.gitignore" ".omp/skills/")" = "1" ]; check $? "a second run does not duplicate the entry"
run_uninstall "$P/src/components" --project > /dev/null 2>&1
[ -L "$P/.omp/skills/442-brand" ]; [ $? -ne 0 ]; check $? "uninstall finds the root install from the subfolder"

printf '\n12. a system or temporary directory\n'
run_install / > "$WORK/log14" 2>&1
[ $? -ne 0 ]; check $? "installer refuses /"
contains "$WORK/log14" "system or temporary directory" "and says why"
run_install /tmp > "$WORK/log15" 2>&1
[ $? -ne 0 ]; check $? "installer refuses /tmp"
not_contains "$WORK/log15" "Linked" "and linked nothing"

printf '\n13. a checkout of the skills repo itself\n'
run_install "$SRC" > "$WORK/log16" 2>&1
[ $? -ne 0 ]; check $? "installer refuses the checkout"
contains "$WORK/log16" "checkout of the 442-skills repo" "and says why"
not_contains "$SRC/AGENTS.md" "<!-- BEGIN 442-skills" "the repo's own AGENTS.md was left alone"

printf '\n14. a config directory that is a file\n'
P="$WORK/ocfile"
mkdir -p "$P"
printf 'not a directory\n' > "$P/.opencode"
run_install "$P" > "$WORK/log17" 2>&1
check $? "installer exits clean"
contains "$WORK/log17" "Could not create" "the unusable target was reported"
[ -L "$P/.omp/skills/442-brand" ]; check $? "the other targets still worked"

if [ "$FAILED" = "0" ]; then
  printf '\ninstall.sh behaves. All checks passed.\n'
else
  printf '\ninstall.sh has failures. See FAIL lines above.\n' >&2
fi
exit "$FAILED"

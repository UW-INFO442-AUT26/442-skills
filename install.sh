#!/usr/bin/env bash
# Install the INFO 442 skills for the current user.
#
#   curl -fsSL https://raw.githubusercontent.com/UW-INFO442-AUT26/442-skills/main/install.sh | bash
#
# Clones (or updates) the repo into ~/.442-skills, symlinks every skill
# into each agent harness's skills directory, and adds the INFO 442 rules
# block to ~/.agents/AGENTS.md. Re-run any time to update.
set -euo pipefail

REPO="${INFO442_SKILLS_REPO:-UW-INFO442-AUT26/442-skills}"
BRANCH="${INFO442_SKILLS_BRANCH:-main}"
DEST="${INFO442_SKILLS_HOME:-$HOME/.442-skills}"
# Accept a GitHub slug (owner/name), or a full URL / local path for testing.
case "$REPO" in
  *://*|/*|./*|../*) CLONE_URL="$REPO" ;;
  *) CLONE_URL="https://github.com/${REPO}.git" ;;
esac

say()  { printf '\033[35m[442-skills]\033[0m %s\n' "$*"; }
warn() { printf '\033[33m[442-skills]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[31m[442-skills]\033[0m %s\n' "$*" >&2; exit 1; }

command -v git >/dev/null 2>&1 || die "git is required but was not found."

# 1. Get the repo: update an existing checkout, else clone.
if [ -d "$DEST/.git" ]; then
  say "Updating $DEST"
  git -C "$DEST" fetch --quiet origin "$BRANCH"
  git -C "$DEST" checkout --quiet "$BRANCH"
  git -C "$DEST" pull --quiet --ff-only origin "$BRANCH"
else
  say "Cloning into $DEST"
  mkdir -p "$(dirname "$DEST")"
  git clone --quiet --depth 1 --branch "$BRANCH" "$CLONE_URL" "$DEST" \
    || die "Could not clone $CLONE_URL. Check the repo name and your network."
fi

[ -d "$DEST/skills" ] || die "$DEST/skills is missing; the clone looks wrong."

# 2. Symlink each skill into every agent harness that is present on this
#    machine. A symlink means `install.sh` again is the update path.
link_into() {
  local skills_dir="$1" name src count=0
  mkdir -p "$skills_dir"
  for src in "$DEST"/skills/*/; do
    [ -d "$src" ] || continue
    name="$(basename "$src")"
    rm -rf "$skills_dir/$name"
    ln -s "${src%/}" "$skills_dir/$name"
    count=$((count + 1))
  done
  say "Linked $count skills into $skills_dir"
}

# ~/.agents is the shared skills location (opencode, opencode-go, omp, and others).
link_into "$HOME/.agents/skills"
# Claude Code reads its own directory, when the user has it.
if [ -d "$HOME/.claude" ]; then
  link_into "$HOME/.claude/skills"
fi

# 3. Add the INFO 442 rules block to the user's global AGENTS.md, idempotently.
AGENTS_MD="$HOME/.agents/AGENTS.md"
BLOCK_FILE="$DEST/reference/agents-block.md"
BEGIN_MARK="<!-- BEGIN 442-skills"
END_MARK="<!-- END 442-skills -->"
if [ -f "$BLOCK_FILE" ]; then
  mkdir -p "$HOME/.agents"
  touch "$AGENTS_MD"
  if grep -q "$BEGIN_MARK" "$AGENTS_MD" 2>/dev/null; then
    # Replace the managed block in place, preserving everything around it.
    tmp="$(mktemp)"
    awk -v begin="$BEGIN_MARK" -v end="$END_MARK" '
      $0 ~ begin { skip = 1 }
      skip != 1 { print }
      $0 ~ end { skip = 0 }
    ' "$AGENTS_MD" > "$tmp"
    # Drop a trailing blank line left behind, then append the fresh block.
    printf '%s\n\n' "$(cat "$tmp")" > "$tmp"
    cat "$BLOCK_FILE" >> "$tmp"
    mv "$tmp" "$AGENTS_MD"
    say "Refreshed the INFO 442 rules block in $AGENTS_MD"
  else
    printf '\n' >> "$AGENTS_MD"
    cat "$BLOCK_FILE" >> "$AGENTS_MD"
    say "Added the INFO 442 rules block to $AGENTS_MD"
  fi
fi

say "Done. Skills installed:"
for d in "$DEST"/skills/*/; do printf '  %s\n' "$(basename "$d")"; done
say "Restart your agent, then try one, for example: \"build me a React project\"."

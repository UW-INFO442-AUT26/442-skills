#!/usr/bin/env bash
# Remove the INFO 442 skills: the symlinks and the AGENTS.md rules block.
#
#   bash ~/.442-skills/uninstall.sh              # this project, and this machine
#   bash ~/.442-skills/uninstall.sh --project    # the directory you are in
#   bash ~/.442-skills/uninstall.sh --global     # every project on this machine
#
# Only symlinks that point into the INFO 442 checkout are removed, and only
# the managed rules block is taken out of AGENTS.md. Everything else is left
# where it is.
set -euo pipefail

DEST="${INFO442_SKILLS_HOME:-$HOME/.442-skills}"
PROJECT_DIR="$PWD"

BEGIN_MARK="<!-- BEGIN 442-skills"
END_MARK="<!-- END 442-skills -->"

say()  { printf '\033[35m[442-skills]\033[0m %s\n' "$*"; }
warn() { printf '\033[33m[442-skills]\033[0m %s\n' "$*" >&2; }

SCOPE="both"
for arg in "$@"; do
  case "$arg" in
    --project|-p) SCOPE=project ;;
    --global|-g)  SCOPE=global ;;
    -h|--help)
      sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) warn "Ignoring unknown option: $arg" ;;
  esac
done

DIRS=()
AGENTS_FILES=()
if [ "$SCOPE" != "global" ]; then
  DIRS+=("$PROJECT_DIR/.omp/skills")
  DIRS+=("$PROJECT_DIR/.opencode/skills")
  DIRS+=("$PROJECT_DIR/.agents/skills")
  DIRS+=("$PROJECT_DIR/.claude/skills")
  AGENTS_FILES+=("$PROJECT_DIR/AGENTS.md")
  AGENTS_FILES+=("$PROJECT_DIR/.omp/AGENTS.md")
  AGENTS_FILES+=("$PROJECT_DIR/CLAUDE.md")
fi
if [ "$SCOPE" != "project" ]; then
  DIRS+=("$HOME/.omp/agent/skills")
  DIRS+=("$HOME/.agents/skills")
  DIRS+=("$HOME/.claude/skills")
  AGENTS_FILES+=("$HOME/.agents/AGENTS.md")
  AGENTS_FILES+=("$HOME/.config/opencode/AGENTS.md")
fi

removed=0
for skills_dir in "${DIRS[@]}"; do
  [ -d "$skills_dir" ] || continue
  for link in "$skills_dir"/442-*; do
    [ -L "$link" ] || continue
    case "$(readlink "$link")" in
      "$DEST"/*) rm -f "$link"; say "Removed $link"; removed=$((removed + 1)) ;;
      *) warn "$link points at $(readlink "$link"), not at $DEST; leaving it alone" ;;
    esac
  done
done
[ "$removed" -gt 0 ] || say "No INFO 442 skills were linked in the places checked."

for agents_md in "${AGENTS_FILES[@]}"; do
  [ -f "$agents_md" ] || continue
  grep -qF "$BEGIN_MARK" "$agents_md" || continue
  tmp="$(mktemp)"
  awk -v b="$BEGIN_MARK" -v e="$END_MARK" '
    index($0, b) > 0 { skip = 1 }
    skip && index($0, e) > 0 { skip = 0; next }
    !skip { print }
  ' "$agents_md" > "$tmp"
  # Drop the blank lines the removed block left at the end.
  awk '{ if ($0 ~ /^[[:space:]]*$/) { blanks++; next } for (i = 0; i < blanks; i++) print ""; blanks = 0; print }' \
    "$tmp" > "$tmp.trim"
  # mv onto a symlink would replace the link with a regular file, so write
  # through it and leave the link itself in place.
  if [ -L "$agents_md" ]; then
    cat "$tmp.trim" > "$agents_md"
  else
    mv "$tmp.trim" "$agents_md"
  fi
  rm -f "$tmp"
  say "Removed the INFO 442 rules block from $agents_md"
done

say "Done. The checkout at $DEST is left in place; remove it with: rm -rf $DEST"

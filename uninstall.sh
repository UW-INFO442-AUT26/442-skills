#!/usr/bin/env bash
# Remove the INFO 442 skills and their AGENTS.md block.
#   ~/.442-skills/uninstall.sh
set -euo pipefail

DEST="${INFO442_SKILLS_HOME:-$HOME/.442-skills}"
AGENTS_MD="$HOME/.agents/AGENTS.md"

say() { printf '\033[35m[442-skills]\033[0m %s\n' "$*"; }

for skills_dir in "$HOME/.agents/skills" "$HOME/.claude/skills"; do
  [ -d "$skills_dir" ] || continue
  for link in "$skills_dir"/442-*; do
    [ -L "$link" ] || continue
    case "$(readlink "$link")" in
      "$DEST"/*) rm -f "$link"; say "Removed $link" ;;
    esac
  done
done

if [ -f "$AGENTS_MD" ] && grep -q "<!-- BEGIN 442-skills" "$AGENTS_MD"; then
  tmp="$(mktemp)"
  awk '/<!-- BEGIN 442-skills/{skip=1} skip!=1{print} /<!-- END 442-skills -->/{skip=0}' \
    "$AGENTS_MD" > "$tmp"
  # Collapse the blank line the removed block left behind.
  awk 'BEGIN{blank=0} /^$/{blank++; if(blank>1) next} !/^$/{blank=0} {print}' "$tmp" > "$AGENTS_MD"
  rm -f "$tmp"
  say "Removed the INFO 442 rules block from $AGENTS_MD"
fi

say "Skills unlinked. The checkout at $DEST is left in place; remove it with: rm -rf $DEST"

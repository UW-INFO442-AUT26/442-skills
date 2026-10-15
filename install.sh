#!/usr/bin/env bash
# INFO 442 skills installer.
#
#   curl -fsSL https://raw.githubusercontent.com/UW-INFO442-AUT26/442-skills/main/install.sh | bash
#
# The skills land in the project you are standing in, so they are available
# there and nowhere else. The installer asks first: answer 2 to install them
# for every session on this machine instead.
#
#   ... | bash -s -- --project     # this project, no question
#   ... | bash -s -- --global      # this machine, no question
#
# Installing is additive. An existing AGENTS.md keeps its content and gains
# the INFO 442 rules; skills that are already in the target folder are left
# alone. Re-run any time to update.
#
# It refuses the mistake rather than making it: a system directory, the
# installer's own checkout, a folder you cannot write to, or a subfolder of a
# project, where the skills would be invisible to an agent started at the
# project root. In the home directory it installs globally instead, because
# that is what a project install there would amount to.
set -euo pipefail

REPO="${INFO442_SKILLS_REPO:-UW-INFO442-AUT26/442-skills}"
BRANCH="${INFO442_SKILLS_BRANCH:-main}"
DEST="${INFO442_SKILLS_HOME:-$HOME/.442-skills}"
PROJECT_DIR="$(pwd -P)"
# $HOME can be spelled through a symlink while PROJECT_DIR is resolved, so
# resolve HOME the same way before the two are compared.
REAL_HOME="$(cd "$HOME" 2>/dev/null && pwd -P || printf '%s' "$HOME")"

BLOCK_FILE_NAME="reference/agents-block.md"
BEGIN_MARK="<!-- BEGIN 442-skills"
END_MARK="<!-- END 442-skills -->"

say()  { printf '\033[35m[442-skills]\033[0m %s\n' "$*"; }
warn() { printf '\033[33m[442-skills]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[31m[442-skills]\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Install the INFO 442 skills.

  --project, -p   install for the directory you are in (the default)
  --global,  -g   install for every session on this machine
  --help,    -h   print this text

With no flag, the installer asks and defaults to this project.
EOF
}

# Accept a GitHub slug (owner/name), or a full URL / local path for testing.
case "$REPO" in
  *://*|/*|./*|../*) CLONE_URL="$REPO" ;;
  *) CLONE_URL="https://github.com/${REPO}.git" ;;
esac

SCOPE=""
for arg in "$@"; do
  case "$arg" in
    --project|-p) SCOPE=project ;;
    --global|-g)  SCOPE=global ;;
    -h|--help)    usage; exit 0 ;;
    *) warn "Ignoring unknown option: $arg" ;;
  esac
done
if [ -z "$SCOPE" ]; then
  case "${INFO442_SKILLS_SCOPE:-}" in
    project|global) SCOPE="$INFO442_SKILLS_SCOPE" ;;
  esac
fi

# --- Before anything is downloaded -------------------------------------------
# What goes wrong for a first-time user is almost always the directory, and
# every check here is cheaper than catching it halfway through an install.

[ "$(id -u)" = "0" ] && die "Do not run this with sudo. Run it as yourself, in the project folder you are working in."

command -v git >/dev/null 2>&1 || die "git is required but was not found."

# Agents look for skills upward from the folder they start in, never downward.
# So the useful place to install is the project root: standing in a subfolder
# of a repo, the skills would load only while the agent starts right there.
if [ "$SCOPE" != "global" ]; then
  repo_root="$(git -C "$PROJECT_DIR" rev-parse --show-toplevel 2>/dev/null || true)"
  if [ -n "$repo_root" ] && [ "$repo_root" != "$PROJECT_DIR" ] && [ "$repo_root" != "$REAL_HOME" ]; then
    warn "You are in a subfolder of the project at $repo_root."
    warn "Skills installed here would load only when your agent starts in this folder, so using the project root instead."
    PROJECT_DIR="$repo_root"
  fi
fi

# A project install in the home directory would be found by every directory
# under it, which is a global install with extra steps. Say so and do the
# thing they meant.
if [ "$PROJECT_DIR" = "$REAL_HOME" ] && [ "$SCOPE" != "global" ]; then
  warn "You are in your home directory, where a project install would apply everywhere under it."
  warn "Installing for every session on this machine instead."
  SCOPE=global
fi

if [ "$SCOPE" != "global" ]; then
  case "$PROJECT_DIR" in
    /|/Users|/home|/root|/tmp|/private/tmp|/var|/etc|/etc/*|/usr|/usr/*|/bin|/sbin|/opt|/opt/*|/Applications|/Applications/*|/System|/System/*|/Library|/Library/*|/Volumes)
      die "$PROJECT_DIR is a system or temporary directory, not a project folder. Open a terminal in your project (cd path/to/your-project) and run this again, or add --global to install it for every folder on the machine."
      ;;
  esac
  case "$PROJECT_DIR" in
    "$DEST"|"$DEST"/*)
      die "That is the installer's own checkout at $DEST. Run this from your project folder instead, or add --global."
      ;;
  esac
  if [ -f "$PROJECT_DIR/reference/agents-block.md" ]; then
    die "That looks like a checkout of the 442-skills repo itself. Run this from your project folder instead, or add --global."
  fi
  [ -w "$PROJECT_DIR" ] || die "You cannot write to $PROJECT_DIR. Run this from your project folder instead, or add --global."
fi

# Ask, unless a flag or the environment already answered. The prompt reads the
# terminal directly, because a piped install has no usable stdin.
if [ -z "$SCOPE" ]; then
  if [ -t 2 ] && [ -r /dev/tty ]; then
    {
      printf '\n  Install the INFO 442 skills for:\n\n'
      printf '    1) this project only   %s   (default)\n' "$PROJECT_DIR"
      printf '    2) every project       %s\n' "$HOME"
      printf '\n  Choose 1 or 2 [1]: '
    } > /dev/tty
    answer=""
    read -r answer < /dev/tty || answer=""
    printf '\n' > /dev/tty
    case "$answer" in
      2|g|G|global) SCOPE=global ;;
      *) SCOPE=project ;;
    esac
  else
    SCOPE=project
    say "No terminal to ask on, so installing for this project. Pass --global to change that."
  fi
fi

# 1. Get the repo: update an existing checkout, else clone.
if [ "$SCOPE" = "project" ] && ! git -C "$PROJECT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
  warn "$PROJECT_DIR is not a git repository, so this may not be the folder you meant."
  warn "Installing here anyway; the skills load in this folder and everything under it."
fi

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
BLOCK_FILE="$DEST/$BLOCK_FILE_NAME"
[ -f "$BLOCK_FILE" ] || die "$DEST/$BLOCK_FILE_NAME is missing; the clone looks wrong."

# 2. Where the skills go. Each harness reads its own folder, so the targets
#    depend on which one is present. `.omp/skills` and `.opencode/skills` are
#    both native project locations that their harness always scans, so they are
#    always created; the others are only touched when their config directory
#    already exists.
TARGETS=()
RULES_FILES=()
if [ "$SCOPE" = "project" ]; then
  TARGETS+=("$PROJECT_DIR/.omp/skills")
  TARGETS+=("$PROJECT_DIR/.opencode/skills")
  [ -d "$PROJECT_DIR/.agents" ] && TARGETS+=("$PROJECT_DIR/.agents/skills")
  [ -d "$PROJECT_DIR/.claude" ] && TARGETS+=("$PROJECT_DIR/.claude/skills")
  if [ -f "$PROJECT_DIR/AGENTS.md" ]; then
    RULES_FILES+=("$PROJECT_DIR/AGENTS.md")
  elif [ -f "$PROJECT_DIR/.omp/AGENTS.md" ]; then
    RULES_FILES+=("$PROJECT_DIR/.omp/AGENTS.md")
  elif [ -f "$PROJECT_DIR/CLAUDE.md" ]; then
    RULES_FILES+=("$PROJECT_DIR/CLAUDE.md")
  else
    RULES_FILES+=("$PROJECT_DIR/AGENTS.md")
  fi
else
  TARGETS+=("$HOME/.omp/agent/skills")
  TARGETS+=("$HOME/.agents/skills")
  [ -d "$HOME/.claude" ] && TARGETS+=("$HOME/.claude/skills")
  RULES_FILES+=("$HOME/.agents/AGENTS.md")
  # OpenCode reads its rules from its own global file, not from
  # ~/.agents/AGENTS.md. Only touch it where OpenCode is set up.
  [ -d "$HOME/.config/opencode" ] && RULES_FILES+=("$HOME/.config/opencode/AGENTS.md")
fi

# Symlinks, so running install.sh again is the update path. Anything already
# in the folder that we did not put there is never deleted.
link_into() {
  local skills_dir="$1" src name target linked=0 skipped=0
  if ! mkdir -p "$skills_dir" 2>/dev/null; then
    warn "Could not create $skills_dir; skipping it"
    return 0
  fi
  for src in "$DEST"/skills/*/; do
    [ -d "$src" ] || continue
    name="$(basename "$src")"
    target="$skills_dir/$name"
    if [ -L "$target" ]; then
      case "$(readlink "$target")" in
        "$DEST"/*) rm -f "$target" ;;
        *)
          warn "$target is a symlink to $(readlink "$target"); leaving it alone"
          skipped=$((skipped + 1))
          continue
          ;;
      esac
    elif [ -e "$target" ]; then
      warn "$target already exists and was not put there by this installer; leaving it alone"
      skipped=$((skipped + 1))
      continue
    fi
    ln -s "${src%/}" "$target"
    linked=$((linked + 1))
  done
  if [ "$skipped" -gt 0 ]; then
    say "Linked $linked skills into $skills_dir ($skipped left alone)"
  else
    say "Linked $linked skills into $skills_dir"
  fi
}

for dir in "${TARGETS[@]}"; do
  link_into "$dir"
done

# 3. Add the INFO 442 rules to the project's or the user's AGENTS.md. The block
#    is stamped, so a re-run refreshes it and everything else in the file is
#    left exactly as it was.
upsert_block() {
  local file="$1" tmp
  # A symlinked rules file belongs to whatever it points at, which is usually
  # another repo. Writing through it would edit a file outside the one being
  # installed into, so say so and leave it alone.
  if [ -L "$file" ]; then
    warn "$file is a symlink to $(readlink "$file"); not writing through it"
    warn "The INFO 442 rules are in $BLOCK_FILE if you want to add them there yourself"
    return 0
  fi
  mkdir -p "$(dirname "$file")"
  [ -f "$file" ] || : > "$file"
  tmp="$(mktemp)"
  if grep -qF "$BEGIN_MARK" "$file"; then
    awk -v b="$BEGIN_MARK" -v e="$END_MARK" '
      index($0, b) > 0 { skip = 1 }
      skip && index($0, e) > 0 { skip = 0; next }
      !skip { print }
    ' "$file" > "$tmp"
    # Drop the blank lines the removed block left at the end, and any it ate
    # from the middle, without touching the rest of the file.
    awk '{ if ($0 ~ /^[[:space:]]*$/) { blanks++; next } for (i = 0; i < blanks; i++) print ""; blanks = 0; print }' "$tmp" > "$tmp.trim"
    mv "$tmp.trim" "$tmp"
    {
      cat "$tmp"
      [ -s "$tmp" ] && printf '\n'
      cat "$BLOCK_FILE"
    } > "$file"
    say "Refreshed the INFO 442 rules block in $file"
  else
    {
      [ -s "$file" ] && printf '\n'
      cat "$BLOCK_FILE"
    } >> "$file"
    say "Added the INFO 442 rules block to $file"
  fi
  rm -f "$tmp"
}

for file in "${RULES_FILES[@]}"; do
  upsert_block "$file"
done

# 4. Keep the links out of git. They point into the home folder, so a teammate
#    who cloned the project would get links that go nowhere.
IN_REPO=0
if [ "$SCOPE" = "project" ] && git -C "$PROJECT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
  IN_REPO=1
  GITIGNORE="$PROJECT_DIR/.gitignore"
  if [ -e "$GITIGNORE" ] && [ ! -w "$GITIGNORE" ]; then
    warn "$GITIGNORE is not writable, so add .omp/skills/ and .opencode/skills/ to it yourself"
  else
    added=0
    for entry in ".omp/skills/" ".opencode/skills/"; do
      grep -qxF "$entry" "$GITIGNORE" 2>/dev/null && continue
      if [ "$added" = "0" ]; then
        [ -s "$GITIGNORE" ] && printf '\n' >> "$GITIGNORE"
        printf '# class skills, linked in from the 442 checkout\n' >> "$GITIGNORE"
      fi
      printf '%s\n' "$entry" >> "$GITIGNORE"
      added=$((added + 1))
    done
    [ "$added" -gt 0 ] && say "Added the skills folders to $GITIGNORE, so the links are not committed"
  fi
fi

# 5. Say what happened, in the terms the person used.
if [ "$SCOPE" = "project" ]; then
  say "Installed for $PROJECT_DIR"
else
  say "Installed for every project on this machine"
fi
say "The skills themselves live in $DEST, and are linked from:"
for dir in "${TARGETS[@]}"; do printf '  %s\n' "$dir"; done
if [ "$SCOPE" = "project" ]; then
  say "Open your agent in $PROJECT_DIR (restart it if it was already running), then try one, for example: \"build me a React project\"."
  if [ "$IN_REPO" = "1" ]; then
    say "Heads up: those are symlinks into $DEST, kept out of git by $PROJECT_DIR/.gitignore."
  else
    say "Heads up: those are symlinks into $DEST. If you make this a git repository, add .omp/skills/ and .opencode/skills/ to its .gitignore first."
  fi
  say "To undo this later, run this from $PROJECT_DIR: bash $DEST/uninstall.sh --project"
else
  say "Restart your agent, then try one, for example: \"build me a React project\"."
  say "To undo this later: bash $DEST/uninstall.sh --global"
fi

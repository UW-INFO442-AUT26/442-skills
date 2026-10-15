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
#   ... | bash -s -- --update      # refresh every install already made here
#
# Updating is the same work over the places already installed. The skills are
# symlinks into a git checkout of this repo, so a pull brings edited skills
# immediately, and re-linking is what picks up a skill added upstream. Every
# install is recorded in ~/.442-skills-installs, which is what --update reads,
# so nobody has to remember where they installed it.
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
# One line per install this machine has made: "project<TAB>/path", or "global".
# --update reads it, so nobody has to remember where they installed it.
STATE_FILE="$HOME/.442-skills-installs"
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
  --update,  -u   refresh every install this machine already has
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
UPDATE=0
for arg in "$@"; do
  case "$arg" in
    --project|-p) SCOPE=project ;;
    --global|-g)  SCOPE=global ;;
    --update|-u)  UPDATE=1 ;;
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
# An update reads where the earlier installs went, so the folder it runs from
# does not matter, and none of the checks below apply to it.
if [ "$UPDATE" != "1" ] && [ "$SCOPE" != "global" ]; then
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
if [ "$UPDATE" != "1" ] && [ "$PROJECT_DIR" = "$REAL_HOME" ] && [ "$SCOPE" != "global" ]; then
  warn "You are in your home directory, where a project install would apply everywhere under it."
  warn "Installing for every session on this machine instead."
  SCOPE=global
fi

if [ "$UPDATE" != "1" ] && [ "$SCOPE" != "global" ]; then
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
if [ "$UPDATE" != "1" ] && [ -z "$SCOPE" ]; then
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

# 1. Get the repo: update an existing checkout, else clone. BEFORE is the commit
#    it was on, so an update can say what actually changed.
if [ "$UPDATE" != "1" ] && [ "$SCOPE" = "project" ] && ! git -C "$PROJECT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
  warn "$PROJECT_DIR is not a git repository, so this may not be the folder you meant."
  warn "Installing here anyway; the skills load in this folder and everything under it."
fi

BEFORE=""
if [ -d "$DEST/.git" ]; then
  BEFORE="$(git -C "$DEST" rev-parse HEAD 2>/dev/null || true)"
  say "Updating $DEST"
  git -C "$DEST" fetch --quiet origin "$BRANCH" \
    || die "Could not reach $CLONE_URL. Check your network and try again."
  git -C "$DEST" checkout --quiet "$BRANCH"
  git -C "$DEST" pull --quiet --ff-only origin "$BRANCH" \
    || die "$DEST has changes that stop it updating. Remove it and run this again: rm -rf $DEST"
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

set_project_targets() {
  TARGETS=()
  RULES_FILES=()
  TARGETS+=("$PROJECT_DIR/.omp/skills")
  TARGETS+=("$PROJECT_DIR/.opencode/skills")
  if [ -d "$PROJECT_DIR/.agents" ]; then TARGETS+=("$PROJECT_DIR/.agents/skills"); fi
  if [ -d "$PROJECT_DIR/.claude" ]; then TARGETS+=("$PROJECT_DIR/.claude/skills"); fi
  if [ -f "$PROJECT_DIR/AGENTS.md" ]; then
    RULES_FILES+=("$PROJECT_DIR/AGENTS.md")
  elif [ -f "$PROJECT_DIR/.omp/AGENTS.md" ]; then
    RULES_FILES+=("$PROJECT_DIR/.omp/AGENTS.md")
  elif [ -f "$PROJECT_DIR/CLAUDE.md" ]; then
    RULES_FILES+=("$PROJECT_DIR/CLAUDE.md")
  else
    RULES_FILES+=("$PROJECT_DIR/AGENTS.md")
  fi
}

set_global_targets() {
  TARGETS=()
  RULES_FILES=()
  TARGETS+=("$HOME/.omp/agent/skills")
  TARGETS+=("$HOME/.agents/skills")
  if [ -d "$HOME/.claude" ]; then TARGETS+=("$HOME/.claude/skills"); fi
  RULES_FILES+=("$HOME/.agents/AGENTS.md")
  # OpenCode reads its rules from its own global file, not from
  # ~/.agents/AGENTS.md. Only touch it where OpenCode is set up.
  if [ -d "$HOME/.config/opencode" ]; then RULES_FILES+=("$HOME/.config/opencode/AGENTS.md"); fi
}

# An update sets its own targets per recorded install, further down.
if [ "$UPDATE" != "1" ]; then
  if [ "$SCOPE" = "project" ]; then set_project_targets; else set_global_targets; fi
fi

# Symlinks, so running install.sh again is the update path. Anything already
# in the folder that we did not put there is never deleted.
link_into() {
  local skills_dir="$1" src name target linked=0 skipped=0 pruned=0 note
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
  # A skill removed upstream would leave a link pointing at nothing, which some
  # agents try to load anyway. Clear the ones we made that no longer resolve.
  for target in "$skills_dir"/*; do
    [ -L "$target" ] || continue
    case "$(readlink "$target")" in
      "$DEST"/*)
        if [ ! -e "$target" ]; then
          rm -f "$target"
          pruned=$((pruned + 1))
        fi
        ;;
    esac
  done
  note=""
  if [ "$skipped" -gt 0 ]; then note=" ($skipped left alone)"; fi
  if [ "$pruned" -gt 0 ]; then note="$note ($pruned link(s) to skills that are gone, removed)"; fi
  say "Linked $linked skills into $skills_dir$note"
}

# The whole install for one place: link the skills, then stamp the rules.
install_into_targets() {
  local dir file
  for dir in "${TARGETS[@]}"; do link_into "$dir"; done
  for file in "${RULES_FILES[@]}"; do upsert_block "$file"; done
}

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

# Keep the links out of git. They point into the home folder, so a teammate who
# cloned the project would get links that go nowhere. IN_REPO is read by the
# summary, so it is set globally on purpose.
handle_gitignore() {
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
          if [ -s "$GITIGNORE" ]; then printf '\n' >> "$GITIGNORE"; fi
          printf '# class skills, linked in from the 442 checkout\n' >> "$GITIGNORE"
        fi
        printf '%s\n' "$entry" >> "$GITIGNORE"
        added=$((added + 1))
      done
      if [ "$added" -gt 0 ]; then
        say "Added the skills folders to $GITIGNORE, so the links are not committed"
      fi
    fi
  fi
  return 0
}

# --- what this machine has installed -----------------------------------------
# One line per place, so an update can refresh all of them without being told
# where they are. Written at install time, cleaned up by uninstall.sh.

record_install() {
  local line="global"
  if [ "$SCOPE" = "project" ]; then
    line="project $PROJECT_DIR"
  fi
  if [ -f "$STATE_FILE" ] && grep -qxF "$line" "$STATE_FILE"; then
    return 0
  fi
  printf '%s\n' "$line" >> "$STATE_FILE"
}

# Whether this place still has our links, so an update does not reinstall
# somewhere the student has since removed it.
looks_installed() {
  local dir link
  for dir in "${TARGETS[@]}"; do
    for link in "$dir"/442-*; do
      [ -L "$link" ] || continue
      case "$(readlink "$link")" in
        "$DEST"/*) return 0 ;;
      esac
    done
  done
  return 1
}

list_skills() {
  git -C "$DEST" ls-tree --name-only "$1" skills/ | sed 's|^skills/||' | sort
}

# What the pull changed, so an update says something worth reading.
report_changes() {
  local after added removed names name edited
  after="$(git -C "$DEST" rev-parse HEAD)"
  if [ -z "$BEFORE" ]; then
    say "First checkout: $(ls -d "$DEST"/skills/*/ | wc -l | tr -d ' ') skills are available."
    return 0
  fi
  if [ "$BEFORE" = "$after" ]; then
    say "Already at the latest; no skill changed."
    return 0
  fi
  added="$(comm -13 <(list_skills "$BEFORE") <(list_skills "$after") | tr '\n' ' ')"
  removed="$(comm -23 <(list_skills "$BEFORE") <(list_skills "$after") | tr '\n' ' ')"
  names="$(git -C "$DEST" diff --name-only "$BEFORE" "$after" -- skills/ | awk -F/ 'NF > 1 { print $2 }' | sort -u)"
  edited=""
  for name in $names; do
    case " $added $removed " in
      *" $name "*) ;;
      *) edited="$edited $name" ;;
    esac
  done
  if [ -n "$added" ]; then say "New skills: ${added% }"; fi
  if [ -n "$edited" ]; then say "Changed: ${edited% }"; fi
  if [ -n "$removed" ]; then say "Gone upstream: ${removed% }"; fi
}

# === an update refreshes every place already installed =======================
if [ "$UPDATE" = "1" ]; then
  if [ ! -s "$STATE_FILE" ]; then
    say "No install is recorded on this machine, so there is nothing to update yet."
    say "Run the installer once in your project folder, or with --global. It records where it went, and this refreshes all of it from then on."
    exit 0
  fi
  installed=0
  while read -r kind where; do
    case "$kind" in
      global)
        SCOPE=global
        set_global_targets
        if ! looks_installed; then
          warn "The machine-wide install is not there any more, so it was skipped."
          continue
        fi
        install_into_targets
        installed=$((installed + 1))
        ;;
      project)
        if [ ! -d "$where" ]; then
          warn "$where is gone, so it was skipped. Drop its line from $STATE_FILE to stop this warning."
          continue
        fi
        PROJECT_DIR="$where"
        SCOPE=project
        set_project_targets
        if ! looks_installed; then
          warn "$where no longer has the class skills, so it was skipped. Drop its line from $STATE_FILE to stop this warning."
          continue
        fi
        install_into_targets
        handle_gitignore
        installed=$((installed + 1))
        ;;
    esac
  done < "$STATE_FILE"
  report_changes
  say "Updated $installed place(s). Restart your agent if it was already running, so it picks up new skills."
  exit 0
fi

# === a fresh install =========================================================
install_into_targets
handle_gitignore
record_install

# Say what happened, in the terms the person used.
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
  say "Update later with: bash $DEST/install.sh --update"
  say "To undo this later, run this from $PROJECT_DIR: bash $DEST/uninstall.sh --project"
else
  say "Restart your agent, then try one, for example: \"build me a React project\"."
  say "Update later with: bash $DEST/install.sh --update"
  say "To undo this later: bash $DEST/uninstall.sh --global"
fi

#!/usr/bin/env bash
# Exercises scripts/check-repo.mjs against fixture repos. One valid skill has to
# pass, and every broken one has to be named: a validator that cannot prove it
# catches anything is worse than no validator, because it is trusted.
#
#   bash scripts/test-check-repo.sh
#
# The fixtures are throwaway directories, so nothing here touches the real repo.
set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

FAILED=0
ok()   { printf '  ok   %s\n' "$*"; }
fail() { printf '  FAIL %s\n' "$*" >&2; FAILED=1; }
check() { if [ "$1" = "0" ]; then ok "$2"; else fail "$2"; fi; }

GOOD_DESC='description: Does a thing for the class. Use when a student asks for the thing, or when another skill needs it.'

# A fixture that looks like the real repo: the files the gate insists on, and
# stub test scripts, so a run is about the skill under test and nothing else.
new_fixture() {
  local dir="$1" listed="${2:-}"
  mkdir -p "$dir/skills" "$dir/scripts"
  {
    printf '# README\n\n'
    [ -n "$listed" ] && printf '| `%s` | what it does |\n' "$listed"
  } > "$dir/README.md"
  printf '# Contributing\n' > "$dir/CONTRIBUTING.md"
  printf '# Agents\n' > "$dir/AGENTS.md"
  printf '#!/usr/bin/env bash\n' > "$dir/install.sh"
  printf '#!/usr/bin/env bash\nexit 0\n' > "$dir/scripts/test-install.sh"
  printf '#!/usr/bin/env bash\nexit 0\n' > "$dir/scripts/test-check-repo.sh"
}

# $1 fixture, $2 skill directory name, $3 the frontmatter between the --- lines,
# $4 the body's first line.
make_skill() {
  local target="$1/skills/$2"
  mkdir -p "$target"
  {
    printf -- '---\n'
    printf '%s\n' "$3"
    printf -- '---\n\n'
    printf '%s\n' "$4"
    printf '\n## What'"'"'s next\n\nDo the thing.\n'
  } > "$target/SKILL.md"
}

run_gate() {
  node "$REPO_DIR/scripts/check-repo.mjs" "$1" > "$WORK/out" 2>&1
}

# For the cases that need exact bytes: the escapes in $3 are interpreted, so a
# BOM, a tab, or a missing newline can be planted on purpose.
raw_skill() {
  mkdir -p "$1/skills/$2"
  printf '%b' "$3" > "$1/skills/$2/SKILL.md"
}

# The gate has to reject it, and say which rule it broke.
expect_fail() {
  local code
  run_gate "$1"; code=$?
  if [ "$code" = "0" ]; then fail "$2 (the gate passed when it should not have)"; return; fi
  if grep -qF "$3" "$WORK/out"; then ok "$2"; else
    fail "$2 (no message matching: $3)"
    sed -n '1,8p' "$WORK/out" >&2
  fi
}

# The gate has to let it through.
expect_pass() {
  local code
  run_gate "$1"; code=$?
  if [ "$code" = "0" ]; then ok "$2"; else
    fail "$2 (the gate failed)"
    sed -n '1,8p' "$WORK/out" >&2
  fi
}

# It passes, and still warns, because a warning is the gate saying "look here".
expect_warn() {
  local code
  run_gate "$1"; code=$?
  if [ "$code" != "0" ]; then fail "$2 (the gate failed instead of warning)"; return; fi
  if grep -qF "$3" "$WORK/out"; then ok "$2"; else
    fail "$2 (no warning matching: $3)"
    sed -n '1,8p' "$WORK/out" >&2
  fi
}

printf '\n1. a well-formed skill passes\n'
F="$WORK/good"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-thing
$GOOD_DESC" "Do the thing."
expect_pass "$F" "a valid skill passes the gate"
rm -rf "$F/skills"
expect_fail "$F" "a missing skills/ is caught" "skills/ is missing"
mkdir -p "$F/skills"
expect_fail "$F" "an empty skills/ is caught" "skills/ is empty"

printf '\n2. the frontmatter defects that stop a skill loading\n'
F="$WORK/colon"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-thing
description: Rewrites prose: it makes a draft read like a person wrote it, and says when." "Body."
expect_fail "$F" "an unquoted colon in the description is caught" "YAML punctuation"

make_skill "$F" 442-thing "name: 442-thing
description: \"Rewrites prose: it makes a draft read like a person wrote it, and says when.\"" "Body."
expect_pass "$F" "the same description quoted passes"

F="$WORK/name"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-other
$GOOD_DESC" "Body."
expect_fail "$F" "a name that does not match the directory is caught" "must equal the directory name"

make_skill "$F" 442-thing "name: 442-Thing
$GOOD_DESC" "Body."
expect_fail "$F" "an uppercase name is caught" "lowercase letters"

F="$WORK/nodesc"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-thing" "Body."
expect_fail "$F" "a missing description is caught" "no description"

F="$WORK/longdesc"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-thing
description: Use when anything at all happens, and here is padding to push the value past the limit the repo sets for a description that is always loaded and costs context on every single turn of every session: $(printf 'x%.0s' $(seq 1 620))" "Body."
expect_fail "$F" "an over-long description is caught" "always-loaded"

F="$WORK/unclosed"; new_fixture "$F" 442-thing
raw_skill "$F" 442-thing "---\nname: 442-thing\n$GOOD_DESC\nBody with no closing delimiter.\n"
expect_fail "$F" "frontmatter with no closing delimiter is caught" "not closed"

F="$WORK/tab"; new_fixture "$F" 442-thing
raw_skill "$F" 442-thing "---\nname: 442-thing\n\t$GOOD_DESC\n---\n\nBody.\n"
expect_fail "$F" "a tab in the frontmatter is caught" "tab"

F="$WORK/indent"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-thing
  $GOOD_DESC" "Body."
expect_fail "$F" "a stray indented line is caught" "indented"

F="$WORK/dup"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-thing
name: 442-thing
$GOOD_DESC" "Body."
expect_fail "$F" "a duplicated field is caught" "twice"

F="$WORK/bom"; new_fixture "$F" 442-thing
raw_skill "$F" 442-thing "\xef\xbb\xbf---\nname: 442-thing\n$GOOD_DESC\n---\n\nBody.\n"
expect_fail "$F" "a byte order mark is caught" "byte order mark"

F="$WORK/empty"; new_fixture "$F" 442-thing
raw_skill "$F" 442-thing "---\nname: 442-thing\n$GOOD_DESC\n---\n"
expect_fail "$F" "an empty body is caught" "no body"

F="$WORK/noskill"; new_fixture "$F" 442-thing
mkdir -p "$F/skills/442-thing"
expect_fail "$F" "a skill directory with no SKILL.md is caught" "missing SKILL.md"

F="$WORK/link"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-thing
$GOOD_DESC" "See [the reference](references/missing.md)."
expect_fail "$F" "a broken relative link is caught" "broken link"

F="$WORK/dash"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-thing
$GOOD_DESC" "A body with an em dash $(printf '\xe2\x80\x94') in it."
expect_fail "$F" "an em dash is caught" "em dash"

printf '\n3. the things that warn without blocking a merge\n'
F="$WORK/unknown"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-thing
model: sonnet
$GOOD_DESC" "Body."
expect_warn "$F" "a field the spec does not define warns" "not one the spec defines"

F="$WORK/meta"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-thing
$GOOD_DESC
metadata:
  audience: students
  opencode/slash: \"true\"" "Body."
expect_pass "$F" "a metadata block is accepted"

make_skill "$F" 442-thing "name: 442-thing
$GOOD_DESC
metadata:
  opencode/autoinvoke: false" "Body."
expect_warn "$F" "an unquoted metadata value warns" "not quoted"

F="$WORK/unlisted"; new_fixture "$F"
make_skill "$F" 442-thing "name: 442-thing
$GOOD_DESC" "Body."
expect_warn "$F" "a skill missing from the README table warns" "not listed in the README"

F="$WORK/thin"; new_fixture "$F" 442-thing
make_skill "$F" 442-thing "name: 442-thing
description: Does the thing." "Body."
expect_warn "$F" "a thin description warns" "thin"

F="$WORK/nowhatsnext"; new_fixture "$F" 442-thing
raw_skill "$F" 442-thing "---\nname: 442-thing\n$GOOD_DESC\n---\n\nJust a body, no closing line.\n"
expect_warn "$F" "a skill with no What's next warns" "no \"What's next\" line"

if [ "$FAILED" = "0" ]; then
  printf '\ncheck-repo.mjs behaves. All checks passed.\n'
else
  printf '\ncheck-repo.mjs has failures. See FAIL lines above.\n' >&2
fi
exit "$FAILED"

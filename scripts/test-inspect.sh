#!/usr/bin/env bash
# Exercises the 442-setup-firebase inspector against fixture projects. The
# point is that the report is stable and read-only: same answers from the same
# files, and nothing in the project changes.
#
#   bash scripts/test-inspect.sh
set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSPECT="$REPO_DIR/skills/442-setup-firebase/scripts/inspect.mjs"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

FAILED=0
ok()   { printf '  ok   %s\n' "$*"; }
fail() { printf '  FAIL %s\n' "$*" >&2; FAILED=1; }
check() { if [ "$1" = "0" ]; then ok "$2"; else fail "$2"; fi; }
contains()     { grep -qF "$2" "$1"; check $? "$3"; }
not_contains() { grep -qF "$2" "$1"; [ $? -ne 0 ]; check $? "$3"; }

printf '\n1. a Vite React project with Firestore and Hosting\n'
P="$WORK/vite-app"
mkdir -p "$P/src"
cat > "$P/package.json" <<'JSON'
{
  "name": "task-tracker",
  "dependencies": { "react": "^19.0.0", "react-dom": "^19.0.0", "react-router-dom": "^7.0.0", "firebase": "^12.1.0" },
  "devDependencies": { "vite": "^7.0.0" },
  "scripts": { "dev": "vite", "build": "vite build", "test": "vitest run" }
}
JSON
touch "$P/package-lock.json" "$P/firestore.rules"
printf 'import.meta.env.VITE_API_KEY\n' > "$P/src/firebase.js"
printf 'export default function App() { return null }\n' > "$P/src/App.jsx"
printf 'import App from "./App.jsx"\n' > "$P/src/main.jsx"
printf 'VITE_API_KEY=demo\n' > "$P/.env"
printf '.env\n' > "$P/.gitignore"
cat > "$P/firebase.json" <<'JSON'
{
  "hosting": { "public": "dist", "rewrites": [{ "source": "**", "destination": "/index.html" }] },
  "firestore": { "rules": "firestore.rules" },
  "emulators": { "firestore": { "port": 8080 }, "ui": { "enabled": true } }
}
JSON
printf '{ "projects": { "default": "demo-442" } }\n' > "$P/.firebaserc"

node "$INSPECT" "$P" > "$WORK/out1" 2>&1
check $? "inspector exits 0"
contains "$WORK/out1" "framework: vite + react" "names the framework"
contains "$WORK/out1" "package manager: npm (package-lock.json)" "names the package manager"
contains "$WORK/out1" "build output: dist (missing; build first)" "reports the real output dir"
contains "$WORK/out1" "firebase sdk: firebase@^12.1.0" "finds the SDK"
contains "$WORK/out1" "router: react-router" "spots client-side routing"
contains "$WORK/out1" 'hosting: public="dist", rewrites=1 (single page)' "reads the hosting block"
contains "$WORK/out1" 'firestore: rules="firestore.rules"' "reads the firestore block"
contains "$WORK/out1" "emulators: firestore" "lists the emulators"
contains "$WORK/out1" 'project "demo-442"' "reads the project id"
contains "$WORK/out1" "configured from files: firestore, hosting, firebase sdk" "sums up what exists"
contains "$WORK/out1" "env prefix in source: VITE_" "reads the env convention"
contains "$WORK/out1" ".env gitignored: yes" "confirms .env is ignored"
contains "$WORK/out1" "npm test script yes" "sees a test command"
contains "$WORK/out1" "Nothing was changed." "says it changed nothing"

# A built project reports the output as present.
mkdir -p "$P/dist"
printf '<html></html>\n' > "$P/dist/index.html"
node "$INSPECT" "$P" > "$WORK/out2" 2>&1
contains "$WORK/out2" "build output: dist (exists)" "reports a built output"

printf '\n2. the inspector writes nothing\n'
git -C "$P" init -q -b main
git -C "$P" add -A
git -C "$P" -c user.name=test -c user.email=test@example.com commit -qm fixture
node "$INSPECT" "$P" > /dev/null 2>&1
[ -z "$(git -C "$P" status --porcelain)" ]; check $? "the working tree is unchanged"

printf '\n3. a project with no package.json\n'
mkdir -p "$WORK/static"
printf '<html></html>\n' > "$WORK/static/index.html"
node "$INSPECT" "$WORK/static" > "$WORK/out3" 2>&1
check $? "inspector exits 0 without a package.json"
contains "$WORK/out3" "package.json: no" "says there is no package.json"
contains "$WORK/out3" "index.html at root: yes" "finds the static entry"
contains "$WORK/out3" "configured from files: nothing yet" "says nothing is set up"

printf '\n4. a missing directory\n'
node "$INSPECT" "$WORK/nope" > /dev/null 2>&1
[ $? -ne 0 ]; check $? "exits non-zero when the folder is missing"

if [ "$FAILED" = "0" ]; then
  printf '\ninspector behaves. All checks passed.\n'
else
  printf '\n%d check(s) failed.\n' "$FAILED" >&2
  exit 1
fi

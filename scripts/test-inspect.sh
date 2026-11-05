#!/usr/bin/env bash
# Exercises the skill inspectors against fixture projects: the Firebase one in
# 442-setup-firebase and the Leaflet one in 442-setup-leaflet. The point is that
# each report is stable and read-only: same answers from the same files, and
# nothing in the project changes.
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

printf '\n5. a Vite React project with a working Leaflet map\n'
LEAFLET="$REPO_DIR/skills/442-setup-leaflet/scripts/inspect.mjs"
L="$WORK/leaflet-app"
mkdir -p "$L/src"
cat > "$L/package.json" <<'JSON'
{
  "name": "map-app",
  "dependencies": { "react": "^19.0.0", "react-dom": "^19.0.0", "leaflet": "^1.9.4", "react-leaflet": "^5.0.0" },
  "devDependencies": { "vite": "^7.0.0" },
  "scripts": { "dev": "vite", "build": "vite build" }
}
JSON
printf "import 'leaflet/dist/leaflet.css'\nimport App from './App.jsx'\n" > "$L/src/main.jsx"
cat > "$L/src/App.jsx" <<'JSX'
import L from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
L.Icon.Default.imagePath = ''
export default () => (
  <MapContainer center={[47.6, -122.3]} zoom={13} style={{ height: '400px' }}>
    <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
  </MapContainer>
)
JSX
printf '<html><body><div id="root"></div></body></html>\n' > "$L/index.html"

node "$LEAFLET" "$L" > "$WORK/lout1" 2>&1
check $? "leaflet inspector exits 0"
contains "$WORK/lout1" "framework: vite + react" "leaflet: names the framework"
contains "$WORK/lout1" "react: ^19.0.0" "leaflet: reports react"
contains "$WORK/lout1" "leaflet: ^1.9.4 (installed no)" "leaflet: reports the package and that it is not installed yet"
contains "$WORK/lout1" "react-leaflet: ^5.0.0 (installed no)" "leaflet: reports react-leaflet"
contains "$WORK/lout1" "version fit: ok" "leaflet: the versions fit"
contains "$WORK/lout1" "leaflet css: imported in src/main.jsx" "leaflet: finds the css import"
contains "$WORK/lout1" "html entry: index.html" "leaflet: finds the Vite entry"
contains "$WORK/lout1" "unpkg css link: no" "leaflet: no unpkg link"
contains "$WORK/lout1" "map container: MapContainer in src/App.jsx" "leaflet: finds the map"
contains "$WORK/lout1" "tile url: https://tile.openstreetmap.org/{z}/{x}/{y}.png" "leaflet: reads the tile url"
contains "$WORK/lout1" "tile subdomains: no" "leaflet: the url has no subdomain"
contains "$WORK/lout1" "attribution: yes" "leaflet: finds the attribution"
contains "$WORK/lout1" "container height: set on the container" "leaflet: finds the height"
contains "$WORK/lout1" "icon fix: Icon.Default patched" "leaflet: finds the icon fix"
contains "$WORK/lout1" "Nothing was changed." "leaflet: says it changed nothing"

printf '\n6. a Create React App project with the old instructions\n'
C="$WORK/cra-app"
mkdir -p "$C/public" "$C/src"
cat > "$C/package.json" <<'JSON'
{
  "name": "old-app",
  "dependencies": { "react": "^18.2.0", "react-scripts": "5.0.1", "leaflet": "^1.9.4", "react-leaflet": "^5.0.0" },
  "scripts": { "start": "react-scripts start" }
}
JSON
printf '<html><head><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/></head></html>\n' > "$C/public/index.html"
cat > "$C/src/Map.jsx" <<'JSX'
import 'leaflet/styles.css'
import { MapContainer, TileLayer } from 'react-leaflet'
export default () => (
  <MapContainer center={[47.6, -122.3]} zoom={13}>
    <TileLayer url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  </MapContainer>
)
JSX
node "$LEAFLET" "$C" > "$WORK/lout2" 2>&1
contains "$WORK/lout2" "framework: create-react-app + react" "leaflet: names Create React App"
contains "$WORK/lout2" "html entry: public/index.html" "leaflet: finds the CRA entry"
contains "$WORK/lout2" "unpkg css link: yes" "leaflet: flags the unpkg link"
contains "$WORK/lout2" "css path: leaflet/styles.css is the 2.0 beta path" "leaflet: flags the 2.0 beta css path"
contains "$WORK/lout2" "version fit: mismatch: react-leaflet 5 needs react 19" "leaflet: flags the React mismatch"
contains "$WORK/lout2" "tile subdomains: yes" "leaflet: flags the {s} tile url"
contains "$WORK/lout2" "tile over http: yes" "leaflet: flags an http tile url"
contains "$WORK/lout2" "attribution: no" "leaflet: flags a missing attribution"
contains "$WORK/lout2" "container height: no height found" "leaflet: flags a missing height"
contains "$WORK/lout2" "icon fix: no" "leaflet: flags the missing icon fix"

printf '\n7. the leaflet inspector writes nothing\n'
git -C "$L" init -q -b main
git -C "$L" add -A
git -C "$L" -c user.name=test -c user.email=test@example.com commit -qm fixture
node "$LEAFLET" "$L" > /dev/null 2>&1
[ -z "$(git -C "$L" status --porcelain)" ]; check $? "the working tree is unchanged after the leaflet inspector"

printf '\n8. the leaflet inspector on a folder with no project\n'
mkdir -p "$WORK/empty"
node "$LEAFLET" "$WORK/empty" > "$WORK/lout3" 2>&1
check $? "leaflet inspector exits 0 without a package.json"
contains "$WORK/lout3" "package.json: no" "leaflet: says there is no package.json"
contains "$WORK/lout3" "map container: no MapContainer yet" "leaflet: says there is no map"
node "$LEAFLET" "$WORK/nope" > /dev/null 2>&1
[ $? -ne 0 ]; check $? "leaflet inspector exits non-zero when the folder is missing"

if [ "$FAILED" = "0" ]; then
  printf '\ninspector behaves. All checks passed.\n'
else
  printf '\n%d check(s) failed.\n' "$FAILED" >&2
  exit 1
fi

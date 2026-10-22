# The four services

Read the section for each service the student picked. Every section has the
same four parts: what it is, in words you can paste into chat; what you do;
the console clicks that stay with them; and the checks that count as
evidence.

Finish one service before starting the next, so a failure has one cause.

## Shared first steps

- **Install the SDK.** `npm install firebase`. One package covers Firestore,
  Realtime Database, Authentication, and the config Hosting serves.
- **Give the config one home.** A module such as `src/lib/firebase.js` that
  initializes the app once and exports the service handles. Components
  import from there, and nothing else calls `initializeApp`.
- **The web config is public.** `apiKey`, `authDomain`, `projectId` and the
  rest identify the project; they authorize nothing. Rules and
  Authentication do that, which is why committing the config is fine. A
  service account JSON is the opposite: it bypasses rules, so it never goes
  in the browser, in this repo, or in a chat message.
- **Get the values from the CLI when you can.** `firebase apps:list` finds
  the web app, and `firebase apps:sdkconfig web <appId>` prints its config
  block. Checking for an app needs `firebase login`, which is the student's
  click.
- **Follow the project's own env convention.** Vite reads
  `import.meta.env.VITE_*` from `.env`, CRA reads `process.env.REACT_APP_*`,
  Next reads `process.env.NEXT_PUBLIC_*`. Before writing a value, confirm
  the file is ignored: `git check-ignore -v .env` prints a line. If it does
  not, add `.env` to `.gitignore` first.

## Firestore

**What it is.** A cloud database that stores the app's data as collections
of documents, roughly a folder per kind of thing and one small record per
item. It is the usual home for a class project's data.

**What you do.**

1. Read what exists: `firebase.json` may already carry a `firestore` block
   and a rules file. The inspector lists both.
2. Initialize the app in the shared module and export `db`.
3. Put data access in a few small functions named for what the app does
   (`addTask`, `listTasks`, `deleteTask`), not in components.
4. Model it from the student's own nouns: one collection per noun, one
   document per item, `serverTimestamp()` for creation times.
5. Write the rules and deploy them (skill step 4).
6. Run the checks.

**Their clicks.** Build, Firestore Database, Create database, production
mode, and a nearby region. Add a web app if there is none: Project
settings, Your apps, Web.

**Checks.**

- A permitted read returns a document you wrote.
- A permitted write is visible on the next read.
- A read with no signed-in user is refused with `permission-denied`, when
  the rules require a user, rather than returning data or an empty result.
- The cutoff refuses once its moment passes. Prove it before that moment
  arrives: run the rule in the emulator with the cutoff set in the past,
  watch the read get refused, then put the real date back.

## Realtime Database

**What it is.** A second database with a different shape: a tree of values
that syncs to every connected client as it changes. It suits live shared
state, like a status board or a shared cursor. Firestore and Realtime
Database are not interchangeable, and a project rarely needs both. If the
student picks both, say what goes where before you write either.

**What you do.**

1. Read `firebase.json` for a `database` block. Note its `databaseURL`:
   projects outside `us-central1` have a URL with the region in it, and the
   SDK needs the exact one.
2. Initialize the app with that `databaseURL` and export `db` (or `rtdb`, if
   the project already uses `db` for Firestore).
3. Model around the app's live thing: a node per room or board, a child per
   participant, `onValue` to read and `set` or `update` to write.
4. Write `*.rules.json` and deploy it (skill step 4).
5. Run the checks, including the two-client one when the app needs live
   sync.

**Their clicks.** Build, Realtime Database, Create Database, a region, and
start in locked mode.

**Checks.**

- A permitted read returns what a permitted write stored.
- A write with no signed-in user is refused, when the rules require one.
- Live sync, when the feature needs it: two clients on the same node, one
  writes, the other's listener fires without a reload.
- The cutoff refuses after its date, tested the same way as Firestore's.

## Authentication

**What it is.** Lets people sign in, and gives the app a user id to attach
to their data. Rules read that id, so Authentication and the database rules
work as a pair: turning on sign-in does not protect anything on its own.

**What you do.**

1. Ask which method, in the chat, if the app does not already show one.
   Two good defaults for a class project: **Google sign-in** when everyone
   has a Google account and the app needs no password screen, or **email
   and password** when accounts must work without a second service.
   Recommend one and say why in a line.
2. Initialize `auth` in the shared module and export it.
3. Handle the state: a listener in one place, a signed-in route and a
   signed-out route, sign in and sign out calls, and the messages for the
   common errors (wrong password, cancelled popup, no account).
4. Make the database rules depend on `request.auth != null` (Firestore) or
   `auth != null` (Realtime Database), and confirm the app has a way in for
   every user the rules allow.

**Their clicks.** Build, Authentication, Get started, and the provider:
Email/Password, or Google with the support email. Google sign-in also needs
each domain in Authentication, Settings, Authorized domains, which already
includes `localhost` and the Hosting domain.

**Checks.**

- The auth SDK initializes and reports an auth state change.
- Sign in, then sign out, seen in the running app, not just in the code.
- Data that the rules protect is refused while signed out and readable
  while signed in.
- If a real sign-in could not be run, say exactly that in the report.

## Hosting

**What it is.** Publishes the built site at a public URL, so the group can
open the app on a phone without running anything.

**What you do.**

1. Find the real build output. Read the `build` script in `package.json`
   and the framework's config: Vite writes `dist`, CRA writes `build`, and
   Next needs a static export before it has one. Use what the project
   produces, and confirm with `ls` after a build.
2. Check the CLI and the account: `firebase --version`, then
   `firebase login:list`. Install with `npm install -g firebase-tools` if
   it is missing. Signing in is the student's click.
3. Point the project at the right Firebase project: `firebase projects:list`
   and `firebase use <projectId>`, which writes `.firebaserc`.
4. Write the hosting block in `firebase.json`: `public` set to the output
   directory, `ignore` covering `firebase.json` and `**/node_modules/**`,
   and a single-page rewrite **only** if the app uses client-side routing
   (React Router with browser history). A multi-page app needs no rewrite.
5. Build, then deploy with `firebase deploy --only hosting`. Keep the URL
   it prints.
6. Never overwrite a build output the student already has, and skip the
   GitHub auto-deploy offer unless they ask for it.

**Their clicks.** Nothing, once the CLI is signed in. A new project needs
them in the console: create it, then the CLI can use it.

**Checks.**

- The build exits 0 and the output directory holds `index.html`.
- The deploy exits 0 and prints the hosting URL.
- `curl -sI <url>` answers 200, and the page loads in a browser with no
  console errors.
- Routing works when the app needs it: open one nested route by URL and
  see the app render, not a 404.

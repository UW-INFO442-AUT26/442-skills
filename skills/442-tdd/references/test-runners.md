# Test runners

Reference for step 2 of [`../SKILL.md`](../SKILL.md). One runner per project; keep whatever is already there.

## Vite + React (the `442-react-init` stack): Vitest

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add to `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

`vite.config.js`:

```js
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test-setup.js",
  },
});
```

`src/test-setup.js`:

```js
import "@testing-library/jest-dom/vitest";
```

`globals: true` is what lets React Testing Library clean up between tests on its own. Put each test beside the file it tests: `src/TitleField.test.jsx`. Run `npm test`.

## Plain JavaScript: `node:test`

Nothing to install; Node runs it.

```json
"scripts": { "test": "node --test" }
```

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { tallyVotes } from "./votes.js";

test("ignores ballots with no first choice", () => {
  assert.deepEqual(tallyVotes([[], ["a"]]), { a: 1 });
});
```

`node --test` collects files named `*.test.js` anywhere in the project, plus every `.js` file under a `test/` directory. `node:assert/strict` gives you `assert.equal` (strict equality, for primitives) and `assert.deepEqual` (structure, for objects and arrays).

## Firebase

Test the function you own. Two levels:

- **Logic that only looks like Firebase** (validation, shaping, sorting): a plain unit test with no emulator, because no Firestore call is involved.
- **Behavior that really talks to Firestore** (a query, a transaction, rules): run the Emulator Suite and point the app at it.

```bash
npm install -D firebase-tools
npx firebase init emulators   # choose Firestore; the default port is 8080
npx firebase emulators:exec --only firestore "npm test"
```

`emulators:exec` starts a fresh in-memory Firestore, runs your command, then shuts it down.

Connect to it before your module makes its first query, using the same `db` instance the app uses:

```js
import { connectFirestoreEmulator } from "firebase/firestore";
import { db } from "./firebase.js";

connectFirestoreEmulator(db, "127.0.0.1", 8080);
```

Keep the assertion on what your function returns or writes. Asserting on Firestore SDK internals tests Google's code, not yours. Run the emulator command above rather than plain `npm test`, so the suite never points at the real project.

## Anything else

If the project already uses Jest, Playwright, or the classroom's own harness, keep it and run the same loop with it. Installing a second runner is a cost with no test to show for it.

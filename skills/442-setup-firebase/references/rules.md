# Rules and the cutoff

Read this before you write a security rule. Every syntax detail here was
checked against the official reference on 22 October 2026, and the links
sit at the bottom. Check again before you deploy: rules syntax has changed
before, and each project carries a rules version.

## The policy

Two things are true at once in this class:

1. Only signed-in users read or write the data.
2. Access ends at the class cutoff, **18 December 2026**.

Both belong in the rule, on the operations the app actually uses. A rule
that only hides buttons in the frontend enforces nothing: the database is
reachable from any browser console, so the database itself has to refuse.

## The example in the slides is not usable as written

```
allow read, write: if request.auth != null
  && timestamp.now() < timestamp.date(2026, 6, 30);
```

Two problems, and both bite quietly:

- `timestamp.now()` does not exist. The current time in a Firestore rule is
  `request.time`, a `Timestamp`. There is no `timestamp.now()` function.
- `2026, 6, 30` is in the past. A cutoff in the past refuses everything from
  the moment it deploys, which looks exactly like a broken app.

`request.auth != null` is correct, and `timestamp.date(year, month, day)`
is a real function: it builds midnight UTC on that date.

## Firestore, the rule to write

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null
        && request.time < timestamp.date(2026, 12, 18);
    }
  }
}
```

Three things to know about that date. `timestamp.date(2026, 12, 18)` is
`2026-12-18T00:00:00Z`, which is 16:00 on 17 December in Seattle, so access
closes a day earlier than the words suggest. When the exact moment
matters, pin it:

```js
      allow read, write: if request.auth != null
        && request.time < timestamp.value(1797667200000);
```

`timestamp.value` takes epoch milliseconds. `1797667200000` is
`2026-12-19T08:00:00Z`, which is the end of 18 December in Seattle. Pick one
form, say which instant it means in the report, and get the student's
agreement before deploying either.

The rules file has to be wired up in `firebase.json` before a deploy finds
it:

```json
  "firestore": { "rules": "firestore.rules" }
```

Deploy with `firebase deploy --only firestore`.

## Realtime Database, the rule to write

```json
{
  "rules": {
    ".read": "auth != null && now < 1797667200000",
    ".write": "auth != null && now < 1797667200000"
  }
}
```

Three differences from Firestore, all of them easy to get wrong:
`auth`, not `request.auth`; `now`, which is the server's milliseconds since
the epoch, not a timestamp object; and the rule is a JSON string per path,
where a rule on a parent covers its children.

Wire it up with `"database": { "rules": "database.rules.json" }` in
`firebase.json`, and deploy with `firebase deploy --only database`.

## What the cutoff does and does not stop

A cutoff rule governs one thing: access through that rule. It does not sign
users out, disable Authentication accounts, take the Hosting site offline,
delete data, or stop the project console and the Admin SDK, which ignore
rules by design.

So:

- **Realtime Database needs its own cutoff**, even when Firestore has one.
  Same date, same form, separate file.
- **A Hosting site that should go dark at the cutoff needs a separate
  action**, approved on its own, such as deleting the Hosting site or
  changing who can reach it. It does not follow from the database rule.
- **Authentication accounts outlive the cutoff.** If they should be
  removed, that is its own approved step in the console.

Say all of this in the report when a cutoff is deployed. A student who
thinks their whole project expires will be wrong about Hosting and about
their sign-in accounts.

## Change existing rules carefully

- Read the rules in the project before writing any. Keep what already
  protects something, and say what you kept.
- Firestore rules are additive: if any matching rule allows an operation,
  it is allowed, so one broad rule can undo a narrow one. Read the whole
  file, not just the block you are adding.
- When an operation fails with `permission-denied`, fix the rule or the
  sign-in that the operation needs. Opening the data is not a fix, and
  `allow read, write: if true` is never the answer, not even to test: it
  stays until someone remembers.

## Prove it, both ways

A deployed rule is not a working rule. Test the pair:

- **Allowed:** a signed-in read and write succeed.
- **Refused:** the same operation with no user fails with
  `permission-denied`, and the app shows its own handled message rather
  than a crash.

To prove the cutoff before its date arrives, use the emulator: copy the
rule into the emulator's rules with the cutoff set in the past, watch the
read get refused, then put the real date back. A rule that has never
refused anything has not been tested.

When live testing is all the project allows, test the refusal with no user
signed in: that needs no data and risks nothing.

## Docs these rules came from

- [Firestore rule conditions](https://firebase.google.com/docs/firestore/security/rules-conditions): `request.auth != null` patterns.
- [rules.firestore.Request](https://firebase.google.com/docs/reference/rules/rules.firestore.Request): `request.time`, `request.auth`.
- [Namespace: timestamp](https://firebase.google.com/docs/reference/rules/rules.timestamp): `timestamp.date`, `timestamp.value`.
- [Realtime Database rules API](https://firebase.google.com/docs/reference/security/database): `auth`, `now`.
- [Firebase CLI](https://firebase.google.com/docs/cli): the `--only` deploy targets.

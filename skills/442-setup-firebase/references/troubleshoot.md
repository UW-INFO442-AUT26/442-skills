# When it breaks

Firebase failures are usually one of three things: a file that was never
written, a console switch nobody flipped, or a rule doing its job. Find out
which before you change anything.

## The loop

1. **Read the actual error.** The code and the message, quoted. `permission-denied`
   and `auth/invalid-api-key` are different problems with different fixes.
2. **Name the cause.** Say it in one sentence before touching anything.
3. **Check the docs** for the call you are making, when the message is
   unfamiliar. Cite the page you read.
4. **Make one non-destructive fix.** One change, so the next result has one
   meaning.
5. **Re-run the same check** that failed, not a different one.
6. **Say what is blocked** if it still fails, in plain words, with the next
   step it needs.

Two failed attempts at the same command is the signal to stop and re-read.
Change something each time, or say you are stuck.

## Protect the work before you change config

Before you rewrite `firebase.json`, a rules file, or a build config, copy
the current version beside it (`firebase.json.bak`) and say where it is.
Leave files you did not need to touch exactly as they were. A deploy that
fails is not a reason to reinitialize the project: fix the file.

## Local and remote are different facts

- A file you wrote is local. It proves nothing about Firebase.
- A deploy that exited 0 changed the remote project. Quote the line that
  says so, and keep the URL or the "released" line.
- A rule that deployed is not a rule that works. Test it (skill step 4).

Say which of the two you have. "Firestore is configured" when only a file
changed is the mistake that costs a student an hour.

## When the student comes back

Re-run step 1: the inspector, then the service's own check. Their "I did
it" is a claim; the check is evidence. Resume from what the project shows,
not from where the transcript left off, and say what changed since you last
looked.

## No secrets in notes

Progress notes, scratch files, and the report hold no keys, tokens, or
passwords. If a secret was pasted into the chat or committed, say so
plainly, name the file or message, and offer the two-step recovery: revoke
it in the console (service account keys, or the API key it came from), then
issue a new one for the student's machine only.

## Failures worth recognizing

| Message | Usual cause |
| --- | --- |
| `permission-denied`, `Missing or insufficient permissions` | The rule, or no signed-in user. Check the rule first, then the auth state. |
| `auth/invalid-api-key` | Config missing or wrong, or env vars not loaded. Restart the dev server after editing `.env`. |
| `auth/operation-not-allowed` | The provider is not enabled. It is a console click (Authentication, Sign-in method). |
| `auth/unauthorized-domain` | The domain is not in Authentication, Settings, Authorized domains. |
| A deploy "succeeds" but the old rules still apply | The deploy target was wrong: `--only firestore` for Firestore, `--only database` for Realtime Database. |
| Hosting URL shows a bare directory or an old build | The `public` directory is not the real build output, or the deploy ran before the build. |
| The app still writes to the live database | The app was pointed at the emulator, or never switched back. Check the connect call. |

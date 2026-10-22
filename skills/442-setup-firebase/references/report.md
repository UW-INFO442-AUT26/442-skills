# The report

One message, at the end or at a real blocker. Plain headings, short lines,
and three buckets. A student should be able to read it in a minute and know
what to do next.

## Skeleton

```
Firebase setup for <project>

Picked: <services>
Changed: <the files you wrote or edited, one line each>
Verified: <what you watched work, and where>
Not verified yet: <what is set up but unproven, and why>
Your turn: <numbered manual steps, if any>
Docs I used: <the URLs you actually opened>
Watch out: <cutoff date, who can read the data, anything assumed>
```

## What goes in each bucket

**Verified** means you saw it: a read returned a document, a write showed up
on the next read, a signed-out request was refused, the deploy printed a
URL and that URL answered. Name the check, not the file.

**Not verified yet** is everything else, and it is the honest bucket. A
sign-in flow you could not run, a rule you deployed but did not test, a
hosting URL nobody opened. Say what would prove it.

**Your turn** is numbered steps, one action each, with where to click and
what success looks like. Only put a step here that needs a person:
signing in, a console toggle, a billing choice, a domain.

## Lines that must be exact

- The deploy URL, copied from the deploy output or the CLI's `Hosting URL`
  line. Never composed from the project id by hand.
- The cutoff: the date and the exact instant it means, in the student's
  timezone, and what it stops.
- Each doc URL you opened. If retrieval failed, say so instead of listing a
  page you did not read.

## Lines that must not appear

- Any key, token, password, or service account contents.
- "Everything works" without a check behind it.
- A closing offer to help. End with the next action.

## When work is still blocked

Say which service, which check failed, and the error in one line. Then the
smallest step that unblocks it, and what you will do once it is done.

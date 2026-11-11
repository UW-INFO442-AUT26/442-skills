# When a command refuses

`pwc` below stands for `npx -y @playwright/cli@latest`. Read the message
first: this CLI says what to run next more often than most. The cases below
are the rest.

## "Chromium distribution 'chrome' is not found"

The default browser is the Google Chrome on the machine, and this laptop does
not have it. Either install it, or download Chrome for Testing once:

```bash
pwc install-browser chromium
pwc open --browser=chromium
```

Add `--browser=chromium` to `open` from then on. One trap: `--only-shell`
downloads the headless shell, which is smaller but does not satisfy
`--browser=chromium`, so the next `open` fails in the same way.

The download is a few hundred megabytes and lives in a cache shared by every
project. It is the one cost of driving a browser, and it is paid once.

## "The browser is not open"

A headless session shuts itself down after an hour with no commands. Nothing
is lost that a `goto` and a few clicks cannot rebuild.

```bash
pwc open http://localhost:5173
```

To stretch the timer, open with `--idle-timeout=1800000`. A headed session
stays open until you close it.

## Every command hangs, or a browser is already running that you did not start

```bash
pwc list
pwc kill-all
```

`kill-all` clears every daemon on the machine, including another agent's.
When two agents drive at once, give each a name (`-s=alice`) so they never
share one page and one profile.

## A click does nothing

The snapshot after the click looks exactly like the one before it. Three
causes, in the order worth checking:

1. **A stale ref.** The page re-rendered and `e4` is a different element now.
   Take a fresh `snapshot` and use the ref from that one.
2. **Something on top.** A cookie banner, a modal, or an open dropdown
   covers the target. Snapshot, find the dismiss control, click it, then
   retry the original click.
3. **The page was not ready.** React has not attached its handler yet, so the
   click lands on a plain button. Wait, then retry:
   `pwc run-code "async page => await page.waitForTimeout(500)"`.

If it still does nothing, the handler is the bug, and that is a finding.

## The snapshot is enormous

```bash
pwc snapshot --depth=3
pwc find "Save"
pwc snapshot "#main"
pwc snapshot e12          # just one subtree
```

A list of 200 rows makes an unreadable snapshot. Search it with `find`
instead of reading it.

## A URL with several query parameters is truncated

Windows `cmd.exe` treats `&` as a command separator. Escape it (`^&`) or use
PowerShell's `--%` stop-parsing token. Quoting the whole URL is enough on
macOS and Linux.

## The console is full of noise

- `favicon.ico` `404` is every page without an icon. Ignore it.
- `net::ERR_ABORTED` on a request the page cancelled is normal during a
  navigation or a fast pan.
- A React `key` warning is not noise. Fixing it is how the next warning stays
  visible.

Read the console after the flow, not just after the load. The error you are
hunting usually arrives on the third click.

## The recording is missing or empty

The file is written on `video-stop`. A recording with no stop, or one the
browser never finished because the session closed, is a zero-byte file. Check
`video-start` and `video-stop` are in the same session, and that `--filename`
landed where you think: the path is relative to the command, not to the page.

## A command exits non-zero but printed a result

`--raw` keeps the value and drops the status block, which makes the output
easy to pipe. Read the last line of the error, not the whole stack: the useful
line is usually the one naming the file, the ref, or the missing browser.

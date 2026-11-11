# Commands

The surface of `playwright-cli`, grouped by the job it does. Every command
works the same way: state the session with `-s=name` when you named one, and
the target as a ref from the snapshot, a CSS selector, or a locator.

`npx -y @playwright/cli@latest` is written as `pwc` below to keep the lines
readable. Use the long form; a shell alias does not survive into a subagent.

## Open

```bash
pwc open                        # the Google Chrome already installed
pwc open http://localhost:5173  # open, then navigate
pwc open --browser=chromium     # Chrome for Testing, downloaded once
pwc open --mobile               # a generic phone, for a phone layout
pwc open --device="iPhone 15"
pwc open --persistent           # keep the profile on disk
pwc open --profile=/path/to/dir
pwc open --idle-timeout=300000  # raise the headless shutdown timer, 0 disables it
pwc attach --cdp=chrome         # drive a Chrome you started yourself
pwc attach --extension=chrome
pwc list                        # sessions running
pwc close
pwc -s=name close
pwc close-all
pwc kill-all                    # after a crash, when a session is a zombie
pwc delete-data                 # throw away the session profile
```

## Target an element

```bash
pwc snapshot                    # whole page, saved to .playwright-cli/
pwc snapshot --filename=after.yaml
pwc snapshot "#main"            # one subtree
pwc snapshot --depth=3          # shallow, then narrower later
pwc snapshot --boxes            # add [box=x,y,w,h] to each node
pwc find "Add"                  # search the snapshot, with context
pwc find --regex "/sign (in|up)/i"
pwc find "Add" --filename=hits.md
```

The ref is the fast path. When the target has no stable ref, use a locator,
and prefer role plus name so the locator reads like the user's intent:

```bash
pwc click e4
pwc click "#main > button.submit"
pwc click "getByRole('button', { name: 'Submit' })"
pwc click "getByText('Continue')"
pwc click "getByTestId('submit-button')"
```

## Act

```bash
pwc fill e3 "hello"             # replace the value
pwc fill e3 "hello" --submit    # and press Enter
pwc type "hello"                # type into whatever has focus
pwc click e4
pwc click e4 right              # right button
pwc dblclick e7
pwc hover e4
pwc select e9 "option-value"    # a dropdown, by value
pwc check e12
pwc uncheck e12
pwc upload ./photo.jpg
pwc drop e4 --path=./file.png
pwc drop e4 --data="text/plain=hello"
pwc drag e2 e8
pwc dialog-accept               # a confirm() or alert()
pwc dialog-accept "typed text"  # a prompt()
pwc dialog-dismiss
pwc resize 360 800
```

## Navigate and keyboard

```bash
pwc goto http://localhost:5173/list
pwc go-back
pwc go-forward
pwc reload
pwc press Enter
pwc press ArrowDown
pwc press Tab
pwc keydown Shift
pwc keyup Shift
```

## Mouse

Useful when a drag or a canvas needs a real pointer.

```bash
pwc mousemove 150 300
pwc mousedown
pwc mouseup
pwc mousewheel 0 400             # move the pointer over the area first
```

## Tabs

```bash
pwc tab-list
pwc tab-new http://localhost:5173/help
pwc tab-select 0
pwc tab-close 2
```

## Read

```bash
pwc console                     # every message
pwc console error               # errors only
pwc requests                    # numbered network log since load
pwc requests --static           # include CSS, images, and scripts
pwc request 5                   # headers, body, response
pwc request-body 5
pwc response-headers 5
pwc response-body 5             # textual inline, binary saved to a file
pwc eval "document.title"
pwc eval "() => document.querySelectorAll('li').length"
pwc eval "el => el.textContent" e5
pwc eval "el => el.id" e5
pwc run-code "async page => await page.waitForTimeout(500)"
pwc run-code --filename=script.js
pwc recording-start             # record your own actions as Playwright code
pwc recording-stop
```

`--raw` prints only the value, which is what you want when a second tool
reads the answer:

```bash
pwc --raw snapshot > before.yml
pwc --raw eval "JSON.stringify([...document.querySelectorAll('a')].map(a => a.href))"
pwc --raw cookie-get session_id
```

## Sign in once, reuse it

A flow that starts on a signed-in page is five commands cheaper when the
session is saved to a file.

```bash
pwc state-save auth.json        # cookies plus local storage
pwc state-load auth.json
pwc cookie-list
pwc localstorage-list
pwc localstorage-get theme
pwc sessionstorage-list
```

Treat `auth.json` as a secret: it holds a live session. Keep it out of git.

## Wrong data, on purpose

Mocking is how you test the empty list, the failed save, and the slow
network without waiting for a real backend to cooperate.

```bash
pwc route "**/*.jpg" --status=404
pwc route "https://api.example.com/**" --body='{"items": []}'
pwc route-list
pwc unroute "**/*.jpg"
pwc unroute                     # remove every route
pwc network-state-set offline
```

## Emulate a device or a preference

```bash
pwc set-color-scheme dark
pwc set-reduced-motion reduce
pwc set-forced-colors active
pwc set-media print
pwc clear-color-scheme
pwc clear-reduced-motion
```

## Show the page to the student

```bash
pwc show                        # a dashboard with the live page
pwc show --annotate             # they draw on the page, you receive the notes
pwc highlight e5                # outline an element so they can see what you mean
pwc highlight --hide
```

`show --annotate` is the fastest way to ask "is this what you meant" when the
words are not landing.

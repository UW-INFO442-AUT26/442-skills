# Visual patterns

Ready-made SVG visuals for an exercise page. Each pattern is a complete
snippet: the markup, and for the widget patterns the controls and the js. Copy
a block, change the words to your topic, and leave the machinery alone.

**Patterns 1, 2, 3 and 5 are widgets. Pattern 4 is a figure.**

## The rules every pattern obeys

- **It scales.** The root `<svg>` carries `viewBox`, `width="100%"`,
  `height="auto"`, `role="img"`, and a `<title>` that says what the picture
  shows. It fits the 360 px phone column and never scrolls sideways.
- **It takes the colour from the system.** Every fill and stroke is a token
  (`var(--accent)`, `var(--ink-2)`, `var(--surface-2)`, and so on). No colour
  is written by hand, so the picture follows the light theme and the dark theme
  on its own.
- **The colour lives in the `<style>` block, not in a `fill="..."` attribute.**
  A token inside a presentation attribute is not reliable in every browser. A
  class in a style block always is.
- **Motion is a transition, and it is never load-bearing.** Durations come from
  `var(--motion-move)` and `var(--ease)`, which the page collapses to 1 ms
  under `prefers-reduced-motion`. The new state is in the DOM the moment the
  student clicks, whether or not the movement is drawn.
- **It never reveals an answer.** The examples below use a request path and a
  load chart. Change the words, and keep the answer to your own prompt out of
  the picture (rule 1 of [../references/learning-science.md](../references/learning-science.md)).
- **Its class prefix is its own.** A `<style>` block inside an injected SVG
  applies to the whole page, so two patterns that share a class name will
  restyle each other. Below the prefixes are `vp1` to `vp5`. Keep them apart if
  you write your own.

**Into spec.json.** `figure.content`, `widget.html` and `widget.js` are JSON
strings, so inside them a double quote becomes `\"` and a line break becomes
`\n`. Paste a block into your editor and let it escape the string, or keep the
markup on one line. `widget.controls` is a real JSON array and goes in as it
is. A `figure` and a `widget` also take a `caption`, one plain line under the
picture, and that line you write in your own words.

## Pattern 1. An animated process diagram

**Use it when** the idea is a sequence of stages, where each stage hands work
to the next. One press of Next step draws one arrow, slides the highlight bar
along, and rewrites the readout. The boxes finished are tinted as done, so the
student can see how far the work has travelled.

`widget.html`:

```html
<svg class="vp1" viewBox="0 0 300 92" width="100%" height="auto" role="img">
  <title>A request moving through three stages: phone, server, database</title>
  <style>
    .vp1 { display: block; }
    .vp1 text { font-family: var(--font-sans); }
    .vp1 .vp1-read { fill: var(--ink); font-size: 14px; font-weight: 600; }
    .vp1 .vp1-name { fill: var(--ink-2); font-size: 16px; }
    .vp1 .vp1-box {
      fill: var(--surface);
      stroke: var(--border-strong);
      stroke-width: 2px;
      transition: fill var(--motion-move) var(--ease), stroke var(--motion-move) var(--ease);
    }
    .vp1 .vp1-done { fill: var(--success-soft); stroke: var(--success); }
    .vp1 .vp1-live { fill: var(--accent-soft); stroke: var(--accent); }
    .vp1 .vp1-line {
      fill: none;
      stroke: var(--border-strong);
      stroke-width: 2px;
      stroke-linecap: round;
      stroke-dasharray: 20;
      stroke-dashoffset: 20;
      transition: stroke-dashoffset var(--motion-move) var(--ease), stroke var(--motion-move) var(--ease);
    }
    .vp1 .vp1-head {
      fill: none;
      stroke: var(--border-strong);
      stroke-width: 2px;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0;
      transition: opacity var(--motion-move) var(--ease) var(--motion);
    }
    .vp1 .vp1-hot .vp1-line { stroke: var(--accent); stroke-dashoffset: 0; }
    .vp1 .vp1-hot .vp1-head { stroke: var(--accent); opacity: 1; }
    .vp1 .vp1-mark { fill: var(--accent); transition: transform var(--motion-move) var(--ease); }
  </style>
  <text class="vp1-read" x="8" y="12">Press Next step to start</text>
  <rect class="vp1-box" data-caption="the phone sends the request"
        x="8" y="28" width="80" height="46" rx="8"/>
  <text class="vp1-name" x="48" y="57" text-anchor="middle">phone</text>
  <g class="vp1-arrow">
    <path class="vp1-line" d="M88 51 L108 51"/>
    <path class="vp1-head" d="M102 45 L108 51 L102 57"/>
  </g>
  <rect class="vp1-box" data-caption="the server works on it"
        x="110" y="28" width="80" height="46" rx="8"/>
  <text class="vp1-name" x="150" y="57" text-anchor="middle">server</text>
  <g class="vp1-arrow">
    <path class="vp1-line" d="M190 51 L210 51"/>
    <path class="vp1-head" d="M204 45 L210 51 L204 57"/>
  </g>
  <rect class="vp1-box" data-caption="the database answers"
        x="212" y="28" width="80" height="46" rx="8"/>
  <text class="vp1-name" x="252" y="57" text-anchor="middle">database</text>
  <rect class="vp1-mark" x="8" y="82" width="80" height="4" rx="2"/>
</svg>
```

`widget.controls`:

```json
[
  { "type": "button", "name": "next", "label": "Next step" },
  { "type": "button", "name": "start", "label": "Start again" }
]
```

`widget.js`:

```js
function (values, root, changed) {
  var svg = root.querySelector(".vp1");
  if (!svg) return;
  var boxes = svg.querySelectorAll(".vp1-box");
  var arrows = svg.querySelectorAll(".vp1-arrow");
  var mark = svg.querySelector(".vp1-mark");
  var read = svg.querySelector(".vp1-read");
  var total = boxes.length;
  /* How many stages have been walked: one per press, less the restarts. */
  var at = Math.max(0, Math.min((values.next || 0) - (values.start || 0), total));
  var i;
  for (i = 0; i < total; i += 1) {
    boxes[i].classList.toggle("vp1-live", i === at - 1);
    boxes[i].classList.toggle("vp1-done", i < at - 1);
  }
  for (i = 0; i < arrows.length; i += 1) {
    /* Arrow i carried the work into box i + 1, so it is drawn once that
       box is the live one. */
    arrows[i].classList.toggle("vp1-hot", i < at - 1);
  }
  if (mark) {
    var live = boxes[at > 0 ? at - 1 : 0];
    var dx = Number(live.getAttribute("x")) - Number(mark.getAttribute("x"));
    mark.style.transform = "translateX(" + dx + "px)";
  }
  if (read) {
    read.textContent = at === 0
      ? "Press Next step to start"
      : "Step " + at + " of " + total + ": " + (boxes[at - 1].getAttribute("data-caption") || "");
  }
}
```

Write a `caption` for your own topic, for example: each press sends the request
one stage further along.

## Pattern 2. An interactive bar chart

**Use it when** several amounts share one total and the student should feel how
they all move together. The slider is the load, the bars are the workers, and
every bar grows under the student's hand, with the axis and the value labels
saying how much.

`widget.html`:

```html
<svg class="vp2" viewBox="0 0 300 178" width="100%" height="auto" role="img">
  <title>A bar chart of how one load splits across four workers</title>
  <style>
    .vp2 { display: block; }
    .vp2 text { font-family: var(--font-sans); font-size: 13px; fill: var(--muted); }
    .vp2 .vp2-val { fill: var(--ink-2); font-size: 13px; font-weight: 600; }
    .vp2 .vp2-cat { fill: var(--ink-2); font-size: 13px; }
    .vp2 .vp2-axis { stroke: var(--border-strong); stroke-width: 1.5px; }
    .vp2 .vp2-grid { stroke: var(--border); stroke-width: 1px; }
    .vp2 .vp2-bar {
      fill: var(--accent);
      transition: transform var(--motion-move) var(--ease);
    }
  </style>
  <line class="vp2-grid" x1="30" y1="90" x2="292" y2="90"/>
  <line class="vp2-axis" x1="30" y1="30" x2="30" y2="150"/>
  <line class="vp2-axis" x1="30" y1="150" x2="292" y2="150"/>
  <text x="24" y="34" text-anchor="end">40</text>
  <text x="24" y="94" text-anchor="end">20</text>
  <text x="24" y="154" text-anchor="end">0</text>
  <rect class="vp2-bar" x="46" y="30" width="40" height="120"/>
  <rect class="vp2-bar" x="110" y="30" width="40" height="120"/>
  <rect class="vp2-bar" x="174" y="30" width="40" height="120"/>
  <rect class="vp2-bar" x="238" y="30" width="40" height="120"/>
  <text class="vp2-val" x="66" y="94" text-anchor="middle">16</text>
  <text class="vp2-val" x="130" y="106" text-anchor="middle">12</text>
  <text class="vp2-val" x="194" y="118" text-anchor="middle">8</text>
  <text class="vp2-val" x="258" y="130" text-anchor="middle">4</text>
  <text class="vp2-cat" x="66" y="170" text-anchor="middle">A</text>
  <text class="vp2-cat" x="130" y="170" text-anchor="middle">B</text>
  <text class="vp2-cat" x="194" y="170" text-anchor="middle">C</text>
  <text class="vp2-cat" x="258" y="170" text-anchor="middle">D</text>
</svg>
```

Each bar is drawn at its full height and scaled from the baseline, so the bar
never needs its height rewritten, and a browser without a transition just jumps
to the new size.

`widget.controls`:

```json
[
  { "type": "range", "name": "load", "label": "Load", "min": 10, "max": 100, "step": 10, "value": 40 }
]
```

`widget.js`:

```js
(function () {
  /* The share of the load each worker takes. Change these four numbers and
     the chart still adds up: they are the story of the picture. */
  var WEIGHT = [0.4, 0.3, 0.2, 0.1];
  var TOP = 40;        /* what the axis tops out at, in load */
  var BASE = 150;      /* the baseline, in the picture */
  var PLOT = 120;      /* how tall the plot is, in the picture */
  return function (values, root, changed) {
    var svg = root.querySelector(".vp2");
    if (!svg) return;
    var load = Number(values.load) || 40;
    var bars = svg.querySelectorAll(".vp2-bar");
    var vals = svg.querySelectorAll(".vp2-val");
    for (var i = 0; i < bars.length; i += 1) {
      var v = Math.round(load * WEIGHT[i]);
      var k = Math.max(0, Math.min(v / TOP, 1));
      var x = Number(bars[i].getAttribute("x"));
      var w = Number(bars[i].getAttribute("width"));
      /* Grow from the baseline, not from the middle of the bar. */
      bars[i].style.transformOrigin = (x + w / 2) + "px " + BASE + "px";
      bars[i].style.transform = "scaleY(" + k + ")";
      if (vals[i]) {
        vals[i].textContent = String(v);
        vals[i].setAttribute("y", String(BASE - k * PLOT - 8));
      }
    }
  };
})()
```

Caption idea: the load splits across four workers, and every bar grows with it.

## Pattern 3. A scrubbed line chart

**Use it when** a value changes over time or over steps, and the student should
move along it rather than read it. The slider scrubs the marker along the drawn
line, and the readout says which point it is on and what the line is worth
there. The readout is measured off the drawn path, so a screenshot and the
number can never disagree.

`widget.html`:

```html
<svg class="vp3" viewBox="0 0 300 166" width="100%" height="auto" role="img">
  <title>A line chart over seven points, with a marker you can move along it</title>
  <style>
    .vp3 { display: block; }
    .vp3 text { font-family: var(--font-sans); font-size: 13px; fill: var(--muted); }
    .vp3 .vp3-read { fill: var(--ink); font-size: 14px; font-weight: 600; }
    .vp3 .vp3-axis { stroke: var(--border-strong); stroke-width: 1.5px; }
    .vp3 .vp3-grid { stroke: var(--border); stroke-width: 1px; }
    .vp3 .vp3-area { fill: var(--accent-soft); stroke: none; }
    .vp3 .vp3-line {
      fill: none;
      stroke: var(--accent);
      stroke-width: 2.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .vp3 .vp3-guide { stroke: var(--border-strong); stroke-width: 1.5px; stroke-dasharray: 4 4; }
    .vp3 .vp3-dot { transition: transform var(--motion-move) var(--ease); }
    .vp3 .vp3-guide-g { transition: transform var(--motion-move) var(--ease); }
    .vp3 .vp3-knob { fill: var(--accent); stroke: var(--surface); stroke-width: 3px; }
  </style>
  <text class="vp3-read" x="32" y="14">Point 1 of 7, value 12</text>
  <line class="vp3-grid" x1="32" y1="82" x2="292" y2="82"/>
  <line class="vp3-axis" x1="32" y1="26" x2="32" y2="138"/>
  <line class="vp3-axis" x1="32" y1="138" x2="292" y2="138"/>
  <text x="26" y="30" text-anchor="end">100</text>
  <text x="26" y="86" text-anchor="end">50</text>
  <text x="26" y="142" text-anchor="end">0</text>
  <text x="32" y="156" text-anchor="middle">1</text>
  <text x="75" y="156" text-anchor="middle">2</text>
  <text x="119" y="156" text-anchor="middle">3</text>
  <text x="162" y="156" text-anchor="middle">4</text>
  <text x="205" y="156" text-anchor="middle">5</text>
  <text x="249" y="156" text-anchor="middle">6</text>
  <text x="292" y="156" text-anchor="middle">7</text>
  <path class="vp3-area" d=""/>
  <path class="vp3-line" d=""/>
  <g class="vp3-guide-g">
    <line class="vp3-guide" x1="0" y1="26" x2="0" y2="138"/>
  </g>
  <g class="vp3-dot">
    <circle class="vp3-knob" r="7" cx="0" cy="0"/>
  </g>
</svg>
```

`widget.controls`:

```json
[
  { "type": "range", "name": "at", "label": "Scrub along the line", "min": 0, "max": 100, "step": 1, "value": 0, "unit": "%" }
]
```

`widget.js`:

```js
(function () {
  /* The shape of the line. Change these seven numbers to your own data. */
  var DATA = [12, 34, 24, 52, 40, 66, 48];
  var X0 = 32;      /* first point, in the picture */
  var X1 = 292;     /* last point, in the picture */
  var TOP = 26;     /* the top of the plot, worth 100 */
  var BASE = 138;   /* the baseline, worth 0 */
  var MAX = 100;
  function px(i) { return X0 + (i * (X1 - X0)) / (DATA.length - 1); }
  function py(v) { return BASE - (v / MAX) * (BASE - TOP); }
  return function (values, root, changed) {
    var svg = root.querySelector(".vp3");
    if (!svg) return;
    var line = svg.querySelector(".vp3-line");
    var area = svg.querySelector(".vp3-area");
    var dot = svg.querySelector(".vp3-dot");
    var guide = svg.querySelector(".vp3-guide-g");
    var read = svg.querySelector(".vp3-read");
    if (!line.getAttribute("d")) {
      var d = "M" + px(0).toFixed(1) + " " + py(DATA[0]).toFixed(1);
      for (var i = 1; i < DATA.length; i += 1) {
        d += " L" + px(i).toFixed(1) + " " + py(DATA[i]).toFixed(1);
      }
      line.setAttribute("d", d);
      area.setAttribute("d", d
        + " L" + px(DATA.length - 1).toFixed(1) + " " + BASE
        + " L" + px(0).toFixed(1) + " " + BASE + " Z");
    }
    /* Walk the drawn path, then read the value back off the height we
       landed at, so the marker and the number always agree. */
    var along = Math.max(0, Math.min(Number(values.at) / 100, 1));
    var len = line.getTotalLength();
    var p = line.getPointAtLength(along * len);
    dot.style.transform = "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px)";
    guide.style.transform = "translate(" + p.x.toFixed(1) + "px,0)";
    if (read) {
      var near = Math.round(((p.x - X0) / ((X1 - X0) / (DATA.length - 1))) + 1);
      near = Math.max(1, Math.min(near, DATA.length));
      read.textContent = "Point " + near + " of " + DATA.length
        + ", value " + Math.round(((BASE - p.y) / (BASE - TOP)) * MAX);
    }
  };
})()
```

Caption idea: drag the slider and the marker walks the line; the number is what
the line is worth there.

## Pattern 4. A labelled diagram with data-reveal hotspots

**Use it when** the idea is structure: the parts of one thing and what each
part does. Each hotspot carries a short name in `data-reveal`, and the page
turns the element into a tap-or-hover control that shows that name. Use a
`figure`, not a widget: nothing here moves.

`figure.content`:

```html
<svg class="vp4" viewBox="0 0 300 176" width="100%" height="auto" role="img">
  <title>A request leaving a phone, crossing the network, and reaching a server and its cache</title>
  <style>
    .vp4 { display: block; }
    /* A word drawn on top of a hotspot would swallow the tap, so the labels
       let the pointer through to the shape underneath. */
    .vp4 text { font-family: var(--font-sans); font-size: 16px; fill: var(--ink-2); pointer-events: none; }
    .vp4 .vp4-part { fill: var(--surface-2); stroke: var(--border-strong); stroke-width: 2px; }
    .vp4 .vp4-net { fill: transparent; stroke: var(--border); stroke-width: 1.5px; stroke-dasharray: 6 5; }
    .vp4 .vp4-wire { fill: none; stroke: var(--muted); stroke-width: 2px; stroke-linecap: round; stroke-linejoin: round; }
    .vp4 .vp4-wire-dash { stroke-dasharray: 5 5; }
    .vp4 .vp4-word { fill: var(--muted); font-size: 13px; }
    .vp4 [data-reveal] { cursor: pointer; }
    .vp4 .reveal-on { stroke: var(--accent); }
    .vp4 .reveal-on.vp4-part { stroke-width: 3px; fill: var(--accent-soft); }
  </style>
  <rect class="vp4-net" data-reveal="the network: it carries the request, and it can lose it" aria-label="the network"
        x="96" y="52" width="104" height="80" rx="10"/>
  <text class="vp4-word" x="148" y="96" text-anchor="middle">network</text>
  <rect class="vp4-part" data-reveal="the phone: it starts the request and waits for the answer" aria-label="the phone"
        x="8" y="52" width="84" height="72" rx="8"/>
  <text x="50" y="93" text-anchor="middle">phone</text>
  <rect class="vp4-part" data-reveal="the server: it decides what the answer is" aria-label="the server"
        x="204" y="16" width="88" height="64" rx="8"/>
  <text x="248" y="54" text-anchor="middle">server</text>
  <rect class="vp4-part" data-reveal="the cache: it holds answers that were worked out before" aria-label="the cache"
        x="204" y="104" width="88" height="64" rx="8"/>
  <text x="248" y="142" text-anchor="middle">cache</text>
  <path class="vp4-wire" d="M92 64 L198 64 M192 58 L198 64 L192 70"/>
  <path class="vp4-wire vp4-wire-dash" d="M248 84 L248 100 M242 94 L248 100 L254 94"/>
  <path class="vp4-wire" d="M204 112 L98 112 M104 106 L98 112 L104 118"/>
</svg>
```

Give the step a `caption` such as: tap a part to name it.

The page adds the tab stop, the button role, the `aria-expanded`, and the
caption list under the picture. The `aria-label` on each hotspot is what names
the button before it is opened.

## Pattern 5. A state machine

**Use it when** one thing is in one state at a time, and a button moves it on.
The live node is filled with the accent, the edge it just took is drawn in the
accent, and the readout names the state. The dashed edge is the exception: the
path taken only when it goes wrong.

`widget.html`:

```html
<svg class="vp5" viewBox="0 0 300 164" width="100%" height="auto" role="img">
  <title>A state machine that moves between idle, sending, waiting and retrying</title>
  <style>
    .vp5 { display: block; }
    .vp5 text { font-family: var(--font-sans); font-size: 16px; fill: var(--ink-2); }
    .vp5 .vp5-read { fill: var(--ink); font-size: 14px; font-weight: 600; }
    .vp5 .vp5-edge { fill: none; stroke: var(--border-strong); stroke-width: 2px; stroke-linecap: round; stroke-linejoin: round; }
    .vp5 .vp5-extra { stroke-dasharray: 5 5; }
    .vp5 .vp5-hot { stroke: var(--accent); stroke-width: 3px; stroke-dasharray: none; }
    .vp5 .vp5-node rect {
      fill: var(--surface);
      stroke: var(--border-strong);
      stroke-width: 2px;
      transition: fill var(--motion-move) var(--ease), stroke var(--motion-move) var(--ease);
    }
    .vp5 .vp5-live rect { fill: var(--accent-soft); stroke: var(--accent); }
    .vp5 .vp5-live text { fill: var(--ink); }
  </style>
  <g class="vp5-edges"></g>
  <g class="vp5-node">
    <rect x="8" y="6" width="108" height="40" rx="8"/>
    <text x="62" y="32" text-anchor="middle">idle</text>
  </g>
  <g class="vp5-node">
    <rect x="184" y="6" width="108" height="40" rx="8"/>
    <text x="238" y="32" text-anchor="middle">sending</text>
  </g>
  <g class="vp5-node">
    <rect x="184" y="94" width="108" height="40" rx="8"/>
    <text x="238" y="120" text-anchor="middle">waiting</text>
  </g>
  <g class="vp5-node">
    <rect x="8" y="94" width="108" height="40" rx="8"/>
    <text x="62" y="120" text-anchor="middle">retrying</text>
  </g>
  <text class="vp5-read" x="150" y="156" text-anchor="middle">State 1 of 4: idle</text>
</svg>
```

`widget.controls`:

```json
[
  { "type": "button", "name": "next", "label": "Next state" },
  { "type": "button", "name": "start", "label": "Start again" }
]
```

`widget.js`:

```js
(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";
  /* Pairs of node numbers. The first four are the happy path, in order, so
     edge i leads into node i + 1 and the last one leads back to node 0. Any
     further pair is an extra edge and is never the one that lights up. */
  var EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3]];
  var CYCLE = 4;
  var drawn = false;

  /* Where a straight edge leaves the edge of a node box. */
  function rim(node, other, gap) {
    var dx = other.x - node.x;
    var dy = other.y - node.y;
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= d;
    dy /= d;
    var hw = node.w / 2 + gap;
    var hh = node.h / 2 + gap;
    var s = Math.min(hw / (Math.abs(dx) || 1e-6), hh / (Math.abs(dy) || 1e-6));
    return { x: node.x + dx * s, y: node.y + dy * s, dx: dx, dy: dy };
  }

  /* The line plus its arrow head, as one path. */
  function edgePath(from, to) {
    var s = rim(from, to, 6);
    var e = rim(to, from, 6);
    var bx = e.x - e.dx * 10;
    var by = e.y - e.dy * 10;
    var ax = e.dy * 5;
    var ay = -e.dx * 5;
    return "M" + s.x.toFixed(1) + " " + s.y.toFixed(1)
      + " L" + e.x.toFixed(1) + " " + e.y.toFixed(1)
      + " M" + (bx + ax).toFixed(1) + " " + (by + ay).toFixed(1)
      + " L" + e.x.toFixed(1) + " " + e.y.toFixed(1)
      + " M" + (bx - ax).toFixed(1) + " " + (by - ay).toFixed(1)
      + " L" + e.x.toFixed(1) + " " + e.y.toFixed(1);
  }

  return function (values, root, changed) {
    var svg = root.querySelector(".vp5");
    if (!svg) return;
    var groups = svg.querySelectorAll(".vp5-node");
    var nodes = [];
    var i;
    for (i = 0; i < groups.length; i += 1) {
      var r = groups[i].querySelector("rect");
      var x = Number(r.getAttribute("x"));
      var y = Number(r.getAttribute("y"));
      var w = Number(r.getAttribute("width"));
      var h = Number(r.getAttribute("height"));
      nodes.push({ x: x + w / 2, y: y + h / 2, w: w, h: h });
    }
    if (!drawn) {
      var layer = svg.querySelector(".vp5-edges");
      for (i = 0; i < EDGES.length; i += 1) {
        var p = document.createElementNS(SVG_NS, "path");
        p.setAttribute("class", "vp5-edge" + (i < CYCLE ? "" : " vp5-extra"));
        p.setAttribute("d", edgePath(nodes[EDGES[i][0]], nodes[EDGES[i][1]]));
        layer.appendChild(p);
      }
      drawn = true;
    }
    var edges = svg.querySelectorAll(".vp5-edge");
    var total = nodes.length;
    var at = ((values.next || 0) - (values.start || 0)) % total;
    if (at < 0) at += total;
    /* The edge the machine just took is the one leading into this node. */
    var took = (at + total - 1) % total;
    for (i = 0; i < total; i += 1) {
      groups[i].classList.toggle("vp5-live", i === at);
    }
    for (i = 0; i < edges.length; i += 1) {
      edges[i].classList.toggle("vp5-hot", i === took);
    }
    var read = svg.querySelector(".vp5-read");
    if (read) {
      var name = groups[at].querySelector("text").textContent;
      read.textContent = "State " + (at + 1) + " of " + total + ": " + name;
    }
  };
})()
```

Caption idea: press Next state and watch which edge the machine takes.

## Checking your own pattern

Before you ship a visual, open the page at 360 px wide and check four things:

1. It renders, and it is not taller than the phone screen.
2. Nothing scrolls sideways. The picture shrinks to the column instead of
   pushing it out.
3. The controls change the picture. Press the buttons, drag the slider, tap a
   hotspot, and watch the DOM move with them.
4. The dark theme and `prefers-reduced-motion` both still read. Turn the theme
   on with `<html data-theme="dark">`, and switch reduced motion on in the
   browser, and the picture keeps its meaning with no movement at all.

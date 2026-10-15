#!/usr/bin/env node
// Validate one exercise spec against the contract.
//
//   node validate-spec.mjs <spec.json> [--page <index.html>]
//
// Exit 0 and print one summary line when the spec is valid. Exit 1 and print
// every problem, one line per problem, when it is not. Nothing is written.
//
// The spec is checked against every contract rule a reader of the JSON can
// break: kinds, required fields, indices, permutations, buckets, counts,
// duplicate ids, an em dash, and an answer that sits in its own prompt.
//
// When --page is given, or when an index.html sits beside the spec, the page
// is checked too, for the two things the page must not carry: an em dash, and
// a rendered tag chip or the removed INFO 442 badge.

import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";

const EM_DASH = "\u2014";

const QUESTION_KINDS = new Set(["choice", "multi", "short", "order", "sort", "match"]);
const KINDS = new Set([...QUESTION_KINDS, "explore"]);
const FIGURE_TYPES = new Set(["svg", "html", "code"]);
const CONTROL_TYPES = new Set(["range", "switch", "select", "button"]);

const USAGE = `Validate one exercise spec against the contract.

  node validate-spec.mjs <spec.json> [--page <index.html>]

  <spec.json>   the spec to check
  --page        also check this built page. Default: index.html beside the
                spec, when one exists
  --help        this text
`;

/* ------------------------------------------------------------------ *
 * Small helpers                                                       *
 * ------------------------------------------------------------------ */

const problems = [];
const add = (where, msg) => problems.push(where + ": " + msg);

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const isInt = (v) => Number.isInteger(v);
const isText = (v) => typeof v === "string" && v.trim() !== "";
const inRange = (i, len) => isInt(i) && i >= 0 && i < len;
const list = (a) => a.map((v) => JSON.stringify(v)).join(", ");

// Lowercase, drop punctuation, collapse spaces. Used only to ask whether one
// string shows up inside another.
const flat = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Short answers such as "5" show up in prompts by accident, so only strings of
// two or more characters are tested for leakage.
const leaks = (prompt, answer) => {
  const a = flat(answer);
  return a.length >= 2 && flat(prompt).includes(a);
};

/* ------------------------------------------------------------------ *
 * Spec checks                                                         *
 * ------------------------------------------------------------------ */

// Every string anywhere in the spec, keys included, is author copy that can
// reach the page or the guide the author copies from.
function checkEmDashes(value, where) {
  if (typeof value === "string") {
    if (value.includes(EM_DASH)) {
      add(where, "contains an em dash; use a comma, a colon, or two sentences");
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => checkEmDashes(v, where + "[" + i + "]"));
    return;
  }
  if (isObject(value)) {
    for (const key of Object.keys(value)) {
      if (key.includes(EM_DASH)) {
        add(where + "." + key, "the key contains an em dash; use a comma or a colon");
      }
      checkEmDashes(value[key], where + "." + key);
    }
  }
}

function checkMeta(meta) {
  if (!isObject(meta)) {
    add("meta", "required, an object with title, slug, goal, minutes and criterion");
    return;
  }
  if (!isText(meta.title)) add("meta.title", "required, a non-empty string");
  if (!isText(meta.slug)) {
    add("meta.slug", "required, a non-empty string");
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.slug)) {
    add("meta.slug", "must be lowercase letters, digits and single hyphens, for example 442-http-status-codes");
  }
  if (!isText(meta.goal)) add("meta.goal", "required, one sentence starting \"After this you can\"");
  if (!isInt(meta.minutes) || meta.minutes <= 0) {
    add("meta.minutes", "required, a whole number of minutes greater than 0");
  }
  const c = meta.criterion;
  if (!isObject(c)) {
    add("meta.criterion", "required, an object with text and minCorrect");
    return;
  }
  if (!isText(c.text)) add("meta.criterion.text", "required, the bar in the student's words");
  if (!isInt(c.minCorrect) || c.minCorrect < 0) {
    add("meta.criterion.minCorrect", "required, a whole number that counts questions only");
  }
  if (meta.style !== undefined && (!isText(meta.style) || !meta.style.trim())) {
    add("meta.style", "optional, but when present it must be a non-empty string of CSS");
  }
  if (meta.resources !== undefined) {
    if (!Array.isArray(meta.resources)) {
      add("meta.resources", "optional, but when present it must be an array of { label, href }");
    } else {
      meta.resources.forEach((r, i) => {
        const where = "meta.resources[" + i + "]";
        if (!isObject(r)) { add(where, "must be an object with label and href"); return; }
        if (!isText(r.label)) add(where + ".label", "required, the text the student taps");
        if (!isText(r.href)) add(where + ".href", "required, a link the student can open");
        else if (!/^https?:\/\/\S+$/.test(r.href)) add(where + ".href", "must be a full http or https link");
        if (r.note !== undefined && !isText(r.note)) add(where + ".note", "optional, but when present it must be text");
      });
    }
  }
}

// A misconception is a string, or an object keyed by the wrong option index
// with an optional "default". Only choice and multi have option indices.
function checkMisconception(step, where, optionCount) {
  const m = step.misconception;
  if (isText(m)) return;
  if (!isObject(m)) {
    add(where + ".misconception", "required: a string, or an object keyed by wrong option index with an optional \"default\"");
    return;
  }
  const keys = Object.keys(m);
  if (keys.length === 0) {
    add(where + ".misconception", "is an empty object; add a key per wrong option, or write one string");
    return;
  }
  for (const key of keys) {
    const value = m[key];
    if (!isText(value)) {
      add(where + ".misconception." + key, "must be a non-empty string");
    }
    if (key === "default") continue;
    if (!/^\d+$/.test(key)) {
      add(where + ".misconception." + key, "keys must be an option index or \"default\"");
    } else if (optionCount === 0) {
      add(where + ".misconception." + key, "keyed by option index, but this kind has no options");
    } else if (!inRange(Number(key), optionCount)) {
      add(where + ".misconception." + key, `index out of range (0 to ${optionCount - 1})`);
    }
  }
}

function checkFigure(step, where) {
  const f = step.figure;
  if (f === undefined) return;
  if (!isObject(f)) {
    add(where + ".figure", "must be an object with type and content");
    return;
  }
  if (!FIGURE_TYPES.has(f.type)) {
    add(where + ".figure.type", `must be one of ${list([...FIGURE_TYPES])}`);
  }
  if (!isText(f.content)) add(where + ".figure.content", "required, the markup or the code text");
  if (f.caption !== undefined && !isText(f.caption)) {
    add(where + ".figure.caption", "when present, a non-empty string");
  }
}

function checkWidget(widget, where, required) {
  if (widget === undefined) {
    if (required) add(where, "an explore step needs a widget to play with");
    return;
  }
  if (!isObject(widget)) {
    add(where, "must be an object with html, controls and js");
    return;
  }
  if (!isText(widget.html)) add(where + ".html", "required, the markup injected into the play area");
  if (widget.caption !== undefined && !isText(widget.caption)) {
    add(where + ".caption", "when present, a non-empty string");
  }
  if (!isText(widget.js)) {
    add(where + ".js", "required, the body of function (values, root, changed) that updates the play area");
  }
  if (widget.controls === undefined) return;
  if (!Array.isArray(widget.controls)) {
    add(where + ".controls", "must be an array");
    return;
  }
  const names = new Set();
  widget.controls.forEach((control, i) => {
    const base = `${where}.controls[${i}]`;
    if (!isObject(control)) {
      add(base, "must be an object");
      return;
    }
    if (!CONTROL_TYPES.has(control.type)) {
      add(base + ".type", `must be one of ${list([...CONTROL_TYPES])}`);
    }
    if (!isText(control.name)) {
      add(base + ".name", "required, the key this control writes into values");
    } else if (names.has(control.name)) {
      add(base + ".name", `duplicate control name "${control.name}"`);
    } else {
      names.add(control.name);
    }
    if (!isText(control.label)) add(base + ".label", "required, the words shown beside the control");
    if (control.type === "range") {
      for (const key of ["min", "max", "step", "value"]) {
        if (typeof control[key] !== "number") add(`${base}.${key}`, "required, a number");
      }
      if (typeof control.min === "number" && typeof control.max === "number" && control.min >= control.max) {
        add(base + ".max", "must be greater than min");
      }
      if (
        typeof control.value === "number" &&
        typeof control.min === "number" &&
        typeof control.max === "number" &&
        (control.value < control.min || control.value > control.max)
      ) {
        add(base + ".value", `must sit between min ${control.min} and max ${control.max}`);
      }
      if (control.unit !== undefined && !isText(control.unit)) {
        add(base + ".unit", "when present, a non-empty string");
      }
    }
    if (control.type === "switch" && typeof control.value !== "boolean") {
      add(base + ".value", "required, true or false");
    }
    if (control.type === "select") {
      if (!Array.isArray(control.options) || control.options.length === 0 || !control.options.every(isText)) {
        add(base + ".options", "required, a non-empty array of strings");
      } else if (control.value !== undefined && !control.options.includes(control.value)) {
        add(base + ".value", "must be one of the options");
      }
    }
  });
}

function checkStep(step, i, seen) {
  const where = `steps[${i}]`;
  if (!isObject(step)) {
    add(where, "must be an object");
    return null;
  }

  if (!isText(step.id)) {
    add(where + ".id", "required, a unique short string");
  } else if (seen.has(step.id)) {
    add(where + ".id", `duplicate id "${step.id}", first used at steps[${seen.get(step.id)}]`);
  } else {
    seen.set(step.id, i);
  }

  if (step.tag !== undefined && !isText(step.tag)) {
    add(where + ".tag", "when present, a non-empty string naming the sub-topic");
  }

  const isQuestion = QUESTION_KINDS.has(step.kind);
  if (!isText(step.kind)) {
    add(where + ".kind", "required");
  } else if (!KINDS.has(step.kind)) {
    add(where + ".kind", `unknown kind "${step.kind}"; use one of ${list([...KINDS])}`);
  }
  if (!isText(step.prompt)) add(where + ".prompt", "required, the words the student reads");

  if (isQuestion && !isText(step.feedback)) {
    add(where + ".feedback", "required on a question, explaining why the answer is right");
  }
  if (step.hint !== undefined && !isText(step.hint)) {
    add(where + ".hint", "when present, a non-empty string");
  }

  checkFigure(step, where);

  const options = Array.isArray(step.options) ? step.options : [];
  if (step.kind === "choice" || step.kind === "multi") {
    checkMisconception(step, where, options.length);
  } else if (step.misconception !== undefined && !isText(step.misconception)) {
    add(where + ".misconception", "when present, a non-empty string");
  }

  switch (step.kind) {
    case "choice": {
      if (!Array.isArray(step.options) || options.length < 3 || options.length > 5) {
        add(where + ".options", "choice needs 3 to 5 options");
      } else if (!options.every(isText)) {
        add(where + ".options", "every option must be a non-empty string");
      }
      if (!isInt(step.answer)) {
        add(where + ".answer", "required, the zero based index of the right option");
      } else if (options.length && !inRange(step.answer, options.length)) {
        add(where + ".answer", `index ${step.answer} is out of range (0 to ${options.length - 1})`);
      } else if (isText(step.prompt) && leaks(step.prompt, options[step.answer])) {
        add(where + ".prompt", "contains the right option, so the step shows its answer before submit");
      }
      break;
    }
    case "multi": {
      if (!Array.isArray(step.options) || options.length < 2) {
        add(where + ".options", "multi needs at least 2 options");
      } else if (!options.every(isText)) {
        add(where + ".options", "every option must be a non-empty string");
      }
      if (!Array.isArray(step.answer) || step.answer.length === 0) {
        add(where + ".answer", "required, a non-empty array of the indices that are correct");
        break;
      }
      const bad = step.answer.filter((a) => !inRange(a, options.length));
      if (bad.length) {
        add(where + ".answer", `index out of range: ${list(bad)} (0 to ${options.length - 1})`);
      } else if (new Set(step.answer).size !== step.answer.length) {
        add(where + ".answer", "lists the same index twice");
      } else if (isText(step.prompt)) {
        for (const a of step.answer) {
          if (leaks(step.prompt, options[a])) {
            add(where + ".prompt", `contains the right option ${JSON.stringify(options[a])}`);
          }
        }
      }
      break;
    }
    case "short": {
      const accepted = Array.isArray(step.answer) ? step.answer : [step.answer];
      if (accepted.length === 0 || !accepted.every(isText)) {
        add(where + ".answer", "required, a string or an array of accepted strings");
        break;
      }
      if (isText(step.prompt)) {
        for (const a of accepted) {
          if (leaks(step.prompt, a)) {
            add(where + ".prompt", `contains the accepted answer ${JSON.stringify(a)}`);
          }
        }
      }
      break;
    }
    case "order": {
      if (!Array.isArray(step.options) || options.length < 2) {
        add(where + ".options", "order needs at least 2 items");
      } else if (!options.every(isText)) {
        add(where + ".options", "every item must be a non-empty string");
      }
      if (!Array.isArray(step.answer)) {
        add(where + ".answer", "required, the correct order as indices into options");
        break;
      }
      const n = options.length;
      const ok =
        step.answer.length === n &&
        step.answer.every((a) => inRange(a, n)) &&
        new Set(step.answer).size === n;
      if (!ok) {
        add(where + ".answer", `must be a permutation of 0 to ${n - 1}, one index per item`);
      } else if (isText(step.prompt) && leaks(step.prompt, step.answer.map((a) => options[a]).join(" "))) {
        add(where + ".prompt", "lists the items in the right order");
      }
      break;
    }
    case "sort": {
      const buckets = Array.isArray(step.buckets) ? step.buckets : [];
      if (buckets.length < 2 || buckets.length > 3 || !buckets.every(isText)) {
        add(where + ".buckets", "sort needs 2 or 3 bucket names");
      }
      if (!Array.isArray(step.items) || step.items.length === 0) {
        add(where + ".items", "required, a non-empty array of items");
        break;
      }
      step.items.forEach((item, k) => {
        const base = `${where}.items[${k}]`;
        if (!isObject(item)) {
          add(base, "must be an object with text and bucket");
          return;
        }
        if (!isText(item.text)) add(base + ".text", "required, the item the student places");
        if (!isInt(item.bucket)) {
          add(base + ".bucket", "required, the index of the right bucket");
        } else if (buckets.length && !inRange(item.bucket, buckets.length)) {
          add(base + ".bucket", `index ${item.bucket} is out of range (0 to ${buckets.length - 1})`);
        }
      });
      break;
    }
    case "match": {
      const lefts = Array.isArray(step.lefts) ? step.lefts : [];
      const rights = Array.isArray(step.rights) ? step.rights : [];
      if (lefts.length < 2 || !lefts.every(isText)) {
        add(where + ".lefts", "match needs at least 2 left items, each a non-empty string");
      }
      if (rights.length < 2 || !rights.every(isText)) {
        add(where + ".rights", "match needs at least 2 right items, each a non-empty string");
      }
      if (!Array.isArray(step.answer)) {
        add(where + ".answer", "required, one index into rights per left item");
        break;
      }
      if (step.answer.length !== lefts.length) {
        add(where + ".answer", `has ${step.answer.length} entries but lefts has ${lefts.length}; one index per left item`);
      }
      const bad = step.answer.filter((a) => !inRange(a, rights.length));
      if (bad.length) {
        add(where + ".answer", `index out of range: ${list(bad)} (0 to ${rights.length - 1})`);
      }
      break;
    }
    case "explore": {
      checkWidget(step.widget, where + ".widget", true);
      break;
    }
    default:
      break;
  }

  if (step.kind !== "explore" && step.widget !== undefined) {
    checkWidget(step.widget, where + ".widget", false);
  }

  return isQuestion;
}

function checkSpec(spec) {
  if (!isObject(spec)) {
    add("<root>", "the spec must be a JSON object with meta and steps");
    return null;
  }
  checkEmDashes(spec, "spec");
  checkMeta(spec.meta);

  if (!Array.isArray(spec.steps) || spec.steps.length === 0) {
    add("steps", "required, a non-empty array of steps");
    return null;
  }

  const seen = new Map();
  const kinds = new Map();
  let questions = 0;
  spec.steps.forEach((step, i) => {
    if (checkStep(step, i, seen)) questions += 1;
    const kind = isObject(step) && isText(step.kind) ? step.kind : "unknown";
    kinds.set(kind, (kinds.get(kind) || 0) + 1);
  });

  const minCorrect = spec.meta && isObject(spec.meta.criterion) ? spec.meta.criterion.minCorrect : undefined;
  if (isInt(minCorrect) && minCorrect > questions) {
    add(
      "meta.criterion.minCorrect",
      `is ${minCorrect}, but only ${questions} step${questions === 1 ? "" : "s"} ${questions === 1 ? "is" : "are"} a question; kinds present: ${[...kinds].map(([k, n]) => `${k} ${n}`).join(", ")}`,
    );
  }

  return { kinds, questions };
}

/* ------------------------------------------------------------------ *
 * Page checks                                                         *
 * ------------------------------------------------------------------ */

// The page may not carry an em dash, a tag chip (tag is author-only), or the
// INFO 442 badge that the contract removes from the header.
function checkPage(path) {
  let html;
  try {
    html = readFileSync(path, "utf8");
  } catch (err) {
    add(path, "cannot be read: " + err.message);
    return;
  }
  if (html.includes(EM_DASH)) {
    add(path, "contains an em dash; use a comma, a colon, or two sentences");
  }
  const classes = [
    ...html.matchAll(/class\s*=\s*["']([^"']*)["']/g),
    ...html.matchAll(/class\s*:\s*["']([^"']*)["']/g),
  ]
    .map((m) => m[1])
    .flatMap((v) => v.split(/\s+/));
  if (classes.includes("tag")) {
    add(path, 'renders a tag chip (an element with class "tag"); a tag is author-only and the page never shows it');
  }
  if (/<[^>]*class\s*=\s*["'][^"']*\bbadge\b[^"']*["'][^>]*>[^<]*INFO\s*442/i.test(html)) {
    add(path, "renders the INFO 442 badge, which the header no longer carries");
  }
}

/* ------------------------------------------------------------------ *
 * Command                                                             *
 * ------------------------------------------------------------------ */

function parseArgs(argv) {
  const args = { spec: null, page: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--page") args.page = argv[++i] || null;
    else if (a.startsWith("--")) return { error: `unknown option ${a}` };
    else if (args.spec) return { error: `unexpected argument ${a}` };
    else args.spec = a;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (args.error) {
    process.stderr.write("error: " + args.error + "\n\n" + USAGE);
    return 1;
  }
  if (!args.spec) {
    process.stderr.write("error: give the spec file to check\n\n" + USAGE);
    return 1;
  }

  const specPath = args.spec;
  let text;
  try {
    text = readFileSync(specPath, "utf8");
  } catch (err) {
    process.stderr.write(`error: cannot read ${specPath}: ${err.message}\n`);
    return 1;
  }

  let spec;
  try {
    spec = JSON.parse(text);
  } catch (err) {
    process.stderr.write(`error: ${specPath} is not valid JSON: ${err.message}\n`);
    return 1;
  }

  const summary = checkSpec(spec);

  let pagePath = args.page;
  if (!pagePath) {
    const sibling = join(dirname(specPath), "index.html");
    if (existsSync(sibling)) pagePath = sibling;
  } else if (!isAbsolute(pagePath)) {
    pagePath = join(process.cwd(), pagePath);
  }
  if (pagePath) checkPage(pagePath);

  if (problems.length) {
    process.stderr.write(`${specPath} does not follow the contract:\n`);
    for (const p of problems) process.stderr.write(`  ${p}\n`);
    process.stderr.write(`${problems.length} problem${problems.length === 1 ? "" : "s"}\n`);
    return 1;
  }

  const title = spec.meta && spec.meta.title ? spec.meta.title : specPath;
  const kinds = summary ? [...summary.kinds].map(([k, n]) => `${k} ${n}`).join(", ") : "";
  const questions = summary ? summary.questions : 0;
  const minCorrect = spec.meta && spec.meta.criterion ? spec.meta.criterion.minCorrect : "?";
  const page = pagePath ? `, page ${pagePath} clean` : "";
  process.stdout.write(
    `OK ${title}: ${spec.steps.length} steps, ${questions} questions, minCorrect ${minCorrect}, kinds: ${kinds}${page}\n`,
  );
  return 0;
}

process.exit(main());

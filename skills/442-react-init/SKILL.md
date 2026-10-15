---
name: 442-react-init
description: Scaffold a new Vite + React project for INFO 442 and replace the default Vite boilerplate with a branded, mobile-first INFO 442 home page. Use when a student wants to start a React project or app, set up Vite, or begin a new course project from scratch.
---

# Start a 442 React project

Takes a student from an empty folder to a running dev server showing a
branded INFO 442 home page. Work the steps in order; each one ends when
its completion criterion holds.

**Load the brand skill first.** Call the Skill tool with `442-brand`.
It owns the palette, type scale, and component patterns this page uses.
The page is **mobile-first**: design the 360 px column, then widen.

## 1. Ask for the project name

Ask one question: "What should the project be named?" Accept any valid
npm package name (lowercase, no spaces). If the student gives a
human title, derive the directory name from it (for example "Task
Tracker" becomes `task-tracker`) and keep the title for the heading.

Done when you have a directory name and, if they differ, the display
title.

## 2. Create the Vite project

Run, in the folder where the project should live:

```sh
npm create vite@latest <name> -- --template react
cd <name>
npm install
```

Done when `npm install` exits 0 and `node_modules/` exists.

## 3. Strip the Vite boilerplate

The template ships a demo app with its own assets. Remove them:

- Delete `src/App.css`.
- Delete `src/assets/` entirely (the demo images and logos).
- Delete the demo SVGs in `public/`: `vite.svg`, `icons.svg`, and
  `favicon.svg` when present. Vite's template changes between releases,
  so remove whatever demo files are actually there, not a remembered list.
- Keep `src/main.jsx` as is: it must still import `./index.css`.

Done when no demo asset remains under `src/assets/` or `public/`, and
`src/main.jsx` still imports `./index.css`.

## 4. Install the INFO 442 home page

Copy each asset into place, overwriting the template files:

- [`assets/App.jsx`](assets/App.jsx) to `src/App.jsx`
- [`assets/index.css`](assets/index.css) to `src/index.css`
- [`assets/index.html`](assets/index.html) to `index.html`
- [`assets/gitignore`](assets/gitignore) to `.gitignore`

Then set the project name in two places: the `projectName` constant at
the top of `src/App.jsx`, and the `<title>` in `index.html`. Replace the
`PROJECT_NAME` placeholder in both.

The page links to the INFO 442 Canvas course and to the 442-skills repo.
Nothing else needs filling in; only `PROJECT_NAME` changes.

Done when no `PROJECT_NAME` placeholder remains and `src/index.css`,
`src/App.jsx`, `index.html`, and `.gitignore` all hold the skill's
content.

## 5. Run the dev server

```sh
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173/`). Report that
exact URL to the student so they can open the page.

Done when the dev server is running and the student has the URL.

## 6. Commit the starting point

Initialize the repository and make one commit. An AI agent may never be
the sole author: append a `Co-authored-by:` trailer naming the human.
Read their real name and email from `git config user.name` and
`git config user.email` (or `gh api user`); if they are missing, ask the
student before committing. Leave a blank line between the body and the
trailer.

```sh
git init
git add .
git commit -m "Scaffold INFO 442 React project

Co-authored-by: <their name> <their email>"
```

Done when `git log -1` shows the commit with the `Co-authored-by:`
trailer.

## What's next

Build your first component in `src/App.jsx` and reload the page to see it.

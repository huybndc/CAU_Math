# Logic Circuit Review App

This bilingual app runs offline in a browser. Each chapter has Learn, Example, Interactive, and Practice sections. The VI/EN control is in the top-right corner and its choice persists between visits.

| Chapter | Content | Textbook scope |
|---|---|---|
| 1 | Number systems, base conversion, complements, signed numbers, BCD and parity | Sections 1.1–1.11 |
| 2 | Boolean algebra, theorems, complements, minterms, maxterms, 16 functions, and 8 gates | Sections 2.1–2.8 |
| 3 | Gray code, K-maps, and Quine–McCluskey | Chapter 3 |

## Run and test

Run these commands at the repository root. One Vite server serves all three math apps.

```sh
npm install
npm run dev
npm test
```

Open `http://localhost:5180/logic/`.

## Structure

```text
logic/
├── index.html       app shell and chapter includes
├── src/style.css    app styles
├── src/main.js      app setup
├── src/pages/       chapter markup
├── src/logic/       pure math logic
├── src/ui/          DOM and event handling
├── src/content/     lesson text
└── tests/           Vitest tests
```

Logic modules must not import UI modules.

## Edit lessons and UI text

Edit `src/content/theory-chN.vi.md` and its `.en.md` partner. The app reloads the lesson during development. Add UI keys to both `src/i18n/vi/*.js` and `src/i18n/en/*.js`; use `T('key')` or a `data-i18n` attribute. Tests check that both dictionaries use matching keys and parameters.

## Add a chapter

1. Add `src/pages/chN.html` from an existing chapter shell.
2. Add its include and tab in `index.html`.
3. Add paired lesson files and register them in `main.js`.
4. Add logic under `src/logic/`, UI under `src/ui/`, and tests under `tests/`.

## Verify

Run `npm test` and `npm run check` at the repository root. Check content against the textbook and the chapter plan.

# Logic Circuit

This app supports course-based study. Its main sections are Overview, Learn, Practice, and Mock Exam.

## Code rules

- Keep one responsibility in each file. The target is below 400 lines; the hard check is 450 lines. Run `npm run check` at the repository root.
- Keep `src/logic/` pure. It accepts input and returns output. It must not access `document` or `window`.
- Let `src/ui/` access the DOM and call `logic/`. Never import UI code into logic code.
- Do not start a new milestone while `npm test` fails.
- Put tests in `tests/<module>.test.js`. Test each logic module.
- Name chapter logic modules for their topic. Use `chN-quiz.js` for question generation and checking. Name UI modules `chN-<section>-page.js`.
- Return structured question data: `{ kind, text, answer, hint, meta }`. Keep test values in `meta`; do not parse the question text in tests.
- Change Boolean expressions through the syntax tree in `logic/bool-ast.js`. Do not edit expressions as strings.
- Keep learning content in `src/content/*.md` and import it with Vite `?raw`.
- Keep public algorithm variable names such as `A/B/C/D/E` and `imp = {v, d}` unchanged.
- Preserve learner content, source text, and UI strings in their original language. Keep existing language style for those strings.

## Routes and markup

The shared router owns routes such as `#/learn/chN/<theory|example|interactive>`, `#/practice/chN[/kind]`, and `#/exam`. Chapter markup belongs in `src/pages/chN.html`. The router shows one `.pane` at a time.

Use `data-goto="ch3:interactive"` for cross-links. To add a chapter, add its partial, include, and `main.js` entry.

`index.html` is the shell. The include plugin reads chapter partials from `shared/vite-plugin-include.js`.

## Vietnamese and English UI

- Use `T(key, params)` from `src/i18n/index.js`. Import it as `T`; do not use `t` or `tr`.
- Use `data-i18n`, `data-i18n-html`, `data-i18n-ph`, and `data-i18n-title` for static text.
- Keep both dictionaries in `src/i18n/{vi,en}/` aligned. `tests/i18n.test.js` checks keys and parameters.
- Keep language handling out of `logic/`. Return `AppError(key, params)` or structured keys. Translate in `ui/` with `T()` or `tError()`.
- Each page must redraw after `onLangChange(...)`.

## Boolean variable names

Follow Mano's *Digital Design*: use `x,y` for two variables; `x,y,z` for three; `w,x,y,z` for four; and `v,w,x,y,z` for five. The parser accepts upper- and lower-case letters.

## Lesson content

Each chapter has `theory-chN.vi.md` and `theory-chN.en.md`. Keep the same number of level-two headings in both files. Edit Markdown content without changing code when only lesson text changes.

`<div data-check="c1q:convert:toDec"></div>` adds a knowledge check. The app shows a worked example, then asks the learner to answer two questions in a row. `:label` filters by `q.review`. `data-also` links review content from an incorrect answer.

## Shared code and local run

Run `npm run dev` at the repository root. The app opens at `http://localhost:5180/logic/`. The apps use the shared router, screen, DOM, error, i18n, and include modules through `@shared`.

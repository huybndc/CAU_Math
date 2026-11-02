# Linear Algebra

This app follows Strang and MIT 18.06. It uses the shared course-app framework and adds a geometry layer.

## Code rules

- Keep one responsibility in each file. The target is below 400 lines; the hard check is 450 lines. Run `npm run check` at the repository root.
- Keep `src/logic/` pure. It handles vectors, matrices, and elimination. It must not access the DOM or pixels.
- Keep `src/geometry/` pure. It maps math coordinates to pixels, clips lines, and computes animation values. It may call `logic/` but must not access the DOM.
- Keep `src/ui/` responsible for the DOM and canvas. It joins `logic/` and `geometry/`.
- Never import UI code into `logic/` or `geometry/`.
- Do not start a new milestone while `npm test` fails.
- Put tests in `tests/<module>.test.js`. Test each logic or geometry module.
- Name question modules `chN-quiz.js` and page modules `chN-<section>-page.js`.
- Return structured question data: `{ kind, textKey, textParams, answer, hintKey, hintParams, meta }`. Keep test values in `meta`.
- Grade numeric answers by value with an allowed tolerance. Do not compare answer strings.
- Format displayed values through `logic/num-format.js` (`fmt`). Show simple fractions as fractions.
- Keep learning text in `src/content/*.md` and import it with Vite `?raw`.
- Preserve learner content, source text, and UI strings in their original language. Keep existing language style for those strings.

## Geometry

Use arrays for vectors and row arrays for matrices. World coordinates use an upward y-axis. Canvas pixels use a downward y-axis. `createView()` must preserve equal scale on both axes.

Use Canvas 2D for current chapters, including 3D. Record a new renderer decision in `PLAN.md` before a chapter needs it. `geometry/space3d.js` owns the camera and projection. `geometry/polygon3d.js` clips and sorts polygons. `ui/canvas3d.js` draws the result. Clip intersecting faces before painter-order sorting.

## Vietnamese and English UI

- Use `T(key, params)` from `src/i18n/index.js`. Import it as `T`.
- Use `data-i18n` attributes for static text.
- Keep both dictionaries in `src/i18n/{vi,en}/` aligned. `tests/i18n.test.js` checks keys and parameters.
- Keep language handling out of `logic/` and `geometry/`. Return structured error and text keys. Translate in `ui/`.

## Routes, lessons, and local run

The shared router owns routes such as `#/learn/chN/<theory|example|interactive>`, `#/practice/chN[/kind]`, and `#/exam`. Keep chapter markup in `src/pages/chN.html`.

Each chapter has `theory-chN.vi.md` and `theory-chN.en.md` with matching level-two headings. Edit Markdown when only lesson text changes.

Run `npm run dev` at the repository root. The app opens at `http://localhost:5180/linalg/`. Use shared modules through `@shared`.

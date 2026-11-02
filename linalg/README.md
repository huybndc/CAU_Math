# Linear Algebra Review App

This bilingual app runs offline in a browser. Each chapter has Learn, Example, Interactive, and Practice sections. The VI/EN control is in the top-right corner and persists between visits.

The course follows Strang's *Linear Algebra and Its Applications* and MIT 18.06.

| Chapter | Content | Textbook scope |
|---|---|---|
| 1 | Vectors, operations, length, dot product, angles, linear combinations, and span | Chapter 1 |
| 2 | Linear systems, `Ax = b`, Gaussian elimination, echelon form, rank, and solution types | Chapter 2 |
| 3 | Subspaces, column space, null space, independence, basis, and dimension | Chapter 3 |

## Run and test

Run these commands at the repository root. One Vite server serves all three math apps.

```sh
npm install
npm run dev
npm test
```

Open `http://localhost:5180/linalg/`.

## Structure

```text
linalg/
├── index.html       app shell and chapter includes
├── src/style.css    app styles
├── src/main.js      app setup
├── src/pages/       chapter markup
├── src/logic/       pure math logic
├── src/geometry/    coordinate maps, clipping, and projection
├── src/ui/          DOM and canvas code
├── src/i18n/        Vietnamese and English dictionaries
├── src/content/     paired lesson text
└── tests/           Vitest tests
```

`logic/` and `geometry/` must not import from `ui/`.

## Edit lessons and UI text

Edit `src/content/theory-chN.vi.md` and its `.en.md` partner. Keep their level-two headings aligned. Add UI keys to both dictionaries in `src/i18n/{vi,en}/`. Tests check matching keys and parameters.

## Progress

Milestones 0–3 are complete. Milestone 4 covers orthogonality. See `PLAN.md` for the full course plan.

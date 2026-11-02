# Progress Archive

Read this file only when an older implementation decision needs context. Current work is in `../PROGRESS.md`.

## Completed work through 2026-10-31

- Built the shared Vite and JavaScript framework for Logic Circuit, Linear Algebra, and Discrete Math. Added bilingual UI, lessons, practice, mock exams, tools, and independent solution-oracle tests.
- Added generated and checked Discrete Math practice for truth tables, nested quantifier negation, and weighted geometric sums. The full test suite had 1,111 passing tests at that point.
- Improved Linear Algebra input fields, numeric tolerance, angle units, collapsible exams, matrix diagrams, scratchpad grids, solver output, and term links.
- Added shared solvers for vectors, linear combinations, linear systems, matrices, and vector spaces. Added step-by-step results, independent grading, answer masking, hints, copyable solutions, and fraction rendering.
- Added Logic Circuit tools for base conversion, complements, signed numbers, Boolean expressions, and K-maps. Added Discrete Math tools for truth tables, Euclid, Pulverizer, congruence, modular powers, and RSA.
- Added random solver inputs, persisted answer fields, per-question progress, and independent oracle tests for all current computational types.
- Added a semester calendar, activity-based chapter progress, and math progress export. The later repository split removed the Hub integration; see `DECISIONS.md` and `REPO_BOUNDARY.md`.
- Added a scratchpad with tabs, drawing, resizing, and a floating-window design that does not move the page.
- Added mock-exam drafts for all three subjects. The drafts were estimates from the learner's course descriptions, not official exams.
- Removed type-based Practice, Mock Exam, Mistakes, and target score in the 2026-10-15 cleanup. The app kept lesson checks, flags, progress, solvers, printed mock exams, and Free Response.
- Removed the shared Overview route on 2026-10-15. `/` now redirects to `/logic/`; Study_Hub owns cross-course views.
- Deployed CAU_Math as a separate static `cau-math` Worker without login in PRs #113–#115. Study_Hub links to it and no longer mirrors math source.
- Removed the old Hub event bridge on 2026-10-26. The apps no longer send `math.answer` or `pet.set`; `@host` remains for local storage and development folder sync.
- Added a C Programming app and generated mock questions with real `clang` output. Added a multi-part question format, a self-marking sheet, and AddressSanitizer coverage for out-of-bounds questions.
- Added one-source subject configuration in `shared/subjects.json`, generated theme tokens and app links, and copied eligible practice subjects from Study_Hub.
- The 2026-10-22 exam record estimated Logic at four questions, 200 points, and 60 minutes; Discrete Math at three questions with seven parts, 200 points, and 60 minutes; Linear Algebra at nine questions, 162 points, and 97 minutes. The learner planned to complete printed exams on paper and request rubric-based grading.

## Older implementation details

The original detailed progress notes were reviewed on 2026-11-03. Completed actions and superseded plans were removed from the active progress file. Current design rules remain in `DECISIONS.md`, `logic/AGENTS.md`, `linalg/AGENTS.md`, and `discrete/AGENTS.md`. Use Git history for exact file-level changes that do not affect current behavior.

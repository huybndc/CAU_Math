# Feature Map for Agents

Update this file in the same PR when a UI changes. One Vite server serves `/logic/`, `/linalg/`, and `/discrete/`. Run `npm run dev` at the repository root. Run `npm test` for all app tests.

There are no `data-testid` hooks yet. Use the existing hooks: `data-nav`, `data-screen`, `data-subject`, `data-lang`, `data-i18n`, `aria-label`, and element IDs. Question inputs are created by JavaScript and have no ID; use their class.

`/` redirects to `/logic/`. Study_Hub owns cross-course views. See D62.

## Shared app framework

Shared UI and logic live in `shared/ui/` and `shared/logic/`.

- The subject switch reads `shared/subjects.json`. The build uses that file too. A course with `app: false` is hidden: it has no route, no build output, and no test run. Its folder and learning data stay. `/` goes to the first active course. See "Change the term" in `AGENTS.md`.
- Navigation shows Overview and Mock Exam only (D69). `HIDDEN_VIEWS` in `shared/logic/route.js` hides Learn, Tools, and Free Response. Their routes go to Mock Exam. Quick search is off while Learn is hidden. The content stays. Empty the list to show the screens again.
- The language switch uses `data-lang=vi|en`. The theme control follows system light or dark mode.
- The app rail can collapse to 56 pixels. The app name is Exlab. Course icons use each course color.
- The app rail links to Study_Hub and Live_Lecture when their build URLs exist in `.env.local`.
- Screens use `section.screen[data-screen]`. The Overview shows course status, a 16-week timeline, Today, Learn, and Mock Exam. During a term break, it shows the next-term date.
- Routes use the hash router in `shared/logic/route.js`.
- Mock exams use a seed. The screen can show the exam or answer and can print an A4 copy. KaTeX renders formulas. Printed answers show worked steps. Logic Circuit answers can include a circuit diagram and one all-or-nothing marking row per part. The Logic Circuit exam is a final-exam review exam (D75): 4 questions, 200 points, 60 minutes, with K-map design, circuit design, a flip-flop question, and the analysis of a clocked sequential circuit (`logic/src/logic/mock-seq.js`). The Linear Algebra exam is a final-exam review exam (D75): 5 questions, 200 points, 120 minutes, on independence and basis, the four subspaces, projections, and least squares (`linalg/src/logic/mock-final.js`). Review outlines are in `docs/review/`.
- Mock exams have no app timer or automatic grading. The learner times and grades the printed exam.
- Type-based Practice, Mock Exam, and Mistakes screens were removed on 2026-10-22. Old practice and exam URLs return to Overview.
- Current visible features are Overview, Mock Exam, scratchpad, and screen help. Lessons, examples, interactive tools, concept questions, free response, flags, and glossary are hidden.
- Long lessons use a paper-like background: `#faf9f6` in light mode and `#1f2227` in dark mode.
- `Ctrl/Cmd+K` or `/` opens quick search. `?` opens screen help. `Esc` closes a dialog. Number keys select multiple-choice answers. Left and right arrows change lesson cards.
- Shared hooks include `.runner`, `.run-widget`, `.flag-fold`, `.tab[data-tab]`, `data-check`, `data-tool`, and `data-goto`.

Key shared modules include `shared/ui/{shell,screens,learn-screen,runner,solver,lesson,palette,scratch*}.js` and `shared/logic/{free,question-pool,calc*}.js`.

## Course apps

### C programming

`/prog/` contains the week 7 lesson and a mock exam with 20 questions, 38 parts, and 100 points (D73). Each question has 1–3 parts. The exam has multiple choice, fill in the blanks, predict the output, find and fix the error, and write a function. Difficulty rises toward the end with a small random shift. Harder templates mix two or more ideas (`c-templates-hard*.js`). A guard test stops one exam from repeating a code skeleton. Of 3 multiple-choice questions, 2 ask theory (`c-templates-theory.js`, D74). A clang probe backs each option: it must fail to compile, compile, or crash under AddressSanitizer. `npm run gen:c` uses real `clang` output for answer keys. To add a week, add templates to a `prog/src/logic/c-templates-*.js` file, set the week and `level`, run the generator, and test the generated bank. `plan()` then raises the share of weeks 9–15 toward 80% with no other change. The batches for weeks 11–15 wait for class material.

Multi-part questions support multiple-choice, fill-in, compile, and write tasks. The exam does not use compile tasks. A `logic: true` template compiles and runs but prints a wrong output; the generator stores both outputs. Programs that use files run in a temporary folder. The generator checks compile output, including AddressSanitizer for `find-oob`. Course color and scratch tabs come from `shared/subjects.json`; `npm run gen:subjects` creates the theme files and links. `npm run sync:subjects` imports practice subjects from Study_Hub. Calculus remains inactive until it has content.

### Course map

| App | Course scope | Main code |
|---|---|---|
| `/logic/` | Mano: number systems, Boolean algebra, Gray code, and K-maps | `logic/src/ui/`, `logic/src/logic/` |
| `/linalg/` | Strang: vectors, `Ax = b`, and vector spaces | `linalg/src/ui/`, `linalg/src/logic/` |
| `/discrete/` | MIT 6.042J: logic, number theory, and graphs | `discrete/src/ui/`, `discrete/src/logic/` |

Course content lives in `<app>/src/content/`: `theory-chN.vi.md`, `theory-chN.en.md`, `free/chN.json`, and `concepts.json`. Chapter names live in `i18n/vi/common.js` under `nav.chN`.

## Storage and integration

Each app stores progress in localStorage with a subject prefix. Shared settings use `study-theme` and `study-nav`. The apps do not send data to Study_Hub. `shared/host.js` keeps local storage keys and the development folder-sync namespace.

## Missing test hooks

Overview cards and buttons use classes and `data-subject`. Question controls have no ID. Add `data-testid` when changing one of these screens.

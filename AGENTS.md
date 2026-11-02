# CAU_Math_App repository rules

## Context

- Reply to learners in Vietnamese.
- The learner gives the agent authority to decide, edit, commit, and merge. Record reasons in `DECISIONS.md`. Do not ask for approval again. Prepare a rollback path for hard-to-reverse work and report it.
- Three practice apps run at `localhost:5180`. The online app runs on the `cau-math` Worker. After each code merge to `main`, run `npm run deploy`, then `verify-deploy.sh CAU_Math` and confirm “ĐÃ LÊN”. The app has no sign-in or cross-device sync. Study_Hub links to this app; it removed the mirror on 2026-10-26. Each course follows its syllabus in `PLAN.md`.
- Source docs: `PLAN.md` (course plans), `DECISIONS.md` (decisions and reasons), and `PROGRESS.md` (handoff state).
- Use `toeic-app` only as a UX reference. Do not import from it or commit to it.

## Public repo privacy

- Do not add real names, email addresses, school or class names, machine paths, computer names, or private service links to code, docs, commits, or PRs. Use “the learner” for the repo owner. Use `user@example.com` in tests.
- Use Git author `huybndc` and a GitHub no-reply email. Check `git config user.email` before each commit.

## Session workflow

At the start, read `PROGRESS.md`, then run `git status` and `git log --oneline -5`. Summarize the current state and task in three to five lines.

After each subtask:

1. Pass `npm test` and `npm run check`. The size baseline is `scripts/size-baseline.json`.
2. Stop extra dev servers.
3. Update `PROGRESS.md` with work done, next work, and blockers.
4. Confirm `git remote -v` is `https://github.com/huybndc/CAU_Math_App.git`.
5. Commit and push the work branch. Merge into `main` only through a PR.

Commit each tested subtask to prevent data loss. At about 95% context use, commit and push a WIP checkpoint. Add one line to `PROGRESS.md` that states where the work stopped. Do not start a new milestone while tests fail.

## Architecture (D01, D02)

- One Vite server at the repo root: `npm run dev` → `localhost:5180`. Routes are `/logic/`, `/linalg/`, and `/discrete/`. `/` redirects to `/logic/`.
- `shared/` holds code used by at least two apps. Import it through `@shared/...`.
- Each app has `index.html` (shell), `src/{logic,ui,pages,content,i18n}`, and `tests/`.
- Functions in `src/logic/` are pure. They do not access `document` or `window`. Code in `logic/` does not import from `ui/`.
- All three apps share one origin. Prefix localStorage keys by app or include a `subject` field.

## Code rules

- Give each file one purpose. Aim for about 400 code lines. Do not create files over 450 code lines. Do not split files only to meet this limit.
- Make a function reusable only when more than one caller needs it. Keep single-use logic at its call site. Combine duplicate logic.
- Before adding a file, check for an existing helper or module that can hold the code.
- For UI changes, update `FEATURES.md` in the same PR when you add a file under `src/ui/` or `shared/ui/`, or change `data-testid`. `shared/tests/features-sync.test.js` checks this. When you remove a feature, add its text to `REMOVED` in that test.
- Use English for code and variable names.
- Use commit format `type: short description`, with types such as `feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `content`, and `style`.

## Learning content (D05)

- Follow each course syllabus and textbook. Paraphrase source text and record the source. Do not commit slides, PDFs, or syllabi.
- For concept questions, prefer external exams or solved exercises, such as MIT OCW or textbook-author solutions. Verify answers with the app's `check` command. Correct a source only when it is wrong. Use AI-derived questions only to fill gaps (D48).
- The Vietnamese and English dictionaries must have matching keys and parameters. Tests check them.
- Keep screen text short. Use one idea per card. Put long text under “Xem thêm”.
- Make solutions verifiable. Draw truth tables for question types that require them (`tableLine`); do not print only bit strings. Check computed answers and every solution line with an independent test oracle (`tests/solution-oracle*.test.js`) that reads the same text or image the learner sees (D41). All three apps cover every computed question type (D44–D46). Add an independent check and a mutation test for each new type.

## Repo boundary and workflow

- Read `REPO_BOUNDARY.md` before making changes. CAU_Math_App owns math syllabi, content, questions, solvers, oracles, and math UI. Study_Hub owns Hub, accounts, the vault, and cross-course summaries.
- Do not add Hub logic here. Do not import source code across repos.
- Treat `docs/*-ARCHIVE.md` as history. Follow `REPO_BOUNDARY.md` if an archive conflicts with it.
- Event integration with Study_Hub ended on 2026-10-26. Hub links to the separate app. Get a new contract from Study_Hub before restoring integration.

## Add a course (measured 2026-10-30)

1. Copy Hub tokens, semester dates, and practice course data with `npm run sync:hub`. The `hub-sync` test fails when they differ. Add a new practice course with `npm run sync:subjects`. New courses use `app: false` until their folder exists. Remove `app: false` and add colors and a draft section when the folder exists.
2. Add one row to `shared/subjects.json` with the ID, Vietnamese and English names, light/dark `accent`, and draft `tabs`. Run `npm run gen:subjects` to update `tokens.css` and the root `index.html` links.
3. Create `<id>/` from an existing course. Include `index.html` with `data-subject`, `src/{i18n,logic,content}`, and `tests/`. Vite, the course selector, design checks, and Playwright read the course list automatically.
4. Add course code only when it needs a separate solver, such as `scripts/gen-c-bank.mjs` for C. Update `FEATURES.md`.

## Practice exams (D53)

Use TOPIK-style exams. Use fixed question counts per Part, ordered from easy to hard, or mix questions without chapter names. Use 80% free-response and 20% multiple-choice questions for every course. A new course needs a `choiceBank` and all free-response types.

## Layout and help

Fit each screen in about 1280×720. Do not scroll the page. Scroll long lists inside their cards. Do not remove required information to avoid scrolling. Use layout, collapse controls, or card scrolling.

Put help in a `?` button on the screen that needs it (`shared/ui/screen-help.js`). Do not add a separate help page or link. When you add a feature, add one Vietnamese and one English row to that screen's `HELP` data.

## Agent document language

Write all agent-authored operational or technical documents in English that follows ASD-STE100. This rule applies to every document type, including instructions, handoffs, plans, progress logs, decisions, product and feature documents, READMEs, archives, PR text, and code comments.

Use short active sentences, common words, and one main idea per sentence. Use enough words for complete and precise meaning. Do not set a fixed word or line limit.

Keep user-authored learning content, source text, interface strings, proper names, and direct quotations in their original language. Do not translate code, paths, identifiers, or commands. Review all changed text before commit.

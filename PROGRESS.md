# Progress

Read this file at the start of work. Keep open work and active rules here. Completed work through 2026-10-31 is in [`docs/PROGRESS-ARCHIVE.md`](docs/PROGRESS-ARCHIVE.md). See [`REPO_BOUNDARY.md`](REPO_BOUNDARY.md) for repository ownership.

## Current known state

- Checked on 2026-11-03: `main` has four courses at `/logic/`, `/linalg/`, `/discrete/`, and `/prog/`. Each course has printed mock exams.
- The learner dropped the interactive exercise project on 2026-11-03. See D65. Do not restart it without a new learner proposal.
- The repository code is the source of truth for details.

## Open work

- Wait for the learner to select the next task.
- Possible math work: add scoring rubrics and question types for Discrete Math and Linear Algebra.
- Possible Discrete Math work: add variety for definitions, lemmas, and induction.
- Around 2026-11-20, review whether to add practice around Free Response and Mock Exam. Do not restore the removed practice screens without a new decision.
- Add C Programming exam batches only after the course schedule and learner source material support them. Follow the existing batch rules in the archived progress and current `AGENTS.md`.

## Active rules

- Keep math, questions, solvers, and oracles in this repository. Keep Hub accounts, vault, and cross-course statistics in Study_Hub. Do not import source across repositories.
- Study_Hub links to the math app. Do not restore the removed math mirror or `math.lock` without a new decision.
- Refresh approved Hub snapshots only with the documented sync command. Do not edit copied files by hand. See `AGENTS.md` and `REPO_BOUNDARY.md`.
- If a change affects Hub E2E routes or selectors, add a Study_Hub handoff before merge.
- Run `npm run gate` before merge. Before deploy, run `npm run gate -- --all`. Verify the deployed Worker before reporting completion.
- Deploy with `npm run deploy` from `main` after a code merge.
- Do not commit class slides, PDFs, private syllabi, secrets, or personal data.

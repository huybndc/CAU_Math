# Progress

Read this file at the start of work. Keep open work and active rules here. Completed work through 2026-10-31 is in [`docs/PROGRESS-ARCHIVE.md`](docs/PROGRESS-ARCHIVE.md). See [`REPO_BOUNDARY.md`](REPO_BOUNDARY.md) for repository ownership.

## Current known state

- Checked on 2026-11-03: `main` has four courses at `/logic/`, `/linalg/`, `/discrete/`, and `/prog/`. Each course has printed mock exams.
- The learner dropped the interactive exercise project on 2026-11-03. See D65. Do not restart it without a new learner proposal.
- Finished courses can be hidden with `app: false`. See D67 and "Change the term" in `AGENTS.md`.
- The repository code is the source of truth for details.

## Open work

- Wait for the learner to select the next task.
- Around 2026-11-20, review whether to add practice around Free Response and Mock Exam. Do not restore the removed practice screens without a new decision.
- C Programming (D73, D74, 2026-11-10): the exam has 20 questions, 38 parts, difficulty levels, and 21 harder templates. Multiple choice has 2 theory questions and 1 output question. A similarity guard test checks each exam. Next: the learner marks the sample exam and the theory multiple-choice sample on the Desktop ("giống đề thật" or "dễ/lặp"); turn each mark into a generator rule with a test. Then Logic Circuit, Linear Algebra, and Discrete Math. Weeks 11–15 wait for class material.
- Final review (D75, D76): Logic Circuit, Linear Algebra, and Discrete Math have review outlines and generated final exams. The 2026-11-24 update adds Strang 6.1–6.2 eigenvalues and eigenvectors, Discrete Math counting rules with more named rules and induction proofs, and Mano Chapters 6–7 register and memory templates. Every new computed type has an independent oracle and mutation check. Discrete Math has a scoring rubric for every part. The exam totals and time limits do not change.

## Active rules

- Keep math, questions, solvers, and oracles in this repository. Keep Hub accounts, vault, and cross-course statistics in Study_Hub. Do not import source across repositories.
- Study_Hub links to the math app. Do not restore the removed math mirror or `math.lock` without a new decision.
- Refresh approved Hub snapshots only with the documented sync command. Do not edit copied files by hand. See `AGENTS.md` and `REPO_BOUNDARY.md`.
- If a change affects Hub E2E routes or selectors, add a Study_Hub handoff before merge.
- Run `npm run gate` before merge. Before deploy, run `npm run gate -- --all`. Verify the deployed Worker before reporting completion.
- Deploy with `npm run deploy` from `main` after a code merge.
- Do not commit class slides, PDFs, private syllabi, secrets, or personal data.

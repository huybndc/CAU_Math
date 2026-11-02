# Decision Archive

This file summarizes decisions D01–D64. Active decisions are in `../DECISIONS.md`. Git history keeps the original decision text and full evidence. Use the IDs to find each record.

## D01–D16: app structure and learning flow

- Run three independent course apps from one Vite server. Keep shared code in `shared/`.
- Run through localhost. Do not use a single-file build or `file://` storage.
- Follow each course syllabus. Rewrite learning content and record sources. Do not commit private class materials.
- Use a workbench-style interface, screen-level help, and routes by chapter and section.
- Prioritize course content. Use lessons, examples, interactive tools, and question practice.
- Show lessons as cards. Use interactive controls when an answer has a natural visual form.
- Use a text scratchpad. Keep navigation task-based and make long answers actionable.

## D17–D31: practice and app design

- Keep an append-only practice log and derive totals from its events.
- Set a standard time for each question type. Use seeded mock exams for longer practice.
- Explain errors and solutions step by step. Balance free-response and multiple-choice questions.
- Build reusable question runners and knowledge-point checks. Keep each question bank testable.
- Keep the desktop technical-document design. Avoid copying another app's structure.
- Use trees for course structure and graphs for prerequisites. Measure duplication before refactoring.

## D32–D49: course coverage and answer quality

- Prioritize computable Discrete Math topics before the midterm. Add graph theory when it appears in class.
- Add tools for discrete math and K-maps. Keep examples close to their diagrams and steps.
- Use question sources and independent oracles. Do not copy course handouts.
- Accept natural math input such as `sqrt(x)`. Use independent checks for every computational type.
- Use learner activity and shared semester data for progress. Do not infer the current chapter from a static syllabus alone.

## D51–D64: solver, mock exam, and integration decisions

- Reduce scrolling in Linear Algebra. Use math-shaped input and a scratchpad with tabs, drawing, and resizing.
- Use shared solvers with step-by-step explanations, independent grading, hints, and copyable output.
- Use TOPIK-style mock exams with an 80/20 free-response and multiple-choice mix. Print exams and answers when useful.
- Use KaTeX for mock-exam formulas. Make mock answers verifiable and show the solution steps.
- Keep Study_Hub and CAU_Math separate. The standalone math app owns math questions, content, and tools. Study_Hub owns cross-course views.
- Keep design snapshots as copied data. Do not edit them by hand. Test that they match the source.
- Do not enable billing for project services. Stop if a paid service becomes active.
- Keep screen help local to each screen. Do not create a separate help page.

## Superseded decisions

- D01's shared Overview was removed by D62. `/` redirects to `/logic/`.
- The math mirror and `math.lock` were removed when the app became standalone. Study_Hub links to the `cau-math` Worker.
- The old Hub event bridge was removed on 2026-10-26. Do not restore it without a new cross-repository contract.
- Older practice screens and exam event integration were removed. See `../PROGRESS.md` and `../REPO_BOUNDARY.md` before reusing an archived design.

## Source note

This English archive keeps the decisions that still guide the code and identifies superseded choices. Git history keeps the original D01–D64 text, detailed measurements, and review notes. Do not restore a superseded choice without a new entry in `../DECISIONS.md`.

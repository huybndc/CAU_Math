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

**D65. Cancel the interactive exercise project (2026-11-02; closed 2026-11-03).** The learner rejected two attempts. The first attempt was the vector prototype in [PR #148](https://github.com/huybndc/CAU_Math_App/pull/148). The second attempt was a local 5×5 row-operation mockup. The learner said that these attempts did not give the smooth exploration that the learner wanted. A larger matrix or more operations do not solve this gap. On 2026-11-03 the learner confirmed that the whole interactive direction is dropped. This includes the later phases: Logic bit toggles, Discrete Math graph actions, C code tracing, and prerequisite links. The prototype is not in `main` or in a deployed build. PR #148 keeps its code. Do not restart this work unless the learner proposes a new direction. If the learner does, use these criteria: Ax=b up to 5 rows and 5 unknowns, with cases that have many free variables or no solution.

## Source note

This English archive keeps the decisions that still guide the code and identifies superseded choices. Git history keeps the original D01–D64 text, detailed measurements, and review notes. Do not restore a superseded choice without a new entry in `../DECISIONS.md`.

**D66. Complete the C mock exam for weeks 2–9 (2026-11-03).**

- The learner told the agent to complete the C course now, before week 12.
- Each question has 5 points and 2 parts (2 + 3 or 3 + 2). Thus 20 questions always give 100 points and 40 parts, for all template selections.
- The exam header states the all-or-nothing marking one time. The parts do not repeat it.
- `BLUEPRINT` sets the question groups: 3 multiple-choice, 5 fill-in, 4 predict, 4 fix, 4 write.
- The share of weeks 9–15 uses `SCOPE.postMidShare` (80%). The exam uses earlier weeks when a group has too few new templates. Today 11 of 20 questions are from week 9. The share rises when new templates arrive.
- The foundation templates target the learner's weak areas: pointer arrays vs 2D char arrays, structs with char arrays, `scanf` with strings, and string comparison.
- The source line shows the course week. The old line printed the week number as a book chapter, which was wrong.
- Reason for no batches for weeks 10–15: the class slides do not exist yet, and the teacher has not taught these topics.

**D67. Hide finished courses with `app: false` (2026-11-03).**

- `app: false` already removed a course from the build, the test list, the course switch, Playwright, and design checks. Thus the repo needs no new flag.
- A hidden course keeps its folder. Learning data stays in the browser.
- The root page now goes to the first active course. The old page always went to `/logic/`.
- The learner rejected the Hub focus control as useless. Hub already changes courses at the term start. Do not propose this control again without a new reason from the learner.

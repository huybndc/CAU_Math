# Decisions

This file lists active decisions. Find reasons and trade-offs in [`docs/DECISIONS-ARCHIVE.md`](docs/DECISIONS-ARCHIVE.md) by decision ID. Add each new decision here and add its full record to the archive. Change a decision by adding a replacement record. Do not delete the old record.

Subject-specific decisions are in `logic/PLAN.md` and `linalg/PLAN.md`.

- D01–D10. App structure, localhost, syllabus sources, workbench design, help popover, and routes. See the archive section "D01–D16".
- D11–D29. Course content, shared practice, lesson cards, task navigation, seeded exams, worked solutions, tools, and course structure. See the archive and git history.
- D30–D46. Practice grouping, Discrete Math build order, progress export, duplicate prevention, and independent solution oracles. See the archive and git history.
- D47–D61. Repository independence, source rules, compact practice UI, mock-exam mix, scratchpad behavior, and log migration. See the archive and git history.
- D-no-billing. Do not enable billing for project services (2026-10-03).
- D-help. Put help on each screen. Do not create a separate help page (2026-10-03).
- D62. Remove the shared overview at `/`. Study_Hub owns cross-course views (2026-10-15).
- D63. Add realistic printed mock exams (2026-10-21).
- D64. Render mock-exam formulas with KaTeX and show step-by-step answers (2026-10-22).
- D65. Cancel the interactive exercise project, which includes Ax=b row operations (2026-11-02; closed 2026-11-03). See `docs/DECISIONS-ARCHIVE.md`.
- D66. Complete the C mock exam for weeks 2–9: 20 questions of 5 points in 2 parts each, with a fixed mix of question groups (2026-11-03). See `docs/DECISIONS-ARCHIVE.md`.
- D67. Hide finished courses with `app: false`. Do not add a focus control to Hub (2026-11-03). See `docs/DECISIONS-ARCHIVE.md`.
- D68. Make the C mock exam match the real midterm (2026-11-10). Its removal of multiple choice was wrong; D73 replaces its layout. Week 10 templates come from the learner's lesson note, because class slides are not in the repo.
- D69. Hide Learn, Tools, and Free Response in every course (2026-11-10). The learner uses only Overview and Mock Exam. Concept questions are hidden with Learn. Keep the content and use `HIDDEN_VIEWS` to show it again. The learner chose to keep Overview for the term countdown.
- D70, D72. A fixed length mix for C find-the-error questions was added and removed on 2026-11-10. The real exam mixes lengths freely.
- D71. C find-the-error questions have no obvious syntax errors, and each exam has at least 1 run-time error (2026-11-10). Templates with `obvious: true` leave the exam.
- D73. Rework the C mock exam (learner, 2026-11-10). The real midterm has 20 questions with 1–3 parts each, about 35–40 parts in all, and some multiple choice. Real questions mix ideas and do not repeat one skeleton. `BLUEPRINT` sets 20 slots (parts, level), 38 parts, 100 points. Order follows level with a small random shift. A test fails when two questions in one exam share more than half of their code lines.
- D74. Make C multiple choice theory-heavy (learner, 2026-11-10). The real exam asks theory, such as the difference between pointer operators. Of 3 multiple-choice questions, 2 are theory and 1 is output. Theory types: pointer operators, pass by value or pointer, reading declarations, pick the false statement, and classify snippets. A clang probe backs each option. Other question types do not change.
- D75. Change the Logic Circuit, Linear Algebra, and Discrete Math mock exams to final-exam review exams (learner, 2026-11-10). Each course has an outline in `docs/review/<course>.md` with topics, book sections, question types, and a schedule from week 12. The exam replaces the midterm exam on screen; the old template stays in git history. Logic Circuit: 4 questions, 200 points, 60 minutes, one all-or-nothing marking row per part; scope Mano 5.3–5.8 only, because the final does not repeat midterm question types (learner, 2026-11-22). Linear Algebra: 5 questions, 200 points, 120 minutes; scope Strang 3.5–4.4 and 5.1–5.3 (2026-11-21). Discrete Math: 4 questions, 200 points, 60 minutes; scope post-midterm topics with integral bounds and asymptotic notation (2026-11-21). Slots draw one of two or three question types per code. Update 2026-11-22: the Beneš induction proof is favored (weight 0.4, about 40% of exams), else one of four other proofs (the teacher stressed Beneš); a Big O proof never uses induction (the learner remembers the teacher said it scores 0, no recording); recursion (Towers of Hanoi, class of 2026-11-20) adds three definitions and one short answer, within the taught scope only.
- D76. Extend the final-review banks to the new class scope (learner, 2026-11-24). Linear Algebra adds Strang 6.1–6.2 eigenvalues and eigenvectors. Discrete Math adds counting rules, named lemmas, more induction proofs, and scoring rubrics. Logic Circuit adds Mano Chapters 6–7 register and memory templates. Keep the existing exam totals and independent oracle tests.

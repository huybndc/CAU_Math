# PROGRESS.md — CAU Math App

> Đọc file này trước khi bắt đầu phiên mới. Ranh giới repo: REPO_BOUNDARY.md.

## Repo boundary

- CAU_Math_App is the source of truth for Logic Circuit, Linear Algebra, and Discrete Math.
- Study_Hub is the generic platform. Do not put Hub logic here.
- Never fix math by editing the temporary math mirror in Study_Hub.
- Cross-repo integration uses contracts/events; current event is math.answer.

## Done

- Shared Vite/JS framework for three math apps.
- Logic Circuit Ch1–4, LinAlg Ch1–3 workstreams, Discrete D1–D8 workstreams, lessons, practice, exams, tools, bilingual UI, and independent solution-oracle tests.
- D49: Added generated, checked Discrete practice for truth tables, nested quantifier negation, and weighted geometric sums. Added bilingual proof-method guidance; no handout content or fixed exam composition was added. Full suite (1111 tests), check, and build passed.
- Current math content gaps are tracked in per-app PLAN/PROGRESS files.

## In progress

- [ ] Repo split bridge: move the math.answer writer/integration adapter from Study_Hub into CAU_Math_App.
- [ ] Define a stable course/export contract for Study_Hub so it does not need duplicated math source.
- [ ] After the bridge is validated, remove/stop shipping the math mirror from Study_Hub.

## Current next work

1. Finish math progress/event bridge.
2. Validate midterm scope and concrete UX/content gaps for the three courses.
3. Keep each computational question type tied to an independent oracle test.
4. Update this file after each meaningful milestone.

## Guardrails

- Math-specific code/content → this repo.
- Hub/account/vault/Today/stats → Study_Hub.
- No direct source imports or copy cycles between repos.
- Do not commit class-only PDFs, slides, private syllabus files, secrets, or personal data.

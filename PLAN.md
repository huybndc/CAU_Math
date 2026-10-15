# PLAN.md — CAU Math App

## Scope

CAU_Math_App is the source repo for the three current-semester math apps.

## Architecture

    CAU_Math_App
    ├── Logic Circuit
    ├── Linear Algebra
    ├── Discrete Math
    └── shared math-app framework

    CAU_Math_App -- math.answer / course data --> Study_Hub

Study_Hub is not a dependency for standalone local math development.

## Current priority

- [x] P0 Repo split: `math.answer`/`pet.set` đi qua adapter `shared/host.js` (Study_Hub cấp bản thật); tiến độ xuất bằng `shared/logic/progress-export.js`.
- [x] P0 Integration handoff: Study_Hub tiêu thụ repo này bằng mirror một chiều ghim commit (`math.lock`), CI Hub chặn sửa tay mirror.
- [ ] P1 Midterm: validate the current syllabus scope and user experience for all three courses.
- [ ] P1 Content: continue concrete gaps only; preserve independent solution-oracle tests.
- [ ] P2 Post-midterm: expand later chapters only as the course reaches them.

## Current course scope

- Logic Circuit: Ch1–4 before midterm; later chapters after midterm.
- Linear Algebra: verify 2.4–2.7 and 3.6 for midterm coverage.
- Discrete Math: D1–D8 built; continue from actual class schedule.

## Invariants

- This repo owns math behavior and content.
- Study_Hub owns generic Hub behavior.
- Cross-repo communication uses contracts/events.
- Mirror một chiều: Study_Hub chép mã toán theo `math.lock` (không sửa tay). Chiều ngược chỉ có tệp chép từ Hub (`shared/logic/pet-*.js`, `design-pets.json`, `design-tokens.json`, `exam-target.json`), canh bằng `hub-mirror.lock` và test.
- Every new computational question type gets an independent oracle test.

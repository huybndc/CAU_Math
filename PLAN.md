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

- [ ] P0 16-week content plan: execute `CONTENT_PLAN_16_WEEKS.md`; class lecture materials take precedence over textbooks.
- [ ] P0 Repo split: finish the math progress/event bridge currently present on the Study_Hub side.
- [ ] P0 Integration handoff: define a small, stable course/export contract so Study_Hub can consume this repo without copying source.
- [ ] P1 Midterm: validate the current syllabus scope and user experience for all three courses.
- [ ] P1 Content: continue concrete gaps only; preserve independent solution-oracle tests.
- [ ] P2 Post-midterm: expand later chapters only as the course reaches them.

The detailed week-by-week content map, source hierarchy, current coverage, and completion gates are in `CONTENT_PLAN_16_WEEKS.md`.

## Current course scope

- Logic Circuit: Ch1–4 before midterm; later chapters after midterm.
- Linear Algebra: verify 2.4–2.7 and 3.6 for midterm coverage.
- Discrete Math: D1–D8 built; continue from actual class schedule.

## Invariants

- This repo owns math behavior and content.
- Study_Hub owns generic Hub behavior.
- Cross-repo communication uses contracts/events.
- No source import/copy cycle between repos.
- Every new computational question type gets an independent oracle test.

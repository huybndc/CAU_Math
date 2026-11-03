# CAU Math App Plan

## Scope

This repository owns the current-semester apps for Logic Circuit, Linear Algebra, Discrete Math, and C Programming. Study_Hub is a separate app and is not required for local math development.

## Architecture

```text
CAU_Math_App
├── Logic Circuit
├── Linear Algebra
├── Discrete Math
├── C Programming
└── shared math-app framework
```

Study_Hub links to these apps. The repositories do not import code from each other.

## Priorities

- [x] P0. Separate math-app ownership from Study_Hub.
- [x] P0. Define the one-way course-link and design-snapshot integration.
- [x] P1. Prepare printed mock exams for the midterm (week 8).
- [ ] P1. Prepare for the final exam (week 16). Open items are in the CAU_Math section of `HANDOFF.md`.
- [ ] P1. Fill confirmed content gaps. Keep independent solution-oracle tests.
- [ ] P2. Add later chapters when the class reaches them.

## Course scope

Follow the current class schedule for each course. Do not write content for a week before the class source material exists.

## Invariants

- This repository owns math behavior and content.
- Study_Hub owns generic study-management behavior.
- Use contracts and adapters for cross-repository communication.
- Study_Hub links to the math app. Do not restore the removed math mirror or `math.lock` without a new decision.
- CAU_Math_App may copy approved Hub files such as `design-tokens.json` and `semester.js`. Track these snapshots with the current mirror lock and tests. Do not edit copied files by hand.
- Add an independent oracle test for every new computational question type.

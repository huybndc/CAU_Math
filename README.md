# CAU Math App

This repository is the source of truth for three math apps:

- Logic Circuit
- Linear Algebra
- Discrete Math

The apps provide course content and math tools. Study_Hub is a separate repository for study management.

## Repository boundary

CAU_Math_App owns course content, concepts, lessons, question generators, answer checkers, solution oracles, math UI, tools, exams, and math progress behavior.

Study_Hub owns Today, queues, cross-course statistics, notes, Obsidian, the vault, authentication, Supabase, row-level security, sync, course registration, and integration adapters.

Do not add Hub behavior here. Do not add math algorithms or course-specific content to Study_Hub. See [REPO_BOUNDARY.md](REPO_BOUNDARY.md).

## Structure

```text
CAU_Math_App/
├── logic/       Logic Circuit
├── linalg/      Linear Algebra
├── discrete/    Discrete Math
├── shared/      Code used by at least two math apps
└── scripts/     Tooling and content generation
```

Each app has pure logic, UI, content, translations, and tests.

## Run and test

Use Node.js 20 or later.

```sh
git clone https://github.com/huybndc/CAU_Math_App.git
cd CAU_Math_App
npm install
npm run dev
npm test
npm run check
```

The local app uses `http://localhost:5180`.

## Study_Hub integration

The repositories do not import source files from each other. Study_Hub links to the math apps. CAU_Math_App copies the approved design tokens and semester data as snapshots. The apps no longer send `math.answer` or `pet.set` events to Study_Hub.

Study_Hub owns cross-course views. CAU_Math_App owns math questions, answers, and UI.

## Agent documents

Read `REPO_BOUNDARY.md` for ownership, `AGENTS.md` for repository rules, and `PROGRESS.md`, `PLAN.md`, and `DECISIONS.md` for current work and decisions. Each subject has its own `AGENTS.md`.

Do not commit class PDFs, slides, syllabi, secrets, or personal data.

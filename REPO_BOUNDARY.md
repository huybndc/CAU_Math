# Repository Boundary

## CAU_Math_App owns

- Logic Circuit, Linear Algebra, and Discrete Math content.
- Course syllabi, concepts, lessons, and question generators.
- Answer checkers, solution oracles, and math-specific tools.
- Math lesson, practice, exam, and progress behavior.

## Study_Hub owns

- Hub navigation, Today, queues, and cross-course statistics.
- Notes, Obsidian, and vault access.
- Authentication, Supabase, row-level security, and Hub sync.
- Course registration and integration adapters.

## Do not cross this boundary

Do not add Hub behavior to CAU_Math_App. Do not add math algorithms, question banks, lessons, tools, or detailed syllabi to Study_Hub.

## Integration contract

Do not import source files from the other repository. The repositories use these file paths:

- Study_Hub links to the math apps. Its course links open `/<subject>/#/learn/chN` on the `cau-math` Worker. The math mirror and `math.lock` were removed on 2026-10-26.
- CAU_Math_App copies `design-tokens.json` and `semester.js` from Study_Hub as snapshots. Do not edit these copies by hand. Pet files were removed from both repositories on 2026-10-26.

The apps no longer send `math.answer` or `pet.set` events to Study_Hub. Study_Hub keeps the old contract in `hub.sql` for existing data.

## Change ownership

- Change course content, math methods, questions, or math UI in CAU_Math_App.
- Change Hub accounts, vault, Today, or cross-course data in Study_Hub.
- For a change that affects both repositories, update the contract or adapter in both repositories. Do not copy source code by hand.

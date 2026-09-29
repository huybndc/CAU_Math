# CLAUDE.md — CAU Math App

## Scope
CAU_Math_App is the source of truth for the current semester's three math courses:
Logic Circuit, Linear Algebra, and Discrete Math.

Read REPO_BOUNDARY.md before editing.

## Ownership
- This repo: syllabus/content, concepts, lessons, generators, solvers, solution oracles, math UI/tools, math progress.
- Study_Hub: generic Hub, Today/Stats, notes/vault, auth, Supabase/RLS and cross-course integration.
- Never add Hub-specific behavior here.
- Never fix math by editing the temporary math mirror in Study_Hub.

## Integration
Use contracts/events, not source imports.
Current event contract: math.answer = subject, prefix, kind, ok, mode, optional tag.
Study_Hub aggregates these events.

## Workflow
1. Read REPO_BOUNDARY.md and PROGRESS.md.
2. Inspect status and recent commits.
3. Keep changes small and test the affected app.
4. Run npm test and npm run check before handing off.
5. Update PROGRESS.md after meaningful changes.
6. Do not commit private course files, secrets or personal data.

Historical docs may describe the old combined repository. They are historical unless they conflict with REPO_BOUNDARY.md.

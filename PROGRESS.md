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
- A 16-week cross-course content plan is in `CONTENT_PLAN_16_WEEKS.md`; class lecture materials are the primary content source.
- Started Logic Ch4 class-material audit: added unsigned-underflow lesson, question kind, answer check, worked steps, and independent oracle.
- Drafted Linear Algebra Ch2 week-4 cards for matrix products, inverses, LU, and transposes; all nine Ch2 quiz kinds now have VI/EN lesson checkpoints. Waiting for class-material cross-check.
- Added an interactive Ch2 matrix product tool with editable rectangular A and B, per-entry derivations, invalid-input handling, and sample reset.

## In progress

- [ ] Repo split bridge: move the math.answer writer/integration adapter from Study_Hub into CAU_Math_App.
- [ ] Define a stable course/export contract for Study_Hub so it does not need duplicated math source.
- [ ] After the bridge is validated, remove/stop shipping the math mirror from Study_Hub.

## Current next work

1. Continue the week 2–8 syllabus audit against available class materials; keep the Linear Algebra week-4 cards in draft until cross-checked.
2. Complete Logic Ch4 gaps from the in-class handout, then draft the post-midterm Logic Ch5–7 modules.
3. Plan Linear Algebra Ch4–6 and Discrete post-D8 modules in syllabus order; label unverified topics as draft.
4. Keep each computational question type tied to an independent oracle test; update this file after each milestone.

## Guardrails

- Math-specific code/content → this repo.
- Hub/account/vault/Today/stats → Study_Hub.
- No direct source imports or copy cycles between repos.
- Do not commit class-only PDFs, slides, private syllabus files, secrets, or personal data.

## Tự soi
- 2026-09-29 · C2 (kiến thức phải tìm lại mỗi phiên) · Phiên nào cũng phải tự phát hiện rằng hai bản toán đã lệch nhau:
  nội dung Logic mới (29/09) chỉ nằm trong mirror ở Study_Hub, Discrete HW1 (PR #2) chỉ nằm ở đây; `AGENTS.md` ghi bản online
  build theo `math.lock` nhưng file đó chưa tồn tại · Sửa dòng `AGENTS.md` cho đúng thực tế; ghi việc hợp nhất dưới đây.

## Việc từ tự soi
- [x] (Ngay) Sửa dòng `math.lock` trong `AGENTS.md` cho khớp thực tế.
- [ ] (Ngay, chờ người học chọn hướng) Hợp nhất với mirror ở Study_Hub trước khi sửa tiếp nội dung Logic ở đây — kiểm:
  `diff -rq` thư mục `logic/ linalg/ discrete/ shared/` giữa hai repo (bỏ `*.md`) không còn file code/nội dung khác.

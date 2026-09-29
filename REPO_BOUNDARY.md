# REPO_BOUNDARY.md

## CAU_Math_App

Source of truth cho:
- Logic Circuit.
- Linear Algebra.
- Discrete Math.
- Math syllabus/content/concepts.
- Question generation + answer checking.
- Solution oracles.
- Math lesson/practice/exam UI và tools.
- Math progress event emission.

## Study_Hub

Source of truth cho:
- Hub navigation.
- Today / queue / stats.
- Notes / Obsidian / vault.
- Auth / Supabase / RLS.
- Cross-course aggregation.
- Integration adapters.

## Không làm chéo

CAU_Math_App không chứa:
- Hub Today/Stats.
- Vault reader.
- Hub auth/RLS.
- Course-agnostic planning engine.

Study_Hub không chứa:
- Math algorithms.
- Math question banks.
- Math-specific lessons/tools.
- Detailed syllabus của từng môn.

## Integration contract

Không import source trực tiếp từ repo kia.

Event hiện tại:
- type: math.answer
- required payload: subject, prefix, kind, ok, mode
- optional payload: tag

Study_Hub đọc và aggregate.
CAU_Math_App phát event khi bridge integration hoàn tất.

## Quy tắc source

Nếu một thay đổi liên quan đến kiến thức/cách giải/câu hỏi/UI toán → CAU_Math_App.

Nếu liên quan đến Hub/account/vault/Today/cross-course aggregation → Study_Hub.

Nếu cần cả hai → thay đổi contract/adapter ở cả hai repo, không copy implementation qua lại.

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

Study_Hub không tự viết:
- Math algorithms.
- Math question banks.
- Math-specific lessons/tools.
- Detailed syllabus của từng môn.

## Integration contract

Không import source trực tiếp từ repo kia. Có đúng hai đường chép tệp:
- Study_Hub → CAU_Math_App: chỉ link (thanh bên, thẻ "Ôn cuối kỳ" mở `/<môn>/#/learn/chN` trên Worker `exlab`). Không còn mirror/`math.lock` (gỡ 2026-10-26).
- CAU_Math_App ← Study_Hub: chép `design-tokens.json`, `semester.js` (bản chụp, không sửa tay). Pet đã gỡ ở cả hai (2026-10-26).

Event: không còn (2026-10-26). App toán chạy riêng, không gửi `math.answer` hay `pet.set` sang Study_Hub; Hub giữ hợp đồng cũ trong hub.sql cho dữ liệu cũ.

## Quy tắc source

Nếu một thay đổi liên quan đến kiến thức/cách giải/câu hỏi/UI toán → CAU_Math_App.

Nếu liên quan đến Hub/account/vault/Today/cross-course aggregation → Study_Hub.

Nếu cần cả hai → đổi contract/adapter ở cả hai repo; không copy mã tay qua lại.

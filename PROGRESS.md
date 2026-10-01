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

- D51: LinAlg UX — ô vector/ma trận, chính sách sai số + góc độ/radian, thi thử gập, bài học vẽ ma trận, thẻ gập, lưới ma trận ở Nháp. Chưa đưa sang bản mirror Study_Hub.

- D57 (2026-10-02): Công cụ = "Máy giải" có lời giải gập (shared/ui/solver.js: đáp án lớn, bước gập, Che đáp án, Bài tương tự).
  Bước 1 xong cho LinAlg: Vector, Tổ hợp tuyến tính, Giải hệ (E/P/L, nghịch đảo), Ma trận, Cơ sở không gian — thay kéo vector/span 3D/form biến đổi hàng;
  bỏ tab Giải Ax=b khỏi Nháp (Nháp để tự làm). Bảng chân trị Nháp: kéo / Alt+←→ đổi chỗ cột biểu thức.
  Bố cục: kết quả chia ngăn (Cách làm | E·P·LU | Nghịch đảo…), hai cột nhập|kết quả ≥1000px, mỗi trang Công cụ chỉ một công cụ (thanh chọn); tooltip tức thì shared/ui/tip.js thay `title` (trễ 3–4 s).
  Ô nhập dạng lưới (vector là CỘT, nhãn v₁ v₂ | w), nút 🎲 Ngẫu nhiên cho mọi máy giải (logic/random-input.js, có test).
  Thuật ngữ (rank, trụ, độc lập, …) trong kết quả là chữ bấm được: định nghĩa một câu + liên kết thẻ bài học (shared/ui/terms.js, linalg/src/ui/glossary.js).
  Phân số viết hai hàng (tử trên mẫu) trong mọi dòng toán (shared/logic/fractions.js, mathSpan); máy giải luôn ưu tiên phân số thay thập phân (withFractionMode).
  Bước 2 xong (D58): Logic — Đổi cơ số (gộp nhóm bit, chia/nhân liên tiếp), Trừ bằng số bù, Số có dấu (cộng/trừ + tràn), Biểu thức Boole (nhóm lớn nhất, SOP/POS, bù, dual, toàn NAND; K-map giữ nguyên);
  Discrete — Bảng chân trị & tương đương, Euclid + Pulverizer, đồng dư ax ≡ b (mod n), lũy thừa mod. Bỏ: MUX/decoder, bộ cộng–trừ từng bit, sân chơi RSA, sân chơi đồ thị.
  Khung dùng chung thêm: `why` mỗi bước (câu "vì sao"), "Đáp án của bạn" khi đang che (expect/check — chấm theo giá trị, không theo cách viết), "Sao chép lời giải" (chữ thuần, dán vào ghi chú), `figure` (hình 2D cho vector),
  shared/ui/fields.js (ô nhập chữ), shared/ui/glossary.js (từ điển thuật ngữ + link bài học cho cả 3 app).
  Dòng toán gọn: mỗi vế một dòng (|v|, góc, chiếu); phân số có căn/π/ngoặc cũng xếp hai hàng (shared/logic/fractions.js).
  D59: máy giải nhớ ô nhập theo trình duyệt (fieldRow key); khi che đáp án có nút Gợi ý (mở dần câu "vì sao" từng bước); thêm ô "Đáp án của bạn" cho vector (độ dài/góc/tích vô hướng), tổ hợp (hệ số), không gian (hạng).
  D60: luyện tập tải lại thì tiếp tục đúng câu (runner lưu (dạng, hạt giống) mỗi câu, 12 giờ); thi thử đếm "đã làm" cập nhật ngay khi gõ; đổi cơ số → nhị phân hiện đáp án đủ 8 bit + dòng đệm 0 trong lời giải; Discrete D1 thêm dạng tự luận "Đếm dòng đúng" (bớt trắc nghiệm).
  D61: CAU_Math có CI (.github/workflows/ci.yml: test + check + build); Discrete thêm máy giải ax + by = c (nghiệm tổng quát + nghiệm không âm cho bài tem / bình nước).
  D62: Tìm nhanh Ctrl/⌘ K hoặc "/" (shared/ui/palette.js): bỏ dấu tiếng Việt, tìm trong thẻ bài học (cả nội dung), công cụ và luyện tập từng chương; nhảy thẳng tới thẻ.
  D63: Discrete D2 thêm dạng tự luận "Đếm giá trị thoả" (có test đếm lại độc lập) — bớt trắc nghiệm cho đề thi thử.
  D64: máy giải gắn sau `shellReady` (shared/ui/shell.js) — dưới Hub, tài khoản chỉ gắn trong hydrateProgress nên đọc ô nhập đã nhớ lúc mount (khoá "khách") không thấy gì; e2e ở Study_Hub (tests/e2e/tools.spec.js) canh lỗi này.
  D65: thẻ bài học có nút "Mở máy giải: …" (<div data-tool="ch6/1"></div> trong markdown; 42 thẻ cả 3 app, vi + en).
  D66: Sổ câu sai — câu sai ở luyện tập được nhớ (dạng + hạt giống, tối đa 60/chương, shared/logic/mistakes.js); màn Luyện tập có "Ôn lại câu đã sai (N)" làm lại đúng các câu đó, đúng thì gỡ khỏi sổ; không ghi thêm vào thống kê.
  D67: Logic thêm máy giải "Mã nhị phân" (số thập phân → BCD/2421/Excess-3, cộng BCD +6 từng cột, nhị phân ↔ Gray từng bit, bit parity chẵn/lẻ) + nút máy giải ở 4 thẻ bài học Ch1; test đối chiếu độc lập (cộng thập phân, b ^ (b >> 1)).
  D68: câu sai ở thi thử / bài tập dài cũng vào Sổ câu sai (store.markMistake dùng chung với runner); màn kết quả nhắc.
  D69: Discrete D5 thêm 2 dạng tự luận (Đếm bước đong nước — BFS độc lập kiểm; Ít tem a nhất — vét cạn kiểm) + 2 máy giải mới: Tập hợp (∪ ∩ − ⊕ bù, đếm bao hàm–loại trừ) ở D3 và Tổng đóng (cấp số cộng/nhân, bình phương, lập phương, số lẻ; kiểm bằng cộng trực tiếp) ở D4; thẻ bài học D3/D4 có nút máy giải.
  Không làm: ghi sự kiện máy giải sang Hub — đổi contract math.answer cần yêu cầu contract riêng (AGENTS.md).

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

## Tự soi
- 2026-09-29 · C2 (kiến thức phải tìm lại mỗi phiên) · Phiên nào cũng phải tự phát hiện rằng hai bản toán đã lệch nhau:
  nội dung Logic mới (29/09) chỉ nằm trong mirror ở Study_Hub, Discrete HW1 (PR #2) chỉ nằm ở đây; `AGENTS.md` ghi bản online
  build theo `math.lock` nhưng file đó chưa tồn tại · Sửa dòng `AGENTS.md` cho đúng thực tế; ghi việc hợp nhất dưới đây.

## Việc từ tự soi
- [x] (Ngay) Sửa dòng `math.lock` trong `AGENTS.md` cho khớp thực tế.
- [ ] (Ngay, chờ người học chọn hướng) Hợp nhất với mirror ở Study_Hub trước khi sửa tiếp nội dung Logic ở đây — kiểm:
  `diff -rq` thư mục `logic/ linalg/ discrete/ shared/` giữa hai repo (bỏ `*.md`) không còn file code/nội dung khác.

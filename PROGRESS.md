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
  D70 (2026-10-03): UI trang môn khớp Hub — tokens.css thêm --sp-*/--lift/--hi-ink (cùng giá trị với Hub); tab đang chọn = nền --panel + viền như Hub; .btn cùng cỡ/đệm với Hub; chữ hổ phách dùng --hi-ink; "7 ngày" (.acc-scope) bỏ opacity → đạt AA trên nền tối. Sáng/tối vẫn theo hệ thống trừ khi đã bấm nút đổi (khoá study-theme). Không đổi logic/solver/oracle/math.answer.
  D71 (2026-10-03): Luyện tập — thanh tiến độ dày (12px) + đếm rõ; phản hồi đúng/sai nổi (viền, cỡ lớn) kèm chip "Đúng liên tiếp k"; tổng kết có thanh đúng/sai từng dạng, nhãn "Cần luyện lại" ở dạng yếu nhất, nút "Làm tiếp". AA: token --accent-ink-soft cho .ch-no/.tag.now; nút link (Gợi ý, Xem đáp án) dùng --ink. Khung chờ (motion.css) cho màn còn rỗng lúc tải (Tổng quan trống ~0,3 s trước khi JS vẽ). Bộ quét tương phản: 0 chỗ <4.5 ở 3 app × 4 màn × sáng/tối. Không đổi logic/solver/oracle/math.answer.
  D72 (2026-10-03, chờ duyệt): Học — mục dùng --ink cỡ md, 3 trạng thái (vòng rỗng · chấm đặc · ✓ xanh) + dòng "học tiếp" nền nhấn; Công cụ — thẻ chương có icon, mô tả một dòng, "N công cụ →"; Tổng quan — chương chưa làm câu nào gộp thành dải thu gọn "Chưa bắt đầu" (mở sẵn nếu tất cả đều chưa làm); thanh bên — nút Tìm nhanh là icon kính lúp 18px, nhóm VI/EN và nút sáng/tối có aria-label, tooltip đồng bộ rút còn một câu. Quét AA: 0 chỗ <4.5 (3 app × 4 màn × sáng/tối). Không đổi logic/solver/oracle/math.answer.
  D73 (2026-10-03): bản online không gọi /__sync (404 hàng loạt) — chỉ gọi khi chạy trên máy tính (folderSyncPossible, có test); máy giải: giá trị gây lỗi không được nhớ, giá trị lỗi đã nhớ từ trước về mặc định, khung lỗi nằm ngay dưới ô nhập (cột trái). `name: 'ch-tree'` trên <details> ở màn Học là CHỦ Ý (từ PR #54, "mỗi màn vừa một khung nhìn"): mở chương này thì chương kia đóng để danh sách không dài.
  D74 (2026-10-04): kiểm bản online 1280×720 — dải "Chưa bắt đầu" mở sẵn làm Tổng quan người mới cuộn cả trang (Logic 734, Discrete 828px); nay luôn thu gọn (720 ở cả 3 app). Không còn lỗi console/mạng, link, tìm nhanh, máy giải, đáp án đều chạy.
  D75 (2026-10-08): gắn `npm run design:check` (scripts/design-check.mjs, design-baseline.json, PRODUCT.md) vào CI cạnh test/check. Quét lần đầu 15 mục: sửa 3 bounce-easing (bỏ --ease-spring, dùng --ease-out) và 1 layout-transition (bỏ transition padding-left khi thu gọn menu); còn 11 side-tab giữ trong baseline (viền nhấn thẻ quan trọng, chủ ý — ghi ở PRODUCT.md).
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

## Tự luận tự chấm (2026-10-02)
- Màn `#/free` (tab thứ ba của Luyện tập) cho cả 3 môn: đề · gợi ý theo thang · lời giải mẫu chia ý · ý chấm tự tích · chỗ hay sai · tự đánh giá (lưu theo môn, khoá `free`). Máy KHÔNG chấm.
- Dữ liệu: `<app>/src/content/free/chN.json`; kiểm bằng `shared/logic/free.js` + `<app>/tests/free-content.test.js`.
- Nội dung: Discrete 62 bài (MIT 6.042J, CC BY-NC-SA 3.0), LinAlg 38 bài (MIT 18.06 Spring 2010 PS1–4, CC BY-NC-SA 3.0), Logic 26 bài (dạng bài theo Mano, tự soạn). Đề diễn đạt lại, lời giải tự viết, số liệu kiểm bằng máy.
- "Bài full" đổi tên thành "Bài tập dài" (thi thử chỉ là luyện tập dài, không bắt chước đề thật).

## Sơ đồ mạch tự vẽ (2026-10-02)
- Máy giải "Biểu thức Boole" (Logic, Công cụ ch2) vẽ thêm 3 mạch trong khung gập: đúng như gõ · AND–OR của SOP tối giản · toàn NAND (`logic/src/logic/circuit.js` + `ui/circuit-figure.js`, test mô phỏng khớp bảng chân trị).
- Mới là mức A (biểu thức → sơ đồ, chỉ để xem). Kéo-thả cổng + mô phỏng (mức B) chưa làm — chỉ làm nếu người học thấy cần.

## Tổng quan 2 cột (2026-10-09)
- Tổng quan mỗi môn: trái = Hôm nay + số liệu 7 ngày + chương trong thẻ tự cuộn (~5 hàng, chương chưa làm vẫn hiện, bỏ dải gập "Chưa bắt đầu"); phải = Học (2 thẻ) · Luyện tập (3 thẻ) kiểu thẻ nhẹ. Bỏ dòng "Hoặc" ở khối Hôm nay (thẻ phải thay vào, một nguồn số).
- Chốt cùng Study_Hub: tông lạnh, cỡ 107%/15/13/26, thẻ viền 1px bo 10px. CHƯA làm: snapshot token (chờ Hub sinh JSON + test lệch), dòng "Giữa kỳ còn N ngày + vạch mục tiêu" (cần EXAM_TARGET chung).
- Token chung với Study_Hub (2026-10-09): `shared/style/design-tokens.json` = bản chụp từ Study_Hub `design-tokens.json` (commit 2d48f41); `tokens-hub.css` sinh bằng `node shared/style/render-tokens.mjs`; `tokens.css` chỉ còn token riêng. Màu nhấn = màu môn của Hub (`--viz-*`) — khác Hub ở chỗ `--accent` (Hub: màu mực). Font Source Sans 3 + html 107% như Hub. Test: `shared/tests/hub-tokens.test.js`. Hub đổi token → chép JSON mới + chạy script.
- Mục tiêu thi (2026-10-09): `shared/logic/exam-target.json` = bản chụp từ Study_Hub `exam-target.json` (commit 61700d0; lịch thi + mục tiêu %/môn); dòng "Mục tiêu thi" (thanh % đúng + vạch --goal) đầu cột trái Tổng quan; test `shared/tests/exam-target.test.js` canh lịch khớp `syllabus.js`. Hub đổi → chép JSON mới.

## Rà logic lõi 3 môn (2026-10-09)
- Đối chiếu ngẫu nhiên với bộ tính độc lập (BigInt/phân số/vét cạn), tổng ~245.000 ca: Logic ~20.400 (đổi cơ số, mã bù, số có dấu, Gray, QM tối thiểu, bộ cộng/BCD, parser biểu thức); Linear Algebra ~24.000 (định thức, hạng, giải hệ, không gian null/cột/hàng, LDU, vector, đọc đáp án); Discrete ~200.000 (gcd/Pulverizer/modInv/modPow/φ, đồ thị: liên thông, 2 phía, BFS, Euler, Havel–Hakimi, đẳng cấu; mệnh đề in-đọc lại; báo cáo đồng dư/Diophantine/Euclid).
- Sửa (cao): `subTwos` ném lỗi khi trừ số âm nhỏ nhất (0 − (−8)) và báo sai tràn; `checkNumber` hiểu "0,5" là hai số thay vì 0.5. Test: `signed-binary.test.js` (mọi cặp w=3…6), `answer-check.test.js`.
- Backlog (thấp): `determinant`/`rankOf` coi |x| < 1e-9 là 0 (ma trận cỡ 1e-5 ra det 0); `pulverize` với số âm cho gcd âm (chỉ gọi với số dương); `toDecimal`/`convertBase` không nhận số âm và mất chính xác > 2^53; `checkNumber` chưa đọc "1e-3", "33%"; `checkVector` chưa đọc "x=1, y=2".
- Bạn đồng hành (2026-10-09): nút bật/tắt + nhân vật SVG nhỏ cuối cột phải Tổng quan (`shared/ui/pet.js`, `shared/style/pet.css`); mặc định TẮT, lưu `pet:<môn>`; keyframes `pet` (translateY 2px, 3s) là ngoại lệ DUY NHẤT của quy tắc motion giống Hub (test `motion.test.js`); giảm chuyển động ⇒ đứng yên. Hub không hiện (đã thống nhất 3 bên).
- Bạn đồng hành, 3 nhân vật (2026-10-09): ô chọn Không/Mèo/Giọt nước/Rô-bốt (`shared/logic/pet.js` PETS + normalizePet, `shared/ui/pet-art.js` ba SVG ~0,75KB, `shared/ui/pet.js` petBlock(storage, labels) không phụ thuộc store/i18n để Hub mirror). Lưu `pet:<môn>` = 'off'|'cat'|'blob'|'bot' (giá trị cũ true ⇒ cat). Ngoại lệ keyframes `pet` vẫn duy nhất.

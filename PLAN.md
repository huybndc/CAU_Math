# PLAN.md — 3 app ôn tập: Logic Circuit · Linear Algebra · Discrete Math

**Trạng thái:** Người học duyệt 2026-09-23, giao toàn quyền quyết định. Đang làm: xem `PROGRESS.md`.

## Bối cảnh
- Repo làm việc là **`CAU_Math/`** (`~/Claude_projects/CAU_Math`, GitHub `huybndc/CAU_Math`, **public**). Mọi code, commit và push chỉ diễn ra trong repo này.
  - Trước mỗi commit hoặc push phải kiểm `git remote -v`, và remote phải là `huybndc/CAU_Math`.
- Trong repo có sẵn 2 app:
  - `project_kmap`: Logic Circuit, Mano Ch.1–3, 261 test.
  - `project_linalg`: Linear Algebra, Strang Ch.1–3, 250 test.

  Cả hai dùng Vite + JS thuần, `logic/` thuần tách khỏi `ui/`, song ngữ VI/EN.
- `toeic_app/` (repo `huybndc/toeic-app`) **chỉ để tham khảo, không đụng vào.** Không pull, không sửa, không commit vào đó.
  - File mẫu đọc qua `gh api` (read-only) từ bản main trên GitHub, vì clone local đang chậm 13 commit.
  - Mẫu tham khảo gồm: cách xếp file, UX/UI, và khuôn PLAN/DECISIONS/PROGRESS.
- **Vấn đề thấy khi mở 2 app trên trình duyệt:**
  - Lý thuyết là "tường chữ": 7.600 chữ cho 6 chương.
  - Chữ hướng dẫn rải khắp các card. Footer còn hiện dòng dành cho dev. Icon là ký tự ▶✔✘.
  - "Luyện tập" chỉ có một câu lẻ: không có đề, không tính giờ, không chấm tổng, không lưu tiến độ.
  - Hai app có 5 file khung giống hệt nhau.
- **Người học cần:**
  - Trông chuyên nghiệp, ít chữ, tương tác trực quan hơn.
  - Có ra đề và kiểm tra thật.
  - Thêm Discrete Math, dạy từ căn bản đến nâng cao.
  - Chỉ chạy localhost, không deploy.
  - **Bám syllabus của từng môn** (tài liệu riêng của môn, không commit).
- **Hạn gần nhất:** cả 3 môn đều thi giữa kỳ ở **tuần 8** (khoảng cuối tháng 10). Hiện đang ở khoảng tuần 4.

## Syllabus → việc cần làm (quan trọng nhất)

### Logic Circuit
Mano & Ciletti, *Digital Design* 6th Global; GV Cho Hyung-June. Điểm: giữa kỳ 35, cuối kỳ 40, bài tập 20 (7 bộ).

| Tuần | Nội dung | App hiện có | Việc |
|---|---|---|---|
| 2–3 | Ch1 Hệ số & mã; Ch2 Đại số Boolean & cổng | Có | Đổi sang thẻ học + dạng câu hỏi |
| 4–5 | Ch3 Gate-level minimization | Có K-map, NAND | Thêm `ch3-quiz`; bổ sung phần còn thiếu của Ch3 (NOR, XOR) |
| 6–7 | **Ch4 Combinational logic** | **Chưa có** | **Chương mới trước giữa kỳ:** mạch cổng SVG bấm được; cộng/trừ nhị phân; bộ so sánh; decoder/encoder/MUX |
| 9–15 | Ch5 Sequential · Ch6 Registers & counters · Ch7 Memory & PLD | Chưa có | Làm sau giữa kỳ |

### Linear Algebra
Strang, *Introduction to Linear Algebra* 4th ed; GV Lee Hyung Tae. Điểm: giữa kỳ 45, cuối kỳ 45.
- Sửa lại PLAN cũ: sách của môn là *Introduction to LA 4th*, không phải "LA and Its Applications".

| Tuần | Mục | App hiện có | Việc |
|---|---|---|---|
| 2 | 1.1–1.3 | Có 1.1–1.2 | Thêm 1.3 Matrices (Ax là tổ hợp các cột) |
| 3 | 2.1–2.3 | Có khử Gauss | Thêm ma trận khử E |
| 4 | **2.4–2.7** | **Chưa có** | **Chương mới:** phép toán ma trận, nghịch đảo (Gauss–Jordan), A = LU, chuyển vị/hoán vị |
| 5–7 | 3.1–3.6 | Có phần lớn | Bổ sung RREF + nghiệm đặc biệt, **4 không gian con (3.6)** |
| 9–15 | 4.1–4.4 · 5.1–5.3 · 6.1–6.7 | Có plan M4–M6 | Làm sau giữa kỳ |

### Discrete Math
MIT *MCS* bản 2017; GV Park Jae-Hyun. Điểm: giữa kỳ 40, cuối kỳ 40, chuyên cần 10, lập trình 10.
- Vault đang có bản MCS 2010, nên số chương dưới đây theo bản 2017.
- 2 slide Rosen Ch.1–2 của GV thứ hai dùng làm phần nền.
- Mẫu RSA của giảng viên (tài liệu riêng, không commit) là chuẩn; D7 sẽ bám đúng các bước trong đó.

| Tuần | Syllabus | Chương app | Tương tác chính |
|---|---|---|---|
| 2 | Introduction & Proofs | **D1** Mệnh đề & logic (MCS 1, 3; Rosen 1.1–1.3) | Bảng chân trị tự dựng; so 2 công thức; Knights & Knaves |
| 3 | Proofs & Algorithms | **D2** Lượng từ, suy luận, phương pháp chứng minh, well-ordering (MCS 1–3; Rosen 1.4–1.8) | Lưới ∀/∃; xếp bước chứng minh (Parsons); tìm lỗi chứng minh |
| 3 | (nền) | **D3** Tập hợp, hàm, quan hệ (MCS 4; Rosen 2.1–2.3) | Venn bấm vùng; sơ đồ mũi tên đơn/toàn/song ánh |
| 4 | Induction | **D4** Quy nạp (MCS 5.1) | Domino quy nạp; chứng minh quy nạp dạng Parsons |
| 5 | Invariant & Strong Induction | **D5** Bất biến, quy nạp mạnh, máy trạng thái (MCS 5.2–5.3, 6) | Bình nước Die Hard; trò chơi có bất biến |
| 6 | Number Theory | **D6** Chia hết, gcd, Euclid/Pulverizer, số nguyên tố (MCS 9) | Bảng Euclid chạy từng bước; Bézout |
| 7 | Number Theory & Cryptography | **D7** Đồng dư, nghịch đảo, φ, Euler, RSA (MCS 9) | Đồng hồ mod; bảng mod n; sân chơi RSA theo `RSA.py` |
| 8 | Giữa kỳ | Thi thử D1–D7 | — |
| 9 | Graphs | **D8** ✅ bậc, dãy bậc, Kₙ/Cₙ/Kₘ,ₙ, Aᵏ đếm walk, BFS, liên thông, hai phía, Euler, cây, đẳng cấu (MCS 12, 10.3) — D35 | Sân chơi đồ thị |
| 10–14 | Matching · MST · Networks · Relations/POs · Sums & Asymptotics | D9–D13 (MCS 10–12, 14; Rosen 2.4) | Làm khi lớp học tới |

## Kiến trúc: **B, người học đã chốt (2026-09-23)** — 3 app riêng, 1 cổng, có trang Tổng quan chung
```
CAU_Math/                    npm run dev → localhost:5180 (strictPort)
├── index.html               /           Tổng quan cả 3 môn
├── vite.config.js           gốc Vite = gốc repo; mỗi thư mục môn là 1 trang (multi-page)
├── package.json             một bộ node_modules cho tất cả
├── shared/                  khung, ra đề, tiến độ, CSS, i18n core, plugin include
├── logic/     (git mv từ project_kmap)    /logic/
├── linalg/    (git mv từ project_linalg)  /linalg/
└── discrete/  (mới)                        /discrete/
```
- **Một origin cho cả 3 app**, nên localStorage dùng chung:
  - Theme và ngôn ngữ nhớ chung cho cả 3.
  - Nhật ký tiến độ có trường `subject`, nhờ vậy trang Tổng quan đọc được cả 3 môn.
- Plugin include đổi sang tính đường dẫn **theo thư mục của file HTML**, không theo `process.cwd()`. `index.html` của từng môn dùng đường dẫn tương đối (`./src/main.js`).

## Quyết định chung (sẽ ghi vào `DECISIONS.md`)
1. **`shared/`** chứa phần dùng chung: khung giao diện, bộ ra đề/thi thử, tiến độ, CSS, lõi i18n. Một `package.json` ở gốc; `npm test` chạy test cả 3 môn.
2. **TOEIC chỉ là mẫu tham khảo:** copy có chọn lọc, không import chéo repo, không đụng vào repo `toeic-app`.
3. **Chỉ localhost:**
   - Bỏ `vite-plugin-singlefile`.
   - Cổng cố định với `strictPort`, vì localStorage gắn theo origin.
4. **Tiến độ:** nhật ký append-only trong localStorage, có nút Xuất/Nhập JSON.
5. **Song ngữ VI/EN** giữ như cũ.
6. **Nội dung tự diễn đạt lại, ghi nguồn** (Mano, Strang, MCS, Rosen). Không commit PDF/slide/syllabus, vì repo public.
7. **Không làm:** deploy/PWA/đồng bộ, AI lúc chạy app, streak/huy hiệu, framework, thư viện toán (Unicode trước), Three.js.

## Hợp đồng câu hỏi tự sinh (dùng chung)
```js
export const KINDS = [...];
export function makeQuestion(kind, rnd)  // → { kind, textKey, textParams, answer, meta, hintKey?,
                                         //     format: 'text'|'number'|'vector'|'choice'|'set'|'order', choices? }
export function checkAnswer(q, given)    // → { ok, reason? }
```
- Mỗi môn có `src/logic/generators.js` gom các chương, và `src/ui/explain.js` viết lời giải.
- Đề thi chỉ gồm `{seed, config}` và được dựng lại bằng `seededRandom`, nên F5 giữa bài không mất bài.

## Lộ trình mới — các Phase (sau khảo sát UX 2026-09-24, `RESEARCH.md`)
Người học: "UX-UI giống toeic-app; giảng bài, giao bài cho chọn dạng hoặc chọn bài full 60–90 phút".
Người học chốt: menu **theo việc** như toeic; bài full **cho chọn** giữa Thi thử (nộp mới chấm) và Bài tập dài
(chấm từng câu). Làm trên Logic trước (giữa kỳ tuần 8), rồi nhân sang LinAlg, Discrete.

| Phase | Tên | Nội dung | Trạng thái |
|---|---|---|---|
| 1 | **Khung giao diện theo việc** | Token + khung (menu trái, chỉ máy tính — D19), Tổng quan (hôm nay + 3 số + theo chương), Học, Luyện tập có "~M phút · đúng X%" và "← cần nhất", nhật ký làm bài, trang tổng quan chung | xong |
| 2 | **Bài full 60–90 phút** | Chọn chương + thời lượng; số câu theo thời gian chuẩn từng dạng; Thi thử (đồng hồ, danh sách câu, đánh dấu, nộp có xác nhận, F5 không mất bài) / Bài tập dài (chấm từng câu); kết quả theo chương + dạng, xem lại câu sai, "Luyện lại dạng sai" | xong (Logic; D20) |
| 3 | **Bài học theo điểm kiến thức** | Khái niệm ngắn → ví dụ mẫu bấm hiện từng bước → 2–3 câu tự làm (đúng 2 liên tiếp mới qua); học cả chương hoặc một dạng | xong (Logic; D26) |
| 3b | **Câu khái niệm bằng Gemini** | Soạn theo lô, máy kiểm (schema + luật + chạy lại phép tính), người học duyệt; dạng "Khái niệm" trong app | xong (Logic; D27) |
| 4 | **Linear Algebra lên chuẩn mới** | Ngân hàng câu tự sinh ch1–3 theo hợp đồng mới, thêm 2.4–2.7 và 3.6 | |
| 5 | **Discrete Math** | App mới D0 + D1…D7 theo syllabus | xong D1–D8 (D32, D33, D35), công cụ (D34), câu khái niệm soạn tay (D36) |
| 6 | **Logic Ch4 — Mạch tổ hợp** | Trước giữa kỳ | xong (D39): bài học, 10 dạng câu, 2 công cụ bấm thử |

## Lộ trình cũ (S0–S5, giữ để tra cứu)
Quy tắc làm việc:
- Nên gói khoảng 2 milestone mỗi phiên để test kỹ (khuyến nghị, không bắt buộc — người học 2026-09-24).
- Test pass mới được làm tiếp.
- Sau mỗi bước con: cập nhật PROGRESS.md và commit trên nhánh riêng của `CAU_Math`.
- Chỉ push khi người học bảo.

### Giai đoạn 1 — Nền (tuần 4)
**S0 — Gom repo và `shared/` (giao diện chưa đổi)** — ✅ xong 2026-09-23
- Tạo `package.json` ở gốc repo.
- `git mv` 5 file trùng và lõi i18n vào `shared/`.
- Sửa `vite-plugin-include.js`: đang dùng `process.cwd()`, đổi sang `config.root`.
- Cấu hình cổng; bỏ singlefile.
- Tạo CLAUDE/PLAN/DECISIONS/PROGRESS ở gốc repo.
- **Xong khi:** `npm test` ở gốc repo pass khoảng 510 test, và cả 24 mục con chạy như cũ.

**S1 — Làm lại giao diện (người học: "đổi mạnh về giao diện")** — ✅ xong 2026-09-24 (D08–D10)
- Điều hướng: sidebar trên máy tính, thanh dưới đáy trên điện thoại (D43). Topbar có breadcrumb, VI/EN, sáng/tối. Định tuyến bằng hash `#/ch3/interactive`.
- Lấy từ TOEIC: `el()`, `icon()` SVG, theme đặt trước lần vẽ đầu, View Transitions (D59).
- Design tokens và màu nhấn riêng cho từng môn.
- Bớt chữ:
  - Hướng dẫn chuyển thành nút ⓘ (popover).
  - Bỏ số trước tiêu đề và footer dành cho dev.
  - Kết quả dài rút thành badge, kèm "Vì sao?".
- **Xong khi:**
  - Xem ở 1280×800 và 390×844, cả sáng/tối.
  - Có test chặn đoạn chữ hướng dẫn hiện mặc định.

**S2 — Bộ sinh đề + Luyện tập chấm ngay** — ✅ Logic xong 2026-09-24 (26 dạng); LinAlg, Discrete làm theo từng môn
- `shared/logic/shuffle.js` và `answer-format.js` (chấm số có sai số, đọc tập hợp).
- `runner.js`:
  - Lượt 10 câu, có lời giải.
  - Phím Enter và 1–4.
  - Số câu "còn lại" tính từ số câu đã làm.
  - Kết thúc bằng màn `sessionDone`.
- Thêm `ch3-quiz` cho Logic. Xoá các trang practice cũ, giữ phần khoanh nhóm K-map.
- **Xong khi:** mọi dạng câu × 200 seed đều pass test tính chất: đáp án của chính câu được chấm đúng, đáp án bị sửa bị chấm sai.

### Giai đoạn 2 — Nội dung trước giữa kỳ (tuần 4–7), đi theo tuần học
Mỗi chương theo cùng khuôn:
1. Logic thuần + test.
2. Các dạng câu hỏi + test tính chất.
3. Thẻ học VI/EN.
4. 1–3 tương tác.

- **Discrete:**
  - D0 là khung app. Parser `prop-logic.js` có `¬ ∧ ∨ ⊕ → ↔` và dạng ASCII.
  - Làm lần lượt D1 → D7 theo bảng syllabus.
- **Logic:** L4 Combinational logic (Ch4).
  - Mạch SVG sinh từ biểu thức, bấm đầu vào thì thấy tín hiệu chạy.
  - Half/full adder, bộ cộng ripple, bộ so sánh, decoder/MUX.
  - Dạng câu hỏi: bảng chân trị của mạch, đầu ra MUX, số cổng.
- **LinAlg:**
  - LA2b: mục 2.4–2.7. Tương tác: nghịch đảo Gauss–Jordan từng bước và phân rã LU từng bước.
  - LA3b: mục 3.2 RREF + nghiệm đặc biệt, và 3.6 bốn không gian con (vẽ bằng hạ tầng 3D có sẵn).
- **S3 — Thi thử** (trước tuần 7, để làm đề giữa kỳ thử):
  - Dựng đề nhiều chương chia đều, có hạt giống.
  - Đồng hồ chỉ sửa phần chữ, hết giờ tự nộp.
  - Không lộ đáp án trước khi nộp.
  - Có lưới câu và nút gắn cờ; F5 vẫn tiếp tục đúng đề.
  - Kết quả hiện theo chương, xem lại lời giải, nút "Luyện lại câu sai".
  - In đề bằng `print.css`.
  - Có preset "Giữa kỳ" cho mỗi môn, phạm vi đúng các chương trước tuần 8.
- **S4 — Thẻ học:** — ✅ khung + nội dung Logic xong 2026-09-24; LinAlg tiếp theo
  - `lesson.js`: tách md theo `##`; câu hỏi nhanh `data-check`; "Thử ngay →"; phần dài bỏ vào `<details>`.
  - Viết lại lý thuyết cũ, mỗi thẻ ≤ 100 chữ. Có test chặn thẻ vượt 120 chữ.
  - Chương mới viết thẳng theo khuôn thẻ.

### Giai đoạn 3 — Sau giữa kỳ
- **S5 — Tiến độ & Tổng quan:** thành thạo từng chương, gợi ý theo chỗ yếu (bảng NEED kiểu D52), Xuất/Nhập JSON. Nếu người học chọn B hoặc C thì có Tổng quan chung cho cả 3 môn.
- Các chương còn lại, làm theo tuần học:
  - Logic Ch5–7.
  - LinAlg Ch4–6 (M4–M6 cũ).
  - Discrete D8–D13.

## Tái dùng
- **TOEIC** (đọc qua `gh api`, copy có chọn lọc):
  - `src/ui/dom.js`, `blocks.js` (`icon`, `optionList`, `confirmCard`, `sessionDone`, `letterFromKey`), `router.js`, `tabbar.js`, `shell.css`, `app.js` (theme, view transition)
  - `src/logic/shuffle.js`, `round.js`, `suggest.js`
  - `exam*.js` (mẫu dựng đề và đồng hồ)
  - `tests/ui-exam.test.js` (mẫu test jsdom)
- **CAU_Math (repo này):**
  - kmap: `bool-ast`, `expr-parser`, `quine-mccluskey`, `kmap-explain`, `logic-gates`
  - linalg: `answer-check`, `num-format`, `elimination`, `matrix`, và tầng `geometry/` + canvas

## Kiểm chứng
- **Mỗi milestone:**
  - `npm test` ở gốc repo.
  - `check_file_sizes.sh . 450`.
  - Tắt server nền.
  - `git remote -v` đúng `huybndc/CAU_Math` trước khi commit.
- **Chạy thật bằng Claude Browser:**
  - Kích thước 1280×800 và 390×844, cả sáng/tối và VI/EN.
  - Console không lỗi.
- **Trước tuần 7, mỗi môn:**
  1. Làm 1 đề "Giữa kỳ" thử.
  2. F5 giữa bài.
  3. Nộp bài, xem lại câu sai.
  4. Mở bản in đề.

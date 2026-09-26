# PROGRESS.md — Trạng thái bàn giao giữa các phiên

> Claude cập nhật sau MỖI bước con. Phiên mới đọc file này trước tiên.

## Trạng thái hiện tại
- Nhánh: chỉ còn `main` (2026-09-25 gom hết nhánh cũ). Phiên mới làm trên nhánh `claude/<việc>` rồi gộp vào main qua PR, xong thì xoá nhánh.
- **Phase 1, 2, 3 xong** (Logic) · LinAlg có ngân hàng câu (D24) · mục Công cụ (D25) · câu khái niệm bằng Gemini (D27).
- Chạy: app "Ôn tập" (⌘ Space) hoặc `cd ~/Claude_projects/CAU_Math && npm run dev` → http://localhost:5180.

## Phiên 2026-09-25 (26) — Lịch 01/09 + chương đang học theo việc làm thật (D43)
- Người học: lớp dạy khác thứ tự syllabus, học kỳ bắt đầu 01/09; ưu tiên sửa hết lỗi quan trọng trước khi làm tính năng mới.
- Tuần học tính từ 01/09 (giữa kỳ 20/10). Gợi ý luyện, đề thi mặc định, chương mặc định ở Học/Luyện tập nay lấy từ các chương
  Người học đã làm câu (Discrete: 1, 2, 4, 8 — có Đồ thị), không đoán theo syllabus. Trang Tổng quan bỏ "tuần này học gì". 1017 test.
- D44: bộ kiểm độc lập cho cả 25 dạng tính toán LinAlg (dò từng bước khử). Bắt được lỗi thật: câu "hệ có mấy nghiệm" 3 ẩn
  có thể mất hẳn z trên đề — đã sửa. 1044 test.
- D45: bộ kiểm độc lập Logic Ch1/Ch3/Ch4. Bắt được: dạng don't care có câu không có ô d — đã sửa. Phân tích mạch nay có
  bảng chân trị trong lời giải. 1074 test.
- D46: bộ kiểm độc lập Discrete D2–D8 ⇒ mọi dạng tính toán của cả 3 app đã có kiểm độc lập. Câu "không đẳng cấu" nay luôn nêu
  bất biến dò được. 1103 test.

### Việc tiếp theo (thứ tự người học duyệt: lỗi trước, tính năng sau)
1. Mã câu (dạng + hạt giống) hiện trên câu để tái hiện đúng câu người học báo lỗi; làm lại đúng câu sai.
2. Một test hợp đồng chung cho mọi ngân hàng câu; gom 3 bộ đọc số làm một.
3. Dọn quy trình: rút gọn PROGRESS.md, quy tắc chống trùng số quyết định giữa các phiên.

## Phiên 2026-09-25 (25) — sqrt(x) + đề thi thử trộn (D42)
- Ô đáp án LinAlg nhận sqrt(10), 2sqrt(3), 1/sqrt(5), vector có căn; máy tính Nháp thêm sqrt, ^, π, lượng giác theo độ.
- Thi thử: câu xáo trộn, không hai câu cùng dạng liền nhau. 1016 test. Đã xem thật: gõ sqrt(81) được chấm đúng; Nháp tính acos(…) ra độ.

### Việc tiếp theo
1. Người học làm tiếp LinAlg Ch1 (đề mới sẽ trộn), góp ý.
2. Mở rộng bộ kiểm độc lập (D41) sang LinAlg (độ dài, góc, tổ hợp tuyến tính) và Logic Ch1.
3. LinAlg: soát phạm vi giữa kỳ (2.4–2.7, 3.6).

## Phiên 2026-09-25 (24) — Lời giải có bảng chân trị + kiểm độc lập (D41)
- Người học thấy bảng nháp lệch lời giải ở câu tương đương D1: cả hai đúng, chỉ khác thứ tự dòng. Nay lời giải vẽ bảng thật (D1, Logic Ch2),
  và đáp án + từng ô bảng được một bộ tính viết riêng kiểm lại trên 300 câu mỗi dạng. 1012 test.
- Đã xem thật: câu tương đương D1 (tô đỏ đúng 2 dòng khác nhau), câu Σm Logic (tô dòng F = 1).

### Việc tiếp theo
1. Người học làm lại D1/Logic Ch2 xem bảng lời giải có dễ dò không.
2. Mở rộng bộ kiểm độc lập sang các dạng tính toán khác (Ch1 đổi cơ số, số bù; D6–D7 gcd, mod; LinAlg khử Gauss).
3. LinAlg: soát phạm vi giữa kỳ (2.4–2.7, 3.6).

## Phiên 2026-09-25 (23) — Không ra câu lặp (D40)
- Người học báo: lượt 10 câu trắc nghiệm D2 và Logic có câu trùng 100%. Gốc: câu khái niệm có thứ tự xáo trong chữ ký chống lặp.
- Sửa chữ ký + lượt tự ngắn lại khi kho nhỏ (báo rõ "chỉ có n câu khác nhau") + kho lớn hơn (D2 21 mẫu, D4 11 tổng,
  50 câu khái niệm Discrete, 12 Logic). Test chặn hồi quy trên mọi ngân hàng. 1000 test.
- Đã xem thật D2: "Khái niệm" 7/7 câu khác nhau, cả chương 10/10.

### Việc tiếp theo
1. Người học làm lại D2 và Logic xem còn gặp câu lặp không; góp ý các câu khái niệm mới.
2. LinAlg: soát phạm vi giữa kỳ (2.4–2.7, 3.6).
3. D9 ghép cặp / D10 cây khung khi lớp học tới.

## Phiên 2026-09-25 (22) — Logic Ch4 Mạch tổ hợp (D39) · gom mọi nhánh về main
- Làm trên nhánh `claude/logic-ch4`, nay đã gộp; repo chỉ còn nhánh `main` (người học yêu cầu 2026-09-25). Bài học VI/EN 15 thẻ (§4.1–4.11), 10 dạng câu có lời giải từng bước + chẩn đoán lỗi hay gặp,
  trắc nghiệm, vào Thi thử (phạm vi giữa kỳ tuần 8 giờ gồm Ch4). Hình mạch nhiều mức SVG. 953 test.
- Đã xem thật: thẻ phân tích mạch có ví dụ mẫu, câu MUX (gõ sai kiểu đổi z/z′ ⇒ báo đúng lỗi), câu tràn số, Thi thử có Ch4.

- Công cụ Ch4 (Công cụ → Mạch tổ hợp): bộ cộng–trừ đi từng bit (C, V, đọc không dấu/có dấu), hàm bằng MUX/decoder.
  Đã xem thật VI/EN: 7 + 3 (tràn), 5 − 7, ví dụ MUX của sách, hàm 4 biến, ô nhập sai; console sạch.

### Việc tiếp theo
1. Người học dùng thử đồng bộ 2 máy (D37) và học thử Ch4, D8, câu khái niệm Discrete; góp ý.
2. LinAlg: soát lại phạm vi giữa kỳ (2.4–2.7, 3.6) còn thiếu dạng nào.
3. D9 ghép cặp / D10 cây khung khi lớp học tới.

## Phiên 2026-09-25 (21) — Đồng bộ 2 laptop qua thư mục đám mây (D37)
- Nhánh `claude/gracious-shannon-dwgx2r` dựng lại từ main (PR cũ đã gộp). Không deploy: máy chủ Vite ghi
  `CAU_Math-sync/<máy>.json` vào iCloud Drive / Google Drive / OneDrive / Dropbox (tự tìm, hoặc `STUDY_SYNC_DIR` trong `.env`).
- Gộp: nhật ký làm bài hợp đa tập (không mất câu nào), lịch sử thi hợp theo ts, còn lại bản mới nhất thắng. Mở trang / quay lại
  tab ⇒ lấy về (có mới thì tải lại trang); 10 giây / rời tab ⇒ gửi lên. Nút mây cạnh nút sáng/tối (chấm xanh = đã đồng bộ).
- Đã chạy thật: 2 trình duyệt riêng (như 2 máy) chung một thư mục — máy B mở là nhận nhật ký + thẻ đang học + ngôn ngữ của A;
  A quay lại tab thấy câu B vừa làm; console sạch. 919 test.
- **Người học cần làm trên mỗi máy:** `git pull && npm install`, mở app như thường. Hai máy phải cùng một dịch vụ đám mây
  (máy có cả iCloud lẫn Google Drive: tạo sẵn thư mục `CAU_Math-sync` ở dịch vụ muốn dùng là app chọn chỗ đó).

## Phiên 2026-09-25 (20) — Câu khái niệm Discrete (D36)
- Nhánh `claude/discrete-concepts` từ main. 25 câu khái niệm VI/EN cho D1–D8 (phương pháp chứng minh, tìm lỗi chứng minh,
  bẫy hay gặp) ⇒ Luyện tập mỗi chương có thêm dạng "Khái niệm (vì sao?)". Đã xem thật VI/EN: chọn sai hiện vì sao sai từng phương án.
- Luật mới trong `validateItem`: phương án đúng không được dài hơn hẳn (trước đây 19/25 + 4/9 câu Logic lộ đáp án theo độ dài).

### Việc tiếp theo
1. Người học học thử D8 + câu khái niệm, góp ý.
2. Logic Ch4 — Mạch tổ hợp (Phase 6, trước giữa kỳ tuần 8).
3. D9 ghép cặp / D10 cây khung khi lớp học tới.

## Phiên 2026-09-25 (19) — Discrete D8 Đồ thị (D35)
- Người học: trên lớp đang học graph theory ⇒ làm chương D8 (tuần 9 syllabus): bài học VI/EN 10 thẻ, 10 dạng câu có hình SVG,
  lời giải từng bước (BFS, Havel–Hakimi, Aᵏ, chu trình lẻ, song ánh), công cụ "Sân chơi đồ thị". 898+ test.
- Đã xem thật: công cụ, câu đẳng cấu (kiểm tay song ánh), câu hai phía, ví dụ mẫu có ma trận lưới; VI/EN, sáng/tối.

### Việc tiếp theo
1. Người học học thử D8, góp ý (hình đồ thị có dễ đọc không, đề có sát đề lớp không).
2. D9 ghép cặp (Hall, stable marriage) / D10 cây khung nhỏ nhất khi lớp học tới.
3. Câu khái niệm Discrete bằng Gemini (chọn phương pháp chứng minh, tìm lỗi chứng minh).

## Phiên 2026-09-25 (18) — Công cụ Discrete (D34)
- Nhánh `claude/discrete-tools` từ main. Mục **Công cụ** cho Discrete: bảng chân trị tự dựng (so F với G), Euclid & Pulverizer
  bấm từng dòng, lũy thừa mod bình phương liên tiếp, sân chơi RSA. Đã xem thật 1440×900 VI/EN, sáng/tối, console sạch.
- Sửa kèm: `modPow` báo lỗi thay vì trả số sai khi n quá lớn; số "0" lạc ở màn Công cụ.
- LinAlg: ma trận trong lời giải + dòng "Đáp án" vẽ dạng lưới có ngoặc, ma trận mở rộng có vạch `|` (`splitMatrices` ở
  `shared/logic/steps.js`, vẽ trong `mathSpan` của `shared/ui/question.js` — một chỗ cho mọi lời giải, ví dụ mẫu, phương án).

### Việc tiếp theo
1. Người học học thử Discrete + công cụ mới, góp ý.
2. Câu khái niệm Discrete bằng Gemini (chọn phương pháp chứng minh, tìm lỗi chứng minh) + nối `withConcepts`.

## Phiên 2026-09-24 (17) — Discrete đủ D1–D7 (D33)
- Người học: chưa thấy Discrete chạy (máy người học ở nhánh `upgrade/three-apps`) ⇒ gộp PR #4 vào main; người học cần
  `git checkout main && git pull && npm install` rồi mở lại app "Ôn tập". Đã thử từ bản clone sạch của main: chạy đúng.
- Thêm D2 (lượng từ), D3 (tập hợp & hàm), D4 (quy nạp), D5 (bất biến & quy nạp mạnh): lõi `quant.js`, 10 dạng câu mới, bài học
  VI/EN có ví dụ mẫu + tự làm + cạnh tiên quyết. Đã xem thật: đủ 23 điểm kiến thức, mọi dạng mở được, không lỗi. 876 test.

### Việc tiếp theo
1. Người học học thử Discrete, góp ý chỗ khó hiểu (Discrete là môn yếu nhất ⇒ ưu tiên).
2. Công cụ trực quan Discrete: Euclid/Pulverizer bấm từng bước, sân chơi RSA theo RSA.py, bảng chân trị tự dựng.
3. Câu khái niệm Discrete bằng Gemini (chọn phương pháp chứng minh, tìm lỗi chứng minh) + nối `withConcepts`.
4. LinAlg: in ma trận dạng lưới trong lời giải.

## Phiên 2026-09-24 (16) — Refactor DRY đo trước (D31) + Discrete Math D1, D6, D7 (D32)
- Gộp PR #3 vào main; nhánh phiên dựng lại từ main (PR #4).
- Đo jscpd: trùng nguyên văn 0,23%; gom hàm tạo DOM (7 bản) + dòng lời giải `L` (6 bản), bỏ hàm chết; dừng theo lời người học.
- **App Discrete Math** (`/discrete/`): 3 chương D1 (5 dạng), D6 (3 dạng), D7 (5 dạng), bài học VI/EN có ví dụ mẫu + tự làm
  + đồ thị tiên quyết (cả cạnh liên chương D7 → D6), Luyện tập theo nhóm, Thi thử, trang tổng quan chung nhận môn thứ ba. 861 test.

## Phiên 2026-09-24 (15) — Gộp cho gọn (D30)
- Menu còn 4 mục: Thi thử thành thẻ "Bài full 60–90 phút" trong Luyện tập. Luyện tập theo nhóm chủ đề (Logic 26 dạng → 9 nhóm,
  LinAlg 25 → 8), màn làm bài có thanh chọn từng dạng trong nhóm. data-needs cho LinAlg (13 cạnh). 829 test.

## Phiên 2026-09-24 (14) — Cây + đồ thị tiên quyết (D29)
- Trang Học: mục lục cây thu gọn (chương → thẻ, chấm xanh = đã nắm, thanh %), nút "Học tiếp: …".
- `data-needs` trong bài học Logic (24 điểm, 25 cạnh) + `shared/logic/prereq.js` (dựng đồ thị, tìm chu trình, tô-pô, gốc yếu, học tiếp).
- Câu sai: thêm "Có thể gốc ở: <thẻ tiên quyết> (đúng x%)"; Thi thử: dạng yếu mở thẻ gốc; Tổng quan: "Học tiếp".
- CLAUDE.md: tự quyết không hỏi lại; usage ~95% ⇒ commit + push ngay (phiên dừng thì người học dùng opencode); push lên nhánh phiên.
- Đã xem thật (Học dạng cây, gốc lỗi ở câu SOP khi ô K-map yếu). 824 test.

### Việc tiếp theo
1. ~~data-needs cho LinAlg~~ — xong (13 cạnh, test canh không chu trình, VI = EN).
2. Discrete Math (khung app + D1–D7).
3. LinAlg: in ma trận dạng lưới trong lời giải từng bước.

## Phiên 2026-09-24 (13) — K-map rút gọn từng bước + trang Công cụ gọn (D28)
- Gộp `upgrade/three-apps` vào nhánh phiên (người học cho phép); giới hạn 2 milestone/phiên thành khuyến nghị (CLAUDE.md, PLAN.md).
- Công cụ K-map làm lại: một thẻ hai cột (bản đồ | kết quả + các bước), nhập Σm/ΠM hoặc biểu thức, bước khai triển term → minterm,
  mỗi nhóm nói ô nào, biến nào bị khử, vì sao chọn; SOP | POS. `kmap-walk.js` (+ test), bỏ `kmap-explain/steps/state.js`.
- Trang Công cụ: mỗi chương một dòng, ví dụ giải sẵn gom một link; tên công cụ Ch1–2 rút ngắn.
- Đã xem thật 1440×900 sáng/tối, VI/EN, cả Logic lẫn LinAlg; console không lỗi. 815 test.

## Phiên 2026-09-24 (12) — Câu khái niệm do Gemini soạn (D27)
- `npm run gen -- --subject logic [--chapter ch2 | --section 1.5] [--n 8] [--calls 3] [--dry]` → hàng chờ;
  `npm run gen:review -- --subject logic` → giữ/bỏ từng câu → `logic/src/content/concepts.json`. Khoá: chép `.env.example` → `.env`.
- Kiểm 3 lớp: schema → `validateItem` + lọc trùng → `check` chạy lại bằng hàm giải của app. Test giả lập Gemini (không cần mạng).
- App: dạng "Khái niệm (vì sao?)" ở Luyện tập/Thi thử; 9 câu mẫu soạn tay. Đã xem thật: phương án xếp dọc, chọn sai hiện vì sao sai.
- **Chưa chạy Gemini thật** (container không có khoá). Người học chạy lần đầu: `npm run gen -- --subject logic --dry` xem prompt,
  rồi bỏ `--dry`. Nếu Gemini hay bị loại một lỗi → chỉnh `scripts/gen/prompt.js`.

## Phiên 2026-09-24 (11) — Phase 3: bài học theo điểm kiến thức (D26)
- Thẻ có `data-check` = điểm kiến thức: **ví dụ mẫu** bấm "Bước tiếp" hiện từng dòng (dùng `q.work` của D23, đề tự sinh, "Ví dụ khác")
  → **tự làm** tới khi đúng 2 câu liên tiếp (sai: "Xem thêm một ví dụ"; qua: "Thẻ tiếp: …").
- `shared/logic/knowledge.js` (+ test), `shared/ui/kpoint.js`; bộ chạy có chế độ chuỗi (`goal`), nhật ký ghi `tag`.
- Nhãn mới: đổi cơ số `toDec`/`fromDec`/`group`, ô K-map `n3`/`n4` ⇒ mỗi thẻ luyện đúng kiểu câu của nó.
- K-map SOP/POS/don't care có hình trong ví dụ, cuối ví dụ vẽ sẵn các nhóm; XOR cuối ví dụ hiện bản đồ đáp án.
- Mục Học: "k/n điểm kiến thức đã nắm"; chấm tiến độ tô xanh thẻ đã qua; luyện một dạng có link "Học dạng này".
- Đã chạy thật 1440×900 sáng/tối, VI/EN: đủ 28 điểm ở 3 chương, console không lỗi.
- Vướng nhỏ: đổi ngôn ngữ giữa chừng thì khối quay về ví dụ mẫu (mất chuỗi đang làm; nhật ký vẫn giữ).
## Phiên 2026-09-24 (11a, nhánh upgrade/three-apps) — Linear Algebra có ngân hàng câu (D24)
- Trang Tổng quan: tên môn là link mở môn (bỏ nút "Mở môn").
- Linear Algebra: 25 dạng câu §1.1–3.6, tự luận + trắc nghiệm, chẩn đoán lỗi, lời giải từng bước, ô nhập ma trận dạng lưới;
  Thi thử dùng được luôn. Bỏ trang luyện tập cũ.
- Nháp: DEC là máy tính thường (thập phân, chia thật); BIN/OCT/HEX giữ chia nguyên.
- Mục "Công cụ" trên menu (D25) — K-map, vector… mở thẳng; sửa chip K-map bị CSS trang Tổng quan đè.
- Discrete Math: chưa bắt đầu (chưa tạo file nào).

### Việc tiếp theo (theo thứ tự)
1. **K-map tính từng bước (người học yêu cầu 2026-09-24).** Ở công cụ K-map (Logic → Công cụ → Ch3): nhập hàm theo CẢ HAI cách —
   dạng minterm `F = Σm(0, 1, 3, …)` và dạng tên biến `F = x′y + wz′ + …` — rồi hiện quá trình biến đổi TỪNG BƯỚC tới kết quả:
   biểu thức → các minterm (khai triển từng term thiếu biến, vd x′y = x′y(z + z′)) → điền ô K-map → khoanh nhóm (ô nào, biến nào
   đổi bị khử) → ghép SOP/POS tối giản; song song là rút gọn đại số từng bước (x·y + x·y′ = x). Tận dụng `steps-ch2.js`
   (`mergeLine`), `steps-ch3.js` (`groupLine`), `expr-parser.js`, `quine-mccluskey.js`; khung "Giải thích từng bước" hiện có ở
   `logic/src/ui/kmap-steps.js` chỉ đi qua các nhóm — mở rộng thành chuỗi biến đổi đầy đủ.
2. Discrete Math: khung app (`discrete/index.html`, `src/{main.js,i18n,content,pages,logic}`, `SUBJECTS.discrete.chapters` +
   mã chương ở `syllabus.js`) + ngân hàng câu D1–D7 (tính toán: bảng chân trị, gcd/Euclid, nghịch đảo mod, RSA → tự luận;
   chứng minh/lượng từ → trắc nghiệm trước).
3. Cải thiện tiếp các công cụ trực quan theo góp ý của người học.

## Phiên 2026-09-24 (10) — Lời giải từng bước cho mọi câu (D23)
- `steps-ch{1,2,3}.js`: 28 dạng đều có lời giải từng bước, hiện cả khi đúng.
- Menu trái: VI/EN + sáng/tối lên đầu; bấm tên app ⇒ trang Tất cả môn (bỏ link riêng, vì Tổng quan đã có mục riêng).
- Nháp: máy tính đổi cơ số (BIN/OCT/DEC/HEX, + − × ÷ %, ngoặc; `shared/logic/calc.js`, không eval) + hàng ký hiệu Σm( ΠM( ′ ⊕ · → ≠.
- Câu Σm/ΠM: ghi rõ "không cần gõ Σm/ΠM — app tự ghép" (các câu đó vốn trả lời bằng bấm dòng/ô). 759 test.

## Phiên 2026-09-24 (9) — Đề rõ ràng, không lặp, có trắc nghiệm (D22)
- Người học: không hiểu đề hỏi gì; cổng logic lặp; muốn thêm trắc nghiệm khó ngang tự luận; tham khảo đề trong giáo trình. Đã khảo sát Mano (RESEARCH.md).
- Xong: `question-pool.js` (không lặp), cổng 2/3 ngõ vào, NAND ngẫu nhiên, XOR 48 kiểu; đề 28 dạng viết lại + dòng "Trả lời: …";
  trắc nghiệm 4 phương án (nhiễu = lỗi thật, oracle chấm tự luận) + thanh "Tự luận | Trắc nghiệm" ở Luyện tập. 752 test.
- Canvas Gemini `hedemtrucquan.html` (người học gửi): công cụ nhập-một-số-xem-tất-cả (đổi cơ số + phân tích vị trí, đường ống bù 1 → +1 → bù 2,
  giải phẫu bit số có dấu, khối BCD, XOR Gray). App đã có 9 công cụ tương tự ở Học → Chương 1; điểm đáng học: bố cục MỘT ô nhập → kết quả
  hiện ngay cạnh nhau. Chưa làm.
- Chưa làm: trắc nghiệm trong Thi thử; "vì sao" / "hai cách" kiểu Mano; đề cho Linear, Discrete khi tới Phase 4–5.

## Phiên 2026-09-24 (8) — Sửa sai có hướng dẫn + nối bài tập ↔ bài học (D21)
- Người học làm Hệ đếm, sai mà không biết sai chỗ nào. Nay: chẩn đoán lỗi (`ch1-help.js`), các bước tính dưới lời giải,
  link "Ôn lại: <thẻ>" cho mọi dạng sai; mục tiêu học tập đầu mỗi chương. 673 test.
- Lưu ý: hai lần ghi tệp bằng lệnh Python nhanh làm hỏng/cắt tệp (`open(p,'w').write(open(p).read()…)` cắt về 0 byte —
  test không phát hiện vì không phủ `screens.js`). Đã khôi phục từ git; kiểm tra bằng `vite build`.
- Ch2 + Ch3 cũng chẩn đoán chỗ sai (dòng chân trị lệch, cổng chọn nhầm, minterm thiếu/thừa, nhầm min/max).
- Tiếp theo: `work` từng bước cho Ch2/Ch3 và chẩn đoán nhóm K-map, rồi Phase 3.

## Phiên 2026-09-24 (7) — Phase 2: Bài full 60–90 phút (D20)
- `shared/logic/exam.js` (dựng đề, chấm, đếm, đồng hồ) + test; `shared/ui/question.js` (vẽ một câu, dùng
  chung với runner); `exam-screen.js` (chọn đề, kết quả), `exam-run.js` (phòng thi), `style/exam.css`.
- Chọn đề: chương (ô đánh dấu, mặc định phạm vi giữa kỳ) · 60/75/90 phút · Thi thử / Bài tập dài.
  Bài đang dở thì màn chỉ còn "Làm tiếp" + "Bỏ bài này". 5 lần gần nhất ở cuối.
- Đã chạy thật: gõ + Enter sang câu, widget K-map giữ lựa chọn, gắn cờ, F5 (đúng câu, đúng giờ, giữ chữ đang
  gõ), hộp xác nhận nộp, hết giờ tự nộp, kết quả + xem lại câu sai, bài dài chấm từng câu, sáng/tối,
  LinAlg (chưa có ngân hàng) hiện lời mời sang Luyện tập.
- Sửa lỗi của D19: class danh sách `.row` đè hàng nút `.row` ở trang công cụ → đổi thành `.entry`.
- Vướng: LinAlg/Discrete chưa có ngân hàng câu nên chưa có bài full (Phase 4, 5).

## Phiên 2026-09-24 (6) — Phase 1 (tiếp): làm lại lớp hiển thị (D19)
Người học: "như toeic quá nhiều option, hơi xấu; chỉ làm máy tính; còn lại tự quyết, tôi góp ý UX-UI".
- Bảng màu + chữ mới, bỏ bản điện thoại. Luyện tập: thanh chương + bảng dạng; Học: mỗi chương một dòng;
  Tổng quan: dải học kỳ + một việc chính + một dòng số liệu. Đã xem thật 1440×900 sáng/tối.

## Phiên 2026-09-24 (5) — Khảo sát UX + Phase 1: Khung giao diện theo việc (D16–D18)
Người học: "UX-UI giống toeic-app; giảng bài, giao bài cho chọn dạng hoặc bài full 60–90 phút; tìm thêm web ngoài".
- Khảo sát: toeic-app (chạy thật + mã + D36–D67), Khan Academy, Math Academy, Brilliant, Bluebook, GOV.UK,
  Dunlosky 2013, Renkl (fading) → `RESEARCH.md`. Người học chốt: menu theo việc; bài full cho chọn 2 chế độ.
- Khung mới: `shared/ui/{router,screens,choices,home-screen,store}.js`, `shared/logic/{route,progress}.js`;
  token + shell theo toeic; trang chương cũ bỏ tab con, router bật đúng khung. `syllabus.js` chuyển vào
  `shared/logic/` (+ `daysToMidterm`, `chaptersUpTo`). Mỗi dạng có `SECONDS`. Bộ chạy ghi nhật ký; thẻ học nhớ vị trí.
- Trang tổng quan chung `/` cùng phong cách, đọc nhật ký cả 3 môn.
- Sửa kèm: class `.side` của khung đụng `.side` trong trang LinAlg → đổi thành `.appnav`.
- Đổi tên: thư mục `~/Claude_projects/CAU_Math`, remote `huybndc/CAU_Math`; README viết lại.
- Đã xem thật 1280×800 + 390×844, sáng/tối: Tổng quan, Học, Luyện tập, làm bài, công cụ K-map, LinAlg.
- `shared/ui/exam-screen.js` đang là chỗ giữ chỗ cho Phase 2.

## Phiên 2026-09-24 (4) — Khởi động nhanh
- `scripts/make-launcher.sh` (`npm run launcher`) tạo `~/Applications/Ôn tập.app` (AppleScript): máy chủ tắt →
  chạy vite ngầm + mở trình duyệt; đang chạy → hỏi Mở / Tắt máy chủ.
- Sửa lỗi người học gặp: bản đầu viết `cd … && nohup vite … &` ⇒ cả cụm chạy nền giữ ống xuất của `do shell script`
  ⇒ app treo, không mở trình duyệt. Đổi thành `cd … && (nohup vite … &)`. Đã thử lại: app thoát sau ~1 s,
  vite chạy độc lập (cha = launchd), trang trả 200. (Lần thử đầu báo nhầm "app đã thoát" vì `pgrep` theo tên
  có dấu không khớp tên file dạng NFD — giờ kiểm theo `Contents/MacOS/applet`.)
- Repo GitHub đổi tên thành `huybndc/CAU_Math`; theo người học, thư mục trên máy cũng đổi `Claude_pj` → `~/Claude_projects/CAU_Math`,
  remote trỏ thẳng `https://github.com/huybndc/CAU_Math.git`. Tên `Claude_pj`/`Claude_projects` không còn dùng.

## Phiên 2026-09-24 (3) — Đề tương tác + nháp (D14–D15)
Người học: "đề chủ yếu vẫn là text, độ tương tác vẫn thấp… câu hỏi cũng cảm giác chưa tối ưu… có phần nháp được không?"
- **Widget trả lời** (`q.input`): `shared/ui/widgets.js` (dãy bit, bảng chân trị bấm ô F / bấm dòng, ô min–max,
  chọn tập chỉ số) + `logic/src/ui/kmap-widgets.js` (**khoanh nhóm trên K-map → biểu thức tự hiện**, bấm ô).
  Widget trả đúng chuỗi mà `checkAnswer` vốn nhận ⇒ phần chấm và 200-seed test không đổi.
- Logic: 20/28 dạng giờ trả lời bằng thao tác (đổi cơ số/số bù: chỉ khi đáp án là nhị phân). Thêm 2 dạng: **ký hiệu cổng → bảng chân trị**, **mạch AND–OR
  (SVG) → bảng chân trị**. "Nhận diện cổng" chọn giữa 4 KÝ HIỆU cổng (tên hiện sau khi trả lời). Ô K-map:
  thêm chiều ngược "bấm vào ô của m7". XOR: bấm ô trên K-map (thấy hình bàn cờ).
- Hình + widget đặt cạnh nhau; biểu thức in nghiêng STIX Two như sách, `x'` hiện thành `x′`.
  Sau khi chấm: ô đúng / bỏ sót (viền xanh nét đứt) / chọn thừa (đỏ).
- Bỏ khu "Tự khoanh nhóm" cũ ở tab Luyện tập Ch3 (widget K-map thay nó) + 32 khoá `prac.*` không còn dùng.
- **Nháp** (`shared/ui/scratch.js`): nút góc phải → ngăn ghi chú giấy kẻ dòng, font đều, tự lưu theo môn.
- Đã xem thật 1280×800 + 390×844, sáng/tối, VI/EN; console không lỗi; LinAlg vẫn chạy.

## Phiên 2026-09-24 (2) — Nội dung Logic Circuit (D11–D13)
Người học: "nội dung vẫn là một mớ lý thuyết rất dài và thực hành bài tập không có mấy" ⇒ dồn sức vào nội dung.
- **Luyện tập (C1):** `shared/ui/runner.js` + `answer-format.js` + `shuffle.js`. Logic từ 7 lên **26 dạng**:
  Ch1 10 dạng, Ch2 9 dạng, Ch3 7 dạng (có K-map kèm đề, chấm cả độ tối giản). Bỏ 2 trang practice cũ.
  Test tính chất `logic/tests/generators.test.js` (mọi dạng × 200 seed + khoá chữ VI/EN).
- **Thẻ học (C2):** `shared/ui/lesson.js` + `shared/logic/cards.js`. Viết lại lý thuyết Logic VI/EN:
  Ch1 16 thẻ (thêm số bù, trừ bằng số bù, số có dấu, tràn số, Gray), Ch2 14 thẻ (ví dụ Mano 2.1–2.2,
  dạng chuẩn, SOP/POS hai mức, NAND), Ch3 12 thẻ (thêm don't care, NAND/NOR, XOR). Thẻ dài nhất 80 chữ.
  Ví dụ Mano 3.1/3.5/3.8/3.9 đã kiểm bằng bộ giải QM. Linear Algebra cũng hiện dạng thẻ (nội dung cũ, chưa rút gọn).
- Đã xem thật 1280×860 và 375×812: làm câu K-map (bị bắt "chưa tối giản" đúng), trắc nghiệm bằng phím số,
  màn tổng kết lượt, thẻ học có câu thử nhanh.

### Bước tiếp theo — nội dung Linear Algebra
1. Bộ sinh đề: nâng ch1–3 (hiện 4 dạng/chương) theo hợp đồng mới + thêm chương **2.4–2.7** (phép toán ma trận,
   nghịch đảo, LU, chuyển vị) và **3.6** (bốn không gian con) — cả hai thi giữa kỳ.
2. Viết lại lý thuyết LinAlg thành thẻ ≤ 120 chữ (test hiện chỉ áp cho Logic; bật cho LinAlg khi viết xong).
3. Sau đó: app Discrete (D0 + D1).

## Phiên 2026-09-24 — S1: làm lại giao diện (D08–D10)
- Khung mới cho cả 2 app: rail chương màu của môn (đường tín hiệu), topbar tiêu đề chương, tab mục con,
  nút VI/EN + sáng/tối ở chân rail; điện thoại: rail thành dải ngang.
- `shared/style/{tokens,base,shell,app}.css`; `style.css` của app chỉ còn phần riêng của môn.
- 29 đoạn chữ hướng dẫn → nút ⓘ (popover); ký tự-icon → SVG; bỏ footer dev và phụ đề.
- Định tuyến `#/chN/tab`; canvas linalg vẽ lại khi đổi sáng/tối (sự kiện `themechange`).
- Trang Tổng quan `/`: dải 16 tuần + "tuần này học gì" theo syllabus (`home/`).
- Đã xem thật: 1280×800 + 375×812, sáng + tối; popover ⓘ đúng vị trí; không lỗi console mới.
- Chưa làm trong S1 (để S4): tab Lý thuyết vẫn là bài dài — S4 đổi thành thẻ học.

## Phiên 2026-09-23 — S0: gom repo, tách `shared/`
- `project_kmap/` → `logic/`, `project_linalg/` → `linalg/` (`git mv`, giữ lịch sử).
- `shared/`: `ui/chapter-nav.js`, `ui/theory-page.js`, `ui/dom.js` (`$`), `logic/app-error.js`,
  `i18n/index.js` (lõi, nhận từ điển qua `initI18n`), `vite-plugin-include.js` (tính đường dẫn theo
  thư mục file HTML — D04). Import bằng bí danh `@shared`.
- Một `package.json` + `vite.config.js` ở gốc; bỏ `vite-plugin-singlefile` (D03); cổng 5180 strictPort.
- `index.html` gốc = trang Tổng quan tạm (3 thẻ link), S5 sẽ thay bằng dashboard thật.
- Đã kiểm trên trình duyệt: 24 mục con (2 app × 3 chương × 4 tab) hiện đủ nội dung, canvas vẽ được,
  console không lỗi.
- Tài liệu gốc mới: `CLAUDE.md`, `PLAN.md`, `DECISIONS.md` (D01–D07), `README.md`.



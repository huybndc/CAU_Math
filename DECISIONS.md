# DECISIONS.md — Nhật ký quyết định

Mỗi quyết định: nội dung, lý do, đánh đổi chấp nhận. Muốn đổi → thêm mục mới "Thay D0x", không xoá mục cũ.
Khuôn học theo `toeic-app` (chỉ tham khảo, không dùng chung code hay repo).

Quyết định cũ vẫn còn hiệu lực của từng app: `logic/PLAN_v3.md` (tên biến theo Mano, kết quả trước
dữ liệu thô, giải thích từng bước là một dòng `F = …`), `linalg/PLAN.md` (tự vẽ 3D trên Canvas 2D,
không dùng Three.js).

**D01. Ba app riêng, MỘT máy chủ, có trang Tổng quan chung (phương án B).** (Người học chốt 2026-09-23)
- `/logic/`, `/linalg/`, `/discrete/` là ba trang độc lập (DOM, từ điển, trang riêng), phục vụ bởi một
  máy chủ Vite ở gốc repo, cổng 5180. `/` là Tổng quan.
- Đã so với A (3 app, 3 cổng) và C (gộp 1 app):
  - A: mỗi cổng là một origin, localStorage tách rời → không có chỗ xem tiến độ cả 3 môn.
  - C: hai app cũ trùng 48 id HTML và trùng khoá dịch (`c1q.*`, `nav.ch1`) → phải đặt lại tên hàng loạt
    hoặc nạp từng môn một; một môn lỗi kéo cả trang.
  - B giữ được sự độc lập của A, lại chung origin nên Tổng quan đọc được tiến độ cả 3 môn — có ích vì
    cả 3 môn thi giữa kỳ cùng tuần 8.
- Đánh đổi: localStorage chung nên khoá phải có tiền tố/trường `subject`.

**D02. Phần dùng chung ở `shared/`, một `package.json` ở gốc.**
- Hai app cũ có 5 file y hệt nhau (`chapter-nav`, `theory-page`, `app-error`, plugin include, script
  đếm dòng) và lõi i18n chỉ lệch tên khoá lưu. Gom về `shared/`, import qua bí danh `@shared`.
- Một `node_modules` cho tất cả thay vì mỗi app một bộ; `npm test` ở gốc chạy test mọi app.
- Lõi i18n nhận từ điển qua `initI18n({vi, en})`; `src/i18n/index.js` của mỗi app chỉ nạp rồi re-export,
  nên các trang không phải sửa import.

**D03. Chỉ chạy localhost — bỏ `vite-plugin-singlefile` và cách mở bằng `file://`.**
- Người học chỉ cần localhost. Mở bằng `file://` là một origin khác → tiến độ bị tách làm hai nơi.
- `strictPort: true`: cổng bận thì báo lỗi chứ không lặng lẽ nhảy sang 5181 (sẽ thấy tiến độ trống).

**D04. Plugin include tính đường dẫn theo thư mục của file HTML.**
- Bản cũ lấy `process.cwd()`; khi máy chủ chạy ở gốc repo thì `src/pages/ch1.html` trỏ sai chỗ.

**D05. Nội dung bám syllabus từng môn; tự diễn đạt lại, ghi nguồn; không commit tài liệu môn học.**
- Repo `huybndc/CAU_Math` là public. Không đưa slide, PDF, syllabus, hay đoạn chép nguyên văn
  sách vào repo (cùng tinh thần D17 của toeic-app).
- Discrete Math: sách chính MCS bản 2017 (theo syllabus), phần nền lấy từ slide Rosen Ch.1–2 của GV thứ hai.

**D06. Không làm:** deploy/PWA/tài khoản/máy chủ đồng bộ riêng (đồng bộ qua thư mục đám mây thì có — D37), AI lúc chạy app, streak/huy hiệu (D51 toeic-app),
framework, thư viện animation, thư viện hiển thị toán (Unicode trước; xét KaTeX khi Unicode không đủ).

**D07. Chỉ commit/push trong repo này.** Trước mỗi commit/push kiểm `git remote -v`
(repo đã đổi tên thành `huybndc/CAU_Math` ngày 2026-09-24; thư mục máy `~/Claude_projects/CAU_Math`). Không đụng repo toeic-app.

**D08. Giao diện làm lại theo ý "bàn thí nghiệm" (S1, người học: "đổi mạnh về giao diện").**
- Vùng tương tác là nhân vật chính; chữ lùi về sau. Nền trang xám lạnh, panel trắng, KHÔNG bóng đổ —
  phân cấp bằng nền và khoảng trắng thay vì "bộ thẻ bo góc + bóng mờ" quen thuộc.
- Mỗi môn một màu rail gắn với chất liệu môn: Logic = xanh mặt nạ hàn của mạch in + đường đồng,
  LinAlg = lam (giấy kẻ ô vẽ vector), Discrete = tím.
- Rail vẽ các chương như MỘT đường tín hiệu (nút đánh số vì chương là chuỗi thật); đổi chương thì đoạn
  "có điện" chạy tới nút mới — chuyển động có chủ đích duy nhất của khung.
- Font tự host bằng `@fontsource` (chạy offline): **Be Vietnam Pro** (thiết kế cho dấu tiếng Việt) cho chữ,
  **JetBrains Mono** cho bit/công thức. Khác D59 của toeic-app (bỏ font web vì PWA phải cache offline):
  ở đây chạy localhost, font nằm trong node_modules nên không có vấn đề đó.
- Tên biến CSS cũ (`--panel`, `--ink-dim`, `--accent`…) giữ nguyên, chỉ đổi giá trị — canvas của linalg
  và K-map đọc thẳng các biến này.
- Trang Tổng quan: dải 16 tuần học kỳ (tuần này, giữa kỳ tuần 8, cuối kỳ tuần 16) + "tuần này học gì"
  của từng môn theo syllabus (`shared/logic/syllabus.js`, chỉ ghi tên chủ đề).

**D09. Chữ hướng dẫn thành nút ⓘ + popover (Popover API có sẵn của trình duyệt).**
- 29 đoạn `small muted` trong các trang → `.hint`; `shared/ui/shell.js` biến mỗi đoạn thành popover mở
  bằng nút ⓘ cạnh tiêu đề panel. Phần tử vẫn giữ `data-i18n` nên đổi ngôn ngữ vẫn đúng.
- Ký tự ▶ ◀ ✔ ✘ ⚠ bỏ khỏi từ điển: nút dùng `data-icon`, thông báo dùng `.msg.ok/.bad/.warn` tự vẽ icon SVG.

**D10. Địa chỉ trong app: `#/<chương>/<mục con>`** (`shared/logic/route.js`). Back/Forward, tải lại trang
và link chép ra đều mở đúng chỗ; địa chỉ lạ thì về chương 1. Đổi màn dùng View Transitions (160 ms),
tự tắt khi bật giảm chuyển động.

**D11. Ưu tiên NỘI DUNG trước phần khung còn lại.** (Người học, 2026-09-24: "nội dung vẫn là một mớ lý thuyết rất dài
và thực hành bài tập không có mấy".) Làm trọn một môn (Logic) làm mẫu rồi mới nhân ra các môn khác.

**D12. Luyện tập = một bộ chạy dùng chung + "ngân hàng" câu tự sinh mỗi chương.**
- `shared/ui/runner.js`: lượt 10 câu, chấm ngay, gợi ý, lời giải, lọc theo dạng, màn tổng kết (tinh thần
  `sessionDone` D51 của toeic-app: làm được bao nhiêu → dạng nào yếu → làm gì tiếp). Dạng bài giấu tới khi trả lời
  (D39 toeic-app). Không đọc được đáp án (sai cú pháp) thì báo để sửa, CHƯA tính là sai.
- Mỗi chương: `logic/chN-quiz.js` với `KINDS`, `makeQuestion(kind, rnd)`, `checkAnswer(q, given)`. Đề, gợi ý, lời giải
  là khoá từ điển + tham số (logic/ không biết ngôn ngữ). Hình kèm đề qua `figure` (bảng chân trị, K-map).
- Chấm theo GIÁ TRỊ, không so chuỗi: biểu thức theo bảng chân trị, tập hợp không kể thứ tự, số bỏ đệm 0.
  Câu rút gọn chấm thêm ĐỘ TỐI GIẢN (số literal so với Quine–McCluskey). Câu NAND/bù chấm thêm HÌNH THỨC
  (chép lại đề hay bọc ′ ngoài ngoặc cũng đúng bảng chân trị nhưng không được tính).
- Test tính chất bắt buộc cho mọi dạng: 200 seed, đáp án đúng được nhận, đáp án sửa bị từ chối, khoá chữ đủ VI/EN.

**D13. Lý thuyết = THẺ HỌC, mỗi mục `##` một thẻ, tối đa 120 chữ hiển thị.**
- `shared/ui/lesson.js`: thanh tiến độ bấm được, ← →, "Xem cả chương"; `<details>` cho phần dài;
  `<div data-check="c1q:convert">` = 3 câu thử nhanh ngay trong thẻ; link `#/chN/tab` sang tab thực hành.
- Test canh: mọi thẻ ≤ 120 chữ hiển thị, mọi data-check trỏ tới dạng có thật, mọi link trỏ tới tab có thật.
- Tab "Lý thuyết" đổi tên thành "Học". Nội dung theo mục lục sách (Mano §1.1–3.8), bổ sung phần còn thiếu.

**D14. Trả lời bằng THAO TÁC khi đáp án có hình dạng tự nhiên** (người học, 2026-09-24: "đề chủ yếu vẫn là text").
- Câu hỏi khai báo `input: { type, … }`; bộ chạy vẽ widget thay ô gõ. Widget trả CHUỖI đúng định dạng
  `checkAnswer` đã nhận ⇒ logic/ không biết widget nào, test tính chất vẫn gõ chuỗi như cũ.
- Widget dùng chung ở `shared/ui/widgets.js` (bit, bảng chân trị, ô số, tập chỉ số); widget riêng môn đăng ký
  qua `mountRunner({ widgets })` (Logic: K-map).
- Giữ ô gõ cho đáp án là biểu thức tự do (DeMorgan, dual, NAND) và làm lối phụ trong widget K-map — gõ vẫn
  nhanh hơn với người đã quen.
- Đổi lại: đề ngắn hơn (widget đã cho thấy số bit / số dòng), không nhắc định dạng đáp án trong đề.

**D15. Nháp = ô chữ, chưa có bút vẽ.** Máy chính là laptop (trackpad) — viết tay bằng trackpad chậm hơn gõ.
Ô chữ font đều kẻ dòng đủ cho bảng chân trị, cộng cột bit. Lưu `scratch:<môn>` trong localStorage.
Thêm canvas khi người học dùng máy có bút.

**D16. Menu THEO VIỆC: Tổng quan · Học · Luyện tập · Thi thử (Phase 1).** (Người học chọn 2026-09-24 sau khảo sát
`RESEARCH.md`: "UX-UI giống toeic-app".) Thay rail chương + 4 tab con. Chương thành NHÓM bên trong mỗi mục
(toeic D36/D43/D54): muốn làm đề thì vào thẳng Luyện tập / Thi thử, không phải nhớ đề ở chương nào.
- Địa chỉ `#/learn/ch3/interactive`, `#/practice/ch3/sop`, `#/exam`; địa chỉ cũ `#/ch3/…` vẫn mở đúng chỗ.
- Trang chương cũ (ví dụ, công cụ, bài luyện của LinAlg) giữ nguyên, router bật đúng một khung.
- Giao diện theo token của toeic: nền gần trắng, thẻ trắng viền mảnh, một màu nhấn mỗi môn, chữ hệ thống
  (bỏ Be Vietnam Pro); cột nội dung 46rem, màn làm bài 58rem, màn công cụ 72rem. Máy tính: menu trái;
  điện thoại: thanh tab dưới đáy.
- Mỗi thẻ lựa chọn ghi trước giá phải trả `10 câu · ~M phút · đúng X% (7 ngày qua)` (toeic R1).

**D17. Nhật ký làm bài append-only, mọi con số tính lại từ nhật ký.** `progress:<môn>` trong localStorage,
mỗi câu một sự kiện `{ts, prefix, kind, ok, mode}` (toeic D23, bản một máy). "Cần nhất" theo bảng NEED của
toeic D52: chưa làm 70, dưới 5 câu 55, còn lại % sai; chỉ xét chương đã học tới tuần hiện tại (syllabus).
Phút học ước tính = tổng thời gian chuẩn của các câu đã làm (nhật ký không đo giờ thật, như toeic D36).
Không streak (toeic D51).

**D18. Mỗi dạng câu có THỜI GIAN CHUẨN (`SECONDS`).** Dùng cho "~M phút" và để Phase 2 dựng bài full theo
THỜI LƯỢNG chứ không theo số câu cố định: rút gọn K-map 4 biến ~3 phút, nhận diện cổng ~25 giây. Test canh
mọi dạng đều có số 10–300 giây. Chỉnh số khi đo được nhịp thật của người học.

**D19. Không chép 100% toeic-app: ít lựa chọn hơn, giao diện "tài liệu kỹ thuật", chỉ làm bản máy tính.** (Người học,
2026-09-24: "làm như toeic trông cũng ổn, nhưng quá nhiều option… thậm chí hơi xấu"; "localhost nên chỉ làm máy tính".)
- **Bớt lựa chọn trên màn:** Luyện tập chỉ hiện MỘT chương (thanh chương, mặc định chương của tuần này — nhớ
  lựa chọn); các dạng là bảng kẻ dòng (tên · thời gian · % đúng) thay lưới 28 thẻ. Học: mỗi chương một dòng,
  một nút "Bắt đầu/Học tiếp", ví dụ + công cụ là link chữ. Tổng quan: MỘT việc chính, việc thứ hai là một dòng chữ,
  số liệu 7 ngày viết thành một dòng.
- **Màu:** nền trắng lạnh, cột menu xám nhạt, chữ màu mực; màu nhấn mỗi môn cùng độ sáng (Logic ngọc `#1f7a64`,
  LinAlg lam `#2d5fb0`, Discrete tím `#6a4bb0`); hổ phách chỉ cho "cần luyện nhất" và mốc thi.
- **Điểm nhấn duy nhất:** dải 16 tuần + số ngày tới giữa kỳ ở đầu Tổng quan.
- **Chữ:** chữ hệ thống (SF), số/bit SF Mono, biểu thức STIX. Định dùng IBM Plex nhưng không cài được gói mới
  (quyền `node_modules` bị chặn) — chữ hệ thống trên Mac đã đủ đẹp và đủ dấu tiếng Việt.
- Bỏ toàn bộ CSS thanh tab dưới đáy / bố cục điện thoại.

**D20. Bài full 60–90 phút: đề dựng từ hạt giống, thời gian chia theo tuần học, bỏ câu nhận diện nhanh.** (2026-09-24)
- Đề chỉ lưu `{ seed, chapters, minutes, mode }` + đáp án đã ghi (`exam:<môn>`); câu hỏi dựng lại bằng
  `shared/logic/exam.js` → F5 / đóng tab vẫn đúng đề, đúng giờ (đồng hồ tính từ `startedAt`). Test canh:
  cùng hạt giống ⇒ cùng câu với cả 3 ngân hàng Logic (makeQuestion không được dùng Math.random).
- **Số câu theo thời gian chuẩn**, chỉ lấp 85% thời lượng (chừa soát bài; người mới chậm hơn chuẩn).
- **Chia thời gian theo số tuần học** của chương trong syllabus (Logic: Ch3 học 2 tuần ⇒ gấp đôi Ch1, Ch2),
  không chia theo số câu — nếu không, chương có dạng ngắn chiếm quá nửa đề.
- **Bỏ dạng < 40 giây** (nhận diện cổng, ô K-map, bit chẵn lẻ…) khỏi bài full: đề thật không có; bản đầu
  ra 59 câu / 90 phút, vụn như trắc nghiệm nhanh. Nay ~47 câu, xếp theo chương rồi dễ → khó.
- Thi thử: đáp án chỉ được ghi, chấm khi nộp; hết giờ tự nộp; nộp có hộp xác nhận (`<dialog>` gốc, không
  thư viện) báo số câu trống/gắn cờ. Bài tập dài: Kiểm tra từng câu, khoá câu đó, hiện lời giải.
- Nhật ký: thi thử ghi các câu đã làm lúc nộp (`mode:'exam'`), câu bỏ trống không ghi; bài dài ghi lúc
  Kiểm tra (`mode:'long'`). Nhờ đó Tổng quan / "cần luyện nhất" tính cả điểm thi.
- Phòng thi ẩn menu trái (bấm nhầm là rời bài); "Rời phòng thi" để lại bài, Thi thử hiện "Làm tiếp".
- Phần vẽ một câu tách thành `shared/ui/question.js`, bộ chạy luyện tập và phòng thi dùng chung.

**D21. Sai thì phải biết SAI Ở ĐÂU và LÀM THẾ NÀO — không chỉ "đáp án là X".** (Người học, 2026-09-24: làm bài Hệ đếm, sai mà
không biết sai chỗ nào, cách làm ra sao; "đó không phải cách hỗ trợ sửa sai".) Cùng đợt đọc `CAU_Math_Review.md`.
- **Chẩn đoán lỗi** (`logic/src/logic/ch1-help.js`, thuần): so đáp án sai với các lỗi hay gặp rồi gọi tên —
  quên +1 khi bù r, cộng thừa +1 khi bù r−1, ghi đúng số nhưng ở cơ số khác, nhầm dạng biểu diễn có dấu,
  đọc bit theo dạng khác, sai dấu, gắn nhầm parity chẵn/lẻ, đổi Gray ngược chiều, sai chữ số BCD nào. Đổi cơ số:
  chữ số sai **phải nhất** chính là phép chia đầu tiên bị tính sai ⇒ chỉ thẳng dòng phép chia đó. Không đoán được
  thì chỉ vị trí đầu tiên khác đáp án. Ký tự người học ghi được lọc còn chữ số hex/dấu trước khi in lại (chống HTML).
- Chương 2 (`ch2-help.js`): dòng bảng chân trị đầu tiên lệch, cổng đã chọn nhầm + cột F của nó, thiếu/thừa minterm,
  nhầm minterm ↔ maxterm. Chương 3: thiếu/thừa tập minterm (hàm lẻ/chẵn); rút gọn K-map vốn đã báo các ô sai.
- **Các bước tính** (`q.work`): dòng toán thuần hoặc `{key, params}`; hiện dưới "Lời giải" (`explainBlock` ở
  `shared/ui/question.js`, dùng cho luyện tập và bài full). Chương 2, 3 chưa có `work` (lời giải bằng câu) — làm tiếp khi tới Phase 3.
- **Từ câu sai tới thẻ bài học:** thẻ có `data-check` / `data-also="p:kind[:nhãn]"` trong Markdown chính là mối nối
  dạng câu ↔ khái niệm (không thêm bảng riêng; test bắt mọi dạng phải có thẻ, cùng vị trí ở VI/EN). Câu sai hiện
  "Ôn lại: <tên thẻ>" ngay dưới lời giải, và ở tổng kết lượt / kết quả bài full.
- **Mục tiêu học tập** "Sau chương này bạn làm được" (3 ý) ở thẻ đầu mỗi chương.
- Chưa làm (ghi nhận từ review): mastery theo khái niệm (nhật ký theo dạng đã đủ dùng cho "cần luyện nhất"),
  kiểm tra bàn phím / screen-reader cho widget K-map, bảng chân trị.

**D22. Đề rõ ràng theo kiểu giáo trình, không lặp câu, có trắc nghiệm ngang tự luận.** (Người học, 2026-09-24: "không hiểu câu hỏi muốn hỏi
gì… logic gate lặp đi lặp lại, 1 cổng kiểm tra truth table tận 3 lần trong 10 câu"; "thêm trắc nghiệm, độ khó ngang tự luận".)
- **Chẩn đoán trung thực:** một phần do môn (thuật ngữ nhiều), một phần do cách app ra đề — đề rút gọn, không nói nhập gì theo định dạng
  nào, miền câu quá hẹp. Đối chiếu Mano & Ciletti: xem `RESEARCH.md`.
- **Mỗi câu có dòng "Trả lời: …"** (`formatKey`, `q.formatParams ?? q.textParams`) nói phải nhập gì, đúng định dạng nào; đề viết lại theo
  động từ + đối tượng + thủ tục (Mano). Test: mọi dòng điền đủ tham số ở VI/EN.
- **Không lặp câu** (`shared/logic/question-pool.js`): chữ ký = dạng + `meta`; một lượt / một đề không có hai câu trùng; tránh cả câu
  của lượt trước khi còn cách; hết cách (miền nhỏ hơn số câu) thì chấp nhận lặp chứ không treo. Bài full dựng lại vẫn xác định (F5).
- **Mở rộng miền:** cổng 6 × (2 hoặc 3 ngõ vào) = 12; NAND dùng SOP ngẫu nhiên; XOR 48 kiểu (dấu ′ + bù ngoài). Test: mỗi dạng ≥ 12 câu khác nhau.
- **Trắc nghiệm** (`shared/logic/mcq.js`, `logic/src/logic/{chN-help,expr-mutate,mcq-banks}.js`): nhiễu = lỗi hay gặp do từng chương liệt kê
  + biến thể sai một bước của đáp án (bỏ literal, bù nhầm, đổi + ↔ ·; loại biến thể vô nghĩa như yy′). Mỗi nhiễu phải bị **bộ chấm tự luận
  xác nhận là sai** (oracle) ⇒ không bao giờ hai đáp án cùng đúng; 4 phương án cùng độ dài với câu bit. K-map SOP/POS đưa K-map ra thay
  vì bắt khoanh. Chỉ áp dụng ở Luyện tập (chọn "Cách trả lời"); bài Thi thử vẫn tự luận.

**D23. Lời giải từng bước cho MỌI câu, đúng hay sai.** (Người học, 2026-09-24: "vì là môn toán nên dù giải đúng hay sai đều có hướng dẫn
giải từng bước".) Trước đây câu đúng chỉ hiện "Đúng." + một dòng kết quả ("Dạng tối giản: F = x′ + y′z").
- `logic/src/logic/steps-ch{1,2,3}.js` (thuần) sinh `q.work` cho cả 28 dạng. Dòng = chuỗi toán | `{key, params}` | `{key, params, m}`.
  Ví dụ: đổi cơ số — nhân trọng số rồi chia liên tiếp, hoặc gộp nhóm bit khi đi giữa 2/8/16 (cách nhanh của Mano); bù — trừ từng chữ số
  rồi +1; bảng chân trị — giá trị TỪNG TERM ở từng dòng; rút gọn — gộp minterm `x′y′z′ + x′y′z = x′y′(z′ + z) = x′y′`; DeMorgan / dual /
  NAND — từng term; K-map — mỗi nhóm: ô nào, biến nào đổi (bị khử), giữ biến nào ⇒ term, essential hay không; PI/EPI — ô nào chỉ nhóm đó phủ.
- Test: mọi câu có lời giải, khoá có ở VI/EN, điền đủ tham số, và lời giải đi tới đúng đáp án.
- Hiển thị: biểu thức bằng phông STIX như sách (x′y), số/bit bằng mono; đáp án in trong lời nhắn cũng vậy.


**D24. Ngân hàng câu Linear Algebra: tự luận + trắc nghiệm cùng lúc.** (Người học, 2026-09-24: "đốc thúc Linear Algebra và
Discrete… tự luận tốn công thì làm trắc nghiệm trước — cho bạn quyết".) Quyết định làm CẢ HAI ngay: đáp án Đại số tuyến tính là
số / vector / ma trận nên chấm tự luận theo giá trị là rẻ (phân số, √, ngoặc gì cũng nhận), và trắc nghiệm sinh ra từ chính nó.
- 25 dạng bám §1.1–3.6 (Strang 4th): Ch1 tổ hợp, tích vô hướng, độ dài, vector đơn vị, góc (chỉ góc "đẹp"), vuông góc, Ax theo cột,
  tìm c, d · Ch2 giải hệ 2/3 ẩn, số nghiệm, trụ, hệ số nhân của L, AB, (AB)ᵢⱼ, A⁻¹ (2×2 và Gauss–Jordan 3×3), xᵀAy · Ch3 độc lập,
  span, b ∈ span, hạng, dim N(A), nghiệm đặc biệt, nghiệm riêng, bốn không gian con. Đề dựng ngược (A = LU, A = E·R, (m×r)(r×n))
  để tính tay ra số nguyên.
- `linalg/src/logic/quiz-kit.js`: mỗi câu tự khai `mistakes` (lỗi hay gặp + lời chẩn đoán: BA thay AB, quên chia det, ℓ sai dấu,
  nhầm N(A)/N(Aᵀ)…). Một danh sách dùng cho cả hai việc: chẩn đoán khi gõ tay và nhiễu trắc nghiệm (vẫn qua oracle của `mcq.js`).
  Không khớp lỗi nào ⇒ chỉ ô sai đầu tiên. Lời giải từng bước lấy từ chính bộ khử (`elimination.js`).
- Ô nhập ma trận dạng lưới (`linalg/src/ui/quiz-figures.js`, widget `matrix`); đề có hình ma trận / hệ phương trình.
- Bỏ 3 trang Luyện tập cũ (4 dạng/chương, không lời giải). Thẻ bài học có câu thử nhanh (`data-check`).

**D25. Mục "Công cụ" trên menu.** (Người học, 2026-09-24: "kmap với vector trực quan đâu, sao bỏ đi".) Công cụ không mất mà bị giấu
thành dòng chữ xám dưới từng chương ở màn Học. Nay có mục riêng `#/tools`: gom công cụ bấm thử + ví dụ giải sẵn của mọi chương, đọc
thẳng tiêu đề thẻ trong các khung (không phải khai báo tay; app mới tự có), bấm là mở đúng khung và cuộn tới đúng công cụ
(`#/learn/ch3/interactive/1`). Kèm sửa: class `.term` của khối học kỳ (Tổng quan) đè lên chip biểu thức K-map ⇒ đổi thành `.semester`;
biểu thức K-map hiện x′y′ bằng phông sách.

**D26. Phase 3 — Bài học theo điểm kiến thức (RESEARCH U-R6).** Trước đây mỗi thẻ có "Thử nhanh" 3 câu cố định: làm sai
hay đúng đều hết 3 câu là xong, không có ví dụ mẫu, không biết mình đã nắm chưa.
- **Điểm kiến thức = thẻ có `data-check="p:kind[:nhãn]"`** (không thêm cấu trúc mới — Markdown vẫn là nơi viết bài). Trong thẻ:
  khái niệm (chữ) → **ví dụ mẫu** bấm "Bước tiếp" hiện từng DÒNG lời giải → **tự làm** tới khi **đúng 2 câu liên tiếp**.
  Sai thì có nút "Xem thêm một ví dụ" (Renkl: gặp khó thì quay lại ví dụ mẫu). Qua ⇒ nút "Thẻ tiếp: …" ngay trong khối.
- **Ví dụ mẫu dùng lại `q.work` của D23** — không viết ví dụ tay: đề tự sinh, nên "Ví dụ khác" cho vô số ví dụ. Chọn trong 8 đề
  đề có lời giải gần 6 dòng nhất (một phép tính thì không dạy được gì; K-map 6 nhóm thì ngợp). Câu trả lời bằng widget có
  `exampleFigure` (K-map đã điền) và `answerFigure` (K-map khoanh sẵn nhóm lời giải) để ví dụ có hình.
- **Nhãn** (`q.review`) chia một dạng thành kiểu câu riêng cho từng thẻ: đổi cơ số `toDec` / `fromDec` / `group`, ô K-map `n3` / `n4`.
  Nhật ký ghi thêm `tag`. Test: mọi nhãn trong bài học phải sinh ra được.
- **"Đã nắm" tính từ nhật ký** (`shared/logic/knowledge.js isPassed`): từng có 2 câu đúng liền nhau của đúng dạng (và nhãn), ở
  BẤT KỲ chế độ nào — làm đúng liền 2 câu ở Luyện tập cũng là đã nắm. Không lưu riêng (như D16: mọi con số tính lại từ nhật ký).
- **Không khoá thẻ:** vẫn lật thẻ tự do (người học tự học, ôn lại, nhảy cóc trước kỳ thi). Chấm tiến độ tô xanh thẻ đã qua; mục Học ghi
  "k/n điểm kiến thức đã nắm". Đã nắm từ trước thì vào thẳng phần tự làm.
- **Học một dạng:** màn luyện một dạng có link "Học dạng này: <thẻ>" mở đúng thẻ (ví dụ + tự làm của dạng đó).
- Chưa làm: giữ trạng thái khối khi đổi ngôn ngữ giữa chừng (hiện quay về ví dụ); "vì sao"/"hai cách" kiểu Mano — làm ở D27 (câu khái niệm).

**D27. Câu khái niệm do Gemini soạn theo lô, máy kiểm + người học duyệt rồi mới vào app.** (Người học, 2026-09-24: "đang dùng Gemini API cho
pipeline dự án khác… có cách nào cải thiện đề 3 môn tốt hơn không; không cần chạy đề liên tục như toeic".)
- **Phân vai:** bộ sinh đề tự động giữ câu TÍNH TOÁN (vô hạn, đúng tuyệt đối — D11, D22). LLM làm thứ bộ sinh không làm được:
  câu **vì sao / chỗ hay sai / áp dụng nhỏ / so sánh** (RESEARCH: "chưa có câu vì sao, chưa có hai cách"). Trắc nghiệm 4 phương án,
  nhiễu là lỗi thật, mỗi phương án có một dòng vì sao đúng/sai, song ngữ VI/EN.
- **Không gọi API lúc học** (khác toeic): `npm run gen` chạy tay theo lô → hàng chờ `scripts/gen/out/` (không commit) →
  `npm run gen:review` người học giữ/bỏ từng câu → `<app>/src/content/concepts.json` (commit). App chạy offline như cũ, không cần khoá.
- **Không tin mù LLM — ba lớp:** (1) structured output theo schema; (2) `validateItem` (4 phương án khác nhau, đủ 2 bản, EN không sót
  dấu Việt, không "tất cả đều đúng", độ dài, mục có thật, cấm `{ } < >`) + lọc trùng ý; (3) câu dựa trên phép tính phải kèm
  `check`, chạy lại bằng CHÍNH hàm giải của app (`logic/src/logic/concept-check.js`: tương đương, minterm, số literal tối giản,
  đổi cơ số, số bù, số có dấu, Gray) — sai là loại. Rồi mới tới mắt người học.
- **Khoá API**: `.env` (gitignored; `.env.example` mẫu), gửi bằng header `x-goog-api-key`, không nằm trên URL/log. REST thuần, không
  thêm dependency. Model đổi được (`GEMINI_MODEL`, mặc định gemini-2.5-flash).
- **Vào app:** thêm dạng "Khái niệm (vì sao?)" ở chương có câu đã duyệt (`withConcepts` gói ngân hàng gốc — không đụng file chN-quiz,
  test 200 hạt giống giữ nguyên); có luôn ở Luyện tập (cả hai chế độ), Thi thử, "cần luyện nhất". Chữ vào từ điển qua `conceptDicts`
  (thoát HTML, `x'` → x′). Chọn sai: nói ngay vì sao phương án đó sai; lời giải liệt kê vì sao từng phương án sai.
- **9 câu mẫu** (3/chương, `source: claude`) soạn tay theo đúng hợp đồng và qua cùng bộ kiểm — để có sẵn dạng này và làm mẫu.
- LinAlg / Discrete: pipeline soạn + duyệt được ngay (chủ đề ở `scripts/gen/topics.js`), chưa có bộ kiểm phép tính ⇒ chỉ nhận
  câu không kèm check; nối vào app khi app có ngân hàng câu.
- Chưa làm: sửa chữ ngay trong lúc duyệt (hiện sửa file drafts rồi chạy lại); đánh giá câu theo tỉ lệ làm đúng thật để loại câu dở.

**D28. Công cụ K-map: bản đồ và các bước đặt cạnh nhau; trang Công cụ gọn.** (Người học, 2026-09-24: "cần cải thiện K-map, đặc biệt
phần thu gọn, vẫn chưa tốt… text quá nhiều và trông rất rối mắt".)
- **Vì sao chưa tốt:** 5 thẻ xếp dọc (nhập, bản đồ, kết quả, giải thích, bảng chân trị) ⇒ đọc bước thì bản đồ trôi khỏi màn; mỗi bước
  chỉ in một dòng `F = …` mà không nói nhóm gồm ô nào, biến nào bị khử; chỉ nhập được Σm.
- **Một thẻ, hai cột:** trái bản đồ (dính khi cuộn), phải kết quả SOP | POS + các bước hiện dần; bấm một bước để quay lại; bản đồ
  tô các nhóm đã chọn, nhóm của bước đang xem nổi lên. Bảng chân trị gập trong "Bảng chân trị".
- **Các bước** (`logic/src/logic/kmap-walk.js`, thay `kmap-explain.js`): (biểu thức ⇒ khai triển từng term thiếu biến:
  x′y′ thiếu w, z: x′y′(w + w′)(z + z′) ⇒ m0, m1, m8, m9) → điền ô → mọi nhóm lớn nhất → từng nhóm được chọn: ô nào, biến nào
  đổi giá trị nên bị khử, giữ biến nào ⇒ term, vì sao chọn (ô chỉ nhóm này phủ / phủ ô còn trống) → ghép kết quả + số literal.
  POS cùng khuôn trên ô 0. Test: 80 hàm ngẫu nhiên × SOP/POS — các nhóm phủ hết, kết quả trùng bộ giải QM.
- **Nhập cả hai cách:** `Σm(…) + d(…)`, `ΠM(…)` hoặc biểu thức theo tên biến (tự nâng số biến khi có w/v).
- **Trang Công cụ:** mỗi chương một dòng tên công cụ ngắn + một link "Ví dụ giải sẵn (n)" thay cho liệt kê từng ví dụ; tên công cụ
  rút gọn (vd "Complement & trừ bằng complement" → "Số bù & phép trừ").

**D29. Cây cho mục lục, đồ thị cho quan hệ tiên quyết.** (Người học, 2026-09-24: "sắp xếp kiểu note Obsidian, thu gọn, cần gì bấm vào…
áp dụng tree, graph trong dự án này kiểu gì" — rồi giao tự cân nhắc ưu/nhược, không hỏi lại.)
- **Cây — trang Học** (`shared/ui/learn-screen.js`): chương là nút `<details>` thu gọn, mở ra là các thẻ (chấm xanh = đã nắm, chấm xám
  = đã xem), thanh % điểm đã nắm cạnh chương; nhớ chương đang mở; mặc định mở chương có việc "học tiếp". Chọn `<details>` gốc của
  trình duyệt thay vì tự viết cây: bàn phím, trình đọc màn hình, trạng thái mở có sẵn. KHÔNG áp cho Công cụ/Luyện tập: đã ngắn
  (≤ 10 dòng), gập lại chỉ thêm một cú bấm.
- **Đồ thị (DAG) tiên quyết** (`shared/logic/prereq.js`): khai báo ngay trong bài học như `[[link]]` của Obsidian —
  `<div data-check="c3q:sop" data-needs="c3q:epis c2q:simplify">`. Cân nhắc: bảng JSON riêng (dễ nhìn tổng thể) vs ghi trong .md
  (sửa bài học là thấy cạnh ngay, không lệch khi thêm/bỏ thẻ) ⇒ chọn .md; test canh không chu trình, không trỏ vào điểm không có,
  VI = EN. Logic ch1–3: 24 điểm, 25 cạnh (vd ô K-map 3 biến cần Gray code + minterm; SOP cần EPI + gộp minterm).
- **Dùng đồ thị ở ba chỗ:** (1) câu sai ⇒ ngoài "Ôn lại: <thẻ>" có "Có thể gốc ở: <thẻ tiên quyết> (đúng 33%)" — điểm tiên quyết
  có BẰNG CHỨNG yếu gần nhất (đã làm, chưa nắm, < 60%), không có thì điểm chưa làm gần nhất; bằng chứng đứng trước "chưa làm" vì
  sai 2/3 câu đáng nghi hơn một điểm chưa đụng tới. Kết quả Thi thử: dòng dạng yếu mở thẳng thẻ gốc. (2) "Học tiếp" (trang Học +
  Tổng quan) = điểm đầu tiên theo sắp xếp tô-pô mà chưa nắm và mọi điểm cần đã nắm; hoà thì theo thứ tự bài học.
- **Chưa làm (cố ý):** màn hình đồ thị kiểu Obsidian graph view — đẹp nhưng ít giúp học hơn hai việc trên; ôn ngầm (làm đúng SOP
  tính là ôn một phần EPI, minterm — kiểu Math Academy) — cần mô hình ôn ngắt quãng trước; cạnh cho LinAlg (khai báo data-needs
  trong bài LinAlg là đủ, code dùng chung).
- Liên hệ Discrete (tuần 9–13): DAG tiên quyết = thứ tự bộ phận; "học tiếp" = sắp xếp tô-pô / lập lịch.

**D30. Gộp những gì liên quan: menu 4 mục, Luyện tập theo nhóm chủ đề.** (Người học, 2026-09-24: "vẫn bị liệt kê ra quá nhiều… vài
chức năng liên quan có thể gộp chung vào một mục".)
- **Thi thử vào Luyện tập** (menu: Tổng quan · Học · Công cụ · Luyện tập): cùng một việc "làm bài", khác độ dài. Đầu mục Luyện tập có
  hai thẻ gạch chân "Luyện theo dạng | Bài full 60–90 phút"; địa chỉ `#/exam` giữ nguyên, menu sáng mục Luyện tập.
  KHÔNG gộp Công cụ vào Học: Người học từng hỏi "K-map, vector trực quan đâu" (D25) — công cụ phải thấy ngay trên menu.
- **Dạng câu gom theo nhóm chủ đề** (`GROUPS` trong chN-quiz.js, `shared/logic/groups.js`): Logic 10/9/7 dạng → 4/3/2 nhóm,
  LinAlg 8/9/8 → 3/2/3. Mỗi dòng là một nhóm, tên các dạng ghi nhỏ bên dưới; bấm là luyện trộn trong nhóm, trên màn làm bài có thanh
  "Tất cả dạng | từng dạng" để chọn riêng một dạng (không phải quay lại danh sách). % đúng và "cần luyện nhất" tính theo nhóm.
  Test: mỗi dạng thuộc đúng một nhóm, ≤ 4 nhóm/chương, ≤ 5 dạng/nhóm, nhãn có ở VI/EN.
- Trang Học bỏ hai link "Ví dụ giải sẵn · Công cụ tương tác" dưới mỗi chương (đã có ở mục Công cụ); bỏ các câu phụ đề lặp lại tên mục.

**D31. Đo độ trùng lặp trước khi refactor.** (Người học, 2026-09-24: "codebase phình to vì dự án lớn hay vì không DRY?")
- Đo bằng jscpd: trùng nguyên văn **0,23%** (43/~18k dòng); ngưỡng thấp (≥ 4 dòng) 40 cặp, phần lớn là khuôn nhỏ (import i18n, markup chương).
  Cỡ repo chủ yếu do phạm vi: 3 app × 2 ngôn ngữ (i18n ~2,7k dòng), bài học .md ~2,7k, test ~5,2k (≈ 30%).
- Chỗ DRY bị lọt khi làm theo từng tính năng, đã gom: hàm tạo phần tử `h`/`el` (7 bản ⇒ `shared/ui/dom.js` `h`, `ht`),
  hàm dòng lời giải `L` (6 bản ⇒ `shared/logic/steps.js`), bỏ 2 hàm chết. Còn lại có biết nhưng KHÔNG làm (người học: đủ DRY thì thôi):
  hai bộ parser Boolean (`bool-ast.js` và `expr-parser.js` cùng ngữ pháp), `drag.js`/`drag3d.js` của LinAlg.
- Bài học: đổi tiện ích dùng chung phải chạy thử trình duyệt — test logic không phủ `ui/` (vd `el` mất trong dom-helpers LinAlg).

**D32. Discrete Math: làm trước các chương TÍNH ĐƯỢC (D1, D6, D7).** Giữa kỳ tuần 8 gồm D1–D7.
- D1 (logic mệnh đề), D6 (gcd/Euclid/Pulverizer), D7 (đồng dư, nghịch đảo, lũy thừa mod, φ, RSA) có đáp án máy tính được ⇒ ngân
  hàng tự sinh vô hạn, chấm chắc chắn, lời giải từng bước (bảng Euclid, Pulverizer, bình phương liên tiếp) — giá trị cao nhất cho
  thời gian bỏ ra. D2–D5 là lập luận/chứng minh: tự sinh đề chứng minh dễ sai và vô vị ⇒ bài học + câu khái niệm (Gemini, D27).
- Chương mang số syllabus (ch1, ch6, ch7) để khớp PLAN và lịch tuần; `SUBJECTS[].chapters` đổi từ số lượng sang danh sách id.
- Câu nhiều đáp án đúng: Bézout (vô số cặp s, t) và nghịch đảo (mọi x ≡ a⁻¹) chấm bằng TÍNH CHẤT (s·a + t·b = gcd; a·x ≡ 1),
  không so chuỗi; nghịch đảo không tồn tại thì gõ "không/none".
- Đề không vô vị: bảng chân trị luôn có cả 0 lẫn 1, không có cặp "p ∨ p"; RSA mã hoá tránh m² ≡ 1 (mod n).
- Chưa làm: trắc nghiệm (mcqBank) cho D6, D7; công cụ trực quan (bảng Euclid bấm từng bước, đồng hồ mod, sân chơi RSA theo RSA.py).

**D33. Discrete đủ D1–D7 trước giữa kỳ — kể cả chương "lập luận" vẫn tìm được phần máy tính được.** (Người học, 2026-09-24:
"Discrete là thứ tôi cần học nhất vì là môn tôi yếu nhất".) Sửa D32: không đợi Gemini cho D2–D5.
- D2 lượng từ: đúng/sai của ∀∃ lồng nhau trên miền số nhỏ (vét cạn; lời giải liệt kê phần tử chứng minh / phản ví dụ từng hàng);
  phủ định — nhiễu là lỗi thật (quên đổi lượng từ, ¬(A → B) thành A → ¬B, chỉ đổi lượng từ ngoài) và mọi nhiễu được kiểm KHÁC
  NGHĨA đáp án qua 200 diễn giải ngẫu nhiên.
- D3: phép toán tập hợp, đếm (2^|A|, |A×B|, bao hàm–loại trừ), ánh xạ là hàm / đơn / toàn / song ánh.
- D4: tổng theo công thức đóng; "công thức nào đúng mọi n" (nhiễu khớp n = 1 rồi lệch — bẫy "thử vài giá trị"); bước quy nạp phải
  chứng minh đẳng thức nào (công thức viết sẵn tại k, k + 1, k + 2).
- D5: bình nước Die Hard (bất biến gcd; đong được thì lời giải là chuỗi đổ nước NGẮN NHẤT tìm bằng BFS), tem thư (quy nạp mạnh,
  a·b − a − b).
- Lịch syllabus: một tuần có thể nhiều chương (tuần 3: D2 + D3) — `weeks[w] = [tên, ...chương]`.
- Còn thiếu: chọn phương pháp chứng minh / tìm lỗi trong chứng minh (ngôn ngữ tự nhiên) ⇒ câu khái niệm Gemini.

**D34. Công cụ bấm thử cho Discrete (mục Công cụ, như D25).** Discrete là môn người học yếu nhất; bài học có ví dụ mẫu nhưng chưa có
chỗ "tự nhập số của mình xem máy làm từng bước".
- Bốn công cụ, chọn theo chỗ sinh viên hay tính tay sai trong đề giữa kỳ: **bảng chân trị tự dựng** (D1; cột phụ cho từng công
  thức con, thêm G thì dòng F ≠ G tô đỏ — dùng kiểm tương đương), **Euclid & Pulverizer bấm từng dòng** (D6; cột cuối kiểm lại
  bất biến r = s·a + t·b, xong thì có gcd, lcm, nghịch đảo), **lũy thừa mod bình phương liên tiếp** (D7), **sân chơi RSA** (D7;
  p, q, e, m → n, φ, d qua Pulverizer, mã hoá, giải mã ra lại m).
- Theo khuôn có sẵn: markup trong khung `pane-chN-interactive` của `src/pages/chN.html`, màn Công cụ tự đọc tiêu đề. Mọi phép tính
  gọi lõi `logic/` mà ngân hàng câu đang dùng ⇒ công cụ và lời giải không thể lệch nhau. Một file `src/ui/tools.js`.
- Chưa làm: "đồng hồ mod" (D32 có nhắc) — bảng lũy thừa đã cho thấy chu kỳ; thêm khi người học thấy cần.
- Kèm sửa: `modPow` báo lỗi khi n > ~94 triệu (v·v vượt số nguyên an toàn ⇒ trước đây trả số SAI im lặng); màn Công cụ hiện số "0"
  lạc khi chương không có ví dụ giải sẵn (`0 && el(…)` ra 0).

**D35. Discrete D8 Đồ thị — làm ngay khi trên lớp học tới.** (Người học, 2026-09-25: "trên lớp tuần này đang học graph theory".)
Syllabus tuần 9 = "Graphs" (MCS 12 + đếm đường đi MCS 10.3); tuần 10–11 (ghép cặp, cây khung nhỏ nhất) để chương sau.
- Lõi `logic/graph.js`: đồ thị đơn { n, edges }, BFS (tầng + đường ngắn nhất), thành phần, tô 2 màu trả **chu trình lẻ thật**
  khi hỏng, Euler, Havel–Hakimi, đẳng cấu vét cạn (n ≤ 6 trong đề) + bất biến khác nhau đầu tiên để giải thích "không đẳng cấu".
- 10 dạng / 3 nhóm, chọn theo đề giữa/cuối kỳ hay ra: bắt tay, dãy bậc vẽ được không, số cạnh Kₙ/Cₙ/Lₙ/Kₘ,ₙ · đếm walk bằng Aᵏ,
  khoảng cách, số thành phần · hai phía, Euler, cây/rừng, đẳng cấu. Đồ thị sinh ngẫu nhiên, đáp án tính lại bằng lõi; test canh
  mọi phương án Có/Không đều có lúc là đáp án (đề không lệch về một phía).
- Đẳng cấu "không" sinh bằng **hoán đổi 2 cạnh** (giữ dãy bậc) ⇒ đúng cái bẫy "cùng dãy bậc nên đẳng cấu" mà MCS nhấn mạnh.
- Hình: SVG, đỉnh trên vòng tròn (không ba đỉnh thẳng hàng ⇒ cạnh không xuyên đỉnh), không cần thư viện vẽ đồ thị.
- Công cụ "Sân chơi đồ thị": gõ cạnh → hình tô hai phía hoặc tô đỏ chu trình lẻ, bậc, tầng BFS, thành phần, Euler, cây, bảng Aᵏ.

**D36. Câu khái niệm Discrete soạn tay + luật "đáp án không dài hơn hẳn".** Phần còn thiếu của D33 (chọn phương pháp chứng minh,
tìm lỗi chứng minh) là lập luận bằng lời — bộ sinh đề không tạo được. Chưa có khoá Gemini chạy thật (D27) ⇒ soạn tay trước.
- 25 câu VI/EN ở `discrete/src/content/concepts.json`, 3–4 câu/chương D1–D8, nhắm đúng chỗ hay sai: kéo theo rỗng, đảo vs phản
  đảo, thứ tự ∀∃, phản đảo khi giả thiết khó dùng, vì sao "tối giản" trong √2, đơn/toàn ánh, đếm giao hai lần, ngựa cùng màu,
  quy nạp thiếu cơ sở, bất biến bình nước, số cơ sở của quy nạp mạnh, gcd chỉ chia hết tổ hợp, giản ước mod, d = e⁻¹ mod φ(n)
  chứ không mod n, cùng dãy bậc chưa chắc đẳng cấu, chu trình lẻ, Euler. Nối bằng `withConcepts` như Logic (dạng "Khái niệm").
- Không kèm `check` (Discrete chưa có bộ kiểm phép tính cho câu khái niệm) — các phép tính nhỏ trong câu đã kiểm tay.
- Đo lại thấy 19/25 câu Discrete và 4/9 câu Logic có **phương án đúng dài nhất** ⇒ đoán theo độ dài là trúng. Sửa ở gốc:
  `validateItem` loại câu có đáp án dài hơn nhiễu dài nhất quá 2 chữ (áp cho cả câu Gemini), prompt nói rõ; viết gọn các câu cũ —
  lý do chuyển sang dòng "vì sao".

**D37. Đồng bộ tiến độ giữa 2 laptop qua thư mục đám mây — không deploy.** (Người học, 2026-09-25: học mỗi máy một ít, muốn
"tự động gần như hoàn toàn".) Sửa D06: vẫn không deploy/tài khoản/máy chủ riêng; đồng bộ thì có, nhưng chỉ qua file.
- Cân nhắc: (a) nút Xuất/Nhập file — phải tự tay, dễ quên; (b) một máy làm máy chủ LAN — dữ liệu vẫn nằm ở trình duyệt máy
  đang mở, máy chủ phải luôn bật; (c) deploy + tài khoản — quá nặng, repo public; (d) commit dữ liệu vào git — lộ lên repo
  public, commit rác. Chọn **(e)**: máy chủ Vite (vốn đã chạy) ghi/đọc file trong thư mục đám mây người học đã có; iCloud Drive /
  Google Drive / OneDrive / Dropbox lo chép file giữa hai máy. Không thêm thư viện, không thêm bước tay.
- **Mỗi máy (mỗi trình duyệt) một file** `CAU_Math-sync/<máy>.json` ⇒ hai máy không ghi đè file của nhau, dịch vụ đám mây
  không sinh "bản xung đột". Ghi file tạm rồi đổi tên ⇒ không bao giờ có nửa file; file hỏng/đang tải dở thì bỏ qua.
- Bản chụp = mọi khoá localStorage → { v, t } (t = lúc đổi, v null = đã xoá). Không sửa chỗ nào đang ghi localStorage:
  so với bản chụp lần trước để biết khoá nào đổi. Gộp (`shared/logic/sync.js`, có test):
  `progress:*` là nhật ký append-only ⇒ **hợp đa tập** (giữ số lần xuất hiện lớn nhất của từng sự kiện — hai câu giống hệt trong
  một lần nộp bài không bị gộp thành một, gộp lại nhiều lần không nhân đôi); `exam-history:*` hợp theo ts; còn lại bản đổi sau
  cùng thắng. Tiến độ học vì vậy không bao giờ mất, kể cả khi hai máy học cùng lúc.
- Khi nào đồng bộ: mở trang và quay lại tab ⇒ lấy về + gộp, có gì mới thì tải lại trang một lần (tối đa một lần/10 giây);
  mỗi 10 giây và lúc rời tab ⇒ gửi lên nếu có đổi. Nút mây cạnh nút sáng/tối: chấm xanh = đã đồng bộ, bấm = đồng bộ ngay.
- Chọn thư mục: `STUDY_SYNC_DIR` trong `.env` (hoặc `off`) → gốc đám mây nào đã có `CAU_Math-sync` → iCloud Drive → Google
  Drive → OneDrive → Dropbox. Quy tắc "đã có thư mục thì dùng" giúp hai máy chắc chắn cùng chỗ khi máy có nhiều dịch vụ.
- Xoá dữ liệu trình duyệt ⇒ máy thành "máy mới", lần mở sau tự lấy lại từ file của chính nó và máy kia (có sẵn bản sao lưu).

**D38. Xuất tiến độ ra ~/study-progress/math.json** (người học giao toàn quyền 2026-09-25) — bổ sung cho D37: D37 chép tiến độ
giữa hai máy, D38 cho skill học và Claude Code đọc được.
- Vấn đề: nhật ký làm bài nằm trong localStorage của trình duyệt ⇒ skill học (`huy-on-tap-ngat-quang`, `huy-tao-bai-tap`)
  và Claude Code không đọc được. Lý do chọn: app chỉ chạy localhost ⇒ plugin Vite (`shared/vite-plugin-progress.js`, chỉ khi `npm run dev`)
  nhận POST `/__progress` và ghi file — không cần bấm xuất tay, không thêm phụ thuộc.
- Schema `study-progress/1` (chung với toeic-app): mục theo (môn, dạng câu) gồm attempts/accuracy/recent/status/stuck/wrongTags.
  Xây ở `shared/logic/progress-export.js` (thuần, có test); đẩy debounce 1,5 s sau mỗi `record()` và một lần khi mở app.
- Đổi thư mục bằng `STUDY_PROGRESS_DIR`. Mỗi môn ghi đè phần của mình, giữ môn khác.
- Giới hạn: chỉ có mức "dạng câu" + tag khái niệm khi sai; chưa có từng câu/đáp án người học chọn (nhật ký chưa lưu).

**D39. Logic Ch4 Mạch tổ hợp — đủ dạng câu trước giữa kỳ, công cụ để sau.** Syllabus tuần 6–7 = Ch4, nằm trong phạm vi giữa kỳ
tuần 8 nhưng app chưa có gì. Ưu tiên phần CHẤM ĐƯỢC (luyện + thi thử), công cụ bấm thử để sau khi người học dùng thử.
- Lõi `combinational.js` (bộ cộng nối tiếp, cộng–trừ + V, cộng BCD, so sánh, mã hoá ưu tiên, MUX hai chiều, mạch nhiều mức);
  test vét cạn mọi cặp 4 bit so với phép tính số nguyên.
- 10 dạng / 2 nhóm + dạng phân tích đứng riêng, chọn theo đề Mano hay ra: phân tích mạch (hình SVG hai tầng cổng bất kỳ, có
  NAND/NOR/XOR), carry C₄…C₁, cộng–trừ theo M, tràn số (Có/Không chia đều), cộng BCD (60% cần +0110), bit xᵢ của bộ so
  sánh, decoder + OR/NOR, encoder ưu tiên (có ca V = 0), MUX thiết kế (3–4 biến) và đọc ngược.
- `ch4-help.js`: MỘT danh sách lỗi hay gặp dùng cho hai việc — chẩn đoán khi gõ trúng lỗi đó và làm nhiễu trắc nghiệm (quên +1,
  quên đảo B, quên hiệu chỉnh BCD, XOR thay XNOR, lấy ngõ ưu tiên thấp, đổi z/z′, đảo ngõ chọn, quên vòng tròn đảo…).
- Hình mạch: không dùng thư viện; tầng 1 hai cổng ra T₁, T₂, tầng 2 một cổng ra F — đủ cho "đặt tên đầu ra rồi thế dần" của §4.3.
- Công cụ (làm ngay sau, cùng D39): **bộ cộng–trừ đi từng bit** (1–8 bit, M = 0/1, cuối cùng C, V và cách đọc không dấu /
  có dấu — đúng chỗ hay nhầm C với V) và **hàm bằng MUX / decoder** (Σm → bảng cặp dòng → Iₖ; D cần nối vào OR hoặc NOR).
- Chưa làm: carry lookahead mới chỉ có trong bài học, bộ nhân (§4.7) bỏ qua.

**D40. Không ra câu lặp: sửa chống lặp tận gốc + lượt tự ngắn lại + kho câu lớn hơn.** (Người học, 2026-09-25: lượt 10 câu
trắc nghiệm D2 và Logic có câu trùng 100%; chọn giữa giảm số câu mỗi lượt và tăng kho câu — người học giao tự quyết.)
- Đo trước khi sửa (mỗi dạng sinh 400 câu, so chữ ký chống lặp với nội dung người học thấy): câu khái niệm có 72 chữ ký cho
  3 câu thật — thứ tự xáo phương án nằm trong `meta` nên cùng câu xáo lại bị coi là câu mới ⇒ đúng lỗi người học gặp. Ngược lại
  D8 Đồ thị không có `meta` ⇒ mọi câu chung một chữ ký, chống lặp vô dụng. Chỉ tăng kho hay chỉ giảm số câu đều KHÔNG sửa được
  lỗi này, nên làm cả ba việc:
- (1) Chữ ký = `meta` (quy ước: không chứa thứ tự xáo); không có meta thì theo đề + tham số + hình. Test `no-repeat` chạy trên
  22 ngân hàng của cả 3 app: một lượt không bao giờ có hai câu trùng nội dung.
- (2) Giảm số câu — chỉ khi cần: đầu lượt ước lượng số câu khác nhau (`poolSize`); ít hơn 10 thì lượt ngắn lại và nói rõ
  lý do; dạng hết câu mới giữa chừng thì đổi dạng khác, hết hẳn thì kết thúc sớm. Không ra câu lặp để đủ 10.
- (3) Tăng kho: D2 phủ định 8 → 21 mẫu, D4 quy nạp 6 → 11 tổng; câu khái niệm Discrete 25 → 50 (6–7/chương),
  Logic 9 → 12 (Ch4 có câu đầu tiên). Luật soạn câu (D36) bắt được 11 lỗi của chính các câu mới trước khi vào app.

**D41. Lời giải có bảng chân trị thật + bộ kiểm độc lập trước khi ra đề.** (Người học, 2026-09-25: bảng nháp của người học và lời giải
"khác nhau" — thật ra cùng đúng, chỉ khác thứ tự dòng q r p vs p q r; lời giải chỉ in chuỗi bit nên phải mất công đối chiếu.)
- Kiểu dòng lời giải mới `tableLine` (shared/logic/steps.js) vẽ bằng `stepTable` (shared/ui/question.js): cột biến | cột từng
  công thức con, cột kết quả đậm, dòng hai vế khác nhau tô đỏ, dòng được chọn (minterm/maxterm) tô màu nhấn. Dùng cho D1 (bảng
  chân trị, giá trị, phân loại, tương đương) và Logic Ch2 (cổng, cột F, mạch AND–OR, Σm, ΠM). Câu dẫn nói rõ thứ tự biến.
- Kiểm độc lập: `discrete/tests/solution-oracle.test.js`, `logic/tests/solution-oracle.test.js` — bộ đọc + tính công thức VIẾT
  RIÊNG (không import lõi của app), chỉ đọc thứ người học thấy (chữ đề, term trên hình mạch, tên cổng), tính lại đáp án và TỪNG Ô
  bảng lời giải; 300 hạt giống mỗi dạng. Đã thử làm hỏng lõi (sai phép →; sai phép bù ở vài dòng) ⇒ test đỏ ngay.
- Vì sao độc lập: test cũ tính lại đáp án bằng CHÍNH lõi đã sinh đề — lõi sai thì đề, đáp án, lời giải và test cùng sai mà vẫn xanh.

**D42. Gõ căn kiểu sqrt(x) ở mọi ô số + đề thi thử trộn câu.** (Người học, 2026-09-25, làm thử LinAlg Ch1.)
- Gốc lỗi: ô đáp án vector bỏ hết ngoặc trước khi tách số ⇒ "sqrt(10)" bị cắt thành "sqrt" và "10" ⇒ bị từ chối; chỉ ký hiệu √
  mới qua, nên người học phải chép √ từ đề. Sửa ở gốc: MỘT bộ tính (shared/logic/calc.js, hệ 10) dùng cho cả máy tính Nháp lẫn ô đáp án
  LinAlg — thêm sqrt()/√, ^, π, sin cos tan asin acos atan theo ĐỘ, nhân ngầm (2√3, 3sqrt(2)); tách số theo ngoặc lồng nên
  "(1/sqrt(2), 1/sqrt(2))" đọc được. Hệ 2/8/16 giữ nguyên (A–F là chữ số, không phải tên hàm).
- Đề thi thử xáo trộn thứ tự câu (người học thích hơn xếp theo bài giảng: phải tự nhận ra dạng bài, sát đề thật) và không để hai câu
  cùng dạng liền nhau khi còn cách (tham lam: dạng còn quá nửa số câu còn lại thì phải đặt ngay). Bài đang dở từ trước (không có
  `order`) giữ thứ tự cũ để đáp án đã lưu không lệch câu. Luyện tập "cả chương" vốn đã trộn.

**D43. Lịch học kỳ từ 01/09 + "đang học chương nào" suy từ việc người học làm, không từ syllabus.** (Người học, 2026-09-25: "giáo dạy
khác syllabus, lịch học bắt đầu từ 2026/09/01".)
- `SEMESTER_START = '2026-09-01'` (thứ Ba); tuần tính 7 ngày từ ngày đó ⇒ giữa kỳ tuần 8 bắt đầu 20/10, cuối kỳ tuần 16.
- Gốc lỗi: bốn chỗ đoán "chương đã/đang học" theo tuần syllabus (gợi ý luyện, phạm vi đề mặc định, chương mặc định ở Học/Luyện
  tập, thẻ "Tuần này: …" ở trang Tổng quan) ⇒ Discrete Đồ thị (lớp học từ tuần 4, syllabus để tuần 9) bị loại khỏi gợi ý và khỏi
  đề mặc định. Sửa ở gốc: một hàm thuần `studiedChapters` (shared/logic/progress.js) = các chương đã làm ít nhất một câu (luyện
  tập, câu kiểm tra trong bài học, thi thử), mới nhất trước; mọi chỗ trên gọi nó. Chưa làm câu nào ⇒ mọi chương.
- Không dùng "đã mở bài học": app gắn bài học của mọi chương lúc khởi động nên dấu `lesson-chN` luôn có. Không thêm ô để người học tự
  khai chương đã học: nhật ký làm câu đã đủ và không phải nhớ cập nhật; chọn tay vẫn có ở màn chọn đề.
- Trang Tổng quan bỏ dòng "Tuần này / Sau đó" theo syllabus (sai với lớp thật); nút "Học" mở màn Học, nơi tự mở chương đang học.
  Tên chủ đề từng tuần trong syllabus.js giữ lại chỉ làm trọng số độ dài chương khi chia thời gian bài full (`chapterWeeks`).

**D44. Bộ kiểm độc lập cho cả 25 dạng tính toán LinAlg (D41 mở rộng).** (Người học, 2026-09-25: sửa hết lỗi quan trọng trước.)
- `linalg/tests/solution-oracle.test.js` không import gì từ `src/logic` ngoài hàm sinh đề. Nó đọc chữ/hình người học thấy (vector
  trong đề, hệ phương trình trên hình, ma trận trên hình), tự tính lại đáp án bằng bộ khử Gauss–Jordan riêng, và dò lời giải:
  (1) làm lại từng phép "R2 ← R2 − 2R1" trên ma trận in ở bước trước, phải ra đúng ma trận in ở bước này; ℓᵢⱼ = a/b phải đúng
  là hai số trên ma trận; L·U in ra phải bằng A; (2) mọi dấu "=" trong một dòng mà hai vế đều tính được thì phải bằng nhau.
  300 câu mỗi dạng. Thử đột biến 7 kiểu (hỏng một bước khử, sai tích vô hướng, ℓ sai dấu, dim N(A) = m − r, (AB)ᵢⱼ dùng sai
  cột, sai vector đơn vị, sai cos θ, sai det) ⇒ lần nào cũng đỏ.
- Lỗi thật bắt được: câu "hệ có mấy nghiệm" 3 ẩn có thể ra cột z toàn 0 ⇒ đề chỉ hiện x, y, người học tưởng 2 ẩn và chọn
  "duy nhất" thay cho "vô số". Sửa ở gốc: bộ sinh hệ suy biến bỏ ma trận có cột 0 (cả tab Ví dụ dùng chung), đề ghi rõ các ẩn.

**D45. Bộ kiểm độc lập cho Logic Ch1, Ch3, Ch4 (D41 mở rộng).**
- Ba file `logic/tests/solution-oracle-ch{1,3,4}.test.js` + bộ đọc biểu thức Mano dùng chung (`oracle-kit.js`, thêm ⊕).
  Ch1: tự đổi cơ số/bù/số có dấu/mã bằng số nguyên thường, dò từng dòng (phép chia liên tiếp, trọng số, nhóm bit, cộng trong hệ r,
  lật bit, bảng mã, từng dòng Gray). Ch3: KHÔNG dùng Quine–McCluskey của app — vét cạn 3ⁿ khối lấy implicant nguyên tố, quay lui
  tìm phủ ít literal nhất; kiểm từng nhóm khoanh (đúng ô, là PI, nhãn EPI). Ch4: cộng bit tay, tràn số suy từ khoảng −8…7 (không
  từ C₄ ⊕ C₃), đọc mạch từ hình và dò từng ô bảng. Đột biến 5 kiểu (sai phép chia, nhãn EPI, bit tổng, thứ tự ngõ MUX, bảng) đều đỏ.
- Lỗi thật bắt được: dạng "rút gọn có don't care" ~18% câu không có ô d nào (thành câu SOP thường) ⇒ bộ sinh bắt buộc có ô d.
- Lời giải dễ dò hơn: dạng phân tích mạch vẽ bảng chân trị x y z | T₁ T₂ F (trước chỉ in chuỗi bit từng cổng — đúng yêu cầu D41);
  bỏ dòng thừa "= 112 = 112" khi đổi cơ số một hạng tử; "3 + (−7) = −4" thay cho "3 + -7 = -4".

**D46. Bộ kiểm độc lập cho Discrete D2–D8 — xong phủ mọi dạng tính toán của cả 3 app.**
- `discrete/tests/solution-oracle-d2-d5.test.js`, `…-d6-d8.test.js`, không import number-theory.js / graph.js / quant.js.
  D2: tự đọc công thức lượng từ, thử trên mọi diễn giải miền {0, 1} và 300 diễn giải ngẫu nhiên miền {0, 1, 2} — đáp án phủ định
  phải tương đương, mọi nhiễu phải KHÔNG tương đương; phần tử chứng minh / phản ví dụ trong lời giải đúng thật. D3: phép tập hợp,
  đếm, xét hàm từ chữ đề. D4: đọc chuỗi tổng từ chữ (số hạng cuối là số hạng tổng quát, các số hạng đầu phải khớp), kiểm công thức
  đóng n = 1…12, chọn đúng bước quy nạp bằng đẳng thức theo k. D5: BFS bình nước riêng (chuỗi đổ hợp lệ và ngắn nhất), vét cạn tem.
  D6–D7: từng dòng Euclid, Pulverizer, bình phương liên tiếp, phân tích thừa số và φ. D8: đọc cạnh trên hình, tự BFS (từng tầng),
  thành phần, tô 2 màu (chu trình lẻ in ra là chu trình thật), Havel–Hakimi từng bước, vét cạn đẳng cấu (song ánh in ra giữ cạnh).
  Đột biến 7 kiểu đều đỏ.
- Sửa: câu "không đẳng cấu" từng có lời giải "thử mọi cách ghép đều sai" — người học không dò tay được, đi thi cũng không viết
  được. Nay bộ sinh chỉ ra cặp không đẳng cấu khi có bất biến nêu được (số tam giác, hai phía…), bỏ khoá s8.noMap.

- **D47. Bản online qua worker của Study Hub, repo vẫn riêng (2026-09-26).** Người học dùng chủ yếu link worker, muốn giữ 2 repo
  (Study Hub dùng lại cho các kỳ sau). Chọn "2 repo, 1 worker": build của Study Hub tải đúng commit CAU_Math ghi trong
  `math.lock`, chạy `vite build` ở đây (thêm `rollupOptions.input` 4 trang) rồi chép 3 app vào `dist` của hub ⇒ một link,
  một lần đăng nhập, link "cần luyện" trong hub mở thẳng dạng bài. Repo này không cần mã deploy riêng; bản online không có
  `/__sync` (app tự tắt đồng bộ thư mục, D37) — đồng bộ tiến độ trên bản online do hub lo (Study Hub D33).

- **D48. Câu khái niệm lấy từ đề/bài có lời giải bên ngoài, không phụ thuộc AI phái sinh (2026-09-26).** Câu do Gemini sinh
  (D27) quá ít và phải duyệt từng câu; nguồn thật (đề thi có lời giải, lời giải của tác giả sách) thì nhiều và đã được kiểm.
  Quy trình: (1) lọc nguồn đúng chương/mục giáo trình, có lời giải, giấy phép cho dùng; (2) lấy đáp án nguồn làm mẫu, tự diễn
  đạt lại (VI/EN), ghi nguồn tới số bài; (3) dạng tính được thì gắn `check` — test chạy lại bằng bộ giải của app
  (`<app>/src/logic/concept-check.js`), đáp án nguồn sai là test đỏ; chỉ sửa khi nguồn sai; (4) qua `validateItem` + test.
  Câu không được tham chiếu câu khác ("như trên") vì câu được xáo. Lô đầu LinAlg: 22 câu (ch1–ch3) từ MIT OCW 18.06 S2010
  Quiz 1, 18.06SC F2011 Unit 1 Exam (CC BY-NC-SA) và lời giải Strang ILA 6th ed. ch1; thêm `concept-check.js` cho LinAlg
  (dims, system, solves, product, inverse). Thử đột biến 5 đáp án nguồn đều bị bắt. Gemini (scripts/gen/) chỉ còn để lấp chỗ
  không có nguồn.

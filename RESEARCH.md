# RESEARCH.md — Khảo sát UX cho 3 app ôn tập

Khảo sát 2026-09-24. Người học yêu cầu: "UX-UI giống toeic-app; cách giảng bài, giao bài tập cho chọn dạng
hoặc chọn một bài tập full (60–90 phút); tìm thêm web bên ngoài". Chỉ ghi thứ quan sát được hoặc có tài
liệu gốc; học cách trình bày, không lấy nội dung.

## Nguồn

| Nguồn | Xem được gì |
|---|---|
| toeic-app (bản chạy thật + mã nguồn + DECISIONS D36–D67) | Điều hướng, thẻ bài có "N câu · ~M phút · đúng X%", thi thử, kết quả |
| [Khan Academy — Mastery](https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work) | Bậc luyện theo kỹ năng → quiz vài kỹ năng → unit test cả chương |
| [Math Academy — How it works](https://www.mathacademy.com/how-it-works) | Bài học = ví dụ mẫu → 2–5 câu cùng dạng; quiz tính giờ, không xem lại bài |
| [Brilliant](https://brilliant.org/about/) · [phân tích UX](https://screensdesign.com/showcase/brilliant-learn-by-doing) | Mỗi bài một ý; 2–4 câu giới thiệu rồi hỏi ngay; gợi ý không lộ đáp án |
| [Bluebook (SAT số)](https://bluebook.collegeboard.org/students/tools) | Công cụ phòng thi: đồng hồ ẩn được + báo 5 phút, đánh dấu, danh sách câu, bảng công thức |
| [GOV.UK — Question pages](https://design-system.service.gov.uk/patterns/question-pages/) | Một việc một trang; nút tiếp đặt trái; "Câu 3/9" đủ, lưới câu tốn chỗ trên điện thoại |
| [Dunlosky và cộng sự 2013](https://pubmed.ncbi.nlm.nih.gov/26173288/) | Tự kiểm tra + học giãn cách: hiệu quả cao; xen kẽ dạng bài: trung bình khá; đọc lại, tô đậm: thấp |
| [Renkl & Atkinson — fading](https://link.springer.com/article/10.1023/B:TRUC.0000021815.74806.f6) | Ví dụ mẫu rút dần từng bước tốt hơn xen kẽ "ví dụ đủ ↔ bài tự làm" |

## Điều lấy — áp dụng vào kế hoạch U1–U4

**U-R1. Điều hướng theo VIỆC, không theo chương** (toeic D36/D43/D54). Cột trái trên máy tính, thanh đáy trên
điện thoại. Mục: Tổng quan · Học · Luyện tập · Thi thử. Chương là NHÓM bên trong mỗi mục (`navGroup`).
Trang hiện tại xếp theo chương rồi mới tới 4 tab con ⇒ muốn "làm một đề" phải biết nó nằm ở chương nào.

**U-R2. Mỗi lựa chọn nói trước giá phải trả** (toeic R1). `10 câu · ~8 phút · đúng 70% (7 ngày)`.
Chưa làm thì "chưa làm câu nào". Đánh dấu một chỗ "← cần nhất" bằng bộ chấm điểm có lý do (toeic D52).

**U-R3. Ba cỡ bài, người học tự chọn** (Khan: luyện kỹ năng → quiz → unit test; Math Academy: chọn việc).
- *Theo dạng* — 10 câu một dạng, chấm ngay từng câu, có gợi ý + lời giải (đã có).
- *Trộn chương* — 10–15 câu xen kẽ các dạng của một chương (Dunlosky: xen kẽ giúp nhớ lâu).
- *Bài full 60–90 phút* — chọn chương + thời lượng; số câu tính theo thời gian chuẩn TỪNG DẠNG
  (rút gọn K-map ~3 phút, đổi cơ số ~1 phút), không theo số câu cố định.

**U-R4. Bài full chạy như phòng thi** (toeic D38/D47/D67 + Bluebook):
- ẩn menu; đồng hồ đếm ngược ẩn được, tự hiện lại và báo khi còn 5 phút; hết giờ thì tự nộp;
- danh sách câu gập vào (GOV.UK: lưới câu tốn chỗ), có câu đã làm / đánh dấu / chưa làm;
- nộp sớm phải xác nhận, báo số câu còn trống và đang đánh dấu;
- chưa nộp thì không lộ đáp án; F5 giữa bài vẫn đúng đề (lưu hạt giống, toeic D47);
- nháp và bảng công thức mở được trong lúc thi (Bluebook có bảng công thức).

**U-R5. Màn kết quả trả lời 3 câu** (toeic D51 `sessionDone`): làm được bao nhiêu (điểm /10 và %) ·
yếu ở đâu (theo chương, theo dạng) · làm gì tiếp ("Luyện lại 3 dạng sai nhất" → mở thẳng chế độ theo dạng).
Xem lại từng câu sai kèm lời giải, tab theo chương.

**U-R6. Bài học = chuỗi "điểm kiến thức"** (Math Academy KP, Brilliant, Renkl):
khái niệm 2–4 câu + hình → **ví dụ mẫu bấm "Bước tiếp" để hiện từng bước** → 2–3 câu tự làm cùng dạng;
đúng 2 câu liên tiếp mới sang điểm sau, sai thì cho thêm câu. Chọn học cả chương hoặc một dạng.

**U-R7. Giao diện theo toeic-app:** nền gần trắng, mặt thẻ trắng, viền mảnh, một màu nhấn;
chữ hệ thống; cột nội dung ~44rem ở giữa; nút chính xanh đậm ghi 2 dòng (việc · giá); thẻ chọn là nút
cả khối; chuyển màn bằng View Transitions ngắn (toeic D59). Biểu thức vẫn dùng chữ toán STIX như sách.

**U-R8. Tổng quan = "hôm nay làm gì"** ở trên, số liệu ở dưới: học tuần này (phút) · đúng 7 ngày ·
**còn N ngày tới giữa kỳ** (syllabus tuần 8) · thanh % theo chương.

## Điều CỐ Ý không lấy

- **Streak, XP, bảng xếp hạng** (Brilliant, Math Academy). Cùng lý do toeic D51: nhịp học không đều thì chuỗi
  ngày thành lời nhắc thất bại. Dùng tiến độ cộng dồn.
- **Khoá bài theo cây kiến thức** (Math Academy): app một người dùng, người học tự biết học tới đâu theo syllabus.
- **Kiểm tra đầu vào 30–45 phút**: không cần — môn đang học song song trên lớp.
- **Nội dung của các nền tảng trên**: chỉ học cách trình bày.

## Đề trong giáo trình Mano & Ciletti (khảo sát 2026-09-24, sau phản hồi "không hiểu đề hỏi gì")

Nguồn (chỉ đọc cách ra đề, không chép đề — sách còn bản quyền):
- ECE-223 (U. Waterloo), lời giải Assignment #1, Mano *Digital Design* bản 3 — [PDF](https://ece.uwaterloo.ca/~msachdev/ECE223/Assignment1_Solution_3rd_edition.pdf).
  Đọc được nguyên văn Chương 1: bài 1.4, 1.7–1.10, 1.16, 1.18, 1.24.
- Bài tập Chương 3 (Hunter College) và slide Chương 1–3 của một khoá dùng Mano — tìm thấy nhưng PDF nén, chưa đọc được;
  cấu trúc bài Chương 2–3 lấy từ mô tả kết quả tìm kiếm (rút gọn tới số literal tối thiểu, K-map 3–4 biến, PI/EPI, NAND/NOR).
- Syllabus môn ghi giáo trình chính: Mano & Ciletti, *Digital Design* (Logic); Strang (Linear); Lehman–Leighton–Meyer (Discrete).

**Cách Mano viết đề** (5 điểm chung):
1. **Động từ + đối tượng + thủ tục nói rõ.** "Perform subtraction on the following unsigned binary numbers using 2's complement of the
   subtrahend. Where the result should be negative, 2's complement it and affix a minus sign." — người học biết làm *bằng cách nào* và
   *ghi kết quả ra sao*, không phải đoán.
2. **Số luôn kèm cơ số dưới chân:** (4310)₅, (198)₁₂, (10110.0101)₂. Không có "số này ở hệ nào?".
3. **Nhiều ý (a)–(e) cùng một lệnh** để luyện biến thể: "Obtain the 1's and 2's complements of the following binary numbers".
4. **Có cả câu hỏi "vì sao"** ("Explain why the decimal answer in (b) is 8 times that of (a)") và "hai cách, cách nào nhanh hơn" (đổi thẳng
   hay qua hex) — hỏi hiểu, không chỉ tính.
5. **Đa dạng miền số:** cơ số lạ (5, 12), có phần lẻ, bù 1 và bù 2 cùng lúc, mã BCD / excess-3 / 2421 cho *cùng một số* để so sánh.

**So với app trước phiên này** (đối chiếu đề thật của app):
- Đề dùng từ rút gọn và lẫn ("bù 2 (r's complement) ở cơ số 2", "cột F", "literal", "viết bằng tích và dấu ′") mà không giải thích tại chỗ.
- **Không nói phải nhập gì theo định dạng nào** (chỉ có ô "Nhập đáp án") — điều Mano luôn nêu rõ ở điểm 1.
- **Miền câu quá hẹp:** cổng logic chỉ 6 câu khác nhau (1 cổng bị hỏi 3 lần / 10 câu), NAND 6 biểu thức cố định, XOR 4 kiểu.
  Đề thật đổi số 2 ↔ 3 ngõ vào, đổi biểu thức liên tục.
- Chưa có câu "vì sao"; chưa có so sánh nhiều cách (chuyển sang Phase 3, bài học từng bước).

**Trắc nghiệm ngang tự luận:** phương án nhiễu là *lỗi thật* (đọc số dư từ trên xuống, quên +1 khi bù, nhầm dạng biểu diễn, bỏ một nhóm
K-map, hàm lẻ ↔ chẵn…), do chính bộ chấm tự luận xác nhận là sai; chọn sai vẫn nhận lời chẩn đoán. Không dùng nhiễu ngẫu nhiên —
loại được bằng cách nhìn độ dài hay kiểu chữ thì dễ hơn đề tự luận.


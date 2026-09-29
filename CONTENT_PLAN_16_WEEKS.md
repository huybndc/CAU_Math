# Kế hoạch hoàn thiện nội dung 16 tuần

## Mục tiêu

Biến syllabus của Logic Circuit, Linear Algebra và Discrete Math thành ba bộ ôn tập dùng được trọn học kỳ: lý thuyết VI/EN, ví dụ giải từng bước, ngân hàng câu hỏi, chấm đáp án có kiểm chứng độc lập và công cụ tương tác khi phù hợp. Kế hoạch bám chủ đề từng tuần trong `shared/logic/syllabus.js`; không tự thêm nội dung môn học chưa được xác nhận.

## Thứ tự nguồn

1. Tài liệu/slide giảng viên dùng trực tiếp trên lớp là nguồn nội dung ưu tiên cao nhất. PDF người học cung cấp chỉ dùng cục bộ để đối chiếu; không đưa file, trích đoạn dài hay đường dẫn cá nhân vào repo.
2. Syllabus là căn cứ xác định phạm vi và thứ tự tuần.
3. Giáo trình ghi dưới đây dùng để lấp chỗ slide chưa giải thích đủ; diễn đạt lại, ghi chương/mục cụ thể. Câu lấy từ nguồn bài tập bên ngoài phải có đáp án, giấy phép phù hợp và trích dẫn cụ thể; câu tự sinh chỉ lấp phần không có nguồn phù hợp.
4. Khi chưa có tài liệu lớp cho một chủ đề, có thể làm bản nháp dựa trên giáo trình, nhưng phải ghi rõ trạng thái `draft` và kiểm tra lại trước khi coi là nội dung chính thức.

Giáo trình nền hiện ghi trong mã: Logic — *Digital Design* (Mano, 6th ed.); Linear Algebra — *Introduction to Linear Algebra* (Strang, 4th ed.); Discrete — *Mathematics for Computer Science* (MIT 6.042J, 2017), dùng Rosen làm tài liệu nền theo phạm vi môn.

## Bản đồ tuần

| Tuần | Logic Circuit | Linear Algebra | Discrete Math | Trạng thái hiện tại |
|---|---|---|---|---|
| 1 | Định hướng, chẩn đoán đầu vào; xác nhận lịch thực dạy | Định hướng, chẩn đoán đầu vào | Định hướng, chẩn đoán đầu vào | Chưa có nội dung tuần trong syllabus; không tự thêm kiến thức mới |
| 2 | Ch1 hệ đếm/mã; mở đầu Ch2 Boolean | 1.1–1.3 vector | Mệnh đề và chứng minh | Có lesson/bank nền; rà đủ theo syllabus |
| 3 | Ch2 đại số Boolean và cổng | 2.1–2.3 khử Gauss | Lượng từ, chứng minh; tập hợp và hàm | Có lesson/bank nền; rà đủ theo syllabus |
| 4 | Ch3 rút gọn cấp cổng | 2.4–2.7 phép toán ma trận, nghịch đảo, LU, chuyển vị | Quy nạp | LinAlg có thẻ nháp VI/EN, bank/check và tool nhân ma trận; chờ đối chiếu tài liệu lớp |
| 5 | Ch3 rút gọn cấp cổng | 3.1–3.2 không gian con, N(A) | Bất biến và quy nạp mạnh | Có nội dung nền |
| 6 | Ch4 mạch tổ hợp, phần 1 | 3.3–3.4 hạng, nghiệm đầy đủ | Chia hết và gcd | Có Ch4 và D6; đang bổ sung kiểm tra underflow theo tài liệu lớp |
| 7 | Ch4 mạch tổ hợp, phần 2 | 3.5–3.6 cơ sở, bốn không gian con | Số học và RSA | Có nội dung nền |
| 8 | Ôn tập/thi giữa kỳ; đề phủ phạm vi tuần 2–7 | Ôn tập/thi giữa kỳ | Ôn tập/thi giữa kỳ | Cần lập blueprint, đề có seed và oracle |
| 9 | Ch5 mạch tuần tự đồng bộ | 4.1–4.2 trực giao, hình chiếu | Đồ thị cơ bản | Ch5/LinAlg Ch4 còn thiếu; D8 đã có nền |
| 10 | Ch5 mạch tuần tự đồng bộ | 4.3–4.4 bình phương tối thiểu, Gram–Schmidt | Bài toán ghép cặp | Phần nâng cao còn thiếu |
| 11 | Ch5 mạch tuần tự đồng bộ | Ch5 định thức | Cây khung nhỏ nhất | Phần nâng cao còn thiếu |
| 12 | Ch6 thanh ghi và bộ đếm | 6.1–6.2 trị riêng, chéo hóa | Mạng truyền thông | Phần nâng cao còn thiếu |
| 13 | Ch6 thanh ghi và bộ đếm | 6.3–6.4 phương trình vi phân, ma trận đối xứng | Quan hệ, thứ tự bộ phận, lập lịch | Phần nâng cao còn thiếu |
| 14 | Ch7 bộ nhớ và logic lập trình được | 6.5–6.6 xác định dương, đồng dạng | Tổng và tiệm cận | Phần nâng cao còn thiếu |
| 15 | Ch7 bộ nhớ và logic lập trình được | 6.7 SVD | Ôn tập/tích hợp; xác minh nội dung lớp trước khi thêm chủ đề mới | Chưa có chủ đề Discrete trong syllabus hiện tại |
| 16 | Ôn tập/thi cuối kỳ | Ôn tập/thi cuối kỳ | Ôn tập/thi cuối kỳ | Cần lập blueprint và bộ đề phủ syllabus |

## Hiện trạng và ưu tiên

### P0 — Chốt nền đến giữa kỳ (tuần 2–8)

- Logic Ch1–4 và Linear Ch1–3 đã có lesson, bank và test nền; rà từng mục syllabus để đánh dấu đủ/thiếu theory, examples, bank, checker/oracle, tools. Không coi “đã có chương” là đã phủ đủ đề cương.
- Discrete D1–D8 đã có nội dung nền. Rà đối chiếu D1–D7 với tuần 2–7 và D8 với tuần 9; giữ blueprint giữa kỳ riêng.
- Ưu tiên Ch4 Logic theo tài liệu lớp đang có. Phần bổ sung đầu tiên là unsigned underflow, kèm câu hỏi, chấm đáp án, lời giải và oracle.
- Linear tuần 4: đã bổ sung thẻ nháp cho phép nhân ma trận, nghịch đảo, LU và chuyển vị; bank/check/oracle đã có, thêm tool thử AB theo kích thước và từng ô. Đối chiếu lại với tài liệu lớp trước khi chuyển sang `ready`.
- Lập đề cương đề giữa kỳ cho cả ba môn từ đúng các tuần đã học; chưa sinh đề cố định nếu chưa kiểm tra phân bố/chủ đề thực dạy.

### P1 — Xây phần sau giữa kỳ (tuần 9–14)

- Logic: Ch5 trước, rồi Ch6, Ch7; mỗi chương gồm state/transition examples, bài tập tính tay, answer checks và công cụ mô phỏng phù hợp.
- Linear: Ch4 Orthogonality trước Ch5 Determinants, rồi Ch6 Eigenvalues/SVD; tái dùng vector, matrix, elimination và hình học đã có.
- Discrete: sau D8 bổ sung lần lượt matching, minimum spanning trees, communication networks, relations/partial orders/scheduling, sums/asymptotics; dùng MCS 2017 làm khung và đánh dấu draft cho đến khi đối chiếu tài liệu lớp.

### P2 — Hoàn thiện cuối kỳ (tuần 15–16)

- Chốt chủ đề thực dạy tuần 15, đặc biệt Discrete; không suy diễn từ lịch trống.
- Tạo đề cuối kỳ theo blueprint, seed tái lập, chấm theo giá trị/tính chất và oracle độc lập cho mọi dạng tính toán.
- Chạy rà soát song ngữ, coverage, hướng dẫn sai, tools và build trước khi coi mỗi phần là hoàn tất.

## Tiêu chí hoàn tất cho mỗi chủ đề

- Lý thuyết VI/EN bám đúng syllabus và nguồn lớp; mục tiêu học tập, thuật ngữ, ví dụ mẫu và lỗi thường gặp.
- Mỗi dạng bài có stem rõ, đáp án có thể tính/kiểm lại, lời giải đến đáp án; nguồn ngoài có trích dẫn và quyền sử dụng phù hợp.
- Bộ sinh được kiểm tra nhiều seed; trắc nghiệm không có nhiễu đúng ngoài ý muốn; kiểm tra số học dùng oracle độc lập, không gọi lại implementation đang kiểm.
- Có công cụ tương tác khi nó làm rõ phép biến đổi/quy trình; không tạo tool chỉ để đủ checklist.
- VI/EN đồng bộ heading và khóa dịch; lesson check liên kết đúng kind; `npm test`, `npm run check`, `npm run build` pass.
- Chỉ chuyển từ `draft` sang `ready` sau khi nội dung lớp được đối chiếu và kiểm tra đủ các gate trên.
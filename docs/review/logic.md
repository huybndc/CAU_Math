# Đề cương ôn cuối kỳ: Logic Circuit

Sách: M. Morris Mano, *Digital Design* (6th ed.). Phạm vi lấy theo slide lớp đã có đến ngày 2026-11-10 (chương 1–4 và chương 5 phần 1). Ngày thi cuối kỳ chưa có thông báo chính thức; lịch dưới đây dùng mốc tạm là tuần 16 (2026-12-14 đến 2026-12-18).

Dạng đề: theo đề giữa kỳ thật. Ít câu lớn, mỗi câu nhiều ý từ dễ đến khó, ý sau dùng kết quả ý trước. Giáo không cho điểm từng phần: một ý đúng hết thì đủ điểm, sai một chỗ thì 0. Giáo nói đề cuối kỳ có thể đổi dạng.

## Chủ đề theo thứ tự

| # | Chủ đề | Mục sách | Dạng câu hay gặp |
|---|---|---|---|
| 1 | Hệ đếm, số bù, mã BCD, Excess-3, 2421, Gray | 1.2–1.7 | Đổi mã; đọc bảng mã cho sẵn để rút quy luật |
| 2 | Đại số Boole, dạng chính tắc Σm và ΠM | 2.4–2.6 | Viết Σm từ bảng chân trị; rút gọn có nêu tên định luật |
| 3 | K-map 3 và 4 biến, don't-care, SOP và POS tối thiểu | 3.2–3.5 | Điền K-map đúng trục; SOP tối thiểu; POS tối thiểu |
| 4 | NAND và NOR hai tầng | 3.6 | Đổi SOP sang mạch chỉ dùng NAND |
| 5 | Quy trình thiết kế mạch tổ hợp, chuyển mã | 4.4 | BCD sang 7 đoạn; BCD sang Excess-3, Gray, 2421 |
| 6 | Full adder, bộ cộng-trừ 4 bit, overflow | 4.5 | Viết S và C; vẽ adder-subtractor bằng FA và XOR |
| 7 | BCD adder và biến thể (Excess-3 adder) | 4.6 | Lập bảng tổng 0–19, tìm điều kiện sửa, vẽ mạch |
| 8 | Bộ nhân, bộ so sánh | 4.7–4.8 | Biểu thức E, G, L; vẽ mạch so sánh 2 bit |
| 9 | Decoder, encoder, MUX, three-state | 4.9–4.11 | Thực hiện hàm bằng decoder + OR hoặc bằng MUX |
| 10 | Latch: SR (NOR, NAND), SR có điều khiển, D latch | 5.3 | Bảng chức năng; trạng thái cấm; dò Q theo chuỗi vào |
| 11 | Flip-flop D, JK, T; kích cạnh, master-slave | 5.4 | Bảng đặc tính, phương trình đặc tính; dựng JK hoặc T từ D |
| 12 | Phân tích mạch tuần tự đồng bộ; Mealy và Moore | 5.5 | Phương trình trạng thái, bảng trạng thái, sơ đồ trạng thái, dò chuỗi vào |

Chưa có slide (sẽ thêm vào đề cương và đề khi lớp học tới): rút gọn trạng thái và quy trình thiết kế (5.7–5.8), thanh ghi và bộ đếm (chương 6), bộ nhớ (chương 7).

## Lịch ôn (tuần 12 bắt đầu 2026-11-16)

| Tuần | Từ ngày | Ôn | Làm |
|---|---|---|---|
| 12 | 11-16 | Chủ đề 10–12: latch, flip-flop, phân tích mạch tuần tự | 1 đề Exlab, chỉ làm câu 3 và 4 |
| 13 | 11-23 | Chủ đề 3–5: K-map, don't-care, POS, chuyển mã | 1 đề Exlab, chỉ làm câu 1; tự làm thêm POS |
| 14 | 11-30 | Chủ đề 6–9: adder, BCD adder, comparator, decoder, MUX | 1 đề Exlab, chỉ làm câu 2; vẽ lại Fig. 4.13 và 4.14 |
| 15 | 12-07 | Phần mới của tuần 12–14 (khi có slide) và điểm yếu | 2 đề Exlab trọn vẹn, bấm giờ 60 phút |
| 16 | 12-14 | Thi (ngày chưa rõ) | Xem lại cheatsheet và các ý đã sai |

## Đề Exlab

Mỗi mã đề cho 4 câu, 200 điểm, 60 phút: K-map thiết kế (40), thiết kế mạch (65), flip-flop (35), phân tích mạch tuần tự (60). Đây là đề tự soạn, không phải đề thật của giáo.

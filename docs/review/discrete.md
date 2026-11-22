# Đề cương ôn cuối kỳ: Discrete Math

Sách: Lehman, Leighton, Meyer, *Mathematics for Computer Science* (MIT 6.042J, bản 2017). Phạm vi lấy theo bài học trong vault W09–W12. Giữa kỳ đã thi đến cây khung, nên đề cuối kỳ ở đây chỉ lấy phần sau giữa kỳ. Ngày thi cuối kỳ chưa có thông báo chính thức; lịch dưới đây dùng mốc tạm là tuần 16 (2026-12-14 đến 2026-12-18).

Dạng đề: theo lời giáo trong giờ. Câu khái niệm trả lời ngắn và chứng minh ngắn. Giáo nhắc "quy tắc một phần ba" nhưng bản ghi chưa rõ nội dung; nên hỏi lại giáo.

## Chủ đề theo thứ tự

| # | Chủ đề | Buổi | Dạng câu hay gặp |
|---|---|---|---|
| 1 | Mạng truyền thông: cây, mảng 2D, butterfly | W09 | Số switch, diameter, congestion theo $N$ |
| 2 | Mạng Beneš | W09–W10 | Hai cổng chung switch tầng đầu ($i$ và $i+N/2$); chứng minh congestion 1 bằng quy nạp và tô 2 màu |
| 3 | Euler tour, Euler walk, Hamiltonian cycle | W10 | Xét bậc chẵn/lẻ để kết luận |
| 4 | Đồ thị có hướng, ma trận kề, đếm walk | W10 | Ô $(i,j)$ của $A^k$; chứng minh định lý đếm walk bằng quy nạp |
| 5 | Liên thông mạnh, DAG | W10 | Định nghĩa; kiểm trên ví dụ nhỏ |
| 6 | Quan hệ: phản xạ, đối xứng, bắc cầu; tương đương; thứ tự bộ phận | W10 | Kiểm tính chất của một quan hệ cho bằng danh sách cặp |
| 7 | Giá trị hiện tại, annuity, tổng cấp số nhân, lãi kép | W11 | Phương pháp perturbation; annuity $n$ năm và vô hạn; thời gian gấp đôi |
| 8 | Kẹp tổng bằng tích phân (hàm tăng, hàm giảm); số điều hòa; cận của $n!$ | W11–W12 | Cận trên và cận dưới của $S$; $H_n=\Theta(\ln n)$; $n^n/e^{n-1}\le n!\le n^{n+1}/e^{n-1}$ |
| 9 | Ký hiệu tiệm cận $\sim$, $O$, $\Omega$, $\Theta$ | W11–W12 | Định nghĩa; tính giới hạn $f/g$; tìm $c$ và $x_0$ |

Chưa học (sẽ thêm vào đề cương và đề khi lớp học tới): các quy tắc đếm. Buổi W10 chỉ mở đầu bằng việc đếm thời gian và bộ nhớ, chưa có công thức nên đề không hỏi.

## Lịch ôn (tuần 12 bắt đầu 2026-11-16)

| Tuần | Từ ngày | Ôn | Làm |
|---|---|---|---|
| 12 | 11-16 | Chủ đề 1–2: mạng, Beneš | 1 đề Exlab, làm câu 2 (a, b) và tự chứng minh Beneš |
| 13 | 11-23 | Chủ đề 3–6: Euler, đồ thị có hướng, quan hệ | 1 đề Exlab, làm câu 1 và câu 2 |
| 14 | 11-30 | Chủ đề 7–9: annuity, kẹp tổng bằng tích phân, ký hiệu tiệm cận | 1 đề Exlab, làm câu 2 (phần tiệm cận), câu 3 và câu 4 |
| 15 | 12-07 | Điểm yếu của tuần 12–14 | 2 đề Exlab trọn vẹn, bấm giờ 60 phút |
| 16 | 12-14 | Thi (ngày chưa rõ) | Xem lại định nghĩa và các chứng minh đã sai |

## Đề Exlab

Mỗi mã đề cho 4 câu, 200 điểm, 60 phút: 4 định nghĩa, trong đó 1 định nghĩa về ký hiệu tiệm cận (40); 5 câu trả lời ngắn (50): mạng hoặc Beneš, Euler hoặc walk, quan hệ hoặc thời gian gấp đôi, giới hạn $f/g$ cho $\sim$, và $O$ với $c$, $x_0$; annuity hoặc kẹp tổng bằng tích phân (50); một chứng minh (60): quy nạp, cận tích phân, hoặc $\Theta$ theo định nghĩa. Số câu, điểm và thời gian không đổi. Đây là đề tự soạn, không phải đề thật của giáo.

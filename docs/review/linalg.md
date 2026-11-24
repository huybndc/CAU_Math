# Đề cương ôn cuối kỳ: Linear Algebra

Sách: Gilbert Strang, *Introduction to Linear Algebra* (số mục theo bản 4th). Phạm vi lấy theo slide chương 4 và chương 5 của giáo và bài học trong vault. Giữa kỳ đã thi chương 1 đến 3.4, nên đề cuối kỳ ở đây chỉ lấy phần sau giữa kỳ. Ngày thi cuối kỳ chưa có thông báo chính thức; lịch dưới đây dùng mốc tạm là tuần 16 (2026-12-14 đến 2026-12-18).

Dạng đề: theo đề giữa kỳ thật, 200 điểm trong 120 phút. Mỗi câu nhiều ý, ý sau dùng kết quả ý trước. Đề cuối kỳ thật có thể thêm câu Đúng/Sai.

## Chủ đề theo thứ tự

| # | Chủ đề | Mục sách | Dạng câu hay gặp |
|---|---|---|---|
| 1 | Độc lập và phụ thuộc tuyến tính | 3.5 | Giải $Ax=0$ để kiểm; tìm tổ hợp cho ra $0$ |
| 2 | Span, basis, dimension | 3.5 | Basis của span là cột pivot của $A$; số chiều không gian ma trận (đối xứng, tam giác trên, đường chéo) |
| 3 | Bốn subspace và số chiều | 3.6 | Basis và dim của $C(A)$, $C(A^T)$, $N(A)$, $N(A^T)$ từ $R$ |
| 4 | Trực giao của bốn subspace | 4.1 | $N(A)\perp C(A^T)$, $N(A^T)\perp C(A)$; kiểm $b\in C(A)$ bằng $y^Tb=0$ |
| 5 | Chiếu lên đường thẳng | 4.2 | $\hat x$, $p$, $P=aa^T/a^Ta$, $P^2=P$, $e\perp a$ |
| 6 | Chiếu lên subspace | 4.2 | Phương trình chuẩn, $p$, $e$, $P=A(A^TA)^{-1}A^T$ |
| 7 | Bình phương tối thiểu | 4.3 | Khớp đường $C+Dt$; $\hat C,\hat D$; $p$, $e$, $\|e\|^2$; $e\in N(A^T)$ |
| 8 | Cơ sở trực chuẩn, Gram–Schmidt, $A=QR$ | 4.4 | Các bước Gram–Schmidt; $Q^TQ=I$, $\|Qx\|=\|x\|$; $R=Q^TA$; giải $Rx=Q^Tb$ |
| 9 | Tính chất của định thức, công thức pivot | 5.1–5.2 | $\det$ bằng khử; $\det(2A)$, $\det(A^{-1})$, $\det(A^TA)$; tìm $c$ để ma trận suy biến |
| 10 | Cofactor, ma trận nghịch đảo, quy tắc Cramer | 5.2–5.3 | Khai triển theo hàng; $A^{-1}=C^T/\det A$; giải $Ax=b$ bằng Cramer |
| 11 | Diện tích, thể tích, tích có hướng | 5.3 | Diện tích tam giác bằng định thức; $u\times v$; tích hỗn hợp; công thức lớn 6 số hạng |
| 12 | Trị riêng và vector riêng | 6.1 | Lập $\det(A-\lambda I)$; tìm trị riêng; giải $(A-\lambda I)v=0$ |
| 13 | Chéo hóa | 6.2 | Lập $S$ từ các vector riêng; kiểm $AS=S\Lambda$; viết $A=S\Lambda S^{-1}$ |

Đã thêm ngày 2026-11-24: trị riêng, vector riêng và chéo hóa (chương 6).

## Lịch ôn (tuần 12 bắt đầu 2026-11-16)

| Tuần | Từ ngày | Ôn | Làm |
|---|---|---|---|
| 12 | 11-16 | Chủ đề 1–2: độc lập, basis, dimension | 1 đề Exlab, chỉ làm câu 1 |
| 13 | 11-23 | Chủ đề 3–4: bốn subspace, trực giao | 1 đề Exlab, chỉ làm câu 2 |
| 14 | 11-30 | Chủ đề 5–11: phép chiếu, bình phương tối thiểu, Gram–Schmidt, định thức | 1 đề Exlab, làm câu 1, 3, 4, 5 |
| 15 | 12-07 | Điểm yếu của tuần 12–14 | 2 đề Exlab trọn vẹn, bấm giờ 120 phút |
| 16 | 12-14 | Thi (ngày chưa rõ) | Xem lại bảng công thức và các ý đã sai |

## Đề Exlab

Mỗi mã đề cho 5 câu, 200 điểm, 120 phút. Câu 1 (35) chọn độc lập, định thức, hoặc trị riêng và vector riêng. Câu 2 (50) luôn là bốn subspace. Câu 3 (30) chọn chiếu lên đường thẳng hoặc Cramer. Câu 4 (40) chọn chiếu lên mặt phẳng hoặc Gram–Schmidt. Câu 5 (45) chọn bình phương tối thiểu hoặc diện tích và thể tích. Số câu, điểm và thời gian không đổi. Đây là đề tự soạn, không phải đề thật của giáo.

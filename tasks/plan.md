# Báo cáo hủy: tương tác phép hàng Ax=b

**Trạng thái: HỦY theo yêu cầu ngày 2026-11-02. Không tiếp tục triển khai hoặc deploy.**

Người học muốn tương tác khám phá quy luật bằng cách tự kéo/chỉnh mô hình, áp dụng vào hệ Ax=b khó: tối đa 5 hàng × 5 ẩn, thường 4×4, có thể có nhiều biến tự do hoặc vô nghiệm. Tiêu chuẩn là trải nghiệm mượt như Brilliant.org và đủ sức xử lý độ khó của đề thi thử.

Hai trải nghiệm đã bị từ chối:

1. Prototype vector ở [PR #148](https://github.com/huybndc/CAU_Math_App/pull/148) lặp lại kiểu tương tác cũ mà người học đã bỏ.
2. Mockup tự thao tác phép hàng trên ma trận (preview, chọn hàng/hệ số, undo, kết luận) vẫn không phải trải nghiệm người học muốn. Tăng kích thước ma trận hoặc thêm phép tính không khắc phục được vấn đề cốt lõi.

Vì vậy hủy dự án thay vì tiếp tục đầu tư vào hướng hiện tại. Ràng buộc 5×5 và các ca nhiều biến tự do/vô nghiệm là tiêu chí đánh giá nếu người học chủ động đề xuất hướng mới, không phải phê duyệt mockup này. Phiên sau cần đọc **D65** trong `DECISIONS.md` và `docs/DECISIONS-ARCHIVE.md`, PR #148, rồi dừng ở đó nếu chưa có yêu cầu mới từ người học.

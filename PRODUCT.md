# PRODUCT — CAU Math (Logic Circuit, Linear Algebra, Discrete Math)

## Chung của Huy (mọi app)
- Người dùng: người học (sinh viên năm nhất, viết tiếng Việt). Dùng laptop (desktop-first); mobile/tablet chỉ khi được yêu cầu riêng.
- Mỗi màn vừa một khung nhìn ≈1280×720; danh sách dài cuộn trong thẻ của nó; bớt cuộn bằng bố cục và gập/mở, KHÔNG bỏ thông tin.
- Giọng: ngắn, nhiều bảng và mũi tên, ít văn; chữ tiếng Việt, thuật ngữ giữ gốc. Ý chính lên trước.
- Chỉ dùng thứ miễn phí (font hệ thống, icon mã nguồn mở). Không dịch vụ trả phí.
- Giữ hệ thiết kế đang có (token của Study_Hub: màu, chữ, bo góc, khoảng cách). Không đổi phong cách khi không được yêu cầu.

## App này
- Mục đích: ba app ôn tập toán cho các môn Logic Circuit, Linear Algebra, Discrete Math: học theo thẻ, máy giải có lời giải, luyện tập theo dạng, thi thử.
- Ai dùng, lúc nào, ở đâu: người học ôn giữa kỳ trên laptop, ngồi lớp hoặc ở nhà; làm từng câu ngắn, cần phản hồi đúng/sai ngay.
- Việc quan trọng nhất trên màn hình: làm một câu rồi biết đúng/sai và vì sao; mở đúng công cụ; thấy chương nào cần luyện tiếp.
- Ràng buộc kỹ thuật: Vite + JS thuần, một máy chủ cho cả 3 app; `shared/` dùng chung (Study_Hub build bản sao qua `math.lock`); sáng/tối theo hệ thống; song ngữ VI/EN.
- Có chủ ý (đừng "sửa"): viền màu bên trái ở thẻ nhấn/callout (`side-tab`: thẻ "hôm nay", thẻ lead, đáp án máy giải, phản hồi đúng/sai, mục "học tiếp") — dùng để chỉ thẻ quan trọng nhất của màn; và mũi tên gập/mở của danh sách (`border-right/bottom` xoay thành chevron, bị quét nhầm là side-tab).

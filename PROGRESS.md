# PROGRESS.md — CAU Math App

> Đọc đầu phiên. Chỉ giữ việc đang mở và quy tắc còn hiệu lực. Lịch sử đã xong: `PROGRESS-archive.md` (không cần đọc). Ranh giới repo: `REPO_BOUNDARY.md`.

## Trạng thái (2026-10-22)
- `main` = 652413a. Đề thi thử có mẫu cho cả 3 môn. Deploy bản riêng bằng `npm run deploy` (Worker `cau-math`).
- Đề thi thử: chọn mã đề → in đề / in đáp án A4 (KaTeX, bước giải). Màn: mã đề, Đề mới, thẻ Đề | Đáp án, bản xem trước nguyên tờ trên màn, nút In / lưu PDF. Đáp án Logic có hình mạch mẫu. Ôn từng phần thuộc Luyện tập, không đặt ở đây.
- Mẫu đề là PHỎNG ĐOÁN theo mô tả của người học (đề giữa kỳ). Người học bắt đầu ôn sau ~1 tháng; đề cuối kỳ sẽ khác:
  - Logic: 4 câu, 200 điểm, 60 phút — 7 đoạn a/f/e (K-map); chuyển mã Excess-3/Gray/2421 (K-map); bộ cộng BCD hoặc so sánh 2 bit (vẽ 1 mạch); MUX 4×1 hoặc decoder + OR (vẽ 1 mạch). Đáp án có thang chấm theo bước (#120–#121).
  - Cách ôn đã chốt (2026-10-26): người học làm đề in trên giấy, gửi ảnh bài + tờ đáp án cho Claude chấm theo thang (skill huy-de-thi-thu, cham-bai.md). Không có đề thật: đừng đề xuất dùng đề thật.
  - Discrete: 3 câu 7 ý, 200 điểm, 60 phút, đúng 2 gợi ý nhỏ. Người học đã duyệt; sau này chỉ cần thêm đa dạng câu.
  - Linear Algebra: 9 câu, 162 điểm, 97 phút (D63).
- Luyện tập theo dạng và Thi thử bị ẩn (`PRACTICE_HIDDEN`, `shared/logic/visibility.js`); URL cũ vẫn chạy cho link của Hub. Tự luận vẫn phát `math.answer` mode `free`.

## Lập trình C (2026-10-28, lô thử)
- App `/prog/`: bài tuần 7 + Đề thi thử 20 câu, đáp án từ clang (`npm run gen:c`). Thêm lô: viết mẫu trong `c-templates.js` (week = tuần), chạy `npm run gen:c`, test tự kiểm. Lô tuần 9 khi có slide. Chưa có luyện trong bài, chưa có tự đánh dấu Đúng/Sai.

## Việc mở (chờ người học chọn)
- Có thể làm tiếp: thang chấm + thêm dạng cho Discrete, Linear Algebra (cùng cách Logic).
- Discrete: thêm đa dạng câu (định nghĩa, bổ đề, quy nạp).
- Tự luận đã gọn (PR #104): đề · gợi ý · lời giải từng bước; không tự chấm, không phát `math.answer`. Hiện KHÔNG còn màn nào phát `math.answer` (Luyện tập, Thi thử ẩn).

## Đã gỡ Luyện tập, Thi thử, Sổ câu sai, Điểm mục tiêu (2026-10-22, PR chờ merge)
- Gỡ: route `#/practice…` và `#/exam…` (về Tổng quan), màn + `exam-screen`, `exam-run`, `logic/exam`, `mistakes`, `score`, `groups`, cờ `PRACTICE_HIDDEN`, `exam.css`, ~110 chuỗi i18n, trợ giúp của các màn đó, link "Luyện tập chương này" trong bài học Logic. Có test `REMOVED` canh.
- Giữ: `runner.js` + ngân hàng câu (điểm kiến thức `kpoint` trong bài học), `flags.js` (thẻ đã đọc), `progress.js` (số liệu Tuần này), máy giải, Đề thi thử, Tự luận.
- Khi ôn cuối kỳ (~2026-11-20): quyết có làm luyện tập mới quanh Tự luận/Đề thi thử hay không.

## Tách CAU_Math khỏi Hub (họp 2026-10-26, Huy duyệt, làm ngay)
1. (Xong #112) Gỡ "Tuần này" + pet (+ hub-mirror.lock pet, stats.js). 2–3. Hub gỡ số liệu toán/pet, thêm exam-scope.json + thẻ "Ôn cuối kỳ". 4. (Xong #113–#115, ĐÃ LÊN) CAU_Math: Worker tĩnh `cau-math`, CSP riêng, deploy bằng `npm run deploy`, không đăng nhập. 6. Hub đổi link sang cau-math ngay khi ĐÃ LÊN; lỗi ⇒ 1 commit trả link về mirror. 7. Hub gỡ mirror. Không đồng bộ dữ liệu giữa máy; Nháp cũ: Huy tự chép tay.

## Quy tắc còn hiệu lực
- Toán, câu hỏi, bộ giải, oracle → repo này. Hub, tài khoản, vault, thống kê liên môn → Study_Hub. Không import chéo; mirror một chiều theo `math.lock`.
- Tệp chép từ Hub (không sửa tay): `shared/style/design-tokens.json` (+ `node shared/style/render-tokens.mjs`), `shared/logic/semester.js` (quy tắc kỳ học, `npm run semester:export` ở Hub), pet (`hub-mirror.lock`, 7 file). Hub đổi → chép bản mới.
- CSP của Hub cho phép script nội tuyến chọn sáng/tối bằng hash: sửa script đó, thêm nguồn ngoài (font, CDN, fetch host khác) ⇒ báo Study_Hub.
- Gỡ/đổi UI mà e2e của Hub chạm tới (route /practice, /exam, nút tự đánh giá Tự luận, `.free-rate`…): báo Study_Hub TRƯỚC khi merge để Hub sửa e2e cùng PR bump (#104 làm CI Hub đỏ 3 e2e Tự luận, treo 10 phút).
- Kiểm tra chạy trên máy: `npm run gate` (test + check + design:check + build) trước mỗi merge; CI chỉ chạy tay (`workflow_dispatch`, 2026-10-26). PR không có check ⇒ hook merge cho qua. Sau deploy vẫn chạy verify-deploy. Báo "xong" chỉ khi bản deploy chạy đúng (quyết định chung 2026-10-22, HANDOFF).
- Deploy bản riêng: `npm run deploy` (build + `wrangler deploy`, Worker `cau-math`, cấu hình `wrangler.jsonc`, header `public/_headers` + test `headers.test.js`). Chạy từ `main` sau mỗi merge có code; chưa nối Workers Builds (tự deploy theo repo cần bật trong bảng Cloudflare).
- Đã gỡ cầu nối Hub chết (2026-10-26, chọn B): gửi/đọc math.answer, xuất tiến độ cho Hub, nút về Hub. Giữ `@host` (khoá lưu + đồng bộ thư mục ở máy dev) vì vô hại, gỡ sẽ chạm Nháp.
- Trích sách: Logic theo Mano 6th (test so mục lục chương 3–4), Linear Algebra theo Strang 4th, Discrete theo MCS 2017.
- Không commit slide, PDF, syllabus riêng, bí mật, dữ liệu cá nhân.

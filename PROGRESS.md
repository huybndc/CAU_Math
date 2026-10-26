# PROGRESS.md — CAU Math App

> Đọc đầu phiên. Chỉ giữ việc đang mở và quy tắc còn hiệu lực. Lịch sử đã xong: `PROGRESS-archive.md` (không cần đọc). Ranh giới repo: `REPO_BOUNDARY.md`.

## Trạng thái (2026-10-22)
- `main` = a1aa863. Đề như thật có mẫu cho cả 3 môn (Logic, Linear Algebra, Discrete). Deploy bản online do Study_Hub làm (bump `math.lock`).
- Đề như thật: chọn mã đề → in đề / in đáp án A4 (KaTeX, bước giải). Màn: mã đề, Đề mới, thẻ Đề | Đáp án, bản xem trước nguyên tờ trên màn, nút In / lưu PDF. Đáp án Logic có hình mạch mẫu. Ôn từng phần thuộc Luyện tập, không đặt ở đây.
- Mẫu đề là PHỎNG ĐOÁN theo mô tả của người học (đề giữa kỳ). Người học bắt đầu ôn sau ~1 tháng; đề cuối kỳ sẽ khác:
  - Logic: 4 câu, 200 điểm, 60 phút — 7 đoạn a/f/e (K-map), Excess-3 (K-map), bộ cộng BCD (vẽ 1 mạch), MUX 4×1 thực hiện hàm (vẽ 1 mạch).
  - Discrete: 3 câu 7 ý, 200 điểm, 60 phút, đúng 2 gợi ý nhỏ. Người học đã duyệt; sau này chỉ cần thêm đa dạng câu.
  - Linear Algebra: 9 câu, 162 điểm, 97 phút (D63).
- Luyện tập theo dạng và Thi thử bị ẩn (`PRACTICE_HIDDEN`, `shared/logic/visibility.js`); URL cũ vẫn chạy cho link của Hub. Tự luận vẫn phát `math.answer` mode `free`.

## Việc mở (chờ người học chọn)
- Khi gần cuối kỳ: dựng lại mẫu đề theo chương và dạng đề cuối kỳ thật.
- Discrete: thêm đa dạng câu (định nghĩa, bổ đề, quy nạp).
- Tự luận đã gọn (PR #104): đề · gợi ý · lời giải từng bước; không tự chấm, không phát `math.answer`. Hiện KHÔNG còn màn nào phát `math.answer` (Luyện tập, Thi thử ẩn).

## Đã gỡ Luyện tập, Thi thử, Sổ câu sai, Điểm mục tiêu (2026-10-22, PR chờ merge)
- Gỡ: route `#/practice…` và `#/exam…` (về Tổng quan), màn + `exam-screen`, `exam-run`, `logic/exam`, `mistakes`, `score`, `groups`, cờ `PRACTICE_HIDDEN`, `exam.css`, ~110 chuỗi i18n, trợ giúp của các màn đó, link "Luyện tập chương này" trong bài học Logic. Có test `REMOVED` canh.
- Giữ: `runner.js` + ngân hàng câu (điểm kiến thức `kpoint` trong bài học), `flags.js` (thẻ đã đọc), `progress.js` (số liệu Tuần này), máy giải, Đề như thật, Tự luận.
- Còn thừa, chưa gỡ (không gấp): `shared/logic/exam-target.js` + `.json` (bản chụp từ Hub, UI không còn dùng), `stats`/`rankNeeds` dùng ít.
- Khi ôn cuối kỳ (~2026-11-20): quyết có làm luyện tập mới quanh Tự luận/Đề như thật hay không.

## Tách CAU_Math khỏi Hub (họp 2026-10-26, Huy duyệt, làm ngay)
1. (PR này) Gỡ "Tuần này" + pet (+ hub-mirror.lock pet, stats.js). 2–3. Hub gỡ số liệu toán/pet, thêm exam-scope.json + thẻ "Ôn cuối kỳ". 4. CAU_Math: Worker tĩnh `cau-math` (workers.dev), CSP riêng, Cloudflare Workers Builds, không đăng nhập. 6. Hub đổi link sang cau-math ngay khi ĐÃ LÊN; lỗi ⇒ 1 commit trả link về mirror. 7. Hub gỡ mirror. Không đồng bộ dữ liệu giữa máy; Nháp cũ: Huy tự chép tay.

## Quy tắc còn hiệu lực
- Toán, câu hỏi, bộ giải, oracle → repo này. Hub, tài khoản, vault, thống kê liên môn → Study_Hub. Không import chéo; mirror một chiều theo `math.lock`.
- Tệp chép từ Hub (không sửa tay): `shared/style/design-tokens.json` (+ `node shared/style/render-tokens.mjs`), `shared/logic/exam-target.json`, pet (`hub-mirror.lock`, 7 file). Hub đổi → chép bản mới.
- CSP của Hub cho phép script nội tuyến chọn sáng/tối bằng hash: sửa script đó, thêm nguồn ngoài (font, CDN, fetch host khác) ⇒ báo Study_Hub.
- Gỡ/đổi UI mà e2e của Hub chạm tới (route /practice, /exam, nút tự đánh giá Tự luận, `.free-rate`…): báo Study_Hub TRƯỚC khi merge để Hub sửa e2e cùng PR bump (#104 làm CI Hub đỏ 3 e2e Tự luận, treo 10 phút).
- CI bỏ qua PR/push chỉ sửa `.md` hoặc `docs/` (PR #110): PR chỉ tài liệu không có check; hook merge cho qua khi "no checks". Báo "xong" chỉ khi bản deploy chạy đúng (quyết định chung 2026-10-22, HANDOFF).
- Deploy bản riêng: `npm run deploy` (build + `wrangler deploy`, Worker `cau-math`, cấu hình `wrangler.jsonc`, header `public/_headers` + test `headers.test.js`). Chạy từ `main` sau mỗi merge có code; chưa nối Workers Builds (tự deploy theo repo cần bật trong bảng Cloudflare).
- Trích sách: Logic theo Mano 6th (test so mục lục chương 3–4), Linear Algebra theo Strang 4th, Discrete theo MCS 2017.
- Không commit slide, PDF, syllabus riêng, bí mật, dữ liệu cá nhân.

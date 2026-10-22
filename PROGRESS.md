# PROGRESS.md — CAU Math App

> Đọc đầu phiên. Chỉ giữ việc đang mở và quy tắc còn hiệu lực. Lịch sử đã xong: `PROGRESS-archive.md` (không cần đọc). Ranh giới repo: `REPO_BOUNDARY.md`.

## Trạng thái (2026-10-22)
- `main` = a1aa863. Đề như thật có mẫu cho cả 3 môn (Logic, Linear Algebra, Discrete). Deploy bản online do Study_Hub làm (bump `math.lock`).
- Đề như thật: chọn mã đề → in đề / in đáp án A4 (KaTeX, bước giải). Không đồng hồ, không tự chấm điểm. Logic có ô "Kiểm mạch đã vẽ" (đúng/sai, `logic/src/logic/mock-check.js`) và hình mạch mẫu.
- Mẫu đề là PHỎNG ĐOÁN theo mô tả của người học (đề giữa kỳ). Người học bắt đầu ôn sau ~1 tháng; đề cuối kỳ sẽ khác:
  - Logic: 4 câu, 200 điểm, 60 phút — 7 đoạn a/f/e (K-map), Excess-3 (K-map), bộ cộng BCD (vẽ 1 mạch), MUX 4×1 thực hiện hàm (vẽ 1 mạch).
  - Discrete: 3 câu 7 ý, 200 điểm, 60 phút, đúng 2 gợi ý nhỏ. Người học đã duyệt; sau này chỉ cần thêm đa dạng câu.
  - Linear Algebra: 9 câu, 162 điểm, 97 phút (D63).
- Luyện tập theo dạng và Thi thử bị ẩn (`PRACTICE_HIDDEN`, `shared/logic/visibility.js`); URL cũ vẫn chạy cho link của Hub. Tự luận vẫn phát `math.answer` mode `free`.

## Việc mở (chờ người học chọn)
- Khi gần cuối kỳ: dựng lại mẫu đề theo chương và dạng đề cuối kỳ thật.
- Discrete: thêm đa dạng câu (định nghĩa, bổ đề, quy nạp).
- Tự luận đã gọn (PR #104): đề · gợi ý · lời giải từng bước; không tự chấm, không phát `math.answer`. Hiện KHÔNG còn màn nào phát `math.answer` (Luyện tập, Thi thử ẩn).

## Kế hoạch gỡ dần tính năng không dùng (2026-10-22, người học chọn "tổng hợp rồi xoá dần")
Không dùng nữa (đang ẩn hoặc số đứng yên):
- Luyện tập theo dạng, Bài tập dài, Trộn chương, Ôn dạng sai (`screens.js` practice, `PRACTICE_HIDDEN`).
- Thi thử trắc nghiệm + lịch sử (`exam-screen.js`, `exam-run.js`, `logic/exam.js`).
- Sổ câu sai (`logic/mistakes.js`, `store.markMistake`).
- Điểm mục tiêu ở Tổng quan (`logic/score.js` `goalOf`, `home-screen.js` `goalRow`): luyện tập ẩn nên số đứng yên.
Còn dùng, KHÔNG gỡ: `runner.js` + ngân hàng câu (điểm kiến thức trong bài học, `kpoint.js`), `flags.js` (thẻ đã đọc ở Học), máy giải, Đề như thật, Tự luận.
Bước:
1. Ẩn dòng điểm mục tiêu (đổi nhỏ, chờ người học gật).
2. Study_Hub bỏ link `/practice/chN/<dạng>` và `/exam` (buildItems) và chốt không cần `math.answer` từ app toán → gỡ route + màn Luyện tập/Thi thử/Sổ câu sai + test của chúng, thêm vào `REMOVED` (features-sync).
3. Khi ôn cuối kỳ (~2026-11-20): quyết luyện tập mới quanh câu Tự luận/Đề như thật hay bỏ hẳn.
- Backlog thấp: ~26 đột biến sống sót ở elimination/quine-mccluskey/graph (`npm run mutate`); `checkNumber` chưa đọc "1e-3", "33%"; `checkVector` chưa đọc "x=1, y=2"; ngưỡng EPS tuyệt đối khi khử.

## Quy tắc còn hiệu lực
- Toán, câu hỏi, bộ giải, oracle → repo này. Hub, tài khoản, vault, thống kê liên môn → Study_Hub. Không import chéo; mirror một chiều theo `math.lock`.
- Tệp chép từ Hub (không sửa tay): `shared/style/design-tokens.json` (+ `node shared/style/render-tokens.mjs`), `shared/logic/exam-target.json`, pet (`hub-mirror.lock`, 7 file). Hub đổi → chép bản mới.
- CSP của Hub cho phép script nội tuyến chọn sáng/tối bằng hash: sửa script đó, thêm nguồn ngoài (font, CDN, fetch host khác) ⇒ báo Study_Hub.
- Trích sách: Logic theo Mano 6th (test so mục lục chương 3–4), Linear Algebra theo Strang 4th, Discrete theo MCS 2017.
- Không commit slide, PDF, syllabus riêng, bí mật, dữ liệu cá nhân.

# FEATURES — CAU_Math (bản đồ tính năng cho Agent)

Cập nhật file này trong cùng PR khi đổi UI. Một server (Vite) phục vụ 3 trang: `/logic/`, `/linalg/`, `/discrete/`.
Chạy: `npm run dev` (http://localhost:5180, cổng cố định vì trạng thái nằm trong localStorage theo origin). Test: `npm test` (vitest, glob `{shared,logic,linalg,discrete}/tests/**`).
Chưa có `data-testid`. Hook hiện có = `data-nav`, `data-screen`, `data-subject`, `data-lang`, `data-i18n`, `aria-label`, id. Ô nhập của câu hỏi dựng bằng JS, không có id: dùng class.

`/` chỉ chuyển hướng tới `/logic/` (không còn trang tổng quan chung — thay D01; tổng hợp 3 môn do Study_Hub làm).

## Khung chung của 3 môn (`shared/ui/`, `shared/logic/`)
- Thanh bên `aside.appnav`: `a.nav-brand`, `a.tab[data-nav=home|learn|tools|mock]` (mục "Đề thi thử" chứa thêm thẻ Tự luận), `#lang-switch button[data-lang=vi|en]`, `#theme-toggle`, `button.nav-search`, thu gọn bằng nút ☰ (`button.nav-collapse`, Lucide menu) đầu hàng tên app như Live_Lecture, thu còn 56px (`study-nav`). Tên hiển thị "Exlab" (`app.brand`, tiêu đề tab: màn · môn · Exlab). Favicon: Lucide flask-conical trắng trên nền #5a6ab8 (data-URI trong 4 trang HTML gốc); tên môn ở thanh bên có icon flask màu môn. Icon: một bộ Lucide nét 1.5 trong `shared/style/icons.css` (`--i-*`), dùng làm mask. Nhóm `nav.nav-apps` ghim đáy thanh bên (như Live_Lecture): `a.tab.app-link` sang Study Hub và Live Lecture (địa chỉ lấy lúc build từ `.env.local`: `VITE_HUB_URL`, `VITE_LIVE_URL`; thiếu thì ẩn).
- Màn: `section.screen[data-screen]` (`#screen-home|learn|tools|free|mock|pane`). Tổng quan (`#screen-home`): tên môn, dải 16 ô tuần, hai cột Hôm nay | Học + Đề thi thử; khoảng cách giãn theo chiều cao màn (`fit.css`, vh có sàn/trần) để không dồn lên nửa trên.
- Route (hash, `shared/logic/route.js`): `#/`, `#/learn`, `#/learn/chN/(theory|example|interactive)[/n]`, `#/tools`, `#/free[/id]`.
- Đề thi thử (`#/mock`, `shared/ui/mock-screen.js`, `shared/logic/mock-exam.js`; Linear Algebra có mẫu `linalg/src/logic/mock-*.js`): chọn mã seed (`input.mock-seed`), `button` Đề mới / Đề | Đáp án / In lưu PDF (A4, `body[data-print]`). Công thức dựng bằng KaTeX (`.katex`), đáp án có bước giải từng phép biến đổi. Logic Circuit (K-map: 7 đoạn, chuyển mã BCD sang Excess-3 / Gray / 2421; vẽ một mạch: bộ cộng BCD hoặc bộ so sánh 2 bit, MUX 4×1 hoặc decoder + OR): đáp án in kèm hình mạch mẫu (`.mp-figs`), thang chấm theo bước dưới mỗi ý (`.mp-rubric`) và dòng "To grade" ở đầu tờ (`.mp-grade`): người học làm giấy rồi gửi ảnh bài + tờ đáp án cho Claude chấm. Màn: mã đề, Đề mới, thẻ Đề | Đáp án, nút "In / lưu PDF"; bản xem trước nguyên tờ A4 ngay trên màn (`.mock-sheet`, cuộn trong khung), in qua hộp thoại của trình duyệt (chọn Lưu dưới dạng PDF). Không có đồng hồ hay tự chấm điểm trong app (người học tự bấm giờ và tự chấm bằng đáp án in). Luyện tập theo dạng, Thi thử và Sổ câu sai đã gỡ (2026-10-22); `#/practice…` và `#/exam…` về Tổng quan.
- Tính năng: Học (thẻ Bài học / Ví dụ giải sẵn / Công cụ tương tác), Công cụ, Tự luận (đề · gợi ý theo thang · lời giải từng bước; không tự chấm, không phát sự kiện từ 2026-10-22), Nháp (ghi chú, máy tính, bảng, vẽ), cờ đánh dấu, thuật ngữ, trợ giúp màn hình.
- Phím: Ctrl/Cmd+K hoặc `/` mở tìm nhanh (`dialog.palette`, `li.pal-row`); `?` trợ giúp màn hình; Esc đóng; `1..N` chọn đáp án trắc nghiệm; mũi tên trái/phải chuyển thẻ bài học.
- Hook chung: `.runner`, `.run-widget`, `.flag-fold`, `.tab[data-tab]`, `data-check`, `data-tool`, `data-goto`.
- Code: `shared/ui/{shell,screens,learn-screen,runner,solver,lesson,palette,scratch*}.js`, `shared/logic/{free,question-pool,calc*}.js`.

## Môn
| Môn | Chương | Code chính |
|---|---|---|
| `/logic/` (Mano) | ch1 Hệ đếm & mã nhị phân, ch2 Đại số Boolean & cổng logic, ch3 Gray code & K-map, ch4 (tên chưa kiểm) | `logic/src/ui/`, `logic/src/logic/` (`expr-parser`, `kmap-*`, `quine-mccluskey`) |
| `/linalg/` (Strang) | ch1 Vector, ch2 Giải hệ Ax = b, ch3 Không gian vector | `linalg/src/ui/`, `linalg/src/logic/` (`elimination`, `ldu`, `subspace`) |
| `/discrete/` (MIT 6.042J) | ch1 Mệnh đề & logic, ch6 Chia hết & gcd, ch7 Đồng dư & RSA; ch2–5, ch8 tên chưa kiểm | `discrete/src/ui/`, `discrete/src/logic/` (`prop-logic`, `number-theory`, `graph`) |
Nội dung: `<môn>/src/content/` (`theory-chN.vi|en.md`, `free/chN.json`, `concepts.json`); trang: `<môn>/src/pages/chN.html`. Tên chương đầy đủ: `i18n/vi/common.js` (`nav.chN`).

## Lưu trữ
localStorage theo môn, dạng `<khoá>:<môn>` qua `shared/ui/store.js` (`progress`, `flags`, `scratch:*`, `calc`). Chung: `study-theme`, `study-nav`. Không gửi gì sang Study_Hub (tách app 2026-10-26); `shared/host.js` chỉ còn khoá lưu + namespace đồng bộ thư mục ở máy dev.

## Khoảng trống hook
Thẻ và nút ở Tổng quan chỉ có class + `data-subject`; giao diện câu hỏi không có id. Thêm `data-testid` khi đụng tới màn đó.

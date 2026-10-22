# FEATURES — CAU_Math (bản đồ tính năng cho Agent)

Cập nhật file này trong cùng PR khi đổi UI. Một server (Vite) phục vụ 3 trang: `/logic/`, `/linalg/`, `/discrete/`.
Chạy: `npm run dev` (http://localhost:5180, cổng cố định vì trạng thái nằm trong localStorage theo origin). Test: `npm test` (vitest, glob `{shared,logic,linalg,discrete}/tests/**`).
Chưa có `data-testid`. Hook hiện có = `data-nav`, `data-screen`, `data-subject`, `data-lang`, `data-i18n`, `aria-label`, id. Ô nhập của câu hỏi dựng bằng JS, không có id: dùng class.

`/` chỉ chuyển hướng tới `/logic/` (không còn trang tổng quan chung — thay D01; tổng hợp 3 môn do Study_Hub làm).

## Khung chung của 3 môn (`shared/ui/`, `shared/logic/`)
- Thanh bên `aside.appnav`: `a.nav-brand`, `a.tab[data-nav=home|learn|tools|mock]` (mục "Đề như thật" chứa thêm thẻ Tự luận), `#lang-switch button[data-lang=vi|en]`, `#theme-toggle`, `button.nav-search`, thu gọn (`study-nav`).
- Màn: `section.screen[data-screen]` (`#screen-home|learn|tools|practice|run|exam|free|pane`).
- Route (hash, `shared/logic/route.js`): `#/`, `#/learn`, `#/learn/chN/(theory|example|interactive)[/n]`, `#/tools`, `#/practice`, `#/practice/chN[/kind]`, `#/free[/id]`, `#/exam`, `#/exam/run`, `#/exam/result`.
- Đề như thật (`#/mock`, `shared/ui/mock-screen.js`, `shared/logic/mock-exam.js`; Linear Algebra có mẫu `linalg/src/logic/mock-*.js`): chọn mã seed (`input.mock-seed`), `button` Đề mới / In đề / In đáp án (A4, `body[data-print]`), danh sách câu kèm mục sách. Công thức dựng bằng KaTeX (`.katex`), đáp án có bước giải từng phép biến đổi. Logic Circuit (7 đoạn, bộ cộng BCD, MUX/DEMUX): đáp án in kèm hình mạch mẫu và sơ đồ khối (`.mp-figs`) và ô "Kiểm mạch đã vẽ" (`details.mock-check`, `input.mock-expr`: gõ biểu thức đọc từ mạch vẽ tay, chỉ ĐÚNG/SAI, `logic/src/logic/mock-check.js`). Không có đồng hồ hay tự chấm điểm trong app (người học tự bấm giờ và tự chấm bằng đáp án in). Luyện tập theo dạng và Thi thử bị ẩn bằng `PRACTICE_HIDDEN` (`shared/logic/visibility.js`): `#/practice…` và `#/exam…` vẫn mở được qua URL.
- Tính năng: Học (thẻ Bài học / Ví dụ giải sẵn / Công cụ tương tác), Công cụ, Luyện tập ("Luyện theo dạng", "Bài tập dài 60–90 phút", "Trộn cả chương", "Ôn lại dạng đã sai"), Tự luận, Thi thử (cài đặt/làm/kết quả, lịch sử), Sổ câu sai, Nháp (ghi chú, máy tính, bảng, vẽ), pet, cờ đánh dấu, thuật ngữ, trợ giúp màn hình.
- Phím: Ctrl/Cmd+K hoặc `/` mở tìm nhanh (`dialog.palette`, `li.pal-row`); `?` trợ giúp màn hình; Esc đóng; `1..N` chọn đáp án trắc nghiệm; mũi tên trái/phải chuyển thẻ bài học.
- Hook chung: `.runner`, `.run-widget`, `.flag-fold`, `.pet-*`, `.tab[data-tab]`, `data-check`, `data-tool`, `data-goto`.
- Code: `shared/ui/{shell,screens,learn-screen,exam-screen,exam-run,runner,solver,lesson,palette,scratch*,pet}.js`, `shared/logic/{exam,free,mistakes,question-pool,calc*}.js`.

## Môn
| Môn | Chương | Code chính |
|---|---|---|
| `/logic/` (Mano) | ch1 Hệ đếm & mã nhị phân, ch2 Đại số Boolean & cổng logic, ch3 Gray code & K-map, ch4 (tên chưa kiểm) | `logic/src/ui/`, `logic/src/logic/` (`expr-parser`, `kmap-*`, `quine-mccluskey`) |
| `/linalg/` (Strang) | ch1 Vector, ch2 Giải hệ Ax = b, ch3 Không gian vector | `linalg/src/ui/`, `linalg/src/logic/` (`elimination`, `ldu`, `subspace`) |
| `/discrete/` (MIT 6.042J) | ch1 Mệnh đề & logic, ch6 Chia hết & gcd, ch7 Đồng dư & RSA; ch2–5, ch8 tên chưa kiểm | `discrete/src/ui/`, `discrete/src/logic/` (`prop-logic`, `number-theory`, `graph`) |
Nội dung: `<môn>/src/content/` (`theory-chN.vi|en.md`, `free/chN.json`, `concepts.json`); trang: `<môn>/src/pages/chN.html`. Tên chương đầy đủ: `i18n/vi/common.js` (`nav.chN`).

## Lưu trữ
localStorage theo môn, dạng `<khoá>:<môn>` qua `shared/ui/store.js` (`progress`, `mistakes-<prefix>`, `flags`, `pet`, `exam-*`, `scratch:*`, `calc`). Chung: `study-theme`, `study-nav`. Cầu nối sang Study_Hub: `shared/host.js` (sự kiện `math.answer`).

## Khoảng trống hook
Thẻ và nút ở Tổng quan chỉ có class + `data-subject`; giao diện câu hỏi không có id. Thêm `data-testid` khi đụng tới màn đó.

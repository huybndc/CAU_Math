# CLAUDE.md — project_kmap

App ôn tập Logic Circuit, menu theo việc (Tổng quan · Học · Luyện tập · Thi thử — D16).

## Nguyên tắc
- Mỗi file một trách nhiệm, mục tiêu dưới ~400 dòng, trần 450 (D40 TOEIC). Vượt thì tách tiếp
  (`npm run check` ở gốc repo).
- `src/logic/` là hàm thuần: nhận input, trả output, **không** đụng `document`/`window`.
- `src/ui/` đọc/ghi DOM và gọi `logic/`. `logic/` không bao giờ import từ `ui/`.
- Không sang milestone mới khi `npm test` đang fail.

## Quy ước
- Test đặt ở `tests/<tên-module-logic>.test.js`, một file test cho một file trong `src/logic/`.
- Module logic của chương N đặt tên theo chủ đề (`number-systems.js`), riêng phần
  sinh/chấm đề thì đặt `chN-quiz.js`; UI tương ứng là `chN-<mục con>-page.js`.
- Hàm sinh đề trả về `{ kind, text, answer, hint, meta }` — `meta` giữ tham số ở
  dạng có cấu trúc để test kiểm chứng lại mà không phải bóc tách chuỗi đề.
- Biến đổi biểu thức Boolean (dual, DeMorgan) **phải** làm trên cây cú pháp
  (`logic/bool-ast.js`), không làm trên chuỗi ký tự — AND viết liền và dấu ngoặc
  đều mang thông tin ưu tiên.
- Nội dung học tập dạng văn bản để ở `src/content/*.md`, import bằng `?raw` của Vite.
- Comment và chuỗi hiển thị viết bằng tiếng Việt, giữ nguyên văn phong bản gốc.
- Tên biến công khai của thuật toán (`A/B/C/D/E`, `imp = {v, d}`) giữ nguyên như bản gốc.

## Điều hướng & markup
Menu theo việc (D16): Tổng quan · Học · Luyện tập · Thi thử — `shared/ui/{router,screens}.js`,
địa chỉ `#/learn/chN/<theory|example|interactive>`, `#/practice/chN[/dạng]`, `#/exam`. Trang chương
(`src/pages/chN.html`) chỉ còn các khung `.pane`; router bật đúng một khung. Nút nhảy chéo khai báo bằng
`data-goto="ch3:interactive"`, không cần gắn listener riêng. Thêm chương: 1 file partial + 1 dòng include
+ 1 mục trong `chapters` của `main.js`.

`index.html` chỉ là shell; markup mỗi chương nằm ở `src/pages/chN.html`, gộp lúc
dev bằng `<!--#include src/pages/chN.html -->` (`shared/vite-plugin-include.js`).
Thêm chương mới thì thêm 1 file partial + 1 dòng include + 1 nút tab.

## Song ngữ VI/EN
- Chuỗi UI lấy qua `T(key, params)` (`src/i18n/index.js`). Bí danh import **luôn
  là `T`** — không dùng `t` hay `tr` vì đụng biến cục bộ `t` (`<table>`) và
  `tr` (`<tr>`).
- Markup tĩnh dùng `data-i18n` / `-html` / `-ph` / `-title`.
- Từ điển ở `src/i18n/{vi,en}/{common,ch1,ch2,ch3,ch4,quiz}.js` (chữ câu hỏi Ch1–3 ở `quiz.js`, Ch4 gộp trong `ch4.js`). Hai bản **bắt buộc
  cùng tập khoá và cùng tham số `{…}`** — `tests/i18n.test.js` canh việc này.
- `logic/` **không được** biết ngôn ngữ: ném `AppError(key, params)`
  (`shared/logic/app-error.js`), trả về `{key, params}` hoặc `labelKey/noteKey/textKey`.
  `ui/` dịch bằng `T()` / `tError()`. Test chặn mọi chuỗi tiếng Việt lọt vào `logic/`.
- Mỗi trang tự gọi `onLangChange(...)` để vẽ lại khi đổi ngôn ngữ.

## Tên biến Boolean
Theo Digital Design (Mano): `n=2 → x,y` · `n=3 → x,y,z` · `n=4 → w,x,y,z` ·
`n=5 → v,w,x,y,z`. Parser chấp nhận cả chữ hoa lẫn chữ thường.

## Tab Lý thuyết
Mỗi chương có `src/content/theory-chN.vi.md` và `theory-chN.en.md`, import bằng
`?raw` trong `main.js` rồi gắn bằng `mountLesson(host, md, {chapter, banks, figures})`
(`shared/ui/lesson.js` — mỗi mục `##` là một thẻ). Hai bản phải cùng số heading cấp 2.
Thêm/sửa bài học thì sửa file `.md`, không đụng code.
`<div data-check="c1q:convert:toDec"></div>` trong thẻ = một **điểm kiến thức** (D26): ví dụ mẫu từng bước (từ `q.work`)
→ tự làm tới khi đúng 2 câu liên tiếp. Phần `:nhãn` lọc câu theo `q.review`; `data-also` chỉ để nối "Ôn lại" từ câu sai.
CSS của trang gom trong khối `.theory-body` ở `src/style.css`.

## Chạy & phần dùng chung
Không còn build một file (`vite-plugin-singlefile` đã bỏ — chỉ chạy localhost, D03).
Chạy `npm run dev` ở gốc repo → http://localhost:5180/logic/.
Các file sau nằm ở `shared/` và import qua bí danh `@shared`: `ui/router.js`, `ui/screens.js`,
`ui/dom.js` (`$`), `logic/app-error.js`, lõi i18n
(`src/i18n/index.js` của app chỉ nạp từ điển rồi re-export), plugin include.
Quy tắc chung của repo: `../CLAUDE.md`.

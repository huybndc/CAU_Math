# Ôn tập Logic Circuit

App học theo chương, **song ngữ Việt/Anh**, chạy hoàn toàn offline trong trình duyệt.
Mỗi chương có 4 mục con: **Lý thuyết → Ví dụ minh hoạ → Tương tác → Luyện tập**.
Nút VI/EN ở góc trên phải; lựa chọn được nhớ lại giữa các lần mở.

| Chương | Nội dung | Tương ứng sách |
|---|---|---|
| Ch.1 | Hệ đếm, chuyển cơ số, complement, số có dấu, mã BCD/parity | §1.1–1.11 |
| Ch.2 | Đại số Boolean, định lý, hàm bù, minterm/maxterm, 16 hàm & 8 cổng | §2.1–2.8 |
| Ch.3 | Gray code, K-map, Quine–McCluskey | Ch.3 |

> `graycode-kmap.html` ở thư mục gốc repo là **bản build** của project này.

## Cách chạy, test

Chạy ở **gốc repo** (một máy chủ Vite cho cả 3 app — xem `../README.md`):

```bash
npm install
npm run dev      # http://localhost:5180/logic/
npm test         # test cả 3 app
```

## Cấu trúc

```
logic/
├── index.html            # shell: nav 2 cấp + <!--#include --> từng chương
├── src/
│   ├── style.css         # toàn bộ CSS
│   ├── main.js           # điểm vào: gọi các setup*Page()
│   ├── pages/chN.html    # markup từng chương (4 mục con)
│   ├── logic/            # hàm thuần, không đụng DOM — test bằng Node
│   ├── ui/               # đọc/ghi DOM, gắn sự kiện, gọi logic/
│   └── content/          # theory-chN.md — nội dung Lý thuyết từng chương
└── tests/                # test Vitest, mỗi file ứng với một module logic
```

Quy tắc: `logic/` **không bao giờ** import từ `ui/`.

## Sửa nội dung Lý thuyết

Sửa thẳng `src/content/theory-chN.vi.md` (và bản `.en.md` tương ứng — Markdown
thường, có thể copy từ vault Obsidian `CAU_1st`). Trang tự render lại khi lưu
(`npm run dev`), không cần đụng code.

## Thêm/sửa chuỗi giao diện

Thêm khoá vào **cả hai** `src/i18n/vi/*.js` và `src/i18n/en/*.js`, rồi dùng
`T('khoá')` trong `src/ui/` hoặc `data-i18n="khoá"` trong markup.
`npm test` sẽ báo nếu hai từ điển lệch khoá hoặc lệch tham số `{…}`.

## Thêm một chương mới

1. `src/pages/ch4.html` — copy khung 4 mục con từ một chương có sẵn.
2. Thêm 1 dòng `<!--#include src/pages/ch4.html -->` và 1 nút tab trong `index.html`.
3. `src/content/theory-ch4.md` + `mountTheory('#theory-ch4-body', md)` trong `main.js`.
4. Logic mới vào `src/logic/`, UI vào `src/ui/`, test vào `tests/`.

## Kiểm nghiệm
`npm test` và `npm run check` ở gốc repo; đối chiếu nội dung với sách đã xong theo từng milestone (xem `PLAN.md` ở đây và `DECISIONS.md`).


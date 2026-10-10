# PLAN — Logic Circuit (bản gộp; lộ trình hiện hành ở `PLAN.md` gốc, quyết định ở `DECISIONS.md`)

Gộp từ ba bản cũ (PLAN: tách Gray code/K-map; PLAN v2: app theo chương; PLAN v3: tên biến + song ngữ). Mọi milestone đều xong; còn lại chỉ là các quyết định còn hiệu lực. Bản gốc xem ở lịch sử git.

## Lịch sử milestone (đã xong)
- **0–9:** tách `graycode-kmap.html` thành project nhiều file, Vitest thay `runTests()`, trang Lý thuyết Markdown. Build gộp một file HTML bằng `vite-plugin-singlefile` (mở được bằng `file://`).
- **A–F:** điều hướng 2 cấp theo chương; Ch.1 (hệ đếm, complement, số có dấu, mã hoá) và Ch.2 (đại số Boolean, 16 hàm, 8 cổng) đủ Lý thuyết · Ví dụ · Tương tác · Luyện tập.
- **G–K:** đổi tên biến, sắp lại thẻ K-map, giải thích thành Boolean function, hạ tầng VI/EN, rà soát chéo.

## Quyết định còn hiệu lực
1. **Tên biến theo Mano (Digital Design 6th ed.):** n=2 → x,y · n=3 → x,y,z · n=4 → w,x,y,z · n=5 → v,w,x,y,z. Parser nhận cả chữ hoa lẫn thường.
2. **Kết quả trước dữ liệu thô:** thứ người học cần xem đặt trên, bảng tra cứu đặt dưới (Ch.1, Ch.2, K-map).
3. **Giải thích từng bước** trả `{ title, formula, reason, groups }`: `formula` là một dòng `F = …`, `reason` một câu; không đoạn văn dài.
4. **Song ngữ:** nút VI/EN ở header, nhớ bằng `localStorage`, mặc định VI; chuỗi UI qua `t(key)`; lý thuyết tách `theory-chN.vi.md` / `.en.md`.
5. **`logic/` ném mã lỗi `{ code, params }`** thay vì chuỗi, `ui/` dịch; `logic/` không đụng DOM và không biết ngôn ngữ.
6. **Gray code ở lại Chương 3** (gắn với K-map), Chương 1 có dòng tham chiếu chéo.
7. **Mã tra cứu (BCD/2421/Excess-3/ASCII/parity):** chỉ Lý thuyết + Ví dụ có thao tác (cộng BCD +6, parity), không dựng Luyện tập riêng.
8. **Huntington / minterm–maxterm / canonical SOP-POS** soạn lại từ sách, chốt trong Ch.2.

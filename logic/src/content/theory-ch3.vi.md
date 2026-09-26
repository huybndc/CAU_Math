# Chương 3 — Rút gọn cấp cổng

*Theo Digital Design (Mano, 6th ed.), §3.1–3.8, cùng Gray code (§1.7) làm nền cho K-map.*

**Sau chương này bạn làm được:**
- Lập K-map 3–4 biến và khoanh nhóm đúng quy tắc.
- Tìm prime implicant, essential PI và viết SOP / POS tối giản, kể cả khi có don't care.
- Chuyển mạch sang NAND / NOR và nhận ra hàm XOR trên K-map.

## Vì sao phải rút gọn

Mỗi **literal** là một ngõ vào cổng, mỗi **term** là một cổng. Biểu thức ngắn hơn ⇒ mạch ít cổng, rẻ và nhanh hơn.

Rút gọn bằng định lý (Chương 2) phải "nhìn ra" định lý nào dùng được. **K-map** biến việc đó thành **khoanh ô trên hình**, làm có hệ thống.

## Gray code: vì sao K-map xếp 00, 01, 11, 10

Hai ô **kề nhau** trên K-map phải khác đúng **một biến**, để ghép được:

```
x′yz + xyz = yz(x′ + x) = yz
```

Xếp nhị phân thường 00, 01, **10**, 11 thì bước 01 → 10 đổi 2 bit. Thứ tự **Gray 00, 01, 11, 10** chỉ đổi 1 bit mỗi bước, kể cả từ cột cuối vòng về cột đầu.

<details><summary>Dựng Gray n bit bằng "lật và thêm tiền tố"</summary>

Gray n bit = (Gray n − 1 bit, thêm **0** phía trước) nối với (Gray n − 1 bit **lật ngược**, thêm **1**). Chỗ nối là hai bản sao giống nhau nên chỉ khác bit tiền tố.

</details>

[Xem bảng Gray và cách dựng](#/learn/ch3/example)

<div data-check="c1q:gray" data-needs="c1q:convert:toDec"></div>

## K-map 3 biến

8 ô, hàng là x, cột là yz theo thứ tự Gray. Ô ở hàng x, cột yz là minterm có mã **x y z**.

```
 x\yz   00  01  11  10
   0    m0  m1  m3  m2
   1    m4  m5  m7  m6
```

Ví dụ: `F = Σm(2, 3, 4, 5)` khoanh được hai cặp ⇒ `F = x′y + xy′`.

<div data-check="c3q:cell:n3" data-needs="c1q:gray c2q:minterms" data-also="c3q:cell"></div>

## K-map 4 biến

16 ô: hàng **wx**, cột **yz**, cả hai theo Gray. Bản đồ **quấn biên**: cột đầu kề cột cuối, hàng đầu kề hàng cuối, nên **4 góc** là một nhóm:

```
Σm(0, 2, 8, 10)  →  x′z′
```

Nhóm 2ᵏ ô bỏ được k biến: nhóm 2 ô còn 3 literal, 4 ô còn 2, 8 ô còn 1.

[Bấm ô K-map và xem kết quả](#/learn/ch3/interactive)

<div data-check="c3q:cell:n4" data-needs="c3q:cell:n3"></div>

## Quy tắc khoanh nhóm

1. Kích thước là **luỹ thừa của 2**: 1, 2, 4, 8, 16.
2. Là **hình chữ nhật**, được quấn qua biên.
3. Chỉ chứa ô **1** (hoặc **X**), không chứa ô **0**.
4. Khoanh **nhóm lớn nhất** có thể: nhóm càng lớn, term càng ít literal.
5. Mọi ô 1 phải được phủ, dùng **ít nhóm nhất**.

Đọc term: biến **giữ nguyên** giá trị trong cả nhóm thì giữ lại (1 → x, 0 → x′); biến **đổi** giá trị thì bỏ.

## Prime implicant và essential PI

- **Prime implicant (PI):** nhóm **không mở rộng thêm** được nữa.
- **Essential PI (EPI):** PI phủ một ô 1 mà **không PI nào khác** phủ ⇒ bắt buộc có trong đáp án.

Cách làm: liệt kê mọi PI → lấy hết EPI → phủ các ô 1 còn lại bằng ít PI nhất.

<details><summary>Ví dụ Mano 3.5</summary>

`F(w, x, y, z) = Σm(0, 1, 2, 4, 5, 6, 8, 9, 12, 13, 14)` có 3 PI, cả 3 đều essential ⇒ `F = y′ + w′z′ + xz′`.

</details>

<div data-check="c3q:epis" data-needs="c3q:cell:n4" data-also="c3q:pis"></div>

## Rút gọn SOP từng bước

1. Điền 1 (và X) lên bản đồ.
2. Khoanh các nhóm lớn nhất, nhớ nhóm quấn biên.
3. Lấy các EPI trước; phủ phần còn lại bằng ít nhóm nhất.
4. Mỗi nhóm đọc thành một term, cộng lại.

Tab Tương tác chạy đúng quy trình này và tô từng nhóm theo từng bước.

[Xem giải thích từng bước](#/learn/ch3/interactive)

<div data-check="c3q:sop" data-needs="c3q:epis c2q:simplify"></div>

## Rút gọn POS

Khoanh các ô **0** như SOP để được **F′**, rồi lấy bù bằng DeMorgan: mỗi tích thành một tổng, mỗi literal đảo dấu.

```
F = Σm(0, 1, 2, 5, 8, 9, 10)
F′ = wx + yz + xz′
F = (w′ + x′)(y′ + z′)(x′ + z)
```

SOP và POS luôn tương đương nhưng số literal có thể khác; chọn cách nào rẻ hơn.

<div data-check="c3q:pos" data-needs="c3q:sop c2q:maxterms"></div>

## Điều kiện không quan tâm (don't care)

Có những tổ hợp đầu vào **không bao giờ xảy ra**, nên F ở đó bằng gì cũng được. Ghi là **X**, viết `d(…)`.

Ô X được coi là **1 nếu giúp nhóm to hơn**, còn không thì bỏ qua. **Không bắt buộc** phủ.

```
F = Σm(1, 3, 7, 11, 15) + d(0, 2, 5)   →   F = yz + w′x′
```

<div data-check="c3q:dontcare" data-needs="c3q:sop"></div>

## Mạch NAND và NOR

- **SOP → NAND–NAND:** thay mọi cổng của mạch AND–OR bằng NAND.
- **POS → NOR–NOR:** thay mọi cổng của mạch OR–AND bằng NOR.

Lý do: `xy + zw = ((xy)′(zw)′)′`. Literal đi thẳng vào tầng 2 thì phải đảo trước.

<details><summary>Vì sao chuộng NAND?</summary>

NAND, NOR là cổng phổ quát và rẻ nhất khi chế tạo CMOS. Dùng một loại cổng cho cả mạch thì dễ sản xuất hơn.

</details>

## Hàm XOR: hàm lẻ và parity

`x ⊕ y ⊕ z` bằng 1 khi có **lẻ** số biến bằng 1: đó là **hàm lẻ** (odd function). Bù của nó là **hàm chẵn**.

```
x ⊕ y ⊕ z = Σm(1, 2, 4, 7)
```

Trên K-map, hàm lẻ là **bàn cờ**: không hai ô 1 nào kề nhau, nên không rút gọn được bằng AND–OR. Vì vậy nó dùng cổng XOR, ví dụ **mạch sinh parity chẵn** `P = x ⊕ y ⊕ z`.

<div data-check="c3q:xor" data-needs="c3q:cell:n3 c2q:identify"></div>

## Những chỗ hay sai

- Quên K-map **quấn biên** ⇒ sót nhóm 4 góc.
- Khoanh 3 hoặc 6 ô (không phải luỹ thừa của 2).
- Xếp hàng/cột theo nhị phân 00, 01, 10, 11 thay vì Gray.
- Bắt buộc phủ ô don't care (chúng chỉ là tuỳ chọn).
- Làm POS mà quên lấy bù ở bước cuối.
- Dừng ở đáp án đúng nhưng **chưa tối giản**.

[Luyện tập chương này](#/practice/ch3)

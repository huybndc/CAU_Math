# Chương 2 — Đại số Boolean & cổng logic

*Theo Digital Design (Mano, 6th ed.), §2.2–2.8.*

**Sau chương này bạn làm được:**
- Dùng tiên đề, định lý và DeMorgan để biến đổi, rút gọn biểu thức Boolean.
- Chuyển qua lại giữa bảng chân trị, Σm / ΠM và mạch hai mức.
- Đọc ký hiệu cổng và dựng mạch chỉ bằng NAND.

## Ba phép toán cơ bản

Biến Boolean chỉ nhận **0 hoặc 1**. Có ba phép:

```
AND   x · y  (viết xy)   = 1 khi CẢ HAI bằng 1
OR    x + y              = 1 khi ÍT NHẤT MỘT bằng 1
NOT   x′                 = đảo giá trị
```

Thứ tự ưu tiên: **ngoặc → NOT → AND → OR**. Vậy `x + yz′` nghĩa là `x + (y · (z′))`.

## Tiên đề Huntington

Đại số Boolean được xây từ 6 tiên đề trên tập `{0, 1}`. Hai chỗ **khác đại số thường**:

- Luật phân phối đúng **cả hai chiều**: `x(y + z) = xy + xz` **và** `x + yz = (x + y)(x + z)`.
- **Không có** phép trừ, phép chia.

<details><summary>Đủ 6 tiên đề</summary>

| | Dạng + | Dạng · |
|---|---|---|
| P1 đóng | x + y ∈ {0,1} | x · y ∈ {0,1} |
| P2 trung hoà | x + 0 = x | x · 1 = x |
| P3 giao hoán | x + y = y + x | xy = yx |
| P4 phân phối | x(y + z) = xy + xz | x + yz = (x + y)(x + z) |
| P5 phần bù | x + x′ = 1 | x · x′ = 0 |
| P6 | có ít nhất 2 phần tử khác nhau | |

</details>

## Nguyên lý đối ngẫu

Đổi **`+ ↔ ·`** và **`0 ↔ 1`** trong một đẳng thức đúng thì được một đẳng thức đúng khác: **dual** của nó. Biến giữ nguyên, không bù.

```
x + 0 = x        ⟷   x · 1 = x
x + xy = x       ⟷   x(x + y) = x
```

Nhờ vậy mỗi định lý chỉ cần chứng minh một vế. Nhớ thêm ngoặc để giữ thứ tự ưu tiên: dual của `x + yz` là `x(y + z)`.

<div data-check="c2q:dual"></div>

## Các định lý cơ bản

| | Dạng + | Dạng · |
|---|---|---|
| T1 luỹ đẳng | x + x = x | xx = x |
| T2 phần tử nuốt | x + 1 = 1 | x · 0 = 0 |
| T3 bù hai lần | (x′)′ = x | |
| T4 kết hợp | x + (y + z) = (x + y) + z | x(yz) = (xy)z |
| T5 DeMorgan | (x + y)′ = x′y′ | (xy)′ = x′ + y′ |
| T6 hấp thụ | x + xy = x | x(x + y) = x |

Mỗi hàng là một cặp đối ngẫu. Kiểm chứng định lý nào cũng được bằng bảng chân trị.

## Hàm Boolean và bảng chân trị

Một hàm Boolean n biến mô tả được bằng **biểu thức**, **bảng chân trị** (đủ 2ⁿ dòng) hoặc **sơ đồ mạch**.

Bảng chân trị của một hàm là **duy nhất**; biểu thức thì **không**: cùng một hàm viết được nhiều cách. Rút gọn là tìm cách viết **rẻ nhất** (ít term, ít literal).

[Xem bảng 16 hàm và cổng](#/learn/ch2/interactive)

<div data-check="c2q:column"></div>

## Rút gọn bằng định lý

```
x(x′ + y)          = xx′ + xy      = xy
x + x′y            = (x + x′)(x + y) = x + y
(x + y)(x + y′)    = x + yy′       = x
xy + x′z + yz      = xy + x′z               (consensus)
```

Dòng 2 và 3 đáng nhớ: **thêm một biến chưa chắc đã tốn thêm literal**.

<details><summary>Vì sao yz thừa trong consensus?</summary>

Khi `yz = 1` thì y = z = 1. Nếu x = 1 thì `xy = 1`; nếu x = 0 thì `x′z = 1`. Vậy `yz` luôn đã được hai term kia phủ.

</details>

[Xem từng bước biến đổi](#/learn/ch2/example)

<div data-check="c2q:simplify" data-needs="c2q:column"></div>

## Hàm bù bằng DeMorgan

**Đổi `+ ↔ ·` và bù từng literal.** Nói cách khác: lấy dual rồi bù từng biến.

```
F₁  = x′yz′ + x′y′z
F₁′ = (x + y′ + z)(x + y + z′)

F₂  = x(y′z′ + yz)
F₂′ = x′ + (y + z)(y′ + z′)
```

Chỗ hay sai là **mất ngoặc**. `y′z′` là một tích, nên bù của nó là `(y + z)`, phải có ngoặc.

<div data-check="c2q:complement" data-needs="c2q:dual"></div>

## Minterm và maxterm

Với n biến:

- **Minterm** mᵢ: tích đủ n literal, **bằng 1 tại đúng dòng i**. Biến bằng 0 thì viết có dấu ′.
- **Maxterm** Mᵢ: tổng đủ n literal, **bằng 0 tại đúng dòng i**. Quy ước **ngược lại**: biến bằng 1 thì có dấu ′.

```
i = 5 = 101:   m₅ = xy′z        M₅ = x′ + y + z′        Mᵢ = (mᵢ)′
```

<div data-check="c2q:minterms" data-needs="c2q:column"></div>

## Dạng chuẩn: Σm và ΠM

- **Tổng các minterm** ở những dòng F = 1: `F = Σm(…)`
- **Tích các maxterm** ở những dòng F = 0: `F = ΠM(…)`

Hai dạng dùng **hai tập chỉ số bù nhau**:

```
F(x, y, z) = Σm(1, 3, 5, 7) = ΠM(0, 2, 4, 6)
```

Dạng chuẩn **duy nhất** nhưng thường **chưa tối giản**; Chương 3 rút gọn nó.

<div data-check="c2q:canon" data-needs="c2q:minterms"></div>

## SOP, POS và mạch hai mức

**Dạng chuẩn tắc** (standard form) không cần đủ biến trong mỗi term:

```
SOP:  F = y′ + xy + x′yz′          → một tầng AND rồi một cổng OR
POS:  F = x(y′ + z)(x′ + y + z′)   → một tầng OR rồi một cổng AND
```

Cả hai là **mạch hai mức**: tín hiệu đi qua tối đa hai tầng cổng, nên trễ ngắn.

<div data-check="c2q:maxterms" data-needs="c2q:canon" data-also="c2q:circuit"></div>

## 16 hàm hai biến

Hai biến có 4 dòng bảng chân trị ⇒ **2⁴ = 16** hàm, từ F₀ = 0 tới F₁₅ = 1.

- **Hằng:** F₀ = 0, F₁₅ = 1
- **Một biến:** x, y, x′, y′
- **Hai ngôi:** AND, OR, NAND, NOR, XOR, XNOR, và các phép kéo theo, ức chế

Chỉ số i của Fᵢ chính là cột kết quả đọc thành số nhị phân.

[Bấm thử từng hàm](#/learn/ch2/interactive)

<div data-check="c2q:identify" data-needs="c2q:column"></div>

## Cổng logic số

8 cổng có linh kiện chuẩn: **AND, OR, NOT, Buffer, NAND, NOR, XOR, XNOR**.

- AND, OR, XOR có tính **kết hợp** ⇒ mở rộng nhiều ngõ vào tự nhiên.
- NAND, NOR **không kết hợp**: `(x↑y)↑z ≠ x↑(y↑z)`. NAND 3 ngõ được định nghĩa là `(xyz)′`.
- NAND và NOR là **cổng phổ quát**: chỉ một loại là dựng được mọi hàm.

<div data-check="c2q:identify" data-needs="c2q:column" data-also="c2q:gate"></div>

## Mạch chỉ dùng NAND

SOP chuyển thẳng sang NAND bằng **bù hai lần rồi DeMorgan**:

```
F = xy + z′w
  = ((xy + z′w)′)′
  = ((xy)′ · (z′w)′)′        ← NAND tầng 2 của các NAND tầng 1
```

Mạch AND–OR hai mức thành **NAND–NAND** với đúng số cổng như cũ.

[Chuyển thử một biểu thức](#/learn/ch2/interactive)

<div data-check="c2q:nand" data-needs="c2q:complement"></div>

## Những chỗ hay sai

- Quên luật phân phối đúng **cả hai chiều**: `x + yz = (x + y)(x + z)`.
- Lấy dual hay bù mà **mất ngoặc** ⇒ sai thứ tự ưu tiên.
- Nhầm quy ước dấu ′ giữa minterm và maxterm (chúng **ngược nhau**).
- Tưởng NAND 3 ngõ là ghép hai NAND 2 ngõ.
- Dừng ở dạng chuẩn Σm và tưởng đó là đáp án tối giản.

[Luyện tập chương này](#/practice/ch2)

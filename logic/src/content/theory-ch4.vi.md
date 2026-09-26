# Chương 4 — Mạch tổ hợp

*Theo Digital Design (Mano, 6th ed.), §4.1–4.11.*

**Sau chương này bạn làm được:**
- Phân tích một mạch nhiều mức ra bảng chân trị, và thiết kế mạch từ đề bằng lời.
- Tính tay bộ cộng nối tiếp, bộ cộng–trừ, cờ tràn V, bộ cộng BCD.
- Dùng bộ so sánh, decoder, encoder ưu tiên, MUX — và thực hiện một hàm Boolean bằng decoder hoặc MUX.

## Mạch tổ hợp là gì

Đầu ra **chỉ phụ thuộc đầu vào hiện tại**, không có bộ nhớ. Mô tả đầy đủ bằng một bảng chân trị (n đầu vào ⇒ 2ⁿ dòng) hoặc một biểu thức Boolean cho mỗi đầu ra.

Mạch **tuần tự** (Chương 5) thì khác: đầu ra còn phụ thuộc trạng thái đã lưu.

Các khối trong chương này (bộ cộng, decoder, MUX…) là mạch tổ hợp chuẩn, có sẵn dạng IC và được dùng lại khắp nơi.

## Phân tích mạch

Cho sơ đồ, tìm hàm:

1. **Đặt tên** đầu ra của mọi cổng không phải đầu ra cuối: T₁, T₂, …
2. Viết biểu thức (hoặc cột chân trị) của từng tên, **đi từ đầu vào ra**.
3. Thế dần cho tới đầu ra F.

Cổng có **vòng tròn** (NAND, NOR) thì đảo kết quả. Bỏ quên vòng tròn là lỗi hay gặp nhất.

<div data-check="c4q:analyze" data-needs="c2q:column c2q:identify"></div>

## Quy trình thiết kế

1. Từ đề bằng lời, xác định số đầu vào, đầu ra, đặt tên.
2. Lập **bảng chân trị**; tổ hợp không bao giờ xảy ra thì ghi **X**.
3. Rút gọn từng đầu ra (K-map, Chương 3).
4. Vẽ mạch.

<details><summary>Ví dụ: BCD → Excess-3 (Mano §4.4)</summary>

4 đầu vào A B C D (0–9), 4 đầu ra w x y z = số + 3. Tổ hợp 10–15 không xảy ra ⇒ don't care. Rút gọn ra, chẳng hạn, `z = D′` và `y = CD + C′D′`.

</details>

## Bộ cộng bán phần và toàn phần

**Bán phần** (half adder) cộng 2 bit x, y:

```
S = x ⊕ y        C = xy
```

**Toàn phần** (full adder) cộng thêm carry vào z:

```
S = x ⊕ y ⊕ z
C = xy + z(x ⊕ y)
```

C = 1 khi có **ít nhất hai** số 1 trong x, y, z. Một bộ toàn phần ghép được từ hai bộ bán phần và một cổng OR.

## Bộ cộng nối tiếp (ripple carry)

Nối n bộ cộng toàn phần: carry ra của bit i là carry vào của bit i + 1, C₀ là carry vào đầu tiên.

```
  carry  0 1 1 0      (C₃C₂C₁C₀)
    A    1 0 1 1
    B    0 0 1 1
    S    1 1 1 0      C₄ = 0
```

Tính **từ bit 0 lên**. Nhược điểm: bit cao phải chờ carry lan qua mọi bit dưới ⇒ chậm khi n lớn.

<div data-check="c4q:ripple" data-needs="c1q:convert:toDec"></div>

## Bộ cộng–trừ

Thêm một ngõ **M** và một cổng XOR trên mỗi bit của B:

- **M = 0:** B ⊕ 0 = B, C₀ = 0 ⇒ **A + B**.
- **M = 1:** B ⊕ 1 = B′, C₀ = 1 ⇒ **A + B′ + 1 = A − B** (bù 2).

Cùng một mạch cộng làm được cả phép trừ — đúng như phép trừ bằng số bù ở Chương 1.

<div data-check="c4q:addsub" data-needs="c4q:ripple c1q:subtract"></div>

## Tràn số (overflow)

Với số **có dấu** n bit, kết quả có thể vượt khoảng biểu diễn (4 bit: −8…7). Mạch phát hiện bằng hai carry quanh bit dấu:

```
V = Cₙ ⊕ Cₙ₋₁
```

V = 1 ⇔ carry **vào** bit dấu khác carry **ra**. Chỉ xảy ra khi cộng hai số **cùng dấu** (hoặc trừ hai số khác dấu).

Với số **không dấu**, carry ra Cₙ mới là dấu hiệu vượt.

<div data-check="c4q:overflow" data-needs="c4q:addsub c1q:signed"></div>

## Carry lookahead

Để khỏi chờ carry lan, định nghĩa cho mỗi bit:

```
Gᵢ = AᵢBᵢ          (sinh carry)
Pᵢ = Aᵢ ⊕ Bᵢ       (truyền carry)
Cᵢ₊₁ = Gᵢ + PᵢCᵢ
```

Khai triển, mọi carry chỉ còn phụ thuộc G, P và C₀:

```
C₂ = G₁ + P₁G₀ + P₁P₀C₀
```

Mỗi carry là mạch **hai mức** ⇒ mọi carry có cùng lúc, đổi lại tốn thêm cổng.

## Cộng BCD

Cộng hai chữ số BCD (0–9) và carry vào: tổng từ 0 tới 19.

1. Cộng nhị phân như thường, được K Z₈Z₄Z₂Z₁.
2. Nếu tổng **lớn hơn 9** (K = 1, hoặc Z₈Z₄ = 1, hoặc Z₈Z₂ = 1): **cộng 0110** và ra C = 1.

```
8 + 9:  1000 + 1001 = 1 0001  (17 > 9)
        0001 + 0110 = 0111,  C = 1   ⇒ 17
```

Cộng 6 để "nhảy qua" 6 tổ hợp 1010–1111 không dùng trong BCD.

<div data-check="c4q:bcdadd" data-needs="c4q:ripple c1q:bcd"></div>

## Bộ so sánh độ lớn

So A = A₃A₂A₁A₀ với B. Tín hiệu **bằng nhau** ở từng bit (XNOR):

```
xᵢ = AᵢBᵢ + Aᵢ′Bᵢ′
(A = B) = x₃x₂x₁x₀
(A > B) = A₃B₃′ + x₃A₂B₂′ + x₃x₂A₁B₁′ + x₃x₂x₁A₀B₀′
```

Đọc từ bit cao xuống: **bit cao nhất khác nhau** quyết định; số nào có 1 ở đó thì lớn hơn. (A < B) giống vậy với A, B đổi chỗ.

<div data-check="c4q:compare" data-needs="c2q:identify"></div>

## Decoder

Decoder n → 2ⁿ: đúng **một** ngõ ra Dᵢ bằng 1, với i là số nhị phân ở đầu vào. Vậy **Dᵢ chính là minterm mᵢ**.

⇒ Mọi hàm n biến = decoder n → 2ⁿ + một cổng **OR** gom các minterm của hàm.

Hàm có quá nhiều minterm: dùng cổng **NOR** gom các minterm của **F′** (ra thẳng F).

Nhiều decoder có ngõ **enable** và ngõ ra **tích cực mức thấp** (dùng NAND): khi đó gom bằng NAND thay cho OR.

<div data-check="c4q:decoder" data-needs="c2q:minterms"></div>

## Encoder ưu tiên

Encoder làm ngược decoder: 2ⁿ ngõ vào → mã n bit. Bộ **ưu tiên** chịu được nhiều ngõ cùng bằng 1: chỉ mã hoá ngõ có **chỉ số cao nhất**.

4 ngõ vào (D₃ ưu tiên nhất) ⇒ ra x y (chỉ số) và **V** (valid):

```
D₃ D₂ D₁ D₀ = 0 1 1 0   ⇒   x y V = 1 0 1
D₃ D₂ D₁ D₀ = 0 0 0 0   ⇒   V = 0, x y tuỳ ý
```

<div data-check="c4q:encoder" data-needs="c4q:decoder"></div>

## Multiplexer (MUX)

MUX 2ⁿ → 1: n ngõ **chọn** S quyết định ngõ dữ liệu nào được đưa ra.

```
MUX 4 → 1:   Y = S₁′S₀′I₀ + S₁′S₀I₁ + S₁S₀′I₂ + S₁S₀I₃
```

Ngõ chọn S₁S₀ = k (số nhị phân) ⇒ Y = Iₖ. Với S₁ = x, S₀ = y và Iₖ là 0, 1, z hoặc z′, ngõ Iₖ quyết định F ở hai dòng **m = 2k** (z = 0) và **2k + 1** (z = 1).

<div data-check="c4q:muxRead" data-needs="c2q:minterms"></div>

## Hàm Boolean bằng MUX

Hàm n biến dùng MUX 2ⁿ⁻¹ → 1: n − 1 biến đầu vào ngõ chọn, **biến cuối** vào ngõ dữ liệu.

Chia bảng chân trị thành từng **cặp dòng** chỉ khác biến cuối. Mỗi cặp là một Iₖ:

| F khi z = 0, 1 | 0, 0 | 1, 1 | 0, 1 | 1, 0 |
|---|---|---|---|---|
| Iₖ | 0 | 1 | z | z′ |

Ví dụ `F(x, y, z) = Σm(1, 2, 6, 7)` ⇒ I₀ = z, I₁ = z′, I₂ = 0, I₃ = 1.

<div data-check="c4q:mux" data-needs="c4q:muxRead"></div>

## Những chỗ hay sai

- Phân tích mạch mà **quên vòng tròn** đảo của NAND/NOR.
- Bộ trừ: quên **C₀ = 1** (chỉ đảo B là bù 1, chưa phải bù 2).
- Nhầm tràn số có dấu (V = Cₙ ⊕ Cₙ₋₁) với carry ra của số không dấu (Cₙ).
- Cộng BCD: quên cộng 0110 khi tổng từ **10 đến 15** (lúc đó chưa có carry ra).
- Bộ so sánh: xᵢ là **XNOR** (bằng nhau), không phải XOR.
- MUX: đổi z với z′, hoặc đảo thứ tự hai ngõ chọn.

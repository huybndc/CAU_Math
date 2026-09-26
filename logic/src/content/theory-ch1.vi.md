# Chương 1 — Hệ đếm & mã nhị phân

*Theo Digital Design (Mano, 6th ed.), §1.1–1.9.*

**Sau chương này bạn làm được:**
- Đổi số giữa các cơ số 2, 8, 10, 16, cả phần lẻ.
- Tính số bù, trừ bằng số bù; đọc số có dấu dạng bù 2 và nhận ra tràn số.
- Mã hoá bằng BCD, Gray code và bit parity.

## Tín hiệu số và bit

Mạch số chỉ phân biệt **hai mức điện áp**, quy ước là `0` và `1`. Một chữ số nhị phân gọi là **bit**.

> Vì sao hai mức mà không phải mười? Phân biệt "có điện / không điện" thì chống nhiễu tốt, linh kiện đơn giản, và đại số Boolean (Chương 2) mô tả được chính xác.

## Số ở cơ số r

Số ở **cơ số r** dùng các chữ số `0 … r−1`. Mỗi vị trí có **trọng số là một luỹ thừa của r**:

```
a₂a₁a₀ . a₋₁a₋₂  =  a₂·r² + a₁·r¹ + a₀·r⁰ + a₋₁·r⁻¹ + a₋₂·r⁻²
```

Luôn ghi rõ cơ số: `(11)₂ = 3`, không phải "mười một".

<details><summary>Bốn cơ số hay gặp</summary>

| Cơ số | Tên | Chữ số |
|---|---|---|
| 2 | nhị phân (binary) | 0, 1 |
| 8 | bát phân (octal) | 0–7 |
| 10 | thập phân (decimal) | 0–9 |
| 16 | thập lục phân (hex) | 0–9, A–F |

</details>

## Cơ số r → thập phân

Nhân từng chữ số với trọng số của nó rồi cộng lại.

```
(630)₈      = 6·64 + 3·8 + 0      = 408
(101001.1)₂ = 32 + 8 + 1 + 0.5    = 41.5
(F3)₁₆      = 15·16 + 3           = 243
```

<div data-check="c1q:convert:toDec" data-also="c1q:convert"></div>

## Thập phân → cơ số r: phần nguyên

**Chia liên tiếp cho r, lấy số dư. Đọc số dư từ dưới lên.**

```
41 ÷ 2 = 20 dư 1   ← bit thấp nhất
20 ÷ 2 = 10 dư 0
10 ÷ 2 =  5 dư 0
 5 ÷ 2 =  2 dư 1
 2 ÷ 2 =  1 dư 0
 1 ÷ 2 =  0 dư 1   ← bit cao nhất      ⇒ (41)₁₀ = (101001)₂
```

<details><summary>Vì sao lấy số dư?</summary>

`41 = 2·20 + 1`: số dư chính là chữ số hàng đơn vị (trọng số r⁰). Thương `20` là phần còn lại sau khi "dịch phải" một chữ số, nên làm tiếp với nó.

</details>

[Xem từng bước chia](#/learn/ch1/example)

<div data-check="c1q:convert:fromDec" data-needs="c1q:convert:toDec"></div>

## Thập phân → cơ số r: phần lẻ

**Nhân liên tiếp với r, lấy phần nguyên. Đọc từ trên xuống.**

```
0.6875 × 2 = 1.375  → 1
0.375  × 2 = 0.75   → 0
0.75   × 2 = 1.5    → 1
0.5    × 2 = 1.0    → 1   dừng   ⇒ (0.6875)₁₀ = (0.1011)₂
```

Phần nguyên và phần lẻ dùng **hai phép ngược nhau**: chia với phần nguyên, nhân với phần lẻ.

<details><summary>Không phải lúc nào cũng dừng</summary>

`0.1` sang nhị phân là `0.000110011…` lặp mãi. Đó là lý do máy tính không lưu chính xác được `0.1`.

</details>

## Nhị phân ↔ bát phân, thập lục phân

Vì `8 = 2³` và `16 = 2⁴`: **gộp 3 bit** thành một chữ số octal, **gộp 4 bit** thành một chữ số hex, tính từ dấu chấm ra hai phía. Không cần đi qua thập phân.

```
 10 110 001 101 011        10 1100 0110 1011
  2   6   1   5   3         2    C    6    B
⇒ (26153)₈                ⇒ (2C6B)₁₆
```

Thiếu bit thì đệm 0: phần nguyên đệm bên **trái**, phần lẻ đệm bên **phải**.

<div data-check="c1q:convert:group" data-needs="c1q:convert:toDec"></div>

## Số bù: (r − 1) và r

**Bù r − 1**: lấy chữ số lớn nhất (r − 1) trừ đi **từng chữ số**.
**Bù r** = bù r − 1 **cộng 1**.

```
1's complement của 1011000  =  0100111
2's complement của 1011000  =  0101000
9's complement của 546700   =  453299
10's complement của 546700  =  453300
```

Mẹo bù 2: giữ nguyên các bit từ phải sang tới bit 1 đầu tiên, đảo hết các bit còn lại.

<div data-check="c1q:complement" data-needs="c1q:convert:toDec" data-also="c1q:dimcomplement"></div>

## Trừ bằng số bù

Máy tính không trừ trực tiếp: **M − N = M + (bù r của N)**.

- **Có nhớ tràn** ra ngoài ⇒ kết quả dương, bỏ số nhớ.
- **Không có nhớ** ⇒ kết quả âm: lấy bù r của tổng rồi thêm dấu −.

```
72532 − 03250:  72532 + 96750 = 1│69282  ⇒ 69282
03250 − 72532:  03250 + 27468 =  30718   ⇒ −69282
```

[Tự thử phép trừ](#/learn/ch1/interactive)

<div data-check="c1q:subtract" data-needs="c1q:complement"></div>

## Số nhị phân có dấu

Bit trái nhất là **bit dấu** (0 = dương, 1 = âm). Số dương giống nhau ở cả ba cách; số âm thì khác:

| −9 trên 8 bit | Cách làm |
|---|---|
| `10001001` dấu–độ lớn | bật bit dấu |
| `11110110` bù 1 | đảo mọi bit của +9 |
| `11110111` bù 2 | bù 1 rồi cộng 1 |

Máy tính dùng **bù 2**: chỉ có một số 0, và phép cộng không cần xét dấu.

<div data-check="c1q:signed" data-needs="c1q:complement"></div>

## Bù 2: khoảng biểu diễn và tràn số

n bit bù 2 biểu diễn từ **−2ⁿ⁻¹ đến 2ⁿ⁻¹ − 1** (8 bit: −128 … 127). Bit dấu mang trọng số **−2ⁿ⁻¹**:

```
11110111 = −128 + 64 + 32 + 16 + 4 + 2 + 1 = −9
```

**Tràn số (overflow):** cộng hai số **cùng dấu** mà kết quả **khác dấu** ⇒ kết quả sai, vượt khoảng biểu diễn.

<div data-check="c1q:decode" data-needs="c1q:signed" data-also="c1q:range"></div>

## Mã BCD

**BCD** mã hoá **từng chữ số** thập phân thành 4 bit (trọng số 8-4-2-1). Không đổi cả số sang nhị phân.

```
(185)₁₀ = 0001 1000 0101   ở BCD      (12 bit)
        = 10111001         ở nhị phân  (8 bit)
```

4 bit có 16 tổ hợp nhưng BCD chỉ dùng 10; `1010 … 1111` là **không hợp lệ**.

<details><summary>Mã 2421 và Excess-3 (tự bù)</summary>

| Chữ số | BCD | 2421 | Excess-3 |
|---|---|---|---|
| 0 | 0000 | 0000 | 0011 |
| 3 | 0011 | 0011 | 0110 |
| 5 | 0101 | 1011 | 1000 |
| 9 | 1001 | 1111 | 1100 |

Excess-3 = BCD + 3. Ở 2421 và Excess-3, mã của `d` và `9 − d` là bù 1 của nhau (**tự bù**), giúp mạch trừ thập phân đơn giản hơn. BCD không có tính chất này.

</details>

<div data-check="c1q:bcd" data-needs="c1q:convert:fromDec"></div>

## Cộng BCD: hiệu chỉnh +6

Cộng từng chữ số như nhị phân. Tổng **lớn hơn 9** thì **cộng thêm 0110** và nhớ 1 sang chữ số kế.

```
184 + 576:
  đơn vị  4 + 6     = 10 > 9  ⇒ +6 ⇒ 0, nhớ 1
  chục    8 + 7 + 1 = 16 > 9  ⇒ +6 ⇒ 6, nhớ 1
  trăm    1 + 5 + 1 = 7       ⇒ 7              = 760
```

Vì sao +6? 4 bit đếm được 16 giá trị, thập phân chỉ dùng 10: cộng 6 để bỏ qua 6 tổ hợp không dùng.

## Gray code

Hai mã **liền nhau chỉ khác đúng 1 bit**. Nhờ vậy khi đếm không có lúc nhiều bit cùng đổi (tránh giá trị "rác" thoáng qua).

```
g₀ = b₀,  gᵢ = bᵢ₋₁ ⊕ bᵢ          1011 (nhị phân) → 1110 (Gray)
```

Gray code là nền của K-map ở Chương 3.

[Xem bảng Gray và cách dựng](#/learn/ch3/example)

<div data-check="c1q:gray" data-needs="c1q:convert:toDec"></div>

## ASCII và bit parity

**ASCII** mã hoá ký tự bằng 7 bit: `'A' = 1000001`, `'a' = 1100001`, `'0' = 0110000`.

**Bit parity** thêm 1 bit để tổng số bit 1 luôn **chẵn** (even) hoặc luôn **lẻ** (odd). Bên nhận đếm lại: lệch ⇒ có lỗi.

```
1000001 → even: 1000001 0    odd: 1000001 1
```

Parity chỉ **phát hiện** lỗi ở **số lẻ bit**; lỗi 2 bit thì lọt, và không sửa được lỗi.

<div data-check="c1q:parity"></div>

## Thanh ghi: bit không tự mang nghĩa

**Thanh ghi** n bit là n ô nhớ, mỗi ô giữ 1 bit. Cùng một nội dung đọc được theo nhiều cách:

```
01000001  →  số không dấu 65
          →  số bù 2: +65
          →  ký tự ASCII 'A'
```

Ý chính của chương: **ý nghĩa của bit đến từ quy ước đọc**, không nằm trong bản thân bit.

## Những chỗ hay sai

- Đọc số dư **từ trên xuống** khi đổi phần nguyên (phải đọc từ dưới lên).
- Dùng phép **chia** cho phần lẻ (phải nhân).
- Đệm 0 nhầm phía khi gộp nhóm bit ở phần lẻ.
- Quên rằng bù r = bù r − 1 **cộng 1**.
- Trừ bằng số bù mà quên xét **có nhớ tràn** hay không.
- Nhầm **BCD với nhị phân**; quên hiệu chỉnh **+6** khi tổng BCD vượt 9.
- Tưởng parity bắt được **mọi** lỗi.

[Luyện tập chương này](#/practice/ch1)

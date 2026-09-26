# Chapter 1 — Number systems & codes

*Following Digital Design (Mano, 6th ed.), §1.1–1.9.*

**After this chapter you can:**
- Convert between bases 2, 8, 10 and 16, fractions included.
- Take complements, subtract with them; read two's-complement numbers and spot overflow.
- Encode with BCD, Gray code and parity bits.

## Digital signals and bits

A digital circuit tells apart only **two voltage levels**, written `0` and `1`. One binary digit is a **bit**.

> Why two levels and not ten? "Current / no current" is robust against noise, needs simple parts, and Boolean algebra (Chapter 2) describes it exactly.

## Numbers in base r

A **base-r** number uses the digits `0 … r−1`. Each position has a **weight that is a power of r**:

```
a₂a₁a₀ . a₋₁a₋₂  =  a₂·r² + a₁·r¹ + a₀·r⁰ + a₋₁·r⁻¹ + a₋₂·r⁻²
```

Always state the base: `(11)₂ = 3`, not "eleven".

<details><summary>The four common bases</summary>

| Base | Name | Digits |
|---|---|---|
| 2 | binary | 0, 1 |
| 8 | octal | 0–7 |
| 10 | decimal | 0–9 |
| 16 | hexadecimal | 0–9, A–F |

</details>

## Base r → decimal

Multiply each digit by its weight and add.

```
(630)₈      = 6·64 + 3·8 + 0      = 408
(101001.1)₂ = 32 + 8 + 1 + 0.5    = 41.5
(F3)₁₆      = 15·16 + 3           = 243
```

<div data-check="c1q:convert:toDec" data-also="c1q:convert"></div>

## Decimal → base r: integer part

**Divide by r repeatedly and keep the remainders. Read them bottom-up.**

```
41 ÷ 2 = 20 r 1   ← lowest bit
20 ÷ 2 = 10 r 0
10 ÷ 2 =  5 r 0
 5 ÷ 2 =  2 r 1
 2 ÷ 2 =  1 r 0
 1 ÷ 2 =  0 r 1   ← highest bit      ⇒ (41)₁₀ = (101001)₂
```

<details><summary>Why the remainder?</summary>

`41 = 2·20 + 1`: the remainder is the units digit (weight r⁰). The quotient `20` is what is left after "shifting right" by one digit, so you continue with it.

</details>

[See each division step](#/learn/ch1/example)

<div data-check="c1q:convert:fromDec" data-needs="c1q:convert:toDec"></div>

## Decimal → base r: fraction part

**Multiply by r repeatedly and keep the integer parts. Read top-down.**

```
0.6875 × 2 = 1.375  → 1
0.375  × 2 = 0.75   → 0
0.75   × 2 = 1.5    → 1
0.5    × 2 = 1.0    → 1   stop   ⇒ (0.6875)₁₀ = (0.1011)₂
```

The integer and fraction parts use **opposite operations**: divide for the integer part, multiply for the fraction.

<details><summary>It does not always stop</summary>

`0.1` in binary is `0.000110011…`, repeating forever. That is why computers cannot store `0.1` exactly.

</details>

## Binary ↔ octal and hexadecimal

Because `8 = 2³` and `16 = 2⁴`: **group 3 bits** into one octal digit, **group 4 bits** into one hex digit, starting from the point outward. No detour through decimal.

```
 10 110 001 101 011        10 1100 0110 1011
  2   6   1   5   3         2    C    6    B
⇒ (26153)₈                ⇒ (2C6B)₁₆
```

Pad missing bits with 0: on the **left** of the integer part, on the **right** of the fraction.

<div data-check="c1q:convert:group" data-needs="c1q:convert:toDec"></div>

## Complements: (r − 1)'s and r's

**(r − 1)'s complement**: subtract **every digit** from the largest digit (r − 1).
**r's complement** = (r − 1)'s complement **plus 1**.

```
1's complement of 1011000  =  0100111
2's complement of 1011000  =  0101000
9's complement of 546700   =  453299
10's complement of 546700  =  453300
```

Two's complement shortcut: keep the bits from the right up to the first 1, flip all the others.

<div data-check="c1q:complement" data-needs="c1q:convert:toDec" data-also="c1q:dimcomplement"></div>

## Subtraction with complements

Computers do not subtract directly: **M − N = M + (r's complement of N)**.

- **End carry** ⇒ the result is positive; drop the carry.
- **No carry** ⇒ the result is negative: take the r's complement of the sum and add a minus sign.

```
72532 − 03250:  72532 + 96750 = 1│69282  ⇒ 69282
03250 − 72532:  03250 + 27468 =  30718   ⇒ −69282
```

[Try a subtraction yourself](#/learn/ch1/interactive)

<div data-check="c1q:subtract" data-needs="c1q:complement"></div>

## Signed binary numbers

The leftmost bit is the **sign bit** (0 = positive, 1 = negative). Positive numbers look the same in all three systems; negative ones differ:

| −9 on 8 bits | How |
|---|---|
| `10001001` signed-magnitude | set the sign bit |
| `11110110` 1's complement | flip every bit of +9 |
| `11110111` 2's complement | 1's complement plus 1 |

Computers use **2's complement**: it has a single zero, and addition needs no sign logic.

<div data-check="c1q:signed" data-needs="c1q:complement"></div>

## Two's complement: range and overflow

n bits of 2's complement cover **−2ⁿ⁻¹ to 2ⁿ⁻¹ − 1** (8 bits: −128 … 127). The sign bit weighs **−2ⁿ⁻¹**:

```
11110111 = −128 + 64 + 32 + 16 + 4 + 2 + 1 = −9
```

**Overflow:** adding two numbers of the **same sign** gives a result of the **opposite sign** ⇒ the result is wrong, it left the range.

<div data-check="c1q:decode" data-needs="c1q:signed" data-also="c1q:range"></div>

## BCD

**BCD** encodes **each decimal digit** as 4 bits (weights 8-4-2-1). It does not convert the whole number to binary.

```
(185)₁₀ = 0001 1000 0101   in BCD      (12 bits)
        = 10111001         in binary   (8 bits)
```

4 bits give 16 patterns but BCD uses 10; `1010 … 1111` are **invalid**.

<details><summary>2421 and Excess-3 (self-complementing)</summary>

| Digit | BCD | 2421 | Excess-3 |
|---|---|---|---|
| 0 | 0000 | 0000 | 0011 |
| 3 | 0011 | 0011 | 0110 |
| 5 | 0101 | 1011 | 1000 |
| 9 | 1001 | 1111 | 1100 |

Excess-3 = BCD + 3. In 2421 and Excess-3 the codes of `d` and `9 − d` are 1's complements of each other (**self-complementing**), which simplifies decimal subtraction. BCD lacks this property.

</details>

<div data-check="c1q:bcd" data-needs="c1q:convert:fromDec"></div>

## BCD addition: the +6 correction

Add digit by digit as binary. If a sum is **greater than 9**, **add 0110** and carry 1 into the next digit.

```
184 + 576:
  units  4 + 6     = 10 > 9  ⇒ +6 ⇒ 0, carry 1
  tens   8 + 7 + 1 = 16 > 9  ⇒ +6 ⇒ 6, carry 1
  hund.  1 + 5 + 1 = 7       ⇒ 7                = 760
```

Why +6? 4 bits count 16 values but decimal uses 10: adding 6 skips the 6 unused patterns.

## Gray code

Two **consecutive codes differ in exactly one bit**. When counting, several bits never change at once (no transient "garbage" values).

```
g₀ = b₀,  gᵢ = bᵢ₋₁ ⊕ bᵢ          1011 (binary) → 1110 (Gray)
```

Gray code is the backbone of the K-map in Chapter 3.

[See the Gray table and how it is built](#/learn/ch3/example)

<div data-check="c1q:gray" data-needs="c1q:convert:toDec"></div>

## ASCII and parity bits

**ASCII** encodes characters in 7 bits: `'A' = 1000001`, `'a' = 1100001`, `'0' = 0110000`.

A **parity bit** makes the number of 1s always **even** or always **odd**. The receiver recounts: a mismatch means an error.

```
1000001 → even: 1000001 0    odd: 1000001 1
```

Parity only **detects** errors in an **odd number of bits**; 2-bit errors slip through, and nothing gets corrected.

<div data-check="c1q:parity"></div>

## Registers: bits carry no meaning by themselves

An n-bit **register** is n storage cells, each holding one bit. The same content can be read in many ways:

```
01000001  →  unsigned 65
          →  2's complement +65
          →  ASCII character 'A'
```

The key idea of the chapter: **the meaning of bits comes from how we agree to read them**, not from the bits.

## Common mistakes

- Reading the remainders **top-down** for the integer part (read bottom-up).
- **Dividing** the fraction part (multiply instead).
- Padding the wrong side when grouping fraction bits.
- Forgetting that the r's complement is the (r − 1)'s complement **plus 1**.
- Subtracting with complements without checking for the **end carry**.
- Confusing **BCD with binary**; forgetting the **+6** correction when a BCD sum exceeds 9.
- Believing parity catches **every** error.

[Practise this chapter](#/practice/ch1)

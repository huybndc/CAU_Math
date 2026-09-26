# Chapter 3 — Gate-level minimization

*Following Digital Design (Mano, 6th ed.), §3.1–3.8, with Gray code (§1.7) as the basis of the K-map.*

**After this chapter you can:**
- Draw 3- and 4-variable K-maps and group cells by the rules.
- Find prime and essential prime implicants and write minimal SOP / POS, don't-cares included.
- Convert circuits to NAND / NOR and spot XOR on a K-map.

## Why minimise

Each **literal** is a gate input and each **term** is a gate. A shorter expression ⇒ fewer gates, a cheaper and faster circuit.

Simplifying with theorems (Chapter 2) means "spotting" which theorem applies. The **K-map** turns that into **circling cells on a picture**, systematically.

## Gray code: why the K-map goes 00, 01, 11, 10

Two **adjacent** K-map cells must differ in exactly **one variable**, so they can merge:

```
x′yz + xyz = yz(x′ + x) = yz
```

Plain binary order 00, 01, **10**, 11 flips 2 bits from 01 to 10. **Gray order 00, 01, 11, 10** flips one bit per step, including the wrap from the last column back to the first.

<details><summary>Building n-bit Gray code by "reflect and prefix"</summary>

n-bit Gray = (the (n − 1)-bit Gray list with **0** in front) followed by (the same list **reversed**, with **1** in front). The two copies meet at identical strings, so they differ only in the prefix bit.

</details>

[See the Gray table and how it is built](#/learn/ch3/example)

<div data-check="c1q:gray" data-needs="c1q:convert:toDec"></div>

## The 3-variable map

8 cells: rows are x, columns are yz in Gray order. The cell in row x, column yz is the minterm with code **x y z**.

```
 x\yz   00  01  11  10
   0    m0  m1  m3  m2
   1    m4  m5  m7  m6
```

Example: `F = Σm(2, 3, 4, 5)` forms two pairs ⇒ `F = x′y + xy′`.

<div data-check="c3q:cell:n3" data-needs="c1q:gray c2q:minterms" data-also="c3q:cell"></div>

## The 4-variable map

16 cells: rows **wx**, columns **yz**, both in Gray order. The map **wraps around**: the first column touches the last, the top row touches the bottom, so the **4 corners** form one group:

```
Σm(0, 2, 8, 10)  →  x′z′
```

A group of 2ᵏ cells drops k variables: 2 cells leave 3 literals, 4 leave 2, 8 leave 1.

[Click K-map cells and watch the result](#/learn/ch3/interactive)

<div data-check="c3q:cell:n4" data-needs="c3q:cell:n3"></div>

## Grouping rules

1. The size is a **power of 2**: 1, 2, 4, 8, 16.
2. It is a **rectangle**, wrap-around allowed.
3. It contains only **1** cells (or **X**), never a **0**.
4. Circle the **largest** group possible: larger group, fewer literals.
5. Cover every 1 cell using the **fewest groups**.

Reading a term: a variable that **stays constant** across the group is kept (1 → x, 0 → x′); a variable that **changes** drops out.

## Prime and essential prime implicants

- **Prime implicant (PI):** a group that **cannot be enlarged**.
- **Essential PI (EPI):** a PI covering some 1 cell that **no other PI** covers ⇒ it must be in the answer.

Procedure: list every PI → take all EPIs → cover the remaining 1 cells with the fewest PIs.

<details><summary>Mano Example 3.5</summary>

`F(w, x, y, z) = Σm(0, 1, 2, 4, 5, 6, 8, 9, 12, 13, 14)` has 3 PIs, all essential ⇒ `F = y′ + w′z′ + xz′`.

</details>

<div data-check="c3q:epis" data-needs="c3q:cell:n4" data-also="c3q:pis"></div>

## SOP minimisation step by step

1. Put the 1s (and Xs) on the map.
2. Circle the largest groups, remembering wrap-around.
3. Take the EPIs first; cover the rest with the fewest groups.
4. Read each group as one term and add them up.

The Interactive tab runs exactly this procedure and highlights each group step by step.

[See the step-by-step explanation](#/learn/ch3/interactive)

<div data-check="c3q:sop" data-needs="c3q:epis c2q:simplify"></div>

## POS minimisation

Circle the **0** cells as for SOP to get **F′**, then complement with DeMorgan: each product becomes a sum, each literal flips.

```
F = Σm(0, 1, 2, 5, 8, 9, 10)
F′ = wx + yz + xz′
F = (w′ + x′)(y′ + z′)(x′ + z)
```

SOP and POS are always equivalent but may need different numbers of literals; pick the cheaper one.

<div data-check="c3q:pos" data-needs="c3q:sop c2q:maxterms"></div>

## Don't-care conditions

Some input combinations **never happen**, so F may be anything there. Mark them **X** and write `d(…)`.

An X cell counts as **1 when it makes a group larger**, otherwise it is ignored. It **never has** to be covered.

```
F = Σm(1, 3, 7, 11, 15) + d(0, 2, 5)   →   F = yz + w′x′
```

<div data-check="c3q:dontcare" data-needs="c3q:sop"></div>

## NAND and NOR circuits

- **SOP → NAND–NAND:** replace every gate of the AND–OR circuit with NAND.
- **POS → NOR–NOR:** replace every gate of the OR–AND circuit with NOR.

Why: `xy + zw = ((xy)′(zw)′)′`. A literal fed straight into level 2 must be inverted first.

<details><summary>Why prefer NAND?</summary>

NAND and NOR are universal and the cheapest gates in CMOS. Using a single gate type for the whole circuit makes it easier to manufacture.

</details>

## XOR: the odd function and parity

`x ⊕ y ⊕ z` is 1 when an **odd** number of variables are 1: the **odd function**. Its complement is the **even function**.

```
x ⊕ y ⊕ z = Σm(1, 2, 4, 7)
```

On a K-map the odd function is a **checkerboard**: no two 1 cells touch, so AND–OR cannot simplify it. That is why it uses XOR gates, for example the **even-parity generator** `P = x ⊕ y ⊕ z`.

<div data-check="c3q:xor" data-needs="c3q:cell:n3 c2q:identify"></div>

## Common mistakes

- Forgetting the map **wraps around** ⇒ missing the 4-corner group.
- Circling 3 or 6 cells (not a power of 2).
- Ordering rows/columns in binary 00, 01, 10, 11 instead of Gray.
- Forcing don't-care cells to be covered (they are optional).
- Doing POS and forgetting the final complement.
- Stopping at a correct answer that is **not minimal**.

[Practise this chapter](#/practice/ch3)

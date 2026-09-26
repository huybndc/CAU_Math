# Chapter 4 — Combinational logic

*Following Digital Design (Mano, 6th ed.), §4.1–4.11.*

**After this chapter you can:**
- Analyze a multilevel circuit into a truth table, and design a circuit from a word problem.
- Work a ripple-carry adder, an adder–subtractor, the overflow flag V and a BCD adder by hand.
- Use comparators, decoders, priority encoders and MUXes — and implement a Boolean function with a decoder or a MUX.

## What a combinational circuit is

The outputs depend **only on the present inputs**; there is no memory. A truth table (n inputs ⇒ 2ⁿ rows) or one Boolean expression per output describes it completely.

A **sequential** circuit (Chapter 5) is different: its outputs also depend on a stored state.

The blocks in this chapter (adders, decoders, MUXes…) are standard combinational circuits, available as ICs and reused everywhere.

## Analyzing a circuit

Given a diagram, find the function:

1. **Label** the output of every gate that is not a final output: T₁, T₂, …
2. Write the expression (or truth column) of each label, **working from the inputs outward**.
3. Substitute step by step until you reach the output F.

A gate with a **bubble** (NAND, NOR) inverts its result. Forgetting the bubble is the most common mistake.

<div data-check="c4q:analyze" data-needs="c2q:column c2q:identify"></div>

## Design procedure

1. From the word problem, decide the numbers of inputs and outputs and name them.
2. Build the **truth table**; input combinations that never occur get an **X**.
3. Simplify each output (K-maps, Chapter 3).
4. Draw the circuit.

<details><summary>Example: BCD → Excess-3 (Mano §4.4)</summary>

4 inputs A B C D (0–9), 4 outputs w x y z = number + 3. Combinations 10–15 never occur ⇒ don't-cares. Simplifying gives, for instance, `z = D′` and `y = CD + C′D′`.

</details>

## Half adder and full adder

A **half adder** adds 2 bits x, y:

```
S = x ⊕ y        C = xy
```

A **full adder** also adds an input carry z:

```
S = x ⊕ y ⊕ z
C = xy + z(x ⊕ y)
```

C = 1 when **at least two** of x, y, z are 1. A full adder can be built from two half adders and an OR gate.

## Ripple-carry adder

Chain n full adders: the carry out of bit i is the carry into bit i + 1; C₀ is the first input carry.

```
  carry  0 1 1 0      (C₃C₂C₁C₀)
    A    1 0 1 1
    B    0 0 1 1
    S    1 1 1 0      C₄ = 0
```

Work **from bit 0 upward**. Drawback: the high bits must wait for the carry to ripple through every lower bit ⇒ slow for large n.

<div data-check="c4q:ripple" data-needs="c1q:convert:toDec"></div>

## Adder–subtractor

Add an input **M** and one XOR gate on each bit of B:

- **M = 0:** B ⊕ 0 = B, C₀ = 0 ⇒ **A + B**.
- **M = 1:** B ⊕ 1 = B′, C₀ = 1 ⇒ **A + B′ + 1 = A − B** (2’s complement).

The same adder also subtracts — exactly the complement subtraction of Chapter 1.

<div data-check="c4q:addsub" data-needs="c4q:ripple c1q:subtract"></div>

## Overflow

With **signed** n-bit numbers the result can leave the representable range (4 bits: −8…7). The circuit detects it with the two carries around the sign bit:

```
V = Cₙ ⊕ Cₙ₋₁
```

V = 1 ⇔ the carry **into** the sign bit differs from the carry **out**. It happens only when adding two numbers of the **same sign** (or subtracting numbers of opposite signs).

For **unsigned** numbers, the carry out Cₙ is the sign of trouble.

<div data-check="c4q:overflow" data-needs="c4q:addsub c1q:signed"></div>

## Carry lookahead

To avoid waiting for the ripple, define for each bit:

```
Gᵢ = AᵢBᵢ          (carry generate)
Pᵢ = Aᵢ ⊕ Bᵢ       (carry propagate)
Cᵢ₊₁ = Gᵢ + PᵢCᵢ
```

Expanded, every carry depends only on the G’s, P’s and C₀:

```
C₂ = G₁ + P₁G₀ + P₁P₀C₀
```

Each carry is a **two-level** circuit ⇒ all carries arrive together, at the cost of extra gates.

## BCD addition

Add two BCD digits (0–9) and an input carry: the sum is 0 to 19.

1. Add in binary as usual, giving K Z₈Z₄Z₂Z₁.
2. If the sum is **above 9** (K = 1, or Z₈Z₄ = 1, or Z₈Z₂ = 1): **add 0110** and output C = 1.

```
8 + 9:  1000 + 1001 = 1 0001  (17 > 9)
        0001 + 0110 = 0111,  C = 1   ⇒ 17
```

Adding 6 “skips over” the 6 codes 1010–1111 that BCD does not use.

<div data-check="c4q:bcdadd" data-needs="c4q:ripple c1q:bcd"></div>

## Magnitude comparator

Compare A = A₃A₂A₁A₀ with B. The **equality** signal of each bit (XNOR):

```
xᵢ = AᵢBᵢ + Aᵢ′Bᵢ′
(A = B) = x₃x₂x₁x₀
(A > B) = A₃B₃′ + x₃A₂B₂′ + x₃x₂A₁B₁′ + x₃x₂x₁A₀B₀′
```

Read from the high bit down: the **highest differing bit** decides; the number with a 1 there is larger. (A < B) is the same with A and B swapped.

<div data-check="c4q:compare" data-needs="c2q:identify"></div>

## Decoder

An n → 2ⁿ decoder makes exactly **one** output Dᵢ equal to 1, where i is the binary number on the inputs. So **Dᵢ is exactly the minterm mᵢ**.

⇒ Any n-variable function = an n → 2ⁿ decoder + one **OR** gate collecting the function’s minterms.

A function with many minterms: use a **NOR** gate collecting the minterms of **F′** (its output is F).

Many decoders have an **enable** input and **active-low** outputs (built from NANDs): then collect with a NAND instead of an OR.

<div data-check="c4q:decoder" data-needs="c2q:minterms"></div>

## Priority encoder

An encoder undoes a decoder: 2ⁿ inputs → an n-bit code. A **priority** encoder tolerates several inputs being 1: it encodes only the one with the **highest index**.

4 inputs (D₃ highest priority) ⇒ outputs x y (the index) and **V** (valid):

```
D₃ D₂ D₁ D₀ = 0 1 1 0   ⇒   x y V = 1 0 1
D₃ D₂ D₁ D₀ = 0 0 0 0   ⇒   V = 0, x y don’t care
```

<div data-check="c4q:encoder" data-needs="c4q:decoder"></div>

## Multiplexer (MUX)

A 2ⁿ → 1 MUX: n **select** lines S decide which data input is passed to the output.

```
4 → 1 MUX:   Y = S₁′S₀′I₀ + S₁′S₀I₁ + S₁S₀′I₂ + S₁S₀I₃
```

Select S₁S₀ = k (in binary) ⇒ Y = Iₖ. With S₁ = x, S₀ = y and each Iₖ equal to 0, 1, z or z′, input Iₖ decides F on the two rows **m = 2k** (z = 0) and **2k + 1** (z = 1).

<div data-check="c4q:muxRead" data-needs="c2q:minterms"></div>

## Boolean functions with a MUX

An n-variable function uses a 2ⁿ⁻¹ → 1 MUX: the first n − 1 variables go to the select lines, the **last variable** goes to the data inputs.

Split the truth table into **pairs of rows** differing only in the last variable. Each pair is one Iₖ:

| F at z = 0, 1 | 0, 0 | 1, 1 | 0, 1 | 1, 0 |
|---|---|---|---|---|
| Iₖ | 0 | 1 | z | z′ |

Example `F(x, y, z) = Σm(1, 2, 6, 7)` ⇒ I₀ = z, I₁ = z′, I₂ = 0, I₃ = 1.

<div data-check="c4q:mux" data-needs="c4q:muxRead"></div>

## Common mistakes

- Analyzing a circuit and **forgetting the bubble** of a NAND/NOR.
- Subtractor: forgetting **C₀ = 1** (inverting B alone is the 1’s complement, not the 2’s).
- Mixing up signed overflow (V = Cₙ ⊕ Cₙ₋₁) with the unsigned carry out (Cₙ).
- BCD addition: forgetting to add 0110 when the sum is **10 to 15** (there is no carry out yet).
- Comparator: xᵢ is **XNOR** (equal), not XOR.
- MUX: swapping z and z′, or reversing the order of the two select lines.

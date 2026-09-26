# Chapter 2 — Boolean algebra & logic gates

*Following Digital Design (Mano, 6th ed.), §2.2–2.8.*

**After this chapter you can:**
- Transform and simplify Boolean expressions with the postulates, theorems and DeMorgan.
- Move between truth tables, Σm / ΠM and two-level circuits.
- Read gate symbols and build NAND-only circuits.

## The three basic operations

A Boolean variable is **0 or 1**. There are three operations:

```
AND   x · y  (written xy)   = 1 when BOTH are 1
OR    x + y                 = 1 when AT LEAST ONE is 1
NOT   x′                    = flips the value
```

Precedence: **parentheses → NOT → AND → OR**. So `x + yz′` means `x + (y · (z′))`.

## Huntington postulates

Boolean algebra is built from 6 postulates over `{0, 1}`. Two points **differ from ordinary algebra**:

- The distributive law holds **both ways**: `x(y + z) = xy + xz` **and** `x + yz = (x + y)(x + z)`.
- There is **no** subtraction and no division.

<details><summary>All 6 postulates</summary>

| | + form | · form |
|---|---|---|
| P1 closure | x + y ∈ {0,1} | x · y ∈ {0,1} |
| P2 identity | x + 0 = x | x · 1 = x |
| P3 commutative | x + y = y + x | xy = yx |
| P4 distributive | x(y + z) = xy + xz | x + yz = (x + y)(x + z) |
| P5 complement | x + x′ = 1 | x · x′ = 0 |
| P6 | at least 2 distinct elements | |

</details>

## The duality principle

Swap **`+ ↔ ·`** and **`0 ↔ 1`** in a true identity and you get another true identity: its **dual**. Variables stay as they are, not complemented.

```
x + 0 = x        ⟷   x · 1 = x
x + xy = x       ⟷   x(x + y) = x
```

So every theorem needs only one side proved. Add parentheses to keep the precedence: the dual of `x + yz` is `x(y + z)`.

<div data-check="c2q:dual"></div>

## Basic theorems

| | + form | · form |
|---|---|---|
| T1 idempotence | x + x = x | xx = x |
| T2 null element | x + 1 = 1 | x · 0 = 0 |
| T3 involution | (x′)′ = x | |
| T4 associative | x + (y + z) = (x + y) + z | x(yz) = (xy)z |
| T5 DeMorgan | (x + y)′ = x′y′ | (xy)′ = x′ + y′ |
| T6 absorption | x + xy = x | x(x + y) = x |

Each row is a dual pair. Any theorem can be checked with a truth table.

## Boolean functions and truth tables

An n-variable Boolean function can be given as an **expression**, a **truth table** (all 2ⁿ rows) or a **circuit diagram**.

A function has **one** truth table but **many** expressions. Simplifying means finding the **cheapest** one (fewest terms and literals).

[See the 16 functions and gates](#/learn/ch2/interactive)

<div data-check="c2q:column"></div>

## Simplifying with theorems

```
x(x′ + y)          = xx′ + xy        = xy
x + x′y            = (x + x′)(x + y) = x + y
(x + y)(x + y′)    = x + yy′         = x
xy + x′z + yz      = xy + x′z                 (consensus)
```

Lines 2 and 3 are worth remembering: **adding a variable does not always cost a literal**.

<details><summary>Why is yz redundant in the consensus theorem?</summary>

When `yz = 1`, y = z = 1. If x = 1 then `xy = 1`; if x = 0 then `x′z = 1`. So `yz` is always already covered by the other two terms.

</details>

[See each rewriting step](#/learn/ch2/example)

<div data-check="c2q:simplify" data-needs="c2q:column"></div>

## Complements with DeMorgan

**Swap `+ ↔ ·` and complement each literal.** In other words: take the dual, then complement every variable.

```
F₁  = x′yz′ + x′y′z
F₁′ = (x + y′ + z)(x + y + z′)

F₂  = x(y′z′ + yz)
F₂′ = x′ + (y + z)(y′ + z′)
```

The classic mistake is **losing parentheses**. `y′z′` is a product, so its complement is `(y + z)`, in parentheses.

<div data-check="c2q:complement" data-needs="c2q:dual"></div>

## Minterms and maxterms

With n variables:

- **Minterm** mᵢ: a product of all n literals, **1 on exactly row i**. A variable that is 0 gets a ′.
- **Maxterm** Mᵢ: a sum of all n literals, **0 on exactly row i**. The **opposite** convention: a variable that is 1 gets a ′.

```
i = 5 = 101:   m₅ = xy′z        M₅ = x′ + y + z′        Mᵢ = (mᵢ)′
```

<div data-check="c2q:minterms" data-needs="c2q:column"></div>

## Canonical forms: Σm and ΠM

- **Sum of minterms** on the rows where F = 1: `F = Σm(…)`
- **Product of maxterms** on the rows where F = 0: `F = ΠM(…)`

The two forms use **complementary index sets**:

```
F(x, y, z) = Σm(1, 3, 5, 7) = ΠM(0, 2, 4, 6)
```

Canonical forms are **unique** but usually **not minimal**; Chapter 3 simplifies them.

<div data-check="c2q:canon" data-needs="c2q:minterms"></div>

## SOP, POS and two-level circuits

A **standard form** does not need every variable in each term:

```
SOP:  F = y′ + xy + x′yz′          → one AND level, then one OR gate
POS:  F = x(y′ + z)(x′ + y + z′)   → one OR level, then one AND gate
```

Both are **two-level circuits**: a signal passes through at most two gate levels, so the delay is short.

<div data-check="c2q:maxterms" data-needs="c2q:canon" data-also="c2q:circuit"></div>

## The 16 two-variable functions

Two variables give 4 truth-table rows ⇒ **2⁴ = 16** functions, from F₀ = 0 to F₁₅ = 1.

- **Constants:** F₀ = 0, F₁₅ = 1
- **One variable:** x, y, x′, y′
- **Binary operators:** AND, OR, NAND, NOR, XOR, XNOR, plus implication and inhibition

The index i of Fᵢ is the output column read as a binary number.

[Try each function](#/learn/ch2/interactive)

<div data-check="c2q:identify" data-needs="c2q:column"></div>

## Digital logic gates

8 gates exist as standard parts: **AND, OR, NOT, Buffer, NAND, NOR, XOR, XNOR**.

- AND, OR, XOR are **associative** ⇒ they extend naturally to more inputs.
- NAND, NOR are **not associative**: `(x↑y)↑z ≠ x↑(y↑z)`. A 3-input NAND is defined as `(xyz)′`.
- NAND and NOR are **universal**: one kind alone builds every function.

<div data-check="c2q:identify" data-needs="c2q:column" data-also="c2q:gate"></div>

## NAND-only circuits

An SOP converts straight to NAND by **complementing twice, then DeMorgan**:

```
F = xy + z′w
  = ((xy + z′w)′)′
  = ((xy)′ · (z′w)′)′        ← a level-2 NAND of level-1 NANDs
```

A two-level AND–OR circuit becomes **NAND–NAND** with the same number of gates.

[Convert an expression](#/learn/ch2/interactive)

<div data-check="c2q:nand" data-needs="c2q:complement"></div>

## Common mistakes

- Forgetting the distributive law holds **both ways**: `x + yz = (x + y)(x + z)`.
- Taking a dual or complement and **losing parentheses** ⇒ wrong precedence.
- Mixing up the ′ convention of minterms and maxterms (they are **opposite**).
- Thinking a 3-input NAND is two chained 2-input NANDs.
- Stopping at the canonical Σm and calling it minimal.

[Practise this chapter](#/practice/ch2)

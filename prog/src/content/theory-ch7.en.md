# Struct, union, typedef

*Based on the week 7 slides (structures and unions) and Perfect C. Every output shown here was run with clang.*

**After this lesson you can:**
- Declare a struct, initialise it, and access members with `.` and `->`.
- Know that a struct is copied on assignment and when passed to a function; when to use a pointer.
- Use typedef, nested structs and struct arrays; understand that a union shares memory.

## Declaring and accessing

A **struct** groups variables of different types into a new type.

```c
struct Point { int x; int y; };
struct Point pt = {1, 2};   // initialise in member order
pt.x = 5;                   // struct variable: use a dot
```

A pointer to a struct uses `->`: `p->x` is `(*p).x`. Writing `pt->x` when `pt` is not a pointer is a **compile error**.

## Assignment and passing copy the struct

`struct Point b = a;` copies **all** of a into b, arrays inside too. Changing b does not change a.

Passing a struct by value: the function gets a **copy**; changes do not reach the original. Pass a pointer to change the original.

```c
void moveX(struct Point p)  { p.x += 1; }   // pt unchanged
void moveY(struct Point *p) { p->y += 4; }  // pt changed
```

With `pt = {1, 2}`: calling `moveX(pt); moveY(&pt);` then printing gives `1 6`.

## char arrays inside a struct

You cannot assign a string to an array: `s.name = "Kim";` is an **error**. Use `strcpy(s.name, "Kim");` or initialise at declaration.

Compare strings with `strcmp`, not `==`. Two structs cannot be compared with `==` either: compare member by member.

## typedef and nested structs

`typedef struct { int h, m; } Time;` creates the name `Time`, so you need not write `struct` each time.

Without typedef you must write `struct Node n;`. Writing `Node n;` is an **error**.

Nested: `e.t.m` is member m of member t. Struct array with a pointer: `p++` moves to the **next struct element**.

## union

A **union** makes all members share **one memory area**. `sizeof(union)` is the largest member (padding may be added).

```c
union Data { int i; unsigned char b[4]; };
d.i = 258;   // 258 = 1·256 + 2
```

On a little-endian machine (x86, Apple Silicon), `d.b[0]` is the low byte: printing `d.b[0], d.b[1]` gives `2 1`.

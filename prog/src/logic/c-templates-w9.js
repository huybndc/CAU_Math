/* ---------------------------------------------------------------
   C PROGRAM TEMPLATES, week 9: functions and pointers 1.
   Topics from the week 9 slides: call by value and by address, array parameters, variable arguments,
   const pointers, struct parameters, and pointers to a row of a 2D array.
   The questions are written for this app. clang gives every answer.
   --------------------------------------------------------------- */
import { lines, choice } from './c-templates-base.js';

const MANY = 'Many correct ways. Compare with this model answer, or send your code to Claude to check.';
const avgFn = [
  'double avg(int count, ...) {',
  '    va_list ap;',
  '    double t = 0;',
  '    va_start(ap, count);',
  '    for (int i = 0; i < count; i++)',
  '        t += va_arg(ap, double);',
  '    va_end(ap);',
  '    return t / count;',
  '}',
];

export const W9_TEMPLATES = [
  {
    id: 'callby', kind: 'predict', topic: 'function', week: 9,
    params: [[10, 20], [5, 7], [3, 30], [15, 4], [8, 8]],
    src: ([v, inc]) => lines(
      '#include <stdio.h>',
      'void add_val(int origin, int inc) { origin += inc; }',
      'void add_addr(int *origin, int inc) { *origin += inc; }',
      'int main(void) {',
      `    int a = ${v}, b = ${v};`,
      `    add_val(a, ${inc});`,
      `    add_addr(&b, ${inc});`,
      '    printf("%d %d\\n", a, b);',
      '    return 0;',
      '}'),
    follow: () => ({ q: 'Which function can change a variable in main? Why?', a: ['add_addr. It receives an address and writes through *origin. add_val changes only its own copy.'] }),
  },
  {
    id: 'array-sizeof', kind: 'predict', topic: 'function', week: 9,
    params: [[[2.5, 3.5, 4.5]], [[1.5, 2.5]], [[1.0, 2.0, 3.0, 4.0, 5.0]], [[9.5, 8.5, 7.5, 6.5]]],
    src: ([xs]) => lines(
      '#include <stdio.h>',
      'int in_func(double ary[]) { return (int)sizeof(ary); }',
      'int main(void) {',
      `    double d[] = {${xs.join(', ')}};`,
      '    printf("%zu %d %zu\\n", sizeof(d), in_func(d), sizeof(d) / sizeof(d[0]));',
      '    return 0;',
      '}'),
    follow: () => ({ q: 'Why must a function that takes an array also take its size?', a: ['Inside the function, ary is only a pointer. The function cannot get the array length from it.'] }),
  },
  {
    id: 'row-ptr', kind: 'predict', topic: 'pointer', week: 9,
    params: [[[1, 2, 3, 4, 5, 6], 10], [[7, 8, 9, 1, 2, 3], 5], [[2, 4, 6, 8, 10, 12], 1], [[0, 3, 6, 9, 12, 15], 20]],
    src: ([x, k]) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      `    int a[2][3] = {{${x.slice(0, 3).join(', ')}}, {${x.slice(3).join(', ')}}};`,
      '    int (*ptr)[3] = a;',
      '    int rows = sizeof(a) / sizeof(a[0]);',
      '    int cols = sizeof(a[0]) / sizeof(a[0][0]);',
      '    for (int i = 0; i < rows; i++)',
      '        for (int j = 0; j < cols; j++)',
      `            ptr[i][j] += ${k};`,
      '    printf("%d %d %d %d\\n", rows, cols, a[1][2], *(*(ptr + 1) + 0));',
      '    return 0;',
      '}'),
    follow: () => ({ q: 'What is the difference between int (*ptr)[3] and int *ptr[3]?', a: ['int (*ptr)[3] is one pointer to an array of 3 ints. int *ptr[3] is an array of 3 pointers.'] }),
  },
  {
    id: 'err-const', kind: 'find', topic: 'pointer', week: 9,
    params: [['const int *p = &x;', '*p = 9;', 'p = &y;'], ['int * const p = &x;', 'p = &y;', '*p = 9;'], ['int const *p = &y;', '*p = 5;', 'y = 5;'], ['const int * const p = &x;', 'p = &y;', 'x = 9;']],
    src: ([decl, bad, good], fix = false) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      '    int x = 1, y = 2;',
      `    ${decl}`,
      `    ${fix ? good : bad}`,
      '    printf("%d %d %d\\n", x, y, *p);',
      '    return 0;',
      '}'),
  },
  {
    id: 'err-array-inc', kind: 'find', topic: 'pointer', week: 9,
    params: [[[95, 88, 76]], [[4, 8, 15, 16]], [[7, 9]], [[3, 1, 4, 1, 5]]],
    src: ([xs], fix = false) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      `    int point[] = {${xs.join(', ')}};`,
      '    int sum = 0;',
      '    int n = sizeof(point) / sizeof(point[0]);',
      '    for (int i = 0; i < n; i++)',
      `        sum += ${fix ? '*(point + i)' : '*(point++)'};`,
      '    printf("%d\\n", sum);',
      '    return 0;',
      '}'),
  },
  {
    id: 'dangling', kind: 'multi', type: 'findrun', topic: 'pointer', week: 9,
    params: [[4], [21], [7], [50]],
    src: ([v], bad = false) => lines(
      '#include <stdio.h>',
      bad ? 'int *make(int v) { int tmp = v * 2; return &tmp; }' : 'int *make(int v) { static int tmp; tmp = v * 2; return &tmp; }',
      'int main(void) {',
      `    int *p = make(${v});`,
      '    printf("%d\\n", *p);',
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, true); },
    probes: function (p) { return [{ warns: 'stack memory', src: this.src(p, true) }]; },
    parts: (p, r) => [
      { pts: 2, q: 'Which line is wrong? Explain the error.', a: ['Line 2: make returns the address of the local variable tmp. tmp no longer exists after the return (dangling pointer).'] },
      { pts: 3, q: `Rewrite line 2 so that the program prints ${r.out.trim()}. Keep the return type int *.`, a: ['int *make(int v) { static int tmp; tmp = v * 2; return &tmp; }', '(Also correct: change the design and let main pass the address of its own variable.)'] },
    ],
  },
  {
    id: 'mcq-variadic', kind: 'multi', type: 'mcq', topic: 'function', week: 9,
    params: [['1.0', '2.0', '6.0'], ['2.0', '4.0', '9.0'], ['1.5', '2.5', '5.0'], ['4.0', '4.0', '10.0']],
    src: ([a, b, c]) => lines(
      '#include <stdio.h>',
      '#include <stdarg.h>',
      ...avgFn,
      'int main(void) {',
      `    printf("%.2f\\n", avg(3, ${a}, ${b}, ${c}));`,
      '    return 0;',
      '}'),
    probes: () => [
      { fails: true, src: lines('double h(char *t, ..., int n);', 'int main(void) { return 0; }') },
      { fails: true, src: lines('double g(...);', 'int main(void) { return 0; }') },
      { fails: false, src: lines('int f(int n, ...);', 'double k(char *t, int n, ...);', 'int v(const char *s, ...);', 'int main(void) { return 0; }') },
    ],
    parts: ([a, b, c], r, k) => {
      const f = x => x.toFixed(2);
      return [
        choice(2, 'Which prototype does NOT compile?', ['double h(char *t, ..., int n);', 'int f(int n, ...);', 'double k(char *t, int n, ...);', 'int v(const char *s, ...);'], k),
        choice(3, 'What does the program print?', [r.out.trim(), f(+a + +b + +c), f(+a), f(+c)], k),
      ];
    },
  },
  {
    id: 'fill-array-len', kind: 'multi', type: 'fill', topic: 'function', week: 9,
    params: [[[2.5, 3.5, 4.0]], [[1.5, 2.5, 3.0, 9.0]], [[6.5, 7.5]], [[1.0, 1.0, 2.0, 3.0, 5.0]]],
    src: ([xs], fill = ['ary[i]', 'sizeof(data) / sizeof(data[0])']) => lines(
      '#include <stdio.h>',
      'double sum(double ary[], int n) {',
      '    double t = 0;',
      '    for (int i = 0; i < n; i++)',
      `        t += ${fill[0]};`,
      '    return t;',
      '}',
      'int main(void) {',
      `    double data[] = {${xs.join(', ')}};`,
      `    printf("%.1f\\n", sum(data, ${fill[1]}));`,
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['( A )', '( B )']); },
    parts: (p, r) => [
      { pts: 2, q: `sum returns the total of the array (the program prints ${r.out.trim()}). Fill in ( A ).`, a: ['ary[i]  (also OK: *(ary + i), *ary++)'] },
      { pts: 3, q: 'Fill in ( B ). Do not write the length as a number.', a: ['sizeof(data) / sizeof(data[0])  (also OK: sizeof(data) / sizeof(double))'] },
    ],
  },
  {
    id: 'fill-swap', kind: 'multi', type: 'fill', topic: 'function', week: 9,
    params: [[3, 8], [10, 2], [7, 7], [1, 100]],
    src: ([x, y], fill = ['*a = *b;', 'swap(&x, &y);']) => lines(
      '#include <stdio.h>',
      'void swap(int *a, int *b) {',
      '    int t = *a;',
      `    ${fill[0]}`,
      '    *b = t;',
      '}',
      'int main(void) {',
      `    int x = ${x}, y = ${y};`,
      `    ${fill[1]}`,
      '    printf("%d %d\\n", x, y);',
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['( A )', '( B )   /* call swap for x and y */']); },
    parts: (p, r) => [
      { pts: 2, q: `The program must print ${r.out.trim()}. Fill in ( A ).`, a: ['*a = *b;'] },
      { pts: 3, q: 'Fill in ( B ).', a: ['swap(&x, &y);'] },
    ],
  },
  {
    id: 'write-sum-all', kind: 'multi', type: 'write', topic: 'function', week: 9,
    params: [[[1, 2, 3]], [[10, 20]], [[4, 5, 6, 7]], [[9]]],
    src: ([xs], body = ['    va_list ap;', '    int t = 0;', '    va_start(ap, count);', '    for (int i = 0; i < count; i++)', '        t += va_arg(ap, int);', '    va_end(ap);', '    return t;']) => lines(
      '#include <stdio.h>',
      '#include <stdarg.h>',
      'int sum_all(int count, ...) {',
      ...body,
      '}',
      'int main(void) {',
      `    printf("%d\\n", sum_all(${xs.length}, ${xs.join(', ')}));`,
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['    ( A )   /* write the body */']); },
    parts: (p, r) => [
      { pts: 3, q: 'sum_all returns the total of the count values after it. Write the body at ( A ).', a: ['va_list ap; int t = 0; va_start(ap, count); for (int i = 0; i < count; i++) t += va_arg(ap, int); va_end(ap); return t;', MANY] },
      { pts: 2, q: 'With your function, what does the program print?', a: [`Prints ${r.out.trim()}`] },
    ],
  },
  {
    id: 'write-raise', kind: 'multi', type: 'write', topic: 'struct', week: 9,
    params: [[25000, 30000, 1000], [100, 250, 50], [7000, 8000, 500], [12, 34, 2]],
    src: ([a, b, k], body = ['    for (int i = 0; i < n; i++)', '        (b + i)->price += inc;']) => lines(
      '#include <stdio.h>',
      'typedef struct { char title[20]; int price; } Book;',
      'void raise_all(Book *b, int n, int inc) {',
      ...body,
      '}',
      'int main(void) {',
      `    Book s[] = {{"Python", ${a}}, {"C", ${b}}};`,
      `    raise_all(s, sizeof(s) / sizeof(s[0]), ${k});`,
      '    printf("%s %d %s %d\\n", s[0].title, s[0].price, s[1].title, s[1].price);',
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['    ( A )   /* write the body */']); },
    parts: (p, r) => [
      { pts: 3, q: 'raise_all adds inc to the price of every book. Write the body at ( A ).', a: ['for (int i = 0; i < n; i++) (b + i)->price += inc;  (also OK: b[i].price += inc)', MANY] },
      { pts: 2, q: 'With your function, what does the program print?', a: [`Prints ${r.out.trim()}`] },
    ],
  },
];

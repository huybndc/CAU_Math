/* ---------------------------------------------------------------
   HARDER C TEMPLATES (D73), part 1: multiple choice and predict the output.
   Each template mixes two or more ideas or holds a trap: integer division, *p++ and (*p)++, char arithmetic,
   sizeof of an array parameter, strcat and strcmp, structs with char arrays, function pointers, and files.
   `level` is the difficulty (1–3). Written for this app. clang gives every answer.
   --------------------------------------------------------------- */
import { lines, choice } from './c-templates-base.js';

const OPS = [
  'int add(int a, int b) { return a + b; }',
  'int sub(int a, int b) { return a - b; }',
  'int mul(int a, int b) { return a * b; }',
];
const ask1 = 'Write the exact output.';

export const HARD_TEMPLATES = [
  // ---- multiple choice: each wrong option is a common trap ----
  {
    id: 'mcq-postinc', kind: 'multi', type: 'mcq', topic: 'pointer', week: 5, level: 2,
    params: [[3, 8, 5], [10, 4, 7], [6, 1, 9], [2, 7, 4]],
    src: ([a, b, c]) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      `    int a[3] = {${a}, ${b}, ${c}};`,
      '    int *p = a;',
      '    int v = *p++;',
      '    (*p)++;',
      '    printf("%d %d %d\\n", v, *p, a[0]);',
      '    return 0;',
      '}'),
    parts: ([a, b, c], r, k) => [choice(2, 'What does the program print?', [r.out.trim(), `${a + 1} ${b} ${a + 1}`, `${b} ${b + 1} ${a}`, `${a} ${c} ${a}`], k)],
  },
  {
    id: 'mcq-sizeof-param', kind: 'multi', type: 'mcq', topic: 'function', week: 9, level: 2,
    params: [[[4, 1, 7, 3, 9]], [[2, 2, 2, 2, 2, 2]], [[5, 6, 7, 8, 9, 10, 11, 12]], [[1, 3, 5, 7, 9, 11, 13, 15, 17, 19]]],
    src: ([xs]) => lines(
      '#include <stdio.h>',
      'void show(int a[]) {',
      '    printf("%zu ", sizeof(a) / sizeof(a[0]));',
      '}',
      'int main(void) {',
      `    int x[${xs.length}] = {${xs.join(', ')}};`,
      '    printf("%zu ", sizeof(x) / sizeof(x[0]));',
      '    show(x);',
      '    printf("\\n");',
      '    return 0;',
      '}'),
    parts: ([xs], r, k) => [choice(2, 'On a 64-bit PC (int has 4 bytes, a pointer has 8 bytes), what does the program print?',
      [r.out.trim(), `${xs.length} ${xs.length}`, '2 2', `${xs.length} 1`], k)],
  },
  {
    id: 'mcq-int-div', kind: 'multi', type: 'mcq', topic: 'operators', week: 2, level: 1,
    params: [[7, 2], [11, 4], [13, 5], [17, 4]],
    src: ([a, b]) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      `    int a = ${a}, b = ${b};`,
      '    double r1 = a / b;',
      '    double r2 = (double)a / b;',
      '    printf("%.2f %.2f %d\\n", r1, r2, a % b);',
      '    return 0;',
      '}'),
    parts: ([a, b], r, k) => {
      const q = Math.trunc(a / b).toFixed(2), f = (a / b).toFixed(2);
      return [choice(2, 'What does the program print?', [r.out.trim(), `${f} ${f} ${a % b}`, `${q} ${q} ${a % b}`, `${q} ${f} ${Math.trunc(a / b)}`], k)];
    },
  },
  {
    id: 'mcq-char-arith', kind: 'multi', type: 'mcq', topic: 'operators', week: 2, level: 1,
    params: [[2], [4], [7], [11]],
    src: ([k]) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      `    char c = 'a' + ${k};`,
      "    int d = c - 'a';",
      '    printf("%c %d %c\\n", c - 32, d, c + 1);',
      '    return 0;',
      '}'),
    parts: ([k], r, i) => {
      const c = String.fromCharCode(97 + k), C = c.toUpperCase(), n = String.fromCharCode(98 + k);
      return [choice(2, 'What does the program print?', [r.out.trim(), `${c} ${k} ${n}`, `${C} ${97 + k} ${n}`, `${C} ${k} ${98 + k}`], i)];
    },
  },
  // ---- predict, one part ----
  {
    id: 'pred-ptr-walk', kind: 'multi', type: 'predict', topic: 'pointer', week: 9, level: 2,
    params: [['plane'], ['cards'], ['bread'], ['shoes']],
    src: ([w]) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      `    char s[] = "${w}";`,
      '    char *p = s + 1;',
      "    *p++ = 'Z';",
      '    *++p = *s;',
      '    printf("%s %c %d\\n", s, *p, (int)(p - s));',
      '    return 0;',
      '}'),
    parts: (p, r) => [{ q: ask1, a: [`Output: ${r.out.trim()}`] }],
  },
  {
    id: 'pred-digit-sum', kind: 'multi', type: 'predict', topic: 'string', week: 6, level: 2,
    params: [['a1b22c3'], ['k9x4y4'], ['3d7e1'], ['q8w8e']],
    src: ([s]) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      `    char s[] = "${s}";`,
      '    int sum = 0, n = 0;',
      "    for (int i = 0; s[i] != '\\0'; i++)",
      "        if (s[i] >= '0' && s[i] <= '9') { sum += s[i] - '0'; n++; }",
      '    printf("%d %d %d %.1f\\n", n, sum, sum / n, (double)sum / n);',
      '    return 0;',
      '}'),
    parts: (p, r) => [{ q: ask1, a: [`Output: ${r.out.trim()}`] }],
  },
  {
    id: 'pred-fp-loop', kind: 'multi', type: 'predict', topic: 'function', week: 10, level: 3,
    params: [[5, 0], [2, 1], [10, 2], [3, 1]],
    src: ([x, s]) => lines(
      '#include <stdio.h>',
      ...OPS,
      'int main(void) {',
      '    int (*op[3])(int, int) = {add, sub, mul};',
      `    int x = ${x};`,
      '    for (int i = 0; i < 4; i++)',
      `        x = op[(i + ${s}) % 3](x, i + 1);`,
      '    printf("%d\\n", x);',
      '    return 0;',
      '}'),
    parts: (p, r) => [{ q: `${ask1} Trace x after each loop step.`, a: [`Output: ${r.out.trim()}`] }],
  },
  {
    id: 'pred-swap-trap', kind: 'multi', type: 'predict', topic: 'function', week: 9, level: 3,
    params: [[7, 4], [9, 2], [5, 10], [11, 3]],
    src: ([x, y]) => lines(
      '#include <stdio.h>',
      'void swap1(int *a, int *b) { int *t = a; a = b; b = t; }',
      'void swap2(int *a, int *b) { int t = *a; *a = *b; *b = t; }',
      'int main(void) {',
      `    int x = ${x}, y = ${y};`,
      '    int *p = &x, *q = &y;',
      '    swap1(p, q);',
      '    swap2(p, &x);',
      '    swap2(q, p);',
      '    *p += *q / 2;',
      '    printf("%d %d\\n", x, y);',
      '    return 0;',
      '}'),
    parts: (p, r) => [{ q: ask1, a: [`Output: ${r.out.trim()}`] }],
  },
  // ---- predict, three chained parts: a later part uses the state after the earlier one ----
  {
    id: 'pred-chain-struct', kind: 'multi', type: 'predict', topic: 'struct', week: 9, level: 3,
    params: [[['pen', 5], ['cup', 2], ['box', 7]], [['ink', 9], ['map', 4], ['jar', 6]], [['hat', 3], ['key', 8], ['bag', 9]], [['cap', 6], ['mug', 3], ['tin', 4]]],
    src: xs => lines(
      '#include <stdio.h>',
      'struct Item { char name[8]; int qty; };',
      'void use(struct Item *it, int k) {',
      '    it->qty -= k;',
      '    it->name[0] -= 32;',
      '}',
      'int main(void) {',
      `    struct Item a[3] = {${xs.map(([n, q]) => `{"${n}", ${q}}`).join(', ')}};`,
      '    struct Item *p = a + 1;',
      '    use(p, 1);',
      '    printf("%s %d\\n", p->name, p->qty);',
      '    use(a, a[2].qty / 2);',
      '    printf("%s %d\\n", a[0].name, a[0].qty);',
      '    p++;',
      '    use(p, (p - 1)->qty);',
      '    printf("%s %d %d\\n", p->name, p->qty, (int)(p - a));',
      '    return 0;',
      '}'),
    parts: (p, r) => {
      const o = r.out.trim().split('\n');
      return [
        { q: 'What does line 11 print?', a: [o[0]] },
        { q: 'What does line 13 print?', a: [o[1]] },
        { q: 'What does line 16 print? (Use the values after (a) and (b).)', a: [o[2]] },
      ];
    },
  },
  {
    id: 'pred-chain-file', kind: 'multi', type: 'predict', topic: 'file', week: 10, level: 3,
    params: [[4, 3], [5, 2], [3, 7], [6, 1]],
    src: ([n, k]) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      '    int x, n = 0, sum = 0;',
      '    FILE *f = fopen("data.txt", "w");',
      '    if (f == NULL) return 1;',
      `    for (int i = 1; i <= ${n}; i++)`,
      `        fprintf(f, "%d ", i * ${k});`,
      '    fclose(f);',
      '    f = fopen("data.txt", "r");',
      '    while (fscanf(f, "%d", &x) == 1) { n++; sum += x; }',
      '    fclose(f);',
      '    printf("%d %d\\n", n, sum / n);',
      '    f = fopen("data.txt", "a");',
      '    fprintf(f, "%d", sum);',
      '    fclose(f);',
      '    f = fopen("data.txt", "r");',
      '    n = 0;',
      '    while (fscanf(f, "%d", &x) == 1) n++;',
      '    fclose(f);',
      '    printf("%d %d\\n", n, x);',
      '    f = fopen("data.txt", "w");',
      '    fclose(f);',
      '    f = fopen("data.txt", "r");',
      '    printf("%d\\n", fscanf(f, "%d", &x));',
      '    fclose(f);',
      '    return 0;',
      '}'),
    parts: (p, r) => {
      const o = r.out.trim().split('\n');
      return [
        { q: 'What does line 12 print?', a: [o[0]] },
        { q: 'What does line 20 print? (x keeps the last value that fscanf read.)', a: [o[1]] },
        { q: 'What does line 24 print? Explain.', a: [`${o[2]}. Mode "w" made the file empty, so fscanf returns EOF (-1).`] },
      ];
    },
  },
  {
    id: 'pred-chain-str', kind: 'multi', type: 'predict', topic: 'string', week: 6, level: 3,
    params: [['go', 'go'], ['sun', 'day'], ['hi', 'there'], ['ab', 'ab']],
    src: ([x, y]) => lines(
      '#include <stdio.h>',
      '#include <string.h>',
      'int main(void) {',
      `    char a[16] = "${x}";`,
      `    char b[16] = "${y}";`,
      '    strcat(a, b);',
      '    printf("%s %zu %zu\\n", a, strlen(a), sizeof(a));',
      "    a[strlen(b)] = '\\0';",
      '    printf("%s %d\\n", a, strcmp(a, b) == 0);',
      '    char *p = a + 1;',
      '    printf("%c %s %d\\n", *p + 1, p, (int)strlen(p));',
      '    return 0;',
      '}'),
    parts: (p, r) => {
      const o = r.out.trim().split('\n');
      return [
        { q: 'What does line 7 print?', a: [o[0]] },
        { q: 'What does line 9 print?', a: [o[1]] },
        { q: 'What does line 11 print?', a: [o[2]] },
      ];
    },
  },
];

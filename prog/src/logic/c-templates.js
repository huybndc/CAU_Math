/* ---------------------------------------------------------------
   MẪU CHƯƠNG TRÌNH C (thuần). Mỗi mẫu sinh nhiều biến thể theo tham số.
   - predict: người học đoán kết quả in ra. Đáp án = stdout thật của clang (scripts/gen-c-bank.mjs, lưu content/c-bank.json).
   - find: chương trình có đúng một dòng lỗi biên dịch. Đáp án = số dòng clang báo; bản sửa (fix) phải biên dịch được.
   Tự viết theo chủ đề slide tuần 7 (struct, union, typedef; Perfect C ch. 구조체와 공용체). week = tuần đề cương.
   --------------------------------------------------------------- */

const lines = (...xs) => xs.join('\n') + '\n';

export const TEMPLATES = [
  {
    id: 'struct-byval', kind: 'predict', topic: 'struct', week: 7,
    params: [[1, 2, 3, 4], [5, 1, 2, 7], [10, 20, 3, 3], [0, 9, 4, 6], [7, 7, 1, 2], [2, 8, 5, 5]],
    src: ([x, y, a, b]) => lines(
      '#include <stdio.h>',
      'struct Point { int x; int y; };',
      `void moveX(struct Point p) { p.x += ${a}; }`,
      `void moveY(struct Point *p) { p->y += ${b}; }`,
      'int main(void) {',
      `    struct Point pt = {${x}, ${y}};`,
      '    moveX(pt);',
      '    moveY(&pt);',
      '    printf("%d %d\\n", pt.x, pt.y);',
      '    return 0;',
      '}'),
  },
  {
    id: 'struct-copy-array', kind: 'predict', topic: 'struct', week: 7,
    params: [['Kim', 3, 'Z'], ['Lee', 5, 'P'], ['Park', 1, 'D'], ['Choi', 9, 'H'], ['Han', 0, 'B']],
    src: ([name, n, c]) => lines(
      '#include <stdio.h>',
      'struct Student { char name[10]; int score; };',
      'int main(void) {',
      `    struct Student a = {"${name}", ${n}};`,
      '    struct Student b = a;',
      `    b.name[0] = '${c}';`,
      '    b.score++;',
      '    printf("%s %d %s %d\\n", a.name, a.score, b.name, b.score);',
      '    return 0;',
      '}'),
  },
  {
    id: 'struct-array-ptr', kind: 'predict', topic: 'struct', week: 7,
    params: [[[3, 'a'], [8, 'b'], [5, 'c']], [[1, 'x'], [4, 'y'], [9, 'z']], [[6, 'm'], [2, 'n'], [7, 'k']], [[10, 'p'], [20, 'q'], [30, 'r']]],
    src: items => lines(
      '#include <stdio.h>',
      'struct Item { int n; char c; };',
      'int main(void) {',
      `    struct Item arr[3] = {${items.map(([n, c]) => `{${n}, '${c}'}`).join(', ')}};`,
      '    struct Item *p = arr;',
      '    p++;',
      '    printf("%d %c %d\\n", p->n, (p + 1)->c, (*p).n + arr[0].n);',
      '    return 0;',
      '}'),
  },
  {
    id: 'typedef-nested', kind: 'predict', topic: 'typedef', week: 7,
    params: [[9, 50, 15], [10, 45, 30], [23, 59, 2], [7, 5, 20], [12, 30, 45]],
    src: ([h, m, k]) => lines(
      '#include <stdio.h>',
      'typedef struct { int h, m; } Time;',
      'typedef struct { Time t; char tag; } Event;',
      'int main(void) {',
      `    Event e = {{${h}, ${m}}, 'T'};`,
      `    e.t.m += ${k};`,
      '    if (e.t.m >= 60) { e.t.h++; e.t.m -= 60; }',
      '    printf("%02d:%02d %c\\n", e.t.h, e.t.m, e.tag);',
      '    return 0;',
      '}'),
  },
  {
    id: 'union-overlay', kind: 'predict', topic: 'union', week: 7,
    params: [[65], [258], [513], [66 + 256 * 3], [1 + 256 * 2]],
    src: ([v]) => lines(
      '#include <stdio.h>',
      'union Data { int i; unsigned char b[4]; };',
      'int main(void) {',
      '    union Data d;',
      `    d.i = ${v};`,
      '    printf("%d %d %zu\\n", d.b[0], d.b[1], sizeof(union Data));',
      '    return 0;',
      '}'),
  },
  {
    id: 'struct-strcmp', kind: 'predict', topic: 'struct', week: 7,
    params: [['Kim', 'Kang'], ['Lee', 'Lee'], ['Ahn', 'Bae'], ['Yoon', 'Yoo']],
    src: ([a, b]) => lines(
      '#include <stdio.h>',
      '#include <string.h>',
      'struct Name { char s[10]; };',
      'int main(void) {',
      `    struct Name x = {"${a}"}, y = {"${b}"};`,
      '    int r = strcmp(x.s, y.s);',
      '    printf("%s %zu\\n", r == 0 ? "same" : (r < 0 ? "first" : "second"), strlen(x.s));',
      '    return 0;',
      '}'),
  },
  // ---- tìm lỗi: `bad` có đúng một dòng sai, `fix` là dòng đúng thay vào ----
  {
    id: 'err-assign-array', kind: 'find', topic: 'struct', week: 7,
    params: [['Kim'], ['Lee'], ['Park']],
    src: ([name], fix = false) => lines(
      '#include <stdio.h>',
      '#include <string.h>',
      'struct Student { char name[10]; int score; };',
      'int main(void) {',
      '    struct Student s;',
      fix ? `    strcpy(s.name, "${name}");` : `    s.name = "${name}";`,
      '    s.score = 90;',
      '    printf("%s %d\\n", s.name, s.score);',
      '    return 0;',
      '}'),
  },
  {
    id: 'err-arrow-on-value', kind: 'find', topic: 'struct', week: 7,
    params: [[3], [8], [12]],
    src: ([v], fix = false) => lines(
      '#include <stdio.h>',
      'struct Box { int w; };',
      'int main(void) {',
      `    struct Box b = {${v}};`,
      '    struct Box *p = &b;',
      fix ? '    p->w = p->w * 2;' : '    b->w = p->w * 2;',
      '    printf("%d\\n", b.w);',
      '    return 0;',
      '}'),
  },
  {
    id: 'err-compare-struct', kind: 'find', topic: 'struct', week: 7,
    params: [[1, 2], [4, 4], [7, 3]],
    src: ([x, y], fix = false) => lines(
      '#include <stdio.h>',
      'struct P { int x; int y; };',
      'int main(void) {',
      `    struct P a = {${x}, ${y}}, b = {${x}, ${y}};`,
      fix ? '    if (a.x == b.x && a.y == b.y)' : '    if (a == b)',
      '        printf("equal\\n");',
      '    return 0;',
      '}'),
  },
  {
    id: 'err-missing-struct', kind: 'find', topic: 'typedef', week: 7,
    params: [[5], [11], [2]],
    src: ([v], fix = false) => lines(
      '#include <stdio.h>',
      'struct Node { int val; };',
      'int main(void) {',
      fix ? `    struct Node n = {${v}};` : `    Node n = {${v}};`,
      '    printf("%d\\n", n.val);',
      '    return 0;',
      '}'),
  },
  // ---- nhiều ý (khuôn đề 2026-10-30): src = chương trình đúng clang chạy; show = bản người học thấy; parts(p, r) dựng ý từ kết quả clang r ----
  {
    id: 'mcq-bitops', kind: 'multi', type: 'mcq', topic: 'operators', week: 2,
    params: [[6, 3, 0xA4], [12, 10, 0xB8], [7, 5, 0xD2], [14, 6, 0x9C]],
    src: ([a, b, x]) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      `    int a = ${a}, b = ${b};`,
      `    unsigned char x = 0x${x.toString(16).toUpperCase()};`,
      '    printf("%d %d %d %d\\n", a > b, a && b, a & b, !a);',
      '    printf("%d %d %d %d\\n", x >> 4, x, x >> 2, x >> 1);',
      '    return 0;',
      '}'),
    show: ([a, b, x]) => `int a = ${a}, b = ${b};\nunsigned char x = 0x${x.toString(16).toUpperCase()};\n`,
    parts: (p, r, k) => {
      const [bool, sh] = r.out.trim().split('\n').map(l => l.split(' ').map(Number));
      const exprs = ['a > b', 'a && b', 'a & b', '!a'], hex = n => '0x' + n.toString(16).toUpperCase().padStart(2, '0');
      const opts = [0, 1, 2, 3].map(i => sh[(i + k) % 4]);
      const mark = ['①', '②', '③', '④'];
      return [
        { pts: 2, q: `Which expression does NOT give a Boolean value (0 or 1)? ${exprs.map((e, i) => `${mark[i]} ${e}`).join('  ')}`,
          a: [`${mark[bool.findIndex(v => v !== 0 && v !== 1)]} (value ${bool.find(v => v !== 0 && v !== 1)})`] },
        { pts: 2, q: `The value of x >> 4 is? ${opts.map((v, i) => `${mark[i]} ${hex(v)}`).join('  ')}`,
          a: [`${mark[opts.indexOf(sh[0])]} ${hex(sh[0])}`] },
      ];
    },
  },
  {
    id: 'fill-ptr-sum', kind: 'multi', type: 'fill', topic: 'pointer', week: 5,
    params: [[[1, 2, 3, 4, 5]], [[2, 4, 6, 8]], [[5, 1, 9]], [[3, 3, 1, 7, 2, 4]]],
    src: ([xs], fill = ['arr + ' + xs.length, '*p']) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      `    int arr[${xs.length}] = {${xs.join(', ')}};`,
      '    int sum = 0;',
      '    int *p;',
      `    for (p = arr; p < ${fill[0]}; p++)`,
      `        sum += ${fill[1]};`,
      '    printf("%d\\n", sum);',
      '    return 0;',
      '}'),
    show: function ([xs]) { return this.src([xs], ['( A )', '( B )']); },
    parts: ([xs], r) => [
      { pts: 3, q: `The loop must add every element of arr to sum (program prints ${r.out.trim()}). Fill in ( A ).`, a: [`arr + ${xs.length}  (or &arr[${xs.length}])`] },
      { pts: 3, q: 'Fill in ( B ).', a: ['*p'] },
    ],
  },
  {
    id: 'compile-check', kind: 'multi', type: 'compile', topic: 'pointer', week: 5,
    params: [['const int n = 5;', 'n = 6;', 'n'], ['int a[3] = {1, 2, 3};', 'a[0] = 9;', 'a[0]'], ['char s[] = "hi";', 's = "ok";', 's[0]'], ['int x = 4; int *p = &x;', '*p = 7;', 'x']],
    src: ([decl, stmt, val]) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      `    ${decl}`,
      `    ${stmt}`,
      `    printf("%d\\n", ${val});`,
      '    return 0;',
      '}'),
    parts: (p, r) => [{ pts: 3, q: 'Does this program compile? If yes, what does it print? If no, which line is wrong and why?',
      a: [r.ok ? `Yes. Prints ${r.out.trim()}` : `No. Line ${r.line}: ${r.why}`] }],
  },
  {
    id: 'write-count-char', kind: 'multi', type: 'write', topic: 'string', week: 6,
    params: [['banana', 'a'], ['mississippi', 's'], ['letter', 't'], ['programming', 'g']],
    src: ([w, c], body = ['    int n = 0;', '    for (; *s; s++)', '        if (*s == c) n++;', '    return n;']) => lines(
      '#include <stdio.h>',
      'int count_char(const char *s, char c) {',
      ...body,
      '}',
      'int main(void) {',
      `    char word[] = "${w}";`,
      `    int n = count_char(word, '${c}');`,
      '    printf("%d\\n", n);',
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['    ( A )   /* write the body */']); },
    parts: (p, r) => [
      { pts: 4, q: 'count_char returns how many times c appears in s. Write the body at ( A ).',
        a: ['int n = 0; for (; *s; s++) if (*s == c) n++; return n;', '(many correct ways; ask Chat to check your code)'] },
      { pts: 2, q: 'With your function, what does the program print?', a: [r.out.trim()] },
    ],
  },
  {
    id: 'fill-struct-dist', kind: 'multi', type: 'fill', topic: 'struct', week: 7,
    params: [[3, 4, 0, 0], [5, 1, 2, 5], [7, 2, 1, -6], [0, 9, 4, 6]],
    src: ([x1, y1, x2, y2], fill = ['struct Point { int x; int y; };', '    int dy = a.y - b.y;']) => lines(
      '#include <stdio.h>',
      fill[0],
      'int dist2(struct Point a, struct Point b) {',
      '    int dx = a.x - b.x;',
      fill[1],
      '    return dx * dx + dy * dy;',
      '}',
      'int main(void) {',
      `    struct Point p = {${x1}, ${y1}};`,
      `    struct Point o = {${x2}, ${y2}};`,
      '    printf("%d\\n", dist2(p, o));',
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['( A )   /* struct Point with int x and y */', '    ( B )   /* compute dy */']); },
    parts: (p, r) => [
      { pts: 3, q: 'Write the declaration at ( A ).', a: ['struct Point { int x; int y; };'] },
      { pts: 3, q: `Write the line at ( B ). (The program then prints ${r.out.trim()}.)`, a: ['int dy = a.y - b.y;'] },
    ],
  },
];

/** Mọi biến thể: { id: 'struct-byval-0', template, kind, topic, week, src, fixSrc? }. */
export const variants = () => TEMPLATES.flatMap(t => t.params.map((p, i) => ({
  id: `${t.id}-${i}`, template: t.id, kind: t.kind, topic: t.topic, week: t.week, src: t.src(p),
  ...(t.kind === 'find' ? { fixSrc: t.src(p, true) } : {}),
  ...(t.kind === 'multi' ? { type: t.type, show: t.show ? t.show(p) : t.src(p), parts: r => t.parts(p, r, i) } : {}),
})));

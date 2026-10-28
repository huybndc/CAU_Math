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
];

/** Mọi biến thể: { id: 'struct-byval-0', template, kind, topic, week, src, fixSrc? }. */
export const variants = () => TEMPLATES.flatMap(t => t.params.map((p, i) => ({
  id: `${t.id}-${i}`, template: t.id, kind: t.kind, topic: t.topic, week: t.week, src: t.src(p),
  ...(t.kind === 'find' ? { fixSrc: t.src(p, true) } : {}),
})));

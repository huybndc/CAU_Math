/* ---------------------------------------------------------------
   C PROGRAM TEMPLATES, weeks 2–7: the learner's weak areas.
   Weak areas: pointer arrays vs 2D char arrays, structs with char arrays, scanf with strings, string comparison.
   The questions are written for this app from the class topics. clang gives every answer.
   --------------------------------------------------------------- */

export const lines = (...xs) => xs.join('\n') + '\n';

const MARK = ['①', '②', '③', '④'];
/** One multiple-choice part. Option order rotates with k. `options[0]` is the correct option. */
export function choice(pts, q, options, k) {
  const shown = options.map((_, i) => options[(i + k) % options.length]);
  return { pts, q: `${q} ${shown.map((o, i) => `${MARK[i]} ${o}`).join('  ')}`, a: [`${MARK[shown.indexOf(options[0])]} ${options[0]}`] };
}

const MANY = 'Many correct ways. Compare with this model answer, or send your code to Claude to check.';

export const BASE_TEMPLATES = [
  {
    id: 'str-eq', kind: 'predict', topic: 'string', week: 6,
    params: [['hi', 'ho'], ['kim', 'kim2'], ['cat', 'car'], ['one', 'two']],
    src: ([x, y]) => lines(
      '#include <stdio.h>',
      '#include <string.h>',
      'int main(void) {',
      `    char a[] = "${x}";`,
      `    char b[] = "${x}";`,
      `    char c[] = "${y}";`,
      '    printf("%d %d %d\\n", a == b, strcmp(a, b) == 0, strcmp(a, c) == 0);',
      '    return 0;',
      '}'),
    follow: () => ({ q: 'Why is a == b false when both arrays hold the same text?', a: ['a == b compares two addresses. Use strcmp to compare the text.'] }),
  },
  {
    id: 'mcq-scanf-string', kind: 'multi', type: 'mcq', theory: true, topic: 'string', week: 6,
    params: [['My name is John'], ['Hello big world'], ['Kim Min Su'], ['C is really fun']],
    input: ([s]) => s + '\n',
    src: () => lines(
      '#include <stdio.h>',
      'int main(void) {',
      '    char str[20];',
      '    scanf("%s", str);',
      '    puts(str);',
      '    return 0;',
      '}'),
    parts: ([s], r, k) => {
      const words = s.split(' ');
      return [
        choice(2, `The user types: ${s}. What does the program print?`, [r.out.trim(), s, words[1], words.at(-1)], k),
        choice(3, 'Why is there no & before str in scanf?', ['str is already the address of the first element', 'scanf never needs &', 'char arrays have no address', '& is optional for every type'], k),
      ];
    },
  },
  {
    id: 'mcq-ptr-vs-2d', kind: 'multi', type: 'mcq', theory: true, topic: 'string', week: 6,
    params: [[6], [10], [7], [12]],
    src: ([n]) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      '    char *a[] = {"red", "blue", "green"};',
      `    char b[3][${n}] = {"red", "blue", "green"};`,
      '    a[0] = "new";',
      '    printf("%zu %zu\\n", sizeof(a), sizeof(b));',
      '    return 0;',
      '}'),
    show: ([n]) => `char *a[] = {"red", "blue", "green"};\nchar b[3][${n}] = {"red", "blue", "green"};\n`,
    probes: ([n]) => [{ fails: true, src: lines('int main(void) {', `    char b[3][${n}] = {"red", "blue", "green"};`, '    b[0] = "new";', '    return 0;', '}') }],
    parts: ([n], r, k) => {
      const [sa, sb] = r.out.trim().split(' ');
      return [
        choice(2, 'What is sizeof(b)?', [sb, sa === sb ? '8' : sa, '3', String(n)], k),
        choice(3, 'Which statement compiles?', ['a[0] = "new";', 'b[0] = "new";', 'a = "new";', 'b = "new";'], k),
      ];
    },
  },
  {
    id: 'fill-scanf-string', kind: 'multi', type: 'fill', topic: 'string', week: 6,
    params: [[1234, 'Kim'], [77, 'Lee'], [2026, 'Park'], [305, 'Choi']],
    input: ([n, s]) => `${n} ${s}\n`,
    src: (_, fill = ['&id', 'name']) => lines(
      '#include <stdio.h>',
      'int main(void) {',
      '    int id;',
      '    char name[20];',
      `    scanf("%d %s", ${fill[0]}, ${fill[1]});`,
      '    printf("%s %d\\n", name, id);',
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['( A )', '( B )']); },
    parts: ([n, s], r) => [
      { pts: 3, q: `The user types: ${n} ${s}. The program must print ${r.out.trim()}. Fill in ( A ).`, a: ['&id'] },
      { pts: 2, q: 'Fill in ( B ).', a: ['name  (also OK: &name[0])'] },
    ],
  },
  {
    id: 'fill-ptr-array', kind: 'multi', type: 'fill', topic: 'string', week: 6,
    params: [[['Kim', 'Lee', 'Park']], [['C', 'Java']], [['red', 'blue', 'green', 'gray']], [['one', 'three']]],
    src: ([xs], fill = ['sizeof(names) / sizeof(names[0])', 'names[i]']) => lines(
      '#include <stdio.h>',
      '#include <string.h>',
      'int main(void) {',
      `    char *names[] = {${xs.map(x => `"${x}"`).join(', ')}};`,
      `    int n = ${fill[0]};`,
      '    int total = 0;',
      '    for (int i = 0; i < n; i++)',
      `        total += strlen(${fill[1]});`,
      '    printf("%d %d\\n", n, total);',
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['( A )', '( B )']); },
    parts: ([xs], r) => [
      { pts: 3, q: `The program must print ${r.out.trim()}: the number of names, then the total length. Do not count by hand. Fill in ( A ).`, a: ['sizeof(names) / sizeof(names[0])'] },
      { pts: 2, q: 'Fill in ( B ).', a: ['names[i]  (also OK: *(names + i))'] },
    ],
  },
  {
    id: 'fill-struct-string', kind: 'multi', type: 'fill', topic: 'struct', week: 7,
    params: [['Kim', 90], ['Lee', 75], ['Park', 60], ['Han', 100]],
    src: ([name, score], fill = ['strcpy(b.name, a.name);', 'strcmp(a.name, b.name) == 0']) => lines(
      '#include <stdio.h>',
      '#include <string.h>',
      'struct Student { char name[10]; int score; };',
      'int main(void) {',
      `    struct Student a = {"${name}", ${score}};`,
      '    struct Student b = {"", 0};',
      `    ${fill[0]}`,
      `    if (${fill[1]})`,
      '        printf("same %s\\n", b.name);',
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['( A )   /* copy a.name into b.name */', '( B )   /* true when the two names are equal */']); },
    parts: (p, r) => [
      { pts: 3, q: `Fill in ( A ). (The program then prints ${r.out.trim()}.)`, a: ['strcpy(b.name, a.name);'] },
      { pts: 2, q: 'Fill in ( B ).', a: ['strcmp(a.name, b.name) == 0'] },
    ],
  },
  {
    id: 'write-my-len', kind: 'multi', type: 'write', topic: 'string', week: 6,
    params: [['banana'], ['pointer'], ['C'], ['structure']],
    src: ([w], body = ['    int n = 0;', "    while (s[n] != '\\0') n++;", '    return n;']) => lines(
      '#include <stdio.h>',
      'int my_len(const char *s) {',
      ...body,
      '}',
      'int main(void) {',
      `    printf("%d\\n", my_len("${w}"));`,
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['    ( A )   /* write the body; do not use strlen */']); },
    parts: (p, r) => [
      { pts: 3, q: 'my_len returns the length of s. Write the body at ( A ).', a: ["int n = 0; while (s[n] != '\\0') n++; return n;", MANY] },
      { pts: 2, q: 'With your function, what does the program print?', a: [`Prints ${r.out.trim()}`] },
    ],
  },
  {
    id: 'write-same', kind: 'multi', type: 'write', topic: 'string', week: 6,
    params: [['kim', 'kim', 'kin'], ['cat', 'cat', 'car'], ['abc', 'abc', 'abcd'], ['go', 'go', 'do']],
    src: ([x, y, z], body = ['    while (*a && *a == *b) { a++; b++; }', '    return *a == *b;']) => lines(
      '#include <stdio.h>',
      'int same(const char *a, const char *b) {',
      ...body,
      '}',
      'int main(void) {',
      `    printf("%d %d\\n", same("${x}", "${y}"), same("${x}", "${z}"));`,
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['    ( A )   /* write the body; do not use strcmp */']); },
    parts: (p, r) => [
      { pts: 3, q: 'same returns 1 when the two strings are equal, and 0 when they are not. Write the body at ( A ).', a: ['while (*a && *a == *b) { a++; b++; } return *a == *b;', MANY] },
      { pts: 2, q: 'With your function, what does the program print?', a: [`Prints ${r.out.trim()}`] },
    ],
  },
  {
    id: 'write-best', kind: 'multi', type: 'write', topic: 'struct', week: 7,
    params: [[['Kim', 80], ['Lee', 95], ['Han', 70]], [['Ahn', 50], ['Bae', 40], ['Cho', 90]], [['Min', 99], ['Yoo', 10], ['Seo', 20]], [['Oh', 60], ['Im', 61], ['Na', 59]]],
    src: (xs, body = ['    int b = 0;', '    for (int i = 1; i < n; i++)', '        if (s[i].score > s[b].score) b = i;', '    return s[b].name;']) => lines(
      '#include <stdio.h>',
      'struct Student { char name[10]; int score; };',
      'const char *best(const struct Student *s, int n) {',
      ...body,
      '}',
      'int main(void) {',
      `    struct Student a[3] = {${xs.map(([m, v]) => `{"${m}", ${v}}`).join(', ')}};`,
      '    printf("%s\\n", best(a, 3));',
      '    return 0;',
      '}'),
    show: function (p) { return this.src(p, ['    ( A )   /* write the body */']); },
    parts: (p, r) => [
      { pts: 3, q: 'best returns the name of the student with the highest score. Write the body at ( A ).', a: ['int b = 0; for (int i = 1; i < n; i++) if (s[i].score > s[b].score) b = i; return s[b].name;', MANY] },
      { pts: 2, q: 'With your function, what does the program print?', a: [`Prints ${r.out.trim()}`] },
    ],
  },
];

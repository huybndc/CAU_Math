/* ---------------------------------------------------------------
   THEORY MULTIPLE CHOICE (D74). The learner said the real exam asks theory in multiple choice,
   for example the difference between pointer operators, and not only "what does it print".
   Each wrong option is a common misconception. clang backs every option:
   a probe must fail to compile, compile, or crash under AddressSanitizer, or the program output proves the statement.
   Written for this app.
   --------------------------------------------------------------- */
import { lines, choice } from './c-templates-base.js';

const main = (body, pre = [], inc = []) => lines('#include <stdio.h>', ...inc, ...pre, 'int main(void) {', ...body.map(l => `    ${l}`), '    return 0;', '}');

/** Effect of each operator on int a[3] = {10, 20, 30}; int *p = a; int x = OP;  → [x, index of p, a[0]]. */
export const PTR_OPS = { '*p++': [10, 1, 10], '(*p)++': [10, 0, 11], '++*p': [11, 0, 11], '*++p': [20, 1, 10] };
const opText = ([x, i, a0]) => `x = ${x}, p points to a[${i}], a[0] = ${a0}`;

/** Which call changes a value in main. Each set: question, functions, calls, and the expression that main prints. */
const CALLS = [
  { q: 'n is 1 in main. Which call makes n equal to 5?', pre: ['void f1(int x) { x = 5; }', 'void f2(int *x) { *x = 5; }', 'void f3(int *x) { int k = 5; x = &k; }', 'void f4(int x) { int *q = &x; *q = 5; }'],
    init: ['int n = 1;'], reset: 'n = 1;', show: 'n', calls: ['f1(n)', 'f2(&n)', 'f3(&n)', 'f4(n)'] },
  { q: 'p points to n in main. Which call makes p point to the global k?', pre: ['int k = 7;', 'void g1(int *q) { q = &k; }', 'void g2(int **q) { *q = &k; }', 'void g3(int **q) { q = NULL; }', 'void g4(int *q) { *q = k; }'],
    init: ['int n = 0;', 'int *p = &n;'], reset: 'p = &n;', show: 'p == &k', calls: ['g1(p)', 'g2(&p)', 'g3(&p)', 'g4(p)'] },
];

/** Read a declaration. opts[0] is correct. body(decl) compiles with opts[0]; opts[1] and opts[2] must not compile with it. */
const DECLS = [
  { meaning: 'a is an array of 3 pointers to int.', opts: ['int *a[3]', 'int (*a)[3]', 'int a[3]', 'int **a'], body: d => ['int x = 4;', `${d};`, 'a[0] = &x;', 'printf("%d\\n", *a[0]);'] },
  { meaning: 'a is one pointer to a whole array of 3 ints.', opts: ['int (*a)[3]', 'int *a[3]', 'int a[3]', 'int *a'], body: d => ['int x[3] = {1, 2, 3};', `${d} = &x;`, 'printf("%d\\n", (*a)[2]);'] },
  { meaning: 'f is a pointer to a function that takes an int and returns an int.', opts: ['int (*f)(int)', 'int *f(int)', 'int f(int *)', 'int (*f)(int *)'], pre: ['int twice(int v) { return v * 2; }'], body: d => [`${d} = twice;`, 'printf("%d\\n", f(4));'] },
  { meaning: 'p can point to another int, but p cannot change the int it points to.', opts: ['const int *p', 'int *const p', 'const int *const p', 'int *p'], body: d => ['int x = 1, y = 2;', `${d} = &x;`, 'p = &y;', 'printf("%d\\n", *p);'], locked: '*p = 3;' },
];

/** Pick the FALSE statement. The program output proves the three true statements; the probe disproves the false one. */
const STATEMENTS = [
  { week: 10, wrong: 'A void pointer can be dereferenced with * without a cast.',
    right: ['fopen with mode "w" deletes the old contents of the file.', 'fopen with mode "a" writes new data after the old data.', 'fopen returns NULL when it cannot open a file for reading.'],
    probe: main(['int n = 1;', 'void *v = &n;', 'printf("%d\\n", *v);']),
    src: main(['char s[8];', 'FILE *f = fopen("t.txt", "w"); fputs("abc", f); fclose(f);', 'f = fopen("t.txt", "a"); fputs("d", f); fclose(f);', 'f = fopen("t.txt", "r"); fscanf(f, "%7s", s); fclose(f);', 'printf("%s ", s);',
      'f = fopen("t.txt", "w"); fputs("x", f); fclose(f);', 'f = fopen("t.txt", "r"); fscanf(f, "%7s", s); fclose(f);', 'printf("%s %d\\n", s, fopen("none.txt", "r") == NULL);']) },
  { week: 9, wrong: 'Inside a function, sizeof(a) for the parameter int a[] gives the size of the whole array.',
    right: ['a[i] and *(a + i) give the same element.', 'arr and &arr hold the same address, but arr + 1 and &arr + 1 are different.', 'An array name cannot be on the left side of =.'],
    probe: main(['int arr[3], b[3] = {0};', 'arr = b;']),
    src: main(['int arr[5] = {1, 2, 3, 4, 5};', 'printf("%zu ", sizeof(arr));', 'f(arr);', 'printf("%d %d ", arr[2] == *(arr + 2), (void *)arr == (void *)&arr);', 'printf("%d\\n", (int)((char *)(&arr + 1) - (char *)(arr + 1)));'],
      ['void f(int a[]) { printf("%zu ", sizeof(a)); }']) },
  { week: 7, wrong: 'The struct assignment b = a copies only the address of a.',
    right: ['The struct assignment b = a copies a char array member, so a later change to b.name does not change a.name.', 'When a struct has a pointer member, the copy points to the same data.', 'p->v is the same as (*p).v.'],
    probe: main(['struct S a = {"kim", 0};', 'struct S *p = &a;', 'printf("%p\\n", (void *)*p.v);'], ['struct S { char name[8]; int *v; };']),
    src: main(['int n = 1;', 'struct S a = {"kim", &n};', 'struct S b = a;', "b.name[0] = 'K';", '*b.v = 9;', 'struct S *p = &a;', 'printf("%s %s %d %d\\n", a.name, b.name, *a.v, p->v == (*p).v);'], ['struct S { char name[8]; int *v; };']) },
  { week: 6, wrong: 'scanf("%s", s) reads a whole line, spaces included.', input: 'hello world\n',
    right: ['strcmp returns 0 when two strings are equal.', 'strlen does not count the final \\0, but sizeof of a char array does.', 'For two char arrays a and b, a == b compares two addresses.'],
    probe: null,
    src: main(['char s[20], t[] = "abc", a[] = "x", b[] = "x";', 'scanf("%19s", s);', 'printf("%s %d %zu %zu %d\\n", s, strcmp("ab", "ab"), strlen(t), sizeof(t), a == b);'], [], ['#include <string.h>']) },
];

/** Classify snippets. kind: 'C' = compile error, 'U' = compiles but undefined behavior (ASan crash), 'OK' = correct. */
const SNIPPETS = [
  [['char s[] = "hi"; s = "ok";', 'C'], ['char s[] = "hi"; s[0] = \'H\';', 'OK'], ['char *s = "hi"; s[0] = \'H\';', 'U'], ['int a[3] = {1, 2, 3}; a[3] = 4;', 'U']],
  [['const int n = 3; n = 4;', 'C'], ['int x = 3; int *p = &x; *p = 4;', 'OK'], ['int *p = NULL; *p = 5;', 'U'], ['int a[2]; int *p = a + 2; *p = 1;', 'U']],
  [['int n = 1; void *v = &n; printf("%d", *v);', 'C'], ['int n = 1; void *v = &n; printf("%d", *(int *)v);', 'OK'], ['char s[3]; strcpy(s, "hello");', 'U'], ['char *s = "abc"; *s = \'x\';', 'U']],
];
const snippetSrc = code => main([code], [], ['#include <string.h>']);
const byKind = (set, k) => set.filter(s => s[1] === k).map(s => s[0]);

export const THEORY_TEMPLATES = [
  {
    id: 'mcq-ptr-ops', kind: 'multi', type: 'mcq', theory: true, topic: 'pointer', week: 5, level: 1,
    params: Object.keys(PTR_OPS).map(op => [op]),
    src: ([op]) => main(['int a[3] = {10, 20, 30};', 'int *p = a;', `int x = ${op};`, 'printf("%d %d %d\\n", x, (int)(p - a), a[0]);']),
    show: ([op]) => `int a[3] = {10, 20, 30};\nint *p = a;\nint x = ${op};\n`,
    parts: ([op], r, k) => [choice(2, `After int x = ${op};, which statement is true?`,
      [opText(r.out.trim().split(' ').map(Number)), ...Object.keys(PTR_OPS).filter(o => o !== op).map(o => opText(PTR_OPS[o]))], k)],
  },
  {
    id: 'mcq-by-pointer', kind: 'multi', type: 'mcq', theory: true, topic: 'function', week: 9, level: 1,
    params: [[0], [1]],
    src: ([i]) => { const c = CALLS[i]; return main([...c.init, ...c.calls.flatMap((call, j) => [`${call}; printf("%d${j === 3 ? '\\n' : ' '}", ${c.show});`, c.reset])], c.pre); },
    show: ([i]) => CALLS[i].pre.join('\n') + '\n',
    parts: ([i], r, k) => {
      const c = CALLS[i], hit = r.out.trim().split(' ').map(Number).map((v, j) => (i === 0 ? v === 5 : v === 1) ? j : -1).filter(j => j >= 0);
      return [choice(2, c.q, [c.calls[hit[0]], ...c.calls.filter((_, j) => j !== hit[0])], k)];
    },
  },
  {
    id: 'mcq-decl-read', kind: 'multi', type: 'mcq', theory: true, topic: 'pointer', week: 10, level: 1,
    params: DECLS.map((_, i) => [i]),
    src: ([i]) => main(DECLS[i].body(DECLS[i].opts[0]), DECLS[i].pre),
    show: () => '',
    probes: ([i]) => {
      const d = DECLS[i];
      return [...d.opts.slice(1, 3).map(o => ({ fails: true, src: main(d.body(o), d.pre) })),
        ...(d.locked ? [{ fails: true, src: main([...d.body(d.opts[0]), d.locked], d.pre) }] : [])];
    },
    parts: ([i], r, k) => [choice(2, `Which declaration means: ${DECLS[i].meaning}`, DECLS[i].opts.map(o => `${o};`), k)],
  },
  {
    id: 'mcq-false-stmt', kind: 'multi', type: 'mcq', theory: true, topic: 'pointer', week: 9, level: 1,
    params: STATEMENTS.map((_, i) => [i]),
    input: ([i]) => STATEMENTS[i].input,
    src: ([i]) => STATEMENTS[i].src,
    show: () => '',
    probes: ([i]) => (STATEMENTS[i].probe ? [{ fails: true, src: STATEMENTS[i].probe }] : []),
    parts: ([i], r, k) => [choice(2, 'Which statement is FALSE?', [STATEMENTS[i].wrong, ...STATEMENTS[i].right], k)],
  },
  {
    id: 'mcq-classify', kind: 'multi', type: 'mcq', theory: true, topic: 'pointer', week: 9, level: 2,
    params: SNIPPETS.map((_, i) => [i]),
    src: ([i]) => snippetSrc(byKind(SNIPPETS[i], 'OK')[0]),
    show: () => '',
    probes: ([i]) => SNIPPETS[i].map(([code, kind]) => (kind === 'U' ? { crashes: true, src: snippetSrc(code) } : { fails: kind === 'C', src: snippetSrc(code) })),
    parts: ([i], r, k) => {
      const [c] = byKind(SNIPPETS[i], 'C'), [ok] = byKind(SNIPPETS[i], 'OK'), u = byKind(SNIPPETS[i], 'U');
      return [
        choice(2, 'Which code does NOT compile?', [c, ok, ...u], k),
        choice(3, 'Which code compiles AND runs correctly (no undefined behavior)?', [ok, c, ...u], k + 1),
      ];
    },
  },
];

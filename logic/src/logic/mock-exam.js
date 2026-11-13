/* ---------------------------------------------------------------
   PRACTICE FINAL EXAM (Logic Circuit), pure. Scope = the class slides: Ch3–4 (before the midterm) and Ch5 §5.3–5.5 (latches,
   flip-flops, analysis of clocked circuits). Form follows the real midterm (D75): few questions with many parts, easy to hard,
   later parts use earlier ones, all-or-nothing per part. 4 questions, 200 points: K-map design 40, circuit design 65,
   flip-flop 35, sequential analysis 60. The midterm template (3–4 combinational questions) is in git history before D75.
   English text, LaTeX $…$; part.rubric = [points, step]; part.figs = sample figures; facts = raw data for tests.
   --------------------------------------------------------------- */
import { minimizeSOP, varNames, literalCount } from './quine-mccluskey.js';
import { kmap, table } from './mock-tex.js';
import { bcdAdder, comparator2 } from './mock-figs.js';
import { makeFlipFlop, makeSeqAnalysis } from './mock-seq.js';

const r = String.raw;
const ON = { a: [0, 2, 3, 5, 6, 7, 8, 9], f: [0, 4, 5, 6, 8, 9], e: [0, 2, 6, 8] };      // đoạn sáng theo chữ số BCD (6 sáng a, 9 sáng d)
const vals = digits => Array.from({ length: 16 }, (_, m) => (m >= 10 ? 2 : digits.includes(m) ? 1 : 0));
const cell = v => (v === 2 ? '\\times' : String(v));
const bits = (m, n) => m.toString(2).padStart(n, '0').split('');
const rowsOf = (n, cols) => Array.from({ length: 1 << n }, (_, m) => [...bits(m, n), ...cols.map(c => cell(c[m]))]);
const names4 = varNames(4);
// thang chấm theo bước, in trên tờ đáp án; tổng = điểm của ý (test canh)
const KMAP_RUBRIC = [[6, r`each map filled from the table`], [9, r`prime implicants that use the don't-cares`], [10, r`minimal sum of products for each output`]];

function solved(values, n) {
  const sop = minimizeSOP(values, n);
  return { expr: sop.terms.map(t => t.text).join(' + ') || '0', terms: sop.terms.map(t => [...t.text.matchAll(/[a-z]'?/g)].map(m => m[0])), lits: sop.terms.reduce((s, t) => s + literalCount(t.imp, n), 0) };
}

export function makeSevenSeg() {
  const segs = Object.entries(ON).map(([k, d]) => [k, vals(d)]), S = Object.fromEntries(segs.map(([k, v]) => [k, solved(v, 4)]));
  return {
    stem: r`A BCD-to-seven-segment decoder has inputs $w, x, y, z$ (the BCD digit $0$ to $9$, $w$ most significant). Codes $10$ to $15$ never occur. Design the segments $a$ (top), $f$ (upper left) and $e$ (lower left). Digits are drawn the standard way: $6$ lights $a$ and $9$ lights $d$.`,
    parts: [
      { pts: 15, q: r`Write the truth table of $a$, $f$, $e$ for the inputs $wxyz$ (use $\times$ for the codes that never occur).`, rubric: [[5, r`column $a$ correct`], [5, r`column $f$ correct`], [5, r`column $e$ correct, codes $10$ to $15$ as $\times$`]],
        a: [r`A segment is $1$ when the digit uses it: $a$ for $0,2,3,5,6,7,8,9$; $f$ for $0,4,5,6,8,9$; $e$ for $0,2,6,8$.`,
          r`$${table(['w', 'x', 'y', 'z', 'a', 'f', 'e'], rowsOf(4, segs.map(([, v]) => v)))}$`], facts: { a: vals(ON.a), f: vals(ON.f), e: vals(ON.e) } },
      { pts: 25, q: r`Using your truth table, draw a Karnaugh map for each segment and find its minimal sum of products (use the don't-cares).`, rubric: KMAP_RUBRIC,
        a: segs.flatMap(([k, v]) => [r`Segment $${k}$: $${kmap(v, names4)}$`, r`$${k} = ${S[k].expr}$`]), facts: { sop: { a: S.a.expr, f: S.f.expr, e: S.e.expr }, names: names4 } },
    ],
    refs: [['4.4', 'Design procedure (cf. Problem 4.9)'], ['3.5', "Don't-care conditions"], ['3.3', 'Four-variable map']],
  };
}

// mã đích của câu chuyển mã BCD (§4.4); 2421: 0–4 nhị phân, 5–9 = d + 6
const CODES = [
  { k: 'E', code: d => d + 3, name: r`the excess-$3$ code $E_3E_2E_1E_0$ (the digit plus $3$)`, rule: r`Excess-$3$ of a digit $d$ is the $4$-bit binary number $d + 3$.` },
  { k: 'G', code: d => d ^ (d >> 1), name: r`the Gray code $G_3G_2G_1G_0$ of the digit`, rule: r`Gray code: $G_3$ is the first binary bit; each other $G_i$ is the XOR of binary bits $i+1$ and $i$, so neighbouring digits differ in one bit.` },
  { k: 'D', code: d => (d < 5 ? d : d + 6), name: r`the $2421$ code $D_3D_2D_1D_0$ (weights $2, 4, 2, 1$)`, rule: r`$2421$ code: digits $0$ to $4$ as binary, digits $5$ to $9$ as binary $d + 6$; the weights $2, 4, 2, 1$ add up to $d$.` },
];

export function makeCodeConv(rnd) {
  const C = CODES[Math.floor(rnd() * CODES.length)];
  const outs = [3, 2, 1, 0].map(k => [`${C.k}_${k}`, Array.from({ length: 16 }, (_, m) => (m >= 10 ? 2 : (C.code(m) >> k) & 1))]);
  const S = Object.fromEntries(outs.map(([k, v]) => [k, solved(v, 4)])), ks = outs.map(([k]) => k);
  return {
    stem: r`A combinational circuit converts a BCD digit $wxyz$ (digits $0$ to $9$; codes $10$ to $15$ never occur) to ${C.name}.`,
    parts: [
      { pts: 15, q: r`Write the truth table of $${ks.join(', ')}$.`, rubric: [[10, r`rows $0$ to $9$ give the right code (all four columns)`], [5, r`codes $10$ to $15$ as don't-cares`]],
        a: [C.rule, r`$${table(['w', 'x', 'y', 'z', ...ks], rowsOf(4, outs.map(([, v]) => v)))}$`], facts: { kind: `code-${C.k}`, outs: Object.fromEntries(outs) } },
      { pts: 25, q: r`Using your truth table, draw a Karnaugh map for each output and find its minimal sum of products (use the don't-cares).`, rubric: KMAP_RUBRIC,
        a: outs.flatMap(([k, v]) => [r`$${k}$: $${kmap(v, names4)}$`, r`$${k} = ${S[k].expr}$`]), facts: { sop: Object.fromEntries(ks.map(k => [k, S[k].expr])), names: names4 } },
    ],
    refs: [['4.4', 'Design procedure (code conversion)'], ['3.5', "Don't-care conditions"], ['3.3', 'Four-variable map']],
  };
}

export function makeBcdAdder() {
  const corr = Array.from({ length: 32 }, (_, m) => (m > 19 ? 2 : m >= 10 ? 1 : 0));
  const rows = Array.from({ length: 20 }, (_, n) => [...bits(n, 5), n >= 10 ? '1' : '0', ...bits(n >= 10 ? n - 10 : n, 4)]);
  return {
    stem: r`A BCD adder adds two BCD digits $A, B$ and a carry in and gives a BCD digit $S_8S_4S_2S_1$ with a carry out $C$. It is built from two $4$-bit binary adders and a few gates.`,
    parts: [
      { pts: 25, q: r`Two BCD digits and the carry in add to at most $9 + 9 + 1 = 19$. Let the first $4$-bit adder give the binary sum $K Z_8Z_4Z_2Z_1$ (write these five bits as $v, w, x, y, z$). Make a table of the sums $0$ to $19$ with the BCD result $C S_8S_4S_2S_1$ they must become, then find when $0110$ must be added and write $C$ as a Boolean expression.`,
        a: [r`$${table(['K', 'Z_8', 'Z_4', 'Z_2', 'Z_1', 'C', 'S_8', 'S_4', 'S_2', 'S_1'], rows)}$`,
          r`The sum must be corrected (add $6 = 0110$) exactly when it is above $9$, so $C = 1$ exactly for the binary sums $10$ to $19$.`,
          r`Sums $16$ to $19$ have $K = 1$. Sums $10$ to $15$ have $K = 0$ and $Z_8 = 1$ with $Z_4 = 1$ or $Z_2 = 1$. Hence $C = v + wx + wy$ (that is $K + Z_8Z_4 + Z_8Z_2$).`],
        rubric: [[10, r`table of sums $0$ to $19$ with the BCD result`], [5, r`add $0110$ exactly when the sum is above $9$`], [10, r`$C = K + Z_8Z_4 + Z_8Z_2$`]],
        facts: { kind: 'bcd', corr, expr: 'v + wx + wy' } },
      { pts: 40, q: r`Draw the complete BCD adder as one circuit, using two $4$-bit binary adders (as blocks) and the gates for $C$.`,
        a: [r`The first adder adds $A + B + C_{in}$ and gives $K$ and $Z$. Gates give $C = K + Z_8Z_4 + Z_8Z_2$. The second adder adds $Z$ and $0CC0$ (so $+6$ when $C = 1$); its carry out is ignored and $C$ is the BCD carry out.`],
        rubric: [[8, r`first adder: inputs $A$, $B$, carry in; outputs $K$, $Z$`], [10, r`gates for $C$`], [12, r`second adder adds $0CC0$ to $Z$`], [10, r`outputs $S_8S_4S_2S_1$ and carry out $C$ labelled`]],
        figs: [bcdAdder()], facts: {} },
    ],
    refs: [['4.5', 'Binary adder–subtractor (4-bit parallel adder)'], ['4.6', 'Decimal adder (BCD adder)']],
  };
}

export function makeComparator() {
  const rows = Array.from({ length: 16 }, (_, m) => {
    const a = m >> 2, b = m & 3;
    return [...bits(m, 4), String(+(a === b)), String(+(a > b)), String(+(a < b))];
  });
  return {
    stem: r`A $2$-bit magnitude comparator compares $A = A_1A_0$ with $B = B_1B_0$ and has outputs $E$ ($A = B$), $G$ ($A > B$) and $L$ ($A < B$).`,
    parts: [
      { pts: 25, q: r`Write the truth table of $E, G, L$. Then, with $x_i = A_iB_i + A_i'B_i'$ (equal bits), write $E$, $G$ and $L$ as Boolean expressions.`,
        a: [r`$${table(['A_1', 'A_0', 'B_1', 'B_0', 'E', 'G', 'L'], rows)}$`,
          r`$x_i = 1$ exactly when $A_i = B_i$. $A = B$ when both bit pairs are equal; $A > B$ when the high bits decide ($A_1B_1'$) or they are equal and the low bits decide.`,
          r`$E = x_1x_0$, $G = A_1B_1' + x_1A_0B_0'$, $L = A_1'B_1 + x_1A_0'B_0$`],
        rubric: [[10, r`truth table of $E, G, L$`], [5, r`$x_i$ as equality of bits`], [10, r`expressions for $E$, $G$, $L$`]],
        facts: { kind: 'cmp', rows, expr: { E: 'x1 x0', G: "A1 B1' + x1 A0 B0'", L: "A1' B1 + x1 A0' B0" } } },
      { pts: 40, q: r`Draw the complete comparator as one circuit with gates (use an inverter where you need a complement).`,
        a: [r`Two XNOR gates give $x_1, x_0$. One AND gives $E$. Two ANDs and an OR give $G$, two ANDs and an OR give $L$ (sample below; complements come from inverters).`],
        rubric: [[8, r`gates for $x_1$, $x_0$`], [8, r`gate for $E$`], [12, r`gates for $G$`], [12, r`gates for $L$`]],
        figs: [comparator2()], facts: {} },
    ],
    refs: [['4.8', 'Magnitude comparator']],
  };
}

// Each slot draws one question type, so one seed gives one of 2 × 2 × 3 × 3 forms.
const pick = makers => rnd => makers[Math.floor(rnd() * makers.length)](rnd);
// The teacher gives no partial marks: each part has one marking row that lists what must all be right.
const allOrNothing = maker => rnd => {
  const q = maker(rnd);
  return { ...q, parts: q.parts.map(p => ({ ...p, rubric: [[p.pts, `all of: ${p.rubric.map(([, step]) => step).join('; ')}`]] })) };
};

export const LOGIC_MOCK = {
  id: 'logic', title: 'Logic Circuit — Practice Final Exam',
  book: 'M. Morris Mano, Digital Design (6th ed.)',
  note: 'Marking (as on the real midterm): each part is all or nothing. Label every input, output and signal of a circuit. Write the work and the answer.',
  minutesPerPoint: 60 / 200,
  makers: [pick([makeSevenSeg, makeCodeConv]), pick([makeBcdAdder, makeComparator]), makeFlipFlop, makeSeqAnalysis].map(allOrNothing),
};

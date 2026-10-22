/* ---------------------------------------------------------------
   ĐỀ NHƯ THẬT (Logic Circuit) — PHỎNG ĐOÁN theo mô tả của người học (đề giữa kỳ, chưa có đề thật): chương 3–4, 3 câu,
   200 điểm, 60 phút, đúng 2 K-map và 2 câu vẽ (mỗi câu vẽ MỘT mạch). Câu 1: mạch 7 đoạn a, f, e (bảng, K-map, phương trình;
   không vẽ). Câu 2: mạch cộng đầy đủ (bảng, phương trình, vẽ một mạch). Câu 3: BCD → Excess-3 (bảng, K-map, vẽ một mạch).
   Đề cuối kỳ nhiều khả năng khác. Thuần, chữ Anh, LaTeX $…$; part.figs = hình mẫu, part.checks = đầu ra để kiểm mạch.
   --------------------------------------------------------------- */
import { minimizeSOP, varNames, literalCount } from './quine-mccluskey.js';
import { kmap, table } from './mock-tex.js';
import { fullAdderCircuit } from './mock-figs.js';

const r = String.raw;
const ON = { a: [0, 2, 3, 5, 6, 7, 8, 9], f: [0, 4, 5, 6, 8, 9], e: [0, 2, 6, 8] };      // đoạn sáng theo chữ số BCD (6 sáng a, 9 sáng d)
const vals = digits => Array.from({ length: 16 }, (_, m) => (m >= 10 ? 2 : digits.includes(m) ? 1 : 0));
const cell = v => (v === 2 ? '\\times' : String(v));
const bits = (m, n) => m.toString(2).padStart(n, '0').split('');
const rowsOf = (n, cols) => Array.from({ length: 1 << n }, (_, m) => [...bits(m, n), ...cols.map(c => cell(c[m]))]);
const names4 = varNames(4), names3 = varNames(3);

function solved(values, n) {
  const sop = minimizeSOP(values, n);
  return { expr: sop.terms.map(t => t.text).join(' + ') || '0', terms: sop.terms.map(t => [...t.text.matchAll(/[a-z]'?/g)].map(m => m[0])), lits: sop.terms.reduce((s, t) => s + literalCount(t.imp, n), 0) };
}
const fig = (out, s) => ({ terms: s.terms.length ? s.terms : [['0']], out });
const check = (label, names, values, lits) => ({ label, names, values, refLits: lits });

export function makeSevenSeg() {
  const segs = Object.entries(ON).map(([k, d]) => [k, vals(d)]), S = Object.fromEntries(segs.map(([k, v]) => [k, solved(v, 4)]));
  return {
    stem: r`A BCD-to-seven-segment decoder has inputs $w, x, y, z$ (the BCD digit $0$ to $9$, $w$ most significant). Codes $10$ to $15$ never occur. Design the segments $a$ (top), $f$ (upper left) and $e$ (lower left). Digits are drawn the standard way: $6$ lights $a$ and $9$ lights $d$.`,
    parts: [
      { pts: 20, q: r`Write the truth table of $a$, $f$, $e$ for the inputs $wxyz$ (use $\times$ for the codes that never occur).`,
        a: [r`A segment is $1$ when the digit uses it: $a$ for $0,2,3,5,6,7,8,9$; $f$ for $0,4,5,6,8,9$; $e$ for $0,2,6,8$.`,
          r`$${table(['w', 'x', 'y', 'z', 'a', 'f', 'e'], rowsOf(4, segs.map(([, v]) => v)))}$`], facts: { a: vals(ON.a), f: vals(ON.f), e: vals(ON.e) } },
      { pts: 40, q: r`Using your truth table, draw a Karnaugh map for each segment and find its minimal sum of products (use the don't-cares).`,
        a: segs.flatMap(([k, v]) => [r`Segment $${k}$: $${kmap(v, names4)}$`, r`$${k} = ${S[k].expr}$`]), facts: { sop: { a: S.a.expr, f: S.f.expr, e: S.e.expr }, names: names4 },
        checks: segs.map(([k, v]) => check(`Segment ${k}`, names4, v, S[k].lits)) },
    ],
    refs: [['4.4', 'Design procedure (cf. Problem 4.9)'], ['3.6', "Don't-care conditions"], ['3.3', 'Four-variable map']],
  };
}

export function makeFullAdder() {
  const S = Array.from({ length: 8 }, (_, m) => ((m >> 2) ^ (m >> 1) ^ m) & 1), C = Array.from({ length: 8 }, (_, m) => (((m >> 2) & 1) + ((m >> 1) & 1) + (m & 1) >= 2 ? 1 : 0));
  const sS = solved(S, 3), sC = solved(C, 3);
  return {
    stem: r`A full adder adds three bits $x, y, z$ ($z$ is the carry in) and produces the sum $S$ and the carry out $C$.`,
    parts: [
      { pts: 20, q: r`Write the truth table of $S$ and $C$.`,
        a: [r`$S = 1$ when an odd number of inputs is $1$; $C = 1$ when at least two inputs are $1$.`, r`$${table(['x', 'y', 'z', 'C', 'S'], rowsOf(3, [C, S]))}$`], facts: { S, C } },
      { pts: 30, q: r`Write simplified Boolean equations for $S$ and $C$. Show that $S$ can be written with XOR gates.`,
        a: [r`$S = ${sS.expr} = x'(y'z + yz') + x(y'z' + yz) = x \oplus y \oplus z$ (no two $1$s are adjacent, so a map cannot group anything).`,
          r`$C = ${sC.expr}$, or with the XOR already used for $S$: $C = xy + z(x \oplus y)$.`], facts: { sopS: sS.expr, sopC: sC.expr, names: names3 } },
      { pts: 30, q: r`Draw the full adder as one gate circuit with outputs $S$ and $C$. Use as few gates as you can.`,
        a: [r`$S = (x \oplus y) \oplus z$ and $C = z(x \oplus y) + xy$ share the first XOR gate: $2$ XOR, $2$ AND, $1$ OR (sample below). The AND–OR form of $S$ and $C$ is also correct but needs more gates.`],
        figs: [fullAdderCircuit()], checks: [check('S', names3, S, sS.lits), check('C', names3, C, sC.lits)], facts: {} },
    ],
    refs: [['4.5', 'Binary adder–subtractor (the full adder)'], ['3.2', 'The map method']],
  };
}

export function makeExcess3() {
  const outs = [3, 2, 1, 0].map(k => [`E_${k}`, Array.from({ length: 16 }, (_, m) => (m >= 10 ? 2 : (((m + 3) >> k) & 1)))]);
  const S = Object.fromEntries(outs.map(([k, v]) => [k, solved(v, 4)]));
  return {
    stem: r`A combinational circuit converts a BCD digit $wxyz$ (digits $0$ to $9$; codes $10$ to $15$ never occur) to the excess-$3$ code $E_3E_2E_1E_0$ (the digit plus $3$).`,
    parts: [
      { pts: 15, q: r`Write the truth table of $E_3, E_2, E_1, E_0$.`,
        a: [r`Excess-$3$ of a digit $d$ is the $4$-bit binary number $d + 3$.`, r`$${table(['w', 'x', 'y', 'z', 'E_3', 'E_2', 'E_1', 'E_0'], rowsOf(4, outs.map(([, v]) => v)))}$`], facts: { outs: Object.fromEntries(outs) } },
      { pts: 25, q: r`Using your truth table, draw a Karnaugh map for each output and find its minimal sum of products (use the don't-cares).`,
        a: outs.flatMap(([k, v]) => [r`$${k}$: $${kmap(v, names4)}$`, r`$${k} = ${S[k].expr}$`]), facts: { sop: Object.fromEntries(outs.map(([k]) => [k, S[k].expr])), names: names4 } },
      { pts: 20, q: r`Draw the converter as one circuit with the four outputs, with AND, OR gates and inverters.`,
        a: [r`Each output is an AND–OR circuit of its product terms; the four drawings together form the one circuit (sample below).`],
        figs: outs.map(([k]) => fig(k, S[k])), stack: true, checks: outs.map(([k, v]) => check(k, names4, v, S[k].lits)), facts: {} },
    ],
    refs: [['4.4', 'Design procedure'], ['3.6', "Don't-care conditions"], ['3.3', 'Four-variable map']],
  };
}

export const LOGIC_MOCK = {
  id: 'logic', title: 'Logic Circuit — Practice Exam',
  book: 'M. Morris Mano, Digital Design (6th ed.)',
  minutesPerPoint: 60 / 200,
  makers: [makeSevenSeg, makeFullAdder, makeExcess3],
};

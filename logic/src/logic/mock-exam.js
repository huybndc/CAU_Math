/* ---------------------------------------------------------------
   ĐỀ NHƯ THẬT (Logic Circuit) — PHỎNG ĐOÁN theo mô tả của người học (đề giữa kỳ, chưa có đề thật): chương 3–4, nặng vẽ mạch,
   không có chương 1–2. 200 điểm, 60 phút. Ba câu: mạch hiển thị 7 đoạn (đoạn a, f, e như bài lớp), mạch cộng đầy đủ,
   BCD → Excess-3. Mỗi câu: bảng chân trị → K-map và biểu thức tối giản → vẽ mạch. Đề cuối kỳ nhiều khả năng khác.
   Thuần, chữ Anh, LaTeX $…$; part.figs = hình mạch mẫu (terms), part.checks = đầu ra để kiểm mạch (mock-check.js).
   --------------------------------------------------------------- */
import { minimizeSOP, varNames, implicantToSOP, literalCount } from './quine-mccluskey.js';
import { kmap, table, M } from './mock-tex.js';

const r = String.raw;
const X = '×';
const ON = { a: [0, 2, 3, 5, 6, 7, 8, 9], f: [0, 4, 5, 6, 8, 9], e: [0, 2, 6, 8] };      // đoạn sáng theo chữ số BCD (kiểu chuẩn: 6 sáng a, 9 sáng d)
const vals = (digits, n = 4, dcFrom = 10) => Array.from({ length: 1 << n }, (_, m) => (m >= dcFrom ? 2 : digits.includes(m) ? 1 : 0));
const cell = v => (v === 2 ? '\\times' : String(v));
const terms = sop => sop.terms.map(t => [...t.text.matchAll(/[a-z]'?/g)].map(m => m[0]));
const refLits = sop => sop.terms.reduce((s, t) => s + literalCount(t.imp, sop.names ?? 4), 0);
const names4 = varNames(4), names3 = varNames(3);

function solved(values, names) {
  const n = names.length, sop = minimizeSOP(values, n);
  return { sop, expr: sop.terms.map(t => t.text).join(' + ') || '0', terms: terms(sop), lits: sop.terms.reduce((s, t) => s + literalCount(t.imp, n), 0) };
}
const outFig = (label, s) => ({ terms: s.terms.length ? s.terms : [['0']], out: label });
const check = (label, names, values, s) => ({ label, names, values, refLits: s.lits });
const rowsOf = (n, cols) => Array.from({ length: 1 << n }, (_, m) => [m.toString(2).padStart(n, '0').split('').join(' & ').replace(/ & /g, ' & ')]
  .concat(cols.map(c => cell(c[m]))).join(' & ').split(' & '));

export function makeSevenSeg() {
  const segs = Object.entries(ON).map(([k, d]) => [k, vals(d)]), S = Object.fromEntries(segs.map(([k, v]) => [k, solved(v, names4)]));
  const shared = [...new Set(Object.values(S).flatMap(s => s.sop.terms.map(t => t.text)))];
  const total = Object.values(S).reduce((n, s) => n + s.sop.terms.length, 0);
  const mapLines = segs.flatMap(([k, v]) => [r`Segment $${k}$: $${kmap(v, names4)}$`, r`$${k} = ${S[k].expr}$`]);
  return {
    stem: r`A BCD-to-seven-segment decoder has inputs $w, x, y, z$ (the BCD digit $0$ to $9$, $w$ most significant). Codes $10$ to $15$ never occur. Design the segments $a$ (top), $f$ (upper left) and $e$ (lower left). Digits are drawn the standard way: $6$ lights $a$ and $9$ lights $d$.`,
    parts: [
      { pts: 20, q: r`Write the truth table of $a$, $f$, $e$ for the inputs $wxyz$ (use $\times$ for the codes that never occur).`,
        a: [r`A segment is $1$ when the digit uses it: $a$ for $0,2,3,5,6,7,8,9$; $f$ for $0,4,5,6,8,9$; $e$ for $0,2,6,8$.`,
          r`$${table(['w', 'x', 'y', 'z', 'a', 'f', 'e'], rowsOf(4, segs.map(([, v]) => v)))}$`], facts: { names: names4, a: vals(ON.a), f: vals(ON.f), e: vals(ON.e) } },
      { pts: 30, q: r`Using your truth table, draw a Karnaugh map for each segment and find its minimal sum of products (use the don't-cares).`,
        a: mapLines, facts: { sop: { a: S.a.expr, f: S.f.expr, e: S.e.expr }, names: names4 } },
      { pts: 30, q: r`Draw the circuit of the three segments with AND, OR gates and inverters (complemented inputs may be taken from inverters). Share gates where you can.`,
        a: [r`Each segment is an AND–OR circuit of its product terms (sample drawings below; a bubble-free label $x'$ means an inverter on input $x$).`,
          r`Distinct product terms over the three segments: $${shared.join(',\\; ')}$ — ${shared.length} AND gates if shared, ${total} if not.`],
        figs: segs.map(([k]) => outFig(k, S[k])), checks: segs.map(([k, v]) => check(`Segment ${k}`, names4, v, S[k])), facts: { shared: shared.length, total } },
    ],
    refs: [['4.4', 'Design procedure (cf. Problem 4.9)'], ['3.6', "Don't-care conditions"], ['3.3', 'Four-variable map']],
  };
}

export function makeFullAdder() {
  const S = Array.from({ length: 8 }, (_, m) => ((m >> 2) ^ (m >> 1) ^ m) & 1), C = Array.from({ length: 8 }, (_, m) => (((m >> 2) & 1) + ((m >> 1) & 1) + (m & 1) >= 2 ? 1 : 0));
  const sS = solved(S, names3), sC = solved(C, names3);
  return {
    stem: r`A full adder adds three bits $x, y, z$ ($z$ is the carry in) and produces the sum $S$ and the carry out $C$.`,
    parts: [
      { pts: 15, q: r`Write the truth table of $S$ and $C$.`,
        a: [r`$S = 1$ when an odd number of inputs is $1$; $C = 1$ when at least two inputs are $1$.`, r`$${table(['x', 'y', 'z', 'C', 'S'], rowsOf(3, [C, S]))}$`], facts: { S, C } },
      { pts: 20, q: r`Draw a Karnaugh map for $S$ and for $C$ and find their minimal sums of products.`,
        a: [r`$S$: $${kmap(S, names3)}$`, r`$S = ${sS.expr}$ (no two $1$s are adjacent, so no grouping is possible; equivalently $S = x \oplus y \oplus z$).`,
          r`$C$: $${kmap(C, names3)}$`, r`$C = ${sC.expr}$`], facts: { sopS: sS.expr, sopC: sC.expr, names: names3 } },
      { pts: 15, q: r`Draw the full adder as a gate circuit.`,
        a: [r`Sample AND–OR drawings of $S$ and $C$ (the XOR form $S = (x \oplus y) \oplus z$ with two XOR gates and $C = xy + z(x \oplus y)$ is also correct).`],
        figs: [outFig('S', sS), outFig('C', sC)], checks: [check('S', names3, S, sS), check('C', names3, C, sC)], facts: {} },
    ],
    refs: [['4.5', 'Binary adder–subtractor (the full adder)'], ['3.2', 'The map method']],
  };
}

export function makeExcess3() {
  const outs = [3, 2, 1, 0].map(k => [`E_${k}`, Array.from({ length: 16 }, (_, m) => (m >= 10 ? 2 : (((m + 3) >> k) & 1)))]);
  const S = Object.fromEntries(outs.map(([k, v]) => [k, solved(v, names4)]));
  return {
    stem: r`A combinational circuit converts a BCD digit $wxyz$ (digits $0$ to $9$; codes $10$ to $15$ never occur) to the excess-$3$ code $E_3E_2E_1E_0$ (the digit plus $3$).`,
    parts: [
      { pts: 20, q: r`Write the truth table of $E_3, E_2, E_1, E_0$.`,
        a: [r`Excess-$3$ of a digit $d$ is the $4$-bit binary number $d + 3$.`, r`$${table(['w', 'x', 'y', 'z', 'E_3', 'E_2', 'E_1', 'E_0'], rowsOf(4, outs.map(([, v]) => v)))}$`], facts: { outs: Object.fromEntries(outs) } },
      { pts: 30, q: r`Using your truth table, draw a Karnaugh map for each output and find its minimal sum of products (use the don't-cares).`,
        a: outs.flatMap(([k, v]) => [r`$${k}$: $${kmap(v, names4)}$`, r`$${k} = ${S[k].expr}$`]), facts: { sop: Object.fromEntries(outs.map(([k]) => [k, S[k].expr])), names: names4 } },
      { pts: 20, q: r`Draw the circuit with AND, OR gates and inverters.`,
        a: [r`Each output is an AND–OR circuit of its product terms (sample drawings below).`],
        figs: outs.map(([k]) => outFig(k, S[k])), checks: outs.map(([k, v]) => check(k, names4, v, S[k])), facts: {} },
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

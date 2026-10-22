/* ---------------------------------------------------------------
   ĐỀ NHƯ THẬT (Logic Circuit) — PHỎNG ĐOÁN theo mô tả của người học (chưa có đề thật): vài câu, ý sau dùng kết quả ý trước,
   tập trung chương 3–4 (K-map, tối giản, NAND, decoder, MUX, bộ cộng–trừ); chương 1–2 không ra. 100 điểm, 60 phút.
   Thuần, chữ Anh, LaTeX $…$; số liệu từ quine-mccluskey / combinational của app.
   --------------------------------------------------------------- */
import { int } from '@shared/logic/shuffle.js';
import { randomValues } from './random-function.js';
import { minimizeSOP, minimizePOS, varNames, implicantToSOP } from './quine-mccluskey.js';
import { muxInputs, rippleAdd, addSub, signedOf } from './combinational.js';
import { kmap, table, bin, M } from './mock-tex.js';

const r = String.raw;
const list = a => a.join(', ');
const minterms = vs => vs.map((v, i) => (v === 1 ? i : -1)).filter(i => i >= 0);

function func(n, dc, rnd, lo, hi) {
  for (;;) {
    const v = randomValues(n, dc, rnd), ones = v.filter(x => x === 1).length, zeros = v.filter(x => x === 0).length;
    if (ones >= lo && ones <= hi && zeros >= 3) return v;
  }
}
const spec = (vs, names) => {
  const ones = vs.map((v, i) => (v === 1 ? i : -1)).filter(i => i >= 0), dcs = vs.map((v, i) => (v === 2 ? i : -1)).filter(i => i >= 0);
  return r`$F(${names.join(',')}) = \sum m(${list(ones)})${dcs.length ? r` + \sum d(${list(dcs)})` : ''}$`;
};

export function makeKmap(rnd) {
  const names = varNames(4), values = func(4, true, rnd, 5, 9);
  const sop = minimizeSOP(values, 4), pos = minimizePOS(values, 4);
  const tex = t => t.replace(/ /g, '');
  return {
    stem: `Let ${spec(values, names)}.`,
    parts: [
      { pts: 10, q: r`Draw the Karnaugh map of $F$ (mark don't-cares with $\times$) and list all prime implicants.`,
        a: [r`$${kmap(values, names)}$`, r`Prime implicants: $${sop.pis.map(p => implicantToSOP(p, 4)).join(',\\; ')}$.`], facts: { values, pis: sop.pis.map(p => implicantToSOP(p, 4)) } },
      { pts: 10, q: r`Using your map, find the minimal sum of products. Which prime implicants are essential?`,
        a: [r`Essential prime implicants (they cover a $1$ that no other prime implicant covers): $${sop.terms.filter(t => t.essential).map(t => t.text).join(',\\; ') || '\\text{none}'}$.`,
          r`Cover the remaining $1$s with as few extra implicants as possible. Minimal SOP: $F = ${sop.terms.map(t => t.text).join(' + ')}$.`], facts: { values, sop: sop.expr, names } },
      { pts: 10, q: r`Using the same map, find the minimal product of sums.`,
        a: [r`Group the $0$s (and don't-cares) and complement: $F' = ${minimizeSOP(values.map(v => (v === 1 ? 0 : v === 0 ? 1 : 2)), 4).expr}$.`,
          r`By De Morgan: $F = ${tex(pos.expr).replace(/\)\(/g, ')\\,(')}$.`], facts: { values, pos: pos.expr, names } },
    ],
  };
}

export function makeDesign(rnd) {
  const names = varNames(3), values = func(3, false, rnd, 3, 5);
  const sop = minimizeSOP(values, 3), ones = minterms(values), mux = muxInputs(values, 'z');
  const first = sop.terms.map(t => r`\overline{${t.text}}`).join('\\,');
  return {
    stem: `Let ${spec(values, names)}.`,
    parts: [
      { pts: 10, q: r`Find the minimal sum of products of $F$ using a Karnaugh map.`,
        a: [r`$${kmap(values, names)}$`, r`$F = ${sop.terms.map(t => t.text).join(' + ')}$`], facts: { values, sop: sop.expr, names } },
      { pts: 10, q: r`Implement $F$ with a $3$-to-$8$ decoder and one OR gate. Which decoder outputs go to the OR gate?`,
        a: [r`The decoder gives one output $D_k$ per minterm $m_k$. $F$ is the OR of its minterms.`, r`OR inputs: $${ones.map(k => `D_{${k}}`).join(',\\; ')}$.`], facts: { ones } },
      { pts: 10, q: r`Implement $F$ with a $4$-to-$1$ multiplexer. Use $x, y$ as the select inputs. What goes to each data input $I_0, \dots, I_3$?`,
        a: [r`For each pair of rows with the same $xy$, compare $F$ for $z = 0$ and $z = 1$: equal $0$ gives $0$, equal $1$ gives $1$, $(0,1)$ gives $z$, $(1,0)$ gives $z'$.`,
          r`$${mux.map((v, k) => `I_${k} = ${v}`).join(',\\; ')}$.`], facts: { values, mux } },
      { pts: 5, q: r`Redraw your answer to part (a) using NAND gates only.`,
        a: [r`NAND–NAND form: a NAND for each product term, then one NAND of those outputs (complemented inputs need an inverter).`,
          r`$F = \overline{${first}}$ — ${sop.terms.length} first-level NAND${sop.terms.length > 1 ? 's' : ''} and 1 second-level NAND.`], facts: { terms: sop.terms.length } },
    ],
  };
}

export function makeAdder(rnd) {
  const a = int(0, 15, rnd), b = int(0, 15, rnd), add = rippleAdd(a, b, 0, 4), sub = addSub(a, b, 1, 4);
  const bitOf = (x, i) => (x >> i) & 1;
  const rows = [0, 1, 2, 3].map(i => [i, bitOf(a, i), bitOf(b, i), add.carries[i], add.sum[3 - i], add.carries[i + 1]]);
  const sa = signedOf(a), sb = signedOf(b), ss = signedOf(parseInt(add.sum, 2)), vAdd = add.carries[4] ^ add.carries[3];
  return {
    stem: r`A $4$-bit ripple-carry adder–subtractor has inputs $A = ${bin(a)}_2$ and $B = ${bin(b)}_2$ (two's complement numbers).`,
    parts: [
      { pts: 15, q: r`Find $S = A + B$ with the ripple-carry adder ($C_0 = 0$). Show the carry into and out of every stage.`,
        a: [r`$S_i = A_i \oplus B_i \oplus C_i$, $\;C_{i+1} = A_iB_i + C_i(A_i \oplus B_i)$. Stage by stage (bit $0$ is the least significant):`,
          r`$${table(['i', 'A_i', 'B_i', 'C_i', 'S_i', 'C_{i+1}'], rows)}$`, r`$S = ${add.sum}_2$, $\;C_4 = ${add.carries[4]}$.`], facts: { a, b, sum: add.sum, carries: add.carries } },
      { pts: 10, q: r`Read $A$, $B$ and $S$ as signed numbers. Is the result of part (a) correct, or is there overflow? Use the carries from part (a).`,
        a: [r`Signed values: $A = ${sa}$, $B = ${sb}$, $S = ${ss}$.`, r`Overflow flag $V = C_4 \oplus C_3 = ${add.carries[4]} \oplus ${add.carries[3]} = ${vAdd}$.`,
          vAdd ? r`$V = 1$: overflow. The true sum $${sa + sb}$ does not fit in $4$ bits ($-8$ to $7$).` : r`$V = 0$: no overflow, $S = A + B = ${sa + sb}$.`], facts: { v: vAdd, signed: [sa, sb, ss] } },
      { pts: 10, q: r`Compute $A - B$ with the same circuit ($M = 1$). Give $B'$, the carry in, the result, and the overflow flag.`,
        a: [r`$M = 1$: the XOR gates complement $B$ and $C_0 = 1$, so the circuit computes $A + B' + 1$.`,
          r`$B' = ${sub.bx}_2$, $\;C_0 = 1$, $\;A + B' + 1 = ${sub.sum}_2$, with carries $C_1 \dots C_4 = ${sub.carries.slice(1).join(',\\,')}$.`,
          r`$V = C_4 \oplus C_3 = ${sub.v}$, and $A - B = ${signedOf(parseInt(sub.sum, 2))}$ as a signed number${sub.v ? ' (overflow: the true difference ' + (sa - sb) + ' does not fit)' : ''}.`], facts: { sum: sub.sum, v: sub.v, bx: sub.bx } },
    ],
  };
}

export const LOGIC_MOCK = {
  id: 'logic', title: 'Logic Circuit — Practice Exam',
  book: 'M. Morris Mano, Digital Design (6th ed.)',
  minutesPerPoint: 60 / 100,
  makers: [makeKmap, makeDesign, makeAdder],
  refs: [
    [['3.3', 'Four-variable map'], ['3.5', 'Product-of-sums simplification'], ['3.6', "Don't-care conditions"]],
    [['3.2–3.3', 'The map method'], ['3.7', 'NAND and NOR implementation'], ['4.9', 'Decoders'], ['4.11', 'Multiplexers']],
    [['4.5', 'Binary adder–subtractor']],
  ],
};

/* ---------------------------------------------------------------
   ĐỀ NHƯ THẬT (Logic Circuit) — PHỎNG ĐOÁN theo mô tả của người học (đề giữa kỳ, chưa có đề thật): chương 3–4, nặng thiết kế
   rồi vẽ mạch lớn. 200 điểm, 60 phút. Ba câu: mạch 7 đoạn (đoạn a, f, e như bài lớp), bộ cộng BCD (từ FA đến bộ cộng 4 bit
   rồi mạch hiệu chỉnh), MUX/DEMUX. Mỗi câu đi từng bước: bảng → phương trình tối giản → vẽ mạch. Đề cuối kỳ nhiều khả năng khác.
   Thuần, chữ Anh, LaTeX $…$; part.figs = hình mẫu (terms hoặc khối), part.checks = đầu ra để kiểm mạch (mock-check.js).
   --------------------------------------------------------------- */
import { minimizeSOP, varNames, literalCount } from './quine-mccluskey.js';
import { kmap, table } from './mock-tex.js';
import { adder4, bcdAdder, muxBox } from './mock-figs.js';

const r = String.raw;
const ON = { a: [0, 2, 3, 5, 6, 7, 8, 9], f: [0, 4, 5, 6, 8, 9], e: [0, 2, 6, 8] };      // đoạn sáng theo chữ số BCD (6 sáng a, 9 sáng d)
const vals = (digits, dcFrom = 10) => Array.from({ length: 16 }, (_, m) => (m >= dcFrom ? 2 : digits.includes(m) ? 1 : 0));
const cell = v => (v === 2 ? '\\times' : String(v));
const bits = (m, n) => m.toString(2).padStart(n, '0').split('');
const rowsOf = (n, cols) => Array.from({ length: 1 << n }, (_, m) => [...bits(m, n), ...cols.map(c => cell(c[m]))]);
const names4 = varNames(4), names3 = varNames(3);

function solved(values, n) {
  const sop = minimizeSOP(values, n);
  return { sop, expr: sop.terms.map(t => t.text).join(' + ') || '0', terms: sop.terms.map(t => [...t.text.matchAll(/[a-z]'?/g)].map(m => m[0])), lits: sop.terms.reduce((s, t) => s + literalCount(t.imp, n), 0) };
}
const fig = (out, s) => ({ terms: s.terms.length ? s.terms : [['0']], out });
const check = (label, names, values, lits) => ({ label, names, values, refLits: lits });

export function makeSevenSeg() {
  const segs = Object.entries(ON).map(([k, d]) => [k, vals(d)]), S = Object.fromEntries(segs.map(([k, v]) => [k, solved(v, 4)]));
  const shared = [...new Set(Object.values(S).flatMap(s => s.sop.terms.map(t => t.text)))];
  const total = Object.values(S).reduce((n, s) => n + s.sop.terms.length, 0);
  return {
    stem: r`A BCD-to-seven-segment decoder has inputs $w, x, y, z$ (the BCD digit $0$ to $9$, $w$ most significant). Codes $10$ to $15$ never occur. Design the segments $a$ (top), $f$ (upper left) and $e$ (lower left). Digits are drawn the standard way: $6$ lights $a$ and $9$ lights $d$.`,
    parts: [
      { pts: 15, q: r`Write the truth table of $a$, $f$, $e$ for the inputs $wxyz$ (use $\times$ for the codes that never occur).`,
        a: [r`A segment is $1$ when the digit uses it: $a$ for $0,2,3,5,6,7,8,9$; $f$ for $0,4,5,6,8,9$; $e$ for $0,2,6,8$.`,
          r`$${table(['w', 'x', 'y', 'z', 'a', 'f', 'e'], rowsOf(4, segs.map(([, v]) => v)))}$`], facts: { a: vals(ON.a), f: vals(ON.f), e: vals(ON.e) } },
      { pts: 25, q: r`Using your truth table, draw a Karnaugh map for each segment and find its minimal sum of products (use the don't-cares).`,
        a: segs.flatMap(([k, v]) => [r`Segment $${k}$: $${kmap(v, names4)}$`, r`$${k} = ${S[k].expr}$`]), facts: { sop: { a: S.a.expr, f: S.f.expr, e: S.e.expr }, names: names4 } },
      { pts: 20, q: r`Draw the circuit of the three segments with AND, OR gates and inverters (complemented inputs may be taken from inverters). Share gates where you can.`,
        a: [r`Each segment is an AND–OR circuit of its product terms (sample drawings below).`,
          r`Distinct product terms over the three segments: $${shared.join(', ')}$ — ${shared.length} AND gates if shared, ${total} if not.`],
        figs: segs.map(([k]) => fig(k, S[k])), checks: segs.map(([k, v]) => check(`Segment ${k}`, names4, v, S[k].lits)), facts: { shared: shared.length, total } },
    ],
    refs: [['4.4', 'Design procedure (cf. Problem 4.9)'], ['3.6', "Don't-care conditions"], ['3.3', 'Four-variable map']],
  };
}

export function makeBcdAdder() {
  const S = Array.from({ length: 8 }, (_, m) => ((m >> 2) ^ (m >> 1) ^ m) & 1), C = Array.from({ length: 8 }, (_, m) => (((m >> 2) & 1) + ((m >> 1) & 1) + (m & 1) >= 2 ? 1 : 0));
  const sS = solved(S, 3), sC = solved(C, 3);
  const corr = Array.from({ length: 32 }, (_, m) => (m > 19 ? 2 : m >= 10 ? 1 : 0)), low = Array.from({ length: 16 }, (_, m) => (m >= 10 ? 1 : 0));
  const rows = Array.from({ length: 20 }, (_, n) => [...bits(n, 5), n >= 10 ? '1' : '0', ...bits(n >= 10 ? n - 10 : n, 4)]);
  return {
    stem: r`Design a BCD adder: it adds two BCD digits $A, B$ and a carry in $C_{in}$ and gives a BCD digit $S_8S_4S_2S_1$ with a carry out $C$. Build it step by step from the full adder.`,
    parts: [
      { pts: 15, q: r`A full adder adds three bits $x, y, z$ ($z$ the carry in). Write the truth table of its sum $S$ and carry $C$, then find their minimal sums of products.`,
        a: [r`$${table(['x', 'y', 'z', 'C', 'S'], rowsOf(3, [C, S]))}$`, r`$S$: $${kmap(S, names3)}$`, r`$S = ${sS.expr}$ (no two $1$s are adjacent, so nothing groups; equivalently $S = x \oplus y \oplus z$).`,
          r`$C$: $${kmap(C, names3)}$`, r`$C = ${sC.expr}$`], facts: { S, C, sopS: sS.expr, sopC: sC.expr, names: names3 } },
      { pts: 10, q: r`Draw the full adder as a gate circuit.`,
        a: [r`Sample AND–OR drawings of $S$ and $C$ (the XOR form $S = (x \oplus y) \oplus z$, $C = xy + z(x \oplus y)$ is also correct).`],
        figs: [fig('S', sS), fig('C', sC)], checks: [check('S', names3, S, sS.lits), check('C', names3, C, sC.lits)], facts: {} },
      { pts: 10, q: r`Use full adders to draw a $4$-bit parallel adder with inputs $A_3..A_0$, $B_3..B_0$, $C_0$ and outputs $S_3..S_0$, $C_4$.`,
        a: [r`Chain four full adders: the carry out of each stage is the carry in of the next ($C_{i+1}$ from stage $i$).`], figs: [adder4()], facts: {} },
      { pts: 20, q: r`Two BCD digits and $C_{in}$ add to at most $9 + 9 + 1 = 19$. Let the $4$-bit adder give the binary sum $K Z_8Z_4Z_2Z_1$ (write these five bits as $v, w, x, y, z$). Make a table of the sums $0$ to $19$ with the BCD result $C S_8S_4S_2S_1$ they must become, then find when $0110$ must be added and simplify $C$.`,
        a: [r`$${table(['K', 'Z_8', 'Z_4', 'Z_2', 'Z_1', 'C', 'S_8', 'S_4', 'S_2', 'S_1'], rows)}$`,
          r`The sum must be corrected (add $6 = 0110$) exactly when it is above $9$, so $C = 1$ exactly for the binary sums $10$ to $19$.`,
          r`$K = 0$ (sums $0$ to $15$): $${kmap(low, names4)}$, so $C = wx + wy$.`,
          r`$K = 1$ (sums $16$ to $19$): $C = 1$. Hence $C = v + wx + wy$ (that is $K + Z_8Z_4 + Z_8Z_2$).`],
        checks: [check('C = f(K, Z8, Z4, Z2, Z1)', ['v', 'w', 'x', 'y', 'z'], corr, 5)], facts: { corr, expr: 'v + wx + wy' } },
      { pts: 25, q: r`Draw the complete BCD adder using two $4$-bit adders and the gates for $C$.`,
        a: [r`The first adder adds $A + B + C_{in}$ and gives $K$ and $Z$. Gates give $C = K + Z_8Z_4 + Z_8Z_2$. The second adder adds $Z$ and $0CC0$ (so $+6$ when $C = 1$); its carry out is ignored and $C$ is the BCD carry out.`],
        figs: [bcdAdder()], facts: {} },
    ],
    refs: [['4.5', 'Binary adder–subtractor (full adder, parallel adder)'], ['4.6', 'Decimal adder (BCD adder)']],
  };
}

const DATA = ['0', '1', 'z', "z'"], PAIR = { 0: [0, 0], 1: [1, 1], z: [0, 1], "z'": [1, 0] };
const tx = s => s.replace("z'", "\\bar z");

export function makeMux(rnd) {
  let data;
  do data = Array.from({ length: 4 }, () => DATA[Math.floor(rnd() * 4)]); while (!(data.includes('z') && data.includes("z'")));
  const f = data.flatMap(d => PAIR[d]), mins = f.map((v, m) => (v ? m : -1)).filter(m => m >= 0);
  const dRows = Array.from({ length: 8 }, (_, m) => [...bits(m, 3), ...[0, 1, 2, 3].map(k => ((m >> 2) & 1 && (m & 3) === k ? '1' : '0'))]);
  const dExpr = ["xy'z'", "xy'z", 'xyz\'', 'xyz'];
  const dTerms = [["x", "y'", "z'"], ["x", "y'", 'z'], ['x', 'y', "z'"], ['x', 'y', 'z']];
  const spec = k => Array.from({ length: 8 }, (_, m) => (m === 4 + k ? 1 : 0));
  return {
    stem: r`Multiplexers and demultiplexers. A $4$-to-$1$ multiplexer has data inputs $I_0..I_3$, selects $S_1, S_0$ and output $Y$.`,
    parts: [
      { pts: 15, q: r`Write the function table of the multiplexer and its Boolean equation for $Y$.`,
        a: [r`$${table(['S_1', 'S_0', 'Y'], [['0', '0', 'I_0'], ['0', '1', 'I_1'], ['1', '0', 'I_2'], ['1', '1', 'I_3']])}$`,
          r`$Y = S_1'S_0'I_0 + S_1'S_0I_1 + S_1S_0'I_2 + S_1S_0I_3$`], facts: {} },
      { pts: 10, q: r`Draw the multiplexer with AND, OR gates and inverters.`,
        a: [r`One AND gate per data input, enabled by the matching select code, then one OR gate (sample drawing below).`],
        figs: [{ terms: [["S1'", "S0'", 'I0'], ["S1'", 'S0', 'I1'], ['S1', "S0'", 'I2'], ['S1', 'S0', 'I3']], out: 'Y' }], facts: {} },
      { pts: 20, q: r`Implement $F(x,y,z) = \sum m(${mins.join(',')})$ with one $4$-to-$1$ multiplexer, $x, y$ on the selects ($S_1 = x$, $S_0 = y$). Find the data inputs from the truth table, then draw the circuit.`,
        a: [r`$${table(['x', 'y', 'z', 'F'], rowsOf(3, [f]))}$`,
          r`For each $xy$, read $F$ for $z = 0, 1$: $F = 0, 0 \Rightarrow I = 0$; $1, 1 \Rightarrow I = 1$; $0, 1 \Rightarrow I = z$; $1, 0 \Rightarrow I = \bar z$.`,
          r`$I_0 = ${tx(data[0])},\; I_1 = ${tx(data[1])},\; I_2 = ${tx(data[2])},\; I_3 = ${tx(data[3])}$`],
        figs: [muxBox(data)], facts: { mins, data, f } },
      { pts: 15, q: r`A $1$-to-$4$ demultiplexer has data input $x$, selects $y, z$ and outputs $D_0..D_3$ ($D_k = x$ when $yz = k$, else $0$). Write its table, the equation of each output, and draw it.`,
        a: [r`$${table(['x', 'y', 'z', 'D_0', 'D_1', 'D_2', 'D_3'], dRows)}$`, r`$D_0 = xy'z',\; D_1 = xy'z,\; D_2 = xyz',\; D_3 = xyz$ (a decoder with $x$ as enable).`],
        figs: dTerms.map((t, k) => ({ terms: [t], out: `D${k}` })), checks: dTerms.map((_, k) => check(`D${k}`, names3, spec(k), 3)), facts: { dExpr } },
    ],
    refs: [['4.11', 'Multiplexers'], ['4.9', 'Decoders (demultiplexer)']],
  };
}

export const LOGIC_MOCK = {
  id: 'logic', title: 'Logic Circuit — Practice Exam',
  book: 'M. Morris Mano, Digital Design (6th ed.)',
  minutesPerPoint: 60 / 200,
  makers: [makeSevenSeg, makeBcdAdder, makeMux],
};

/* ---------------------------------------------------------------
   ĐỀ THI THỬ (Logic Circuit) — PHỎNG ĐOÁN theo mô tả của người học (đề giữa kỳ, chưa có đề thật): chương 3–4, 3 câu,
   200 điểm, 60 phút, đúng 2 K-map (7 đoạn a/f/e, BCD → Excess-3; không vẽ mạch) và 2 câu vẽ, mỗi câu MỘT mạch cỡ sơ đồ giáo trình:
   bộ cộng BCD (Fig. 4.14) và mạch MUX 4×1 thực hiện một hàm.
   Đề cuối kỳ nhiều khả năng khác. Thuần, chữ Anh, LaTeX $…$; part.figs = hình mẫu, part.checks = đầu ra để kiểm mạch.
   --------------------------------------------------------------- */
import { minimizeSOP, varNames, literalCount } from './quine-mccluskey.js';
import { kmap, table } from './mock-tex.js';
import { bcdAdder, muxBox } from './mock-figs.js';

const r = String.raw;
const ON = { a: [0, 2, 3, 5, 6, 7, 8, 9], f: [0, 4, 5, 6, 8, 9], e: [0, 2, 6, 8] };      // đoạn sáng theo chữ số BCD (6 sáng a, 9 sáng d)
const vals = digits => Array.from({ length: 16 }, (_, m) => (m >= 10 ? 2 : digits.includes(m) ? 1 : 0));
const cell = v => (v === 2 ? '\\times' : String(v));
const bits = (m, n) => m.toString(2).padStart(n, '0').split('');
const rowsOf = (n, cols) => Array.from({ length: 1 << n }, (_, m) => [...bits(m, n), ...cols.map(c => cell(c[m]))]);
const names4 = varNames(4);

function solved(values, n) {
  const sop = minimizeSOP(values, n);
  return { expr: sop.terms.map(t => t.text).join(' + ') || '0', terms: sop.terms.map(t => [...t.text.matchAll(/[a-z]'?/g)].map(m => m[0])), lits: sop.terms.reduce((s, t) => s + literalCount(t.imp, n), 0) };
}

export function makeSevenSeg() {
  const segs = Object.entries(ON).map(([k, d]) => [k, vals(d)]), S = Object.fromEntries(segs.map(([k, v]) => [k, solved(v, 4)]));
  return {
    stem: r`A BCD-to-seven-segment decoder has inputs $w, x, y, z$ (the BCD digit $0$ to $9$, $w$ most significant). Codes $10$ to $15$ never occur. Design the segments $a$ (top), $f$ (upper left) and $e$ (lower left). Digits are drawn the standard way: $6$ lights $a$ and $9$ lights $d$.`,
    parts: [
      { pts: 15, q: r`Write the truth table of $a$, $f$, $e$ for the inputs $wxyz$ (use $\times$ for the codes that never occur).`,
        a: [r`A segment is $1$ when the digit uses it: $a$ for $0,2,3,5,6,7,8,9$; $f$ for $0,4,5,6,8,9$; $e$ for $0,2,6,8$.`,
          r`$${table(['w', 'x', 'y', 'z', 'a', 'f', 'e'], rowsOf(4, segs.map(([, v]) => v)))}$`], facts: { a: vals(ON.a), f: vals(ON.f), e: vals(ON.e) } },
      { pts: 25, q: r`Using your truth table, draw a Karnaugh map for each segment and find its minimal sum of products (use the don't-cares).`,
        a: segs.flatMap(([k, v]) => [r`Segment $${k}$: $${kmap(v, names4)}$`, r`$${k} = ${S[k].expr}$`]), facts: { sop: { a: S.a.expr, f: S.f.expr, e: S.e.expr }, names: names4 } },
    ],
    refs: [['4.4', 'Design procedure (cf. Problem 4.9)'], ['3.5', "Don't-care conditions"], ['3.3', 'Four-variable map']],
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
    ],
    refs: [['4.4', 'Design procedure'], ['3.5', "Don't-care conditions"], ['3.3', 'Four-variable map']],
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
        facts: { corr, expr: 'v + wx + wy' } },
      { pts: 40, q: r`Draw the complete BCD adder as one circuit, using two $4$-bit binary adders (as blocks) and the gates for $C$.`,
        a: [r`The first adder adds $A + B + C_{in}$ and gives $K$ and $Z$. Gates give $C = K + Z_8Z_4 + Z_8Z_2$. The second adder adds $Z$ and $0CC0$ (so $+6$ when $C = 1$); its carry out is ignored and $C$ is the BCD carry out.`],
        figs: [bcdAdder()], facts: {} },
    ],
    refs: [['4.5', 'Binary adder–subtractor (4-bit parallel adder)'], ['4.6', 'Decimal adder (BCD adder)']],
  };
}

const DATA = ['0', '1', 'z', "z'"], PAIR = { 0: [0, 0], 1: [1, 1], z: [0, 1], "z'": [1, 0] };
const tx = s => s.replace("z'", '\\bar z');

export function makeMux(rnd) {
  let data;
  do data = Array.from({ length: 4 }, () => DATA[Math.floor(rnd() * 4)]); while (!(data.includes('z') && data.includes("z'")));
  const f = data.flatMap(d => PAIR[d]), mins = f.map((v, m) => (v ? m : -1)).filter(m => m >= 0);
  return {
    stem: r`A $4$-to-$1$ multiplexer has data inputs $I_0..I_3$, selects $S_1, S_0$ and output $Y$.`,
    parts: [
      { pts: 15, q: r`Write the function table of the multiplexer and its Boolean equation for $Y$.`,
        a: [r`$${table(['S_1', 'S_0', 'Y'], [['0', '0', 'I_0'], ['0', '1', 'I_1'], ['1', '0', 'I_2'], ['1', '1', 'I_3']])}$`,
          r`$Y = S_1'S_0'I_0 + S_1'S_0I_1 + S_1S_0'I_2 + S_1S_0I_3$`], facts: {} },
      { pts: 25, q: r`Implement $F(x,y,z) = \sum m(${mins.join(',')})$ with one $4$-to-$1$ multiplexer, $x, y$ on the selects ($S_1 = x$, $S_0 = y$). Write the truth table of $F$ and find what each data input must be ($0$, $1$, $z$ or $\bar z$).`,
        a: [r`$${table(['x', 'y', 'z', 'F'], rowsOf(3, [f]))}$`,
          r`For each $xy$, read $F$ for $z = 0, 1$: $F = 0, 0 \Rightarrow I = 0$; $1, 1 \Rightarrow I = 1$; $0, 1 \Rightarrow I = z$; $1, 0 \Rightarrow I = \bar z$.`,
          r`$I_0 = ${tx(data[0])},\; I_1 = ${tx(data[1])},\; I_2 = ${tx(data[2])},\; I_3 = ${tx(data[3])}$`], facts: { mins, data, f } },
      { pts: 15, q: r`Draw the complete circuit of $F$: the multiplexer as a block with all its inputs connected (use an inverter where you need $\bar z$).`,
        a: [r`Connect $x, y$ to $S_1, S_0$, and each data input as found above (sample below).`], figs: [muxBox(data)], facts: {} },
    ],
    refs: [['4.11', 'Multiplexers (implementing a Boolean function)']],
  };
}

export const LOGIC_MOCK = {
  id: 'logic', title: 'Logic Circuit — Practice Exam',
  book: 'M. Morris Mano, Digital Design (6th ed.)',
  minutesPerPoint: 60 / 200,
  makers: [makeSevenSeg, makeExcess3, makeBcdAdder, makeMux],
};

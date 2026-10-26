/* ---------------------------------------------------------------
   ĐỀ THI THỬ (Logic Circuit) — PHỎNG ĐOÁN theo mô tả của người học (đề giữa kỳ, chưa có đề thật): chương 3–4, 3 câu,
   200 điểm, 60 phút, đúng 2 K-map (7 đoạn a/f/e, BCD → Excess-3; không vẽ mạch) và 2 câu vẽ, mỗi câu MỘT mạch cỡ sơ đồ giáo trình:
   bộ cộng BCD (Fig. 4.14) hoặc bộ so sánh 2 bit, và MUX 4×1 hoặc decoder + OR thực hiện hàm. Câu chuyển mã rút một trong excess-3, Gray, 2421.
   Đề cuối kỳ nhiều khả năng khác. Thuần, chữ Anh, LaTeX $…$; part.rubric = thang chấm [điểm, bước]; part.figs = hình mẫu, part.checks = đầu ra để kiểm mạch.
   --------------------------------------------------------------- */
import { minimizeSOP, varNames, literalCount } from './quine-mccluskey.js';
import { kmap, table } from './mock-tex.js';
import { bcdAdder, muxBox, comparator2, decoderOr } from './mock-figs.js';

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
          r`$Y = S_1'S_0'I_0 + S_1'S_0I_1 + S_1S_0'I_2 + S_1S_0I_3$`], rubric: [[7, r`function table`], [8, r`equation of $Y$`]], facts: {} },
      { pts: 25, q: r`Implement $F(x,y,z) = \sum m(${mins.join(',')})$ with one $4$-to-$1$ multiplexer, $x, y$ on the selects ($S_1 = x$, $S_0 = y$). Write the truth table of $F$ and find what each data input must be ($0$, $1$, $z$ or $\bar z$).`,
        a: [r`$${table(['x', 'y', 'z', 'F'], rowsOf(3, [f]))}$`,
          r`For each $xy$, read $F$ for $z = 0, 1$: $F = 0, 0 \Rightarrow I = 0$; $1, 1 \Rightarrow I = 1$; $0, 1 \Rightarrow I = z$; $1, 0 \Rightarrow I = \bar z$.`,
          r`$I_0 = ${tx(data[0])},\; I_1 = ${tx(data[1])},\; I_2 = ${tx(data[2])},\; I_3 = ${tx(data[3])}$`], rubric: [[9, r`truth table of $F$`], [16, r`each data input $I_0$ to $I_3$ ($4$ each)`]], facts: { kind: 'mux', mins, data, f } },
      { pts: 15, q: r`Draw the complete circuit of $F$: the multiplexer as a block with all its inputs connected (use an inverter where you need $\bar z$).`,
        a: [r`Connect $x, y$ to $S_1, S_0$, and each data input as found above (sample below).`], figs: [muxBox(data)], rubric: [[4, r`$x, y$ on $S_1, S_0$`], [8, r`data inputs connected as found`], [3, r`inverter for $\bar z$`]], facts: {} },
    ],
    refs: [['4.11', 'Multiplexers (implementing a Boolean function)']],
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

const pickMins = rnd => {
  let m;
  do m = [0, 1, 2, 3, 4, 5, 6, 7].filter(() => rnd() < 0.45); while (m.length < 2 || m.length > 5);
  return m;
};

export function makeDecoder(rnd) {
  const f1 = pickMins(rnd);
  let f2;
  do f2 = pickMins(rnd); while (f2.join() === f1.join());
  const val = (mins, m) => (mins.includes(m) ? 1 : 0), ors = mins => mins.map(m => `D_${m}`).join(' + ');
  return {
    stem: r`A $3$-to-$8$ line decoder has inputs $x, y, z$ ($x$ most significant) and outputs $D_0..D_7$.`,
    parts: [
      { pts: 15, q: r`Write the function table of the decoder and the Boolean expression of each output $D_i$.`,
        a: [r`Exactly one output is $1$: $D_i = 1$ when $xyz$ is the binary number $i$.`, r`$${Array.from({ length: 8 }, (_, i) => `D_${i} = ${bits(i, 3).map((b, k) => 'xyz'[k] + (b === '1' ? '' : "'")).join('')}`).join(', ')}$`],
        rubric: [[7, r`function table`], [8, r`each $D_i$ is minterm $m_i$`]], facts: { kind: 'dec' } },
      { pts: 25, q: r`Implement $F_1 = \sum m(${f1.join(',')})$ and $F_2 = \sum m(${f2.join(',')})$ with this decoder and OR gates. Write the truth table of $F_1, F_2$ and say which decoder outputs go to each OR gate.`,
        a: [r`$${table(['x', 'y', 'z', 'F_1', 'F_2'], Array.from({ length: 8 }, (_, m) => [...bits(m, 3), String(val(f1, m)), String(val(f2, m))]))}$`,
          r`Each OR gate takes the outputs of the minterms of its function: $F_1 = ${ors(f1)}$, $F_2 = ${ors(f2)}$`],
        rubric: [[9, r`truth table of $F_1, F_2$`], [16, r`decoder outputs for each OR gate ($8$ each)`]], facts: { f1, f2 } },
      { pts: 15, q: r`Draw the complete circuit: the decoder as a block with its inputs, and the OR gates.`,
        a: [r`Connect $x, y, z$ to the decoder and each OR gate to the outputs found above (sample below).`],
        rubric: [[4, r`decoder with inputs $x, y, z$`], [8, r`OR inputs as found`], [3, r`outputs $F_1, F_2$ labelled`]],
        figs: [decoderOr([['F₁', f1], ['F₂', f2]])], facts: {} },
    ],
    refs: [['4.9', 'Decoders (combinational logic implementation)']],
  };
}

// mỗi chỗ trong đề rút một dạng: câu K-map 2 = một mã đích, câu vẽ = một trong hai mạch
const pick = makers => rnd => makers[Math.floor(rnd() * makers.length)](rnd);

export const LOGIC_MOCK = {
  id: 'logic', title: 'Logic Circuit — Practice Exam',
  book: 'M. Morris Mano, Digital Design (6th ed.)',
  minutesPerPoint: 60 / 200,
  makers: [makeSevenSeg, makeCodeConv, pick([makeBcdAdder, makeComparator]), pick([makeMux, makeDecoder])],
};

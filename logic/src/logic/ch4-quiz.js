/* ---------------------------------------------------------------
   SINH & CHẤM ĐỀ CHƯƠNG 4 — Mạch tổ hợp (Mano §4.3–4.11). Thuần, không đụng DOM.
   Đáp án luôn TÍNH bằng combinational.js (cùng lõi với lời giải), không soạn tay.
   --------------------------------------------------------------- */

import { rippleAdd, addSub, signedOf, bcdAdd, compare, priorityEncode, muxInputs, muxOutput, evalNet, gateExpr, GATE_OPS } from './combinational.js';
import { randomSop } from './ch2-quiz.js';
import { exprTruthTable } from './expr-parser.js';
import { varNames } from './quine-mccluskey.js';
import { randomValues } from './random-function.js';
import { stepsOf } from './steps-ch4.js';
import { diagnose } from './ch4-help.js';
import { fail } from '@shared/logic/app-error.js';
import { pick, int } from '@shared/logic/shuffle.js';
import { parseIntSet, sameSet, setNote } from '@shared/logic/answer-format.js';

export const KINDS = ['analyze', 'ripple', 'addsub', 'overflow', 'bcdadd', 'compare', 'decoder', 'encoder', 'mux', 'muxRead'];

/** Nhóm dạng liền chủ đề (D30); nhãn: T(`c4q.${id}`). 'analyze' đứng riêng. */
export const GROUPS = [
  { id: 'g-adder', kinds: ['ripple', 'addsub', 'overflow', 'bcdadd'] },
  { id: 'g-msi', kinds: ['compare', 'decoder', 'encoder', 'mux', 'muxRead'] },
];

export const SECONDS = {
  analyze: 150, ripple: 60, addsub: 90, overflow: 60, bcdadd: 75,
  compare: 45, decoder: 60, encoder: 30, mux: 120, muxRead: 60,
};

const b4 = v => v.toString(2).padStart(4, '0');
const spec = list => list.join(', ');
const ones = tt => tt.flatMap((v, m) => (v ? [m] : []));
const sub = k => '₀₁₂₃₄₅₆₇'[k];

/** Mạch hai tầng cổng bất kỳ (§4.3): hai cổng đầu ra T₁, T₂ gom vào cổng ra F (có thể thêm một literal). */
function makeAnalyze(rnd) {
  const names = varNames(3);
  const lit = v => v + (rnd() < 0.35 ? "'" : '');
  const pair = () => { const [a, b] = [...names].sort(() => rnd() - 0.5); return [lit(a), lit(b)]; };
  for (;;) {
    const gates = [{ op: pick(GATE_OPS, rnd), ins: pair() }, { op: pick(GATE_OPS, rnd), ins: pair() }];
    gates.push({ op: pick(GATE_OPS, rnd), ins: rnd() < 0.4 ? ['T1', 'T2', lit(pick(names, rnd))] : ['T1', 'T2'] });
    const [t1, t2, f] = evalNet(gates, names).map(c => c.join(''));
    if (/^(0+|1+)$/.test(f) || f === t1 || f === t2) continue;     // F hằng hoặc trùng một cổng trong: mạch vô vị
    return {
      kind: 'analyze', format: 'text',
      textKey: 'c4q.qAnalyze', textParams: {},
      answer: f,
      figure: { type: 'net', gates },
      input: { type: 'truth', vars: names, mode: 'column' },
      hintKey: 'c4q.hAnalyze',
      explainKey: 'c4q.xAnalyze', explainParams: { f: gateExpr(gates[2]), answer: f },
      meta: { gates },
    };
  }
}

/** Bộ cộng nối tiếp 4 bit (§4.5): các carry C₄C₃C₂C₁. */
function makeRipple(rnd) {
  for (;;) {
    const a = int(1, 15, rnd), b = int(1, 15, rnd);
    const r = rippleAdd(a, b, 0);
    const answer = r.carries.slice(1).reverse().join('');
    if (answer.split('1').length - 1 < 2) continue;               // ít nhất 2 carry = 1 ⇒ có chuỗi lan
    return {
      kind: 'ripple', format: 'text',
      textKey: 'c4q.qRipple', textParams: { a: b4(a), b: b4(b) },
      answer, input: { type: 'bits', length: 4 },
      hintKey: 'c4q.hRipple',
      explainKey: 'c4q.xRipple', explainParams: { answer, sum: r.sum },
      meta: { a, b },
    };
  }
}

/** Bộ cộng–trừ 4 bit (§4.5, ngõ M): ra C₄ S₃S₂S₁S₀. */
function makeAddSub(rnd) {
  const m = rnd() < 0.65 ? 1 : 0;
  const a = int(0, 15, rnd), b = int(1, 15, rnd);
  const r = addSub(a, b, m);
  const answer = r.cout + r.sum;
  return {
    kind: 'addsub', format: 'text',
    textKey: 'c4q.qAddSub', textParams: { a: b4(a), b: b4(b), m },
    answer, input: { type: 'bits', length: 5 },
    hintKey: 'c4q.hAddSub',
    explainKey: 'c4q.xAddSub', explainParams: { bx: r.bx, answer },
    meta: { a, b, m },
  };
}

/** Tràn số khi cộng/trừ số có dấu bù 2 (§4.5): V = C₄ ⊕ C₃. Có tràn / không tràn chia đều. */
function makeOverflow(rnd) {
  const want = rnd() < 0.5 ? 1 : 0;
  for (;;) {
    const m = rnd() < 0.5 ? 1 : 0;
    const a = int(0, 15, rnd), b = int(0, 15, rnd);
    const r = addSub(a, b, m);
    if (r.v !== want) continue;
    const exact = m ? signedOf(a) - signedOf(b) : signedOf(a) + signedOf(b);
    return {
      kind: 'overflow', format: 'choice',
      textKey: 'c4q.qOverflow', textParams: { a: b4(a), b: b4(b), op: m ? '−' : '+' },
      choices: ['c4q.noOv', 'c4q.yesOv'], answer: r.v,
      hintKey: 'c4q.hOverflow',
      explainKey: 'c4q.xOverflow', explainParams: { c4: r.carries[4], c3: r.carries[3], v: r.v, exact },
      meta: { a, b, m },
    };
  }
}

/** Cộng hai chữ số BCD (§4.6): ra C S₈S₄S₂S₁. Khoảng 60% câu cần hiệu chỉnh +0110. */
function makeBcdAdd(rnd) {
  const wantFix = rnd() < 0.6;
  for (;;) {
    const a = int(0, 9, rnd), b = int(0, 9, rnd), cin = rnd() < 0.25 ? 1 : 0;
    const r = bcdAdd(a, b, cin);
    if (r.fix !== wantFix || a + b < 3) continue;
    const answer = r.cout + r.s;
    return {
      kind: 'bcdadd', format: 'text',
      textKey: 'c4q.qBcdAdd', textParams: { a: b4(a), b: b4(b), cin },
      answer, input: { type: 'bits', length: 5 },
      hintKey: 'c4q.hBcdAdd',
      explainKey: 'c4q.xBcdAdd', explainParams: { sum: a + b + cin, answer },
      meta: { a, b, cin },
    };
  }
}

/** So sánh độ lớn 4 bit (§4.8): các bit bằng nhau x₃x₂x₁x₀. */
function makeCompare(rnd) {
  const a = int(0, 15, rnd);
  let b = rnd() < 0.1 ? a : int(0, 15, rnd);
  if (b === a && rnd() < 0.5) b = a ^ 1;
  const c = compare(a, b);
  return {
    kind: 'compare', format: 'text',
    textKey: 'c4q.qCompare', textParams: { a: b4(a), b: b4(b) },
    answer: c.x, input: { type: 'bits', length: 4 },
    hintKey: 'c4q.hCompare',
    explainKey: 'c4q.xCompare', explainParams: { answer: c.x, out: c.gt ? 'A > B' : c.lt ? 'A < B' : 'A = B' },
    meta: { a, b },
  };
}

/** Decoder 3 → 8 + cổng OR (hoặc NOR ra F) thực hiện một hàm (§4.9): nối những ngõ ra D nào. */
function makeDecoder(rnd) {
  const expr = randomSop(3, rnd);
  const tt = exprTruthTable(expr, 3);
  const nor = rnd() < 0.4;
  const answer = nor ? tt.flatMap((v, m) => (v ? [] : [m])) : ones(tt);
  return {
    kind: 'decoder', format: 'set',
    textKey: nor ? 'c4q.qDecoderNor' : 'c4q.qDecoder', textParams: { expr },
    answer, answerText: `Σm(${spec(answer)})`,
    input: { type: 'numset', count: 8 },
    hintKey: nor ? 'c4q.hDecoderNor' : 'c4q.hDecoder',
    explainKey: nor ? 'c4q.xDecoderNor' : 'c4q.xDecoder', explainParams: { list: spec(answer), ones: spec(ones(tt)) },
    meta: { expr, nor },
  };
}

/** Bộ mã hoá ưu tiên 4 → 2 (§4.10, D₃ ưu tiên nhất): ra x y V. */
function makeEncoder(rnd) {
  const d = [0, 1, 2, 3].map(() => (rnd() < 0.45 ? 1 : 0));
  const e = priorityEncode(d);
  const answer = e.v ? `${e.x}${e.y}1` : '000';
  return {
    kind: 'encoder', format: 'text',
    textKey: 'c4q.qEncoder', textParams: { d3: d[3], d2: d[2], d1: d[1], d0: d[0] },
    answer, input: { type: 'bits', length: 3 },
    hintKey: 'c4q.hEncoder',
    explainKey: e.v ? 'c4q.xEncoder' : 'c4q.xEncoderNone', explainParams: { hi: e.hi, answer },
    meta: { d },
  };
}

/** Hàm n biến bằng MUX 2^(n−1) → 1 (§4.11): tìm các ngõ dữ liệu I_k ∈ 0, 1, z, z′. */
function makeMux(rnd) {
  const n = pick([3, 3, 4], rnd);
  const names = varNames(n), last = names[n - 1];
  for (;;) {
    const tt = randomValues(n, false, rnd);
    const ins = muxInputs(tt, last);
    if (!ins.some(s => s.startsWith(last)) || !ins.some(s => /^[01]$/.test(s))) continue;   // cần cả hằng lẫn biến
    return {
      kind: 'mux', format: 'text',
      textKey: 'c4q.qMux', textParams: { vars: names.join(', '), spec: spec(ones(tt)), sel: names.slice(0, -1).join(', '), size: ins.length, last },
      answer: ins.join(', '),
      input: { type: 'fields', labels: ins.map((_, k) => 'c4q.I' + k) },
      hintKey: 'c4q.hMux', hintParams: { last },
      explainKey: 'c4q.xMux', explainParams: { answer: ins.join(', ').replace(/'/g, '′') },
      meta: { n, tt, last },
    };
  }
}

/** Đọc ngược: MUX 4 → 1 với x, y ở ngõ chọn và các ngõ dữ liệu cho sẵn → F = Σm(…). */
function makeMuxRead(rnd) {
  for (;;) {
    const inputs = [0, 1, 2, 3].map(() => pick(['0', '1', 'z', "z'"], rnd));
    if (!inputs.some(s => s.startsWith('z')) || new Set(inputs).size < 3) continue;
    const answer = ones(muxOutput(inputs));
    return {
      kind: 'muxRead', format: 'set',
      textKey: 'c4q.qMuxRead',
      textParams: { ins: inputs.map((s, k) => `I${sub(k)} = ${s.replace("'", '′')}`).join(', ') },
      answer, answerText: `Σm(${spec(answer)})`,
      input: { type: 'truth', vars: varNames(3), mode: 'rows', target: 1 },
      hintKey: 'c4q.hMuxRead',
      explainKey: 'c4q.xMuxRead', explainParams: { list: spec(answer) },
      meta: { inputs },
    };
  }
}

const MAKERS = {
  analyze: makeAnalyze, ripple: makeRipple, addsub: makeAddSub, overflow: makeOverflow, bcdadd: makeBcdAdd,
  compare: makeCompare, decoder: makeDecoder, encoder: makeEncoder, mux: makeMux, muxRead: makeMuxRead,
};

export function makeQuestion(kind = 'mix', rnd = Math.random) {
  const k = kind === 'mix' ? pick(KINDS, rnd) : kind;
  const make = MAKERS[k];
  if (!make) fail('err.badQuizKind', { kind });
  const q = make(rnd);
  q.formatKey ??= `c4q.f_${k}`;          // dòng hướng dẫn cách trả lời (hiện dưới đề)
  q.work = stepsOf(q);                   // lời giải từng bước — hiện sau mỗi câu, đúng hay sai
  return q;
}

/** Ngõ dữ liệu MUX người học gõ: "z', 1, 0, z" hoặc từ widget "z' … 1 … 0 … z". */
function checkMux(q, given) {
  const { last } = q.meta;
  const toks = String(given).split(/[…,;]/).map(s => s.replace(/\s+/g, '').replace(/[′’`]/g, "'").toLowerCase());
  const size = q.meta.tt.length / 2;
  if (toks.length !== size || !toks.every(s => ['0', '1', last, last + "'"].includes(s))) {
    return { retry: true, detailKey: 'c4q.needMux', detailParams: { size, last } };
  }
  const want = q.answer.split(', ');
  const bad = toks.flatMap((s, k) => (s === want[k] ? [] : ['I' + sub(k)]));
  if (!bad.length) return { ok: true };
  const d = diagnose(q, toks.join(', '));
  return { ok: false, ...(d.detailKey ? d : { detailKey: 'c4q.wrongI', detailParams: { list: bad.join(', ') } }) };
}

export function checkAnswer(q, given) {
  if (q.format === 'choice') return { ok: Number(given) === q.answer };
  if (q.format === 'set') {
    const list = parseIntSet(given);
    if (!list) return { retry: true, detailKey: 'run.needList' };
    if (sameSet(list, q.answer)) return { ok: true };
    const d = diagnose(q, `Σm(${spec(list)})`);
    return { ok: false, ...(d.detailKey ? d : setNote(list, q.answer)) };
  }
  if (q.kind === 'mux') return checkMux(q, given);
  const bits = String(given).replace(/\s+/g, '');
  if (bits.length !== q.answer.length || !/^[01]+$/.test(bits)) return { retry: true, detailKey: 'c2q.needBits', detailParams: { n: q.answer.length } };
  if (q.kind === 'encoder' && q.answer === '000') return bits.endsWith('0') ? { ok: true } : { ok: false, detailKey: 'c4q.dValid' };   // V = 0 ⇒ x y tuỳ ý
  return bits === q.answer ? { ok: true } : { ok: false, ...diagnose(q, bits) };
}

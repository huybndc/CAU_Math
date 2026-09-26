/* ---------------------------------------------------------------
   SINH & CHẤM ĐỀ CHƯƠNG 2 — Đại số Boolean & cổng logic (Mano §2.2–2.8).
   Câu biểu thức chấm theo BẢNG CHÂN TRỊ: viết khác mà tương đương vẫn đúng.
   Thuần, không đụng DOM, không biết ngôn ngữ.
   --------------------------------------------------------------- */

import { GATE_NAMES, gateBits, gateSymbol } from './logic-gates.js';
import { sopToNand } from './nand-conversion.js';
import { complementByDeMorgan } from './boolean-complement.js';
import { exprTruthTable, countLiterals } from './expr-parser.js';
import { dual } from './boolean-algebra.js';
import { minimizeSOP, totalLiterals, varNames } from './quine-mccluskey.js';
import { diagnose } from './ch2-help.js';
import { stepsOf } from './steps-ch2.js';
import { fail } from '@shared/logic/app-error.js';
import { pick, int, shuffle } from '@shared/logic/shuffle.js';
import { parseIntSet, sameSet, sameBits } from '@shared/logic/answer-format.js';

export const KINDS = ['identify', 'gate', 'column', 'circuit', 'minterms', 'maxterms', 'canon',
  'complement', 'dual', 'simplify', 'nand'];

/** Nhóm dạng liền chủ đề — mục Luyện tập hiện theo nhóm cho gọn (D30); nhãn: T(`${prefix}.${id}`). */
export const GROUPS = [
  { id: 'g-algebra', kinds: ['dual', 'complement', 'simplify'] },
  { id: 'g-table', kinds: ['column', 'minterms', 'maxterms', 'canon'] },
  { id: 'g-gates', kinds: ['identify', 'gate', 'circuit', 'nand'] },
];

/** Thời gian chuẩn (giây) để làm một câu mỗi dạng. */
export const SECONDS = {
  identify: 25, gate: 30, column: 60, circuit: 90, minterms: 60, maxterms: 60, canon: 40,
  complement: 90, dual: 60, simplify: 150, nand: 120,
};

/* Dạng trả lời bằng cả cột F (chuỗi bit) — chấm như nhau. */
const COLUMN = new Set(['gate', 'column', 'circuit']);

const gateOf = rnd => ({ name: pick(GATE_NAMES, rnd), n: pick([2, 3], rnd) });   // 6 cổng × 2/3 ngõ vào = 12 câu khác nhau
const spec = list => list.join(', ');

/**
 * Biểu thức SOP ngẫu nhiên, chưa tối giản, theo ký hiệu Mano (x′ viết x').
 * Tránh hàm hằng (luôn 0 hoặc luôn 1) vì hỏi minterm/bù của nó vô nghĩa.
 */
export function randomSop(n, rnd) {
  const names = varNames(n);
  for (;;) {
    const terms = new Set();
    const count = int(2, 3, rnd);
    while (terms.size < count) {
      const vars = shuffle(names, rnd).slice(0, int(1, Math.min(3, n - 1), rnd)).sort();
      terms.add(vars.map(v => v + (rnd() < 0.45 ? "'" : '')).join(''));
    }
    const expr = [...terms].join(' + ');
    const tt = exprTruthTable(expr, n);
    if (tt.includes(0) && tt.includes(1)) return expr;
  }
}

const ones = tt => tt.flatMap((v, m) => (v === 1 ? [m] : []));
const zeros = tt => tt.flatMap((v, m) => (v === 0 ? [m] : []));

/** Bảng chân trị → nhận ra cổng (§2.8). Cổng 2 hoặc 3 ngõ vào. */
function makeIdentify(rnd) {
  const { name, n } = gateOf(rnd);
  const others = shuffle(GATE_NAMES.filter(g => g !== name), rnd).slice(0, 3);
  const order = shuffle([name, ...others], rnd);
  const choices = order.map(g => ({ label: g, figure: { type: 'gate', gate: g, n } }));
  const bits = gateBits(name, n);
  return {
    kind: 'identify', format: 'choice',
    textKey: 'c2q.qIdentify', textParams: { n },
    choices, answer: order.indexOf(name),
    figure: { type: 'truth', vars: varNames(n), out: 'F', rows: [...bits].map((f, m) => [...m.toString(2).padStart(n, '0'), f]) },
    hintKey: 'c2q.hIdentify', hintParams: { rule: 'c2q.rule' + name },
    explainKey: 'c2q.xIdentify', explainParams: { gate: name, rule: 'c2q.rule' + name, bits, symbol: gateSymbol(name, n) },
    meta: { gate: name, n, bits },
  };
}

/** Ký hiệu cổng → điền bảng chân trị (§2.8, Fig. 2.5). Cổng 2 hoặc 3 ngõ vào. */
function makeGate(rnd) {
  const { name, n } = gateOf(rnd);
  const bits = gateBits(name, n);
  return {
    kind: 'gate', format: 'text',
    textKey: 'c2q.qGate', textParams: { n },
    answer: bits,
    figure: { type: 'gate', gate: name, n },
    input: { type: 'truth', vars: varNames(n), mode: 'column' },
    hintKey: 'c2q.hGate', hintParams: { gate: name, rule: 'c2q.rule' + name },
    explainKey: 'c2q.xIdentify', explainParams: { gate: name, rule: 'c2q.rule' + name, bits, symbol: gateSymbol(name, n) },
    meta: { gate: name, n },
  };
}

/** Mạch AND–OR hai mức → bảng chân trị (§2.4 "logic circuit ↔ Boolean function"). */
function makeCircuit(rnd) {
  const n = 3;
  // ít nhất 2 cổng AND — mạch chỉ có một cổng OR thì chẳng còn gì để đọc
  let expr;
  do expr = randomSop(n, rnd); while (expr.split(' + ').filter(t => t.replace(/'/g, '').length > 1).length < 2);
  const answer = exprTruthTable(expr, n).join('');
  return {
    kind: 'circuit', format: 'text',
    textKey: 'c2q.qCircuit', textParams: {},
    answer,
    figure: { type: 'circuit', terms: expr.split(' + ').map(t => t.match(/[a-z]'?/g)) },
    input: { type: 'truth', vars: varNames(n), mode: 'column' },
    hintKey: 'c2q.hCircuit',
    explainKey: 'c2q.xCircuit', explainParams: { expr, ones: spec(ones([...answer].map(Number))), answer },
    meta: { expr, n },
  };
}

/** Điền cột F của bảng chân trị (§2.4). */
function makeColumn(rnd) {
  const n = 3;
  const expr = randomSop(n, rnd);
  const answer = exprTruthTable(expr, n).join('');
  return {
    kind: 'column', format: 'text',
    textKey: 'c2q.qColumn', textParams: { expr },
    answer, input: { type: 'truth', vars: varNames(n), mode: 'column' },
    hintKey: 'c2q.hColumn',
    explainKey: 'c2q.xColumn', explainParams: { expr, ones: spec(ones([...answer].map(Number))), answer },
    meta: { expr, n },
  };
}

/** Biểu thức → danh sách minterm (§2.6). */
function makeMinterms(rnd) {
  const n = pick([3, 3, 4], rnd);
  const expr = randomSop(n, rnd);
  const list = ones(exprTruthTable(expr, n));
  return {
    kind: 'minterms', format: 'set',
    textKey: 'c2q.qMinterms', textParams: { expr, vars: varNames(n).join(', ') },
    answer: list, answerText: `Σm(${spec(list)})`,
    input: { type: 'truth', vars: varNames(n), mode: 'rows', target: 1 },
    hintKey: 'c2q.hMinterms',
    explainKey: 'c2q.xMinterms', explainParams: { expr, list: spec(list) },
    meta: { expr, n },
  };
}

/** Biểu thức → danh sách maxterm (§2.6). */
function makeMaxterms(rnd) {
  const n = 3;
  const expr = randomSop(n, rnd);
  const list = zeros(exprTruthTable(expr, n));
  return {
    kind: 'maxterms', format: 'set',
    textKey: 'c2q.qMaxterms', textParams: { expr, vars: varNames(n).join(', ') },
    answer: list, answerText: `ΠM(${spec(list)})`,
    input: { type: 'truth', vars: varNames(n), mode: 'rows', target: 0 },
    hintKey: 'c2q.hMaxterms',
    explainKey: 'c2q.xMaxterms', explainParams: { expr, list: spec(list) },
    meta: { expr, n },
  };
}

/** Chuyển dạng chuẩn: Σm(...) → ΠM(...) (§2.6, "conversion between canonical forms"). */
function makeCanon(rnd) {
  const n = pick([3, 4], rnd);
  const size = 1 << n;
  const all = [...Array(size).keys()];
  const list = shuffle(all, rnd).slice(0, int(2, size - 2, rnd)).sort((a, b) => a - b);
  const rest = all.filter(m => !list.includes(m));
  return {
    kind: 'canon', format: 'set',
    textKey: 'c2q.qCanon', textParams: { list: spec(list), vars: varNames(n).join(', ') },
    answer: rest, answerText: `ΠM(${spec(rest)})`,
    input: { type: 'numset', count: size },
    hintKey: 'c2q.hCanon', hintParams: { max: size - 1 },
    explainKey: 'c2q.xCanon', explainParams: { max: size - 1, rest: spec(rest) },
    meta: { list, n },
  };
}

/** Hàm bù bằng DeMorgan (§2.5). */
function makeComplement(rnd) {
  const n = 3;
  const expr = randomSop(n, rnd);
  const r = complementByDeMorgan(expr, n);
  return {
    kind: 'complement', format: 'text',
    textKey: 'c2q.qComplement', textParams: { expr },
    answer: r.result, target: { expr, negate: true },
    hintKey: 'c2q.hComplement',
    explainKey: 'c2q.xComplement', explainParams: { expr, answer: r.result },
    meta: { expr, n, result: r.result },
  };
}

/** Dual của biểu thức (§2.3). */
function makeDual(rnd) {
  const n = 3;
  const expr = randomSop(n, rnd);
  const answer = dual(expr, n);
  return {
    kind: 'dual', format: 'text',
    textKey: 'c2q.qDual', textParams: { expr },
    answer, target: { expr: answer },
    hintKey: 'c2q.hDual',
    explainKey: 'c2q.xDual', explainParams: { expr, answer },
    meta: { expr, n },
  };
}

/** Rút gọn một tổng các minterm về SOP ít literal nhất (§2.4, Example 2.1–2.2). */
function makeSimplify(rnd) {
  const n = 3;
  const values = new Array(8).fill(0);
  const list = shuffle([...Array(8).keys()], rnd).slice(0, int(3, 5, rnd)).sort((a, b) => a - b);
  list.forEach(m => { values[m] = 1; });
  const names = varNames(n);
  const canon = list.map(m => names.map((v, i) => v + ((m >> (n - 1 - i)) & 1 ? '' : "'")).join('')).join(' + ');
  const best = minimizeSOP(values, n);
  return {
    kind: 'simplify', format: 'text',
    textKey: 'c2q.qSimplify', textParams: { expr: canon },
    answer: best.expr, target: { expr: canon, literals: totalLiterals(best.terms, n), values },
    hintKey: 'c2q.hSimplify',
    explainKey: 'c2q.xSimplify', explainParams: { answer: best.expr, lit: totalLiterals(best.terms, n) },
    meta: { list, n },
  };
}

/** SOP → mạch toàn NAND (§2.8, Fig. 2.7c). */
function makeNand(rnd) {
  const n = pick([3, 4], rnd);
  const expr = randomSop(n, rnd);                 // SOP ngẫu nhiên 2–3 term (hàng chục câu khác nhau)
  const r = sopToNand(expr, n);
  return {
    kind: 'nand', format: 'text',
    textKey: 'c2q.qNand', textParams: { expr },
    answer: r.result, target: { expr },
    hintKey: 'c2q.hNand', hintParams: { n: r.gateCount.level1 },
    explainKey: 'c2q.xNand', explainParams: { expr, answer: r.result, n: r.gateCount.level1 },
    meta: { expr, n, result: r.result },
  };
}

const MAKERS = {
  identify: makeIdentify, gate: makeGate, circuit: makeCircuit, column: makeColumn, minterms: makeMinterms, maxterms: makeMaxterms,
  canon: makeCanon, complement: makeComplement, dual: makeDual, simplify: makeSimplify, nand: makeNand,
};

export function makeQuestion(kind = 'mix', rnd = Math.random) {
  const k = kind === 'mix' ? pick(KINDS, rnd) : kind;
  const make = MAKERS[k];
  if (!make) fail('err.badQuizKind', { kind });
  const q = make(rnd);
  q.formatKey ??= `c2q.f_${k}`;
  q.work = stepsOf(q);                  // lời giải từng bước — hiện sau mỗi câu, đúng hay sai          // khoá dòng hướng dẫn cách trả lời (hiện dưới đề)
  return q;
}

/** Bảng chân trị của đáp án; sai cú pháp thì báo lỗi để người học sửa (chưa tính là sai). */
function truthOf(given, n) {
  try {
    return { tt: exprTruthTable(String(given), n) };
  } catch (e) {
    return { err: { retry: true, detailKey: e.key || 'c2q.parseFail', detailParams: e.params || {} } };
  }
}

/** Chấm đúng/sai; câu sai thì kèm chẩn đoán chỗ sai (ch2-help.js). */
export function checkAnswer(q, given) {
  const { ctx, ...r } = grade(q, given);
  return r.ok || r.retry || r.detailKey ? r : { ...r, ...diagnose(q, given, ctx) };
}

function grade(q, given) {
  const n = q.meta.n;
  switch (q.format) {
    case 'choice': return { ok: Number(given) === q.answer };
    case 'set': {
      const list = parseIntSet(given);
      if (!list) return { retry: true, detailKey: 'run.needList' };
      return { ok: sameSet(list, q.answer), ctx: { list } };
    }
    default: break;
  }
  if (COLUMN.has(q.kind)) {
    const bits = String(given).replace(/\s+/g, '');
    if (bits.length !== q.answer.length || !/^[01]+$/.test(bits)) return { retry: true, detailKey: 'c2q.needBits', detailParams: { n: q.answer.length } };
    return { ok: sameBits(bits, q.answer), ctx: { bits } };
  }
  const got = truthOf(given, n);
  if (got.err) return got.err;
  // chấm HÌNH THỨC trước: chép lại đề (NAND) hay chỉ bọc ' ngoài ngoặc (bù) cũng cho đúng bảng chân trị
  const g = String(given);
  if (q.kind === 'nand' && /[+|∨]/.test(g)) return { ok: false, detailKey: 'c2q.nandNoOr' };
  if (q.kind === 'complement' && /\)\s*['’`]|[!~¬]\s*\(/.test(g)) return { ok: false, detailKey: 'c2q.pushNot' };
  const want = exprTruthTable(q.target.expr, n).map(v => (q.target.negate ? 1 - v : v));
  const same = got.tt.every((v, m) => v === want[m]);
  if (!same) return { ok: false, ctx: { tt: got.tt, want } };
  if (q.kind === 'simplify') {
    const lit = countLiterals(given, n);
    if (lit > q.target.literals) return { ok: false, detailKey: 'c2q.notMinimal', detailParams: { lit, best: q.target.literals } };
  }
  return { ok: true };
}

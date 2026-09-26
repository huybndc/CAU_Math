/* ---------------------------------------------------------------
   SINH & CHẤM ĐỀ CHƯƠNG 1 — Vector (Strang §1.1–1.3). Thuần, không biết ngôn ngữ.
   Mỗi câu: đề (khoá + tham số), đáp án số/vector, lời giải từng bước `work`,
   và `mistakes` = đáp án sai hay gặp (chẩn đoán + nhiễu trắc nghiệm) — quiz-kit.js.
   --------------------------------------------------------------- */

import { fmt, fmtVec, clean } from './num-format.js';
import { norm } from './vector.js';
import { line as L } from '@shared/logic/steps.js';
import {
  pick, int, mistake, makeWith, checkAnswer as check, dotv, sum, P, col, elimLines,
} from './quiz-kit.js';

export const KINDS = ['combine', 'dot', 'length', 'unit', 'angle', 'perp', 'matvec', 'coefs'];

/** Nhóm dạng liền chủ đề — mục Luyện tập hiện theo nhóm cho gọn (D30); nhãn: T(`${prefix}.${id}`). */
export const GROUPS = [
  { id: 'g-vec', kinds: ['combine', 'length', 'unit'] },
  { id: 'g-dot', kinds: ['dot', 'angle', 'perp'] },
  { id: 'g-comb', kinds: ['matvec', 'coefs'] },
];

/** Giây chuẩn cho một câu mỗi dạng — "~M phút" và dựng bài full. */
export const SECONDS = { combine: 45, dot: 40, length: 45, unit: 60, angle: 90, perp: 60, matvec: 60, coefs: 120 };


/** Vector toạ độ nguyên, khác 0. */
function randVec(rnd, dim, lo = -4, hi = 4) {
  for (;;) {
    const v = Array.from({ length: dim }, () => int(lo, hi, rnd));
    if (v.some(x => x !== 0)) return v;
  }
}
/** "3v", "−w", "v" — hạng tử k·tên. */
const term = (k, name) => (k === 1 ? name : k === -1 ? `-${name}` : `${fmt(k)}${name}`);
const expr2 = (c, d) => `${term(c, 'v')} ${d < 0 ? '-' : '+'} ${term(Math.abs(d), 'w')}`;
const sq = v => v.map(x => `${P(x)}²`).join(' + ');
/** √S đẹp: số nguyên nếu S chính phương. */
const root = S => (Number.isInteger(Math.sqrt(S)) ? String(Math.sqrt(S)) : `√${S}`);

/** §1.1 Tổ hợp tuyến tính cv + dw. */
function makeCombine(rnd) {
  const dim = pick([2, 3], rnd);
  const v = randVec(rnd, dim), w = randVec(rnd, dim);
  const c = pick([-3, -2, 2, 3], rnd), d = pick([-2, -1, 1, 2, 3], rnd);
  const cv = v.map(x => c * x), dw = w.map(x => d * x);
  const answer = cv.map((x, i) => x + dw[i]);
  const e = expr2(c, d);
  const mistakes = [
    mistake(cv.map((x, i) => x - dw[i]), 'c1q.dSign'),
    d !== 1 && mistake(cv.map((x, i) => x + w[i]), 'c1q.dScale', { k: d, name: 'w' }),
    mistake(v.map((x, i) => x + dw[i]), 'c1q.dScale', { k: c, name: 'v' }),
    c !== d && mistake(v.map((x, i) => d * x + c * w[i]), 'c1q.dSwap'),
  ].filter(Boolean);
  return {
    textKey: 'c1q.qCombine', textParams: { v: fmtVec(v), w: fmtVec(w), e },
    answer, hintKey: 'c1q.hCombine', meta: { v, w, c, d },
    work: [
      `${term(c, 'v')} = ${fmtVec(cv)}`,
      `${term(d, 'w')} = ${fmtVec(dw)}`,
      `${e} = (${cv.map((x, i) => `${fmt(x)} + ${P(dw[i])}`).join(', ')}) = ${fmtVec(answer)}`,
    ],
    mistakes,
  };
}

/** §1.2 Tích vô hướng. */
function makeDot(rnd) {
  const dim = pick([2, 3, 3], rnd);
  const v = randVec(rnd, dim), w = randVec(rnd, dim);
  const prods = v.map((x, i) => x * w[i]);
  const answer = sum(prods);
  return {
    textKey: 'c1q.qDot', textParams: { v: fmtVec(v), w: fmtVec(w) },
    answer, hintKey: 'c1q.hDot', meta: { v, w },
    work: [
      L('c1q.sDot'),
      `v·w = ${v.map((x, i) => `${P(x)}·${P(w[i])}`).join(' + ')}`,
      `= ${prods.map(P).join(' + ')} = ${answer}`,
    ],
    mistakes: [
      mistake(sum(prods.map(Math.abs)), 'c1q.dAbs'),
      dim === 2 && mistake(v[0] * w[1] + v[1] * w[0], 'c1q.dCross'),
      mistake(sum(v) + sum(w), 'c1q.dAdd'),
    ].filter(Boolean),
  };
}

const TRIPLES = [[3, 4], [6, 8], [5, 12], [8, 6], [1, 2, 2], [2, 3, 6], [1, 4, 8], [2, 6, 9], [4, 4, 7], [2, 1, 2]];
/** Bộ số có độ dài nguyên, đổi dấu + hoán vị ngẫu nhiên. */
function niceVec(rnd) {
  const t = pick(TRIPLES, rnd).map(x => x * pick([1, -1], rnd));
  return rnd() < 0.5 ? t : t.reverse();
}

/** §1.2 Độ dài. */
function makeLength(rnd) {
  const v = rnd() < 0.5 ? niceVec(rnd) : randVec(rnd, pick([2, 3], rnd));
  const S = sum(v.map(x => x * x));
  const answer = norm(v);
  const exact = Number.isInteger(answer);
  return {
    textKey: 'c1q.qLength', textParams: { v: fmtVec(v) },
    answer, tol: exact ? 1e-6 : 0.01, answerText: exact ? fmt(answer) : `√${S} ≈ ${answer.toFixed(3)}`,
    hintKey: 'c1q.hLength', meta: { v },
    work: [`‖v‖² = ${sq(v)} = ${S}`, `‖v‖ = √${S}${exact ? ` = ${answer}` : ` ≈ ${answer.toFixed(3)}`}`],
    mistakes: [
      mistake(S, 'c1q.dNoRoot'),
      mistake(sum(v.map(Math.abs)), 'c1q.dAbsSum'),
      mistake(Math.abs(sum(v)), 'c1q.dSumFirst'),
    ],
  };
}

/** §1.2 Vector đơn vị cùng hướng v. */
function makeUnit(rnd) {
  const v = niceVec(rnd);
  const n = norm(v);
  const answer = v.map(x => clean(x / n));
  return {
    textKey: 'c1q.qUnit', textParams: { v: fmtVec(v) },
    answer, tol: 0.005, hintKey: 'c1q.hUnit', meta: { v },
    work: [`‖v‖ = √(${sq(v)}) = √${n * n} = ${n}`, `u = v/‖v‖ = (${v.map(x => `${fmt(x)}/${n}`).join(', ')}) = ${fmtVec(answer)}`, L('c1q.sUnitCheck')],
    mistakes: [
      mistake(v.map(x => clean(x / (n * n))), 'c1q.dSquare'),
      mistake(v, 'c1q.dNotUnit'),
      mistake(answer.map(x => -x), 'c1q.dOpp'),
    ],
  };
}

const COS = { 30: '√3/2', 45: '√2/2', 60: '1/2', 90: '0', 120: '-1/2', 135: '-√2/2', 150: '-√3/2' };
/** §1.2 Góc giữa hai vector — chỉ ra cặp có góc "đẹp" để tính tay được như đề thi. */
function makeAngle(rnd) {
  let v, w, deg;
  for (let g = 0; g < 4000; g++) {
    const dim = rnd() < 0.6 ? 2 : 3;
    v = randVec(rnd, dim, -3, 3);
    w = randVec(rnd, dim, -3, 3);
    const c = dotv(v, w) / (norm(v) * norm(w));
    const a = Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI;
    deg = Math.round(a);
    if (Math.abs(a - deg) < 1e-6 && COS[deg] !== undefined) break;
    [v, w, deg] = [[1, 0], [1, 1], 45];                         // dự phòng (gần như không xảy ra)
  }
  const d = dotv(v, w);
  const S1 = sum(v.map(x => x * x)), S2 = sum(w.map(x => x * x));
  return {
    textKey: 'c1q.qAngle', textParams: { v: fmtVec(v), w: fmtVec(w) },
    answer: deg, tol: 0.5, hintKey: 'c1q.hAngle', meta: { v, w },
    work: [
      `v·w = ${v.map((x, i) => `${P(x)}·${P(w[i])}`).join(' + ')} = ${d}`,
      `‖v‖ = ${root(S1)},  ‖w‖ = ${root(S2)}`,
      `cos θ = ${d} / (${root(S1)}·${root(S2)}) = ${COS[deg]}`,
      L('c1q.sAngle', { deg }, `θ = ${deg}°`),
    ],
    mistakes: [
      deg !== 90 && mistake(180 - deg, 'c1q.dSupp'),
      (deg === 30 || deg === 60) && mistake(90 - deg, 'c1q.dSin'),
    ].filter(Boolean),
  };
}

/** §1.2 Tìm c để hai vector vuông góc. */
function makePerp(rnd) {
  const dim = pick([2, 3, 3], rnd);
  const k = int(0, dim - 1, rnd);
  const w = randVec(rnd, dim);
  w[k] = pick([1, -1, 2, -2, 3], rnd);
  const v = randVec(rnd, dim);
  v[k] = 0;
  const S = dotv(v, w);
  const answer = clean(-S / w[k]);
  const vText = '(' + v.map((x, i) => (i === k ? 'c' : fmt(x))).join(', ') + ')';
  const rest = v.map((x, i) => (i === k ? `${P(w[i])}c` : `${P(x)}·${P(w[i])}`)).join(' + ');
  return {
    textKey: 'c1q.qPerp', textParams: { v: vText, w: fmtVec(w) },
    answer, hintKey: 'c1q.hPerp', meta: { v, w, k },
    work: [L('c1q.sPerp', {}, `v·w = ${rest} = 0`), `${S} + ${P(w[k])}c = 0`, `c = ${fmt(-S)}/${P(w[k])} = ${fmt(answer)}`],
    mistakes: [
      answer !== 0 && mistake(-answer, 'c1q.dSignC'),
      Math.abs(w[k]) !== 1 && mistake(-S, 'c1q.dDivide', { k: w[k] }),
    ].filter(Boolean),
  };
}

/** §1.3 Ax = tổ hợp các cột của A. */
function makeMatVec(rnd) {
  const [m, n] = pick([[2, 2], [3, 3], [3, 2], [2, 3]], rnd);
  const A = Array.from({ length: m }, () => Array.from({ length: n }, () => int(-3, 3, rnd)));
  const x = randVec(rnd, n, -2, 3);
  const cols = [...Array(n).keys()].map(j => col(A, j));
  const answer = A.map(r => dotv(r, x));
  const AT = m === n ? A[0].map((_, j) => A.map(r => r[j])) : null;
  return {
    textKey: 'c1q.qMatVec', textParams: {},
    figure: { type: 'mats', items: [['A', A], ['x', x]] },
    answer, hintKey: 'c1q.hMatVec', meta: { A, x },
    work: [
      L('c1q.sCols', {}, `Ax = ${cols.map((c, j) => `${P(x[j])}·${fmtVec(c)}`).join(' + ')}`),
      `= ${cols.map((c, j) => fmtVec(c.map(y => y * x[j]))).join(' + ')} = ${fmtVec(answer)}`,
      L('c1q.sRowsCheck', { first: `${A[0].map((a, j) => `${P(a)}·${P(x[j])}`).join(' + ')} = ${answer[0]}` }),
    ],
    mistakes: [
      AT && mistake(AT.map(r => dotv(r, x)), 'c1q.dTrans'),
      mistake(A.map(r => sum(r)), 'c1q.dNoWeight'),
    ].filter(Boolean),
  };
}

/** §1.3 Tìm c, d để cv + dw = b (hệ 2×2 viết dưới dạng cột). */
function makeCoefs(rnd) {
  let v, w;
  do { v = randVec(rnd, 2, -3, 3); w = randVec(rnd, 2, -3, 3); } while (![1, 2, 3].includes(Math.abs(v[0] * w[1] - v[1] * w[0])));
  const c = int(-3, 3, rnd), d = pick([-2, -1, 1, 2, 3], rnd);
  const b = v.map((x, i) => c * x + d * w[i]);
  return {
    textKey: 'c1q.qCoefs', textParams: { v: fmtVec(v), w: fmtVec(w), b: fmtVec(b) },
    answer: [c, d], hintKey: 'c1q.hCoefs', meta: { v, w, b },
    work: [
      L('c1q.sCoefsSys', {}, `${fmt(v[0])}c + ${P(w[0])}d = ${b[0]},   ${fmt(v[1])}c + ${P(w[1])}d = ${b[1]}`),
      ...elimLines([[v[0], w[0]], [v[1], w[1]]], b),
      `c = ${c}, d = ${d}`,
    ],
    mistakes: [c !== d && mistake([d, c], 'c1q.dOrder')].filter(Boolean),
  };
}

const MAKERS = {
  combine: makeCombine, dot: makeDot, length: makeLength, unit: makeUnit,
  angle: makeAngle, perp: makePerp, matvec: makeMatVec, coefs: makeCoefs,
};

export const makeQuestion = makeWith(MAKERS, KINDS, 'c1q');
export const checkAnswer = check;

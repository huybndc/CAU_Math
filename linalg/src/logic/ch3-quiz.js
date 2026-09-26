/* ---------------------------------------------------------------
   SINH & CHẤM ĐỀ CHƯƠNG 3 — Không gian vector & không gian con (Strang §3.1–3.6).
   Thuần, không biết ngôn ngữ. Đáp án luôn tính lại bằng subspace.js / linear-system.js,
   không tin vào ý định sinh đề. Hợp đồng câu: quiz-kit.js.
   --------------------------------------------------------------- */

import { fmtVec, clean } from './num-format.js';
import { matVec } from './matrix.js';
import { solve } from './linear-system.js';
import { isIndependent, spanKind, rankOf, matrixFromColumns } from './subspace.js';
import { parseNumbers } from './answer-check.js';
import { line as L } from '@shared/logic/steps.js';
import {
  pick, int, mistake, makeWith, checkAnswer as check, matMul, fmtMat, elimLines,
} from './quiz-kit.js';

export const KINDS = ['independent', 'spankind', 'inspan', 'rank', 'nulldim', 'special', 'particular', 'dims'];

/** Nhóm dạng liền chủ đề — mục Luyện tập hiện theo nhóm cho gọn (D30); nhãn: T(`${prefix}.${id}`). */
export const GROUPS = [
  { id: 'g-span', kinds: ['inspan', 'spankind', 'independent'] },
  { id: 'g-null', kinds: ['special', 'particular'] },
  { id: 'g-dim', kinds: ['rank', 'nulldim', 'dims'] },
];
export const SECONDS = {
  independent: 90, spankind: 90, inspan: 120, rank: 90, nulldim: 90, special: 150, particular: 150, dims: 120,
};
const SPAN_KINDS = ['point', 'line', 'plane', 'space'];

const zeros = n => new Array(n).fill(0);
const names = vs => vs.map((v, i) => `v${'₁₂₃₄'[i]} = ${fmtVec(v)}`).join(',  ');

function randVec(rnd, lo = -3, hi = 3) {
  for (;;) {
    const v = [int(lo, hi, rnd), int(lo, hi, rnd), int(lo, hi, rnd)];
    if (v.some(x => x !== 0)) return v;
  }
}
const combo = (vs, cs) => vs[0].map((_, i) => vs.reduce((s, v, k) => s + cs[k] * v[i], 0));

/** Bộ vector trong R³ theo ý muốn độc lập / phụ thuộc (vector cuối = tổ hợp các vector trước). */
function vectorSet(count, wantIndependent, rnd) {
  for (let g = 0; g < 80; g++) {
    const vs = Array.from({ length: count }, () => randVec(rnd));
    if (!wantIndependent && count >= 2) {
      const cs = Array.from({ length: count - 1 }, () => int(-2, 2, rnd));
      if (cs.every(c => c === 0)) cs[0] = 1;
      vs[count - 1] = combo(vs.slice(0, -1), cs);
      if (vs[count - 1].every(x => x === 0)) continue;
      if (vs.slice(0, -1).some(u => u.every((x, i) => x === vs[count - 1][i]))) continue;   // trùng hẳn: trông như gõ nhầm
    }
    if (isIndependent(vs) === wantIndependent) return vs;
  }
  return [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0]].slice(0, count);
}

/** Lời giải chung cho các câu "xếp vector thành cột rồi khử". */
const colSteps = (vs, b = zeros(3)) => [L('c3q.sCols', {}, `A = ${fmtMat(matrixFromColumns(vs))}`), ...elimLines(matrixFromColumns(vs), b).slice(1)];

/* ---------- §3.5 / §3.1: câu chọn ---------- */

function makeIndependent(rnd) {
  const count = pick([2, 3, 3, 4], rnd);
  const vs = vectorSet(count, count > 3 ? false : rnd() < 0.5, rnd);
  const r = rankOf(matrixFromColumns(vs));
  const ind = r === count;
  const why = { key: ind ? 'c3q.why_indep' : 'c3q.why_dep', params: { rank: r, count } };
  return {
    format: 'choice', choices: ['c3q.yes', 'c3q.no'], answer: ind ? 0 : 1,
    textKey: 'c3q.qIndependent', textParams: { vs: names(vs) }, hintKey: 'c3q.hIndependent', meta: { vs },
    work: [...colSteps(vs), L(why.key, why.params)], why,
  };
}

function makeSpanKind(rnd) {
  const count = pick([1, 2, 2, 3, 3], rnd);
  const vs = vectorSet(count, rnd() < 0.55, rnd);
  const kind = spanKind(vs);
  const r = rankOf(matrixFromColumns(vs));
  const why = { key: 'c3q.why_span', params: { rank: r, shape: `c3q.${kind}` } };
  return {
    format: 'choice', choices: SPAN_KINDS.map(k => `c3q.${k}`), answer: SPAN_KINDS.indexOf(kind),
    textKey: 'c3q.qSpanKind', textParams: { vs: names(vs) }, hintKey: 'c3q.hSpanKind', meta: { vs },
    work: [...colSteps(vs), L(why.key, why.params)], why,
  };
}

function makeInSpan(rnd) {
  const vs = vectorSet(pick([1, 2, 2], rnd), true, rnd);
  const b = rnd() < 0.5 ? combo(vs, vs.map(() => int(-2, 2, rnd))) : randVec(rnd, -4, 4);
  const r = solve(matrixFromColumns(vs), b);
  const yes = r.type !== 'none';
  const why = { key: yes ? 'c3q.why_in' : 'c3q.why_out', params: { c: yes ? fmtVec(r.particular) : '' } };
  return {
    format: 'choice', choices: ['c3q.yes', 'c3q.no'], answer: yes ? 0 : 1,
    textKey: 'c3q.qInSpan', textParams: { vs: names(vs), b: fmtVec(b) }, hintKey: 'c3q.hInSpan', meta: { vs, b },
    work: [...colSteps(vs, b), L(why.key, why.params)], why,
  };
}

/* ---------- §3.2–3.3, 3.6: hạng và số chiều ---------- */

/** Ma trận m×n hạng đúng r = (m×r)·(r×n) nguyên nhỏ. */
function rankMatrix(m, n, r, rnd) {
  for (;;) {
    const B = Array.from({ length: m }, () => Array.from({ length: r }, () => int(-2, 2, rnd)));
    const C = Array.from({ length: r }, () => Array.from({ length: n }, () => int(-2, 2, rnd)));
    const A = matMul(B, C);
    if (rankOf(A) === r && A.every(row => row.some(x => x !== 0)) && A.flat().every(x => Math.abs(x) <= 12)) return A;
  }
}
function randShape(rnd) {
  const [m, n] = pick([[3, 3], [3, 4], [2, 4], [3, 2], [4, 3]], rnd);
  return { m, n, r: int(1, Math.min(m, n) - (rnd() < 0.7 ? 1 : 0), rnd) };
}
const rankSteps = A => [...elimLines(A, zeros(A.length)), L('c3q.sRank', { r: rankOf(A) })];

function makeRank(rnd) {
  const { m, n, r } = randShape(rnd);
  const A = rankMatrix(m, n, r, rnd);
  return {
    textKey: 'c3q.qRank', textParams: {}, figure: { type: 'mats', items: [['A', A]] },
    answer: r, hintKey: 'c3q.hRank', meta: { A },
    work: rankSteps(A),
    mistakes: [m !== r && mistake(m, 'c3q.dRows'), n !== r && n !== m && mistake(n, 'c3q.dCols')].filter(Boolean),
  };
}

function makeNullDim(rnd) {
  const { m, n, r } = randShape(rnd);
  const A = rankMatrix(m, n, r, rnd);
  return {
    textKey: 'c3q.qNullDim', textParams: {}, figure: { type: 'mats', items: [['A', A]] },
    answer: n - r, hintKey: 'c3q.hNullDim', meta: { A },
    work: [...rankSteps(A), L('c3q.sNullDim', {}, `dim N(A) = n − r = ${n} − ${r} = ${n - r}`)],
    mistakes: [r !== n - r && mistake(r, 'c3q.dRankOnly'), m !== n && m - r >= 0 && mistake(m - r, 'c3q.dLeft')].filter(Boolean),
  };
}

function makeDims(rnd) {
  const { m, n, r } = randShape(rnd);
  const A = rankMatrix(m, n, r, rnd);
  const answer = [r, r, n - r, m - r];
  return {
    textKey: 'c3q.qDims', textParams: { m, n }, figure: { type: 'mats', items: [['A', A]] },
    input: { type: 'fields', labels: ['dim C(A)', 'dim C(Aᵀ)', 'dim N(A)', 'dim N(Aᵀ)'] },
    answer, hintKey: 'c3q.hDims', meta: { A },
    work: [...rankSteps(A), L('c3q.sDims', {}, `C(A): ${r},  C(Aᵀ): ${r},  N(A): ${n} − ${r} = ${n - r},  N(Aᵀ): ${m} − ${r} = ${m - r}`)],
    mistakes: [m !== n && mistake([r, r, m - r, n - r], 'c3q.dSwapN')].filter(Boolean),
  };
}

/* ---------- §3.2–3.4: nghiệm đặc biệt, nghiệm riêng ---------- */

/** A = E·R với R là RREF có đúng một cột tự do (E tam giác dưới, det 1 ⇒ rref(A) = R). */
function oneFreeMatrix(rnd) {
  for (;;) {
    const n = pick([3, 4], rnd);
    const f = int(1, n - 1, rnd);
    const piv = [...Array(n).keys()].filter(j => j !== f);
    const R = piv.map((p, k) => [...Array(n).keys()].map(j => (j === p ? 1 : j === f && p < f ? int(-3, 3, rnd) : 0)));
    if (R.every(row => row[f] === 0)) continue;
    const m = rnd() < 0.5 ? R.length : R.length + 1;
    while (R.length < m) R.push(zeros(n));
    const E = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => (i === j ? 1 : j < i ? int(-2, 2, rnd) : 0)));
    const A = matMul(E, R);
    if (A.flat().every(x => Math.abs(x) <= 12)) return { A, R: R.map(r => r.map(x => clean(x))), n, f, piv };
  }
}

/** Nghiệm đặc biệt: biến tự do = 1, biến trụ = −(cột tự do của R). */
function specialOf({ R, n, f, piv }) {
  const s = zeros(n);
  s[f] = 1;
  piv.forEach((p, k) => { s[p] = clean(-R[k][f]); });
  return s;
}

function makeSpecial(rnd) {
  const M = oneFreeMatrix(rnd);
  const { A, R, f, piv } = M;
  const s = specialOf(M);
  const flipped = s.map((x, j) => (j === f ? 1 : -x));
  return {
    textKey: 'c3q.qSpecial', textParams: {}, figure: { type: 'mats', items: [['A', A]] },
    answer: s, hintKey: 'c3q.hSpecial', meta: { A, f },
    work: [
      ...elimLines(A, zeros(A.length)),
      L('c3q.sFree', { free: `x${f + 1}`, pivots: piv.map(p => `x${p + 1}`).join(', ') }),
      L('c3q.sSetFree', { free: `x${f + 1}` }, piv.map((p, k) => `x${p + 1} = ${clean(-R[k][f])}`).join(',  ')),
      `s = ${fmtVec(s)}`,
    ],
    mistakes: [flipped.some((x, j) => x !== s[j]) && mistake(flipped, 'c3q.dSignS')].filter(Boolean),
  };
}

function makeParticular(rnd) {
  const M = oneFreeMatrix(rnd);
  const { A, n, f, piv } = M;
  const xp = zeros(n);
  piv.forEach(p => { xp[p] = int(-3, 3, rnd); });
  const b = matVec(A, xp);
  return {
    textKey: 'c3q.qParticular', textParams: { b: fmtVec(b), free: `x${f + 1}` },
    figure: { type: 'mats', items: [['A', A], ['b', b]] },
    answer: xp, hintKey: 'c3q.hParticular', meta: { A, b, f },
    work: [...elimLines(A, b), L('c3q.sParticular', { free: `x${f + 1}` }, `xₚ = ${fmtVec(xp)}`)],
    mistakes: [mistake(xp.map((x, j) => x + specialOf(M)[j]), 'c3q.dOtherSol', { free: `x${f + 1}` })],
  };
}

const MAKERS = {
  independent: makeIndependent, spankind: makeSpanKind, inspan: makeInSpan, rank: makeRank,
  nulldim: makeNullDim, special: makeSpecial, particular: makeParticular, dims: makeDims,
};

export const makeQuestion = makeWith(MAKERS, KINDS, 'c3q');

/** Như chấm chung, thêm hai lỗi "đúng mà chưa đúng yêu cầu": bội khác của nghiệm đặc biệt, nghiệm khác của Ax = b. */
export function checkAnswer(q, given) {
  const r = check(q, given);
  if (r.ok !== false || r.detailKey?.startsWith('c3q.')) return r;
  const g = parseNumbers(given);
  if (q.kind === 'special' && g[q.meta.f] !== 0 && g.every((x, j) => Math.abs(x - g[q.meta.f] * q.answer[j]) < 1e-6)) {
    return { ok: false, detailKey: 'c3q.dMultiple' };
  }
  if (q.kind === 'particular' && matVec(q.meta.A, g).every((x, i) => Math.abs(x - q.meta.b[i]) < 1e-6)) {
    return { ok: false, detailKey: 'c3q.dOtherSol', detailParams: { free: `x${q.meta.f + 1}` } };
  }
  return r;
}

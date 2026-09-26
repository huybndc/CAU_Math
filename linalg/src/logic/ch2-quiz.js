/* ---------------------------------------------------------------
   SINH & CHẤM ĐỀ CHƯƠNG 2 — Giải Ax = b (Strang §2.1–2.7). Thuần, không biết ngôn ngữ.
   Khử Gauss, trụ, A = LU, nhân ma trận, nghịch đảo, chuyển vị. Hợp đồng câu: quiz-kit.js.
   --------------------------------------------------------------- */

import { fail } from '@shared/logic/app-error.js';
import { fmt, fmtVec, clean } from './num-format.js';
import { matVec, determinant } from './matrix.js';
import { solve, solveSystem, systemStrings } from './linear-system.js';
import { forward, backward } from './elimination.js';
import { line as L } from '@shared/logic/steps.js';
import {
  pick, int, mistake, makeWith, checkAnswer as check, dotv, P, col, matMul, transpose, fmtMat, elimLines,
} from './quiz-kit.js';

export const KINDS = ['solve2', 'solve3', 'classify', 'pivots', 'lu', 'matmul', 'entry', 'inverse', 'xtay'];

/** Nhóm dạng liền chủ đề — mục Luyện tập hiện theo nhóm cho gọn (D30); nhãn: T(`${prefix}.${id}`). */
export const GROUPS = [
  { id: 'g-solve', kinds: ['solve2', 'solve3', 'classify', 'pivots'] },
  { id: 'g-matrix', kinds: ['matmul', 'entry', 'xtay', 'inverse', 'lu'] },
];
export const TYPES = ['unique', 'infinite', 'none'];

export const SECONDS = {
  solve2: 90, solve3: 180, classify: 120, pivots: 120, lu: 150, matmul: 90, entry: 45, inverse: 150, xtay: 75,
};

const row = (n, rnd, lo = -4, hi = 4) => Array.from({ length: n }, () => int(lo, hi, rnd));
const randMat = (m, n, rnd, lo = -3, hi = 3) => Array.from({ length: m }, () => row(n, rnd, lo, hi));
const systemFig = (A, b) => ({ type: 'system', lines: systemStrings(A, b) });
const TYPE_KEY = { unique: 'c2q.tUnique', infinite: 'c2q.tInfinite', none: 'c2q.tNone' };

/* ---------- hệ phương trình (dùng cả ở tab Ví dụ) ---------- */

function invertibleMatrix(n, rnd) {
  for (let g = 0; g < 200; g++) {
    const A = randMat(n, n, rnd, -4, 4);
    const d = determinant(A);
    if (d !== 0 && Math.abs(d) <= 40) return A;
  }
  return n === 2 ? [[1, 0], [0, 1]] : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
}

/** Hệ có nghiệm duy nhất, nghiệm nguyên — dựng ngược từ nghiệm để b đẹp. */
function uniqueSystem(n, rnd) {
  const A = invertibleMatrix(n, rnd);
  const x = row(n, rnd, -3, 3);
  return { A, b: matVec(A, x), x };
}

/** Hệ suy biến: hàng 2 là bội của hàng 1; `consistent` quyết định vô số hay vô nghiệm. */
function degenerateSystem(n, rnd, consistent) {
  for (let g = 0; g < 200; g++) {
    const A = randMat(n, n, rnd, -4, 4);
    if (A[0].every(v => v === 0)) continue;
    A[1] = A[0].map(v => v * pick([2, -2, 3, -1], rnd));
    // ẩn nào cũng phải hiện trên đề: cột toàn 0 thì đề 3 ẩn trông như 2 ẩn ⇒ đọc sai loại nghiệm
    if (A[0].some((_, j) => A.every(r => r[j] === 0))) continue;
    const b = matVec(A, row(n, rnd, -3, 3));
    if (!consistent) b[1] += pick([1, -1, 2], rnd);
    if (solveSystem(A, b).type === (consistent ? 'infinite' : 'none')) return { A, b };
  }
  const A = [[1, 1, 1], [2, 2, 2], [0, 1, 1]].slice(0, n).map(r => r.slice(0, n));
  return { A, b: [1, consistent ? 2 : 3, 0].slice(0, n) };
}

/** Hệ theo loại nghiệm mong muốn. */
export function systemOfType(type, n, rnd) {
  if (type === 'unique') return uniqueSystem(n, rnd);
  if (type === 'infinite' || type === 'none') return degenerateSystem(n, rnd, type === 'infinite');
  return fail('err.badQuizKind', { kind: type });
}

/* ---------- A = LU không cần đổi hàng ---------- */

/** A = L·U với L, U nguyên nhỏ ⇒ khử tay ra số đẹp; `unitPivots` ⇒ det = ±1 (nghịch đảo nguyên). */
function luMatrix(rnd, unitPivots = false) {
  for (;;) {
    const Lm = [[1, 0, 0], [int(-2, 2, rnd), 1, 0], [int(-2, 2, rnd), int(-2, 2, rnd), 1]];
    const piv = () => (unitPivots ? pick([1, -1], rnd) : pick([1, 2, 3, -1, -2], rnd));
    const U = [[piv(), int(-2, 3, rnd), int(-2, 2, rnd)], [0, piv(), int(-2, 2, rnd)], [0, 0, piv()]];
    const A = matMul(Lm, U);
    if (A.flat().every(x => Math.abs(x) <= 12) && Lm[1][0] ** 2 + Lm[2][0] ** 2 + Lm[2][1] ** 2 > 1) return { A, L: Lm, U };
  }
}

/** Khử xuôi A (không vế phải), ghi từng bước "R2 ← R2 − ℓ·R1". */
function luSteps(A) {
  const M = A.map(r => r.slice());
  const lines = [];
  for (let j = 0; j < 2; j++) {
    for (let i = j + 1; i < 3; i++) {
      const a = M[i][j];
      const l = clean(a / M[j][j]);
      if (l === 0) { lines.push(L('c2q.sZero', { i: i + 1, j: j + 1 })); continue; }
      M[i] = M[i].map((x, k) => clean(x - l * M[j][k]));
      lines.push(`ℓ${i + 1}${j + 1} = ${fmt(a)}/${P(M[j][j])} = ${fmt(l)}:   R${i + 1} ← R${i + 1} − ${P(l)}·R${j + 1}   ${fmtMat(M)}`);
    }
  }
  return { lines, U: M };
}

/* ---------- các dạng câu ---------- */

function makeSolve(n) {
  return rnd => {
    const { A, b, x } = uniqueSystem(n, rnd);
    return {
      textKey: 'c2q.qSolve', textParams: { vars: n === 2 ? 'x, y' : 'x, y, z' },
      figure: systemFig(A, b), answer: x, hintKey: 'c2q.hSolve', meta: { A, b },
      work: [L('c2q.sAug'), ...elimLines(A, b), L('c2q.sRead', {}, `(${n === 2 ? 'x, y' : 'x, y, z'}) = ${fmtVec(x)}`)],
      mistakes: [x.some((v, i) => v !== x[n - 1 - i]) && mistake(x.slice().reverse(), 'c2q.dReverse')].filter(Boolean),
    };
  };
}

function makeClassify(rnd) {
  const n = pick([2, 3, 3], rnd);
  const { A, b } = systemOfType(pick(TYPES, rnd), n, rnd);
  const r = solve(A, b);
  const p = { rank: r.rankA, rankAug: r.rankAug, n };
  return {
    format: 'choice', choices: TYPES.map(t => TYPE_KEY[t]), answer: TYPES.indexOf(r.type),
    textKey: 'c2q.qClassify', textParams: { vars: n === 2 ? 'x, y' : 'x, y, z' }, figure: systemFig(A, b),
    hintKey: 'c2q.hClassify', meta: { A, b },
    work: [...elimLines(A, b).slice(0, 1 + r.forwardSteps.filter(s => s.formula).length), L(`c2q.why_${r.type}`, p)],
    why: { key: `c2q.why_${r.type}`, params: p },
  };
}

function makePivots(rnd) {
  const { A, U } = luMatrix(rnd);
  const piv = U.map((r, i) => r[i]);
  const diag = A.map((r, i) => r[i]);
  return {
    textKey: 'c2q.qPivots', textParams: {}, figure: { type: 'mats', items: [['A', A]] },
    answer: piv, hintKey: 'c2q.hPivots', meta: { A },
    work: [...luSteps(A).lines, L('c2q.sPivots', {}, fmtVec(piv))],
    mistakes: [diag.some((d, i) => d !== piv[i]) && mistake(diag, 'c2q.dDiag')].filter(Boolean),
  };
}

function makeLu(rnd) {
  const { A, L: Lm, U } = luMatrix(rnd);
  const s = luSteps(A);
  const answer = [Lm[1][0], Lm[2][0], Lm[2][1]];
  const stale = A[1][1] !== 0 ? clean(A[2][1] / A[1][1]) : null;
  return {
    textKey: 'c2q.qLu', textParams: {}, figure: { type: 'mats', items: [['A', A]] },
    input: { type: 'fields', labels: ['ℓ₂₁', 'ℓ₃₁', 'ℓ₃₂'] },
    answer, hintKey: 'c2q.hLu', meta: { A },
    work: [...s.lines, L('c2q.sLu', {}, `L = ${fmtMat(Lm)},   U = ${fmtMat(U)}`)],
    mistakes: [
      answer.some(x => x !== 0) && mistake(answer.map(x => -x), 'c2q.dSignL'),
      stale !== null && stale !== answer[2] && mistake([answer[0], answer[1], stale], 'c2q.dStale'),
    ].filter(Boolean),
  };
}

function makeMatMul(rnd) {
  const [m, k, n] = pick([[2, 2, 2], [2, 3, 2], [3, 2, 2], [2, 2, 3]], rnd);
  const A = randMat(m, k, rnd), B = randMat(k, n, rnd);
  const AB = matMul(A, B);
  const lines = [];
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    lines.push(`(AB)${i + 1}${j + 1} = ${A[i].map((a, t) => `${P(a)}·${P(B[t][j])}`).join(' + ')} = ${AB[i][j]}`);
  }
  const square = m === k && k === n;
  return {
    textKey: 'c2q.qMatMul', textParams: { m, n }, figure: { type: 'mats', items: [['A', A], ['B', B]] },
    input: { type: 'matrix', rows: m, cols: n }, answer: AB, hintKey: 'c2q.hMatMul', meta: { A, B },
    work: [L('c2q.sRowCol', { m, n }), ...lines],
    mistakes: [
      square && mistake(matMul(B, A), 'c2q.dOrder'),
      square && mistake(A.map((r, i) => r.map((a, j) => a * B[i][j])), 'c2q.dEntrywise'),
    ].filter(Boolean),
  };
}

function makeEntry(rnd) {
  const A = randMat(3, 3, rnd), B = randMat(3, 3, rnd);
  const i = int(0, 2, rnd), j = int(0, 2, rnd);
  const r = A[i], c = col(B, j);
  return {
    textKey: 'c2q.qEntry', textParams: { ij: `${i + 1}${j + 1}` },
    figure: { type: 'mats', items: [['A', A], ['B', B]] },
    answer: dotv(r, c), hintKey: 'c2q.hEntry', hintParams: { i: i + 1, j: j + 1 }, meta: { A, B, i, j },
    work: [
      L('c2q.sEntry', { i: i + 1, j: j + 1 }, `${fmtVec(r)} · ${fmtVec(c)}`),
      `= ${r.map((a, t) => `${P(a)}·${P(c[t])}`).join(' + ')} = ${dotv(r, c)}`,
    ],
    mistakes: [
      mistake(dotv(r, B[j]), 'c2q.dRowRow', { i: i + 1 }),
      mistake(dotv(B[i], col(A, j)), 'c2q.dOrder'),
    ],
  };
}

/** [M | N] với vạch sau cột k. */
const fmtBlock = (M, k) => '[' + M.map(r => r.slice(0, k).map(x => fmt(x)).join(' ') + ' | ' + r.slice(k).map(x => fmt(x)).join(' ')).join('; ') + ']';

function makeInverse(rnd) {
  if (rnd() < 0.6) {
    let A, d;
    do { A = randMat(2, 2, rnd, -4, 5); d = determinant(A); } while (![1, -1, 2, -2].includes(d));
    const [[a, b], [c, e]] = A;
    const inv = [[e, -b], [-c, a]].map(r => r.map(x => clean(x / d)));
    return {
      textKey: 'c2q.qInverse', textParams: {}, figure: { type: 'mats', items: [['A', A]] },
      input: { type: 'matrix', rows: 2, cols: 2 }, answer: inv, hintKey: 'c2q.hInverse2', meta: { A },
      work: [
        `det A = ${P(a)}·${P(e)} − ${P(b)}·${P(c)} = ${d}`,
        L('c2q.sInv2', {}, `A⁻¹ = (1/${P(d)})·${fmtMat([[e, -b], [-c, a]])} = ${fmtMat(inv)}`),
        L('c2q.sCheckI'),
      ],
      mistakes: [
        Math.abs(d) !== 1 && mistake([[e, -b], [-c, a]], 'c2q.dNoDet'),
        mistake([[a, -b], [-c, e]].map(r => r.map(x => clean(x / d))), 'c2q.dNoSwap'),
        mistake([[e, b], [c, a]].map(r => r.map(x => clean(x / d))), 'c2q.dNoNeg'),
      ].filter(Boolean),
    };
  }
  const { A } = luMatrix(rnd, true);
  const M0 = A.map((r, i) => [...r, ...[0, 1, 2].map(j => (i === j ? 1 : 0))]);
  const fw = forward(M0);
  const bw = backward(fw.matrix, fw.pivots);
  const inv = bw.matrix.map(r => r.slice(3).map(x => clean(x)));
  const op = s => s.formula.replace('<->', '↔').replace('<-', '←');
  return {
    textKey: 'c2q.qInverse', textParams: {}, figure: { type: 'mats', items: [['A', A]] },
    input: { type: 'matrix', rows: 3, cols: 3 }, answer: inv, hintKey: 'c2q.hInverse3', meta: { A },
    work: [
      L('c2q.sGaussJordan', {}, fmtBlock(M0, 3)),
      ...[...fw.steps, ...bw.steps].filter(s => s.formula).map(s => `${op(s)}:   ${fmtBlock(s.matrix, 3)}`),
      L('c2q.sReadInv', {}, `A⁻¹ = ${fmtMat(inv)}`),
    ],
    mistakes: [mistake(transpose(inv), 'c2q.dTransInv')].filter(m => fmtMat(m.value) !== fmtMat(inv)),
  };
}

function makeXtAy(rnd) {
  const n = pick([2, 3], rnd);
  const A = randMat(n, n, rnd), x = row(n, rnd, -2, 2), y = row(n, rnd, -2, 3);
  const Ay = matVec(A, y);
  const answer = dotv(x, Ay);
  const swapped = dotv(y, matVec(A, x));
  return {
    textKey: 'c2q.qXtAy', textParams: { x: fmtVec(x), y: fmtVec(y) }, figure: { type: 'mats', items: [['A', A]] },
    answer, hintKey: 'c2q.hXtAy', meta: { A, x, y },
    work: [`Ay = ${fmtVec(Ay)}`, `xᵀ(Ay) = ${x.map((a, i) => `${P(a)}·${P(Ay[i])}`).join(' + ')} = ${answer}`, L('c2q.sXtAy')],
    mistakes: [swapped !== answer && mistake(swapped, 'c2q.dSwapXY')].filter(Boolean),
  };
}

const MAKERS = {
  solve2: makeSolve(2), solve3: makeSolve(3), classify: makeClassify, pivots: makePivots, lu: makeLu,
  matmul: makeMatMul, entry: makeEntry, inverse: makeInverse, xtay: makeXtAy,
};

export const makeQuestion = makeWith(MAKERS, KINDS, 'c2q');
export const checkAnswer = check;

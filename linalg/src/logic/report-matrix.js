import * as M from './matrix.js';
import { inverseSteps, detByElimination } from './elementary.js';
import { rankOf } from './subspace.js';
import { fmtMat } from './quiz-kit.js';
import { fmt, fmtParen, parseNums, near } from './num-format.js';
import { formatRowOp } from './elimination.js';
import { sub } from './report-vector.js';
import { fail } from '@shared/logic/app-error.js';

/* ---------------------------------------------------------------
   MÁY GIẢI MA TRẬN: A·B, A±B, Aᵀ, det, A⁻¹, hạng — mỗi phép kèm lời giải gập.
   Cùng định dạng với report-vector.js. Thuần: không đụng DOM.
   --------------------------------------------------------------- */

export const OPS = ['mul', 'add', 'sub', 'transpose', 'det', 'inv', 'rank'];
export const NEEDS_B = op => ['mul', 'add', 'sub'].includes(op);
const arrow = s => s.replace('<->', '↔').replace('<-', '←');

const rowStr = r => r.map(x => fmt(x)).join(' ');

function mulSteps(A, B, C) {
  const a = M.shape(A), b = M.shape(B);
  const lines = [`(${a.rows}×${a.cols})·(${b.rows}×${b.cols}) = ${a.rows}×${b.cols}`, { key: 'sm.mulRule' }];
  for (let i = 0; i < a.rows; i++) {
    C[i].forEach((v, j) => lines.push(`c${sub(i + 1)}${sub(j + 1)} = ${A[i].map((x, k) => `${fmtParen(x)}·${fmtParen(B[k][j])}`).join(' + ')} = ${fmt(v)}`));
  }
  return [{ head: { key: 'sm.stEntries' }, lines }];
}

function detSteps(A) {
  const n = A.length;
  const steps = [];
  if (n === 2) steps.push({ head: { key: 'sm.stFormula2' }, lines: [`det = ${fmtParen(A[0][0])}·${fmtParen(A[1][1])} − ${fmtParen(A[0][1])}·${fmtParen(A[1][0])} = ${fmt(M.determinant(A))}`] });
  if (n === 3) {
    const terms = [0, 1, 2].map(j => {
      const sign = j % 2 ? '−' : '+';
      return `${sign} ${fmtParen(A[0][j])}·det${fmtMat(M.minorMatrix(A, 0, j))} = ${sign} ${fmtParen(A[0][j])}·${fmt(M.determinant(M.minorMatrix(A, 0, j)))}`;
    });
    steps.push({ head: { key: 'sm.stExpand' }, lines: terms.map(t => t.replace(/^\+ /, '')).concat(`det = ${fmt(M.determinant(A))}`) });
  }
  const d = detByElimination(A);
  steps.push({
    why: { key: 'ww.elim' }, head: { key: 'sm.stElim' },
    lines: [`U = ${fmtMat(d.U)}`, d.rank < n ? { key: 'sm.detZero' } : `det = ${d.swaps % 2 ? '(−1)^' + d.swaps + '·' : ''}${d.diag.map(fmtParen).join('·')} = ${fmt(d.det)}`],
  });
  return steps;
}

/** op ∈ OPS; B chỉ cần cho mul/add/sub. */
export function matrixReport(op, A, B = null) {
  M.checkMatrix(A);
  if (!OPS.includes(op)) fail('err.badRowOp', { type: String(op) });
  const a = M.shape(A);
  const start = { head: { key: 'sm.stInput' }, lines: [`A = ${fmtMat(A)}`, ...(NEEDS_B(op) && B ? [`B = ${fmtMat(B)}`] : [])] };
  if (NEEDS_B(op)) {
    if (!B) fail('err.notMatrix', {});
    M.checkMatrix(B);
  }
  if (op === 'mul') {
    const C = M.multiply(A, B);
    return { answer: [`A·B = ${fmtMat(C)}`], steps: mulSteps(A, B, C) };
  }
  if (op === 'add' || op === 'sub') {
    const C = (op === 'add' ? M.add : M.sub)(A, B);
    const sym = op === 'add' ? '+' : '−';
    return {
      answer: [`A ${sym} B = ${fmtMat(C)}`],
      steps: [{ head: { key: 'sm.stEntrywise' }, lines: A.map((r, i) => `[${rowStr(r)}] ${sym} [${rowStr(B[i])}] = [${rowStr(C[i])}]`) }],
    };
  }
  if (op === 'transpose') {
    return { answer: [`Aᵀ = ${fmtMat(M.transpose(A))}`], steps: [start, { head: { key: 'sm.stTranspose' }, lines: [{ key: 'sm.transposeRule' }] }] };
  }
  if (op === 'rank') {
    const r = rankOf(A);
    return { check: t => parseNums(t)[0] === r, answer: [{ key: 'sm.rankIs', params: { r } }], steps: [start, { head: { key: 'sm.stRankWhy' }, lines: [{ key: 'sm.rankRule', params: { r } }] }] };
  }
  if (op === 'det') {
    const d = M.determinant(A);
    return { check: t => near(parseNums(t)[0], d, 1e-6), answer: [`det A = ${fmt(d)}`, { key: d === 0 ? 'sm.singular' : 'sm.invertible' }], steps: detSteps(A) };
  }
  // inv
  const inv = inverseSteps(A);
  if (!inv.invertible) {
    return { answer: [{ key: 'sm.notInvertible', params: { r: inv.rank, n: a.rows } }], steps: [start, ...(a.rows === 2 ? [{ head: { key: 'sm.stFormula2' }, lines: [`det = ${fmt(M.determinant(A))} = 0`] }] : [])] };
  }
  const steps = [];
  if (a.rows === 2) {
    const d = M.determinant(A);
    steps.push({ head: { key: 'sm.stInv2' }, lines: [`A⁻¹ = (1/det)·[d −b; −c a] = (1/${fmt(d)})·${fmtMat([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]])}`] });
  }
  steps.push({
    why: { key: 'ww.gj' }, head: { key: 'sm.stGJ' },
    lines: [`[A | I] = ${fmtMat(inv.start)}`, ...[...inv.forwardSteps, ...inv.backwardSteps].filter(s => s.formula).map(s => `${arrow(s.formula)}:   ${fmtMat(s.matrix)}`), `[I | A⁻¹] = ${fmtMat(inv.final)}`],
  });
  steps.push({ head: { key: 'sm.stCheckInv' }, lines: [`A·A⁻¹ = ${fmtMat(M.multiply(A, inv.inverse))} = I  ✓`] });
  return { answer: [`A⁻¹ = ${fmtMat(inv.inverse)}`], steps };
}

import { identity, multiply, clone, shape } from './matrix.js';
import { forward, backward, applyRowOp } from './elimination.js';
import { fail } from '@shared/logic/app-error.js';

/* ---------------------------------------------------------------
   MA TRẬN SƠ CẤP (Strang 2.3): mỗi phép biến đổi hàng là phép nhân bên TRÁI với một ma trận E.
   E = applyRowOp(I, op) nên E·A luôn bằng applyRowOp(A, op) — không viết hai lần.
   Thuần: không đụng DOM.
   --------------------------------------------------------------- */

/** E cỡ n của một phép biến đổi hàng. */
export const opMatrix = (n, op) => applyRowOp(identity(n), op);

/** Phép ngược của một phép biến đổi hàng (E⁻¹ ứng với phép này). */
export function inverseOp(op) {
  if (op.type === 'add') return { ...op, k: -op.k };
  if (op.type === 'scale') return { ...op, k: 1 / op.k };
  return op;                                   // đổi hàng tự nghịch đảo
}

/**
 * Áp lần lượt các phép lên A, giữ lại từng E và tích E_n…E₁.
 * @returns {{ steps: {op, E, after}[], product: number[][], result: number[][] }}
 */
export function chain(A, ops) {
  const n = shape(A).rows;
  let M = clone(A), acc = identity(n);
  const steps = ops.map(op => {
    const E = opMatrix(n, op);
    M = applyRowOp(M, op);
    acc = multiply(E, acc);
    return { op, E, after: clone(M) };
  });
  return { steps, product: acc, result: M };
}

/** Khử xuôi A (không có vế phải) về bậc thang U, kèm các E của từng phép. */
export function eliminationE(A) {
  const fw = forward(A.map(r => [...r, 0]));
  const ops = fw.steps.map(s => s.op).filter(Boolean);
  const c = chain(A, ops);
  return { ...c, ops, U: c.result, pivots: fw.pivots };
}

/**
 * L = E₁⁻¹E₂⁻¹…Eₙ⁻¹ khi chỉ có phép "cộng bội của hàng trên" (không đổi hàng):
 * các hệ số nhân ℓ xếp thẳng vào L mà không trộn lẫn — điểm mấu chốt của A = LU.
 */
export function lowerFromOps(n, ops) {
  return ops.reduce((L, op) => multiply(L, opMatrix(n, inverseOp(op))), identity(n));
}

/**
 * Nghịch đảo bằng Gauss–Jordan: [A | I] → [I | A⁻¹].
 * @returns {{ invertible: boolean, rank: number, inverse: number[][]|null, start, forwardSteps, backwardSteps, final }}
 */
export function inverseSteps(A) {
  const { rows, cols } = shape(A);
  if (rows !== cols) fail('err.needSquare', { rows, cols });
  const n = rows;
  const start = A.map((r, i) => [...r, ...identity(n)[i]]);
  const fw = forward(start);
  const lead = fw.pivots.filter(p => p.col < n);
  if (lead.length < n) return { invertible: false, rank: lead.length, inverse: null, start, forwardSteps: fw.steps, backwardSteps: [], final: fw.matrix };
  const bw = backward(fw.matrix, lead);
  return {
    invertible: true, rank: n, inverse: bw.matrix.map(r => r.slice(n)),
    start, forwardSteps: fw.steps, backwardSteps: bw.steps, final: bw.matrix,
  };
}

/** Định thức bằng khử: det = (−1)^(số lần đổi hàng) · tích các trụ. */
export function detByElimination(A) {
  const { rows, cols } = shape(A);
  if (rows !== cols) fail('err.needSquare', { rows, cols });
  const e = eliminationE(A);
  const swaps = e.ops.filter(o => o.type === 'swap').length;
  const diag = e.U.map((r, i) => r[i]);
  const det = e.pivots.length < rows ? 0 : (swaps % 2 ? -1 : 1) * diag.reduce((p, x) => p * x, 1);
  return { det: Math.abs(det) < 1e-9 ? 0 : det, swaps, diag, U: e.U, rank: e.pivots.length };
}

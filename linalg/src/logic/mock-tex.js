/* ---------------------------------------------------------------
   LaTeX cho "Đề như thật" (thuần): số, ma trận, phép biến đổi hàng và các dòng giải từng bước.
   Chuỗi của đề và đáp án chứa công thức giữa dấu $…$; mock-screen dựng bằng KaTeX.
   --------------------------------------------------------------- */
import { toFraction, clean } from './num-format.js';
import { applyRowOp } from './elimination.js';
import { identity } from './matrix.js';

/** Số → LaTeX: nguyên giữ nguyên, còn lại viết phân số (\tfrac) như bài làm tay. */
export function num(x) {
  if (typeof x === 'string') return x;     // ký hiệu như 'q'
  const c = clean(x);
  if (Number.isInteger(c)) return String(c);
  const f = toFraction(c, 999);
  return f ? `${f.num < 0 ? '-' : ''}\\tfrac{${Math.abs(f.num)}}{${f.den}}` : String(c);
}
const body = M => M.map(r => r.map(num).join(' & ')).join(' \\\\ ');
export const mat = M => `\\begin{bmatrix}${body(M)}\\end{bmatrix}`;
export const vec = v => mat(v.map(x => [x]));
/** Ma trận mở rộng: k cột đầu, vạch đứng, phần còn lại. */
export const aug = (M, k) => `\\left[\\begin{array}{${'c'.repeat(k)}|${'c'.repeat(M[0].length - k)}}${body(M)}\\end{array}\\right]`;
export const M = s => `$${s}$`;

const R = i => `R_${i + 1}`;
/** Phép biến đổi hàng viết bằng LaTeX. */
export function opTex(op) {
  if (op.type === 'swap') return `${R(op.i)} \\leftrightarrow ${R(op.j)}`;
  if (op.type === 'scale') return `${R(op.i)} \\leftarrow ${num(op.k)}\\,${R(op.i)}`;
  const k = Math.abs(op.k);
  return `${R(op.i)} \\leftarrow ${R(op.i)} ${op.k < 0 ? '-' : '+'} ${k === 1 ? '' : `${num(k)}\\,`}${R(op.j)}`;
}

const EPS = 1e-9;

/**
 * Khử Gauss–Jordan viết theo lối sách: chỉ đổi hàng khi trụ bằng 0 (không chọn trụ đẹp như bộ giải của app),
 * để các bước in ra khớp hệ số ℓ ghi trong đáp án. nv = số cột biến (các cột sau là vế phải hoặc I).
 */
function natural(M0, nv, back) {
  let Mx = M0.map(row => row.slice());
  const steps = [], pivots = [];
  const apply = op => { Mx = applyRowOp(Mx, op); steps.push({ op, matrix: Mx.map(row => row.slice()) }); };
  let row = 0;
  for (let col = 0; col < nv && row < Mx.length; col++) {
    const pr = Mx.findIndex((rw, i) => i >= row && Math.abs(rw[col]) > EPS);
    if (pr < 0) continue;
    if (pr !== row) apply({ type: 'swap', i: row, j: pr });
    for (let r2 = row + 1; r2 < Mx.length; r2++) if (Math.abs(Mx[r2][col]) > EPS) apply({ type: 'add', i: r2, j: row, k: clean(-Mx[r2][col] / Mx[row][col]) });
    pivots.push({ row, col });
    row++;
  }
  const nFwd = steps.length, fwMatrix = Mx.map(rw => rw.slice());
  if (back) {
    for (const { row: pr, col } of [...pivots].reverse()) {
      const v = Mx[pr][col];
      if (Math.abs(v - 1) > EPS) apply({ type: 'scale', i: pr, k: clean(1 / v) });
      for (let r2 = pr - 1; r2 >= 0; r2--) if (Math.abs(Mx[r2][col]) > EPS) apply({ type: 'add', i: r2, j: pr, k: clean(-Mx[r2][col]) });
    }
  }
  return { steps, nFwd, pivots, fwMatrix, matrix: Mx };
}

/** Các dòng khử tới bậc thang (back: tới rref). k = số cột trước vạch đứng; k = 0: ma trận không có vế phải (thêm cột 0 để khử, không in). */
export function elimLines(A, k, back = false) {
  const plain = k === 0, M0 = plain ? A.map(row => [...row, 0]) : A, show = m => (plain ? m.map(row => row.slice(0, -1)) : m);
  const nv = plain ? A[0].length : k, res = natural(M0, nv, back);
  const lines = res.steps.map(s => M(`${opTex(s.op)}:\\quad ${plain ? mat(show(s.matrix)) : aug(s.matrix, k)}`));
  return { lines, nFwd: res.nFwd, fw: { matrix: res.fwMatrix, pivots: res.pivots }, bw: { matrix: res.matrix }, show };
}

/** Các dòng Gauss–Jordan [A | I] → [I | A⁻¹] (A khả nghịch). */
export function jordanLines(A) {
  const n = A.length, start = A.map((row, i) => [...row, ...identity(n)[i]]), res = natural(start, n, true);
  return { inv: { start, inverse: res.matrix.map(row => row.slice(n)) }, lines: res.steps.map(s => M(`${opTex(s.op)}:\\quad ${aug(s.matrix, n)}`)) };
}

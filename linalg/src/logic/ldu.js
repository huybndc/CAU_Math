import { clean } from './num-format.js';
import { clone, multiply, identity, equals } from './matrix.js';

/* ---------------------------------------------------------------
   PHÂN TÍCH PA = L D U (thuần, không đụng DOM) — cho công cụ Giải Ax = b trong Nháp.
   Khử Gauss không chia hàng: L (m×m, đường chéo 1) giữ các hệ số nhân ℓᵢⱼ, U là dạng bậc thang (trụ chưa chuẩn hoá).
   Chỉ đổi hàng khi trụ bằng 0 (lấy hàng đầu tiên bên dưới có số khác 0) — như làm tay; P ghi lại các lần đổi.
   Ma trận vuông, đủ m trụ ⇒ tách tiếp D = diag(trụ) và U₁ = D⁻¹U (đường chéo 1): PA = L·D·U₁.
   Suy biến / chữ nhật ⇒ chỉ có PA = L·U (U bậc thang), không có D.
   --------------------------------------------------------------- */

const EPS = 1e-9;

/**
 * @param {number[][]} A  m×n
 * @returns {{ P:number[][], perm:number[], swaps:[number,number][], L:number[][], U:number[][], rank:number, pivotCols:number[],
 *             invertible:boolean, D:number[]|null, U1:number[][]|null, steps:{row:number, pivotRow:number, k:number, after:number[][]}[] }}
 */
export function ldu(A) {
  const m = A.length, n = A[0].length;
  const U = clone(A);
  const L = identity(m).map(r => r.slice());
  const perm = Array.from({ length: m }, (_, i) => i);
  const swaps = [], steps = [], pivotCols = [];
  let r = 0;
  for (let col = 0; col < n && r < m; col++) {
    let p = -1;
    for (let i = r; i < m; i++) if (Math.abs(U[i][col]) > EPS) { p = i; break; }
    if (p < 0) continue;
    if (p !== r) {
      [U[r], U[p]] = [U[p], U[r]];
      for (let j = 0; j < r; j++) [L[r][j], L[p][j]] = [L[p][j], L[r][j]];     // đổi cả hệ số nhân đã tính
      [perm[r], perm[p]] = [perm[p], perm[r]];
      swaps.push([r, p]);
    }
    for (let i = r + 1; i < m; i++) {
      if (Math.abs(U[i][col]) <= EPS) continue;
      const k = U[i][col] / U[r][col];
      for (let j = col; j < n; j++) U[i][j] = clean(U[i][j] - k * U[r][j]);
      U[i][col] = 0;
      L[i][r] = clean(k);
      steps.push({ row: i, pivotRow: r, k: clean(k), after: clone(U) });
    }
    pivotCols.push(col);
    r++;
  }
  const P = perm.map(src => Array.from({ length: m }, (_, j) => (j === src ? 1 : 0)));
  const invertible = m === n && r === n;
  const D = invertible ? U.map((row, i) => row[i]) : null;
  const U1 = invertible ? U.map((row, i) => row.map(x => clean(x / D[i]))) : null;
  return { P, perm, swaps, L: L.map(row => row.map(x => clean(x))), U, rank: r, pivotCols, invertible, D, U1, steps };
}

/** Kiểm: PA = L·U (và = L·D·U₁ khi có D). */
export function checkLdu(A, f) {
  const PA = multiply(f.P, A);
  if (!equals(PA, multiply(f.L, f.U), 1e-7)) return false;
  if (!f.invertible) return true;
  const Dm = f.D.map((d, i) => f.D.map((_, j) => (i === j ? d : 0)));
  return equals(PA, multiply(multiply(f.L, Dm), f.U1), 1e-7);
}

/**
 * Giải Ax = b qua PA = LDU (chỉ khi khả nghịch): Lc = Pb (thế xuôi), Dy = c, U₁x = y (thế ngược).
 * @returns {{ pb:number[], c:number[], y:number[], x:number[] }}
 */
export function solveLdu(f, b) {
  const n = b.length;
  const pb = f.perm.map(i => b[i]);
  const c = [];
  for (let i = 0; i < n; i++) c[i] = clean(pb[i] - f.L[i].slice(0, i).reduce((s, l, j) => s + l * c[j], 0));
  const y = c.map((v, i) => clean(v / f.D[i]));
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) x[i] = clean(y[i] - f.U1[i].slice(i + 1).reduce((s, u, j) => s + u * x[i + 1 + j], 0));
  return { pb, c, y, x };
}

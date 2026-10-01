import { determinant, multiply } from './matrix.js';

/* ---------------------------------------------------------------
   DỮ LIỆU NGẪU NHIÊN cho các máy giải: số nguyên nhỏ, dễ tính tay, và luôn có "ý đồ" để kết quả đáng xem
   (hệ có nghiệm nguyên, vector hay vuông góc, ma trận có lúc suy biến). `rnd` tiêm vào được để test; mặc định Math.random.
   Thuần: không đụng DOM.
   --------------------------------------------------------------- */

const int = (lo, hi, rnd) => lo + Math.floor(rnd() * (hi - lo + 1));
const pick = (xs, rnd) => xs[int(0, xs.length - 1, rnd)];
export const randMatrix = (r, c, lo = -4, hi = 4, rnd = Math.random) => Array.from({ length: r }, () => Array.from({ length: c }, () => int(lo, hi, rnd)));

/** Ma trận vuông n×n khả nghịch (det ≠ 0). */
export function randInvertible(n, rnd = Math.random, lo = -3, hi = 3) {
  for (let i = 0; i < 200; i++) {
    const A = randMatrix(n, n, lo, hi, rnd);
    if (Math.abs(determinant(A)) > 0.5) return A;
  }
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

/** Hệ n×n có nghiệm nguyên: trả ma trận mở rộng [A | b] với b = A·x. */
export function randSystem(n = 3, rnd = Math.random) {
  const A = randInvertible(n, rnd);
  const x = Array.from({ length: n }, () => [int(-3, 3, rnd)]);
  const b = multiply(A, x);
  return A.map((row, i) => [...row, b[i][0]]);
}

/** Cặp vector cùng chiều (2–3): 1/3 cho vuông góc, 1/3 cho song song, còn lại ngẫu nhiên. Trả ma trận có 2 cột [v | w]. */
export function randVectorPair(rnd = Math.random) {
  const n = pick([2, 3, 3], rnd);
  const v = randMatrix(n, 1, -4, 4, rnd).map(r => r[0]);
  if (v.every(x => x === 0)) v[0] = 1;
  const kind = int(0, 2, rnd);
  let w;
  if (kind === 0) {                      // vuông góc: hoán đổi + đổi dấu (2D) hoặc tích có hướng với một vector khác (3D)
    if (n === 2) w = [-v[1], v[0]];
    else { const u = randMatrix(3, 1, -3, 3, rnd).map(r => r[0]); w = [v[1] * u[2] - v[2] * u[1], v[2] * u[0] - v[0] * u[2], v[0] * u[1] - v[1] * u[0]]; if (w.every(x => x === 0)) w = [v[1], -v[0], 0]; }
  } else if (kind === 1) w = v.map(x => x * pick([2, -1, 3], rnd));
  else { w = randMatrix(n, 1, -4, 4, rnd).map(r => r[0]); if (w.every(x => x === 0)) w[0] = 2; }
  return v.map((x, i) => [x, w[i]]);
}

/** Bài tổ hợp tuyến tính: k vector cột + w; 70% w đúng là tổ hợp. Trả [v₁ … vₖ | w] (n hàng). */
export function randCombo(rnd = Math.random) {
  const n = 3, k = pick([2, 2, 3], rnd);
  const V = randMatrix(n, k, -2, 2, rnd);
  const inSpan = rnd() < 0.7;
  const w = inSpan
    ? V.map(row => row.reduce((s, x) => s + x * int(-2, 2, rnd), 0))
    : randMatrix(n, 1, -3, 3, rnd).map(r => r[0]);
  return V.map((row, i) => [...row, w[i]]);
}

/** Ma trận cho bài cơ sở/hạng: thường hạng thấp hơn số cột để có không gian null đáng xem. */
export function randLowRank(rows = 3, cols = 4, rnd = Math.random) {
  const r = int(1, Math.min(rows, cols) - 1 || 1, rnd);
  return multiply(randMatrix(rows, r, -2, 2, rnd), randMatrix(r, cols, -2, 2, rnd));
}

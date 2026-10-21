/* ---------------------------------------------------------------
   ĐỀ NHƯ THẬT (Linear Algebra) — các câu về vector và phép nhân ma trận (thuần, chữ Anh: đề thi bằng tiếng Anh).
   Mỗi maker(rnd) → { stem, parts: [{ pts, q, a, facts }] }; số liệu lấy từ thư viện ma trận/vector có sẵn.
   --------------------------------------------------------------- */
import { int, pick } from '@shared/logic/shuffle.js';
import { fmtMat } from './quiz-kit.js';
import { dot, combine } from './vector.js';
import { multiply, transpose, determinant, matVec } from './matrix.js';

export const col = v => fmtMat(v.map(x => [x]));
const permute = (vs, rnd) => {
  const idx = [0, 1, 2].sort(() => rnd() - 0.5), sg = [0, 1, 2].map(() => (rnd() < 0.5 ? -1 : 1));
  return vs.map(v => idx.map((k, i) => v[k] * sg[i]));
};

// u, v, góc (độ): cos θ đẹp
const ANGLES = [[[1, 1, 0], [0, 1, 1], 60], [[1, 0, 1], [0, 1, 0], 90], [[1, 1, 0], [1, 0, 0], 45], [[1, 1, 0], [-1, 0, 0], 135], [[1, 0, 0], [1, 0, 1], 45]];
// (a, b, c, |v|) với a²+b²+c² = |v|²
const QUADS = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11]];

export function makeDot(rnd) {
  const k = pick([2, 3, 4], rnd), c = pick(['1/2', '1/3', '-1/4', '2/5'], rnd);
  const [u, v, deg] = pick(ANGLES, rnd);
  const [pu, pv] = permute([u, v], rnd);
  const [a, b, d, n] = pick(QUADS, rnd);
  const [w] = permute([[a, b, d]], rnd);
  const unit = w.map(x => x / n);
  return {
    stem: 'Vectors, dot products and angles.',
    parts: [
      { pts: 5, q: `Let v and w be unit vectors with v·w = ${c}. Compute (v + ${k}w)·(v − ${k}w).`,
        a: [`(v + ${k}w)·(v − ${k}w) = v·v − ${k}²·w·w (the cross terms cancel) = 1 − ${k * k} = ${1 - k * k}`],
        facts: { k, answer: 1 - k * k } },
      { pts: 5, q: `Find the angle between u = ${col(pu)} and v = ${col(pv)}.`,
        a: [`u·v = ${dot(pu, pv)}, |u| = √${dot(pu, pu)}, |v| = √${dot(pv, pv)}`, `cos θ = u·v / (|u||v|), so θ = ${deg}°`],
        facts: { u: pu, v: pv, deg } },
      { pts: 5, q: `Find a unit vector in the same direction as w = ${col(w)} and a unit vector in the opposite direction.`,
        a: [`|w| = √${dot(w, w)} = ${n}`, `same direction: w/${n} = ${col(unit)}`,
          `opposite direction: −w/${n} = ${fmtMat(unit.map(x => [-x]))}`],
        facts: { w, n } },
    ],
  };
}

export function makeCombo(rnd) {
  let A, X;
  do {
    A = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => int(-2, 2, rnd)));
    X = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => int(-1, 2, rnd)));   // cột = x1, x2, x3
  } while (!determinant(A) || !determinant(X) || Math.abs(determinant(X)) > 2);
  const xs = transpose(X), bs = xs.map(x => matVec(A, x));
  const cs = [0, 0, 0].map(() => int(-2, 2, rnd));
  if (cs.every(c => c === 0)) cs[0] = 1;
  const b = combine(cs, bs), x = combine(cs, xs);
  return {
    stem: 'Matrix times vectors. You do not need to find A.',
    parts: [
      { pts: 5, q: `A is a 3×3 matrix with A·${col(xs[0])} = ${col(bs[0])}, A·${col(xs[1])} = ${col(bs[1])}, A·${col(xs[2])} = ${col(bs[2])}. Write b = ${col(b)} as a combination of the three vectors on the right-hand sides.`,
        a: [`b = ${cs[0]}·b₁ + ${cs[1]}·b₂ + ${cs[2]}·b₃  (solve the 3×3 system for the coefficients)`], facts: { A, xs, bs, cs, b } },
      { pts: 5, q: `Find x such that Ax = b.`,
        a: [`Ax = ${cs[0]}·Ax₁ + ${cs[1]}·Ax₂ + ${cs[2]}·Ax₃, so x = ${cs[0]}·x₁ + ${cs[1]}·x₂ + ${cs[2]}·x₃ = ${col(x)}`], facts: { x } },
    ],
  };
}

export function makePlane(rnd) {
  const p = int(-2, 2, rnd), q = int(-2, 2, rnd);
  const u = [-p, 1, 0], v = [-q, 0, 1], al = int(-2, 3, rnd), be = int(-2, 3, rnd) || 1;
  const b = combine([al, be], [u, v]), A = [[u[0], v[0]], [u[1], v[1]], [u[2], v[2]]];
  const plane = `x ${p < 0 ? '−' : '+'} ${Math.abs(p)}y ${q < 0 ? '−' : '+'} ${Math.abs(q)}z = 0`;
  return {
    stem: `The plane P is ${plane} in R³.`,
    parts: [
      { pts: 6, q: 'Find a 3×2 matrix A whose column space is exactly P.',
        a: [`Pick two independent vectors in P, e.g. ${col(u)} and ${col(v)}.`, `A = ${fmtMat(A)}  (any two independent vectors of P work)`], facts: { p, q, u, v, A } },
      { pts: 6, q: `Using YOUR matrix A, find x such that Ax = b = ${col(b)}.`,
        a: [`With the matrix above: x = ${col([al, be])}.`, 'Another valid A gives another x: check that Ax = b.'], facts: { b, x: [al, be] } },
    ],
  };
}

export function makeRankOne(rnd) {
  let u, v, k;
  do {
    u = [int(-2, 2, rnd), int(-2, 2, rnd), int(-2, 2, rnd)];
    v = [int(-2, 2, rnd), int(-2, 2, rnd), int(-2, 2, rnd)];
    k = dot(u, v);
  } while (![2, -1, -2].includes(k) || u.every(x => !x) || v.every(x => !x));
  const A = multiply(u.map(x => [x]), [v]), A2 = multiply(A, A), A10 = A.map(r => r.map(x => x * k ** 9));
  return {
    stem: `Let u = ${col(u)} and v = ${col(v)}, and A = u vᵀ.`,
    parts: [
      { pts: 8, q: 'Write out A, find its rank, and compute A².',
        a: [`A = ${fmtMat(A)}`, 'rank(A) = 1 (every row is a multiple of vᵀ)', `A² = ${fmtMat(A2)}`], facts: { u, v, k, A, A2 } },
      { pts: 7, q: 'Explain why A² is a multiple of A (use associativity), then find A¹⁰.',
        a: [`A² = u(vᵀu)vᵀ = (vᵀu)A, and vᵀu = ${k}`, `A¹⁰ = (vᵀu)⁹ A = ${k ** 9}·A = ${fmtMat(A10)}`], facts: { A10 } },
    ],
  };
}

/* ---------------------------------------------------------------
   ĐỀ NHƯ THẬT (Linear Algebra) — câu về vector và phép nhân ma trận (thuần, chữ Anh: đề thi bằng tiếng Anh).
   Mỗi maker(rnd) → { stem, parts: [{ pts, q, a, facts }] }; công thức LaTeX giữa $…$ (xem mock-tex.js).
   --------------------------------------------------------------- */
import { int, pick } from '@shared/logic/shuffle.js';
import { dot, combine } from './vector.js';
import { multiply, transpose, determinant, matVec } from './matrix.js';
import { solve } from './linear-system.js';
import { num, mat, vec, M, elimLines } from './mock-tex.js';

const r = String.raw;
const permute = (vs, rnd) => {
  const idx = [0, 1, 2].sort(() => rnd() - 0.5), sg = [0, 1, 2].map(() => (rnd() < 0.5 ? -1 : 1));
  return vs.map(v => idx.map((k, i) => v[k] * sg[i]));
};
const sgn = (x, name) => `${x < 0 ? '-' : '+'} ${Math.abs(x) === 1 ? '' : Math.abs(x)}${name}`;

// u, v, góc (độ), cos θ (LaTeX): cos θ đẹp
const ANGLES = [[[1, 1, 0], [0, 1, 1], 60, r`\tfrac12`], [[1, 0, 1], [0, 1, 0], 90, '0'], [[1, 1, 0], [1, 0, 0], 45, r`\tfrac{\sqrt2}{2}`],
  [[1, 1, 0], [-1, 0, 0], 135, r`-\tfrac{\sqrt2}{2}`], [[1, 0, 0], [1, 0, 1], 45, r`\tfrac{\sqrt2}{2}`]];
// (a, b, c, |v|) với a²+b²+c² = |v|²
const QUADS = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11]];

export function makeDot(rnd) {
  const k = pick([2, 3, 4], rnd), c = pick([r`\tfrac12`, r`\tfrac13`, r`-\tfrac14`, r`\tfrac25`], rnd);
  const [u, v, deg, cos] = pick(ANGLES, rnd);
  const [pu, pv] = permute([u, v], rnd);
  const [a, b, d, n] = pick(QUADS, rnd);
  const [w] = permute([[a, b, d]], rnd);
  const unit = w.map(x => x / n), d1 = dot(pu, pv);
  return {
    stem: 'Vectors, dot products and angles.',
    parts: [
      { pts: 5, q: r`Let $v$ and $w$ be unit vectors with $v\cdot w = ${c}$. Compute $(v + ${k}w)\cdot(v - ${k}w)$.`,
        a: [M(r`(v + ${k}w)\cdot(v - ${k}w) = v\cdot v - ${k}\,v\cdot w + ${k}\,w\cdot v - ${k * k}\,w\cdot w`),
          r`$= |v|^2 - ${k * k}|w|^2 = 1 - ${k * k} = ${1 - k * k}$ (the cross terms cancel, so the value does not depend on $v\cdot w$).`],
        facts: { k, answer: 1 - k * k } },
      { pts: 5, q: r`Find the angle between $u = ${vec(pu)}$ and $v = ${vec(pv)}$.`,
        a: [M(r`u\cdot v = ${d1}, \quad |u| = \sqrt{${dot(pu, pu)}}, \quad |v| = \sqrt{${dot(pv, pv)}}`),
          M(r`\cos\theta = \dfrac{u\cdot v}{|u|\,|v|} = ${cos} \;\Rightarrow\; \theta = ${deg}^\circ`)],
        facts: { u: pu, v: pv, deg } },
      { pts: 5, q: r`Find a unit vector in the same direction as $w = ${vec(w)}$ and a unit vector in the opposite direction.`,
        a: [M(r`|w| = \sqrt{${w.map(x => `${x}^2`).join(' + ')}} = \sqrt{${dot(w, w)}} = ${n}`),
          r`Same direction: $\dfrac{w}{|w|} = \tfrac1{${n}}${vec(w)} = ${vec(unit)}$.`,
          r`Opposite direction: $-\dfrac{w}{|w|} = ${vec(unit.map(x => -x))}$.`],
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
  const B = transpose(bs), aug = B.map((row, i) => [...row, b[i]]), { lines } = elimLines(aug, 3, true);
  const eq = xs.map((xi, i) => r`A${vec(xi)} = ${vec(bs[i])}`).join(r`,\quad `);
  return {
    stem: r`Matrix times vectors. You do not need to find $A$.`,
    parts: [
      { pts: 5, q: r`$A$ is a $3\times 3$ matrix with $${eq}$. Write $b = ${vec(b)}$ as a combination of $b_1, b_2, b_3$.`,
        a: [r`Solve $c_1 b_1 + c_2 b_2 + c_3 b_3 = b$, i.e. reduce $[\,b_1\; b_2\; b_3 \mid b\,]$:`, ...lines,
          M(r`b = ${cs[0]}\,b_1 + ${cs[1]}\,b_2 + ${cs[2]}\,b_3`)], facts: { A, xs, bs, cs, b } },
      { pts: 5, q: r`Find $x$ such that $Ax = b$.`,
        a: [M(r`Ax = ${cs[0]}\,Ax_1 + ${cs[1]}\,Ax_2 + ${cs[2]}\,Ax_3 = b \;\Rightarrow\; x = ${cs[0]}\,x_1 + ${cs[1]}\,x_2 + ${cs[2]}\,x_3 = ${vec(x)}`)], facts: { x } },
    ],
  };
}

export function makePlane(rnd) {
  const p = int(-2, 2, rnd), q = int(-2, 2, rnd);
  const u = [-p, 1, 0], v = [-q, 0, 1], al = int(-2, 3, rnd), be = int(-2, 3, rnd) || 1;
  const b = combine([al, be], [u, v]), A = [[u[0], v[0]], [u[1], v[1]], [u[2], v[2]]];
  const plane = `x ${sgn(p, 'y')} ${sgn(q, 'z')} = 0`;
  return {
    stem: r`The plane $P$ is $${plane}$ in $\mathbb{R}^3$.`,
    parts: [
      { pts: 6, q: r`Find a $3\times 2$ matrix $A$ whose column space is exactly $P$.`,
        a: [r`Solve for $x$: $x = ${num(-p)}\,y ${q > 0 ? '-' : '+'} ${Math.abs(q)}\,z$, with $y, z$ free.`,
          M(r`y = 1, z = 0: ${vec(u)}; \qquad y = 0, z = 1: ${vec(v)}`),
          r`$A = ${mat(A)}$ (any two independent vectors of $P$ work).`], facts: { p, q, u, v, A } },
      { pts: 6, q: r`Using YOUR matrix $A$, find $x$ such that $Ax = b = ${vec(b)}$.`,
        a: [r`With the matrix above, $b = ${al}\,${vec(u)} + ${be}\,${vec(v)}$, so $x = ${vec([al, be])}$.`,
          'Another valid $A$ gives another $x$: always check $Ax = b$.'], facts: { b, x: [al, be] } },
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
  const A = multiply(u.map(x => [x]), [v]), A2 = multiply(A, A), A10 = A.map(row => row.map(x => x * k ** 9));
  return {
    stem: r`Let $u = ${vec(u)}$ and $v = ${vec(v)}$, and $A = uv^{T}$.`,
    parts: [
      { pts: 8, q: r`Write out $A$, find its rank, and compute $A^2$.`,
        a: [M(r`A = uv^T = ${vec(u)}${mat([v])} = ${mat(A)}`), r`$\operatorname{rank}(A) = 1$ (every row is a multiple of $v^T$).`,
          M(r`A^2 = ${mat(A)}${mat(A)} = ${mat(A2)}`)], facts: { u, v, k, A, A2 } },
      { pts: 7, q: r`Explain why $A^2$ is a multiple of $A$ (use associativity), then find $A^{10}$.`,
        a: [M(r`A^2 = u(v^Tu)v^T = (v^Tu)\,A, \quad v^Tu = ${k}`),
          M(r`A^{10} = (v^Tu)^9 A = ${k}^9 A = ${k ** 9}\,A = ${mat(A10)}`)], facts: { A10 } },
    ],
  };
}

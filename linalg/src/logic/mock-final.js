/* ---------------------------------------------------------------
   PRACTICE FINAL EXAM (Linear Algebra), pure. Scope = class after the midterm (D75): Strang 3.5–3.6, 4.1–4.3
   (independence, basis, dimension, four subspaces, orthogonality, projections, least squares).
   Each maker(rnd) → { stem, parts: [{ pts, q, a, facts }] }; LaTeX between $…$; facts = raw data for the oracle test.
   --------------------------------------------------------------- */
import { int, pick } from '@shared/logic/shuffle.js';
import { multiply, transpose, matVec } from './matrix.js';
import { solve } from './linear-system.js';
import { num, mat, vec, elimLines } from './mock-tex.js';

const r = String.raw;
const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
const L3 = (a, b, c) => [[1, 0, 0], [a, 1, 0], [b, c, 1]];
const rr = rnd => int(-2, 2, rnd);
const list = vs => vs.map(v => `$${vec(v)}$`).join(', ');
const inv2 = M => { const d = M[0][0] * M[1][1] - M[0][1] * M[1][0]; return [[M[1][1] / d, -M[0][1] / d], [-M[1][0] / d, M[0][0] / d]]; };
const rankOf = A => elimLines(A, 0).fw.pivots.length;

// dim of a matrix space: [name, formula, value for n = 3]
const SPACES = [
  [r`symmetric $3 \times 3$ matrices`, r`\tfrac{n(n+1)}{2} = 6`, 6, r`the $3$ diagonal entries and the $3$ entries above it fix the matrix`],
  [r`upper triangular $3 \times 3$ matrices`, r`\tfrac{n(n+1)}{2} = 6`, 6, r`one basis matrix for each entry on or above the diagonal`],
  [r`diagonal $3 \times 3$ matrices`, r`n = 3`, 3, r`one basis matrix for each diagonal entry`],
  [r`skew-symmetric $3 \times 3$ matrices ($A^T = -A$)`, r`\tfrac{n(n-1)}{2} = 3`, 3, r`the diagonal is $0$ and the entries above it fix the ones below`],
  [r`all $2 \times 3$ matrices`, r`mn = 6`, 6, r`one basis matrix for each of the $6$ entries`],
];

export function makeIndependence(rnd) {
  let v1, v2, v4, al, be;
  do {
    v1 = [1, rr(rnd), rr(rnd), rr(rnd)]; v2 = [0, pick([1, -1, 2], rnd), rr(rnd), rr(rnd)]; v4 = [rr(rnd), rr(rnd), rr(rnd), rr(rnd)];
    al = pick([1, 2, -1], rnd); be = pick([1, -1, 2, -2], rnd);
  } while (rankOf(transpose([v1, v2, v4])) !== 3);
  const v3 = v1.map((x, i) => al * x + be * v2[i]), vs = [v1, v2, v3, v4], A = transpose(vs);
  const { lines, nFwd, bw, show } = elimLines(A, 0, true), R = show(bw.matrix);
  const c = solve(A, [0, 0, 0, 0]).special[0], sp = pick(SPACES, rnd);
  const combo = c.map((k, i) => (k === 0 ? '' : `${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : num(Math.abs(k))}v_${i + 1}`)).join(' ').replace(/^\s*\+ /, '');
  return {
    stem: r`Let $v_1, v_2, v_3, v_4$ be ${list(vs)} in $\mathbb{R}^4$.`,
    parts: [
      { pts: 12, q: r`Are $v_1, v_2, v_3, v_4$ linearly independent? If not, find a combination with not all coefficients $0$ that gives the zero vector.`,
        a: [r`Put the vectors in the columns of $A$ and solve $Ax = 0$:`, ...lines, r`$R = ${mat(R)}$. Column $3$ has no pivot, so $Ax = 0$ has a nonzero solution: the vectors are dependent.`,
          r`Special solution $x = ${vec(c)}$, so $${combo} = 0$.`], facts: { vs, c } },
      { pts: 13, q: r`Find a basis for the span of $v_1, v_2, v_3, v_4$ and its dimension. Do the vectors span $\mathbb{R}^4$?`,
        a: [r`The pivot columns $1, 2, 4$ of $A$ are a basis: $v_1, v_2, v_4$ (take the columns of $A$, not of $R$).`,
          r`The dimension is $3$ (the rank). $3 < 4$, so they do not span $\mathbb{R}^4$.`], facts: { basis: [0, 1, 3], dim: 3, R } },
      { pts: 10, q: r`What is the dimension of the space of ${sp[0]}? Explain.`,
        a: [r`$\dim = ${sp[1]}$: ${sp[3]}.`], facts: { dim: sp[2] } },
    ],
  };
}

const PIV = [[0, 1], [0, 2], [1, 3]];

export function makeFourSubspaces(rnd) {
  const [p1, p2] = pick(PIV, rnd), l = [rr(rnd), rr(rnd), rr(rnd)];
  const row = (p, first) => Array.from({ length: 4 }, (_, k) => (k < p ? 0 : k === p ? first : rr(rnd)));
  const A = multiply(L3(...l), [row(p1, pick([1, 2, -1], rnd)), row(p2, pick([1, 2, -1], rnd)), [0, 0, 0, 0]]);
  const { lines, bw, show } = elimLines(A, 0, true), R = show(bw.matrix);
  const pc = [p1, p2], cols = transpose(A), rowBasis = R.slice(0, 2), special = solve(A, [0, 0, 0]).special;
  const y = [l[0] * l[2] - l[1], -l[2], 1];                       // row 3 of L⁻¹: yᵀA = 0
  const inside = rnd() < 0.5, x0 = [rr(rnd), rr(rnd), rr(rnd), rr(rnd)], bIn = matVec(A, x0);
  const b = inside ? bIn : bIn.map((v, i) => v + y[i]), yb = dot(y, b);
  return {
    stem: r`Let $A = ${mat(A)}$.`,
    parts: [
      { pts: 12, q: r`Find the reduced row echelon form $R$ of $A$ and the rank of $A$.`,
        a: [...lines, r`$R = ${mat(R)}$, two pivots, so $\operatorname{rank}(A) = 2$.`], facts: { A, R } },
      { pts: 20, q: r`Give a basis and the dimension of each of the four subspaces $C(A)$, $C(A^T)$, $N(A)$, $N(A^T)$.`,
        a: [r`$C(A)$: pivot columns of $A$: ${list(pc.map(k => cols[k]))}; $\dim = 2$.`,
          r`$C(A^T)$: nonzero rows of $R$: ${list(rowBasis)}; $\dim = 2$.`,
          r`$N(A)$: special solutions ${list(special)}; $\dim = n - r = 2$.`,
          r`$N(A^T)$: the row combination that gives the zero row, $y = ${vec(y)}$ ($y^T A = 0$); $\dim = m - r = 1$.`],
        facts: { colBasis: pc.map(k => cols[k]), rowBasis, special, y } },
      { pts: 8, q: r`Check that $N(A)$ is orthogonal to $C(A^T)$, and that the dimensions add up as the Fundamental Theorem says.`,
        a: [r`Each special solution has dot product $0$ with each row of $R$ (and so with each row of $A$).`,
          r`$\dim C(A^T) + \dim N(A) = 2 + 2 = 4 = n$ and $\dim C(A) + \dim N(A^T) = 2 + 1 = 3 = m$.`], facts: {} },
      { pts: 10, q: r`Use $N(A^T)$ to decide if $b = ${vec(b)}$ is in $C(A)$.`,
        a: [r`$b \in C(A)$ exactly when $b \perp N(A^T)$, that is $y^T b = 0$.`,
          r`$y^T b = ${num(yb)}$, so $b$ is ${inside ? 'in' : 'not in'} $C(A)$${inside ? r` ($Ax = b$ is solvable)` : r` ($Ax = b$ has no solution)`}.`], facts: { b, yb, inside } },
    ],
  };
}

export function makeProjLine(rnd) {
  let a, b;
  do { a = [rr(rnd), rr(rnd), rr(rnd)]; b = [int(-3, 3, rnd), int(-3, 3, rnd), int(-3, 3, rnd)]; }
  while (dot(a, a) === 0 || dot(a, b) === 0 || a[1] * b[2] - a[2] * b[1] === 0 && a[0] * b[2] - a[2] * b[0] === 0 && a[0] * b[1] - a[1] * b[0] === 0);
  const aa = dot(a, a), ab = dot(a, b), xh = ab / aa, p = a.map(v => v * xh), e = b.map((v, i) => v - p[i]);
  const P = a.map(u => a.map(v => u * v / aa));
  return {
    stem: r`Let $a = ${vec(a)}$ and $b = ${vec(b)}$.`,
    parts: [
      { pts: 12, q: r`Project $b$ onto the line through $a$: find $\hat x$ and the projection $p$.`,
        a: [r`$\hat x = \dfrac{a^T b}{a^T a} = \dfrac{${ab}}{${aa}} = ${num(xh)}$, so $p = \hat x\, a = ${vec(p)}$.`], facts: { a, b, xh, p } },
      { pts: 10, q: r`Find the projection matrix $P$. What are $P^2$ and the rank of $P$?`,
        a: [r`$P = \dfrac{a a^T}{a^T a} = ${mat(P)}$.`, r`$P^2 = P$ (projecting twice changes nothing), and $\operatorname{rank}(P) = 1$ (its column space is the line).`], facts: { P } },
      { pts: 8, q: r`Find the error $e = b - p$ and check that it is perpendicular to $a$.`,
        a: [r`$e = ${vec(e)}$, and $a^T e = ${a.map((v, i) => `(${v})(${num(e[i])})`).join(' + ')} = 0$.`], facts: { e } },
    ],
  };
}

const COLS = [[[1, 0], [1, 1], [0, 1]], [[1, 1], [1, 0], [0, 1]], [[1, 0], [0, 1], [1, 1]], [[1, 2], [1, 0], [0, 1]], [[1, 1], [0, 1], [1, 0]], [[1, 0], [1, 1], [1, 2]], [[1, -1], [1, 0], [1, 1]]];

export function makeProjPlane(rnd) {
  const A = pick(COLS, rnd), At = transpose(A);
  let b;
  do b = [int(-3, 4, rnd), int(-3, 4, rnd), int(-3, 4, rnd)]; while (solve(A, b).type !== 'none');
  const AtA = multiply(At, A), Atb = matVec(At, b), inv = inv2(AtA), xh = matVec(inv, Atb);
  const p = matVec(A, xh), e = b.map((v, i) => v - p[i]), P = multiply(multiply(A, inv), At);
  return {
    stem: r`Let $A = ${mat(A)}$ and $b = ${vec(b)}$.`,
    parts: [
      { pts: 15, q: r`Write the normal equations $A^T A \hat x = A^T b$ and solve them for $\hat x$.`,
        a: [r`$A^T A = ${mat(AtA)}$, $\quad A^T b = ${vec(Atb)}$.`, r`$(A^T A)^{-1} = ${mat(inv)}$, so $\hat x = ${vec(xh)}$.`], facts: { A, b, AtA, Atb, xh } },
      { pts: 10, q: r`Find the projection $p = A\hat x$ of $b$ onto $C(A)$ and the error $e = b - p$. Check that $e$ is perpendicular to both columns of $A$.`,
        a: [r`$p = ${vec(p)}$, $\quad e = ${vec(e)}$.`, r`$A^T e = ${vec(matVec(At, e))}$: $e$ is in $N(A^T)$, perpendicular to $C(A)$.`], facts: { p, e } },
      { pts: 15, q: r`Find the projection matrix $P = A(A^T A)^{-1} A^T$. Why can you not write $(A^T A)^{-1} = A^{-1}(A^T)^{-1}$ here?`,
        a: [r`$P = ${mat(P)}$ (symmetric, and $Pb = p$).`, r`$A$ is $3 \times 2$, not square, so $A^{-1}$ does not exist.`], facts: { P } },
    ],
  };
}

const TS = [[-1, 0, 1], [0, 1, 2], [-2, 0, 2], [0, 1, 2, 3], [-1, 0, 1, 2], [1, 2, 3]];

export function makeLeastSquares(rnd) {
  const t = pick(TS, rnd), m = t.length, A = t.map(v => [1, v]), At = transpose(A);
  let b, xh, e;
  do {
    b = t.map(() => int(0, 6, rnd));
    xh = matVec(inv2(multiply(At, A)), matVec(At, b)); e = b.map((v, i) => v - xh[0] - xh[1] * t[i]);
  } while (e.every(v => Math.abs(v) < 1e-9));
  const AtA = multiply(At, A), Atb = matVec(At, b), p = b.map((v, i) => v - e[i]), ee = dot(e, e);
  const pts = t.map((v, i) => `(${v}, ${b[i]})`).join(', ');
  return {
    stem: r`Fit a straight line $b = C + Dt$ to the ${m} points $${pts}$ by least squares.`,
    parts: [
      { pts: 8, q: r`Write the system $Ax = b$ with $x = (C, D)$. Why does it have no exact solution?`,
        a: [r`$A = ${mat(A)}$, $\quad b = ${vec(b)}$.`, r`${m} equations and $2$ unknowns: the points are not on one line, so $b \notin C(A)$.`], facts: { A, b } },
      { pts: 20, q: r`Solve the normal equations $A^T A \hat x = A^T b$ for $\hat C$ and $\hat D$.`,
        a: [r`$A^T A = ${mat(AtA)}$, $\quad A^T b = ${vec(Atb)}$.`, r`$\hat C = ${num(xh[0])}$, $\hat D = ${num(xh[1])}$: the best line is $b = ${num(xh[0])} ${xh[1] < 0 ? '-' : '+'} ${num(Math.abs(xh[1]))}t$.`],
        facts: { t, b, xh } },
      { pts: 12, q: r`Find $p = A\hat x$, the error $e = b - p$ and $\|e\|^2$. Check that $e$ is perpendicular to both columns of $A$.`,
        a: [r`$p = ${vec(p)}$, $\quad e = ${vec(e)}$, $\quad \|e\|^2 = ${num(ee)}$.`,
          r`Sum of the $e_i$ is $0$ and $\sum t_i e_i = 0$, so $A^T e = 0$.`], facts: { p, e, ee } },
      { pts: 5, q: r`In which of the four subspaces of $A$ is $e$?`, a: [r`$e \in N(A^T)$, the left null space (it is perpendicular to $C(A)$).`], facts: {} },
    ],
  };
}

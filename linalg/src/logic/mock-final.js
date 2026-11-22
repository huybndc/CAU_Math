/* ---------------------------------------------------------------
   PRACTICE FINAL EXAM (Linear Algebra), pure. Scope = class after the midterm (D75): Strang 3.5–3.6, 4.1–4.4, 5.1–5.3
   (independence, basis, dimension, four subspaces, orthogonality, projections, least squares, Gram–Schmidt and QR,
   determinants, cofactors, Cramer's rule, volumes). Each part 0 has facts.kind so tests can find the question type.
   Each maker(rnd) → { stem, parts: [{ pts, q, a, facts }] }; LaTeX between $…$; facts = raw data for the oracle test.
   --------------------------------------------------------------- */
import { int, pick } from '@shared/logic/shuffle.js';
import { multiply, transpose, matVec, determinant, cofactor } from './matrix.js';
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
          r`Special solution $x = ${vec(c)}$, so $${combo} = 0$.`], facts: { kind: 'indep', vs, c } },
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
        a: [...lines, r`$R = ${mat(R)}$, two pivots, so $\operatorname{rank}(A) = 2$.`], facts: { kind: 'four', A, R } },
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
        a: [r`$\hat x = \dfrac{a^T b}{a^T a} = \dfrac{${ab}}{${aa}} = ${num(xh)}$, so $p = \hat x\, a = ${vec(p)}$.`], facts: { kind: 'projLine', a, b, xh, p } },
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
        a: [r`$A^T A = ${mat(AtA)}$, $\quad A^T b = ${vec(Atb)}$.`, r`$(A^T A)^{-1} = ${mat(inv)}$, so $\hat x = ${vec(xh)}$.`], facts: { kind: 'projPlane', A, b, AtA, Atb, xh } },
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
        a: [r`$A = ${mat(A)}$, $\quad b = ${vec(b)}$.`, r`${m} equations and $2$ unknowns: the points are not on one line, so $b \notin C(A)$.`], facts: { kind: 'ls', A, b } },
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

/* ---- Strang 5.1–5.2: properties of determinants, pivot formula (slides Ch5 pp. 2–19) ---- */
const rand3 = (lo, hi, rnd) => Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => int(lo, hi, rnd)));
const TRANSFORMS = [
  { tex: '2A', rule: r`\det(2A) = 2^3 \det A`, val: d => 8 * d },
  { tex: '-A', rule: r`\det(-A) = (-1)^3 \det A`, val: d => -d },
  { tex: 'A^{-1}', rule: r`\det(A^{-1}) = \dfrac{1}{\det A}`, val: d => 1 / d },
  { tex: 'A^T', rule: r`\det(A^T) = \det A`, val: d => d },
  { tex: 'A^2', rule: r`\det(A^2) = (\det A)^2`, val: d => d * d },
  { tex: 'A^T A', rule: r`\det(A^T A) = \det A^T \det A = (\det A)^2`, val: d => d * d },
];

export function makeDeterminant(rnd) {
  let A, e;
  do {
    A = rand3(-2, 3, rnd);
    if (rnd() < 0.5) A[0][0] = 0;
    e = elimLines(A, 0);
  } while (e.fw.pivots.length < 3 || Math.abs(determinant(A)) < 2 || Math.abs(determinant(A)) > 20);
  const diag = [0, 1, 2].map(i => e.fw.matrix[i][i]), swaps = e.lines.filter(l => l.includes('leftrightarrow')).length;
  const det = determinant(A), sign = swaps % 2 ? -1 : 1;
  const picks = [...TRANSFORMS].sort(() => rnd() - 0.5).slice(0, 3);
  // B has one unknown c in row 3: rows 1 and 2 are free, row 3 = k1 row 1 + k2 row 2 at c = c0
  let B0, j, alpha;
  do {
    const r1 = Array.from({ length: 3 }, () => int(-2, 3, rnd)), r2 = Array.from({ length: 3 }, () => int(-2, 3, rnd)), k1 = int(-1, 2, rnd), k2 = pick([-1, 1, 2], rnd);
    B0 = [r1, r2, r1.map((v, i) => k1 * v + k2 * r2[i])];
    j = int(0, 2, rnd);
    alpha = cofactor(B0, 2, j);
  } while (alpha === 0);
  const c0 = B0[2][j], Bc = B0.map((row, i) => row.map((v, k) => (i === 2 && k === j ? 'c' : v)));
  const beta = -alpha * c0, lin = `${num(alpha)}c ${beta < 0 ? '-' : '+'} ${num(Math.abs(beta))}`;
  return {
    stem: r`Let $A = ${mat(A)}$.`,
    parts: [
      { pts: 12, q: r`Find $\det A$ by elimination (the pivot formula).`,
        a: [...e.lines, r`$U$ has the pivots $${diag.map(num).join(', ')}$ on its diagonal. ${swaps ? `There ${swaps === 1 ? 'is one row exchange' : `are ${swaps} row exchanges`}, so the sign is $${sign < 0 ? '-' : '+'}$.` : 'There is no row exchange.'}`,
          r`$\det A = ${sign < 0 ? '-' : ''}(${diag.map(num).join(')(')}) = ${det}$.`], facts: { kind: 'det', A, det, diag, swaps } },
      { pts: 13, q: r`Use $\det A$ to find ${picks.map(t => `$\\det(${t.tex})$`).join(', ')}. Name the rule for each.`,
        a: picks.map(t => r`$${t.rule} = ${num(t.val(det))}$`), facts: { items: picks.map(t => ({ tex: t.tex, value: t.val(det) })) } },
      { pts: 10, q: r`For which value of $c$ is $B = ${mat(Bc)}$ singular?`,
        a: [r`Expand along row $3$: $\det B = ${lin}$ (the cofactor of $c$ is $${num(alpha)}$).`,
          r`$B$ is singular exactly when $\det B = 0$, so $c = ${c0}$.`], facts: { B0, j, c0, alpha } },
    ],
    refs: [['5.1', 'The Properties of Determinants'], ['5.2', 'Permutations and Cofactors']],
  };
}

/* ---- Strang 5.2–5.3: cofactors, inverse by cofactors, Cramer's rule (slides Ch5 pp. 15–25) ---- */
export function makeCramer(rnd) {
  let A, row;
  do {
    A = rand3(-2, 3, rnd);
    row = int(0, 2, rnd);
    const zeros = [0, 1, 2].sort(() => rnd() - 0.5).slice(0, 2);
    zeros.forEach(k => { A[row][k] = 0; });
  } while (Math.abs(determinant(A)) < 1 || Math.abs(determinant(A)) > 12);
  const det = determinant(A), x0 = [int(-2, 3, rnd), int(-2, 3, rnd), int(-2, 3, rnd)], b = matVec(A, x0);
  const C = A.map((_, i) => A.map((__, j) => cofactor(A, i, j))), Ct = transpose(C), inv = Ct.map(rw => rw.map(v => v / det));
  const j0 = A[row].findIndex(v => v !== 0), Bs = [0, 1, 2].map(k => A.map((rw, i) => rw.map((v, m) => (m === k ? b[i] : v)))), dets = Bs.map(determinant);
  return {
    stem: r`Let $A = ${mat(A)}$ and $b = ${vec(b)}$.`,
    parts: [
      { pts: 10, q: r`Find $\det A$ by cofactors along the row with the most zeros.`,
        a: [r`Row $${row + 1}$ has two zeros, so only one cofactor is needed.`, r`$C_{${row + 1}${j0 + 1}} = (-1)^{${row + j0 + 2}} \det M_{${row + 1}${j0 + 1}} = ${num(C[row][j0])}$, so $\det A = a_{${row + 1}${j0 + 1}} C_{${row + 1}${j0 + 1}} = (${A[row][j0]})(${num(C[row][j0])}) = ${det}$.`],
        facts: { kind: 'cramer', A, row, det } },
      { pts: 12, q: r`Find the cofactor matrix $C$ and use it to write $A^{-1}$.`,
        a: [r`$C_{ij} = (-1)^{i+j} \det M_{ij}$ gives $C = ${mat(C)}$.`, r`$A^{-1} = \dfrac{C^T}{\det A}$ (note $C^T$, not $C$): $A^{-1} = \dfrac{1}{${det}} ${mat(Ct)} = ${mat(inv)}$.`], facts: { C, inv } },
      { pts: 8, q: r`Solve $Ax = b$ by Cramer's rule.`,
        a: [r`$B_j$ is $A$ with column $j$ replaced by $b$: $\det B_1 = ${num(dets[0])}$, $\det B_2 = ${num(dets[1])}$, $\det B_3 = ${num(dets[2])}$.`,
          r`$x_j = \dfrac{\det B_j}{\det A}$ gives $x = ${vec(x0)}$.`], facts: { b, dets, x: x0 } },
    ],
    refs: [['5.2', 'Permutations and Cofactors'], ['5.3', "Cramer's Rule, Inverses, and Volumes"]],
  };
}

/* ---- Strang 4.4: orthonormal columns, Gram–Schmidt, A = QR (slides Ch4 pp. 33–43) ---- */
const ORTHO = [[[1, 2, 2], [2, 1, -2], [2, -2, 1]], [[3, 4, 0], [-4, 3, 0], [0, 0, 5]]];

export function makeGramSchmidt(rnd) {
  const fam = pick(ORTHO, rnd), n = Math.hypot(...fam[0]);
  const perm = [0, 1, 2].sort(() => rnd() - 0.5), sg = [0, 1, 2].map(() => pick([1, -1], rnd));
  const U = fam.map(u => perm.map((k, i) => sg[i] * u[k])).sort(() => rnd() - 0.5);        // orthogonal columns, each of length n
  let k1, k2, k3, m21, m31, m32;
  do { [k1, k2, k3] = [pick([1, 2], rnd), pick([1, 2], rnd), pick([1, 2], rnd)]; [m21, m31, m32] = [int(-2, 2, rnd), int(-2, 2, rnd), int(-2, 2, rnd)]; } while (!m21 || !m32);
  const comb = (...p) => U[0].map((_, i) => p.reduce((s, [k, u]) => s + k * u[i], 0));
  const a = comb([k1, U[0]]), b = comb([m21, U[0]], [k2, U[1]]), c = comb([m31, U[0]], [m32, U[1]], [k3, U[2]]);
  const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0), sub = (u, v, t) => u.map((x, i) => x - t * v[i]);
  const t1 = dot(a, b) / dot(a, a), B = sub(b, a, t1), t2 = dot(a, c) / dot(a, a), t3 = dot(B, c) / dot(B, B), C = sub(sub(c, a, t2), B, t3);
  const Q = transpose(U.map(u => u.map(v => v / n))), A = transpose([a, b, c]), R = [[n * k1, n * m21, n * m31], [0, n * k2, n * m32], [0, 0, n * k3]];
  const x0 = [int(-2, 2, rnd), int(-2, 2, rnd), pick([1, 2, -1], rnd)], v = matVec(A, x0), x1 = [1, 2, 2], Qx = matVec(Q, x1);
  const QtA = multiply(transpose(Q), A), Qtv = matVec(transpose(Q), v);
  return {
    stem: r`Let $a = ${vec(a)}$, $b = ${vec(b)}$ and $c = ${vec(c)}$. They are independent. Let $A = [\,a\ b\ c\,]$.`,
    parts: [
      { pts: 14, q: r`Apply the Gram–Schmidt process to $a, b, c$ and find the orthogonal vectors $A_1, B_1, C_1$.`,
        a: [r`$A_1 = a$, $\quad A_1^T A_1 = ${dot(a, a)}$.`,
          r`$B_1 = b - \dfrac{A_1^T b}{A_1^T A_1} A_1 = b - ${num(t1)}\,A_1 = ${vec(B)}$.`,
          r`$C_1 = c - \dfrac{A_1^T c}{A_1^T A_1} A_1 - \dfrac{B_1^T c}{B_1^T B_1} B_1 = c - ${num(t2)}\,A_1 - ${num(t3)}\,B_1 = ${vec(C)}$.`],
        rubric: [[3, r`$A_1$`], [5, r`$B_1$ (subtract the projection onto $A_1$)`], [6, r`$C_1$ (subtract both projections)`]], facts: { kind: 'gs', a, b, c, B, C } },
      { pts: 8, q: r`Normalize to get $q_1, q_2, q_3$ (the columns of $Q$). Check that $Q^T Q = I$, say what $Q^{-1}$ is, and check $\|Qx\| = \|x\|$ for $x = (1, 2, 2)$.`,
        a: [r`$q_i = A_i / \|A_i\|$ gives $Q = ${mat(Q)}$.`, r`The columns are orthogonal unit vectors, so $Q^T Q = I$ and $Q^{-1} = Q^T$.`,
          r`$Qx = ${vec(Qx)}$ and $\|Qx\|^2 = ${num(dot(Qx, Qx))} = \|x\|^2$.`], facts: { Q, Qx, x1 } },
      { pts: 13, q: r`Find $R = Q^T A$ and check that $A = QR$ with $R$ upper triangular.`,
        a: [r`$R = Q^T A = ${mat(QtA)}$ (upper triangular).`, r`Its diagonal holds $\|A_1\|, \|B_1\|, \|C_1\|$ and $QR = A$.`], facts: { R, QtA } },
      { pts: 5, q: r`Solve $Ax = ${vec(v)}$ with $R x = Q^T v$.`,
        a: [r`$Q^T v = ${vec(Qtv)}$. Back substitution in $Rx = Q^T v$ gives $x = ${vec(x0)}$.`], facts: { v, x: x0, Qtv } },
    ],
    refs: [['4.4', 'Orthogonal Bases and Gram-Schmidt']],
  };
}

/* ---- Strang 5.3: area, volume, cross product (slides Ch5 pp. 26–31) ---- */
export function makeDetGeometry(rnd) {
  const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
  let P, u, v, w, cr;
  do { P = Array.from({ length: 3 }, () => [int(-3, 4, rnd), int(-3, 4, rnd), 1]); } while (!determinant(P));
  const coplanar = rnd() < 0.4;
  do {
    u = [int(-2, 3, rnd), int(-2, 3, rnd), int(-2, 3, rnd)]; v = [int(-2, 3, rnd), int(-2, 3, rnd), int(-2, 3, rnd)]; cr = cross(u, v);
    w = coplanar ? u.map((x, i) => pick([1, -1, 2], rnd) * x + pick([1, -1], rnd) * v[i]) : [int(-2, 3, rnd), int(-2, 3, rnd), int(-2, 3, rnd)];
  } while (dot(cr, cr) === 0 || (dot(cr, w) === 0) !== coplanar);
  const area = determinant(P) / 2, trip = dot(cr, w), M = [u, v, w];
  const terms = [[0, 1, 2, 1], [1, 2, 0, 1], [2, 0, 1, 1], [0, 2, 1, -1], [1, 0, 2, -1], [2, 1, 0, -1]].map(([x, y, z, sg]) => ({ sg, p: M[0][x] * M[1][y] * M[2][z], t: `(${M[0][x]})(${M[1][y]})(${M[2][z]})` }));
  const big = terms.reduce((s, t) => s + t.sg * t.p, 0);
  return {
    stem: r`Let $u = ${vec(u)}$, $v = ${vec(v)}$ and $w = ${vec(w)}$. A triangle has corners $(${P.map(p => `${p[0]}, ${p[1]}`).join('),\\ (')})$.`,
    parts: [
      { pts: 12, q: r`Find the area of the triangle with a determinant.`,
        a: [r`Area $= \tfrac{1}{2} \left| \det ${mat(P)} \right| = \tfrac{1}{2} |${determinant(P)}| = ${num(Math.abs(area))}$.`], facts: { kind: 'detGeo', P, area: Math.abs(area) } },
      { pts: 13, q: r`Find $u \times v$. Check that it is perpendicular to $u$ and $v$, and find the area of the parallelogram with sides $u$ and $v$.`,
        a: [r`$u \times v = \det \begin{bmatrix} i & j & k \\ ${u.join(' & ')} \\ ${v.join(' & ')} \end{bmatrix} = ${vec(cr)}$.`,
          r`$u \cdot (u \times v) = ${dot(u, cr)}$ and $v \cdot (u \times v) = ${dot(v, cr)}$.`, r`Area $= \|u \times v\| = \sqrt{${dot(cr, cr)}}$.`], facts: { u, v, cr, n2: dot(cr, cr) } },
      { pts: 10, q: r`Find the triple product $(u \times v) \cdot w$. What is the volume of the box with edges $u, v, w$? Are $u, v, w$ in one plane?`,
        a: [r`$(u \times v) \cdot w = ${trip}$, so the volume is $${Math.abs(trip)}$.`, trip === 0 ? r`The product is $0$: the box is flat, so $u, v, w$ lie in one plane.` : r`The volume is not $0$, so $u, v, w$ are not in one plane.`], facts: { w, trip, coplanar } },
      { pts: 10, q: r`Check $\det ${mat(M)}$ with the big formula (all six terms).`,
        a: [r`$${terms.map((t, i) => `${t.sg < 0 ? '-' : i ? '+' : ''} ${t.t}`).join(' ')} = ${big}$, the same as the triple product.`], facts: { M, big } },
    ],
    refs: [['5.3', "Cramer's Rule, Inverses, and Volumes"], ['5.2', 'Permutations and Cofactors']],
  };
}

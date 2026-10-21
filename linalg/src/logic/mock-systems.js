/* ---------------------------------------------------------------
   ĐỀ NHƯ THẬT (Linear Algebra) — các câu về khử Gauss, E, nghịch đảo, LU, hạng và nghiệm (thuần, chữ Anh).
   Số liệu và đáp án dùng lại elimination / ldu / linear-system / subspace; test đối chiếu bằng phép nhân riêng.
   --------------------------------------------------------------- */
import { int, pick } from '@shared/logic/shuffle.js';
import { fmtMat } from './quiz-kit.js';
import { fmt } from './num-format.js';
import { multiply, transpose, identity, matVec } from './matrix.js';
import { forward, backward } from './elimination.js';
import { inverseSteps } from './elementary.js';
import { ldu } from './ldu.js';
import { solve } from './linear-system.js';
import { col } from './mock-vectors.js';

const L3 = (a, b, c) => [[1, 0, 0], [a, 1, 0], [b, c, 1]];
const mat = M => fmtMat(M);
const sub = (i, j) => `ℓ${i}${j}`;

/** Cho phép khử cộng: E_ij trừ l lần hàng j khỏi hàng i. */
const elim = (i, j, l) => { const E = identity(3).map(r => r.slice()); E[i][j] = -l; return E; };

export function makeParam(rnd) {
  // A(q) = [[1,a,b],[m2,q,c],[m3,t,e]]: trụ 2 = q − m2·a; q = m2·a ⇒ hỏng tạm thời; q = m2·a + s·g/h ⇒ hỏng vĩnh viễn
  let a, b, m2, m3, s, g, h;
  do { a = int(1, 2, rnd); b = int(1, 2, rnd); m2 = int(1, 3, rnd); m3 = int(1, 3, rnd); s = int(1, 3, rnd); g = int(1, 3, rnd); h = int(1, 2, rnd); }
  while ((s * g) % h);
  const c = g + m2 * b, t = s + m3 * a, e = h + m3 * b, perm = s * g / h, qTemp = m2 * a, qPerm = qTemp + perm;
  const A = q => [[1, a, b], [m2, q, c], [m3, t, e]];
  let p0;
  do { p0 = pick([1, 2, 3, -1], rnd); } while (p0 === perm);
  const q0 = qTemp + p0, A0 = A(q0), l32 = s / p0, u33 = h - s * g / p0;
  const x = [int(-2, 2, rnd), int(-2, 2, rnd), int(-2, 2, rnd)], bv = matVec(A0, x);
  const E21 = elim(1, 0, m2), E31 = elim(2, 0, m3), E32 = elim(2, 1, l32), E = multiply(E32, multiply(E31, E21));
  const P = [[1, 0, 0], [0, 0, 1], [0, 1, 0]];
  const Aq = `[1 ${a} ${b}; ${m2} q ${c}; ${m3} ${t} ${e}]`;
  return {
    stem: `Let A = ${Aq}.`,
    parts: [
      { pts: 10, q: `For q = ${q0} and b = ${col(bv)}: eliminate Ax = b, give the multipliers ${sub(2, 1)}, ${sub(3, 1)}, ${sub(3, 2)} and the pivots, then solve by back substitution.`,
        a: [`${sub(2, 1)} = ${m2}, ${sub(3, 1)} = ${m3}, ${sub(3, 2)} = ${fmt(l32)}`, `pivots: 1, ${p0}, ${fmt(u33)}`, `x = ${col(x)}`],
        facts: { A0, bv, x, mult: [m2, m3, l32], pivots: [1, p0, u33] } },
      { pts: 7, q: 'For the same q, write the elimination matrices E21, E31, E32 and the product E = E32 E31 E21.',
        a: [`E21 = ${mat(E21)}, E31 = ${mat(E31)}, E32 = ${mat(E32)}`, `E = E32 E31 E21 = ${mat(E)}`], facts: { E21, E31, E32, E, A0 } },
      { pts: 8, q: 'For which value of q does elimination break down temporarily (fixed by a row exchange), and for which does it break down permanently? Give the permutation matrix P for the temporary case.',
        a: [`temporary: q = ${qTemp} (second pivot is 0, but the entry below it is ${s} ≠ 0, so exchange rows 2 and 3)`, `permanent: q = ${fmt(qPerm)} (third pivot is 0 and nothing is left to exchange)`, `P = ${mat(P)}`],
        facts: { qTemp, qPerm, P, A: A(qTemp), Aperm: A(qPerm) } },
    ],
  };
}

export function makeInverse(rnd) {
  const r = () => int(-2, 2, rnd);
  const A = multiply(L3(r(), r(), r()), [[1, r(), r()], [0, 1, r()], [0, 0, 1]]);
  const inv = inverseSteps(A), b = [int(-3, 3, rnd), int(-3, 3, rnd), int(-3, 3, rnd)], x = matVec(inv.inverse, b);
  const i = int(0, 1, rnd), j = int(i + 1, 2, rnd), P = identity(3).map(r2 => r2.slice());
  [P[i], P[j]] = [P[j], P[i]];
  const PAinv = multiply(inv.inverse, transpose(P));
  return {
    stem: `Let A = ${mat(A)}.`,
    parts: [
      { pts: 10, q: 'Find A⁻¹ by Gauss–Jordan elimination on [A | I].',
        a: [`[A | I] = ${mat(inv.start)}`, `reduced: [I | A⁻¹] = ${mat(inv.final)}`, `A⁻¹ = ${mat(inv.inverse)}`], facts: { A, inverse: inv.inverse } },
      { pts: 4, q: `Use A⁻¹ to solve Ax = b with b = ${col(b)}.`, a: [`x = A⁻¹b = ${col(x)}`], facts: { b, x } },
      { pts: 6, q: `Let P = ${mat(P)}. Find (PA)⁻¹ without eliminating again.`,
        a: ['(PA)⁻¹ = A⁻¹P⁻¹ = A⁻¹Pᵀ (swap the columns of A⁻¹)', `(PA)⁻¹ = ${mat(PAinv)}`], facts: { P, PAinv } },
    ],
  };
}

export function makeLdl(rnd) {
  const r = () => int(-2, 2, rnd) || 1;
  const L = L3(r(), r(), r()), d = [int(1, 3, rnd), int(1, 3, rnd), int(1, 3, rnd)], D = d.map((v, i) => d.map((_, k) => (i === k ? v : 0)));
  const A = multiply(multiply(L, D), transpose(L)), U = multiply(D, transpose(L));
  // B cần đổi hàng: hàng 2 hết trụ sau bước 1, hàng 3 còn số ở cột 2
  let a, bb, m2, m3, s, g;
  do { a = int(1, 3, rnd); bb = int(1, 3, rnd); m2 = int(1, 3, rnd); m3 = int(1, 3, rnd); s = int(1, 3, rnd); g = int(1, 3, rnd); } while (m2 === m3);
  const B = [[1, a, bb], [m2, m2 * a, g + m2 * bb], [m3, s + m3 * a, int(0, 3, rnd) + m3 * bb]], f = ldu(B);
  return {
    stem: 'Factorizations.',
    parts: [
      { pts: 10, q: `A = ${mat(A)} is symmetric. Factor A = LU, then write A = LDLᵀ.`,
        a: [`L = ${mat(L)}, U = ${mat(U)}`, `D = diag(${d.join(', ')}), A = LDLᵀ with the same L`], facts: { A, L, D, U } },
      { pts: 10, q: `B = ${mat(B)} needs a row exchange. Find P, L, U with PB = LU.`,
        a: [`P = ${mat(f.P)}`, `L = ${mat(f.L)}, U = ${mat(f.U)}`], facts: { B, P: f.P, L: f.L, U: f.U } },
    ],
  };
}

// cặp cột trụ (chỉ số từ 0) cho ma trận 3×4 hạng 2
const PIV = [[0, 1], [0, 2], [1, 3]];

export function makeRref(rnd) {
  const [p1, p2] = pick(PIV, rnd), r = () => int(-2, 2, rnd);
  const row = (p, first) => Array.from({ length: 4 }, (_, k) => (k < p ? 0 : k === p ? first : r()));
  const U0 = [row(p1, pick([1, 2, -1], rnd)), row(p2, pick([1, 2, -1], rnd)), [0, 0, 0, 0]];
  const A = multiply(L3(r(), r(), r()), U0), aug = A.map(x => [...x, 0]);
  const fw = forward(aug), pivots = fw.pivots, bw = backward(fw.matrix, pivots);
  const U = fw.matrix.map(x => x.slice(0, 4)), R = bw.matrix.map(x => x.slice(0, 4));
  const pc = pivots.map(p => p.col), fc = [0, 1, 2, 3].filter(k => !pc.includes(k));
  const sol = solve(A, [0, 0, 0]), special = sol.special;
  const colOf = k => `col${k + 1}`;
  return {
    stem: `Let A = ${mat(A)}.`,
    parts: [
      { pts: 8, q: 'Find an echelon form U and the reduced row echelon form R of A.', a: [`U = ${mat(U)}`, `R = ${mat(R)}`], facts: { A, U, R } },
      { pts: 4, q: 'Find the rank, the pivot columns and the free variables.',
        a: [`rank = ${pc.length}`, `pivot columns: ${pc.map(k => k + 1).join(', ')}`, `free variables: ${fc.map(k => `x${k + 1}`).join(', ')}`], facts: { rank: pc.length, pc, fc } },
      { pts: 8, q: 'Find the special solutions and describe the null space N(A).',
        a: special.map((s, i) => `special solution for ${`x${fc[i] + 1}`} = 1: ${col(s)}`).concat(['N(A) = all combinations of the special solutions']), facts: { special } },
      { pts: 5, q: 'Write each free column of A as a combination of the pivot columns.',
        a: fc.map(k => `${colOf(k)} = ${pc.map((c, i) => `${fmt(R[i][k])}·${colOf(c)}`).join(' + ')}`), facts: { R, pc, fc } },
    ],
  };
}

export function makeSolvable(rnd) {
  const r = () => int(-2, 2, rnd);
  const l21 = r(), l31 = r(), l32 = r();
  const U0 = [[1, int(1, 2, rnd), r()], [0, 1, r()], [0, 0, 0]], A = multiply(L3(l21, l31, l32), U0);
  const c = [l32 * l21 - l31, -l32, 1];                  // hàng 3 của L⁻¹: c·b = 0 là điều kiện có nghiệm
  const term = (k, n) => (k === 0 ? '' : `${k < 0 ? '−' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}b${n} `);
  const cond = `${term(c[0], 1)}${term(c[1], 2)}+ b3 = 0`.replace(/^\+ /, '');
  const x0 = [r(), r(), r()], b = matVec(A, x0), sol = solve(A, b);
  return {
    stem: `Let A = ${mat(A)} and b = (b₁, b₂, b₃).`,
    parts: [
      { pts: 5, q: 'Reduce [A | b]. For which b does Ax = b have a solution?', a: [`The last row of the reduced system reads 0 = ${cond.replace(' = 0', '')}`, `Solvable exactly when ${cond}`], facts: { A, c } },
      { pts: 10, q: `For b = ${col(b)}, find a particular solution and the complete solution.`,
        a: [`particular (free variable = 0): ${col(sol.particular)}`, `complete: x = particular + t·${col(sol.special[0])}`], facts: { b, particular: sol.particular, special: sol.special } },
      { pts: 5, q: 'Give one b for which Ax = b has no solution. Explain why no b gives exactly one solution.',
        a: ['b = (0, 0, 1) violates the condition (it gives 0 = 1)', 'rank < number of columns, so there is a free variable: a solvable system has infinitely many solutions, never exactly one'], facts: { bad: [0, 0, 1] } },
    ],
  };
}

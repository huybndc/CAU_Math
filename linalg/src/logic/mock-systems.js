/* ---------------------------------------------------------------
   ĐỀ THI THỬ (Linear Algebra) — câu về khử Gauss, E, nghịch đảo, LU, hạng và nghiệm (thuần, chữ Anh, LaTeX $…$).
   Số liệu và đáp án dùng lại elimination / ldu / linear-system; lời giải liệt kê từng phép biến đổi hàng.
   Test đối chiếu bằng phép nhân viết riêng.
   --------------------------------------------------------------- */
import { int, pick } from '@shared/logic/shuffle.js';
import { multiply, transpose, identity, matVec } from './matrix.js';
import { applyRowOp } from './elimination.js';
import { ldu } from './ldu.js';
import { solve } from './linear-system.js';
import { num, mat, vec, aug, M, opTex, elimLines, jordanLines } from './mock-tex.js';

const r = String.raw;
const L3 = (a, b, c) => [[1, 0, 0], [a, 1, 0], [b, c, 1]];
const elim = (i, j, l) => { const E = identity(3).map(row => row.slice()); E[i][j] = -l; return E; };

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
  const { lines, fw } = elimLines(A0.map((row, i) => [...row, bv[i]]), 3);
  const U = fw.matrix;
  return {
    stem: r`Let $A = ${mat(A('q'))}$.`,
    parts: [
      { pts: 10, q: r`For $q = ${q0}$ and $b = ${vec(bv)}$: eliminate $Ax = b$, give the multipliers $\ell_{21}, \ell_{31}, \ell_{32}$ and the pivots, then solve by back substitution.`,
        a: [r`Reduce $[A \mid b]$ with $q = ${q0}$:`, ...lines,
          r`Multipliers: $\ell_{21} = ${m2}$, $\ell_{31} = ${m3}$, $\ell_{32} = ${num(l32)}$. Pivots: $1,\ ${p0},\ ${num(u33)}$.`,
          r`Back substitution: $x_3 = ${num(x[2])}$, then $x_2 = ${num(x[1])}$, then $x_1 = ${num(x[0])}$, so $x = ${vec(x)}$.`],
        facts: { A0, bv, x, mult: [m2, m3, l32], pivots: [1, p0, u33], U } },
      { pts: 7, q: r`For the same $q$, write the elimination matrices $E_{21}, E_{31}, E_{32}$ and the product $E = E_{32}E_{31}E_{21}$.`,
        a: [r`$E_{21} = ${mat(E21)}, \quad E_{31} = ${mat(E31)}, \quad E_{32} = ${mat(E32)}$ (each has $-\ell_{ij}$ in position $(i,j)$).`,
          r`$E = E_{32}E_{31}E_{21} = ${mat(E)}$, and $EA = U$.`], facts: { E21, E31, E32, E, A0 } },
      { pts: 8, q: r`For which value of $q$ does elimination break down temporarily (fixed by a row exchange), and for which does it break down permanently? Give the permutation matrix $P$ for the temporary case.`,
        a: [r`After step 1 the second pivot is $q - ${m2 * a}$, and the entry below it is $${s}$.`,
          r`Temporary: $q = ${qTemp}$ (second pivot is $0$, but the entry below is $${s} \ne 0$, so exchange rows 2 and 3).`,
          r`Permanent: $q = ${num(qPerm)}$ (the third pivot becomes $0$ and no row below is left to exchange).`, r`$P = ${mat(P)}$`],
        facts: { qTemp, qPerm, P, A: A(qTemp), Aperm: A(qPerm) } },
    ],
  };
}

export function makeInverse(rnd) {
  const rr = () => int(-2, 2, rnd);
  const A = multiply(L3(rr(), rr(), rr()), [[1, rr(), rr()], [0, 1, rr()], [0, 0, 1]]);
  const { inv, lines } = jordanLines(A), b = [int(-3, 3, rnd), int(-3, 3, rnd), int(-3, 3, rnd)], x = matVec(inv.inverse, b);
  const i = int(0, 1, rnd), j = int(i + 1, 2, rnd), P = identity(3).map(row => row.slice());
  [P[i], P[j]] = [P[j], P[i]];
  const PAinv = multiply(inv.inverse, transpose(P));
  return {
    stem: r`Let $A = ${mat(A)}$.`,
    parts: [
      { pts: 10, q: r`Find $A^{-1}$ by Gauss–Jordan elimination on $[A \mid I]$.`,
        a: [r`Start: $[A \mid I] = ${aug(inv.start, 3)}$`, ...lines, r`$[I \mid A^{-1}]$, so $A^{-1} = ${mat(inv.inverse)}$.`],
        facts: { A, inverse: inv.inverse } },
      { pts: 4, q: r`Use $A^{-1}$ to solve $Ax = b$ with $b = ${vec(b)}$.`, a: [r`$x = A^{-1}b = ${mat(inv.inverse)}${vec(b)} = ${vec(x)}$`], facts: { b, x } },
      { pts: 6, q: r`Let $P = ${mat(P)}$. Find $(PA)^{-1}$ without eliminating again.`,
        a: [r`$(PA)^{-1} = A^{-1}P^{-1} = A^{-1}P^{T}$ (a permutation matrix has $P^{-1} = P^T$; this swaps the columns of $A^{-1}$).`,
          r`$(PA)^{-1} = ${mat(PAinv)}$`], facts: { P, PAinv } },
    ],
  };
}

export function makeLdl(rnd) {
  const rr = () => int(-2, 2, rnd) || 1;
  const L = L3(rr(), rr(), rr()), d = [int(1, 3, rnd), int(1, 3, rnd), int(1, 3, rnd)], D = d.map((v, i) => d.map((_, k) => (i === k ? v : 0)));
  const A = multiply(multiply(L, D), transpose(L)), U = multiply(D, transpose(L));
  // B cần đổi hàng: hàng 2 hết trụ sau bước 1, hàng 3 còn số ở cột 2
  let a, bb, m2, m3, s, g;
  do { a = int(1, 3, rnd); bb = int(1, 3, rnd); m2 = int(1, 3, rnd); m3 = int(1, 3, rnd); s = int(1, 3, rnd); g = int(1, 3, rnd); } while (m2 === m3);
  const B = [[1, a, bb], [m2, m2 * a, g + m2 * bb], [m3, s + m3 * a, int(0, 3, rnd) + m3 * bb]], f = ldu(B);
  const ops1 = [{ type: 'add', i: 1, j: 0, k: -m2 }, { type: 'add', i: 2, j: 0, k: -m3 }], swap = { type: 'swap', i: 1, j: 2 };
  const B1 = ops1.reduce(applyRowOp, B), B2 = applyRowOp(B1, swap);
  return {
    stem: 'Factorizations.',
    parts: [
      { pts: 10, q: r`$A = ${mat(A)}$ is symmetric. Factor $A = LU$, then write $A = LDL^{T}$.`,
        a: [r`Eliminate: $\ell_{21} = ${num(L[1][0])}$, $\ell_{31} = ${num(L[2][0])}$, $\ell_{32} = ${num(L[2][1])}$, so $L = ${mat(L)}$ and $U = ${mat(U)}$.`,
          r`Divide each row of $U$ by its pivot: $D = \operatorname{diag}(${d.join(', ')})$ and $U = DL^{T}$ (because $A$ is symmetric).`,
          r`Hence $A = LDL^{T} = ${mat(L)}${mat(D)}${mat(transpose(L))}$.`], facts: { A, L, D, U } },
      { pts: 10, q: r`$B = ${mat(B)}$ needs a row exchange. Find $P$, $L$, $U$ with $PB = LU$.`,
        a: [r`Eliminate column 1 ($${opTex(ops1[0])}$, $${opTex(ops1[1])}$): $${mat(B1)}$`,
          r`The second pivot is $0$ but the entry below it is not, so exchange: $${opTex(swap)}$: $${mat(B2)}$`,
          r`$P = ${mat(f.P)}$, $\; L = ${mat(f.L)}$, $\; U = ${mat(f.U)}$ (the multipliers in $L$ follow the exchanged rows).`], facts: { B, P: f.P, L: f.L, U: f.U } },
    ],
  };
}

// cặp cột trụ (chỉ số từ 0) cho ma trận 3×4 hạng 2
const PIV = [[0, 1], [0, 2], [1, 3]];

export function makeRref(rnd) {
  const [p1, p2] = pick(PIV, rnd), rr = () => int(-2, 2, rnd);
  const row = (p, first) => Array.from({ length: 4 }, (_, k) => (k < p ? 0 : k === p ? first : rr()));
  const U0 = [row(p1, pick([1, 2, -1], rnd)), row(p2, pick([1, 2, -1], rnd)), [0, 0, 0, 0]];
  const A = multiply(L3(rr(), rr(), rr()), U0);
  const { lines, nFwd, fw, bw, show } = elimLines(A, 0, true);
  const pivots = fw.pivots, U = show(fw.matrix), R = show(bw.matrix);
  const pc = pivots.map(p => p.col), fc = [0, 1, 2, 3].filter(k => !pc.includes(k));
  const special = solve(A, [0, 0, 0]).special;
  const colOf = k => `\\text{col}_${k + 1}`;
  return {
    stem: r`Let $A = ${mat(A)}$.`,
    parts: [
      { pts: 8, q: r`Find an echelon form $U$ and the reduced row echelon form $R$ of $A$.`,
        a: [...lines.slice(0, nFwd), r`Echelon form: $U = ${mat(U)}$`, ...lines.slice(nFwd), r`Reduced form: $R = ${mat(R)}$`], facts: { A, U, R } },
      { pts: 4, q: r`Find the rank, the pivot columns and the free variables.`,
        a: [r`$\operatorname{rank}(A) = ${pc.length}$ (two pivots).`, r`Pivot columns: ${pc.map(k => `$${k + 1}$`).join(', ')}. Free variables: ${fc.map(k => `$x_${k + 1}$`).join(', ')}.`],
        facts: { rank: pc.length, pc, fc } },
      { pts: 8, q: r`Find the special solutions and describe the null space $N(A)$.`,
        a: [...special.map((sv, i) => r`Set $x_${fc[i] + 1} = 1$ and the other free variable $0$: $${vec(sv)}$`), r`$N(A)$ is all combinations of the special solutions.`], facts: { special } },
      { pts: 5, q: r`Write each free column of $A$ as a combination of the pivot columns.`,
        a: fc.map(k => r`$${colOf(k)} = ${pc.map((cc, i) => `${num(R[i][k])}\\,${colOf(cc)}`).join(' + ')}$ (the entries of column ${k + 1} of $R$ are the coefficients).`), facts: { R, pc, fc } },
    ],
  };
}

export function makeSolvable(rnd) {
  const rr = () => int(-2, 2, rnd);
  const l21 = rr(), l31 = rr(), l32 = rr();
  const U0 = [[1, int(1, 2, rnd), rr()], [0, 1, rr()], [0, 0, 0]], A = multiply(L3(l21, l31, l32), U0);
  const c = [l32 * l21 - l31, -l32, 1];                  // hàng 3 của L⁻¹: c·b = 0 là điều kiện có nghiệm
  const term = (k, n) => (k === 0 ? '' : `${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}b_${n} `);
  const cond = `${term(c[0], 1)}${term(c[1], 2)}+ b_3`.replace(/^\+ /, '');
  const x0 = [rr(), rr(), rr()], b = matVec(A, x0), sol = solve(A, b);
  const withI = elimLines(A.map((row, i) => [...row, ...identity(3)[i]]), 3), withB = elimLines(A.map((row, i) => [...row, b[i]]), 3, true);
  return {
    stem: r`Let $A = ${mat(A)}$ and $b = (b_1, b_2, b_3)$.`,
    parts: [
      { pts: 5, q: r`Reduce $[A \mid b]$. For which $b$ does $Ax = b$ have a solution?`,
        a: [r`Reduce $[A \mid I]$ (the right block records what happens to $b$):`, ...withI.lines,
          r`The last row reads $0 = ${cond}$. So $Ax = b$ is solvable exactly when $${cond} = 0$.`], facts: { A, c } },
      { pts: 10, q: r`For $b = ${vec(b)}$, find a particular solution and the complete solution.`,
        a: [r`Reduce $[A \mid b]$ all the way:`, ...withB.lines,
          r`Particular solution (free variable $= 0$): $${vec(sol.particular)}$.`,
          r`Complete solution: $x = ${vec(sol.particular)} + t\,${vec(sol.special[0])}$, $t$ any number.`], facts: { b, particular: sol.particular, special: sol.special } },
      { pts: 5, q: r`Give one $b$ for which $Ax = b$ has no solution. Explain why no $b$ gives exactly one solution.`,
        a: [r`$b = (0,0,1)$ violates the condition: it gives $0 = 1$.`, r`$\operatorname{rank}(A) = 2 < 3$ columns, so there is a free variable: a solvable system has infinitely many solutions, never exactly one.`], facts: { bad: [0, 0, 1] } },
    ],
  };
}

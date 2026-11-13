/* Practice final exam (Linear Algebra, D75): check answers with separate arithmetic (not the app's solvers). */
import { describe, it, expect } from 'vitest';
import { buildMock, seedCode, parseSeed, newSeed } from '@shared/logic/mock-exam.js';
import { mat, vec, num } from '../src/logic/mock-tex.js';
import katex from 'katex';
import { LINALG_MOCK } from '../src/logic/mock-exam.js';

const mm = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
const mv = (A, x) => A.map(r => r.reduce((s, v, k) => s + v * x[k], 0));
const T = A => A[0].map((_, j) => A.map(r => r[j]));
const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
const close = (A, B) => A.flat().every((v, i) => Math.abs(v - B.flat()[i]) < 1e-9);
const zero = v => v.every(x => Math.abs(x) < 1e-9);
// rank by Gaussian elimination with partial pivoting
const rank = A0 => {
  const A = A0.map(r => r.slice()); let rk = 0;
  for (let c = 0; c < A[0].length && rk < A.length; c++) {
    let p = rk; for (let i = rk; i < A.length; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
    if (Math.abs(A[p][c]) < 1e-9) continue;
    [A[rk], A[p]] = [A[p], A[rk]];
    for (let i = 0; i < A.length; i++) if (i !== rk) { const f = A[i][c] / A[rk][c]; A[i] = A[i].map((v, k) => v - f * A[rk][k]); }
    rk++;
  }
  return rk;
};
const SEEDS = Array.from({ length: 150 }, (_, i) => i * 7919 + 3);
const facts = (ex, q, p) => ex.questions[q].parts[p].facts;

describe('exam frame', () => {
  it('same seed gives the same exam; another seed gives another exam', () => {
    expect(buildMock(LINALG_MOCK, 123)).toEqual(buildMock(LINALG_MOCK, 123));
    expect(JSON.stringify(buildMock(LINALG_MOCK, 123))).not.toBe(JSON.stringify(buildMock(LINALG_MOCK, 124)));
  });
  it('5 questions, 200 points, 120 minutes', () => {
    const ex = buildMock(LINALG_MOCK, 5);
    expect(ex.questions.map(q => q.pts)).toEqual([35, 50, 30, 40, 45]);
    expect([ex.total, ex.minutes]).toEqual([200, 120]);
  });
  it('each question cites book sections from 3.5 to 4.3', () => {
    const ex = buildMock(LINALG_MOCK, 9);
    expect(ex.book).toMatch(/Strang/);
    expect(LINALG_MOCK.refs).toHaveLength(LINALG_MOCK.makers.length);
    for (const q of ex.questions) for (const r of q.refs) expect(['3.5', '3.6', '4.1', '4.2', '4.3']).toContain(r.sec);
  });
  it('every formula has paired $ and KaTeX renders it', () => {
    for (const s of SEEDS.slice(0, 30)) {
      const ex = buildMock(LINALG_MOCK, s);
      for (const str of ex.questions.flatMap(q => [q.stem, ...q.parts.flatMap(p => [p.q, ...p.a])])) {
        const pieces = str.split('$');
        expect(pieces.length % 2, `seed ${s}: ${str.slice(0, 60)}`).toBe(1);
        pieces.forEach((m, i) => { if (i % 2) katex.renderToString(m, { throwOnError: true }); });
      }
    }
  }, 30_000);
  it('seed code round trip', () => {
    for (const s of [0, 1, 35, 60466175]) expect(parseSeed(seedCode(s))).toBe(s);
    expect(seedCode(newSeed(() => 0.999999))).toHaveLength(5);
    expect(parseSeed('zz zz')).toBeNull();
  });
  it('no undefined / NaN / Infinity and no ",;" in printed text', () => {
    for (const s of SEEDS) {
      const text = JSON.stringify(buildMock(LINALG_MOCK, s), (k, v) => (k === 'facts' ? undefined : v));
      expect(text, `seed ${s}`).not.toMatch(/undefined|NaN|Infinity|,;|;;/);
    }
  });
});

describe('answers match separate arithmetic', () => {
  it('Q1: dependent set, combination, basis, dimension', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), a = facts(ex, 0, 0), b = facts(ex, 0, 1);
      expect(rank(T(a.vs))).toBe(3);
      expect(zero(mv(T(a.vs), a.c)) && !zero(a.c)).toBe(true);
      expect(rank(T(b.basis.map(i => a.vs[i])))).toBe(3);
      expect(b.dim).toBe(rank(T(a.vs)));
    }
  });
  it('Q2: four subspaces and the test for b', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), { A, R } = facts(ex, 1, 0), f = facts(ex, 1, 1), g = facts(ex, 1, 3);
      expect(rank(A)).toBe(2);
      expect(rank([...A, ...R])).toBe(2);                                    // same row space
      expect(rank(T(f.colBasis))).toBe(2);
      expect(rank(T([...T(A), ...f.colBasis]))).toBe(2);                     // pivot columns span C(A)
      for (const x of f.special) { expect(zero(mv(A, x))).toBe(true); for (const r of f.rowBasis) expect(Math.abs(dot(r, x))).toBeLessThan(1e-9); }
      expect(rank(f.special)).toBe(2);
      expect(zero(mv(T(A), f.y)) && !zero(f.y)).toBe(true);
      expect(g.inside).toBe(rank(T([...T(A), g.b])) === 2);
      expect(g.yb).toBe(dot(f.y, g.b));
    }
  });
  it('Q3: projection onto a line', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), { a, b, p } = facts(ex, 2, 0), { P } = facts(ex, 2, 1), { e } = facts(ex, 2, 2);
      expect(Math.abs(dot(a, e))).toBeLessThan(1e-9);
      expect(close([p.map((v, i) => v + e[i])], [b])).toBe(true);
      expect(close(mm(P, P), P) && close([mv(P, b)], [p])).toBe(true);
      expect(rank(P)).toBe(1);
    }
  });
  it('Q4: projection onto a plane', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), { A, b, xh } = facts(ex, 3, 0), { p, e } = facts(ex, 3, 1), { P } = facts(ex, 3, 2);
      expect(close([mv(A, xh)], [p])).toBe(true);
      expect(zero(mv(T(A), e))).toBe(true);
      expect(zero(e)).toBe(false);
      expect(close(mm(P, P), P) && close(P, T(P)) && close([mv(P, b)], [p])).toBe(true);
    }
  });
  it('Q5: least squares line minimizes the error', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), { t, b, xh } = facts(ex, 4, 1), { e, ee } = facts(ex, 4, 2);
      const err = (C, D) => t.reduce((sum, v, i) => sum + (b[i] - C - D * v) ** 2, 0);
      expect(Math.abs(err(xh[0], xh[1]) - ee)).toBeLessThan(1e-9);
      for (const [dc, dd] of [[0.01, 0], [-0.01, 0], [0, 0.01], [0, -0.01]]) expect(err(xh[0] + dc, xh[1] + dd)).toBeGreaterThan(ee);
      expect(Math.abs(e.reduce((x, y) => x + y, 0)) + Math.abs(dot(t, e))).toBeLessThan(1e-9);
      expect(ee).toBeGreaterThan(0);
    }
  });
  it('printed answer lines show the checked numbers', () => {
    const SHOWN = [[1, 0, 'R', mat], [2, 1, 'P', mat], [2, 2, 'e', vec], [3, 0, 'xh', vec], [3, 2, 'P', mat], [4, 2, 'e', vec]];
    for (const s of SEEDS.slice(0, 40)) {
      const ex = buildMock(LINALG_MOCK, s);
      for (const [q, p, key, f] of SHOWN) expect(ex.questions[q].parts[p].a.join('\n'), `${q}.${p}.${key}`).toContain(f(ex.questions[q].parts[p].facts[key]));
      const ls = facts(ex, 4, 1);
      expect(ex.questions[4].parts[1].a.join('\n')).toContain(`\\hat C = ${num(ls.xh[0])}`);
    }
  });
});

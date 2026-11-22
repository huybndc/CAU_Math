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
// Slots draw one of several types per seed, so tests find a question by facts.kind.
const KINDS = ['indep', 'four', 'projLine', 'projPlane', 'ls', 'det', 'cramer', 'gs', 'detGeo'];
const each = (kind, fn) => {
  let n = 0;
  for (const s of SEEDS) {
    const ex = buildMock(LINALG_MOCK, s), q = ex.questions.find(x => x.parts[0].facts.kind === kind);
    if (q) { n++; fn(q, q.parts.map(p => p.facts), s); }
  }
  expect(n, kind).toBeGreaterThan(20);
};

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
  it('each question cites book sections from 3.5 to 5.3', () => {
    const ex = buildMock(LINALG_MOCK, 9);
    expect(ex.book).toMatch(/Strang/);
    expect(LINALG_MOCK.refs).toHaveLength(LINALG_MOCK.makers.length);
    for (const s of SEEDS.slice(0, 40)) for (const q of buildMock(LINALG_MOCK, s).questions) for (const r of q.refs) expect(['3.5', '3.6', '4.1', '4.2', '4.3', '4.4', '5.1', '5.2', '5.3']).toContain(r.sec);
  });
  it('every question type appears and keeps its slot points', () => {
    const seen = new Set();
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s);
      expect(ex.questions.map(q => q.pts)).toEqual([35, 50, 30, 40, 45]);
      ex.questions.forEach(q => seen.add(q.parts[0].facts.kind));
    }
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });
  it('every formula has paired $ and KaTeX renders it', () => {
    for (const s of SEEDS.slice(0, 60)) {
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
    each('indep', (q, [a, b]) => {
      expect(rank(T(a.vs))).toBe(3);
      expect(zero(mv(T(a.vs), a.c)) && !zero(a.c)).toBe(true);
      expect(rank(T(b.basis.map(i => a.vs[i])))).toBe(3);
      expect(b.dim).toBe(rank(T(a.vs)));
    });
  });
  it('Q2: four subspaces and the test for b', () => {
    each('four', (q, [{ A, R }, f, , g]) => {
      expect(rank(A)).toBe(2);
      expect(rank([...A, ...R])).toBe(2);                                    // same row space
      expect(rank(T(f.colBasis))).toBe(2);
      expect(rank(T([...T(A), ...f.colBasis]))).toBe(2);                     // pivot columns span C(A)
      for (const x of f.special) { expect(zero(mv(A, x))).toBe(true); for (const r of f.rowBasis) expect(Math.abs(dot(r, x))).toBeLessThan(1e-9); }
      expect(rank(f.special)).toBe(2);
      expect(zero(mv(T(A), f.y)) && !zero(f.y)).toBe(true);
      expect(g.inside).toBe(rank(T([...T(A), g.b])) === 2);
      expect(g.yb).toBe(dot(f.y, g.b));
    });
  });
  it('Q3: projection onto a line', () => {
    each('projLine', (q, [{ a, b, p }, { P }, { e }]) => {
      expect(Math.abs(dot(a, e))).toBeLessThan(1e-9);
      expect(close([p.map((v, i) => v + e[i])], [b])).toBe(true);
      expect(close(mm(P, P), P) && close([mv(P, b)], [p])).toBe(true);
      expect(rank(P)).toBe(1);
    });
  });
  it('Q4: projection onto a plane', () => {
    each('projPlane', (q, [{ A, b, xh }, { p, e }, { P }]) => {
      expect(close([mv(A, xh)], [p])).toBe(true);
      expect(zero(mv(T(A), e))).toBe(true);
      expect(zero(e)).toBe(false);
      expect(close(mm(P, P), P) && close(P, T(P)) && close([mv(P, b)], [p])).toBe(true);
    });
  });
  it('Q5: least squares line minimizes the error', () => {
    each('ls', (q, [, { t, b, xh }, { e, ee }]) => {
      const err = (C, D) => t.reduce((sum, v, i) => sum + (b[i] - C - D * v) ** 2, 0);
      expect(Math.abs(err(xh[0], xh[1]) - ee)).toBeLessThan(1e-9);
      for (const [dc, dd] of [[0.01, 0], [-0.01, 0], [0, 0.01], [0, -0.01]]) expect(err(xh[0] + dc, xh[1] + dd)).toBeGreaterThan(ee);
      expect(Math.abs(e.reduce((x, y) => x + y, 0)) + Math.abs(dot(t, e))).toBeLessThan(1e-9);
      expect(ee).toBeGreaterThan(0);
    });
  });
  it('printed answer lines show the checked numbers', () => {
    const SHOWN = { four: [[0, 'R', mat]], projLine: [[1, 'P', mat], [2, 'e', vec]], projPlane: [[0, 'xh', vec], [2, 'P', mat]], ls: [[2, 'e', vec]] };
    for (const [kind, list] of Object.entries(SHOWN)) {
      each(kind, (q, fs) => {
        for (const [p, key, f] of list) expect(q.parts[p].a.join('\n'), `${kind}.${p}.${key}`).toContain(f(fs[p][key]));
        if (kind === 'ls') expect(q.parts[1].a.join('\n')).toContain(`\\hat C = ${num(fs[1].xh[0])}`);
      });
    }
  });
});

describe('new final scope: determinants, Cramer, Gram–Schmidt, volumes (Strang 4.4, 5.1–5.3)', () => {
  // Own code: Leibniz sum over permutations (not the app's determinant).
  const perms = [[0, 1, 2, 1], [1, 2, 0, 1], [2, 0, 1, 1], [0, 2, 1, -1], [1, 0, 2, -1], [2, 1, 0, -1]];
  const det3 = M => perms.reduce((s, [a, b, c, sg]) => s + sg * M[0][a] * M[1][b] * M[2][c], 0);
  const adj = M => M.map((_, i) => M.map((__, j) => {
    const rows = [0, 1, 2].filter(k => k !== j), cols = [0, 1, 2].filter(k => k !== i);
    const m = rows.map(r => cols.map(c => M[r][c]));
    return (-1) ** (i + j) * (m[0][0] * m[1][1] - m[0][1] * m[1][0]);
  }));
  const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const nums = str => (str.replace(/(-?)\\tfrac\{(\d+)\}\{(\d+)\}/g, (m, sg, x, y) => `${sg}${x / y}`).match(/-?[\d.]+/g) ?? []).map(Number);
  // read the pivots printed in the answer text
  const printedPivots = a => nums(a.find(l => l.includes('pivots')).split('pivots')[1].split('on its')[0]);

  it('Q det: pivot formula, rules and the singular value of c', () => {
    each('det', (q, [a, b, c]) => {
      const d = det3(a.A);
      expect(a.det).toBe(d);
      const piv = printedPivots(q.parts[0].a);
      expect(piv.reduce((x, y) => x * y, 1) * (a.swaps % 2 ? -1 : 1)).toBeCloseTo(d, 9);
      for (const it of b.items) {
        const want = { '2A': 8 * d, '-A': -d, 'A^{-1}': 1 / d, 'A^T': d, 'A^2': d * d, 'A^T A': d * d }[it.tex];
        expect(it.value).toBeCloseTo(want, 9);
      }
      const at = k => c.B0.map((row, i) => row.map((v, j) => (i === 2 && j === c.j ? k : v)));
      expect(det3(at(c.c0))).toBe(0);
      expect(det3(at(c.c0 + 1))).not.toBe(0);
      expect(q.parts[2].a.join(' ')).toContain(`c = ${c.c0}`);
    });
  });
  it('Q Cramer: cofactor expansion, inverse and solution', () => {
    each('cramer', (q, [a, b, c]) => {
      const d = det3(a.A);
      expect(a.det).toBe(d);
      expect(a.A[a.row].filter(v => v === 0).length).toBeGreaterThanOrEqual(2);
      expect(close(mm(a.A, b.inv), [[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(true);
      expect(close(b.C, T(adj(a.A)))).toBe(true);                         // C is the transpose of the adjugate
      const x = c.dets.map(v => v / d);
      expect(close([mv(a.A, x)], [c.b])).toBe(true);
      expect(close([x], [c.x])).toBe(true);
      expect(q.parts[1].a.join(' ')).toContain(mat(b.C));
      expect(q.parts[2].a.join(' ')).toContain(vec(c.x));
    });
  });
  it('Q Gram–Schmidt: orthogonal, same spans, A = QR, solve with R', () => {
    each('gs', (q, [a, b, c, d]) => {
      const A = T([a.a, a.b, a.c]);
      expect(Math.abs(dot(a.a, a.B))).toBeLessThan(1e-9);
      expect(Math.abs(dot(a.a, a.C)) + Math.abs(dot(a.B, a.C))).toBeLessThan(1e-9);
      expect(rank([a.a, a.b, a.B])).toBe(2);                              // B1 stays in span(a, b)
      expect(rank([a.a, a.b, a.c, a.C])).toBe(3);
      expect(close(mm(T(b.Q), b.Q), [[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(true);
      expect(Math.abs(dot(b.Qx, b.Qx) - dot(b.x1, b.x1))).toBeLessThan(1e-9);
      expect(close(mm(b.Q, c.R), A)).toBe(true);
      expect(c.R[1][0] === 0 && c.R[2][0] === 0 && c.R[2][1] === 0).toBe(true);
      expect(c.R.every((r, i) => r[i] > 0)).toBe(true);
      expect(close([mv(A, d.x)], [d.v])).toBe(true);
      expect(close([mv(c.R, d.x)], [d.Qtv])).toBe(true);
      expect(q.parts[2].a.join(' ')).toContain(mat(c.R));
      expect(q.parts[0].a.join(' ')).toContain(vec(a.C));
    });
  });
  it('Q geometry: area, cross product, triple product, big formula', () => {
    each('detGeo', (q, [a, b, c, d]) => {
      expect(a.area).toBeCloseTo(Math.abs(det3(a.P)) / 2, 9);
      expect(close([b.cr], [cross(b.u, b.v)])).toBe(true);
      expect(dot(b.cr, b.u) + dot(b.cr, b.v)).toBe(0);
      expect(b.n2).toBe(dot(b.cr, b.cr));
      expect(c.trip).toBe(det3(d.M));
      expect(d.big).toBe(det3(d.M));
      expect(c.coplanar).toBe(rank(d.M) < 3);
      expect(c.coplanar).toBe(c.trip === 0);
      expect(q.parts[2].a.join(' ')).toContain(`= ${c.trip}$`);
    });
  });

  // Mutation tests: change one printed or stored value; the matching check must fail.
  it('mutation: a wrong value in the answer is caught', () => {
    each('det', (q, [a]) => {
      expect(a.det + 1).not.toBe(det3(a.A));
      expect(printedPivots(['pivots 1, 2 on its'])).toEqual([1, 2]);
    });
    each('cramer', (q, [a, b, c]) => {
      const bad = b.inv.map(r => r.slice()); bad[0][0] += 1;
      expect(close(mm(a.A, bad), [[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(false);
      const x = c.dets.map(v => v / det3(a.A)); x[0] += 1;
      expect(close([mv(a.A, x)], [c.b])).toBe(false);
    });
    each('gs', (q, [a, b, c]) => {
      const R = c.R.map(r => r.slice()); R[0][1] += 1;
      expect(close(mm(b.Q, R), T([a.a, a.b, a.c]))).toBe(false);
      const C = a.C.map((v, i) => v + a.a[i]);
      expect(Math.abs(dot(a.a, C)) + Math.abs(dot(a.B, C))).toBeGreaterThan(1e-9);
    });
    each('detGeo', (q, [a, b, c, d]) => {
      expect(c.trip + 1).not.toBe(det3(d.M));
      const cr = b.cr.slice(); cr[2] += 1;
      expect(close([cr], [cross(b.u, b.v)])).toBe(false);
    });
  });
  it('mutation: the checks read the printed text (a changed number is not found)', () => {
    each('cramer', (q, [, b]) => {
      const text = q.parts[1].a.join(' ');
      expect(text).toContain(mat(b.C));
      const bad = b.C.map(r => r.slice()); bad[1][1] += 1;
      expect(text).not.toContain(mat(bad));
    });
    each('gs', (q, [, , c]) => {
      const bad = c.R.map(r => r.slice()); bad[0][0] += 1;
      expect(q.parts[2].a.join(' ')).not.toContain(mat(bad));
    });
  });
});

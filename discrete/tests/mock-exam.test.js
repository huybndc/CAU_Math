/* Practice final exam (Discrete Math, D75): structure, KaTeX, and answers checked by separate counting. */
import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { buildMock } from '@shared/logic/mock-exam.js';
import { DISCRETE_MOCK } from '../src/logic/mock-exam.js';

const SEEDS = Array.from({ length: 150 }, (_, i) => i * 104729 + 7);
// Slots draw one of several types per seed, so tests find a part by facts.kind.
const find = (ex, kind) => ex.questions.flatMap(q => q.parts).find(p => p.facts.kind === kind);
const each = (kind, fn) => {
  let n = 0;
  for (const s of SEEDS) { const ex = buildMock(DISCRETE_MOCK, s), p = find(ex, kind); if (p) { n++; fn(p.facts, p, ex); } }
  expect(n, kind).toBeGreaterThan(20);
};

describe('exam frame', () => {
  it('4 questions, 200 points, 60 minutes; 4 different definitions', () => {
    for (const s of SEEDS) {
      const ex = buildMock(DISCRETE_MOCK, s);
      expect(ex.questions.map(q => q.pts)).toEqual([40, 50, 50, 60]);
      expect([ex.total, ex.minutes]).toEqual([200, 60]);
      expect(new Set(ex.questions[0].parts.map(p => p.facts.id)).size).toBe(4);
      ex.questions.forEach(q => expect(q.refs.length).toBeGreaterThan(0));
    }
  });
  it('only the proof question says "by induction", and only for an induction proof', () => {
    for (const s of SEEDS) {
      const ex = buildMock(DISCRETE_MOCK, s), text = ex.questions.flatMap(q => [q.stem, ...q.parts.map(p => p.q)]).join(' ');
      const induction = ex.questions[3].parts[0].facts.induction;
      expect(text.match(/by induction/g)?.length ?? 0).toBe(induction ? 1 : 0);
      if (induction) expect(ex.questions[3].parts[0].q).toMatch(/by induction/);
    }
  });
  it('all post-midterm topics appear, and each has a section reference', () => {
    const kinds = new Set(), ids = new Set();
    for (const s of SEEDS) {
      const ex = buildMock(DISCRETE_MOCK, s);
      ex.questions.flatMap(q => q.parts).forEach(p => { if (p.facts.kind) kinds.add(p.facts.kind); if (p.facts.id) ids.add(p.facts.id); });
      ex.questions.forEach(q => q.refs.forEach(r => expect(r.sec, s).toBeTruthy()));
    }
    expect([...kinds].sort()).toEqual(['annuity', 'benes', 'bigO', 'bounds', 'doubling', 'euler', 'net', 'relation', 'tilde', 'walks']);
    for (const id of ['tilde', 'bigO', 'theta', 'bounds', 'bigtheta', 'sqrt', 'recip', 'logn']) expect(ids.has(id), id).toBe(true);
  });
  it('same seed gives the same exam; seeds vary the exam', () => {
    expect(buildMock(DISCRETE_MOCK, 5)).toEqual(buildMock(DISCRETE_MOCK, 5));
    expect(new Set(SEEDS.map(s => JSON.stringify(buildMock(DISCRETE_MOCK, s)))).size).toBeGreaterThan(100);
  });
  it('every formula has paired $ and KaTeX renders it; no undefined / NaN / ",;"', () => {
    for (const s of SEEDS.slice(0, 60)) {
      const ex = buildMock(DISCRETE_MOCK, s);
      for (const str of ex.questions.flatMap(q => [q.stem, ...q.parts.flatMap(p => [p.q, ...p.a])])) {
        const pieces = str.split('$');
        expect(pieces.length % 2, str.slice(0, 50)).toBe(1);
        pieces.forEach((m, i) => { if (i % 2) katex.renderToString(m, { throwOnError: true }); });
        expect(str).not.toMatch(/undefined|NaN|Infinity|,;|;;/);
      }
    }
  }, 30_000);
});

describe('answers match separate counting', () => {
  it('network values match the MCS table', () => {
    const TABLE = [N => 2 * N - 1, N => N, N => 2 * Math.log2(N) + 2, N => N * N, N => Math.log2(N) + 1, N => N * (Math.log2(N) + 1), () => 1];
    each('net', f => expect(f.value).toBe(TABLE[f.id](f.N)));
    each('benes', b => expect(b.partner - b.port).toBe(b.N / 2));
  });
  it('Euler answer: brute-force search for an Euler walk', () => {
    const euler = (edges, closed) => {
      const go = (v, used, start) => {
        if (used.every(Boolean)) return !closed || v === start;
        return edges.some(([a, b], i) => !used[i] && (a === v || b === v) && go(a === v ? b : a, used.map((u, k) => u || k === i), start));
      };
      return [0, 1, 2, 3, 4].some(v => go(v, edges.map(() => false), v));
    };
    each('euler', ({ edges, eul }) => {
      const tour = euler(edges, true), walk = euler(edges, false);
      expect(eul).toBe(tour ? 'tour' : walk ? 'walk' : 'none');
    });
  });
  it('walk count: enumerate all walks of length 3', () => {
    each('walks', ({ A, wi, wj, walks }) => {
      let n = 0;
      for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) if (A[wi][a] && A[a][b] && A[b][wj]) n++;
      expect(walks).toBe(n);
    });
  });
  it('relation properties: check every triple', () => {
    each('relation', ({ pairs, refl, sym, trans }) => {
      const R = (a, b) => pairs.some(p => p[0] === a && p[1] === b), S = [1, 2, 3];
      expect(refl).toBe(S.every(a => R(a, a)));
      expect(sym).toBe(S.every(a => S.every(b => !R(a, b) || R(b, a))));
      expect(trans).toBe(S.every(a => S.every(b => S.every(c => !(R(a, b) && R(b, c)) || R(a, c)))));
    });
  });
  it('annuity: add the discounted payments one by one', () => {
    each('annuity', (f0, p0, ex) => {
      const q = ex.questions[2], { m, p, n, V } = q.parts[1].facts, { Vinf } = q.parts[2].facts;
      let sum = 0, far = 0;
      for (let i = 0; i < n; i++) sum += m / (1 + p) ** i;
      for (let i = 0; i < 3000; i++) far += m / (1 + p) ** i;
      expect(V).toBeCloseTo(sum, 6);
      expect(Vinf).toBeCloseTo(far, 4);
      expect(q.parts[1].a.join(' ')).toContain(sum.toFixed(2));
    });
  });
});

describe('new final scope: integral bounds and asymptotic notation (MCS 9.3–9.7)', () => {
  const FN = { sqrt: [Math.sqrt, true], recip: [x => 1 / x, false], logn: [Math.log, true] };
  // own numeric integral (Simpson) and own sum; not the app's closed forms
  const simpson = (f, a, b, k = 2000) => { const h = (b - a) / k; let t = f(a) + f(b); for (let i = 1; i < k; i++) t += f(a + i * h) * (i % 2 ? 4 : 2); return t * h / 3; };
  const nums = str => (str.match(/-?\d+\.\d+/g) ?? []).map(Number);

  it('bounds: the integral, both bounds and the sum agree with own numeric work', () => {
    each('bounds', (f, p, ex) => {
      const q = ex.questions[2], [g, inc] = FN[f.id], n = f.n, b = q.parts[1].facts;
      let S = 0; for (let i = 1; i <= n; i++) S += g(i);
      const I = simpson(g, 1, n);
      expect(f.inc).toBe(inc);
      expect(f.I).toBeCloseTo(I, 6);
      expect(b.S).toBeCloseTo(S, 9);
      expect(b.lo).toBeLessThanOrEqual(S + 1e-9);
      expect(S).toBeLessThanOrEqual(b.hi + 1e-9);
      expect(b.lo).toBeCloseTo(I + (inc ? g(1) : g(n)), 6);
      expect(b.hi).toBeCloseTo(I + (inc ? g(n) : g(1)), 6);
      // the printed answer shows the same numbers
      const text = q.parts[1].a.join(' ');
      expect(nums(text)).toEqual(expect.arrayContaining([+b.lo.toFixed(3), +b.hi.toFixed(3), +b.S.toFixed(3)]));
      expect(q.parts[0].a.join(' ')).toContain(inc ? 'increasing' : 'decreasing');
    });
  });
  it('bounds: n! bounds, harmonic constants and the sqrt ratio', () => {
    each('bounds', (f, p, ex) => {
      const text = ex.questions[2].parts[2].a.join(' ');
      if (f.id === 'logn') {
        const fact = [...Array(f.n).keys()].reduce((x, k) => x * (k + 1), 1), N = f.n;
        const [lo, hi] = [N ** N / Math.exp(N - 1), N ** (N + 1) / Math.exp(N - 1)];
        expect(lo).toBeLessThanOrEqual(fact); expect(fact).toBeLessThanOrEqual(hi);
        expect(text).toContain(lo.toFixed(2)); expect(text).toContain(hi.toFixed(2)); expect(text).toContain(`${fact}`);
      }
    });
    for (let n = 3; n <= 300; n++) { let H = 0; for (let i = 1; i <= n; i++) H += 1 / i; expect(H).toBeGreaterThanOrEqual(Math.log(n)); expect(H).toBeLessThanOrEqual(2 * Math.log(n)); }
    const n = 1e6; // ratio of the bounds to (2/3) n^{3/2} tends to 1
    expect(((2 / 3) * n ** 1.5 + 1 / 3) / ((2 / 3) * n ** 1.5)).toBeCloseTo(1, 5);
    expect(((2 / 3) * n ** 1.5 + Math.sqrt(n) - 2 / 3) / ((2 / 3) * n ** 1.5)).toBeCloseTo(1, 3);
  });
  it('~ question: numeric limit at a huge x', () => {
    each('tilde', f => {
      const x = 1e9, ratio = (f.a * x * x + f.b * x) / (f.c * x * x);
      expect(ratio).toBeCloseTo(f.limit, 6);
      expect(f.sim).toBe(Math.abs(ratio - 1) < 1e-6);
    });
  });
  it('O question: c and x0 work for every x; one less does not', () => {
    each('bigO', (f, p) => {
      const fx = x => f.a * x ** f.d + f.b * x ** (f.d - 1);
      for (let x = f.x0; x <= 2000; x += 0.5) expect(fx(x)).toBeLessThanOrEqual(f.c * x ** f.d + 1e-6);
      expect(fx(f.x0)).toBeGreaterThan((f.c - 1) * f.x0 ** f.d);
      for (let x = 1; x <= 2000; x += 7) expect(fx(x)).toBeGreaterThanOrEqual(f.a * x ** f.d);       // lower bound for Theta
      expect(p.a.join(' ')).toContain(`c = ${f.c}`);
    });
  });
  it('doubling: the money doubles after t years', () => {
    each('doubling', (f, p) => {
      expect((1 + f.p) ** f.t).toBeCloseTo(2, 9);
      expect(p.a.join(' ')).toContain(f.t.toFixed(1));
    });
  });
  it('mutation: a changed value in an answer fails the check', () => {
    each('bounds', (f, p, ex) => {
      const b = ex.questions[2].parts[1].facts, [g] = FN[f.id];
      expect(b.hi + 0.5).not.toBeCloseTo(simpson(g, 1, f.n) + (f.inc ? g(f.n) : g(1)), 6);
      const inside = (lo, hi, v) => lo <= v + 1e-9 && v <= hi + 1e-9;
      expect(inside(b.lo, b.hi, b.S)).toBe(true);
      expect(inside(b.lo, b.hi, b.hi + 0.01)).toBe(false);                       // a changed sum leaves the bounds
      expect(inside(b.S + 0.01, b.hi, b.S)).toBe(false);                         // a changed bound no longer holds
    });
    each('tilde', f => expect(f.limit + 1).not.toBeCloseTo(f.a / f.c, 6));
    each('bigO', f => { const x = 1; expect(f.a * x ** f.d + f.b * x ** (f.d - 1)).toBeGreaterThan((f.c - 1) * x ** f.d); });
    each('doubling', f => expect((1 + f.p) ** (f.t + 0.5)).not.toBeCloseTo(2, 3));
  });
});

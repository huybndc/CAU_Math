/* Practice final exam (Discrete Math, D75): structure, KaTeX, and answers checked by separate counting. */
import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { buildMock } from '@shared/logic/mock-exam.js';
import { DISCRETE_MOCK } from '../src/logic/mock-exam.js';

const SEEDS = Array.from({ length: 150 }, (_, i) => i * 104729 + 7);
const facts = (ex, q, p) => ex.questions[q].parts[p].facts;

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
  it('only the proof question says "by induction"', () => {
    for (const s of SEEDS) {
      const ex = buildMock(DISCRETE_MOCK, s), text = ex.questions.flatMap(q => [q.stem, ...q.parts.map(p => p.q)]).join(' ');
      expect(text.match(/by induction/g)?.length).toBe(1);
      expect(ex.questions[3].parts[0].q).toMatch(/by induction/);
    }
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
    for (const s of SEEDS) {
      const f = facts(buildMock(DISCRETE_MOCK, s), 1, 0);
      expect(f.value).toBe(TABLE[f.id](f.N));
      const b = facts(buildMock(DISCRETE_MOCK, s), 1, 1);
      expect(b.partner - b.port).toBe(b.N / 2);
    }
  });
  it('Euler answer: brute-force search for an Euler walk', () => {
    const euler = (edges, closed) => {
      const go = (v, used, start) => {
        if (used.every(Boolean)) return !closed || v === start;
        return edges.some(([a, b], i) => !used[i] && (a === v || b === v) && go(a === v ? b : a, used.map((u, k) => u || k === i), start));
      };
      return [0, 1, 2, 3, 4].some(v => go(v, edges.map(() => false), v));
    };
    for (const s of SEEDS.slice(0, 60)) {
      const { edges, eul } = facts(buildMock(DISCRETE_MOCK, s), 1, 2);
      const tour = euler(edges, true), walk = euler(edges, false);
      expect(eul).toBe(tour ? 'tour' : walk ? 'walk' : 'none');
    }
  });
  it('walk count: enumerate all walks of length 3', () => {
    for (const s of SEEDS) {
      const { A, wi, wj, walks } = facts(buildMock(DISCRETE_MOCK, s), 1, 3);
      let n = 0;
      for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) if (A[wi][a] && A[a][b] && A[b][wj]) n++;
      expect(walks).toBe(n);
    }
  });
  it('relation properties: check every triple', () => {
    for (const s of SEEDS) {
      const { pairs, refl, sym, trans } = facts(buildMock(DISCRETE_MOCK, s), 1, 4);
      const R = (a, b) => pairs.some(p => p[0] === a && p[1] === b), S = [1, 2, 3];
      expect(refl).toBe(S.every(a => R(a, a)));
      expect(sym).toBe(S.every(a => S.every(b => !R(a, b) || R(b, a))));
      expect(trans).toBe(S.every(a => S.every(b => S.every(c => !(R(a, b) && R(b, c)) || R(a, c)))));
    }
  });
  it('annuity: add the discounted payments one by one', () => {
    for (const s of SEEDS) {
      const ex = buildMock(DISCRETE_MOCK, s), { m, p, n, V } = facts(ex, 2, 1), { Vinf } = facts(ex, 2, 2);
      let sum = 0, far = 0;
      for (let i = 0; i < n; i++) sum += m / (1 + p) ** i;
      for (let i = 0; i < 3000; i++) far += m / (1 + p) ** i;
      expect(V).toBeCloseTo(sum, 6);
      expect(Vinf).toBeCloseTo(far, 4);
      expect(ex.questions[2].parts[1].a.join(' ')).toContain(sum.toFixed(2));
    }
  });
});

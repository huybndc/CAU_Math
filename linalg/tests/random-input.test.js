import { describe, it, expect } from 'vitest';
import { randMatrix, randInvertible, randSystem, randVectorPair, randCombo, randLowRank } from '../src/logic/random-input.js';
import { determinant } from '../src/logic/matrix.js';
import { solve } from '../src/logic/linear-system.js';
import { rankOf } from '../src/logic/subspace.js';
import { dot } from '../src/logic/vector.js';

/** Bộ sinh giả ngẫu nhiên để test lặp lại được. */
const lcg = seed => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

describe('dữ liệu ngẫu nhiên cho máy giải', () => {
  it('ma trận số nguyên nhỏ đúng cỡ', () => {
    const M = randMatrix(2, 3, -4, 4, lcg(1));
    expect(M).toHaveLength(2);
    expect(M[0]).toHaveLength(3);
    expect(M.flat().every(x => Number.isInteger(x) && Math.abs(x) <= 4)).toBe(true);
  });
  it('luôn khả nghịch; hệ luôn có nghiệm nguyên duy nhất', () => {
    for (let s = 1; s <= 40; s++) {
      const rnd = lcg(s);
      expect(Math.abs(determinant(randInvertible(3, rnd)))).toBeGreaterThan(0);
      const M = randSystem(3, lcg(s + 100));
      const r = solve(M.map(row => row.slice(0, -1)), M.map(row => row.at(-1)));
      expect(r.type).toBe('unique');
      expect(r.solution.every(Number.isInteger)).toBe(true);
    }
  });
  it('cặp vector: khác 0, hay vuông góc / song song', () => {
    let orth = 0;
    for (let s = 1; s <= 60; s++) {
      const M = randVectorPair(lcg(s));
      const v = M.map(r => r[0]), w = M.map(r => r[1]);
      expect(v.some(x => x !== 0)).toBe(true);
      if (dot(v, w) === 0) orth++;
    }
    expect(orth).toBeGreaterThan(10);
  });
  it('tổ hợp: có cả trường hợp là tổ hợp và không là tổ hợp', () => {
    const kinds = new Set();
    for (let s = 1; s <= 60; s++) {
      const M = randCombo(lcg(s));
      const A = M.map(r => r.slice(0, -1)), b = M.map(r => r.at(-1));
      kinds.add(solve(A, b).type === 'none');
    }
    expect(kinds.size).toBe(2);
  });
  it('ma trận hạng thấp có hạng < số cột', () => {
    for (let s = 1; s <= 30; s++) expect(rankOf(randLowRank(3, 4, lcg(s)))).toBeLessThan(4);
  });
});

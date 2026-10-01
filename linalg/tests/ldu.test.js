import { describe, it, expect } from 'vitest';
import { ldu, checkLdu, solveLdu } from '../src/logic/ldu.js';
import { multiply } from '../src/logic/matrix.js';
import { solve } from '../src/logic/linear-system.js';
import { seededRandom } from '@shared/logic/shuffle.js';

const randMat = (rnd, m, n, lo = -4, hi = 4) => Array.from({ length: m }, () => Array.from({ length: n }, () => Math.floor(rnd() * (hi - lo + 1)) + lo));

describe('PA = LDU', () => {
  it('ví dụ Strang: A = [[1 2 3],[2 5 2],[6 -3 1]]', () => {
    const A = [[1, 2, 3], [2, 5, 2], [6, -3, 1]];
    const f = ldu(A);
    expect(f.L).toEqual([[1, 0, 0], [2, 1, 0], [6, -15, 1]]);
    expect(f.D).toEqual([1, 1, -77]);
    expect(f.invertible).toBe(true);
    expect(checkLdu(A, f)).toBe(true);
  });
  it('trụ bằng 0 ⇒ đổi hàng, P ghi lại, vẫn PA = LDU', () => {
    const A = [[0, 2, 1], [1, 1, 1], [2, 0, 3]];
    const f = ldu(A);
    expect(f.swaps.length).toBeGreaterThan(0);
    expect(checkLdu(A, f)).toBe(true);
  });
  it('suy biến: có PA = LU, không có D', () => {
    const A = [[1, 2], [2, 4]];
    const f = ldu(A);
    expect(f.invertible).toBe(false);
    expect(f.D).toBeNull();
    expect(f.rank).toBe(1);
    expect(checkLdu(A, f)).toBe(true);
  });
  it('1000 ma trận ngẫu nhiên (vuông, chữ nhật): luôn thoả PA = LU; vuông khả nghịch thì nghiệm khớp solve()', () => {
    const rnd = seededRandom(42);
    for (let t = 0; t < 1000; t++) {
      const m = 2 + Math.floor(rnd() * 3), n = 2 + Math.floor(rnd() * 3);
      const A = randMat(rnd, m, n);
      const f = ldu(A);
      expect(checkLdu(A, f), JSON.stringify(A)).toBe(true);
      if (f.invertible) {
        const b = randMat(rnd, m, 1).map(r => r[0]);
        const { x } = solveLdu(f, b);
        const ref = solve(A, b);
        expect(ref.type).toBe('unique');
        x.forEach((v, i) => expect(v).toBeCloseTo(ref.solution[i], 6));
        const Ax = multiply(A, x.map(v => [v])).map(r => r[0]);
        Ax.forEach((v, i) => expect(v).toBeCloseTo(b[i], 6));
      }
    }
  });
});

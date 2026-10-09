import { describe, it, expect } from 'vitest';
import { opMatrix, chain, eliminationE, lowerFromOps, inverseSteps, detByElimination } from '../src/logic/elementary.js';
import { multiply, identity, equals, determinant } from '../src/logic/matrix.js';
import { applyRowOp } from '../src/logic/elimination.js';
import { radical, sqrtText, specialAngle } from '../src/logic/radical.js';
import { ldu } from '../src/logic/ldu.js';

const A = [[2, 1, 1], [4, -6, 0], [-2, 7, 2]];                 // Strang 2.2: cần 3 phép, không đổi hàng
const NEED_SWAP = [[0, 1, 1], [1, 2, 3], [2, 1, 1]];
const SINGULAR = [[1, 2, 3], [2, 4, 6], [1, 0, 1]];

describe('ma trận sơ cấp', () => {
  it('E·A = áp phép lên A, với mọi loại phép', () => {
    for (const op of [{ type: 'add', i: 1, j: 0, k: -2 }, { type: 'swap', i: 0, j: 2 }, { type: 'scale', i: 2, k: 0.5 }]) {
      expect(multiply(opMatrix(3, op), A)).toEqual(applyRowOp(A, op));
    }
  });
  it('tích E_n…E₁ nhân A ra đúng U (kể cả khi có đổi hàng)', () => {
    for (const M of [A, NEED_SWAP, SINGULAR]) {
      const e = eliminationE(M);
      expect(equals(multiply(e.product, M), e.U)).toBe(true);
    }
  });
  it('không đổi hàng ⇒ L = E₁⁻¹…Eₙ⁻¹ và A = LU', () => {
    const e = eliminationE(A);
    expect(e.ops.every(o => o.type === 'add')).toBe(true);
    const L = lowerFromOps(3, e.ops);
    expect(equals(multiply(L, e.U), A)).toBe(true);
    expect(equals(L, ldu(A).L)).toBe(true);                    // trùng L của ldu
  });
});

describe('nghịch đảo Gauss–Jordan', () => {
  it('A·A⁻¹ = I', () => {
    const r = inverseSteps(A);
    expect(r.invertible).toBe(true);
    expect(equals(multiply(A, r.inverse), identity(3))).toBe(true);
  });
  it('ma trận cần đổi hàng vẫn nghịch đảo được', () => {
    const r = inverseSteps(NEED_SWAP);
    expect(equals(multiply(NEED_SWAP, r.inverse), identity(3))).toBe(true);
  });
  it('suy biến ⇒ không khả nghịch, báo hạng', () => {
    const r = inverseSteps(SINGULAR);
    expect(r.invertible).toBe(false);
    expect(r.rank).toBe(2);
  });
});

describe('định thức bằng khử', () => {
  it('khớp khai triển cofactor', () => {
    for (const M of [A, NEED_SWAP, SINGULAR, [[3, 8], [4, 6]]]) {
      expect(detByElimination(M).det).toBeCloseTo(determinant(M), 9);
    }
  });
});

describe('căn dạng chính xác', () => {
  it('rút ước chính phương', () => {
    expect(radical(12)).toEqual({ k: 2, r: 3 });
    expect(sqrtText(9)).toBe('3');
    expect(sqrtText(12)).toBe('2√3');
    expect(sqrtText(5)).toBe('√5');
    expect(sqrtText(2.25)).toBe('1.5');
    expect(specialAngle(60)).toBe('π/3');
    expect(specialAngle(53.13)).toBeNull();
  });
});

describe('detByElimination với ma trận cỡ nhỏ', () => {
  it('ma trận cỡ 1e-5 có det khác 0 (không bị cắt ngưỡng tuyệt đối); suy biến vẫn det 0', () => {
    expect(detByElimination([[1e-5, 0], [0, 1e-5]]).det).toBeCloseTo(1e-10, 20);
    expect(detByElimination([[1, 2], [2, 4]]).det).toBe(0);
  });
});

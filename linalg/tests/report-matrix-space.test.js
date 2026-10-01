import { describe, it, expect } from 'vitest';
import { matrixReport } from '../src/logic/report-matrix.js';
import { spaceReport } from '../src/logic/report-space.js';
import { multiply } from '../src/logic/matrix.js';

const A = [[2, 1, 1], [4, -6, 0], [-2, 7, 2]];

describe('matrixReport', () => {
  it('A·B: có một bước cho mỗi hàng, từng ô là tổng tích', () => {
    const r = matrixReport('mul', [[1, 2], [3, 4]], [[5, 6], [7, 8]]);
    expect(r.answer[0]).toBe('A·B = [19 22; 43 50]');
    expect(r.steps.filter(s => s.head.key === 'sm.stRow')).toHaveLength(2);
    expect(r.steps[1].lines[0]).toBe('c₁₁ = 1·5 + 2·7 = 19');
  });
  it('khác cỡ ⇒ lỗi', () => {
    expect(() => matrixReport('mul', [[1, 2]], [[1, 2]])).toThrow();
    expect(() => matrixReport('add', [[1, 2]], [[1], [2]])).toThrow();
  });
  it('det 3×3 khớp khai triển và khử', () => {
    const r = matrixReport('det', A);
    expect(r.answer[0]).toBe('det A = -16');
    expect(r.steps.map(s => s.head.key)).toEqual(['sm.stExpand', 'sm.stElim']);
  });
  it('nghịch đảo: A·A⁻¹ = I; 2×2 có thêm công thức; suy biến báo rõ', () => {
    expect(matrixReport('inv', [[1, 2], [3, 4]]).steps[0].head.key).toBe('sm.stInv2');
    const inv = matrixReport('inv', A);
    expect(inv.steps.at(-1).lines[0]).toMatch(/✓/);
    expect(matrixReport('inv', [[1, 2], [2, 4]]).answer[0].key).toBe('sm.notInvertible');
  });
  it('chuyển vị và hạng', () => {
    expect(matrixReport('transpose', [[1, 2, 3]]).answer[0]).toBe('Aᵀ = [1; 2; 3]');
    expect(matrixReport('rank', [[1, 2], [2, 4]]).answer[0].params.r).toBe(1);
  });
});

describe('spaceReport', () => {
  it('rank + nullity = n, A·s = 0 cho nghiệm đặc biệt', () => {
    const M = [[1, 2, 1], [2, 4, 3]];
    const r = spaceReport(M);
    expect(r.answer[0].params).toEqual({ r: 2, nul: 1, n: 3 });
    const nul = r.steps.find(s => s.head.key === 'sp.stNull').lines.find(l => typeof l === 'string');
    expect(nul).toContain('s₁ = (-2, 1, 0)');
    expect(multiply(M, [[-2], [1], [0]])).toEqual([[0], [0]]);
  });
  it('cột phụ thuộc: chỉ ra cột nào bằng tổ hợp cột nào', () => {
    const r = spaceReport([[1, 2, 3], [1, 2, 3]]);
    const ind = r.steps.at(-1).lines;
    expect(ind[0].key).toBe('sp.dep');
    expect(ind.some(l => typeof l === 'string' && l.startsWith('a₂ = 2·a₁'))).toBe(true);
  });
  it('ma trận khả nghịch: các cột là cơ sở của Rᵐ', () => {
    expect(spaceReport(A).steps.at(-1).lines.at(-1).key).toBe('sp.isBasis');
  });
});

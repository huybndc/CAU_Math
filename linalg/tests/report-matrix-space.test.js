import { describe, it, expect } from 'vitest';
import { matrixReport } from '../src/logic/report-matrix.js';
import { spaceReport } from '../src/logic/report-space.js';
import { multiply } from '../src/logic/matrix.js';

const A = [[2, 1, 1], [4, -6, 0], [-2, 7, 2]];

describe('matrixReport', () => {
  it('A·B: có một bước cho mỗi hàng, từng ô là tổng tích', () => {
    const r = matrixReport('mul', [[1, 2], [3, 4]], [[5, 6], [7, 8]]);
    expect(r.answer[0]).toBe('A·B = [19 22; 43 50]');
    expect(r.steps.map(s => s.head.key)).toEqual(['sm.stEntries']);
    expect(r.steps[0].lines).toContain('c₁₁ = 1·5 + 2·7 = 19');
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
    const nul = r.steps.find(s => s.head.key === 'sp.stBases').lines.find(l => typeof l === 'string' && l.startsWith('s₁'));
    expect(nul).toContain('s₁ = [-2; 1; 0]');
    expect(multiply(M, [[-2], [1], [0]])).toEqual([[0], [0]]);
  });
  it('cột phụ thuộc: chỉ ra cột nào bằng tổ hợp cột nào', () => {
    const r = spaceReport([[1, 2, 3], [1, 2, 3]]);
    const ind = r.steps.at(-1).lines;
    expect(ind.some(l => l.key === 'sp.dep')).toBe(true);
    expect(ind.some(l => typeof l === 'string' && l.startsWith('a₂ = 2·a₁'))).toBe(true);
  });
  it('ma trận khả nghịch: các cột là cơ sở của Rᵐ', () => {
    expect(spaceReport(A).steps.at(-1).lines.at(-1).key).toBe('sp.isBasis');
  });
});

describe('check tự kiểm', () => {
  it('det và hạng so theo giá trị', async () => {
    const { matrixReport } = await import('../src/logic/report-matrix.js');
    const { systemReport } = await import('../src/logic/report-system.js');
    expect(matrixReport('det', [[1, 2], [3, 4]]).check('-2')).toBe(true);
    expect(matrixReport('det', [[1, 2], [3, 4]]).check('2')).toBe(false);
    expect(matrixReport('rank', [[1, 2], [2, 4]]).check('1')).toBe(true);
    const r = systemReport([[1, 1], [1, -1]], [3, 1]);
    expect(r.check('x = 2, y = 1')).toBe(true);
    expect(r.check('1, 2')).toBe(false);
  });
});

describe('check tự kiểm: vector, tổ hợp, không gian', () => {
  it('nhận độ dài / tích vô hướng / góc; hệ số tổ hợp; hạng', async () => {
    const { vectorReport, comboReport } = await import('../src/logic/report-vector.js');
    const { spaceReport } = await import('../src/logic/report-space.js');
    const r = vectorReport([3, 4], [4, 3]);
    for (const ok of ['5', '24', '16.26']) expect(r.check(ok), ok).toBe(true);
    expect(r.check('7')).toBe(false);
    expect(vectorReport([1, 2, 2]).check('3')).toBe(true);
    const c = comboReport([[1, 0, 1], [0, 1, 1]], [2, -1, 1]);
    expect(c.check('2, -1')).toBe(true);
    expect(c.check('1, 1')).toBe(false);
    expect(comboReport([[1, 0], [0, 1]], [1, 1]).check('1 1')).toBe(true);
    expect(spaceReport([[1, 2], [2, 4]]).check('1')).toBe(true);
  });
});

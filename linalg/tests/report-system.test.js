import { describe, it, expect } from 'vitest';
import { systemReport } from '../src/logic/report-system.js';

const keys = r => r.steps.map(s => s.head.key);
const strs = lines => lines.filter(l => typeof l === 'string');

describe('systemReport', () => {
  it('2×2 nghiệm duy nhất, đủ bước E / LU / nghịch đảo', () => {
    const r = systemReport([[1, 1], [1, -1]], [3, 1]);
    expect(r.answer.slice(0, 2)).toEqual(['x = 2', 'y = 1']);
    expect(keys(r)).toEqual(expect.arrayContaining(['ss.stSetup', 'ss.stCol', 'ss.stE', 'ss.stLU', 'ss.stSolveLU', 'ss.stInverse']));
    expect(strs(r.steps.find(s => s.head.key === 'ss.stLU').lines).at(-1)).toMatch(/✓/);
  });
  it('3×3 Strang 2.2: ba phép, tích E ra đúng U và L ghép từ ℓ', () => {
    const r = systemReport([[2, 1, 1], [4, -6, 0], [-2, 7, 2]], [5, -2, 9]);
    expect(r.answer.slice(0, 3)).toEqual(['x = 1', 'y = 1', 'z = 2']);
    const e = r.steps.find(s => s.head.key === 'ss.stE');
    expect(strs(e.lines).filter(l => /^E[₁₂₃]/.test(l) && l.includes('(R')).length).toBe(3);
    const lu = r.steps.find(s => s.head.key === 'ss.stLU');
    expect(strs(lu.lines)).toEqual(expect.arrayContaining(['ℓ₂₁ = 2', 'ℓ₃₁ = -1', 'ℓ₃₂ = -1']));
  });
  it('cần đổi hàng ⇒ PA = LU', () => {
    const r = systemReport([[0, 1, 1], [1, 2, 3], [2, 1, 1]], [1, 2, 3]);
    expect(keys(r)).toContain('ss.stPLU');
    expect(strs(r.steps.find(s => s.head.key === 'ss.stPLU').lines).at(-1)).toMatch(/✓/);
  });
  it('vô số nghiệm / vô nghiệm', () => {
    const inf = systemReport([[1, 2, 3], [2, 4, 6]], [4, 8]);
    expect(inf.answer[0].key).toBe('ss.many');
    const none = systemReport([[1, 1], [1, 1]], [1, 2]);
    expect(none.answer[0].key).toBe('ss.none');
    expect(keys(none)).toContain('ss.stWhyNone');
  });
  it('suy biến vuông: báo không khả nghịch', () => {
    const r = systemReport([[1, 2], [2, 4]], [3, 6]);
    expect(r.steps.find(s => s.head.key === 'ss.stInverse').lines[0].key).toBe('ss.notInv');
  });
  it('hệ chữ nhật 2×3 không có nghịch đảo', () => {
    expect(keys(systemReport([[1, 0, 1], [0, 1, 1]], [1, 2]))).not.toContain('ss.stInverse');
  });
});

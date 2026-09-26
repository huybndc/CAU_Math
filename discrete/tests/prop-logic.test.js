import { describe, it, expect } from 'vitest';
import { parseProp, normalize, varsOf, evalProp, truthColumn, classify, equivalent, formatProp, subformulas } from '../src/logic/prop-logic.js';

const P = parseProp;

describe('logic mệnh đề', () => {
  it('đọc ký hiệu chuẩn lẫn ASCII', () => {
    expect(normalize('p -> ~q & r <-> s')).toBe('p → ¬q ∧ r ↔ s');
    expect(formatProp(P('p -> ~q & r'))).toBe('p → (¬q ∧ r)');
    expect(formatProp(P('not p or q'))).toBe('¬p ∨ q');
  });

  it('ưu tiên: ¬ > ∧ > ⊕ > ∨ > → > ↔ ; → kết hợp phải', () => {
    expect(formatProp(P('(p ∨ q) ∧ r'))).toBe('(p ∨ q) ∧ r');
    expect(equivalent(P('p → q → r'), P('p → (q → r)'))).toBe(true);
    expect(equivalent(P('p → q → r'), P('(p → q) → r'))).toBe(false);
    expect(formatProp(P('(p → q) → r'))).toBe('(p → q) → r');
    expect(formatProp(P('p → q → r'))).toBe('p → q → r');
    expect(formatProp(P('p ∧ q ∧ r'))).toBe('p ∧ q ∧ r');
  });

  it('bảng chân trị: dòng 0 = mọi biến sai, biến đầu là bit cao', () => {
    expect(truthColumn(P('p → q'))).toBe('1101');
    expect(truthColumn(P('p ⊕ q'))).toBe('0110');
    expect(truthColumn(P('p ↔ q'))).toBe('1001');
    expect(varsOf(P('r ∧ p ∨ q'))).toEqual(['p', 'q', 'r']);
    expect(evalProp(P('p ∧ ¬q'), { p: true, q: false })).toBe(true);
  });

  it('phân loại + tương đương (các luật quen thuộc)', () => {
    expect(classify(P('p ∨ ¬p'))).toBe('tautology');
    expect(classify(P('p ∧ ¬p'))).toBe('contradiction');
    expect(classify(P('p → q'))).toBe('contingent');
    expect(equivalent(P('p → q'), P('¬q → ¬p'))).toBe(true);        // phản đảo
    expect(equivalent(P('p → q'), P('q → p'))).toBe(false);          // đảo
    expect(equivalent(P('¬(p ∧ q)'), P('¬p ∨ ¬q'))).toBe(true);      // DeMorgan
    expect(equivalent(P('p'), P('p ∧ (q ∨ ¬q)'))).toBe(true);        // khác tập biến vẫn so được
  });

  it('công thức con theo thứ tự tính, không lặp', () => {
    expect(subformulas(P('¬p ∨ (p ∧ q)')).map(s => s.text)).toEqual(['¬p', 'p ∧ q', '¬p ∨ (p ∧ q)']);
  });

  it('báo lỗi rõ khi gõ sai', () => {
    for (const bad of ['', 'p ∧', '(p ∨ q', 'p # q', 'A ∧ B']) expect(() => P(bad), bad).toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import { vectorReport, comboReport } from '../src/logic/report-vector.js';
import { angleDeg } from '../src/logic/vector.js';

const text = lines => lines.map(l => (typeof l === 'string' ? l : l.key)).join(' | ');

describe('vectorReport', () => {
  it('độ dài, tích vô hướng, góc — ví dụ (1,2,2) và (2,-1,0)', () => {
    const r = vectorReport([1, 2, 2], [2, -1, 0]);
    expect(r.answer[0]).toBe('|v| = 3');
    expect(r.answer[1]).toBe('|w| = √5');
    expect(r.answer[2]).toBe('v·w = 0');
    expect(r.answer.some(l => l.key === 'sv.orth')).toBe(true);
  });
  it('góc khớp angleDeg và nhận ra góc đặc biệt', () => {
    const r = vectorReport([1, 0], [1, 1]);
    expect(angleDeg([1, 0], [1, 1])).toBeCloseTo(45, 9);
    expect(text(r.answer)).toContain('θ = 45° = π/4');
  });
  it('căn chưa rút gọn được viết dạng k√r', () => {
    expect(vectorReport([2, 2, 2]).answer[0]).toBe('|v| = 2√3');
  });
  it('song song được nhận ra; vector 0 không có góc', () => {
    expect(vectorReport([1, 2], [2, 4]).answer.some(l => l.key === 'sv.par')).toBe(true);
    const z = vectorReport([0, 0], [1, 1]);
    expect(z.steps.some(s => s.head.key === 'sv.stAngle')).toBe(false);
  });
  it('khác số chiều ⇒ báo lỗi', () => {
    expect(() => vectorReport([1, 2], [1, 2, 3])).toThrow();
  });
});

describe('comboReport', () => {
  it('w = 2v₁ − v₂', () => {
    const r = comboReport([[1, 0, 1], [0, 1, 1]], [2, -1, 1]);
    expect(r.answer.some(l => l.key === 'sv.isCombo')).toBe(true);
    expect(text(r.answer)).toContain('2·v₁ + (-1)·v₂');
  });
  it('không là tổ hợp', () => {
    expect(comboReport([[1, 0, 0], [0, 1, 0]], [0, 0, 1]).answer[0].key).toBe('sv.notCombo');
  });
  it('vô số cách khi các vector phụ thuộc', () => {
    const r = comboReport([[1, 1], [2, 2]], [3, 3]);
    expect(r.answer.some(l => l.key === 'sv.manyWays')).toBe(true);
    expect(r.steps.at(-1).lines[0].key).toBe('sv.dep');
  });
});

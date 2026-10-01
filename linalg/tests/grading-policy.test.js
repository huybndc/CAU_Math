import { describe, it, expect } from 'vitest';
import { gradeValue, tolOf } from '../src/logic/quiz-kit.js';

describe('chính sách sai số', () => {
  it('đáp án nguyên: chặt', () => {
    expect(tolOf({ answer: [3, -2] })).toBe(1e-6);
    expect(gradeValue({ answer: 3 }, '3.01').ok).toBe(false);
  });
  it('đáp án lẻ: thập phân 2 chữ số được nhận, 1 chữ số thì không', () => {
    const q = { answer: [1 / Math.SQRT2, 1 / Math.SQRT2] };
    expect(gradeValue(q, '0.71, 0.71').ok).toBe(true);
    expect(gradeValue(q, '1/sqrt(2), √2/2').ok).toBe(true);
    expect(gradeValue(q, '0.7, 0.7').ok).toBe(true);   // lệch 0.0071 ≤ 0.01
    expect(gradeValue(q, '0.6, 0.6').ok).toBe(false);
  });
});

describe('góc: độ hoặc radian', () => {
  const q = { answer: 45, tol: 0.5, angle: true };
  it.each(['45', '45°', 'π/4', 'pi/4', '0.7854 rad'])('%s đúng', s => expect(gradeValue(q, s).ok).toBe(true));
  it.each(['0.7854', '90', 'π/3'].slice(1))('%s sai', s => expect(gradeValue(q, s).ok).toBe(false));
});

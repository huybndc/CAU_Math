import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch2 from '../src/logic/ch2-quiz.js';

/* Kiểm độc lập dạng "Đếm giá trị thoả" (D2): chỉ đọc CHỮ của đề (miền, lượng từ, quan hệ) rồi đếm lại bằng bảng quan hệ riêng. */
const REL = { 'x < y': (x, y) => x < y, 'x ≤ y': (x, y) => x <= y, 'x + y = 0': (x, y) => x + y === 0, 'x · y = 0': (x, y) => x * y === 0,
  'x ≠ y': (x, y) => x !== y, 'x = y²': (x, y) => x === y * y, 'x + y > 2': (x, y) => x + y > 2, 'x · y ≥ x': (x, y) => x * y >= x };

describe('D2 inner: đếm lại từ chữ của đề', () => {
  it('đáp án đúng, lời giải chứa đáp án, không phải 0 hay tất cả', () => {
    for (let s = 1; s <= 300; s++) {
      const q = ch2.makeQuestion('inner', seededRandom(s));
      const m = q.textParams.f.match(/^([∀∃])(\w) \((.+)\)$/), quant = m[1], vi = m[2], rel = m[3];
      const D = q.textParams.d.slice(1, -1).split(', ').map(Number), vo = q.textParams.v;
      const holds = (o, i) => (vo === 'x' ? REL[rel](o, i) : REL[rel](i, o));
      const n = D.filter(o => (quant === '∀' ? D.every(i => holds(o, i)) : D.some(i => holds(o, i)))).length;
      expect(q.answer, q.textParams.f).toBe(n);
      expect(n).toBeGreaterThan(0);
      expect(n).toBeLessThan(D.length);
      expect(ch2.checkAnswer(q, String(n)).ok).toBe(true);
      expect(ch2.checkAnswer(q, String(n + 1)).ok).toBe(false);
      expect(vi).toBeTruthy();
    }
  });
});

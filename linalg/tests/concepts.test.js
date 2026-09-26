import { describe, it, expect } from 'vitest';
import { verifyCheck } from '../src/logic/concept-check.js';
import { validateItem, withConcepts, conceptDicts } from '@shared/logic/concepts.js';
import { seededRandom } from '@shared/logic/shuffle.js';
import { multiply, equals } from '../src/logic/matrix.js';
import { sectionIds } from '../../scripts/gen/topics.js';
import concepts from '../src/content/concepts.json';
import { vi } from '../src/i18n/vi/index.js';
import { en } from '../src/i18n/en/index.js';
import { CHOICE_BANKS } from '../src/logic/mcq-banks.js';
import * as ch2 from '../src/logic/ch2-quiz.js';

/* Câu khái niệm LinAlg lấy từ đề/bài có lời giải (D48): đáp án nguồn được chạy lại bằng bộ giải của app. */

describe('kiểm phép tính trong câu khái niệm LinAlg', () => {
  it('nhận phép tính đúng, loại phép tính sai', () => {
    const A = [[1, 2, 3], [3, 5, 6], [4, 7, 9]];
    const cases = [
      [{ type: 'dims', A, rank: 2, nullDim: 1, leftNullDim: 1 }, true],
      [{ type: 'dims', A, rank: 3 }, false],
      [{ type: 'system', A: [[1, 0], [0, 1], [0, 0]], b: [1, 1, 1], kind: 'none' }, true],
      [{ type: 'system', A: [[1, 0], [0, 1], [0, 0]], b: [0, 1, 0], kind: 'none' }, false],
      [{ type: 'solves', A, x: [3, -3, 1] }, true],
      [{ type: 'solves', A, x: [1, -1, 1] }, false],
      [{ type: 'product', A: [[1], [3]], B: [[2, 4]], C: [[2, 4], [6, 12]] }, true],
      [{ type: 'product', A: [[2, 4]], B: [[1], [3]], C: [[2, 4], [6, 12]] }, false],
      [{ type: 'inverse', A: [[2, 1], [1, 1]], inv: [[1, -1], [-1, 2]] }, true],
      [{ type: 'inverse', A: [[2, 1], [1, 1]], inv: [[1, 1], [1, 2]] }, false],
    ];
    for (const [c, ok] of cases) expect(verifyCheck(c).ok, JSON.stringify(c)).toBe(ok);
  });

  it('check lạ hoặc ma trận hỏng thì loại, không ném lỗi', () => {
    expect(verifyCheck({ type: 'magic' }).ok).toBe(false);
    expect(verifyCheck({ type: 'product', A: [[1, 2]], B: [[1, 2]], C: [[1]] }).ok).toBe(false);
    expect(verifyCheck(undefined).ok).toBe(false);
  });

  it('lời giải thích phương án nhiễu của la2-e-order nói đúng (không phải A⁻¹, không phải A)', () => {
    const E21 = [[1, 0, 0], [-4, 1, 0], [0, 0, 1]], E31 = [[1, 0, 0], [0, 1, 0], [-3, 0, 1]], E23 = [[1, 0, 0], [0, 1, -1], [0, 0, 1]];
    const inv = e => e.map((r, i) => r.map((x, j) => (i === j ? x : -x)));      // nghịch đảo ma trận khử một phần tử
    const prod = (...ms) => ms.reduce((p, m) => multiply(p, m));
    const A = [[1, 0, 0], [4, 1, 1], [3, 0, 1]], Ainv = prod(E23, E31, E21);
    expect(equals(multiply(A, Ainv), [[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(true);
    expect(equals(prod(inv(E21), inv(E31), inv(E23)), A)).toBe(true);
    for (const wrong of [prod(E21, E31, E23), prod(inv(E23), inv(E31), inv(E21))]) {
      expect(equals(wrong, Ainv) || equals(wrong, A)).toBe(false);
    }
  });
});

describe('câu khái niệm LinAlg (src/content/concepts.json)', () => {
  it('mọi câu hợp lệ, phép tính kèm theo đúng, id không trùng, chương nào cũng có câu', () => {
    const sections = sectionIds('linalg');
    for (const it of concepts) expect(validateItem(it, { sections, verify: verifyCheck }), it.id).toEqual([]);
    expect(new Set(concepts.map(it => it.id)).size).toBe(concepts.length);
    expect(new Set(concepts.map(it => it.chapter))).toEqual(new Set(Object.keys(sections)));
    for (const it of concepts) expect(it.source, it.id).toMatch(/\S{3,}/);
  });

  it('gói vào ngân hàng tự luận lẫn trắc nghiệm: chấm đúng, mọi khoá có ở cả VI lẫn EN', () => {
    for (const k of Object.keys(conceptDicts(concepts).vi)) { expect(vi[k], k).toBeTruthy(); expect(en[k], k).toBeTruthy(); }
    for (const base of [ch2, CHOICE_BANKS.c2q]) {
      const bank = withConcepts(base, concepts.filter(it => it.chapter === 'ch2'));
      expect(vi['c2q.concept'] && en['c2q.concept']).toBeTruthy();
      for (let s = 0; s < 30; s++) {
        const q = bank.makeQuestion('concept', seededRandom(s));
        expect(bank.checkAnswer(q, String(q.answer)).ok).toBe(true);
        expect(bank.checkAnswer(q, String((q.answer + 1) % 4)).ok).toBe(false);
      }
      expect(bank.makeQuestion(base.KINDS[0], seededRandom(1)).kind).toBe(base.KINDS[0]);
    }
  });
});

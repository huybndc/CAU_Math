import { describe, it, expect } from 'vitest';
import { validateItem, withConcepts, conceptDicts } from '@shared/logic/concepts.js';
import { seededRandom } from '@shared/logic/shuffle.js';
import { sectionIds } from '../../scripts/gen/topics.js';
import concepts from '../src/content/concepts.json';
import { vi } from '../src/i18n/vi/index.js';
import { en } from '../src/i18n/en/index.js';
import * as ch2 from '../src/logic/ch2-quiz.js';

describe('câu khái niệm Discrete (src/content/concepts.json)', () => {
  it('mọi câu hợp lệ, id không trùng, chương nào cũng có câu', () => {
    const sections = sectionIds('discrete');
    for (const it of concepts) expect(validateItem(it, { sections }), it.id).toEqual([]);
    expect(new Set(concepts.map(it => it.id)).size).toBe(concepts.length);
    expect(new Set(concepts.map(it => it.chapter))).toEqual(new Set(Object.keys(sections)));
  });

  it('gói vào ngân hàng chương: chấm đúng, mọi khoá có ở cả VI lẫn EN', () => {
    const bank = withConcepts(ch2, concepts.filter(it => it.chapter === 'ch2'));
    const keys = Object.keys(conceptDicts(concepts).vi);
    for (const k of keys) { expect(vi[k], k).toBeTruthy(); expect(en[k], k).toBeTruthy(); }
    expect(vi['c2q.concept'] && en['c2q.concept']).toBeTruthy();
    for (let s = 0; s < 30; s++) {
      const q = bank.makeQuestion('concept', seededRandom(s));
      expect(bank.checkAnswer(q, String(q.answer)).ok).toBe(true);
      expect(bank.checkAnswer(q, String((q.answer + 1) % 4)).ok).toBe(false);
    }
    expect(bank.makeQuestion('truth', seededRandom(1)).kind).toBe('truth');
  });
});

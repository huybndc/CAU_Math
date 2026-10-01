import { describe, it, expect } from 'vitest';
import { verifyCheck } from '../src/logic/concept-check.js';
import { validateItem, withConcepts, conceptDicts } from '@shared/logic/concepts.js';
import { seededRandom } from '@shared/logic/shuffle.js';
import { sectionIds } from '../../scripts/gen/topics.js';
import concepts from '../src/content/concepts.json';
import { vi } from '../src/i18n/vi/index.js';
import { en } from '../src/i18n/en/index.js';
import * as ch2 from '../src/logic/ch2-quiz.js';

describe('kiểm phép tính trong câu khái niệm Discrete', () => {
  it('nhận phép tính đúng, loại phép tính sai', () => {
    const cases = [
      [{ type: 'prop', a: 'p ∧ q', b: 'p ∨ q', rel: 'implies' }, true],
      [{ type: 'prop', a: 'p → q', b: '¬q → ¬p', rel: 'equiv' }, true],
      [{ type: 'prop', a: 'p → q', b: 'q → p', rel: 'equiv' }, false],
      [{ type: 'classify', expr: 'p ∨ ¬p', kind: 'tautology' }, true],
      [{ type: 'classify', expr: 'p → q', kind: 'tautology' }, false],
      [{ type: 'inverse', a: 11, n: 113, inv: 72 }, true],
      [{ type: 'inverse', a: 11, n: 113, inv: 41 }, false],
      [{ type: 'inverse', a: 6, n: 9, inv: null }, true],
      [{ type: 'power', a: 5, k: 6, n: 17, value: 2 }, true],
      [{ type: 'power', a: 5, k: 6, n: 17, value: 8 }, false],
      [{ type: 'gcd', a: 259, b: 70, gcd: 7, s: 3, t: -11 }, true],
      [{ type: 'gcd', a: 259, b: 70, gcd: 7, s: 3, t: 11 }, false],
      [{ type: 'phi', n: 60, value: 16 }, true],
      [{ type: 'phi', n: 60, value: 59 }, false],
      [{ type: 'graph', edges: 'ab, bc, ca', bipartite: false, euler: 'circuit', components: 1 }, true],
      [{ type: 'graph', edges: 'ab, bc, cd', bipartite: true, euler: 'circuit' }, false],
      [{ type: 'degseq', seq: [3, 3, 2, 2, 2], ok: true }, true],
      [{ type: 'degseq', seq: [4, 4, 1, 1], ok: true }, false],
      [{ type: 'nope' }, false],
    ];
    for (const [c, ok] of cases) expect(verifyCheck(c).ok, JSON.stringify(c)).toBe(ok);
  });
});

describe('câu khái niệm Discrete (src/content/concepts.json)', () => {
  it('mọi câu hợp lệ, id không trùng, chương nào cũng có câu', () => {
    const sections = sectionIds('discrete');
    for (const it of concepts) expect(validateItem(it, { sections, verify: verifyCheck }), it.id).toEqual([]);
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

import { describe, it, expect } from 'vitest';
import { verifyCheck } from '../src/logic/concept-check.js';
import { varsCount } from '../src/logic/expr-parser.js';
import { validateItem, withConcepts, conceptDicts } from '@shared/logic/concepts.js';
import { seededRandom } from '@shared/logic/shuffle.js';
import { sectionIds } from '../../scripts/gen/topics.js';
import concepts from '../src/content/concepts.json';
import * as ch1 from '../src/logic/ch1-quiz.js';

describe('kiểm phép tính trong câu khái niệm', () => {
  it('suy số biến theo tên biến Mano', () => {
    expect(varsCount('x + y')).toBe(2);
    expect(varsCount("xy'z")).toBe(3);
    expect(varsCount('w + x')).toBe(4);
  });

  it('nhận phép tính đúng, loại phép tính sai', () => {
    const cases = [
      [{ type: 'equiv', a: "x + x'y", b: 'x + y', same: true }, true],
      [{ type: 'equiv', a: "x + x'y", b: 'x', same: true }, false],
      [{ type: 'equiv', a: 'xy', b: 'x + y', same: false }, true],
      [{ type: 'minterms', expr: 'xy + z', list: [1, 3, 5, 6, 7] }, true],
      [{ type: 'minterms', expr: 'xy + z', list: [1, 3, 5, 7] }, false],
      [{ type: 'literals', minterms: [1, 3, 7, 11, 15], dontcares: [0, 2, 5], n: 4, form: 'sop', count: 4 }, true],
      [{ type: 'literals', minterms: [1, 3, 7, 11, 15], dontcares: [], n: 4, form: 'sop', count: 4 }, false],
      [{ type: 'convert', value: '101.01', from: 2, to: 10, result: '5.25' }, true],
      [{ type: 'convert', value: '41', from: 10, to: 2, result: '100101' }, false],
      [{ type: 'complement', value: '0110', radix: 2, diminished: false, result: '1010' }, true],
      [{ type: 'complement', value: '0110', radix: 2, diminished: true, result: '1010' }, false],
      [{ type: 'signed', bits: '11111010', format: 'twos', value: -6 }, true],
      [{ type: 'signed', bits: '11111010', format: 'ones', value: -6 }, false],
      [{ type: 'gray', bin: '1011', gray: '1110' }, true],
      [{ type: 'gray', bin: '1011', gray: '1101' }, false],
    ];
    for (const [c, ok] of cases) expect(verifyCheck(c).ok, JSON.stringify(c)).toBe(ok);
  });

  it('check lạ hoặc biểu thức hỏng thì loại, không ném lỗi', () => {
    expect(verifyCheck({ type: 'magic' }).ok).toBe(false);
    expect(verifyCheck({ type: 'equiv', a: 'x +', b: 'x', same: true }).ok).toBe(false);
    expect(verifyCheck(undefined).ok).toBe(false);
  });
});

describe('câu khái niệm đã duyệt (src/content/concepts.json)', () => {
  it('mọi câu hợp lệ và phép tính kèm theo đúng', () => {
    const sections = sectionIds('logic');
    for (const it of concepts) expect(validateItem(it, { sections, verify: verifyCheck }), it.id).toEqual([]);
  });

  it('id không trùng', () => {
    expect(new Set(concepts.map(it => it.id)).size).toBe(concepts.length);
  });

  it('gói vào ngân hàng chương: chọn đúng phương án là đúng, dịch được mọi khoá', () => {
    const items = concepts.filter(it => it.chapter === 'ch1');
    const bank = withConcepts(ch1, items);
    const dict = conceptDicts(concepts).vi;
    for (let s = 0; s < 50; s++) {
      const q = bank.makeQuestion('concept', seededRandom(s));
      expect(bank.checkAnswer(q, String(q.answer)).ok).toBe(true);
      expect(bank.checkAnswer(q, String((q.answer + 1) % 4)).ok).toBe(false);
      for (const k of [q.textKey, q.explainKey, ...q.choices, ...q.whyKeys]) expect(dict[k], k).toBeTruthy();
    }
    // các dạng tính toán vẫn đi qua ngân hàng gốc
    expect(bank.makeQuestion('convert', seededRandom(1)).kind).toBe('convert');
  });
});

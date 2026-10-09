import { describe, it, expect } from 'vitest';
import { makeQuestion } from '../src/logic/ch2-quiz.js';
import { exprTruthTable, countLiterals } from '../src/logic/expr-parser.js';

describe('câu "rút gọn" Chương 2 không phải câu đố mẹo', () => {
  it('mọi đề (3000 hạt giống) rút gọn được: dạng tối giản ít literal hơn dạng chính tắc', () => {
    let seed = 5; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let i = 0; i < 3000; i++) {
      const q = makeQuestion('simplify', rnd);
      const canonLiterals = countLiterals(q.target.expr, 3);
      expect(q.target.literals, q.target.expr).toBeLessThan(canonLiterals);
      expect(q.answer).not.toBe(q.target.expr);
    }
  });
});

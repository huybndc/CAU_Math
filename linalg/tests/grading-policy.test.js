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

/* Kiểm trên MỌI dạng sinh ra: đáp án đúng luôn qua; lệch 0.05 (> mọi sai số) luôn trượt; ô vector/ma trận mang đúng cỡ. */
import * as c1 from '../src/logic/ch1-quiz.js';
import * as c2 from '../src/logic/ch2-quiz.js';
import * as c3 from '../src/logic/ch3-quiz.js';
import { seededRandom } from '@shared/logic/shuffle.js';
import { show } from '../src/logic/quiz-kit.js';

describe('mọi dạng tính toán: chấm đúng / trượt khi lệch', () => {
  for (const [name, bank] of [['c1', c1], ['c2', c2], ['c3', c3]]) {
    for (const kind of bank.KINDS) {
      it(`${name}.${kind}`, () => {
        for (let seed = 0; seed < 25; seed++) {
          const q = bank.makeQuestion(kind, seededRandom(seed));
          if (q.format === 'choice') continue;
          expect(bank.checkAnswer(q, show(q.answer)).ok, `${kind} #${seed} đáp án đúng`).toBe(true);
          const flat = [q.answer].flat(2);
          const bad = flat.map((x, i) => (i === 0 ? x + 0.05 * (q.angle ? 20 : 1) : x));
          const given = Array.isArray(q.answer) && Array.isArray(q.answer[0])
            ? '[' + q.answer.map((r, i) => r.map((_, j) => bad[i * r.length + j]).join(' ')).join('; ') + ']'
            : bad.join(', ');
          expect(bank.checkAnswer(q, given).ok, `${kind} #${seed} lệch`).not.toBe(true);
          if (q.input?.type === 'vec') expect(q.input.n).toBe(q.answer.length);
          if (q.input?.type === 'matrix') expect([q.input.rows, q.input.cols]).toEqual([q.answer.length, q.answer[0].length]);
        }
      });
    }
  }
});

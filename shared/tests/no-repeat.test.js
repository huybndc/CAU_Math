import { describe, it, expect } from 'vitest';
import { freshQuestion, poolSize } from '../logic/question-pool.js';
import { seededRandom } from '../logic/shuffle.js';
import { CHAPTERS as LOGIC } from '../../logic/src/logic/chapters.js';
import { CHAPTERS as LINALG } from '../../linalg/src/logic/chapters.js';
import { CHAPTERS as DISCRETE } from '../../discrete/src/logic/chapters.js';

/* Một lượt luyện tập KHÔNG BAO GIỜ có hai câu cùng nội dung người học nhìn thấy (đề, tham số, hình,
   câu khái niệm nào) — xáo lại phương án cũng tính là lặp. Chạy trên mọi dạng của mọi ngân hàng cả 3 app,
   theo đúng cách bộ chạy rút câu (freshQuestion, hết câu mới thì dừng). */

// đúng các ngân hàng app dùng (bảng chương chung — hub D33), cả bản trắc nghiệm
const BANKS = Object.fromEntries(Object.entries({ logic: LOGIC, linalg: LINALG, discrete: DISCRETE }).flatMap(([app, chs]) => chs.flatMap(c => [
  [`${app}.${c.id}`, c.bank], ...(c.choiceBank ? [[`${app}-mcq.${c.id}`, c.choiceBank]] : []),
])));

const visible = q => JSON.stringify([q.kind, q.textKey, q.textParams ?? null, q.figure ?? null, q.meta?.id ?? null]);

describe('một lượt 10 câu không có câu trùng nội dung', () => {
  for (const [name, bank] of Object.entries(BANKS)) {
    it(name, () => {
      for (const kind of bank.KINDS) for (let round = 1; round <= 8; round++) {
        const rnd = seededRandom(round * 131);
        const make = () => bank.makeQuestion(kind, rnd);
        const size = poolSize(make, 10);
        const seen = new Set(), got = [];
        while (got.length < size) { const q = freshQuestion(make, seen); if (!q) break; got.push(visible(q)); }
        expect(new Set(got).size, `${name}.${kind} lượt ${round}`).toBe(got.length);
      }
    });
  }
});

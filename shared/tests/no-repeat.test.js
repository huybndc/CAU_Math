import { describe, it, expect } from 'vitest';
import { freshQuestion, poolSize } from '../logic/question-pool.js';
import { withConcepts } from '../logic/concepts.js';
import { seededRandom } from '../logic/shuffle.js';
import logicConcepts from '../../logic/src/content/concepts.json';
import discreteConcepts from '../../discrete/src/content/concepts.json';
import { CHOICE_BANKS as LOGIC_MCQ } from '../../logic/src/logic/mcq-banks.js';
import { CHOICE_BANKS as LINALG_MCQ } from '../../linalg/src/logic/mcq-banks.js';

/* Một lượt luyện tập KHÔNG BAO GIỜ có hai câu cùng nội dung người học nhìn thấy (đề, tham số, hình,
   câu khái niệm nào) — xáo lại phương án cũng tính là lặp. Chạy trên mọi dạng của mọi ngân hàng cả 3 app,
   theo đúng cách bộ chạy rút câu (freshQuestion, hết câu mới thì dừng). */

const L = import.meta.glob('../../logic/src/logic/ch*-quiz.js', { eager: true });
const D = import.meta.glob('../../discrete/src/logic/ch*-quiz.js', { eager: true });
const A = import.meta.glob('../../linalg/src/logic/ch*-quiz.js', { eager: true });
const chOf = p => p.match(/ch\d+/)[0];

const BANKS = {
  ...Object.fromEntries(Object.entries(L).map(([p, m]) => [`logic.${chOf(p)}`, withConcepts(m, logicConcepts.filter(c => c.chapter === chOf(p)))])),
  ...Object.fromEntries(Object.entries(LOGIC_MCQ).map(([p, m]) => [`logic-mcq.${p}`, m])),
  ...Object.fromEntries(Object.entries(D).map(([p, m]) => [`discrete.${chOf(p)}`, withConcepts(m, discreteConcepts.filter(c => c.chapter === chOf(p)))])),
  ...Object.fromEntries(Object.entries(A).map(([p, m]) => [`linalg.${chOf(p)}`, m])),
  ...Object.fromEntries(Object.entries(LINALG_MCQ).map(([p, m]) => [`linalg-mcq.${p}`, m])),
};

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

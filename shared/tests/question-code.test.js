import { describe, it, expect } from 'vitest';
import { seededQuestion, questionCode, parseCode, signature } from '../logic/question-pool.js';
import { buildExam } from '../logic/exam.js';
import { CHAPTERS as LOGIC } from '../../logic/src/logic/chapters.js';
import { CHAPTERS as LINALG } from '../../linalg/src/logic/chapters.js';
import { CHAPTERS as DISCRETE } from '../../discrete/src/logic/chapters.js';

/* Mã câu (hub D33): người học gửi mã của câu thấy sai ⇒ Claude sinh lại ĐÚNG câu đó (đề, hình, phương án, lời giải).
   Kiểm trên mọi dạng của mọi ngân hàng cả 3 app, cả bản trắc nghiệm, và câu trong đề thi thử. */

const APPS = { logic: LOGIC, linalg: LINALG, discrete: DISCRETE };
const same = (a, b) => JSON.stringify([signature(a), a.answer, a.choices ?? null, a.work]) === JSON.stringify([signature(b), b.answer, b.choices ?? null, b.work]);

/** Theo mã: tìm ngân hàng rồi sinh lại — đúng cách scripts/show-question.js làm. */
function fromCode(code) {
  const c = parseCode(code);
  const ch = APPS[c.subject].find(x => x.prefix === c.prefix);
  return seededQuestion(c.mcq ? ch.choiceBank : ch.bank, c.kind, c.seed);
}

describe('mã câu', () => {
  it('đọc ngược được, mã lạ thì null', () => {
    expect(parseCode('discrete-c8q-iso-1k2j3h')).toEqual({ subject: 'discrete', prefix: 'c8q', kind: 'iso', seed: parseInt('1k2j3h', 36), mcq: false });
    expect(parseCode(' logic-c2q-column-zz-tn ').mcq).toBe(true);
    for (const bad of ['', 'logic-c2q', 'logic-c2q-column-!!', 'logic-c2q-column-1-xx', 'a-b-c-1-tn-9']) expect(parseCode(bad), bad).toBeNull();
    expect(questionCode('logic', 'c1q', { kind: 'convert' })).toBeNull();          // câu không có hạt giống (thẻ học)
  });

  for (const [subject, chapters] of Object.entries(APPS)) {
    for (const ch of chapters) {
      for (const [bank, mcq] of [[ch.bank, false], ...(ch.choiceBank ? [[ch.choiceBank, true]] : [])]) {
        it(`${subject} ${ch.id}${mcq ? ' trắc nghiệm' : ''}: sinh lại đúng câu từ mã`, () => {
          for (const kind of bank.KINDS) for (const seed of [1, 977, 2 ** 31 - 5]) {
            const q = seededQuestion(bank, kind, seed);
            const code = questionCode(subject, ch.prefix, q, !!bank.mcq);
            expect(bank.mcq ?? false, 'cờ trắc nghiệm').toBe(mcq);
            expect(same(fromCode(code), q), code).toBe(true);
          }
        });
      }
    }
  }

  it('câu trong đề thi thử cũng có mã sinh lại đúng câu', () => {
    for (const [subject, chapters] of Object.entries(APPS)) {
      for (const it of buildExam(chapters, { seed: 20260926, minutes: 60, order: 'mixed' })) {
        const code = questionCode(subject, it.prefix, it.q);
        expect(same(fromCode(code), it.q), code).toBe(true);
      }
    }
  });
});

import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch1 from '../src/logic/ch1-quiz.js';
import * as ch2 from '../src/logic/ch2-quiz.js';
import * as ch3 from '../src/logic/ch3-quiz.js';
import { CHOICE_BANKS } from '../src/logic/mcq-banks.js';
import { show } from '../src/logic/quiz-kit.js';
import { vi } from '../src/i18n/vi/index.js';

/* Tính chất cho MỌI dạng × nhiều seed (như test ngân hàng của Logic):
   đáp án của chính câu chấm đúng; mọi "lỗi hay gặp" chấm sai và có lời chẩn đoán;
   bản trắc nghiệm có 4 phương án khác nhau, đúng một phương án đúng; khoá đề đều có trong từ điển. */

const BANKS = { c1q: ch1, c2q: ch2, c3q: ch3 };
const SEEDS = 150;

for (const [prefix, bank] of Object.entries(BANKS)) {
  describe(`ngân hàng ${prefix}`, () => {
    it('có đủ SECONDS và nhãn cho từng dạng', () => {
      for (const k of bank.KINDS) {
        expect(bank.SECONDS[k], k).toBeGreaterThan(0);
        expect(vi[`${prefix}.${k}`], `${prefix}.${k}`).toBeTruthy();
      }
    });

    for (const kind of bank.KINDS) {
      it(`${kind}: đáp án đúng được chấm đúng, lỗi hay gặp bị chấm sai`, () => {
        for (let s = 1; s <= SEEDS; s++) {
          const q = bank.makeQuestion(kind, seededRandom(s * 7919 + kind.length));
          expect(q.kind).toBe(kind);
          expect(vi[q.textKey], q.textKey).toBeTruthy();
          if (q.format !== 'choice') expect(vi[q.formatKey], q.formatKey).toBeTruthy();
          expect(q.work.length, 'lời giải từng bước').toBeGreaterThan(0);
          for (const w of q.work) if (typeof w === 'object') expect(vi[w.key], w.key).toBeTruthy();
          if (q.format === 'choice') {
            expect(bank.checkAnswer(q, String(q.answer)).ok).toBe(true);
            const wrong = bank.checkAnswer(q, String((q.answer + 1) % q.choices.length));
            expect(wrong.ok).toBe(false);
            expect(vi[wrong.detailKey], wrong.detailKey).toBeTruthy();
            continue;
          }
          expect(bank.checkAnswer(q, show(q.answer)).ok, JSON.stringify(q.meta)).toBe(true);
          if (!q.answerText.includes('≈')) expect(bank.checkAnswer(q, q.answerText).ok, q.answerText).toBe(true);
          for (const m of q.mistakes) {
            const r = bank.checkAnswer(q, show(m.value));
            if (r.ok) continue;                                   // lỗi trùng đáp án đúng ở seed này: bỏ qua
            expect(r.retry, `${m.key} ${show(m.value)}`).toBeFalsy();
            expect(vi[r.detailKey], r.detailKey).toBeTruthy();
          }
        }
      });

      it(`${kind}: trắc nghiệm 4 phương án, đúng một đáp án`, () => {
        const mb = CHOICE_BANKS[prefix];
        for (let s = 1; s <= 60; s++) {
          const q = mb.makeQuestion(kind, seededRandom(s * 104729 + 3));
          expect(q.format).toBe('choice');
          if (!q.mcq) continue;                                   // câu vốn đã là câu chọn
          expect(new Set(q.choices).size).toBe(4);
          const right = q.choices.filter((c, i) => mb.checkAnswer(q, String(i)).ok);
          expect(right.length).toBe(1);
          q.choices.forEach(c => expect(bank.checkAnswer(q.orig, c).retry).toBeFalsy());
        }
      });
    }
  });
}

describe('chẩn đoán riêng của chương 3', () => {
  it('bội khác của nghiệm đặc biệt, nghiệm khác của Ax = b', () => {
    for (let s = 1; s <= 40; s++) {
      const q = ch3.makeQuestion('special', seededRandom(s));
      expect(ch3.checkAnswer(q, show(q.answer.map(x => 2 * x))).detailKey).toBe('c3q.dMultiple');
      const p = ch3.makeQuestion('particular', seededRandom(s));
      expect(ch3.checkAnswer(p, show(p.mistakes[0].value)).detailKey).toBe('c3q.dOtherSol');
    }
  });

  it('chấm theo giá trị: phân số, căn, ngoặc đều nhận', () => {
    const q = ch1.makeQuestion('length', seededRandom(3));
    const S = q.meta.v.reduce((a, x) => a + x * x, 0);
    expect(ch1.checkAnswer(q, `√${S}`).ok).toBe(true);
    expect(ch1.checkAnswer(q, 'abc').retry).toBe(true);
  });
});

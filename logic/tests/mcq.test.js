import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import { vi as sharedVi } from '../../shared/i18n/vi.js';
import { en as sharedEn } from '../../shared/i18n/en.js';
import { vi as appVi } from '../src/i18n/vi/index.js';
import { en as appEn } from '../src/i18n/en/index.js';
import * as ch1 from '../src/logic/ch1-quiz.js';
import * as ch2 from '../src/logic/ch2-quiz.js';
import * as ch3 from '../src/logic/ch3-quiz.js';
import * as ch4 from '../src/logic/ch4-quiz.js';
import { CHOICE_BANKS } from '../src/logic/mcq-banks.js';

const BANKS = { c1q: ch1, c2q: ch2, c3q: ch3, c4q: ch4 };
const VI = { ...sharedVi, ...appVi }, EN = { ...sharedEn, ...appEn };
const norm = s => String(s).replace(/[\s_]/g, '').toUpperCase();

for (const [prefix, bank] of Object.entries(BANKS)) {
  const cb = CHOICE_BANKS[prefix];
  describe(`${prefix}: trắc nghiệm khó ngang tự luận`, () => {
    for (const kind of bank.KINDS) {
      it(`${kind}: 4 phương án khác nhau, đúng một đáp án, nhiễu đều bị bộ chấm tự luận xác nhận là sai`, () => {
        for (let seed = 1; seed <= 100; seed++) {
          const q = cb.makeQuestion(kind, seededRandom(seed));
          expect(q.format, `${kind} #${seed}`).toBe('choice');
          if (q.orig) {
            expect(q.mcq).toBe(true);
            expect(q.choices).toHaveLength(4);
            expect(new Set(q.choices.map(norm)).size, `${kind} #${seed}: ${q.choices}`).toBe(4);
            q.choices.forEach((c, i) => {
              const r = bank.checkAnswer(q.orig, c);
              expect(!!r.ok, `${kind} #${seed}: "${c}" ${i === q.answer ? 'phải đúng' : 'phải sai'}`).toBe(i === q.answer);
              expect(cb.checkAnswer(q, String(i)).ok).toBe(i === q.answer);
            });
          }
        }
      });

      it(`${kind}: đề và dòng hướng dẫn có đủ ở VI và EN`, () => {
        for (let seed = 1; seed <= 20; seed++) {
          const q = cb.makeQuestion(kind, seededRandom(seed));
          for (const k of [q.textKey, q.formatKey, q.explainKey].filter(Boolean)) {
            expect(k in VI, `VI thiếu ${k}`).toBe(true);
            expect(k in EN, `EN thiếu ${k}`).toBe(true);
          }
        }
      });
    }
  });
}

describe('trắc nghiệm: nhiễu là lỗi thật, không bừa', () => {
  it('đổi cơ số: có phương án "đọc số dư từ trên xuống" (đảo chữ số)', () => {
    let hit = 0;
    for (let s = 1; s <= 60; s++) {
      const q = CHOICE_BANKS.c1q.makeQuestion('convert', seededRandom(s));
      const ans = String(q.orig.answer);
      const rev = [...ans].reverse().join('').replace(/^0+(?=.)/, '');
      if (rev !== ans && q.choices.map(norm).includes(norm(rev))) hit++;
    }
    expect(hit).toBeGreaterThan(20);
  });

  it('bù r: có phương án "quên +1" (bù r−1)', () => {
    let hit = 0;
    for (let s = 1; s <= 40; s++) {
      const q = CHOICE_BANKS.c1q.makeQuestion('complement', seededRandom(s));
      if (q.choices.map(norm).includes(norm(q.orig.explainParams.dim))) hit++;
    }
    expect(hit).toBeGreaterThan(30);
  });

  it('câu bit: mọi phương án cùng độ dài (không loại được bằng độ dài)', () => {
    for (const [prefix, kind] of [['c1q', 'signed'], ['c1q', 'gray'], ['c1q', 'parity'], ['c2q', 'column'], ['c2q', 'gate']]) {
      for (let s = 1; s <= 40; s++) {
        const q = CHOICE_BANKS[prefix].makeQuestion(kind, seededRandom(s));
        expect(new Set(q.choices.map(c => norm(c).length)).size, `${kind} ${q.choices}`).toBe(1);
      }
    }
  });

  it('chọn sai vẫn nhận lời chẩn đoán như khi tự gõ đáp án đó', () => {
    let diag = 0;
    for (let s = 1; s <= 40; s++) {
      const q = CHOICE_BANKS.c1q.makeQuestion('complement', seededRandom(s));
      const wrong = q.choices.findIndex(c => norm(c) === norm(q.orig.explainParams.dim));
      if (wrong >= 0 && wrong !== q.answer) { expect(CHOICE_BANKS.c1q.checkAnswer(q, String(wrong)).detailKey).toBe('c1q.dNoPlus1'); diag++; }
    }
    expect(diag).toBeGreaterThan(20);
  });

  it('K-map SOP: trắc nghiệm đưa K-map ra (figure), không cần khoanh', () => {
    const q = CHOICE_BANKS.c3q.makeQuestion('sop', seededRandom(3));
    expect(q.figure.type).toBe('kmap');
    expect(q.input).toBeUndefined();
  });
});

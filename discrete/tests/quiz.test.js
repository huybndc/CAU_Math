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
import * as ch5 from '../src/logic/ch5-quiz.js';
import * as ch6 from '../src/logic/ch6-quiz.js';
import * as ch7 from '../src/logic/ch7-quiz.js';
import * as ch8 from '../src/logic/ch8-quiz.js';
import { mod } from '../src/logic/number-theory.js';

/* Test TÍNH CHẤT mọi dạng × 200 hạt giống: đáp án của chính câu đúng, đáp án sửa đi sai,
   mọi khoá chữ có ở hai từ điển và điền đủ tham số. */
const BANKS = { c1q: ch1, c2q: ch2, c3q: ch3, c4q: ch4, c5q: ch5, c6q: ch6, c7q: ch7, c8q: ch8 };
const VI = { ...sharedVi, ...appVi }, EN = { ...sharedEn, ...appEn };
const isKey = s => typeof s === 'string' && /^[\w-]+\.[\w.-]+$/.test(s) && (s in VI);

function asTyped(q) {
  if (q.format === 'choice') return String(q.answer);
  if (q.kind === 'bezout') return q.answer.join(', ');
  if (q.format === 'set') return q.answer.length ? q.answer.join(', ') : '∅';
  if (q.kind === 'inverse' && q.answer === 'none') return 'không';
  return String(q.answer);
}
function wrongOf(q) {
  if (q.format === 'choice') return String((q.answer + 1) % q.choices.length);
  if (q.kind === 'table') return q.answer.replace(/^./, c => (c === '0' ? '1' : '0'));
  if (q.kind === 'bezout') return `${q.answer[0] + 1}, ${q.answer[1]}`;
  if (q.format === 'set') return [...q.answer, 99].join(', ');
  if (q.kind === 'inverse') return q.answer === 'none' ? '1' : String(mod(q.answer + 1, q.meta.n));
  return String(q.answer + 1);
}
function keysOf(q) {
  const out = [q.textKey, q.formatKey, q.hintKey, q.answerText].filter(isKey);
  if (q.format === 'choice') out.push(...q.choices.filter(isKey));
  for (const w of q.work ?? []) if (typeof w === 'object') out.push(w.key);
  return out;
}
const fill = (s, params) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in (params ?? {}) ? 'X' : m));

describe('ngân hàng câu Discrete', () => {
  for (const [prefix, bank] of Object.entries(BANKS)) {
    for (const kind of bank.KINDS) {
      it(`${prefix}.${kind}: 200 câu tự nhất quán, đủ chữ VI/EN`, () => {
        expect(VI[`${prefix}.${kind}`] && EN[`${prefix}.${kind}`]).toBeTruthy();
        for (let seed = 0; seed < 200; seed++) {
          const q = bank.makeQuestion(kind, seededRandom(seed));
          expect(bank.checkAnswer(q, asTyped(q)).ok, `${kind} #${seed} đúng`).toBe(true);
          expect(bank.checkAnswer(q, wrongOf(q)).ok, `${kind} #${seed} sai`).toBe(false);
          expect(q.work?.length ?? 0).toBeGreaterThan(0);
          for (const k of keysOf(q)) {
            expect(k in VI && k in EN, `${kind} khoá ${k}`).toBe(true);
          }
          const tparams = { ...q.textParams };
          expect(fill(VI[q.textKey], tparams), `${kind} #${seed} đề`).not.toMatch(/\{\w+\}/);
          for (const w of q.work) if (typeof w === 'object') expect(fill(VI[w.key], w.params), `${kind} ${w.key}`).not.toMatch(/\{\w+\}/);
        }
      });
    }
  }

  it('Bézout: cặp khác (s + b/g, t − a/g) cũng được chấm đúng', () => {
    const q = ch6.makeQuestion('bezout', seededRandom(3));
    const { a, b } = q.meta;
    const g = q.textParams.g;
    expect(ch6.checkAnswer(q, `${q.answer[0] + b / g}, ${q.answer[1] - a / g}`).ok).toBe(true);
    expect(ch6.checkAnswer(q, '7').retry).toBe(true);
  });

  it('nhóm dạng phủ đủ các dạng', () => {
    for (const [p, bank] of Object.entries(BANKS)) {
      if (!bank.GROUPS) continue;
      expect(bank.GROUPS.flatMap(g => g.kinds).sort()).toEqual([...bank.KINDS].sort());
      for (const g of bank.GROUPS) expect(VI[`${p}.${g.id}`] && EN[`${p}.${g.id}`], `${p}.${g.id}`).toBeTruthy();
    }
  });
});

describe('từ điển Discrete', () => {
  const slots = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
  it('cùng tập khoá, cùng tham số, EN không sót dấu Việt', () => {
    expect(Object.keys(appEn).sort()).toEqual(Object.keys(appVi).sort());
    for (const k of Object.keys(appVi)) expect(slots(appEn[k]), k).toEqual(slots(appVi[k]));
    const viChars = /[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
    for (const [k, v] of Object.entries(appEn)) expect(viChars.test(v), k).toBe(false);
  });
});

describe('đề D1 không vô vị', () => {
  it('bảng chân trị: cột có cả 0 lẫn 1, không có cặp x op x', () => {
    for (let seed = 0; seed < 300; seed++) {
      const q = ch1.makeQuestion('table', seededRandom(seed));
      expect(q.answer).toMatch(/0/);
      expect(q.answer).toMatch(/1/);
      expect(q.meta.f).not.toMatch(/\b([pqr]) [∧∨→↔⊕] ¬?\1\b/);
    }
  });
});

describe('đề D2–D5', () => {
  it('phủ định: luôn đủ 4 phương án khác nhau, chỉ một đúng', () => {
    for (let seed = 0; seed < 150; seed++) {
      const q = ch2.makeQuestion('negate', seededRandom(seed));
      expect(new Set(q.choices).size, `#${seed}`).toBe(4);
    }
  });
  it('bình nước: đong được ⇔ c là bội của gcd và không quá bình lớn', async () => {
    const { gcd } = await import('../src/logic/number-theory.js');
    for (let seed = 0; seed < 150; seed++) {
      const q = ch5.makeQuestion('jugs', seededRandom(seed));
      const { a, b, c } = q.meta;
      expect(q.answer === 0, `#${seed} ${a},${b},${c}`).toBe(c % gcd(a, b) === 0 && c <= b);
    }
  });
});

describe('đề D8 không lệch', () => {
  it('câu chọn: mọi phương án đều có lúc là đáp án; khoảng cách luôn ≥ 2', () => {
    for (const kind of ['valid', 'bipartite', 'euler', 'iso']) {
      const seen = new Set();
      for (let seed = 0; seed < 200; seed++) seen.add(ch8.makeQuestion(kind, seededRandom(seed)).answer);
      expect(seen.size, kind).toBe(ch8.makeQuestion(kind, seededRandom(0)).choices.length);
    }
    for (let seed = 0; seed < 200; seed++) expect(ch8.makeQuestion('dist', seededRandom(seed)).answer).toBeGreaterThanOrEqual(2);
  });
});

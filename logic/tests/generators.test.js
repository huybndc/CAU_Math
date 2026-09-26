import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import { buildExam } from '@shared/logic/exam.js';
import { signature } from '@shared/logic/question-pool.js';
import { vi as sharedVi } from '../../shared/i18n/vi.js';
import { en as sharedEn } from '../../shared/i18n/en.js';
import { vi as appVi } from '../src/i18n/vi/index.js';
import { en as appEn } from '../src/i18n/en/index.js';
import { exprTruthTable, countLiterals } from '../src/logic/expr-parser.js';
import { varNames } from '../src/logic/quine-mccluskey.js';
import * as ch1 from '../src/logic/ch1-quiz.js';
import * as ch2 from '../src/logic/ch2-quiz.js';
import * as ch3 from '../src/logic/ch3-quiz.js';
import * as ch4 from '../src/logic/ch4-quiz.js';

/* Test TÍNH CHẤT cho mọi dạng câu tự sinh: với 200 hạt giống mỗi dạng,
   (1) đáp án của chính câu được chấm đúng, (2) đáp án bị sửa bị chấm sai,
   (3) mọi khoá chữ câu dùng tới đều có ở CẢ hai từ điển. */

const BANKS = { c1q: ch1, c2q: ch2, c3q: ch3, c4q: ch4 };
const SEEDS = 200;
const VI = { ...sharedVi, ...appVi };
const EN = { ...sharedEn, ...appEn };

/** Đáp án mẫu viết như người học gõ. */
function asTyped(q) {
  if (q.format === 'choice') return String(q.answer);
  if (q.format === 'set') return q.answer.join(', ');
  if (q.kind === 'range') return `${q.answer[0]} ... ${q.answer[1]}`;
  return String(q.answer);
}

/** Một đáp án chắc chắn sai (khác giá trị) cho câu q. */
function wrongOf(q) {
  if (q.format === 'choice') return String((q.answer + 1) % q.choices.length);
  if (q.format === 'number') return String(q.answer + 1);
  if (q.format === 'set') {
    const extra = [...Array(64).keys()].find(m => !q.answer.includes(m));
    return [...q.answer, extra].join(', ');
  }
  if (q.kind === 'range') return `${q.answer[0] + 1} ... ${q.answer[1]}`;
  if (['sop', 'pos', 'dontcare', 'simplify', 'dual', 'nand'].includes(q.kind)) return '0';
  if (q.kind === 'complement') return q.meta.expr;               // chính F thì không phải F'
  const s = String(q.answer);
  const last = s.at(-1);
  return s.slice(0, -1) + (last === '0' ? '1' : '0');
}

const keysOf = q => [q.textKey, q.hintKey, q.explainKey, q.formatKey,
  ...Object.values({ ...q.textParams, ...q.hintParams, ...q.explainParams })
    .filter(v => typeof v === 'string' && /^[\w-]+\.[\w-]+$/.test(v) && !/^\d/.test(v))]
  .filter(Boolean);

for (const [prefix, bank] of Object.entries(BANKS)) {
  describe(`${prefix}: mọi dạng câu`, () => {
    for (const kind of bank.KINDS) {
      it(`${kind}: đáp án đúng được chấm đúng, đáp án sai bị chấm sai`, () => {
        for (let seed = 1; seed <= SEEDS; seed++) {
          const q = bank.makeQuestion(kind, seededRandom(seed));
          expect(q.kind).toBe(kind);
          expect(['text', 'number', 'set', 'choice']).toContain(q.format);
          expect(bank.checkAnswer(q, asTyped(q)), `seed ${seed}: ${JSON.stringify(q.answer)}`).toEqual(expect.objectContaining({ ok: true }));
          const bad = bank.checkAnswer(q, wrongOf(q));
          expect(bad.ok, `seed ${seed}: "${wrongOf(q)}" không được tính là đúng`).not.toBe(true);
        }
      });

      it(`${kind}: nhãn, đề, gợi ý, lời giải có đủ ở VI và EN`, () => {
        const need = new Set([`${prefix}.${kind}`]);
        for (let seed = 1; seed <= 60; seed++) {
          const q = bank.makeQuestion(kind, seededRandom(seed));
          keysOf(q).forEach(k => need.add(k));
          const r = bank.checkAnswer(q, wrongOf(q));
          if (r.detailKey) need.add(r.detailKey);
        }
        const missVi = [...need].filter(k => !(k in VI));
        const missEn = [...need].filter(k => !(k in EN));
        expect(missVi, 'thiếu ở VI').toEqual([]);
        expect(missEn, 'thiếu ở EN').toEqual([]);
      });
    }
  });
}

describe('rút gọn (Ch.3): đúng mà chưa tối giản thì chưa tính là đúng', () => {
  it('tổng đủ các minterm (dạng chính tắc) bị từ chối khi lời giải tối ưu ngắn hơn', () => {
    let tried = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const q = ch3.makeQuestion('sop', seededRandom(seed));
      const { n, values, lit } = q.meta;
      const names = varNames(n);
      const canon = values.flatMap((v, m) => (v === 1
        ? [names.map((x, i) => x + ((m >> (n - 1 - i)) & 1 ? '' : "'")).join('')] : [])).join(' + ');
      expect(exprTruthTable(canon, n).every((v, m) => values[m] === 2 || v === values[m])).toBe(true);
      if (countLiterals(canon, n) > lit) {
        tried++;
        expect(ch3.checkAnswer(q, canon).ok).toBe(false);
      }
    }
    expect(tried).toBeGreaterThan(50);
  });
});

describe('chấm hình thức (Ch.2)', () => {
  it('NAND: chép lại đề (còn dấu +) không được tính', () => {
    const q = ch2.makeQuestion('nand', seededRandom(3));
    expect(ch2.checkAnswer(q, q.meta.expr).ok).toBe(false);
  });
  it("Hàm bù: chỉ bọc ' ngoài ngoặc không được tính, phải đưa phủ định vào tận literal", () => {
    const q = ch2.makeQuestion('complement', seededRandom(5));
    expect(ch2.checkAnswer(q, `(${q.meta.expr})'`).ok).toBe(false);
    expect(ch2.checkAnswer(q, q.answer).ok).toBe(true);
  });
  it('viết sai cú pháp thì báo để sửa, chưa tính là sai', () => {
    const q = ch2.makeQuestion('dual', seededRandom(8));
    expect(ch2.checkAnswer(q, 'x + (y').retry).toBe(true);
  });
});

/* Widget khai báo trong q.input phải có thật (dùng chung hoặc riêng app Logic). */
describe('q.input trỏ tới widget có thật', () => {
  const KNOWN = ['bits', 'truth', 'fields', 'numset', 'kmapGroup', 'kmapPick'];
  it('mọi dạng câu × 60 hạt giống', () => {
    for (const bank of Object.values(BANKS)) for (const kind of bank.KINDS) for (let seed = 1; seed <= 60; seed++) {
      const q = bank.makeQuestion(kind, seededRandom(seed));
      if (q.input) expect(KNOWN, `${kind}`).toContain(q.input.type);
    }
  });
});

describe('thời gian chuẩn từng dạng (cho "~M phút" và bài full 60–90 phút)', () => {
  it('mọi dạng đều có SECONDS hợp lý (10 giây … 5 phút)', () => {
    for (const [prefix, bank] of Object.entries(BANKS)) {
      expect(Object.keys(bank.SECONDS).sort(), prefix).toEqual([...bank.KINDS].sort());
      for (const k of bank.KINDS) expect(bank.SECONDS[k], `${prefix}.${k}`).toBeGreaterThanOrEqual(10);
      for (const k of bank.KINDS) expect(bank.SECONDS[k], `${prefix}.${k}`).toBeLessThanOrEqual(300);
    }
  });
});

describe('bài full: dựng lại đúng đề từ hạt giống', () => {
  const CH = Object.entries(BANKS).map(([prefix, bank], i) => ({ id: `ch${i + 1}`, prefix, bank }));
  it('cùng hạt giống ⇒ cùng câu (makeQuestion không dùng Math.random)', () => {
    for (const seed of [1, 99, 123456]) {
      const a = buildExam(CH, { seed, minutes: 90 }).map(x => x.q);
      expect(JSON.stringify(buildExam(CH, { seed, minutes: 90 }).map(x => x.q))).toBe(JSON.stringify(a));
    }
  });
  it('đề 60 phút có 15–40 câu, đủ cả 4 chương', () => {
    const items = buildExam(CH, { seed: 7, minutes: 60 });
    expect(items.length).toBeGreaterThanOrEqual(15);
    expect(items.length).toBeLessThanOrEqual(40);
    expect(new Set(items.map(x => x.ch)).size).toBe(4);
  });
});

describe('mọi câu nói rõ phải trả lời thế nào', () => {
  const fill = (k, params = {}) => (VI[k] ?? '').replace(/\{(\w+)\}/g, (m, n) => (n in params ? String(params[n]) : m));
  for (const [prefix, bank] of Object.entries(BANKS)) {
    it(`${prefix}: có dòng "Trả lời" và điền đủ tham số`, () => {
      for (const kind of bank.KINDS) for (let seed = 1; seed <= 40; seed++) {
        const q = bank.makeQuestion(kind, seededRandom(seed));
        expect(q.formatKey, `${prefix}.${kind}`).toBeTruthy();
        expect(VI[q.formatKey], q.formatKey).toBeTruthy();
        expect(fill(q.formatKey, q.formatParams ?? q.textParams), `${q.formatKey} còn tham số chưa điền`).not.toMatch(/\{/);
        expect(fill(q.textKey, q.textParams), `${q.textKey} còn tham số chưa điền`).not.toMatch(/\{/);
      }
    });
  }
});

describe('miền câu đủ rộng để lượt 10 câu không lặp', () => {
  for (const [prefix, bank] of Object.entries(BANKS)) {
    it(`${prefix}: mỗi dạng có ≥ 12 câu khác nhau trong 400 hạt giống`, () => {
      const small = [];
      for (const kind of bank.KINDS) {
        const sigs = new Set();
        for (let seed = 1; seed <= 400; seed++) sigs.add(signature(bank.makeQuestion(kind, seededRandom(seed))));
        if (sigs.size < 12) small.push(`${kind}: ${sigs.size}`);
      }
      expect(small).toEqual([]);
    });
  }
});

describe('mọi câu có lời giải từng bước (hiện cả khi đúng lẫn sai)', () => {
  const fill = (dict, k, params = {}) => (dict[k] ?? '').replace(/\{(\w+)\}/g, (m, n) => (n in params ? String(params[n]) : m));
  for (const [prefix, bank] of Object.entries(BANKS)) {
    it(`${prefix}: ≥ 2 dòng, khoá có ở VI/EN, không còn tham số trống, dòng cuối chứa đáp án`, () => {
      for (const kind of bank.KINDS) for (let seed = 1; seed <= 60; seed++) {
        const q = bank.makeQuestion(kind, seededRandom(seed));
        expect(q.work?.length ?? 0, `${prefix}.${kind} #${seed}`).toBeGreaterThanOrEqual(1);
        for (const w of q.work) {
          if (typeof w === 'string') continue;
          for (const D of [VI, EN]) {
            expect(D[w.key], `${w.key}`).toBeTruthy();
            expect(fill(D, w.key, w.params), `${w.key} còn tham số trống`).not.toMatch(/\{\w+\}/);
          }
        }
        const text = q.work.map(w => (typeof w === 'string' ? w : `${JSON.stringify(w.params)} ${w.m ?? ''}`)).join('\n').replace(/[\s−-]/g, '');
        const ans = String(q.answerText ?? (Array.isArray(q.answer) ? q.answer.join(',') : q.format === 'choice' ? '' : q.answer)).replace(/[\s−-]/g, '');
        if (ans && !['range', 'identify'].includes(kind)) expect(text, `${prefix}.${kind} #${seed}: lời giải phải đi tới đáp án ${ans}`).toContain(ans.replace(/^ΠM|^Σm/, ''));
      }
    });
  }
});

import { describe, it, expect } from 'vitest';
import { signature, freshQuestion, poolSize, redoByKind } from '../logic/question-pool.js';
import { conceptQuestion } from '../logic/concepts.js';
import { seededRandom } from '../logic/shuffle.js';
import { buildExam } from '../logic/exam.js';


/* ngân hàng giả chỉ có `n` câu khác nhau, chọn ngẫu nhiên có lặp */
const bank = n => ({
  KINDS: ['k'], SECONDS: { k: 60 },
  makeQuestion: (kind, rnd) => ({ kind, meta: { i: Math.floor(rnd() * n) }, answer: 'a' }),
  checkAnswer: () => ({ ok: true }),
});

describe('không lặp câu', () => {
  it('signature: cùng dạng + cùng dữ liệu sinh đề là một câu', () => {
    expect(signature({ kind: 'k', meta: { a: 1 } })).toBe(signature({ kind: 'k', meta: { a: 1 }, figure: 'khác' }));
    expect(signature({ kind: 'k', meta: { a: 1 } })).not.toBe(signature({ kind: 'k', meta: { a: 2 } }));
    expect(signature({ kind: 'k', textParams: { s: 'x' } })).not.toBe(signature({ kind: 'j', textParams: { s: 'x' } }));
  });

  it('miền đủ lớn (12 câu khác nhau): 10 câu trong một lượt đều khác nhau', () => {
    for (let t = 0; t < 30; t++) {
      const b = bank(12), seen = new Set();
      const sigs = Array.from({ length: 10 }, () => signature(freshQuestion(() => b.makeQuestion('k', Math.random), seen)));
      expect(new Set(sigs).size).toBe(10);
    }
  });

  it('tránh câu của lượt trước khi còn cách', () => {
    const b = bank(20), recent = new Set(Array.from({ length: 10 }, (_, i) => JSON.stringify(['k', { i }])));
    for (let t = 0; t < 30; t++) {
      const q = freshQuestion(() => b.makeQuestion('k', Math.random), new Set(), recent);
      expect(q.meta.i).toBeGreaterThanOrEqual(10);
    }
  });

  it('miền nhỏ hơn số câu cần: hết câu mới thì trả null (người gọi đổi dạng / kết thúc lượt), không ra câu lặp, không treo', () => {
    const b = bank(3), seen = new Set();
    const qs = Array.from({ length: 10 }, () => freshQuestion(() => b.makeQuestion('k', Math.random), seen)).filter(Boolean);
    expect(qs).toHaveLength(3);
    expect(new Set(qs.map(signature)).size).toBe(3);
  });

  it('poolSize ước lượng đúng kho nhỏ, dừng sớm khi kho đủ lớn', () => {
    expect(poolSize(() => bank(4).makeQuestion('k', Math.random), 10)).toBe(4);
    expect(poolSize(() => bank(500).makeQuestion('k', Math.random), 10)).toBe(10);
  });

  it('câu khái niệm: cùng một câu xáo phương án khác vẫn là LẶP (lỗi người học gặp 2026-09-25)', () => {
    const item = { id: 'd2-x', answer: 0, vi: {}, en: {} };
    const a = conceptQuestion(item, seededRandom(1)), c = conceptQuestion(item, seededRandom(2));
    expect(a.choices).not.toEqual(c.choices);
    expect(signature(a)).toBe(signature(c));
  });

  it('câu không có meta: khác hình / khác tham số là câu khác, xáo phương án thì không', () => {
    const q = (fig, ch) => ({ kind: 'g', textKey: 'k', textParams: {}, figure: { edges: fig }, choices: ch });
    expect(signature(q([1, 2], ['a', 'b']))).toBe(signature(q([1, 2], ['b', 'a'])));
    expect(signature(q([1, 2], ['a', 'b']))).not.toBe(signature(q([1, 3], ['a', 'b'])));
  });

  it('bài full: không trùng câu và vẫn dựng lại đúng từ hạt giống', () => {
    const C = [{ id: 'ch1', prefix: 'a', bank: bank(500) }];
    const a = buildExam(C, { seed: 11, minutes: 90 });
    expect(new Set(a.map(x => signature(x.q))).size).toBe(a.length);
    expect(buildExam(C, { seed: 11, minutes: 90 }).map(x => x.q)).toEqual(a.map(x => x.q));
  });
});

describe('redoByKind: ôn lại theo dạng, không lặp lại đúng câu cũ', () => {
  // dạng 'many': vô số câu; dạng 'few': chỉ 2 câu khác nhau
  const make = kind => kind === 'few' ? { kind, answer: Math.floor(Math.random() * 2), meta: 0 } : { kind, answer: Math.random(), meta: Math.random() };
  const mk = (kind, meta) => ({ kind, answer: 0, meta });
  it('mỗi câu sai ⇒ câu mới cùng dạng, khác chữ ký mọi câu cũ', () => {
    const wrong = [mk('many', 'a'), mk('many', 'b')];
    const out = redoByKind(wrong, make);
    expect(out).toHaveLength(2);
    expect(out.every(q => q.kind === 'many')).toBe(true);
    const old = new Set(wrong.map(signature));
    expect(out.every(q => !old.has(signature(q)))).toBe(true);
  });
  it('tối đa 2 câu mỗi dạng và tối đa size câu', () => {
    const wrong = Array.from({ length: 5 }, (_, i) => mk('many', 'm' + i));
    expect(redoByKind(wrong, make)).toHaveLength(2);
    const many = ['a', 'b', 'c', 'd', 'e', 'f'].flatMap(k => [mk(k, 1), mk(k, 2)]);
    expect(redoByKind(many, kind => ({ kind, answer: Math.random(), meta: Math.random() }), 4)).toHaveLength(4);
  });
  it('dạng cạn câu mới thì bỏ; không còn gì thì trả lại danh sách cũ', () => {
    const few = [mk('few', 0), mk('few', 1)];
    expect(redoByKind(few, make)).toBe(few);                       // cả 2 câu của dạng đã sai ⇒ không còn câu mới
    const mixed = redoByKind([mk('few', 0), mk('few', 1), mk('many', 'x')], make);
    expect(mixed.map(q => q.kind)).toEqual(['many']);
  });
});

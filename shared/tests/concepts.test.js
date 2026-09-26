import { describe, it, expect } from 'vitest';
import { validateItem, isDuplicate, escapeText, conceptDicts, conceptQuestion, withConcepts, KIND } from '../logic/concepts.js';
import { seededRandom } from '../logic/shuffle.js';

const lang = (q, extra = {}) => ({ q, options: ['a one', 'b two', 'c three', 'd four'], why: ['w1', 'w2', 'w3', 'w4'], explain: 'e', ...extra });
const good = (over = {}) => ({ id: 'l1-t1', chapter: 'ch1', section: '1.3', type: 'why', answer: 2,
  vi: lang('Vì sao đọc từ dưới lên?'), en: lang('Why read bottom up?'), ...over });
const sections = { ch1: ['1.3'] };

describe('kiểm một câu khái niệm', () => {
  it('câu đúng chuẩn không có lỗi', () => {
    expect(validateItem(good(), { sections })).toEqual([]);
  });

  it('bắt các lỗi hay gặp của LLM', () => {
    const errs = it => validateItem(it, { sections }).join(' | ');
    expect(errs(good({ answer: 4 }))).toMatch('answer');
    expect(errs(good({ section: '9.9' }))).toMatch('mục lạ');
    expect(errs(good({ type: 'essay' }))).toMatch('loại lạ');
    expect(errs(good({ en: lang('Why?', { options: ['a', 'b', 'c'] }) }))).toMatch('4 phương án');
    expect(errs(good({ en: lang('Why?', { options: ['same', 'Same', 'c', 'd'] }) }))).toMatch('trùng');
    expect(errs(good({ en: lang('Why?', { options: ['a', 'b', 'c', 'All of the above'] }) }))).toMatch('tất cả');
    expect(errs(good({ en: lang('Why?', { options: ['a', 'b', 'c because of a long reason here', 'd'] }) }))).toMatch('dài hơn hẳn');
    expect(errs(good({ en: lang('Vì sao?') }))).toMatch('dấu tiếng Việt');
    expect(errs(good({ vi: lang('Tập {1, 2}?') }))).toMatch('{ } < >');
    expect(errs(good({ vi: lang(Array(80).fill('chữ').join(' ')) }))).toMatch('dài');
    expect(errs(good({ en: undefined }))).toMatch('thiếu bản en');
  });

  it('câu có check: bộ kiểm của môn quyết định; môn chưa có bộ kiểm ⇒ loại', () => {
    const it = good({ check: { type: 'x' } });
    expect(validateItem(it, { sections, verify: () => ({ ok: true }) })).toEqual([]);
    expect(validateItem(it, { sections, verify: () => ({ ok: false, reason: 'sai' }) }).join()).toMatch('check sai: sai');
    expect(validateItem(it, { sections }).join()).toMatch('chưa có bộ kiểm');
  });

  it('isDuplicate: cùng ý (đề gần giống) là trùng, khác ý thì không', () => {
    const a = good({ en: lang('Why are the remainders read from the bottom up when converting?') });
    const b = good({ id: 'l1-t2', en: lang('Why are remainders read from the bottom up when converting?') });
    const c = good({ id: 'l1-t3', en: lang('What does an end carry mean in complement subtraction?') });
    expect(isDuplicate(b, [a])).toBe(true);
    expect(isDuplicate(c, [a])).toBe(false);
    expect(isDuplicate(a, [a])).toBe(false);                   // chính nó
  });
});

describe('câu khái niệm trong app', () => {
  it('escapeText thoát HTML, `x` thành mono', () => {
    expect(escapeText('a <b> & `1011`')).toBe('a &lt;b&gt; &amp; <span class="mono">1011</span>');
    expect(escapeText("x'y + (x + z)' but don't touch 2's")).toBe("x′y + (x + z)′ but don't touch 2's");
  });

  it('từ điển VI/EN cùng tập khoá, khoá có đúng một dấu chấm', () => {
    const d = conceptDicts([good()]);
    expect(Object.keys(d.vi).sort()).toEqual(Object.keys(d.en).sort());
    expect(Object.keys(d.vi)).toHaveLength(2 + 4 * 2);
    for (const k of Object.keys(d.vi)) expect(k.split('.')).toHaveLength(2);
  });

  it('xáo phương án mà đáp án vẫn trỏ đúng; lời giải nêu vì sao 3 phương án kia sai', () => {
    for (let s = 0; s < 30; s++) {
      const q = conceptQuestion(good(), seededRandom(s));
      expect(q.choices[q.answer]).toBe('cq.l1_t1_a2');
      expect(q.work).toHaveLength(3);
      expect(q.work.every(w => w.key === 'cq.whyWrong')).toBe(true);
    }
  });

  it('withConcepts chỉ thêm dạng khi chương có câu', () => {
    const bank = { KINDS: ['a'], SECONDS: { a: 30 }, makeQuestion: k => ({ kind: k }), checkAnswer: () => ({ ok: true }) };
    expect(withConcepts(bank, [])).toBe(bank);
    const w = withConcepts(bank, [good()]);
    expect(w.KINDS).toEqual(['a', KIND]);
    const q = w.makeQuestion(KIND, seededRandom(3));
    const wrong = (q.answer + 1) % 4;
    expect(w.checkAnswer(q, String(wrong))).toEqual({ ok: false, detailKey: q.whyKeys[wrong] });
    expect(w.checkAnswer({ kind: 'a' }, 'x').ok).toBe(true);
  });
});

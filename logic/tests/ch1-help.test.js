import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import { toDecimal } from '../src/logic/number-systems.js';
import * as ch1 from '../src/logic/ch1-quiz.js';
import { encode, FORMATS } from '../src/logic/signed-binary.js';
import { clean } from '../src/logic/ch1-help.js';

const make = (kind, seed) => ch1.makeQuestion(kind, seededRandom(seed));
const each = (kind, fn, n = 60) => { for (let s = 1; s <= n; s++) fn(make(kind, s), s); };
const flip = s => s.slice(0, -1) + (s.at(-1) === '0' ? '1' : '0');

describe('chỉ ra đáp án sai ở đâu', () => {
  it('đáp án đúng thì không có chẩn đoán; đáp án sai luôn có', () => {
    for (const kind of ch1.KINDS) each(kind, (q, s) => {
      const bad = ch1.checkAnswer(q, kind === 'range' ? `${q.answer[0] + 1} ${q.answer[1]}` : kind === 'decode' ? String(q.answer + 1) : flip(String(q.answer)));
      expect(bad.ok, `${kind} #${s}`).toBe(false);
    });
  });

  it('đổi cơ số: ghi ở cơ số khác / chữ số không hợp lệ / lệch một chữ số', () => {
    let wrongBase = 0;
    each('convert', q => {
      const { src, from, to } = q.meta;
      const v = toDecimal(src, from);
      if (to !== 10 && from === 10) {                            // ghi lại số thập phân thay vì cơ số đích
        const r = ch1.checkAnswer(q, String(v));
        if (String(v) !== q.answer) { expect(r.detailKey).toBe('c1q.dWrongBase'); wrongBase++; }
      }
      const one = flip(q.answer);
      const r = ch1.checkAnswer(q, one);
      if (to <= 10 || /^[0-9]+$/.test(one)) expect(['c1q.dPos', 'c1q.dStep', 'c1q.dWrongBase', 'c1q.dValue']).toContain(r.detailKey);
    }, 120);
    expect(wrongBase).toBeGreaterThan(3);
  });

  it('bù r quên +1, bù r−1 cộng thừa 1', () => {
    each('complement', q => {
      const r = ch1.checkAnswer(q, q.explainParams.dim);
      if (q.explainParams.dim !== q.answer) expect(r.detailKey).toBe('c1q.dNoPlus1');
    });
    each('dimcomplement', q => {
      const bad = ch1.checkAnswer(q, q.meta.r === 2 ? (parseInt(q.answer, 2) + 1).toString(2).padStart(q.answer.length, '0') : q.answer);
      if (!bad.ok) expect(bad.detailKey).toBeDefined();
    });
  });

  it('viết số có dấu: dãy đúng của dạng khác được gọi tên dạng đó', () => {
    let named = 0;
    each('signed', q => {
      for (const f of FORMATS.filter(x => x !== q.meta.format)) {
        let other;
        try { other = encode(q.meta.value, f, q.meta.w); } catch { continue; }
        if (other === q.answer) continue;
        expect(ch1.checkAnswer(q, other).detailKey).toBe('c1q.dOtherFmt');
        named++;
      }
    }, 100);
    expect(named).toBeGreaterThan(20);
  });

  it('parity: gắn nhầm chẵn/lẻ; gray: đổi ngược chiều; trừ: sai dấu; đọc số: sai dấu', () => {
    each('parity', q => expect(ch1.checkAnswer(q, flip(q.answer)).detailKey).toBe('c1q.dParityFlip'));
    each('subtract', q => {
      const neg = q.answer.startsWith('-');
      const r = ch1.checkAnswer(q, neg ? q.answer.slice(1) : '-' + q.answer);
      expect(r.detailKey).toBe('c1q.dSign');
    });
    each('decode', q => expect(ch1.checkAnswer(q, String(-q.answer)).ok).toBe(false));
    each('bcd', q => expect(ch1.checkAnswer(q, flip(q.answer.replace(/\s/g, ''))).detailKey).toBe('c1q.dBcdDigit'));
  });

  it('không in lại ký tự lạ của người học (chống chèn HTML)', () => {
    expect(clean('<b>1F</b>')).toBe('B1FB');   // chỉ còn chữ số hex, không còn < >
    each('convert', q => {
      const r = ch1.checkAnswer(q, '<img src=x onerror=alert(1)>');
      expect(JSON.stringify(r.detailParams ?? {})).not.toMatch(/[<>]/);
    });
  });
});

describe('các bước tính (work) khớp đáp án', () => {
  it('đổi cơ số: đọc số dư từ dưới lên ra đúng đáp án', () => {
    each('convert', q => {
      expect(q.work.length).toBeGreaterThan(0);
      if (q.meta.from === 10 && q.meta.to !== 10) {   // đi qua thập phân: có các dòng chia liên tiếp
        const digits = q.work.filter(l => /×\d+ \+ /.test(l) && /^\d+ = \d+×/.test(l)).map(l => {
          const [, rem, letter] = l.match(/\+ (\d+)(?:\s+\((\w)\))?$/);
          return letter ?? rem;
        });
        expect(digits.reverse().join('')).toBe(q.answer);
      }
    }, 100);
  });
});

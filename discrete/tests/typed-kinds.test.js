import { describe, it, expect } from 'vitest';
import { parseQ, formatQ, negate, negationsOnAtoms } from '../src/logic/quant.js';
import * as ch2 from '../src/logic/ch2-quiz.js';
import * as ch4 from '../src/logic/ch4-quiz.js';
import { seededRandom } from '@shared/logic/shuffle.js';

/* Dạng tự luận mới (D57): tự viết phủ định lượng từ · tự tìm công thức đóng của tổng. Cả hai chấm bằng máy, chấp nhận nhiều cách gõ. */

describe('đọc công thức lượng từ', () => {
  it('ký hiệu và ASCII cho cùng một cây', () => {
    const a = parseQ('∀x ∃y (P(x, y) → (Q(y, z) ∧ R(x, z)))');
    for (const s of ['forall x exists y [P(x,y) -> (Q(y,z) & R(x,z))]', 'Ax'.replace('A', '∀') + ' ∃y (P(x,y) → Q(y,z) ∧ R(x,z))']) expect(formatQ(parseQ(s))).toBe(formatQ(a));
  });
  it('in rồi đọc lại ra đúng cây (mọi mẫu của đề)', () => {
    for (let seed = 0; seed < 100; seed++) {
      const q = ch2.makeQuestion('negateW', seededRandom(seed));
      const f = parseQ(q.textParams.f);
      expect(formatQ(parseQ(formatQ(f)))).toBe(formatQ(f));
      expect(negationsOnAtoms(negate(f))).toBe(true);
    }
  });
  it('lỗi cú pháp ném lỗi', () => {
    for (const s of ['', '∀ P(x)', 'P(x', '∀x (P(x) →)', 'p(x)', '∀x ∃']) expect(() => parseQ(s), s).toThrow();
  });
});

describe('negateW: tự viết phủ định', () => {
  const q = { kind: 'negateW', answer: '∃x ∀y ∃z (P(x, y) ∧ (¬Q(y, z) ∨ ¬R(x, z)))' };
  it('nhận cách viết khác nhau của cùng đáp án', () => {
    for (const g of [q.answer, 'exists x forall y exists z [P(x,y) & (!Q(y,z) | !R(x,z))]', '∃x ∀y ∃z ((¬Q(y,z) ∨ ¬R(x,z)) ∧ P(x,y))']) {
      expect(ch2.checkAnswer(q, g).ok, g).toBe(true);
    }
  });
  it('lỗi hay gặp bị bắt: quên đổi lượng từ, ¬(A→B) viết thành A→¬B, chưa đẩy ¬ vào trong, không đọc được', () => {
    expect(ch2.checkAnswer(q, '∀x ∃y ∀z (P(x, y) ∧ (¬Q(y, z) ∨ ¬R(x, z)))').ok).toBe(false);
    expect(ch2.checkAnswer(q, '∃x ∀y ∃z (P(x, y) → (¬Q(y, z) ∨ ¬R(x, z)))').ok).toBe(false);
    const lazy = ch2.checkAnswer(q, '¬∀x ∃y ∀z (P(x, y) → (Q(y, z) ∧ R(x, z)))');
    expect(lazy.ok).toBe(false);
    expect(lazy.detailKey).toBe('c2q.dNotInside');
    expect(ch2.checkAnswer(q, '∃x ∀y (').retry).toBe(true);
  });
});

describe('closed: tự tìm công thức đóng', () => {
  const q = ch4.makeQuestion('closed', seededRandom(0));
  const sums = Array.from({ length: 60 }, (_, s) => ch4.makeQuestion('closed', seededRandom(s)));
  it('đáp án chuẩn của mọi tổng qua; nhận ⁿ · − và dạng ASCII', () => {
    for (const x of sums) expect(ch4.checkAnswer(x, x.answer).ok, x.answer).toBe(true);
    const s = sums.find(x => x.meta.s === '1 + 2 + … + n');
    for (const g of ['n(n+1)/2', 'n*(n+1)/2', '(n^2+n)/2', '0.5n^2 + 0.5n', 'n(n + 1)/2']) expect(ch4.checkAnswer(s, g).ok, g).toBe(true);
    const t = sums.find(x => x.meta.s.startsWith('1·2⁰'));
    for (const g of ['(n-1)*2^n+1', '(n − 1)2ⁿ + 1', 'n*2^n - 2^n + 1']) expect(ch4.checkAnswer(t, g).ok, g).toBe(true);
  });
  it('công thức khớp vài n đầu rồi lệch bị bắt, chỉ ra n đầu tiên lệch', () => {
    const s = sums.find(x => x.meta.s === '1 + 2 + … + n');
    const r = ch4.checkAnswer(s, 'n^2 + n - 1');          // n = 1 ra 1 (đúng), n = 2 ra 5 (tổng thật 3)
    expect(r.ok).toBe(false);
    expect(r.detailParams.n).toBe(2);
    expect(ch4.checkAnswer(s, 'n(n+1)').ok).toBe(false);
  });
  it('không đọc được biểu thức ⇒ thử lại, không tính sai', () => {
    expect(ch4.checkAnswer(q, 'abc + ').retry).toBe(true);
    expect(ch4.checkAnswer(q, 'k(k+1)/2').retry).toBe(true);        // biến lạ k
  });
});

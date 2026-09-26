import { describe, it, expect } from 'vitest';
import { all, ex, atom, not, and, imp, evalQ, negate, formatQ, sameOnSamples } from '../src/logic/quant.js';
import { seededRandom } from '@shared/logic/shuffle.js';

const P = atom('P', 'x'), Q = atom('Q', 'x'), R = atom('R', 'x', 'y');
const lt = { domain: [1, 2, 3], preds: { R: (x, y) => x < y, P: x => x > 1, Q: x => x % 2 === 1 } };

describe('lượng từ', () => {
  it('tính đúng/sai bằng vét cạn — thứ tự lượng từ quan trọng', () => {
    expect(evalQ(all('x', ex('y', R)), lt)).toBe(false);                       // x = 3 không có y > 3
    expect(evalQ(ex('x', all('y', imp(not(atom('R', 'y', 'x')), atom('R', 'y', 'x')))), { ...lt })).toBe(false);
    const neq = { domain: [1, 2], preds: { R: (x, y) => x !== y } };
    expect(evalQ(all('x', ex('y', R)), neq)).toBe(true);
    expect(evalQ(ex('y', all('x', R)), neq)).toBe(false);
  });

  it('phủ định đẩy vào trong và in như sách', () => {
    expect(formatQ(negate(all('x', imp(P, Q))))).toBe('∃x (P(x) ∧ ¬Q(x))');
    expect(formatQ(negate(all('x', ex('y', R))))).toBe('∃x ∀y ¬R(x, y)');
    expect(formatQ(negate(ex('x', and(P, Q))))).toBe('∀x (¬P(x) ∨ ¬Q(x))');
    expect(formatQ(all('x', imp(P, ex('y', R))))).toBe('∀x (P(x) → ∃y R(x, y))');
  });

  it('phủ định đúng về nghĩa (so trên nhiều diễn giải), bản sai thì lộ', () => {
    const rnd = seededRandom(1);
    for (const f of [all('x', imp(P, Q)), all('x', ex('y', R)), ex('x', and(P, all('y', R)))]) {
      expect(sameOnSamples(negate(f), not(f), rnd, { P: 1, Q: 1, R: 1 })).toBe(true);
      expect(sameOnSamples(negate(f), f, rnd, { P: 1, Q: 1, R: 1 })).toBe(false);
    }
    expect(sameOnSamples(ex('x', imp(P, not(Q))), not(all('x', imp(P, Q))), rnd)).toBe(false);   // lỗi hay gặp
  });
});

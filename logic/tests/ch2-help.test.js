import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch2 from '../src/logic/ch2-quiz.js';
import * as ch3 from '../src/logic/ch3-quiz.js';

const make = (bank, kind, seed) => bank.makeQuestion(kind, seededRandom(seed));

describe('Ch2: chỉ ra chỗ sai', () => {
  it('cột F: chỉ đúng dòng đầu tiên lệch', () => {
    for (let s = 1; s <= 40; s++) {
      const q = make(ch2, 'column', s);
      const m = s % q.answer.length;
      const bad = q.answer.slice(0, m) + (q.answer[m] === '1' ? '0' : '1') + q.answer.slice(m + 1);
      const r = ch2.checkAnswer(q, bad);
      expect(r.ok).toBe(false);
      expect(r.detailKey).toBe('c2q.dRow');
      expect(r.detailParams).toMatchObject({ m, want: q.answer[m], got: bad[m] });
      expect(r.ctx).toBeUndefined();
    }
  });

  it('minterm ↔ maxterm bị nhầm loại thì được gọi tên', () => {
    for (let s = 1; s <= 40; s++) {
      const q = make(ch2, 'minterms', s);
      const flipped = [...Array(1 << q.meta.n).keys()].filter(m => !q.answer.includes(m));
      if (!flipped.length) continue;
      expect(ch2.checkAnswer(q, flipped.join(', ')).detailKey).toBe('c2q.dSwapMin');
    }
    const q = make(ch2, 'maxterms', 3);
    const flipped = [...Array(1 << q.meta.n).keys()].filter(m => !q.answer.includes(m));
    expect(ch2.checkAnswer(q, flipped.join(', ')).detailKey).toBe('c2q.dSwapMax');
  });

  it('thiếu / thừa minterm', () => {
    const q = make(ch2, 'minterms', 5);
    expect(ch2.checkAnswer(q, q.answer.slice(1).join(', ')).detailKey).toBe('run.dMissing');
    const extra = [...Array(1 << q.meta.n).keys()].find(m => !q.answer.includes(m));
    expect(ch2.checkAnswer(q, [...q.answer, extra].join(', ')).detailKey).toBe('run.dExtra');
  });

  it('nhận diện cổng: nói cổng đã chọn và cột F của nó', () => {
    const q = make(ch2, 'identify', 2);
    const wrong = q.choices.findIndex((_, i) => i !== q.answer);
    const r = ch2.checkAnswer(q, String(wrong));
    expect(r.detailKey).toBe('c2q.dChose');
    expect(r.detailParams.gate).toBe(q.choices[wrong].label);
  });

  it('biểu thức sai: chỉ ra dòng chân trị đầu tiên lệch', () => {
    let hit = 0;
    for (let s = 1; s <= 40; s++) {
      const q = make(ch2, 'dual', s);
      const r = ch2.checkAnswer(q, q.meta.expr);           // chép lại đề, không lấy đối ngẫu
      if (!r.ok) { expect(['c2q.dRow', 'c2q.dRowMore']).toContain(r.detailKey); hit++; }
    }
    expect(hit).toBeGreaterThan(20);
  });
});

describe('Ch3: tập minterm thiếu / thừa', () => {
  it('hàm lẻ: bỏ một minterm ⇒ báo thiếu đúng số đó', () => {
    const q = make(ch3, 'xor', 4);
    const r = ch3.checkAnswer(q, q.answer.slice(1).join(', '));
    expect(r.detailKey).toBe('run.dMissing');
    expect(r.detailParams.missing).toBe(String(q.answer[0]));
  });
});

describe('Ch3 xor: đáp án khớp phép tính trực tiếp', () => {
  it("x ⊕ y′ ⊕ z … (có bù ngoài) — nhiều kiểu dấu khác nhau", () => {
    const seen = new Set();
    for (let s = 1; s <= 400; s++) {
      const q = make(ch3, 'xor', s);
      const { n, comps, neg } = q.meta;
      const list = [...Array(1 << n).keys()].filter(m => {
        const bits = m.toString(2).padStart(n, '0').split('').map(Number);
        const f = bits.reduce((a, b, i) => a ^ b ^ comps[i], 0) ^ (neg ? 1 : 0);
        return f === 1;
      });
      expect(q.answer).toEqual(list);
      seen.add(JSON.stringify(q.meta));
    }
    expect(seen.size).toBeGreaterThan(40);   // miền có 48 kiểu; xác suất lệch nên 400 hạt giống chưa chạm hết
  });
});

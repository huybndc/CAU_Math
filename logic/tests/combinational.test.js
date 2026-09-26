import { describe, it, expect } from 'vitest';
import { rippleAdd, addSub, signedOf, bcdAdd, compare, priorityEncode, muxInputs, muxOutput, evalNet, gateExpr } from '../src/logic/combinational.js';

describe('bộ cộng / trừ (Mano §4.5)', () => {
  it('ví dụ trong sách: 1011 + 0011, carry vào 0110', () => {
    const r = rippleAdd(0b1011, 0b0011);
    expect(r.sum).toBe('1110');
    expect(r.carries).toEqual([0, 1, 1, 0, 0]);
  });
  it('khớp phép cộng số nguyên với mọi cặp 4 bit', () => {
    for (let a = 0; a < 16; a++) for (let b = 0; b < 16; b++) for (const c of [0, 1]) {
      const r = rippleAdd(a, b, c);
      expect(parseInt(r.cout + r.sum, 2)).toBe(a + b + c);
    }
  });
  it('M = 1 cho A − B; V = 1 đúng khi kết quả có dấu ra ngoài −8…7', () => {
    for (let a = 0; a < 16; a++) for (let b = 0; b < 16; b++) for (const m of [0, 1]) {
      const r = addSub(a, b, m);
      const want = m ? signedOf(a) - signedOf(b) : signedOf(a) + signedOf(b);
      expect(r.v, `${a} ${m ? '-' : '+'} ${b}`).toBe(want < -8 || want > 7 ? 1 : 0);
      expect(parseInt(r.sum, 2)).toBe(((m ? a - b : a + b) % 16 + 16) % 16);
    }
    expect(addSub(0b0111, 0b0001, 0)).toMatchObject({ sum: '1000', v: 1 });
  });
});

describe('cộng BCD (§4.6)', () => {
  it('ra đúng chữ số thập phân và carry', () => {
    for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (const c of [0, 1]) {
      const r = bcdAdd(a, b, c);
      expect(r.cout * 10 + parseInt(r.s, 2)).toBe(a + b + c);
    }
    expect(bcdAdd(8, 9)).toMatchObject({ binary: '10001', fix: true, s: '0111', cout: 1 });
    expect(bcdAdd(4, 5)).toMatchObject({ fix: false, s: '1001' });
  });
});

describe('so sánh, mã hoá ưu tiên, MUX, mạch nhiều mức', () => {
  it('so sánh độ lớn', () => {
    expect(compare(0b1010, 0b1001)).toMatchObject({ x: '1100', at: 1, gt: true });
    expect(compare(5, 5)).toMatchObject({ x: '1111', at: -1, gt: false, lt: false });
  });
  it('mã hoá ưu tiên: ngõ cao nhất thắng; không ngõ nào ⇒ V = 0', () => {
    expect(priorityEncode([1, 0, 1, 0])).toMatchObject({ v: 1, x: 1, y: 0 });
    expect(priorityEncode([1, 1, 1, 1])).toMatchObject({ x: 1, y: 1 });
    expect(priorityEncode([0, 0, 0, 0]).v).toBe(0);
  });
  it('MUX: ví dụ sách F = Σm(1, 2, 6, 7) → z, z′, 0, 1; đi hai chiều khớp nhau', () => {
    const tt = [0, 1, 1, 0, 0, 0, 1, 1];
    expect(muxInputs(tt)).toEqual(['z', "z'", '0', '1']);
    for (let f = 0; f < 256; f++) {
      const t = [...f.toString(2).padStart(8, '0')].map(Number);
      expect(muxOutput(muxInputs(t))).toEqual(t);
    }
  });
  it('mạch nhiều mức: T1 = xy′, T2 = T1 ⊕ z', () => {
    const gates = [{ op: 'AND', ins: ['x', "y'"] }, { op: 'XOR', ins: ['T1', 'z'] }];
    const [t1, t2] = evalNet(gates, ['x', 'y', 'z']);
    expect(t1.join('')).toBe('00001100');
    expect(t2.join('')).toBe('01011001');
    expect(gateExpr(gates[0])).toBe('xy′');
    expect(gateExpr(gates[1])).toBe('T₁ ⊕ z');
    expect(gateExpr({ op: 'NOR', ins: ['T1', 'T2'] })).toBe('(T₁ + T₂)′');
  });
});

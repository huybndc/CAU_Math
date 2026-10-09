import { describe, it, expect } from 'vitest';
import { convertBase } from '../src/logic/number-systems.js';

// Bộ tính độc lập: BigInt('0b…'/'0x…') và toString(radix) — không dùng mã của app.
const parse = (s, r) => [...s].reduce((n, ch) => n * BigInt(r) + BigInt(parseInt(ch, 16)), 0n);

describe('convertBase chính xác với số lớn và số âm', () => {
  it('số nguyên lớn hơn 2^53 đổi đúng mọi cặp cơ số', () => {
    const big = 123456789012345678901234567890n;
    for (const from of [2, 8, 10, 16]) for (const to of [2, 3, 7, 10, 16]) {
      const src = big.toString(from).toUpperCase();
      expect(convertBase(src, from, to), `${from}->${to}`).toBe(big.toString(to).toUpperCase());
    }
  });
  it('ngẫu nhiên 2000 ca (gồm số âm) khớp bộ tính độc lập', () => {
    let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let i = 0; i < 2000; i++) {
      const from = 2 + Math.floor(rnd() * 15), to = 2 + Math.floor(rnd() * 15);
      let n = 0n; for (let k = 0; k < 1 + Math.floor(rnd() * 5); k++) n = n * 1000003n + BigInt(Math.floor(rnd() * 1e6));
      const neg = rnd() < 0.3 && n !== 0n;
      const src = (neg ? '-' : '') + n.toString(from).toUpperCase();
      const want = (neg ? '-' : '') + n.toString(to).toUpperCase();
      expect(convertBase(src, from, to), src).toBe(want);
      expect(parse(convertBase(src.replace('-', ''), from, to), to)).toBe(n);
    }
  });
  it('phần lẻ và số 0 vẫn đúng; −0 không có dấu', () => {
    expect(convertBase('0.1', 2, 10)).toBe('0.5');
    expect(convertBase('-0.1', 2, 10)).toBe('-0.5');
    expect(convertBase('-0', 10, 2)).toBe('0');
  });
});

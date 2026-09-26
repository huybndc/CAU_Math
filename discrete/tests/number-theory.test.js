import { describe, it, expect } from 'vitest';
import { mod, euclid, gcd, lcm, pulverize, modInverse, modPow, factorize, isPrime, phi, rsaKeys } from '../src/logic/number-theory.js';

describe('số học', () => {
  it('mod luôn không âm', () => {
    expect(mod(17, 5)).toBe(2);
    expect(mod(-17, 5)).toBe(3);
    expect(mod(0, 7)).toBe(0);
    expect(() => mod(3, 0)).toThrow();
  });

  it('Euclid: từng dòng a = q·b + r, gcd đúng', () => {
    const { gcd: g, steps } = euclid(259, 70);
    expect(g).toBe(7);
    steps.forEach(s => expect(s.a).toBe(s.q * s.b + s.r));
    expect(steps.at(-1).r).toBe(0);
    expect(gcd(0, 5)).toBe(5);
    expect(lcm(4, 6)).toBe(12);
  });

  it('Pulverizer: s·a + t·b = gcd, mọi dòng giữ bất biến r = s·a + t·b (MCS 9.2.2)', () => {
    for (const [a, b] of [[259, 70], [899, 493], [3, 7], [100, 1]]) {
      const p = pulverize(a, b);
      expect(p.s * a + p.t * b).toBe(gcd(a, b));
      p.rows.forEach(r => expect(r.s * a + r.t * b).toBe(r.r));
    }
  });

  it('nghịch đảo mod n', () => {
    expect(modInverse(3, 7)).toBe(5);
    expect(modInverse(-3, 7)).toBe(2);
    expect(modInverse(4, 8)).toBeNull();
    for (let n = 2; n < 40; n++) for (let a = 1; a < n; a++) {
      const inv = modInverse(a, n);
      if (gcd(a, n) === 1) expect(mod(a * inv, n)).toBe(1); else expect(inv).toBeNull();
    }
  });

  it('lũy thừa mod bằng bình phương liên tiếp', () => {
    const r = modPow(3, 13, 7);
    expect(r.value).toBe(3 ** 13 % 7);
    expect(r.bits).toBe('1101');
    expect(r.used).toEqual([0, 2, 3]);
    for (let a = 0; a < 12; a++) for (let k = 0; k < 20; k++) expect(modPow(a, k, 13).value).toBe(Number(BigInt(a) ** BigInt(k) % 13n));
    // n lớn tới mức v·v mất chính xác ⇒ báo lỗi, không trả số sai
    expect(modPow(2, 5, 94906265).value).toBe(32);
    expect(() => modPow(2, 5, 94906267)).toThrow();
    expect(() => modPow(2, 5, 0)).toThrow();
  });

  it('thừa số nguyên tố, φ, số nguyên tố', () => {
    expect(factorize(360)).toEqual([{ p: 2, e: 3 }, { p: 3, e: 2 }, { p: 5, e: 1 }]);
    expect(phi(1)).toBe(1);
    expect(phi(36)).toBe(12);
    expect(phi(13)).toBe(12);
    expect([2, 3, 5, 7, 11].every(isPrime)).toBe(true);
    expect([1, 4, 9, 15].some(isPrime)).toBe(false);
  });

  it('RSA: mã hoá rồi giải mã trả lại bản rõ', () => {
    const k = rsaKeys(11, 13, 7);
    expect(k).toMatchObject({ n: 143, phi: 120 });
    expect(mod(k.e * k.d, k.phi)).toBe(1);
    for (let m = 0; m < k.n; m += 7) expect(modPow(modPow(m, k.e, k.n).value, k.d, k.n).value).toBe(m);
    expect(() => rsaKeys(11, 13, 6)).toThrow();
  });
});

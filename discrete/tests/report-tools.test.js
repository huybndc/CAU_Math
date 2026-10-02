import { describe, it, expect } from 'vitest';
import { truthReport, euclidReport, congruenceReport, diophantineReport, powReport } from '../src/logic/report-tools.js';
import { gcd } from '../src/logic/number-theory.js';

describe('euclidReport', () => {
  it('gcd khớp, check nhận đúng', () => {
    for (const [a, b] of [[259, 70], [12, 18], [17, 5], [1, 1]]) {
      const r = euclidReport(a, b);
      expect(r.check(String(gcd(a, b)))).toBe(true);
      expect(r.check('999')).toBe(false);
    }
  });
});

describe('congruenceReport', () => {
  it('khớp vét cạn: mọi (a, b, n) nhỏ', () => {
    for (let n = 1; n <= 12; n++) for (let a = 0; a < n + 3; a++) for (let b = 0; b < n; b++) {
      const sols = Array.from({ length: n }, (_, x) => x).filter(x => (a * x - b) % n === 0);
      const r = congruenceReport(a, b, n);
      if (!sols.length) { expect(r.answer[0].key).toBe('dr.noSol'); continue; }
      for (let x = -n; x < 2 * n; x++) expect(r.check(String(x)), `${a}x≡${b} (${n}) x=${x}`).toBe(((a * x - b) % n + n) % n === 0);
    }
  });
});

describe('diophantineReport', () => {
  it('khớp vét cạn: nghiệm không âm và check', () => {
    for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) for (let c = 0; c <= 40; c += 3) {
      const r = diophantineReport(a, b, c);
      const brute = [];
      for (let x = 0; x * a <= c; x++) if ((c - a * x) % b === 0) brute.push(`(${x}, ${(c - a * x) / b})`);
      if (!brute.length && r.answer.length === 2) expect(r.answer[1].key, `${a},${b},${c}`).toBe('dr.diNoNonNeg');
      if (r.answer[0].key === 'dr.noSol2') { expect(brute.length).toBe(0); continue; }
      if (brute.length) { const got = r.answer[1].m.split('  '); expect(got).toEqual(brute.slice(0, Math.min(12, brute.length))); }
      const x0 = brute.length ? +brute[0].match(/\d+/g)[0] : 0;
      if (brute.length) expect(r.check(`${x0}, ${(c - a * x0) / b}`)).toBe(true);
      expect(r.check('0, 0')).toBe(c === 0);
    }
  });
});

describe('powReport', () => {
  it('khớp lũy thừa trực tiếp', () => {
    for (const [a, k, n] of [[7, 45, 13], [3, 0, 5], [2, 10, 1000], [-2, 5, 7]]) {
      let v = 1 % n; for (let i = 0; i < k; i++) v = (((v * a) % n) + n) % n;
      expect(powReport(a, k, n).check(String(v))).toBe(true);
    }
  });
});

describe('truthReport', () => {
  it('phân loại và so tương đương', () => {
    expect(truthReport('p -> p').answer[0].key).toBe('c1q.cls.tautology');
    expect(truthReport('p -> q', '~p | q').answer.at(-1).key).toBe('c1q.yesEquiv');
    expect(truthReport('p & q', 'p | q').answer.at(-1).key).toBe('dr.notEquiv');
    expect(() => truthReport('a&b&c&d&e&f&g')).toThrow();
  });
});

describe('từ điển', () => {
  it('vi và en cùng khoá + tham số; mọi khoá máy giải có đủ', async () => {
    const { vi } = await import('../src/i18n/vi/index.js');
    const { en } = await import('../src/i18n/en/index.js');
    const { keysOf } = await import('../../shared/tests/keys-of.js');
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
    const slots = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
    for (const k of Object.keys(vi)) expect(slots(en[k]), k).toEqual(slots(vi[k]));
    const samples = [truthReport('p -> q', '~p | q'), truthReport('p & q', 'p | q'), euclidReport(259, 70), euclidReport(84, 36), congruenceReport(7, 3, 15),
      congruenceReport(6, 4, 10), congruenceReport(6, 3, 10), powReport(7, 45, 13), diophantineReport(7, 5, 53), diophantineReport(6, 9, 20)];
    const need = [...new Set(samples.flatMap(keysOf))];
    expect(need.filter(k => !(k in vi)), 'thiếu ở vi').toEqual([]);
  });
});

describe('setReport', () => {
  it('phép toán tập hợp khớp định nghĩa; bao hàm–loại trừ; U', async () => {
    const { setReport } = await import('../src/logic/report-sets.js');
    const r = setReport('1,2,3,4', '3,4,5');
    expect(r.answer.map(l => l.m)).toEqual(['{1, 2, 3, 4, 5}', '{3, 4}', '{1, 2}', '{1, 2, 5}']);
    const withU = setReport('2,4', '4,6', '1,2,3,4,5,6');
    expect(withU.steps[0].lines.find(l => l.key === 'ds.compA').m).toBe('{1, 3, 5, 6}');
    expect(() => setReport('1,9', '2', '1,2,3')).toThrow();
    expect(setReport('a, b', 'b, c').answer[0].m).toBe('{a, b, c}');
  });
});

import { describe, it, expect } from 'vitest';
import { baseReport, complementReport, signedReport } from '../src/logic/report-number.js';
import { exprReport, autoVars } from '../src/logic/report-expr.js';
import { exprTruthTable } from '../src/logic/expr-parser.js';

describe('baseReport', () => {
  it('khớp parseInt với mọi số nguyên 0…300, mọi cặp cơ số', () => {
    for (const from of [2, 8, 10, 16]) for (let v = 0; v <= 300; v += 7) {
      const s = v.toString(from).toUpperCase();
      const r = baseReport(s, from);
      for (const to of [2, 8, 10, 16].filter(x => x !== from)) expect(r.expect).toContain(v.toString(to).toUpperCase());
    }
  });
  it('phần lẻ + gộp nhóm', () => {
    expect(baseReport('101.1', 2).expect).toContain('5.5');
    expect(baseReport('1011.01', 2).steps.some(s => s.head.key === 'ln.stGroup')).toBe(true);
    expect(baseReport('A.8', 16).expect).toContain('1010.1');
  });
  it('số sai chữ số ⇒ ném lỗi', () => { expect(() => baseReport('12', 2)).toThrow(); });
});

describe('complementReport', () => {
  it('khớp phép trừ thật', () => {
    for (const r of [2, 8, 10, 16]) for (const [m, n] of [[7, 3], [3, 7], [100, 1], [5, 5], [0, 9]]) {
      const M = m.toString(r), N = n.toString(r);
      expect(complementReport(M, N, r).expect[1]).toBe(String(m - n));
    }
  });
});

describe('signedReport', () => {
  it('cộng/trừ 2’s complement + tràn số', () => {
    expect(signedReport(5, -3, 8, 'add').expect[1]).toBe('2');
    expect(signedReport(5, 3, 8, 'sub').expect[1]).toBe('2');
    const ov = signedReport(100, 100, 8, 'add');
    expect(ov.answer.at(-1).key).toBe('c1.overflow');
    expect(signedReport(-5, null, 4).expect).toEqual(['1011']);
  });
});

describe('exprReport', () => {
  it('SOP và POS tương đương hàm gốc, check nhận biểu thức tương đương', () => {
    for (const src of ["x'y + xy'", 'xy + xz + yz', "w'x + yz'", 'Σm(1, 3, 5, 7)', 'ΠM(0, 2) ']) {
      const r = exprReport(src);
      expect(r.check(r.answer[0].m), src).toBe(true);
      expect(r.check(r.answer[1].m), src).toBe(true);
      expect(r.steps.length).toBeGreaterThan(2);
    }
    expect(exprReport('xy + xz').check("x'")).toBe(false);
  });
  it('autoVars', () => { expect(autoVars('xy')).toBe(2); expect(autoVars('Σm(5)')).toBe(3); expect(autoVars("wx'")).toBe(4); });
  it('hàm hằng không ném lỗi', () => { expect(exprReport("x + x'").answer[0].m).toBe('1'); expect(exprTruthTable("x + x'", 2)).toEqual([1, 1, 1, 1]); });
});

describe('mọi khoá của máy giải có trong từ điển vi và en', () => {
  it('đủ khoá', async () => {
    const { vi } = await import('../src/i18n/vi/index.js');
    const { en } = await import('../src/i18n/en/index.js');
    const { vi: shared } = await import('../../shared/i18n/vi.js');
    const { keysOf } = await import('../../shared/tests/keys-of.js');
    const samples = [baseReport('1011.01', 2), baseReport('3F.8', 16), baseReport('13.3', 10), complementReport('1010100', '1000011', 2), complementReport('3250', '72532', 10),
      signedReport(5, -3, 8, 'add'), signedReport(5, 3, 8, 'sub'), signedReport(100, 100, 8), exprReport("wx + yz + w'y'z'"), exprReport('Σm(1,3)')];
    const need = [...new Set(samples.flatMap(keysOf))];
    expect(need.filter(k => !(k in vi) && !(k in shared)), 'thiếu ở vi').toEqual([]);
    expect(need.filter(k => !(k in en)), 'thiếu ở en').toEqual([]);
  });
});

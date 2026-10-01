import { describe, it, expect } from 'vitest';
import { codesReport } from '../src/logic/report-codes.js';
import { keysOf } from '../../shared/tests/keys-of.js';
import { vi } from '../src/i18n/vi/index.js';
import { en } from '../src/i18n/en/index.js';

describe('máy giải mã nhị phân', () => {
  it('cộng BCD khớp phép cộng thập phân', () => {
    for (let a = 0; a < 1000; a += 37) for (let b = 0; b < 1000; b += 41) {
      const r = codesReport('bcdAdd', String(a), String(b));
      expect(r.expect[0]).toBe(String(a + b));
      expect(r.expect[1].replace(/ /g, '')).toBe([...String(a + b)].map(d => (+d).toString(2).padStart(4, '0')).join(''));
    }
  });
  it('Gray hai chiều khớp công thức b ^ (b >> 1) và quay ngược lại', () => {
    for (let v = 0; v < 64; v++) {
      const bin = v.toString(2).padStart(6, '0'), g = (v ^ (v >> 1)).toString(2).padStart(6, '0');
      expect(codesReport('bin2gray', bin).expect[0]).toBe(g);
      expect(codesReport('gray2bin', g).expect[0]).toBe(bin);
    }
  });
  it('parity chẵn/lẻ làm tổng số bit 1 đúng tính chất', () => {
    for (const s of ['0', '1', '1011', '1111', '10000001']) {
      const ones = x => [...x].filter(c => c === '1').length;
      expect(ones(codesReport('parity', s, '', 'even').expect[1]) % 2).toBe(0);
      expect(ones(codesReport('parity', s, '', 'odd').expect[1]) % 2).toBe(1);
    }
  });
  it('mã thập phân: 2421 và Excess-3 tự bù; đủ khoá từ điển vi/en', () => {
    const r = codesReport('dec', '2025');
    expect(r.expect[0]).toBe('0010 0000 0010 0101');
    const need = [...new Set(['dec', 'bcdAdd', 'bin2gray', 'gray2bin', 'parity'].flatMap(op => keysOf(codesReport(op, op === 'dec' || op === 'bcdAdd' ? '478' : '1011', '395'))))];
    expect(need.filter(k => !(k in vi) || !(k in en))).toEqual([]);
  });
  it('đầu vào sai ⇒ ném lỗi', () => {
    expect(() => codesReport('bin2gray', '102')).toThrow();
    expect(() => codesReport('dec', 'abc')).toThrow();
  });
});

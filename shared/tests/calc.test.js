import { describe, it, expect } from 'vitest';
import { evaluate, show } from '../logic/calc.js';

describe('máy tính đổi cơ số', () => {
  it('đọc số ở cơ số đang chọn', () => {
    expect(evaluate('FA', 16).value).toBe(250);
    expect(evaluate('777', 8).value).toBe(511);
    expect(evaluate('1011', 2).value).toBe(11);
    expect(evaluate('fa', 16).value).toBe(250);
  });

  it('phép tính, thứ tự ưu tiên, ngoặc, dấu âm', () => {
    expect(evaluate('1F + 3*A', 16).value).toBe(31 + 30);
    expect(evaluate('(777 - 70) / 7', 8).value).toBe(Math.trunc((511 - 56) / 7));
    expect(evaluate('2 + 3 × 4', 10).value).toBe(14);
    expect(evaluate('-(5 - 8)', 10).value).toBe(3);
    expect(evaluate('157 / 8', 10).value).toBe(19.625);      // hệ 10: máy tính thường
    expect(evaluate('157 / 8', 16).value).toBe(Math.trunc(0x157 / 8));   // hệ khác: chia nguyên — như khi chia liên tiếp
    expect(evaluate('0.1 + 0.2', 10).value).toBe(0.3);
    expect(evaluate('12.5 × 3 - 7 / 2', 10).value).toBe(34);
    expect(evaluate('157 % 8', 10).value).toBe(5);
    expect(evaluate('10 − 3', 10).value).toBe(7);
  });

  it('báo lỗi thay vì đoán', () => {
    expect(evaluate('129', 8).error).toBe('calc.badDigit');
    expect(evaluate('1.5', 2).error).toBe('calc.unexpected');     // phần thập phân chỉ ở hệ 10
    expect(evaluate('12 +', 10).error).toBe('calc.missing');
    expect(evaluate('(1 + 2', 10).error).toBe('calc.paren');
    expect(evaluate('5 / 0', 10).error).toBe('calc.divZero');
    expect(evaluate('1 ^ 2', 16).error).toBe('calc.unexpected');     // ^ chỉ ở DEC
    expect(evaluate('sqrt(-4)', 10).error).toBe('calc.domain');
    expect(evaluate('acos(2)', 10).error).toBe('calc.domain');
    expect(evaluate('', 10).value).toBeNull();
  });

  it('DEC: căn, lũy thừa, π, lượng giác theo độ, nhân ngầm (người học gõ sqrt(x) như thói quen)', () => {
    const v = t => evaluate(t, 10).value;
    expect(v('sqrt(10)')).toBeCloseTo(Math.sqrt(10), 9);
    expect(v('√10')).toBeCloseTo(Math.sqrt(10), 9);
    expect(v('2√3')).toBeCloseTo(2 * Math.sqrt(3), 9);
    expect(v('3sqrt(2)')).toBeCloseTo(3 * Math.sqrt(2), 9);
    expect(v('1/sqrt(5)')).toBeCloseTo(1 / Math.sqrt(5), 9);
    expect(v('sqrt(2)/2')).toBeCloseTo(Math.SQRT2 / 2, 9);
    expect(v('√(1 + 3)')).toBe(2);
    expect(v('2^10')).toBe(1024);
    expect(v('2^3^2')).toBe(512);                  // kết hợp phải
    expect(v('-2^2')).toBe(-4);
    expect(v('2(3 + 1)')).toBe(8);
    expect(v('2π')).toBeCloseTo(2 * Math.PI, 9);
    expect(v('acos(0.5)')).toBeCloseTo(60, 9);
    expect(v('cos(60)')).toBeCloseTo(0.5, 9);
    expect(v('asin(1)')).toBe(90);
    expect(evaluate('ABC', 16).value).toBe(0xabc);   // hệ 16: A B C vẫn là chữ số, không phải tên hàm
  });

  it('hiện kết quả ở từng cơ số', () => {
    expect(show(250, 2)).toBe('1111 1010');
    expect(show(250, 16)).toBe('FA');
    expect(show(-5, 2)).toBe('−0101');
    expect(show(8, 8)).toBe('10');
    expect(show(-2.5, 10)).toBe('−2.5');
    expect(show(2.5, 2)).toBe('—');
  });
});

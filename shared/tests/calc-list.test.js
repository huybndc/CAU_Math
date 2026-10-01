import { describe, it, expect } from 'vitest';
import { evalRows, asFraction } from '../logic/calc-list.js';

const v = lines => evalRows(lines).map(r => r.value ?? r.kind);

describe('máy tính dạng danh sách', () => {
  it('biểu thức thường và dòng trống', () => {
    expect(v(['2 + 3*4', '', 'sqrt(16)'])).toEqual([14, 'empty', 4]);
  });
  it('biến dùng ở dòng sau, nhân ngầm 2a', () => {
    expect(v(['a = 3', 'a^2 + 1', '2a', 'b = a/4', 'b*4'])).toEqual([3, 10, 6, 0.75, 3]);
  });
  it('hàm một và nhiều biến, gọi lồng', () => {
    const r = evalRows(['f(x) = x^2 + 1', 'f(3)', 'g(x, y) = x*y', 'g(2, f(1))', 'f(g(1,2))']);
    expect(r.map(x => x.value ?? x.kind)).toEqual(['fn', 10, 'fn', 4, 5]);
  });
  it('báo lỗi đúng dòng, dòng khác vẫn tính', () => {
    const r = evalRows(['1/0', 'zz + 1', 'pi = 3', 'f(x) = x', 'f(1, 2)', '4']);
    expect(r.map(x => x.error ?? x.value)).toEqual(['calc.divZero', 'calc.undef', 'calc.reserved', undefined, 'calc.argc', 4]);
    expect(r[1].name).toBe('zz');
  });
  it('góc theo độ như calc.js; số rất nhỏ không vỡ chuỗi', () => {
    expect(v(['sin(30)'])[0]).toBeCloseTo(0.5, 9);
    expect(v(['a = 1/10000000', 'a*10000000'])[1]).toBeCloseTo(1, 9);
  });
  it('phân số', () => {
    expect(asFraction(2 / 3)).toBe('2/3');
    expect(asFraction(-0.75)).toBe('−3/4');
    expect(asFraction(4)).toBe(null);
    expect(asFraction(Math.SQRT2)).toBe(null);
  });
});

describe('giải tích (số): đạo hàm, tích phân, tổng; radian', () => {
  const val = (lines, opt) => evalRows(lines, opt).map(r => r.value ?? r.error ?? r.kind);
  it('đạo hàm tại điểm', () => {
    expect(val(['diff(x^2, 3)', 'diff(sin(x), 0, x)', 'diff(ln(x), 1)'], { angle: 'rad' })).toEqual([6, 1, 1]);
  });
  it('tích phân xác định, cả khi dùng hàm đã định nghĩa', () => {
    const r = val(['int(x^2, 0, 3)', 'int(sin(x), 0, pi)', 'f(x) = exp(x)', 'int(f, 0, 1)'], { angle: 'rad' });
    expect(r[0]).toBeCloseTo(9, 8);
    expect(r[1]).toBeCloseTo(2, 8);
    expect(r[3]).toBeCloseTo(Math.E - 1, 8);
  });
  it('tổng Σ và biến đặt tên khác', () => {
    expect(val(['sum(k^2, k, 1, 10)', 'sum(1/2^n, n, 0, 30)'])[0]).toBe(385);
    expect(val(['int(t^2, 0, 3, t)'])[0]).toBeCloseTo(9, 8);
  });
  it('lượng giác theo radian khi chọn; thiếu đối số báo lỗi', () => {
    expect(val(['sin(pi/2)'], { angle: 'rad' })).toEqual([1]);
    expect(val(['int(x, 0)'])).toEqual(['calc.argc']);
  });
});

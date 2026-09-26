import { describe, it, expect } from 'vitest';
import { parseNumber, parseNumbers, checkNumber, checkVector, checkChoice, checkAnswer } from '../src/logic/answer-check.js';

describe('parseNumber', () => {
  it('số thường và số âm', () => {
    expect(parseNumber('3')).toBe(3);
    expect(parseNumber(' -1.5 ')).toBe(-1.5);
    expect(parseNumber('+2')).toBe(2);
    expect(parseNumber('.5')).toBe(0.5);
  });

  it('phân số và dấu trừ Unicode', () => {
    expect(parseNumber('3/4')).toBe(0.75);
    expect(parseNumber('-2/3')).toBeCloseTo(-2 / 3, 12);
    expect(parseNumber('−5')).toBe(-5);
    expect(parseNumber('1/0')).toBe(null);
  });

  it('không phải số thì trả null', () => {
    expect(parseNumber('abc')).toBe(null);
    expect(parseNumber('')).toBe(null);
    expect(parseNumber('3x')).toBe(null);
    expect(parseNumber('1e3')).toBe(null);
  });
});

describe('parseNumbers — cách viết nào cũng nhận', () => {
  it('các kiểu ngăn cách đều ra cùng kết quả', () => {
    for (const s of ['3, -2', '(3, -2)', '[3; -2]', '3 -2', '  3 , -2  ', '3,-2']) {
      expect(parseNumbers(s), s).toEqual([3, -2]);
    }
  });

  it('vector ba chiều', () => {
    expect(parseNumbers('1, 2, 3')).toEqual([1, 2, 3]);
    expect(parseNumbers('(1 2 3)')).toEqual([1, 2, 3]);
  });

  it('một số cũng là danh sách một phần tử', () => {
    expect(parseNumbers('11')).toEqual([11]);
    expect(parseNumbers('-0.5')).toEqual([-0.5]);
  });

  it('có mẩu không phải số thì trả null', () => {
    expect(parseNumbers('3, x')).toBe(null);
    expect(parseNumbers('')).toBe(null);
    expect(parseNumbers('   ')).toBe(null);
  });
});

describe('gõ căn như thói quen (người học, 2026-09-25: sqrt(x) thay vì chép ký hiệu √)', () => {
  it('sqrt(…), √, 2√3, 1/sqrt(5), lũy thừa', () => {
    expect(parseNumber('sqrt(10)')).toBeCloseTo(Math.sqrt(10), 9);
    expect(parseNumber('√10')).toBeCloseTo(Math.sqrt(10), 9);
    expect(parseNumber('SQRT(10)')).toBeCloseTo(Math.sqrt(10), 9);
    expect(parseNumber('-2sqrt(3)')).toBeCloseTo(-2 * Math.sqrt(3), 9);
    expect(parseNumber('√2/2')).toBeCloseTo(Math.SQRT2 / 2, 9);
    expect(parseNumber('3/√5')).toBeCloseTo(3 / Math.sqrt(5), 9);
    expect(parseNumber('2^3')).toBe(8);
    expect(parseNumber('63.43°')).toBe(63.43);
  });
  it('vector có căn: ngoặc của sqrt không bị cắt', () => {
    const h = 1 / Math.sqrt(2);
    for (const s of ['(1/sqrt(2), 1/sqrt(2))', '1/√2, 1/√2', '[1/sqrt(2); 1/sqrt(2)]', '(1/sqrt(2) 1/sqrt(2))']) {
      const got = parseNumbers(s);
      expect(got, s).toHaveLength(2);
      got.forEach(x => expect(x).toBeCloseTo(h, 9));
    }
    expect(parseNumbers('sqrt(2) / 2')).toHaveLength(1);
    expect(checkNumber('sqrt(10)', Math.sqrt(10), 0.01)).toBe(true);
  });
});

describe('chấm số', () => {
  it('đúng trong sai số thì nhận', () => {
    expect(checkNumber('11', 11)).toBe(true);
    expect(checkNumber('2.24', 2.236, 0.011)).toBe(true);
    expect(checkNumber('2.2', 2.236, 0.011)).toBe(false);
    expect(checkNumber('63.4', 63.43, 0.11)).toBe(true);
  });

  it('trả lời bằng vector cho câu hỏi số thì sai', () => {
    expect(checkNumber('1, 2', 11)).toBe(false);
  });
});

describe('chấm vector', () => {
  it('đúng từng toạ độ', () => {
    expect(checkVector('(4, 20)', [4, 20])).toBe(true);
    expect(checkVector('4 20', [4, 20])).toBe(true);
    expect(checkVector('4, 21', [4, 20])).toBe(false);
  });

  it('sai số chiều thì sai', () => {
    expect(checkVector('4, 20, 0', [4, 20])).toBe(false);
    expect(checkVector('4', [4, 20])).toBe(false);
  });

  it('chấp nhận phân số trong toạ độ', () => {
    expect(checkVector('3/2, -1/2', [1.5, -0.5])).toBe(true);
  });
});

describe('chấm lựa chọn và chấm tự động theo dạng đáp án', () => {
  it('bỏ qua hoa thường và khoảng trắng', () => {
    expect(checkChoice(' Unique ', 'unique')).toBe(true);
    expect(checkChoice('vo  nghiem', 'vo nghiem')).toBe(true);
    expect(checkChoice('none', 'unique')).toBe(false);
  });

  it('checkAnswer tự chọn cách chấm', () => {
    expect(checkAnswer('4, 20', [4, 20])).toBe(true);
    expect(checkAnswer('11', 11)).toBe(true);
    expect(checkAnswer('unique', 'unique')).toBe(true);
    expect(checkAnswer('4, 20', 11)).toBe(false);
  });
});

describe('căn bậc hai và ô rời', () => {
  it('√ và sqrt', () => {
    expect(parseNumber('√5')).toBeCloseTo(Math.sqrt(5), 12);
    expect(parseNumber('-2√3')).toBeCloseTo(-2 * Math.sqrt(3), 12);
    expect(parseNumber('√2/2')).toBeCloseTo(Math.SQRT1_2, 12);
    expect(parseNumber('3/√5')).toBeCloseTo(3 / Math.sqrt(5), 12);
    expect(parseNumber('sqrt(2)')).toBeCloseTo(Math.SQRT2, 12);
    expect(parseNumber('√')).toBe(null);
  });
  it('các ô nối bằng … (widget fields)', () => {
    expect(parseNumbers('1 … -2 … 3/2')).toEqual([1, -2, 1.5]);
  });
});

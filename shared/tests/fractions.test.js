import { describe, it, expect } from 'vitest';
import { splitFractions } from '../logic/fractions.js';

describe('phân số hai hàng', () => {
  it('tách phân số của hai số nguyên, kể cả âm', () => {
    expect(splitFractions('x = 2/3')).toEqual(['x = ', { n: '2', d: '3' }]);
    expect(splitFractions('-5/77 + 1/2')).toEqual([{ n: '−5', d: '77' }, ' + ', { n: '1', d: '2' }]);
    expect(splitFractions('(1/3)·[1; 2]')).toEqual(['(', { n: '1', d: '3' }, ')·[1; 2]']);
  });
  it('tử/mẫu có căn, π, hoặc cụm trong ngoặc', () => {
    expect(splitFractions('cos = 1/(1·√2)')).toEqual(['cos = ', { n: '1', d: '1·√2' }]);
    expect(splitFractions('= √2/2')).toEqual(['= ', { n: '√2', d: '2' }]);
    expect(splitFractions('π/4')).toEqual([{ n: 'π', d: '4' }]);
    expect(splitFractions('(1/√5)·[1; 2]')).toEqual(['(', { n: '1', d: '√5' }, ')·[1; 2]']);
  });
  it('không đụng tên hàng, số thập phân, căn, chuỗi nhiều gạch, chia 0', () => {
    for (const s of ['R3/4', 'R2 ← R2/(-2)', '1.5/2', '2/3/4', '5/0', 'a/b', '12/Ax']) {
      expect(splitFractions(s)).toEqual([s]);
    }
  });
});

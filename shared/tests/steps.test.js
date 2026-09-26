import { describe, it, expect } from 'vitest';
import { splitMatrices } from '../logic/steps.js';

describe('splitMatrices — ma trận trong dòng lời giải', () => {
  it('tách chữ và ma trận, kể cả ma trận mở rộng', () => {
    expect(splitMatrices('R2 ← R2 − 2R1:   [1 2 | 5; 0 -1 | 3]')).toEqual([
      'R2 ← R2 − 2R1:   ', { rows: [['1', '2', '5'], ['0', '-1', '3']], bar: 2 },
    ]);
    expect(splitMatrices('L = [1 0; 1/2 1],   U = [2 4; 0 1]')).toEqual([
      'L = ', { rows: [['1', '0'], ['1/2', '1']], bar: -1 }, ',   U = ', { rows: [['2', '4'], ['0', '1']], bar: -1 },
    ]);
  });

  it('không phải ma trận thì giữ nguyên chữ', () => {
    expect(splitMatrices('x = 3')).toEqual(['x = 3']);
    expect(splitMatrices('[1 2 3]')).toEqual(['[1 2 3]']);                 // một hàng: không có ';'
    expect(splitMatrices('[1 2; 3]')).toEqual(['[1 2; 3]']);              // hàng lệch
    expect(splitMatrices('[1 | 2; 3 4 | 5]')).toEqual(['[1 | 2; 3 4 | 5]']);
    expect(splitMatrices('')).toEqual([]);
  });
});

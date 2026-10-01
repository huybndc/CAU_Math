import { describe, it, expect } from 'vitest';
import { cellsOf } from '../src/ui/answer-widgets.js';

describe('cellsOf: tách đáp án cũ về từng ô', () => {
  it('vector cột "a, b, c" không để dấu phẩy dính vào ô (ô từng bị tô đỏ dù đáp án đúng)', () => {
    expect(cellsOf('-17, 2, -9', 3, 1)).toEqual(['-17', '2', '-9']);
  });
  it('ma trận "[a b; c d]" và hàng "a b c" vẫn đúng', () => {
    expect(cellsOf('[1 2; 3 4]', 2, 2)).toEqual(['1', '2', '3', '4']);
    expect(cellsOf('1 2 3', 1, 3)).toEqual(['1', '2', '3']);
    expect(cellsOf('', 2, 2)).toEqual([]);
  });
});

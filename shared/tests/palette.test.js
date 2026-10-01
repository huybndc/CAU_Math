import { describe, it, expect } from 'vitest';
import { search } from '../ui/palette.js';

const items = [
  { kind: 'lesson', title: 'Thuật toán Euclid', sub: 'Chia hết & gcd', hay: 'gcd cua hai so' },
  { kind: 'tool', title: 'Đồng dư ax ≡ b', sub: 'Đồng dư', hay: '' },
  { kind: 'lesson', title: 'Bù 2: khoảng biểu diễn', sub: 'Hệ đếm', hay: 'tran so overflow' },
];

describe('tìm nhanh', () => {
  it('bỏ dấu, mọi từ phải có mặt, tiêu đề xếp trước nội dung', () => {
    expect(search(items, 'euclid')[0].title).toBe('Thuật toán Euclid');
    expect(search(items, 'dong du')[0].title).toContain('Đồng dư');
    expect(search(items, 'bu 2')[0].title).toContain('Bù 2');
    expect(search(items, 'overflow').map(x => x.title)).toEqual(['Bù 2: khoảng biểu diễn']);   // chỉ có trong nội dung
    expect(search(items, 'zzz')).toEqual([]);
    expect(search(items, '   ')).toEqual([]);
  });
});

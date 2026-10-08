import { describe, it, expect } from 'vitest';
import { KINDS, normalizePet } from '../logic/pet.js';
import { PET_ART } from '../ui/pet-art.js';

describe('bạn đồng hành', () => {
  it('mặc định tắt; giá trị lưu cũ được đọc lại đúng; giá trị lạ ⇒ tắt', () => {
    expect(normalizePet(undefined)).toEqual({ on: false, kind: 'cat' });
    expect(normalizePet(null)).toEqual({ on: false, kind: 'cat' });
    expect(normalizePet('off')).toEqual({ on: false, kind: 'cat' });
    expect(normalizePet(true)).toEqual({ on: true, kind: 'cat' });
    expect(normalizePet('owl')).toEqual({ on: true, kind: 'owl' });
    expect(normalizePet({ on: true, kind: 'plant' })).toEqual({ on: true, kind: 'plant' });
    expect(normalizePet({ on: 'yes', kind: 'dog' })).toEqual({ on: false, kind: 'cat' });
  });
  it('đúng 3 nhân vật: mèo, cú, cây — mỗi SVG ≤ 3KB, không script/ảnh ngoài/animation riêng, màu qua token', () => {
    expect(KINDS).toEqual(['cat', 'owl', 'plant']);
    expect(Object.keys(PET_ART).sort()).toEqual([...KINDS].sort());
    for (const [k, svg] of Object.entries(PET_ART)) {
      expect(new TextEncoder().encode(svg).length, k).toBeLessThanOrEqual(3072);
      expect(svg, k).not.toMatch(/<script|<image|href=|<animate|<style|@keyframes|\son\w+=/i);
      expect(svg, k).toContain('var(--');
    }
  });
});

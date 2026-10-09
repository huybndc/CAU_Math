import { describe, it, expect } from 'vitest';
import { KINDS, normalizePet } from '../logic/pet.js';
import { PET_ART } from '../ui/pet-art.js';

describe('bạn đồng hành', () => {
  it('mặc định BẬT (chưa lưu gì); tắt rõ ràng thì giữ tắt; giá trị lưu cũ được đọc lại đúng', () => {
    expect(normalizePet(undefined)).toEqual({ on: true, kind: 'cat' });
    expect(normalizePet(null)).toEqual({ on: true, kind: 'cat' });
    expect(normalizePet('robot?')).toEqual({ on: true, kind: 'cat' });
    expect(normalizePet('off')).toEqual({ on: false, kind: 'cat' });
    expect(normalizePet(false)).toEqual({ on: false, kind: 'cat' });
    expect(normalizePet(true)).toEqual({ on: true, kind: 'cat' });
    expect(normalizePet('owl')).toEqual({ on: true, kind: 'owl' });
    expect(normalizePet({ on: false, kind: 'plant' })).toEqual({ on: false, kind: 'plant' });
    expect(normalizePet({ on: true, kind: 'dog' })).toEqual({ on: true, kind: 'cat' });
    expect(normalizePet({ kind: 'owl' })).toEqual({ on: true, kind: 'owl' });
  });
  it('đúng 3 nhân vật: mèo, cú, cây — mỗi SVG ≤ 3KB, không script/ảnh ngoài/animation riêng, không phụ thuộc theme', () => {
    expect(KINDS).toEqual(['cat', 'owl', 'plant']);
    expect(Object.keys(PET_ART).sort()).toEqual([...KINDS].sort());
    for (const [k, svg] of Object.entries(PET_ART)) {
      expect(new TextEncoder().encode(svg).length, k).toBeLessThanOrEqual(3072);
      expect(svg, k).not.toMatch(/<script|<image|href=|<animate|<style|@keyframes|\son\w+=/i);
    }
  });
  it('mỗi nhân vật có mắt thường (.pe) và mắt vui (.ph) để phản ứng khi bấm', () => {
    for (const [k, svg] of Object.entries(PET_ART)) { expect(svg, k).toContain('class="pe"'); expect(svg, k).toContain('class="ph"'); }
  });
});

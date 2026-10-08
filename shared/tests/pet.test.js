import { describe, it, expect } from 'vitest';
import { PETS, normalizePet } from '../logic/pet.js';
import { PET_ART } from '../ui/pet-art.js';

describe('bạn đồng hành', () => {
  it('mặc định tắt; giá trị lưu cũ true ⇒ mèo; giá trị lạ ⇒ tắt', () => {
    expect(normalizePet(undefined)).toBe('off');
    expect(normalizePet(false)).toBe('off');
    expect(normalizePet(true)).toBe('cat');
    expect(normalizePet('robot?')).toBe('off');
    for (const p of PETS) expect(normalizePet(p)).toBe(p);
  });
  it('mỗi nhân vật có SVG ≤ 3KB, không script/ảnh ngoài/animation riêng, màu qua token', () => {
    expect(Object.keys(PET_ART).sort()).toEqual(PETS.filter(p => p !== 'off').sort());
    for (const [k, svg] of Object.entries(PET_ART)) {
      expect(new TextEncoder().encode(svg).length, k).toBeLessThanOrEqual(3072);
      expect(svg, k).not.toMatch(/<script|<image|href=|<animate|<style|@keyframes|\son\w+=/i);
      expect(svg, k).toContain('var(--');
    }
  });
});

import { readFileSync, readdirSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

/* Chuyển động giống Study_Hub: shared/style/motion.css là bản chép src/motion.css của Hub (token + nút + khối gập + giảm chuyển động).
   Phần còn lại của CSS không được thêm hiệu ứng "lố": nảy/rung/trượt vào, phóng to, easing cong riêng, thời gian dài. */
const dirs = ['shared/style', 'logic/src', 'linalg/src', 'discrete/src'];
const files = dirs.flatMap(d => readdirSync(new URL(`../../${d}/`, import.meta.url)).filter(f => f.endsWith('.css')).map(f => `${d}/${f}`));
const css = f => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const motion = css('shared/style/motion.css');
/* keyframes cho phép: `skel` (khung chờ, như Hub) và `pet` — ngoại lệ DUY NHẤT so với Study_Hub, đã thống nhất 3 bên (xem test 'pet' bên dưới). */
const PET_KF = ['pet-hop', 'pet-shake', 'pet-sway', 'pet-nod', 'pet-squish', 'pet-puff', 'pet-stretch'];   // như src/pets/pet.css của Hub (test pets.test.js canh biên độ)
const EXCEPT = { 'shared/style/base.css': ['skel'], 'shared/style/pet.css': PET_KF };

describe('motion giống Study_Hub', () => {
  it('motion.css có đúng token và quy tắc của Hub', () => {
    expect(motion).toContain('--dur-fast:120ms;--dur:200ms;--dur-slow:340ms;--ease-out:cubic-bezier(.22,1,.36,1)');
    expect(motion).toContain('.btn:active{transform:scale(.96)}');
    expect(motion).toContain('.btn:hover{transform:translateY(-1px)}');
    expect(motion).toContain('prefers-reduced-motion:reduce');
    expect(motion).not.toMatch(/@keyframes/);
  });
  const others = files.filter(f => f !== 'shared/style/motion.css');
  const generic = others.filter(f => f !== 'shared/style/pet.css');   // pet.css: động tác nhân vật (scale nhẹ, chuyển 380ms) có test riêng trong pet.test.js
  it('chỉ có keyframes của khung chờ (skel), không nảy/rung/trượt', () => {
    for (const f of others) expect([...css(f).matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]), f).toEqual(EXCEPT[f] ?? []);
  });
  it('không phóng to khi rê/nhấn, không easing cong riêng, không nhấc quá 1px', () => {
    for (const f of generic) {
      const t = css(f);
      expect(t, f).not.toMatch(/scale\(\s*(1\.\d|[2-9])/);
      expect(t, f).not.toMatch(/cubic-bezier\(/);
      expect(t, f).not.toMatch(/translateY\(\s*-([2-9]|1\d)/);
    }
  });
  it('transition/animation không dài hơn --dur (200ms), trừ khung chờ lặp vô hạn', () => {
    for (const f of generic) for (const m of css(f).matchAll(/(?:transition|animation)[^;{}]*;?/g)) {
      if (/infinite/.test(m[0])) continue;
      for (const n of m[0].matchAll(/(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g)) {
        const ms = n[2] === 's' ? +n[1] * 1000 : +n[1];
        expect(ms, `${f}: ${m[0]}`).toBeLessThanOrEqual(200);
      }
    }
  });
  it("ngoại lệ DUY NHẤT: keyframes của nhân vật (`pet`, `pet-*`) trong shared/style/pet.css — biên độ và giảm chuyển động do pet.test.js canh", () => {
    const t = css('shared/style/pet.css');
    expect(Object.values(EXCEPT).flat().sort()).toEqual([...PET_KF, 'skel'].sort());
    expect([...t.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1])).toEqual(PET_KF);
    expect(t).not.toContain('infinite');
  });
});

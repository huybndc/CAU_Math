import { readFileSync, readdirSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

/* Chuyển động giống Study_Hub: shared/style/motion.css là bản chép src/motion.css của Hub (token + nút + khối gập + giảm chuyển động).
   Phần còn lại của CSS không được thêm hiệu ứng "lố": nảy/rung/trượt vào, phóng to, easing cong riêng, thời gian dài. */
const dirs = ['shared/style', 'logic/src', 'linalg/src', 'discrete/src'];
const files = dirs.flatMap(d => readdirSync(new URL(`../../${d}/`, import.meta.url)).filter(f => f.endsWith('.css')).map(f => `${d}/${f}`));
const css = f => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const motion = css('shared/style/motion.css');

describe('motion giống Study_Hub', () => {
  it('motion.css có đúng token và quy tắc của Hub', () => {
    expect(motion).toContain('--dur-fast:120ms;--dur:200ms;--dur-slow:340ms;--ease-out:cubic-bezier(.22,1,.36,1)');
    expect(motion).toContain('.btn:active{transform:scale(.96)}');
    expect(motion).toContain('.btn:hover{transform:translateY(-1px)}');
    expect(motion).toContain('prefers-reduced-motion:reduce');
    expect(motion).not.toMatch(/@keyframes/);
  });
  const others = files.filter(f => f !== 'shared/style/motion.css');
  it('chỉ có keyframes của khung chờ (skel), không nảy/rung/trượt', () => {
    for (const f of others) expect([...css(f).matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]), f).toEqual(f === 'shared/style/base.css' ? ['skel'] : []);
  });
  it('không phóng to khi rê/nhấn, không easing cong riêng, không nhấc quá 1px', () => {
    for (const f of others) {
      const t = css(f);
      expect(t, f).not.toMatch(/scale\(\s*(1\.\d|[2-9])/);
      expect(t, f).not.toMatch(/cubic-bezier\(/);
      expect(t, f).not.toMatch(/translateY\(\s*-([2-9]|1\d)/);
    }
  });
  it('transition/animation không dài hơn --dur (200ms), trừ khung chờ lặp vô hạn', () => {
    for (const f of others) for (const m of css(f).matchAll(/(?:transition|animation)[^;{}]*;?/g)) {
      if (/infinite/.test(m[0])) continue;
      for (const n of m[0].matchAll(/(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g)) {
        const ms = n[2] === 's' ? +n[1] * 1000 : +n[1];
        expect(ms, `${f}: ${m[0]}`).toBeLessThanOrEqual(200);
      }
    }
  });
});

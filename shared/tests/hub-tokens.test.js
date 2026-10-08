import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { render } from '../../scripts/sync-hub-tokens.mjs';

/* Token chung với Study_Hub: design-tokens.json là bản chụp (chép từ Study_Hub main), tokens-hub.css sinh từ nó.
   tokens.css không được khai báo lại token của Hub, trừ các ngoại lệ có chủ ý bên dưới. */
const read = f => readFileSync(new URL(`../style/${f}`, import.meta.url), 'utf8');
const snap = JSON.parse(read('design-tokens.json'));
const OWN = new Set(['accent', 'accent-ink']);        // CAU_Math: --accent là màu môn, không phải màu mực như ở Hub

describe('token chung với Study_Hub', () => {
  it('tokens-hub.css khớp design-tokens.json (lệch ⇒ chạy node scripts/sync-hub-tokens.mjs)', () => {
    expect(read('tokens-hub.css')).toBe(render(snap));
  });
  it('snapshot đủ cả sáng và tối, có màu 3 môn và vạch mục tiêu', () => {
    for (const k of ['bg', 'side', 'panel', 'ink', 'line', 'goal', 'viz-logic', 'viz-linalg', 'viz-discrete', 'fs-md', 'r-lg']) expect(snap.light[k], k).toBeTruthy();
    for (const k of ['bg', 'panel', 'ink', 'goal', 'viz-logic']) expect(snap.dark[k], k).toBeTruthy();
  });
  it('tokens.css không khai báo lại token của Hub (trừ ngoại lệ)', () => {
    const own = [...read('tokens.css').matchAll(/--([a-z0-9-]+)\s*:/g)].map(m => m[1]);
    const hub = new Set([...Object.keys(snap.light), ...Object.keys(snap.dark)]);
    expect(own.filter(k => hub.has(k) && !OWN.has(k))).toEqual([]);
  });
});

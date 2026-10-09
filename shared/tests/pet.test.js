import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { KINDS, petOf, normalizePet, petSvg, label } from '../logic/pet.js';
import DESIGN from '../logic/design-pets.json';

describe('bạn đồng hành (design-pets.json của Study_Hub)', () => {
  it('đúng 4 nhân vật theo Hub, mặc định BẬT; giá trị sai/cũ được đọc lại đúng', () => {
    expect(KINDS).toEqual(['cat', 'sprout', 'puppy', 'peach']);
    expect(KINDS.map(label)).toEqual(['Mèo', 'Mầm', 'Chó con', 'Đào']);
    expect(normalizePet(undefined)).toEqual({ on: true, kind: 'cat' });
    expect(normalizePet('owl')).toEqual({ on: true, kind: 'cat' });
    expect(normalizePet('off')).toEqual({ on: false, kind: 'cat' });
    expect(normalizePet('puppy')).toEqual({ on: true, kind: 'puppy' });
    expect(normalizePet({ on: false, kind: 'peach' })).toEqual({ on: false, kind: 'peach' });
    expect(normalizePet({ kind: 'sprout' })).toEqual({ on: true, kind: 'sprout' });
  });
  it('mọi khung 16×16, mọi ký tự có màu, không màu đỏ (dành cho Live_Lecture), SVG không script/chữ', () => {
    for (const k of KINDS) for (const x of DESIGN.expressions) {
      const rows = DESIGN.kinds[k].frames[x];
      expect(rows, `${k}/${x}`).toHaveLength(16);
      for (const r of rows) { expect(r).toHaveLength(16); for (const ch of r) if (ch !== '.') expect(DESIGN.kinds[k].palette[ch], `${k}/${x} '${ch}'`).toBeTruthy(); }
      expect(petSvg(k, x)).not.toMatch(/<script|<text|<image|href=|@keyframes|\son\w+=/i);
    }
    for (const k of KINDS) for (const c of Object.values(DESIGN.kinds[k].palette)) {
      const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
      expect(r > 200 && g < 90 && b < 90, `${k} ${c}`).toBe(false);
    }
  });
  it('API khớp Hub: petOf lấy pet.set cuối cùng; petBlock(ctx) trả {art, ctl} và gọi ctx.add/ctx.render', () => {
    expect(petOf([])).toEqual({ on: true, kind: 'cat' });
    expect(petOf([{ type: 'pet.set', payload: { on: true, kind: 'puppy' } }, { type: 'math.answer', payload: {} }, { type: 'pet.set', payload: { on: false, kind: 'peach' } }])).toEqual({ on: false, kind: 'peach' });
  });
  it('bản chép khớp Study_Hub khi repo Hub nằm cạnh (chạy máy bạn; CI không có thì bỏ qua)', () => {
    const p = new URL('../../../Study_Hub/design-pets.json', import.meta.url);
    if (!existsSync(p)) return;
    expect(DESIGN).toEqual(JSON.parse(readFileSync(p, 'utf8')));
    const hub = new URL('../../../Study_Hub/src/ui/pet.js', import.meta.url);   // UI y hệt Hub, chỉ khác đường import
    if (existsSync(hub)) expect(readFileSync(new URL('../ui/pet.js', import.meta.url), 'utf8')).toBe(readFileSync(hub, 'utf8').replace("'../pets/index.js'", "'../logic/pet.js'"));
  });
});

import { it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { petOf, KIND_IDS, EXPRESSIONS, normalizePet, petSvg } from '../logic/pet.js';
import { createPet, colorsOf, SIGNATURE, eyeBoxes } from '../logic/pet-engine.js';
import { RULES, mood, shyBurst, pettedBurst, answerStats, greeting, breathOf } from '../logic/pet-rules.js';
import DESIGN from '../logic/design-pets.json';

/* Bộ pet là BẢN CHÉP của Study_Hub (Hub làm chủ; chép lại khi Hub đổi, không sửa tay). Test này là bản chuyển đường dẫn của tests/pets.test.js của Hub. */
const read = p => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const readPets = () => DESIGN;


it('6 nhân vật × mọi biểu cảm: khung đúng cỡ, mọi ô là màu hợp lệ, không đỏ chủ đạo, không chữ', () => {
  expect(KIND_IDS).toEqual(['cao', 'cu', 'tho', 'gau', 'rua', 'meo']);
  for (const k of KIND_IDS) {
    const pet = createPet(k, () => 0.5);
    for (const x of EXPRESSIONS) {
      const g = pet.render({ expr: x, fx: false });
      expect(g, `${k}/${x}`).toHaveLength(pet.h);
      for (const row of g) { expect(row).toHaveLength(pet.w); for (const c of row) if (c) expect(c, `${k}/${x}`).toMatch(/^#[0-9a-f]{6}$/); }
      expect(g.flat().filter(Boolean).length, `${k}/${x} trống`).toBeGreaterThan(300);
    }
    for (const c of colorsOf(k)) { const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); expect(r > 200 && g < 80 && b < 80, `${k} ${c} quá đỏ`).toBe(false); }
  }
  expect(petSvg('cao')).not.toMatch(/<text/);
});

it('engine: mỗi nhân vật chạy đủ động tác riêng + hiệu ứng nhiều khung không lỗi', () => {
  for (const k of KIND_IDS) {
    const pet = createPet(k, () => 0.37);
    for (const [act, dur] of Object.entries(SIGNATURE[k])) for (let i = 0; i <= dur * 10; i++) {
      const g = pet.render({ t: i / 10, expr: i % 2 ? 'happy' : 'neutral', act, p: i / 10 });
      expect(g).toHaveLength(pet.h);
      for (const row of g) expect(row).toHaveLength(pet.w);
    }
    for (const lull of [0, 0.6]) for (let i = 0; i < 40; i++) pet.render({ t: i / 10, lull });
  }
  const a = createPet('cao', () => 0.5).render({ t: 1, fx: false }), b = createPet('cao', () => 0.5).render({ t: 1, fx: false });
  expect(a).toEqual(b);          // hình tĩnh xác định
});

it('mọi nhân vật cùng một khung (đổi nhân vật không lệch bố cục)', () => {
  const sizes = KIND_IDS.map(k => { const p = createPet(k); return [p.w, p.h]; });
  for (const s of sizes) expect(s).toEqual(sizes[0]);
});

it('mắt: hai mắt cùng cỡ; mỗi biểu cảm vẽ hai mắt GIỐNG HỆT nhau (trừ biểu cảm lệch có chủ ý), neo cố định', () => {
  const asym = new Set(['wink', 'squint', 'sad', 'hungry', 'focus', 'final', 'proud']);   // nháy/><: lật; lông mày, giọt lệ: lật theo mắt
  for (const k of ['cao', 'cu', 'tho', 'gau', 'meo']) {
    const pet = createPet(k), [a, b, ...rest] = eyeBoxes(k), [ox, oy] = pet.off;
    expect(rest, k).toHaveLength(0);
    expect([a.x1 - a.x0, a.y1 - a.y0], k).toEqual([b.x1 - b.x0, b.y1 - b.y0]);
    const P = { e: null };
    const eyeAt = (g, e) => { const out = []; for (let y = e.y0 - 2; y <= e.y1 + 2; y++) for (let x = e.x0; x <= e.x1; x++) out.push(g[y + oy][x + ox]); return out; };
    const dark = pet.render({ fx: false })[a.y0 + 1 + oy][a.x0 + 1 + ox];   // ô mắt (mẫu 'open' hàng 1 cột 0)
    for (const x of EXPRESSIONS.filter(e => !asym.has(e))) {
      const g = pet.render({ expr: x, fx: false });
      const mask = e => eyeAt(g, e).map(c => c === dark || c === '#ffffff');
      expect(mask(a), `${k}/${x}`).toEqual(mask(b));
    }
    void P;
  }
});

it('biểu cảm khác "neutral" thật sự (≥3 ô), trừ những cái chỉ khác ở biểu tượng trên đầu', () => {
  const same = new Set(['neutral', 'tilt']);       // tilt: dấu hỏi trên đầu (ngoài mặt) — vẫn khác ô
  for (const k of KIND_IDS) {
    const pet = createPet(k), base = pet.render({ fx: false });
    for (const x of EXPRESSIONS.filter(e => !same.has(e))) {
      const g = pet.render({ expr: x, fx: false });
      let diff = 0;
      g.forEach((r, y) => r.forEach((c, i) => { if (c !== base[y][i]) diff++; }));
      expect(diff, `${k}/${x}`).toBeGreaterThanOrEqual(3);
    }
  }
});

it('mỗi nhân vật một màu chủ đạo riêng: màu thân phổ biến nhất của hai con bất kỳ cách nhau rõ (RGB > 60)', () => {
  const dominant = k => { const h = {}; for (const c of createPet(k).render({ fx: false }).flat().filter(Boolean)) h[c] = (h[c] ?? 0) + 1; return Object.entries(h).filter(([c]) => c !== '#ffffff').sort((x, y) => y[1] - x[1])[0][0]; };
  const rgb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const doms = KIND_IDS.map(k => rgb(dominant(k)));
  for (let i = 0; i < doms.length; i++) for (let j = i + 1; j < doms.length; j++) expect(Math.hypot(...doms[i].map((v, n) => v - doms[j][n])), `${KIND_IDS[i]} vs ${KIND_IDS[j]}`).toBeGreaterThan(60);
});

it('normalizePet: sai hình dạng → mặc định BẬT + nhân vật đầu', () => {
  expect(normalizePet(null)).toEqual({ on: true, kind: 'cao' });
  expect(normalizePet({ on: 'yes', kind: 'dragon' })).toEqual({ on: true, kind: 'cao' });
  expect(normalizePet({ on: true, kind: 'cat' })).toEqual({ on: true, kind: 'cao' });     // id cũ (mèo 16×16) về mặc định
  expect(normalizePet({ on: false, kind: 'meo' })).toEqual({ on: false, kind: 'meo' });
  expect(normalizePet({ on: true, kind: 'rua' })).toEqual({ on: true, kind: 'rua' });
  for (const k of ['cu', 'tho', 'gau']) expect(normalizePet({ on: true, kind: k }).kind).toBe(k);
});

it('chuyển động nhân vật: keyframes pet (thở ≤2px) + động tác pet-* (≤4px, ≤8°), mỗi động tác trong rules có CSS, dừng khi giảm chuyển động', () => {
  const css = [['shared/style/pet.css', read('shared/style/pet.css')]];
  const names = css.flatMap(([, t]) => [...t.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]));
  expect(names.every(n => n === 'pet' || n.startsWith('pet-'))).toBe(true);
  const pet = read('shared/style/pet.css');
  const body = n => pet.match(new RegExp(`@keyframes ${n}\\{(.*)\\}\\n`))[1];
  for (const m of body('pet').matchAll(/(-?\d+)px/g)) expect(Math.abs(Number(m[1]))).toBeLessThanOrEqual(2);
  for (const n of names.filter(x => x !== 'pet')) {
    for (const m of body(n).matchAll(/(-?\d+)px/g)) expect(Math.abs(Number(m[1])), n).toBeLessThanOrEqual(4);
    for (const m of body(n).matchAll(/(-?\d+)deg/g)) expect(Math.abs(Number(m[1])), n).toBeLessThanOrEqual(8);
  }
  const used = [...Object.values(RULES.acts.mood), ...['click', 'dblclick', 'hover', 'shy', 'petted', 'greet', 'morning'].map(k => RULES.acts[k])];
  for (const a of used) expect(pet, `thiếu CSS cho động tác ${a}`).toContain(`data-act=${a}]`);
  for (const a of used) expect(names, a).toContain(`pet-${a}`.replace('pet-hop2', 'pet-hop'));
  expect(Math.min(...Object.values(RULES.breathSeconds))).toBeGreaterThanOrEqual(2.5);
  expect(pet).toMatch(/\.pet-face\{animation:pet var\(--breath/);
  expect(read('shared/style/motion.css')).toMatch(/prefers-reduced-motion:reduce\)\{[^}]*animation:none!important/);
});

it('petOf: pet.set cuối cùng thắng; chưa có thì mặc định bật', () => {
  expect(petOf([])).toEqual({ on: true, kind: 'cao' });
  const ev = (kind, on) => ({ type: 'pet.set', payload: { kind, on } });
  expect(petOf([ev('rua', true), { type: 'mark.set', payload: {} }, ev('meo', false)])).toEqual({ on: false, kind: 'meo' });
});

it('mood: buồn khi tuần này sai nhiều, buồn ngủ khi lâu không học hoặc đêm khuya, còn lại thường', () => {
  const noon = new Date(2026, 9, 9, 12).getTime(), day = 864e5;
  expect(mood({ now: noon })).toBe('neutral');                                              // chưa từng học
  expect(mood({ now: noon, lastTs: noon - 2 * day })).toBe('neutral');
  expect(mood({ now: noon, lastTs: noon - 3 * day })).toBe('sleepy');
  expect(mood({ now: new Date(2026, 9, 9, 23, 30).getTime(), lastTs: noon })).toBe('sleepy');
  expect(mood({ now: new Date(2026, 9, 9, 4, 59).getTime(), lastTs: noon })).toBe('sleepy');
  expect(mood({ now: noon, lastTs: noon, answered: 10, correct: 4 })).toBe('sad');
  expect(mood({ now: noon, lastTs: noon, answered: 10, correct: 5 })).toBe('neutral');      // đúng đúng 50% chưa buồn
  expect(mood({ now: noon, lastTs: noon, answered: 9, correct: 0 })).toBe('neutral');       // chưa đủ 10 câu
  expect(mood({ now: noon - 4 * day + day, lastTs: noon - 8 * day, answered: 20, correct: 2 })).toBe('sad');   // buồn thắng buồn ngủ
});

it('shyBurst: ≥3 lần bấm trong 2 giây mới ngượng', () => {
  const t = [];
  expect([0, 500].map(x => shyBurst(t, x))).toEqual([false, false]);
  expect(shyBurst(t, 900)).toBe(true);
  const slow = [];
  expect([0, 1500, 3000, 4500].map(x => shyBurst(slow, x))).toEqual([false, false, false, false]);
});

it('rules trong design-pets.json: mọi biểu cảm kích hoạt đều là biểu cảm có thật', () => {
  const r = readPets().rules;
  const names = [...r.click.expressions, r.hover.expression, r.hover.look, ...['shy', 'petted', 'hold', 'dblclick', 'idle', 'sad', 'cheer', 'proud', 'relieved', 'eager', 'focus', 'hungry', 'lazy', 'sleepy'].map(k => r[k].expression),
    r.focus.final, r.greet.back.expression, r.greet.morning.expression, ...Object.values(r.persona).flatMap(p => (p.idle ? [p.idle] : []))];
  for (const [k, p] of Object.entries(r.persona)) for (const s of p.sig) expect(Object.keys(SIGNATURE[k]), `${k}/${s}`).toContain(s);
  for (const x of names) expect(EXPRESSIONS, String(x)).toContain(x);
  expect(r).toMatchObject({ blinkEveryMs: RULES.blinkEveryMs, noText: true });
});

it('petOf: ts trùng thì id (chuỗi) lớn hơn thắng, kể cả khi mảng sắp ngược', () => {
  const a = { id: 'a1', ts: 5, type: 'pet.set', payload: { on: true, kind: 'rua' } };
  const b = { id: 'b2', ts: 5, type: 'pet.set', payload: { on: false, kind: 'meo' } };
  expect(petOf([a, b])).toEqual({ on: false, kind: 'meo' });
  expect(petOf([b, a])).toEqual({ on: false, kind: 'meo' });
  expect(petOf([b, { ...a, ts: 6 }])).toEqual({ on: true, kind: 'rua' });   // ts mới hơn vẫn thắng id
});

it('petOf: ts xa tương lai (+365 ngày) không thắng lựa chọn mới đúng giờ; trong 5 phút vẫn tính', () => {
  const now = 1_700_000_000_000, DAY = 864e5;
  const ev = (id, ts, kind) => ({ id, ts, type: 'pet.set', payload: { on: true, kind } });
  expect(petOf([ev('a', now + 365 * DAY, 'rua'), ev('b', now, 'meo')], now)).toEqual({ on: true, kind: 'meo' });
  expect(petOf([ev('b', now, 'meo'), ev('a', now + 365 * DAY, 'rua')], now)).toEqual({ on: true, kind: 'meo' });
  expect(petOf([ev('a', now + 4 * 60e3, 'rua'), ev('b', now, 'meo')], now)).toEqual({ on: true, kind: 'rua' });
});

const NOON = new Date(2026, 9, 7, 12).getTime();      // thứ Tư
const base = { now: NOON, lastTs: NOON - 3600e3, answered: 0, correct: 0, todayAnswered: 0, signals: {} };
const acts = (now, list) => list.map(([min, ok]) => ({ ts: now - min * 60e3, ok }));

it('answerStats: chuỗi đúng liền, câu hôm nay, chuỗi ngày', () => {
  const day = 864e5;
  const st = answerStats([...acts(NOON, [[50, false], [40, true], [30, true], [20, true]]), { ts: NOON - day, source: 'read' }, { ts: NOON - 2 * day }], NOON);
  expect(st).toMatchObject({ streak: 3, todayAnswered: 4, todayCorrect: 3, dayStreak: 3 });
  expect(answerStats([], NOON)).toMatchObject({ streak: 0, todayAnswered: 0, dayStreak: 0, lastAnswerTs: null });
});

it('mood mới: hớn hở / tự hào / nhẹ nhõm / háo hức / tập trung / đói bài / thư thả, theo thứ tự ưu tiên', () => {
  expect(mood({ ...base, streak: 5, lastAnswerTs: NOON - 60e3 })).toBe('cheer');
  expect(mood({ ...base, streak: 5, lastAnswerTs: NOON - 13 * 36e5 })).toBe('neutral');                    // chuỗi đã cũ
  expect(mood({ ...base, todayAnswered: 10, todayCorrect: 8 })).toBe('cheer');
  expect(mood({ ...base, todayAnswered: 10, todayCorrect: 7 })).toBe('neutral');
  expect(mood({ ...base, dayStreak: 3 })).toBe('proud');
  expect(mood({ ...base, signals: { relieved: true, newNote: true } })).toBe('relieved');
  expect(mood({ ...base, signals: { newNote: true, examDays: 2 } })).toBe('eager');
  expect(mood({ ...base, signals: { examDays: 3 } })).toBe('focus');
  expect(mood({ ...base, signals: { examDays: 4 } })).toBe('neutral');
  expect(mood({ ...base, signals: { examDays: -6 } })).toBe('final');
  expect(mood({ ...base, now: new Date(2026, 9, 7, 19).getTime() })).toBe('hungry');
  expect(mood({ ...base, now: new Date(2026, 9, 7, 19).getTime(), todayAnswered: 3 })).toBe('neutral');
  expect(mood({ ...base, now: new Date(2026, 9, 10, 12).getTime(), lastTs: new Date(2026, 9, 10, 9).getTime() })).toBe('lazy');   // thứ Bảy
  expect(mood({ ...base, now: new Date(2026, 9, 7, 23, 30).getTime(), signals: { newNote: true } })).toBe('sleepy');         // khuya thắng háo hức
  expect(mood({ ...base, answered: 10, correct: 3, streak: 6, lastAnswerTs: NOON })).toBe('sad');                           // sai nhiều thắng tất cả
  expect(mood({ now: NOON })).toBe('neutral');                                                                                // thiếu dữ liệu: không bật quy tắc nào
});

it('greeting: nghỉ ≥2 ngày ⇒ vẫy; trước 8:00 ⇒ ngáp; còn lại không chào', () => {
  expect(greeting({ now: NOON, lastTs: NOON - 2 * 864e5 }).expression).toBe('wave');
  expect(greeting({ now: new Date(2026, 9, 7, 7).getTime(), lastTs: NOON - 864e5 }).expression).toBe('yawn');
  expect(greeting({ now: NOON, lastTs: NOON - 864e5 })).toBeNull();
  expect(greeting({ now: new Date(2026, 9, 7, 7).getTime(), lastTs: new Date(2026, 9, 3, 7).getTime() }).expression).toBe('wave');
});

it('pettedBurst: đổi chiều chuột ≥4 lần trong 0,9 giây mới vuốt ve; breathOf: vui nhanh, buồn ngủ chậm', () => {
  const t = []; expect([0, 200, 400, 600].map(x => pettedBurst(t, x))).toEqual([false, false, false, true]);
  const u = []; expect([0, 400, 800, 1200].map(x => pettedBurst(u, x))).toEqual([false, false, false, false]);
  expect(breathOf('cheer')).toBeLessThan(breathOf('neutral'));
  expect(breathOf('sleepy')).toBeGreaterThan(breathOf('neutral'));
  for (const m of ['neutral', 'cheer', 'sleepy']) expect(breathOf(m)).toBeGreaterThanOrEqual(2.5);
});

it('version = sha256 nội dung (bỏ trường version) — cùng cách tính với Hub', () => {
  const { version, ...content } = DESIGN;
  expect(version).toMatch(/^[0-9a-f]{64}$/);
  expect(version).toBe(createHash('sha256').update(JSON.stringify(content)).digest('hex'));
});

it('bản chép khớp Study_Hub khi repo Hub nằm cạnh (chạy máy bạn; CI không có thì bỏ qua)', () => {
  const hub = p => new URL(`../../../Study_Hub/${p}`, import.meta.url);
  if (!existsSync(hub('design-pets.json'))) return;
  const same = (mine, theirs, map = s => s) => expect(readFileSync(new URL(`../../${mine}`, import.meta.url), 'utf8'), mine).toBe(map(readFileSync(hub(theirs), 'utf8')));
  same('shared/logic/design-pets.json', 'design-pets.json');
  same('shared/logic/pet-art.json', 'src/pets/art.json');
  same('shared/logic/pet-rules.js', 'src/pets/rules.js');
  same('shared/style/pet.css', 'src/pets/pet.css');
  same('shared/logic/pet-engine.js', 'src/pets/engine.js', s => s.replace("'./art.json'", "'./pet-art.json'"));
  same('shared/logic/pet.js', 'src/pets/index.js', s => s.replace("'./engine.js'", "'./pet-engine.js'"));
  same('shared/ui/pet.js', 'src/ui/pet.js', s => s.replace("'../pets/index.js'", "'../logic/pet.js'").replace("'../pets/rules.js'", "'../logic/pet-rules.js'").replace("'../pets/engine.js'", "'../logic/pet-engine.js'"));
});

import { describe, it, expect } from 'vitest';
import { scoreOf, RECENT, MIN_N } from '../logic/score.js';
import { flagKey, withoutFlagged } from '../logic/flags.js';

const ev = (i, ok, kind = 'k', prefix = 'p') => ({ ts: i, prefix, kind, ok });
const run = (n, ok, kind) => Array.from({ length: n }, (_, i) => ev(i, ok, kind));
const none = new Set();

describe('scoreOf: 80% luyện tập gần đây + 20% đã đọc', () => {
  it('chưa làm gì = 0; vài câu đầu không cho điểm tuyệt đối (hệ số n/MIN_N)', () => {
    expect(scoreOf({ events: [], flags: none, cards: [] }).score).toBe(0);
    expect(scoreOf({ events: run(5, true), flags: none, cards: [] }).score).toBe(Math.round(100 * 5 / MIN_N));
  });
  it('chỉ tính RECENT câu cuối: câu sai cũ không kéo mãi; sai mới kéo xuống', () => {
    const old = [...run(100, false), ...Array.from({ length: RECENT }, (_, i) => ev(1000 + i, true))];
    expect(scoreOf({ events: old, flags: none, cards: [] }).score).toBe(100);
    expect(scoreOf({ events: [...old, ev(2000, false)], flags: none, cards: [] }).score).toBe(98);
  });
  it('đọc chiếm 20%: đọc hết + đúng 75% = 80; chưa đọc gì + đúng hết = 80', () => {
    const e = Array.from({ length: 40 }, (_, i) => ev(i, i % 4 !== 0));             // 75% đúng
    expect(scoreOf({ events: e, flags: none, cards: [{ done: true, keys: [] }] }).score).toBe(80);
    expect(scoreOf({ events: run(40, true), flags: none, cards: [{ done: false, keys: [] }] }).score).toBe(80);
  });
  it('dạng bị cờ không tính điểm; thẻ chỉ có điểm bị cờ không vào mẫu số', () => {
    const e = [...run(30, true, 'a'), ...run(30, false, 'b')];
    const flags = new Set([flagKey('p', 'b')]);
    expect(scoreOf({ events: e, flags, cards: [] }).score).toBe(100);
    const cards = [{ done: true, keys: ['p:a'] }, { done: false, keys: ['p:b:x'] }];
    expect(scoreOf({ events: e, flags, cards }).learn).toBe(1);
    expect(scoreOf({ events: e, flags: none, cards }).learn).toBe(0.5);
  });
});

it('withoutFlagged: bỏ dạng bị cờ, bỏ hết thì giữ nguyên', () => {
  expect(withoutFlagged(['a', 'b'], 'p', new Set(['p:a']))).toEqual(['b']);
  expect(withoutFlagged(['a'], 'p', new Set(['p:a']))).toEqual(['a']);
});

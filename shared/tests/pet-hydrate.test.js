import { describe, it, expect, vi, beforeEach } from 'vitest';

const mem = new Map();
globalThis.localStorage = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k), clear: () => mem.clear() };
const events = [];
vi.mock('@host', async orig => ({ ...(await orig()), loadPetEvents: async () => events }));
const { hydratePet, load, save } = await import('../ui/store.js');

describe('đọc lại pet.set từ Hub', () => {
  beforeEach(() => { mem.clear(); events.length = 0; });
  it('bản cuối thắng, chuẩn hoá; không có thì giữ nguyên', async () => {
    expect(await hydratePet('logic')).toBe(false);
    events.push({ ts: 5, payload: { on: true, kind: 'puppy' } }, { ts: 9, payload: { on: false, kind: 'bogus' } });
    expect(await hydratePet('logic')).toBe(true);
    expect(load('pet', null, 'logic')).toEqual({ on: false, kind: 'cat' });
  });
  it('đổi ở máy mới hơn bản Hub thì không bị ghi đè', async () => {
    save('pet', { on: true, kind: 'peach' }, 'logic'); save('pet-ts', 100, 'logic');
    events.push({ ts: 50, payload: { on: true, kind: 'puppy' } });
    expect(await hydratePet('logic')).toBe(false);
    expect(load('pet', null, 'logic')).toEqual({ on: true, kind: 'peach' });
  });
});

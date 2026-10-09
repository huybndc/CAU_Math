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
    events.push({ ts: 5, payload: { on: true, kind: 'gau' } }, { ts: 9, payload: { on: false, kind: 'bogus' } });
    expect(await hydratePet('logic')).toBe(true);
    expect(load('pet', null, 'logic')).toEqual({ on: false, kind: 'cao' });
  });
  it('đổi ở máy mới hơn bản Hub thì không bị ghi đè', async () => {
    save('pet', { on: true, kind: 'rua' }, 'logic'); save('pet-ts', 100, 'logic');
    events.push({ ts: 50, payload: { on: true, kind: 'gau' } });
    expect(await hydratePet('logic')).toBe(false);
    expect(load('pet', null, 'logic')).toEqual({ on: true, kind: 'rua' });
  });
  it('ts tương lai (đồng hồ lệch +365 ngày) không thắng mãi: bỏ qua, lựa chọn của người dùng giữ nguyên', async () => {
    const year = 365 * 864e5;
    events.push({ ts: Date.now() + year, payload: { on: true, kind: 'gau' } });
    expect(await hydratePet('logic')).toBe(false);
    save('pet', { on: true, kind: 'rua' }, 'logic'); save('pet-ts', Date.now(), 'logic');   // người dùng chọn lại ở máy đúng giờ
    expect(await hydratePet('logic')).toBe(false);
    expect(load('pet', null, 'logic')).toEqual({ on: true, kind: 'rua' });
  });
  it('sự kiện lệch ≤ 5 phút vẫn được nhận; bản hợp lệ cuối thắng khi có bản tương lai phía sau', async () => {
    events.push({ ts: Date.now() + 60_000, payload: { on: true, kind: 'tho' } }, { ts: Date.now() + 365 * 864e5, payload: { on: false, kind: 'cao' } });
    expect(await hydratePet('logic')).toBe(true);
    expect(load('pet', null, 'logic')).toEqual({ on: true, kind: 'tho' });
  });
});

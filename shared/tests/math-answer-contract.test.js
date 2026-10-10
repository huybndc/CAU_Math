import { describe, it, expect, vi, beforeEach } from 'vitest';

/* HỢP ĐỒNG với Hub: mỗi câu làm xong thành MỘT sự kiện `math.answer`
   { id, ts, type, payload: { subject, prefix, kind, ok, mode, tag? } }. Sai hình dạng ⇒ Hôm nay / Thống kê của Hub sai
   mà app toán vẫn xanh. Hub chỉ kiểm mẫu ở phía họ; đây là phía phát. */
const mem = new Map();
globalThis.localStorage = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k), clear: () => mem.clear() };
globalThis.document = { documentElement: { dataset: { subject: 'logic' } } };
const sent = [];
vi.mock('@host', async orig => ({ ...(await orig()), currentUser: async () => ({ id: 'u1' }), pushHubEvents: async (list, device) => { sent.push({ list, device }); } }));
const { record } = await import('../ui/store.js');
const { answerEvent } = await import('../logic/progress.js');
const flush = () => new Promise(r => setTimeout(r, 0));

describe('math.answer phát ra từ record()', () => {
  beforeEach(() => { mem.clear(); sent.length = 0; });
  it('đúng khoá, đúng kiểu; có tag khi câu có nhãn, không có thì bỏ hẳn khoá', async () => {
    record([answerEvent('c1q', { kind: 'convert', review: 'toDec' }, 1, 'practice'), answerEvent('c1q', { kind: 'gray' }, false, 'exam')]);
    await flush();
    const [{ list }] = sent;
    expect(list).toHaveLength(2);
    for (const e of list) {
      expect(Object.keys(e).sort()).toEqual(['id', 'payload', 'ts', 'type']);
      expect(e.type).toBe('math.answer');
      expect(typeof e.id).toBe('string');
      expect(Number.isFinite(e.ts)).toBe(true);
    }
    expect(list[0].payload).toEqual({ subject: 'logic', prefix: 'c1q', kind: 'convert', ok: true, mode: 'practice', tag: 'toDec' });
    expect(list[1].payload).toEqual({ subject: 'logic', prefix: 'c1q', kind: 'gray', ok: false, mode: 'exam' });
    expect(list[1].payload).not.toHaveProperty('tag');
    expect(list[0].id).not.toBe(list[1].id);
  });
  it('lượt ghi cùng lúc có ts tăng dần (không trùng); lưu ở máy đủ hai bản', async () => {
    record([answerEvent('c1q', { kind: 'a' }, true, 'practice'), answerEvent('c1q', { kind: 'b' }, true, 'practice')]);
    await flush();
    const [a, b] = sent[0].list;
    expect(b.ts).toBeGreaterThan(a.ts);
    expect(JSON.parse(mem.get('progress:logic'))).toHaveLength(2);
  });
  it('mode mặc định practice khi thiếu', async () => {
    record([{ prefix: 'c1q', kind: 'x', ok: true }]);
    await flush();
    expect(sent[0].list[0].payload.mode).toBe('practice');
  });
});

import { describe, it, expect } from 'vitest';
import { mergeEvents } from '../logic/progress.js';

const ev = (id, o = {}) => ({ id, ts: 100, prefix: 'c1q', kind: 'x', ok: true, mode: 'exam', ...o });

describe('mergeEvents: nhật ký máy + sự kiện nhập từ máy chủ', () => {
  it('cùng id chỉ tính một', () => {
    expect(mergeEvents([ev('a')], [ev('a')])).toHaveLength(1);
  });
  it('cùng câu từ hai nguồn (khác id, cùng chữ ký) chỉ tính một', () => {
    expect(mergeEvents([ev('u1')], [ev('snap|1')])).toHaveLength(1);
  });
  it('20 câu thi cũ cùng ts và chữ ký vẫn đủ 20, không bị gộp thành 1', () => {
    const remote = Array.from({ length: 20 }, (_, i) => ev(`snap|${i}`));
    expect(mergeEvents([], remote)).toHaveLength(20);
    expect(mergeEvents(remote.slice(0, 5).map((e, i) => ev(`u${i}`)), remote)).toHaveLength(20);   // 5 đã có ở máy ⇒ chỉ thêm 15
  });
  it('sắp theo thời gian', () => {
    expect(mergeEvents([ev('a', { ts: 5 })], [ev('b', { ts: 1, kind: 'y' })]).map(e => e.id)).toEqual(['b', 'a']);
  });
});

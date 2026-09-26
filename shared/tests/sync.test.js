import { describe, it, expect } from 'vitest';
import { mergeEntry, trackLocal, reconcile, validEntries, SYNC_APP } from '../logic/sync.js';

const ev = (ts, kind, ok = true) => ({ ts, prefix: 'c1q', kind, ok, mode: 'practice' });
const J = x => JSON.stringify(x);

describe('gộp một khoá', () => {
  it('nhật ký: hợp của hai máy, xếp theo thời gian', () => {
    const a = { v: J([ev(1, 'a'), ev(3, 'c')]), t: 10 };
    const b = { v: J([ev(1, 'a'), ev(2, 'b')]), t: 20 };
    const m = mergeEntry('progress:logic', [a, b]);
    expect(JSON.parse(m.v).map(e => e.kind)).toEqual(['a', 'b', 'c']);
    expect(m.t).toBe(20);
  });

  it('nhật ký: hai sự kiện giống hệt (cùng lần nộp bài) vẫn giữ đủ, không nhân đôi khi gộp lại', () => {
    const log = [ev(5, 'x'), ev(5, 'x')];
    const m = mergeEntry('progress:logic', [{ v: J(log), t: 1 }, { v: J([ev(5, 'x')]), t: 2 }]);
    expect(JSON.parse(m.v)).toHaveLength(2);
    const again = mergeEntry('progress:logic', [m, m]);
    expect(again.v).toBe(m.v);
  });

  it('nhật ký: kết quả trùng một bản thì giữ nguyên chuỗi của bản đó', () => {
    const v = '[' + J(ev(1, 'a')) + ']';
    expect(mergeEntry('progress:x', [{ v, t: 1 }, { v: '[]', t: 2 }]).v).toBe(v);
  });

  it('lịch sử thi: hợp theo ts, mới nhất trước, tối đa 20', () => {
    const a = Array.from({ length: 15 }, (_, i) => ({ ts: i * 2, right: 1 }));
    const b = Array.from({ length: 15 }, (_, i) => ({ ts: i * 2 + 1, right: 2 }));
    const m = JSON.parse(mergeEntry('exam-history:logic', [{ v: J(a), t: 1 }, { v: J(b), t: 2 }]).v);
    expect(m).toHaveLength(20);
    expect(m[0].ts).toBe(29);
  });

  it('khoá khác: bản đổi sau cùng thắng, kể cả dấu xoá', () => {
    expect(mergeEntry('lesson-ch1:logic', [{ v: '3', t: 5 }, { v: '7', t: 9 }]).v).toBe('7');
    expect(mergeEntry('exam:logic', [{ v: '{}', t: 5 }, { v: null, t: 9 }]).v).toBeNull();
  });

  it('hoà giờ thì mọi máy chọn cùng một bản', () => {
    const x = { v: 'a', t: 1 }, y = { v: 'b', t: 1 };
    expect(mergeEntry('k', [x, y])).toEqual(mergeEntry('k', [y, x]));
  });
});

describe('ghi nhận thay đổi tại máy', () => {
  it('khoá mới, khoá đổi, khoá bị xoá', () => {
    const base = { a: { v: '1', t: 1 }, b: { v: '2', t: 1 }, c: { v: '3', t: 1 } };
    const { base: next, changed } = trackLocal(base, { a: '1', b: '9', d: 'x' }, 50);
    expect(changed).toBe(true);
    expect(next).toEqual({ a: { v: '1', t: 1 }, b: { v: '9', t: 50 }, c: { v: null, t: 50 }, d: { v: 'x', t: 50 } });
  });

  it('không đổi gì thì báo không đổi', () => {
    const base = { a: { v: '1', t: 1 }, gone: { v: null, t: 1 } };
    expect(trackLocal(base, { a: '1' }, 9)).toEqual({ base, changed: false });
  });
});

describe('một lượt đồng bộ giữa hai máy', () => {
  it('máy B học thêm → máy A nhận nhật ký + thẻ đang học, giữ phần A làm riêng', () => {
    const shared = [ev(1, 'a')];
    const baseA = { 'progress:logic': { v: J(shared), t: 1 }, 'lesson-ch1:logic': { v: '2', t: 1 } };
    const currentA = { 'progress:logic': J([...shared, ev(4, 'mine')]), 'lesson-ch1:logic': '2' };
    const remoteB = { 'progress:logic': { v: J([...shared, ev(3, 'b')]), t: 3 }, 'lesson-ch1:logic': { v: '5', t: 3 } };
    const { base, writes } = reconcile(baseA, currentA, [remoteB], 100);
    expect(JSON.parse(writes['progress:logic']).map(e => e.kind)).toEqual(['a', 'b', 'mine']);
    // A vừa làm câu (t = 100) nhưng không đụng thẻ đang học ⇒ thẻ của B (t = 3) thắng
    expect(writes['lesson-ch1:logic']).toBe('5');
    expect(base['lesson-ch1:logic']).toEqual({ v: '5', t: 3 });
  });

  it('đã khớp thì không ghi gì (không vòng lặp tải lại trang)', () => {
    const snap = { k: { v: 'x', t: 1 } };
    const { base, writes } = reconcile(snap, { k: 'x' }, [snap], 9);
    expect(writes).toEqual({});
    expect(reconcile(base, { k: 'x' }, [base], 10).writes).toEqual({});
  });

  it('máy khác xoá bài thi dở → máy này xoá theo', () => {
    const base = { 'exam:logic': { v: '{"a":1}', t: 1 } };
    const { writes } = reconcile(base, { 'exam:logic': '{"a":1}' }, [{ 'exam:logic': { v: null, t: 5 } }], 9);
    expect(writes).toEqual({ 'exam:logic': null });
  });
});

describe('đọc file bản chụp', () => {
  it('bỏ file của app khác / hỏng, bỏ mục sai kiểu và khoá sync:', () => {
    expect(validEntries(null)).toBeNull();
    expect(validEntries({ app: 'khac', entries: {} })).toBeNull();
    const snap = { app: SYNC_APP, entries: { a: { v: '1', t: 1 }, b: { v: 2, t: 1 }, c: { v: 'x' }, 'sync:meta': { v: '', t: 1 }, d: { v: null, t: 3 } } };
    expect(validEntries(snap)).toEqual({ a: { v: '1', t: 1 }, d: { v: null, t: 3 } });
  });
});

import { describe, it, expect } from 'vitest';
import { buildItems, mergeSubject, statusOf } from '../logic/progress-export.js';

const ev = (ts, ok, extra = {}) => ({ ts, prefix: 'ch4', kind: 'mux', ok, mode: 'practice', ...extra });

describe('progress-export', () => {
  it('nhóm theo dạng câu, tính đúng %, cờ vướng mắc, tag sai', () => {
    const [it] = buildItems('logic', [ev(1, true), ev(2, false, { tag: 'z-dao' }), ev(3, false), ev(4, false)], () => 'MUX');
    expect(it).toMatchObject({ subject: 'logic', topic: 'ch4.mux', label: 'MUX', attempts: 4, correct: 1, accuracy: 0.25, status: 'weak', stuck: true, wrongTags: { 'z-dao': 1 } });
    expect(it.recent).toEqual([1, 0, 0, 0]);
  });
  it('ít câu thì "few", không stuck nếu chưa sai 3 liền', () => {
    expect(buildItems('logic', [ev(1, false)])[0]).toMatchObject({ status: 'few', stuck: false });
    expect(statusOf(5, 0.9)).toBe('strong');
  });
  it('mergeSubject thay môn cũ, giữ môn khác', () => {
    const doc = { items: [{ subject: 'logic', topic: 'a' }, { subject: 'discrete', topic: 'b' }] };
    const out = mergeSubject(doc, 'logic', [{ subject: 'logic', topic: 'c' }]);
    expect(out.items.map(i => i.topic)).toEqual(['b', 'c']);
  });
});

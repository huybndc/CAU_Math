import { describe, it, expect } from 'vitest';
import { parseKey, pointKeys, streakOf, isPassed, cardPassed, pointsSummary, makerFor, exampleFor, stepGroups } from '../logic/knowledge.js';

const ev = (kind, ok, extra = {}) => ({ ts: 1, prefix: 'p', kind, ok, ...extra });

describe('điểm kiến thức', () => {
  it('đọc khoá có / không có nhãn', () => {
    expect(parseKey('c1q:convert')).toEqual({ prefix: 'c1q', kind: 'convert', tag: undefined });
    expect(parseKey('c1q:convert:toDec').tag).toBe('toDec');
  });

  it('pointKeys chỉ lấy data-check (data-also chỉ để nối "ôn lại"), không lặp', () => {
    const body = '<div data-check="p:a p:b:t" data-also="p:c"></div>\n<div data-check="p:a"></div>';
    expect(pointKeys(body)).toEqual(['p:a', 'p:b:t']);
    expect(pointKeys('chỉ chữ')).toEqual([]);
  });

  it('streakOf đếm số câu đúng liền nhau ở cuối', () => {
    expect(streakOf([])).toBe(0);
    expect(streakOf([true, false, true, true])).toBe(2);
    expect(streakOf([true, true, false])).toBe(0);
  });

  it('isPassed: 2 câu đúng LIÊN TIẾP của đúng dạng; câu dạng khác xen giữa không cắt chuỗi', () => {
    expect(isPassed([ev('a', true), ev('a', false), ev('a', true)], 'p:a')).toBe(false);
    expect(isPassed([ev('a', true), ev('b', false), ev('a', true)], 'p:a')).toBe(true);
    expect(isPassed([ev('a', true), ev('a', true)], 'q:a')).toBe(false);
  });

  it('isPassed có nhãn chỉ tính câu mang đúng nhãn', () => {
    const log = [ev('a', true, { tag: 'x' }), ev('a', true, { tag: 'y' }), ev('a', true, { tag: 'x' })];
    expect(isPassed(log, 'p:a:x')).toBe(true);
    expect(isPassed(log, 'p:a:y')).toBe(false);
    expect(isPassed(log, 'p:a')).toBe(true);
  });

  it('cardPassed: null khi thẻ không có điểm; true khi mọi điểm đã nắm', () => {
    const log = [ev('a', true), ev('a', true)];
    expect(cardPassed(log, 'chữ')).toBeNull();
    expect(cardPassed(log, '<div data-check="p:a"></div>')).toBe(true);
    expect(cardPassed(log, '<div data-check="p:a p:b"></div>')).toBe(false);
    const cards = [{ body: '<div data-check="p:a"></div>' }, { body: '<div data-check="p:a p:b"></div>' }];
    expect(pointsSummary(log, cards)).toEqual({ total: 2, passed: 1 });
  });

  it('makerFor sinh lại tới khi câu mang đúng nhãn', () => {
    let i = 0;
    const bank = { makeQuestion: kind => ({ kind, review: ['u', 'v', 'w'][i++ % 3] }) };
    expect(makerFor(bank, 'p:k:w')(Math.random).review).toBe('w');
    expect(makerFor(bank, 'p:k')(Math.random).kind).toBe('k');
  });

  it('stepGroups: câu giải thích mở bước mới, dòng tính đi theo câu trước', () => {
    const q = { work: ['đầu', { key: 'a' }, '1', '2', { key: 'b', m: '3' }, { key: 'c' }, '4'] };
    expect(stepGroups(q)).toEqual([['đầu'], [{ key: 'a' }, '1', '2'], [{ key: 'b', m: '3' }], [{ key: 'c' }, '4']]);
    expect(stepGroups({ explainKey: 'x', explainParams: { n: 1 } })).toEqual([[{ key: 'x', params: { n: 1 } }]]);
    expect(stepGroups({})).toEqual([]);
  });
});

describe('ví dụ mẫu', () => {
  it('exampleFor: đủ bước (gần EXAMPLE_LINES dòng) nhưng không dài quá', () => {
    const pick = lens => { let i = 0; return exampleFor(() => ({ id: i, work: Array(lens[i++]).fill('x') }), Math.random, lens.length).id; };
    expect(pick([1, 4, 2, 3])).toBe(1);                       // chưa ai đủ 6 dòng ⇒ dài nhất
    expect(pick([12, 6, 9, 2])).toBe(1);                      // đúng 6 dòng thắng 9, 12 dòng
    expect(pick([12, 9, 3])).toBe(1);                         // cùng quá dài ⇒ ngắn hơn
  });
});

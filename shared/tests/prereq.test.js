import { describe, it, expect } from 'vitest';
import { buildGraph, danglingNeeds, findCycle, topoOrder, prereqLayers, pointAccuracy, weakestPrereq, nextPoint } from '../logic/prereq.js';

/* Đồ thị nhỏ:  a ← b ← d ,  a ← c ← d  (d cần b và c; b, c cần a) ; e độc lập */
const md = [
  '## A', '<div data-check="p:a"></div>',
  '## B', '<div data-check="p:b" data-needs="p:a"></div>',
  '## C', '<div data-needs="p:a" data-check="p:c"></div>',
  '## D', '<div data-check="p:d" data-needs="p:b p:c"></div>',
  '## E', '<div data-check="p:e"></div>',
].join('\n');
const g = buildGraph([{ ch: 'ch1', md }]);
const ev = (kind, ok) => ({ ts: 1, prefix: 'p', kind, ok });

describe('đồ thị tiên quyết', () => {
  it('dựng nút từ bài học: cần gì, thuộc thẻ nào', () => {
    expect(g.get('p:d')).toMatchObject({ needs: ['p:b', 'p:c'], ch: 'ch1', card: 3, title: 'D' });
    expect(g.get('p:c').needs).toEqual(['p:a']);             // thứ tự thuộc tính không quan trọng
    expect(danglingNeeds(g)).toEqual([]);
    expect(danglingNeeds(buildGraph([{ ch: 'x', md: '## Z\n<div data-check="p:z" data-needs="p:none"></div>' }]))).toEqual([['p:z', 'p:none']]);
  });

  it('findCycle: không chu trình ⇒ null; có ⇒ chỉ ra vòng', () => {
    expect(findCycle(g)).toBeNull();
    const bad = buildGraph([{ ch: 'x', md: '## X\n<div data-check="p:x" data-needs="p:y"></div>\n## Y\n<div data-check="p:y" data-needs="p:x"></div>' }]);
    expect(findCycle(bad)).toEqual(['p:x', 'p:y', 'p:x']);
  });

  it('topoOrder: tiên quyết đứng trước, hoà thì theo thứ tự bài học', () => {
    expect(topoOrder(g)).toEqual(['p:a', 'p:b', 'p:c', 'p:d', 'p:e']);
    const flipped = buildGraph([{ ch: 'x', md: '## Late\n<div data-check="p:l" data-needs="p:f"></div>\n## First\n<div data-check="p:f"></div>' }]);
    expect(topoOrder(flipped)).toEqual(['p:f', 'p:l']);
  });

  it('prereqLayers: lớp gần trước, không lặp', () => {
    expect(prereqLayers(g, 'p:d')).toEqual([['p:b', 'p:c'], ['p:a']]);
    expect(prereqLayers(g, 'p:a')).toEqual([]);
  });

  it('pointAccuracy: 10 câu gần nhất của đúng dạng', () => {
    expect(pointAccuracy([], 'p:a')).toBeNull();
    const log = [...Array(12)].map((_, i) => ev('a', i >= 2));
    expect(pointAccuracy(log, 'p:a')).toEqual({ acc: 1, n: 10 });
  });

  it('weakestPrereq: bằng chứng yếu (dù ở tầng xa) đứng trước điểm chưa làm', () => {
    // b, c chưa làm; a đúng 1/3 ⇒ gốc là a, không phải b
    const log = [ev('a', false), ev('a', true), ev('a', false)];
    expect(weakestPrereq(g, 'p:d', log)).toEqual({ key: 'p:a', acc: 1 / 3 });
  });

  it('weakestPrereq: điểm yếu GẦN nhất; điểm đã nắm hoặc đúng nhiều thì bỏ qua', () => {
    // b đã nắm, c đúng 1/3 ⇒ gốc là c
    const log = [ev('b', true), ev('b', true), ev('c', false), ev('c', true), ev('c', false), ev('a', true), ev('a', true)];
    expect(weakestPrereq(g, 'p:d', log)).toEqual({ key: 'p:c', acc: 1 / 3 });
    // lớp gần đều ổn, a chưa làm ⇒ gốc là a (chưa làm tính là yếu nhất)
    const log2 = [ev('b', true), ev('b', true), ev('c', true), ev('c', true)];
    expect(weakestPrereq(g, 'p:d', log2)).toEqual({ key: 'p:a', acc: null });
    const all = [...['a', 'b', 'c'].flatMap(k => [ev(k, true), ev(k, true)])];
    expect(weakestPrereq(g, 'p:d', all)).toBeNull();
  });

  it('nextPoint: điểm đầu tiên chưa nắm mà mọi điểm cần đã nắm', () => {
    expect(nextPoint(g, [])).toBe('p:a');
    expect(nextPoint(g, [ev('a', true), ev('a', true)])).toBe('p:b');
    const done = ['a', 'b', 'c', 'd', 'e'].flatMap(k => [ev(k, true), ev(k, true)]);
    expect(nextPoint(g, done)).toBeNull();
  });
});

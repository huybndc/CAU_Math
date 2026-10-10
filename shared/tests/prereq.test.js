import { describe, it, expect } from 'vitest';
import { splitCards } from '../logic/cards.js';
import { buildGraph, danglingNeeds, findCycle, topoOrder, prereqLayers, pointAccuracy, weakestPrereq, nextPoint, nextLearn, cardDone } from '../logic/prereq.js';

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

  it('pointAccuracy: khoá không nhãn tính cả câu có nhãn của dạng', () => {
    const log = [{ prefix: 'p', kind: 'a', ok: true, tag: 'x' }, { prefix: 'p', kind: 'a', ok: false }];
    expect(pointAccuracy(log, 'p:a')).toEqual({ acc: 0.5, n: 2 });
    expect(pointAccuracy(log, 'p:a:x')).toEqual({ acc: 1, n: 1 });
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

describe('thẻ chỉ đọc (không có bài tập) tính là đã học khi đã xem', () => {
  const mdr = ['## Đọc 1', 'chỉ chữ', '## A', '<div data-check="p:a"></div>', '## Đọc 2', 'chỉ chữ'].join('\n');
  const cards = splitCards(mdr).cards;
  const gr = buildGraph([{ ch: 'c1', md: mdr }]);
  const chapters = [{ ch: 'c1', cards }];
  const none = () => new Set();
  it('cardDone: đọc qua là xong (kể cả thẻ có bài tập); chưa đọc thì xong khi đã nắm điểm', () => {
    expect(cardDone([], cards[0].body, false)).toBe(false);
    expect(cardDone([], cards[0].body, true)).toBe(true);
    expect(cardDone([], cards[1].body, true)).toBe(true);                     // đọc là đủ; luyện tập chấm phần còn lại
    expect(cardDone([], cards[1].body, false)).toBe(false);
    const passed2 = [{ prefix: 'p', kind: 'a', ok: true }, { prefix: 'p', kind: 'a', ok: true }];
    expect(cardDone(passed2, cards[1].body, false)).toBe(true);
  });
  it('nextPoint: thẻ đã đọc hoặc dạng bị cờ thì coi như xong', () => {
    expect(nextPoint(gr, [], (ch, card) => card === 1)).toBeNull();
    expect(nextPoint(gr, [], undefined, new Set(['p:a']))).toBeNull();
  });
  it('học tiếp: thẻ chỉ-đọc chưa xem đứng trước điểm ở phía sau; đã đọc thì chuyển sang điểm; hết thì tiếp thẻ đọc sau', () => {
    expect(nextLearn(chapters, gr, [], none)).toMatchObject({ ch: 'c1', card: 0 });
    expect(nextLearn(chapters, gr, [], () => new Set([0]))).toMatchObject({ ch: 'c1', card: 1 });
    const passed = [{ prefix: 'p', kind: 'a', ok: true }, { prefix: 'p', kind: 'a', ok: true }];
    expect(nextLearn(chapters, gr, passed, () => new Set([0]))).toMatchObject({ ch: 'c1', card: 2 });
    expect(nextLearn(chapters, gr, passed, () => new Set([0, 2]))).toBeNull();
    expect(nextLearn(chapters, gr, [], () => new Set([0, 1, 2]))).toBeNull();           // đọc hết ⇒ không còn gì để học
  });
});

describe('nextLearn: chọn sớm hơn giữa điểm kế tiếp và thẻ chỉ-đọc theo thứ tự chương', () => {
  const mk = (...parts) => parts.join('\n');
  const c1pt = mk('## P1', '<div data-check="p:a"></div>');                 // chương 1: có điểm
  const c2read = mk('## R2', 'chỉ chữ');                                     // chương 2: thẻ chỉ-đọc
  const none = () => new Set();
  it('thẻ chỉ-đọc ở chương sau không chen trước điểm ở chương trước', () => {
    const lessons = [{ ch: 'c1', md: c1pt }, { ch: 'c2', md: c2read }];
    const chapters = lessons.map(l => ({ ch: l.ch, cards: splitCards(l.md).cards }));
    expect(nextLearn(chapters, buildGraph(lessons), [], none)).toMatchObject({ ch: 'c1', card: 0 });
  });
  it('điểm ở chương sau không chen trước thẻ chỉ-đọc ở chương trước', () => {
    const lessons = [{ ch: 'c1', md: c2read }, { ch: 'c2', md: c1pt }];
    const chapters = lessons.map(l => ({ ch: l.ch, cards: splitCards(l.md).cards }));
    expect(nextLearn(chapters, buildGraph(lessons), [], none)).toMatchObject({ ch: 'c1', card: 0 });
  });
});

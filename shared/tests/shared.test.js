import { describe, it, expect } from 'vitest';
import { vi } from '../i18n/vi.js';
import { en } from '../i18n/en.js';
import { parseRoute, routeOf } from '../logic/route.js';

describe('từ điển phần khung', () => {
  it('VI và EN cùng tập khoá, cùng tham số', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort());
    const slots = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
    for (const k of Object.keys(vi)) expect(slots(en[k]), k).toEqual(slots(vi[k]));
  });
});

describe('địa chỉ theo việc #/learn · #/practice · #/exam', () => {
  const CH = ['ch1', 'ch2', 'ch3'];
  it('đọc đúng địa chỉ hợp lệ', () => {
    expect(parseRoute('', CH)).toEqual({ view: 'home' });
    expect(parseRoute('#/', CH)).toEqual({ view: 'home' });
    expect(parseRoute('#/learn', CH)).toEqual({ view: 'learn' });
    expect(parseRoute('#/learn/ch3/interactive', CH)).toEqual({ view: 'learn', ch: 'ch3', sub: 'interactive' });
    expect(parseRoute('#/learn/ch2', CH)).toEqual({ view: 'learn', ch: 'ch2', sub: 'theory' });
    expect(parseRoute('#/learn/ch3/interactive/1', CH)).toEqual({ view: 'learn', ch: 'ch3', sub: 'interactive', at: 1 });
    expect(parseRoute('#/learn/ch3/interactive/x', CH)).toBeNull();
    expect(parseRoute('#/tools', CH)).toEqual({ view: 'tools' });
    expect(parseRoute('#/practice', CH)).toEqual({ view: 'practice' });
    expect(parseRoute('#/practice/ch1', CH)).toEqual({ view: 'practice', ch: 'ch1' });
    expect(parseRoute('#/practice/ch3/sop', CH)).toEqual({ view: 'practice', ch: 'ch3', kind: 'sop' });
    expect(parseRoute('#/exam', CH)).toEqual({ view: 'exam', step: 'setup' });
    expect(parseRoute('#/exam/run', CH)).toEqual({ view: 'exam', step: 'run' });
  });
  it('địa chỉ cũ #/chN/mục-con vẫn mở đúng chỗ', () => {
    expect(parseRoute('#/ch3/interactive', CH)).toEqual({ view: 'learn', ch: 'ch3', sub: 'interactive' });
    expect(parseRoute('#/ch2', CH)).toEqual({ view: 'learn', ch: 'ch2', sub: 'theory' });
    expect(parseRoute('#/ch1/practice', CH)).toEqual({ view: 'practice', ch: 'ch1' });
  });
  it('địa chỉ lạ thì trả null (nơi gọi tự về Tổng quan)', () => {
    for (const h of ['#/ch9/theory', '#/ch1/nope', '#/learn/ch9', '#/learn/ch1/nope', '#/practice/ch9', '#/exam/nope', '#/zzz']) {
      expect(parseRoute(h, CH), h).toBeNull();
    }
  });
  it('routeOf là nghịch đảo của parseRoute, và đổi địa chỉ cũ sang dạng mới', () => {
    for (const h of ['#/', '#/learn', '#/learn/ch1/example', '#/learn/ch1/example/2', '#/tools', '#/practice', '#/practice/ch2', '#/practice/ch3/xor', '#/exam', '#/exam/result']) {
      expect(routeOf(parseRoute(h, CH)), h).toBe(h);
    }
    expect(routeOf(parseRoute('#/ch1/interactive', CH))).toBe('#/learn/ch1/interactive');
  });
});

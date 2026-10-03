import { describe, it, expect } from 'vitest';
import { HELP, helpKey } from '../ui/screen-help.js';

describe('trợ giúp theo màn hình', () => {
  it('mọi thẻ có đủ vi + en, cùng số dòng, ≤ 7 dòng (vừa khung nhìn)', () => {
    for (const [k, h] of Object.entries(HELP)) {
      expect(h.vi.rows.length, k).toBe(h.en.rows.length);
      expect(h.vi.rows.length, k).toBeLessThanOrEqual(7);
      for (const lng of ['vi', 'en']) for (const [a, b] of h[lng].rows) { expect(a).toBeTruthy(); expect(b.length).toBeGreaterThan(10); }
    }
  });
  it('chọn thẻ theo route', () => {
    expect(helpKey({ view: 'home' })).toBe('home');
    expect(helpKey({ view: 'practice' })).toBe('practice');
    expect(helpKey({ view: 'practice', ch: 'ch1', kind: 'sop' })).toBe('run');
    expect(helpKey({ view: 'learn', ch: 'ch1', sub: 'theory' })).toBe('lesson');
    expect(helpKey({ view: 'learn' })).toBe('learn');
    expect(helpKey({ view: 'exam', step: 'run' })).toBe('exam');
    expect(helpKey({ view: 'free' })).toBe('free');
    expect(helpKey(null)).toBeNull();
  });
});

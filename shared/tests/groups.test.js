import { describe, it, expect } from 'vitest';
import { groupsOf, kindsFor } from '../logic/groups.js';
import * as l1 from '../../logic/src/logic/ch1-quiz.js';
import * as l2 from '../../logic/src/logic/ch2-quiz.js';
import * as l3 from '../../logic/src/logic/ch3-quiz.js';
import * as a1 from '../../linalg/src/logic/ch1-quiz.js';
import * as a2 from '../../linalg/src/logic/ch2-quiz.js';
import * as a3 from '../../linalg/src/logic/ch3-quiz.js';
import { vi as lvi } from '../../logic/src/i18n/vi/index.js';
import { en as len } from '../../logic/src/i18n/en/index.js';
import { vi as avi } from '../../linalg/src/i18n/vi/index.js';
import { en as aen } from '../../linalg/src/i18n/en/index.js';

describe('nhóm dạng (Luyện tập gọn)', () => {
  const toy = { KINDS: ['a', 'b', 'c', 'x'], GROUPS: [{ id: 'g-1', kinds: ['a', 'b'] }, { id: 'g-2', kinds: ['c', 'gone'] }] };

  it('groupsOf: theo GROUPS, bỏ dạng không có, dạng lẻ thành nhóm riêng ở cuối', () => {
    expect(groupsOf(toy)).toEqual([
      { id: 'g-1', kinds: ['a', 'b'], single: false },
      { id: 'g-2', kinds: ['c'], single: false },
      { id: 'x', kinds: ['x'], single: true },
    ]);
    expect(groupsOf({ KINDS: ['a'] })).toEqual([{ id: 'a', kinds: ['a'], single: true }]);
  });

  it('kindsFor: id nhóm, tên một dạng, hoặc không có', () => {
    expect(kindsFor(toy, 'g-1')).toMatchObject({ kinds: ['a', 'b'], group: { id: 'g-1' } });
    expect(kindsFor(toy, 'b')).toMatchObject({ kinds: ['b'], group: { id: 'g-1' } });
    expect(kindsFor(toy, 'x')).toEqual({ kinds: ['x'], group: null });
    expect(kindsFor(toy, 'nope')).toBeNull();
    expect(kindsFor(toy, undefined)).toBeNull();
  });

  const apps = [
    ['logic', [['c1q', l1], ['c2q', l2], ['c3q', l3]], lvi, len],
    ['linalg', [['c1q', a1], ['c2q', a2], ['c3q', a3]], avi, aen],
  ];
  for (const [app, banks, vi, en] of apps) {
    it(`${app}: mỗi dạng thuộc ĐÚNG một nhóm, nhóm ≤ 5 dạng, mỗi chương ≤ 4 nhóm, nhãn có ở VI/EN`, () => {
      for (const [prefix, bank] of banks) {
        const all = bank.GROUPS.flatMap(g => g.kinds);
        expect([...all].sort(), `${app} ${prefix}`).toEqual([...bank.KINDS].sort());
        expect(new Set(all).size).toBe(all.length);
        expect(bank.GROUPS.length).toBeLessThanOrEqual(4);
        for (const g of bank.GROUPS) {
          expect(g.kinds.length).toBeLessThanOrEqual(5);
          expect(vi[`${prefix}.${g.id}`], `${app} vi ${prefix}.${g.id}`).toBeTruthy();
          expect(en[`${prefix}.${g.id}`], `${app} en ${prefix}.${g.id}`).toBeTruthy();
          expect(bank.KINDS.includes(g.id)).toBe(false);          // id nhóm không trùng tên dạng (cùng chỗ trên địa chỉ)
        }
      }
    });
  }
});

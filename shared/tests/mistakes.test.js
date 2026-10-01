import { describe, it, expect } from 'vitest';
import { addMistake, dropMistake, MAX } from '../logic/mistakes.js';

describe('sổ câu sai', () => {
  it('thêm lên đầu, không trùng, gỡ được, có trần', () => {
    let l = [];
    l = addMistake(l, { kind: 'gcd', seed: 1 });
    l = addMistake(l, { kind: 'lcm', seed: 2 });
    l = addMistake(l, { kind: 'gcd', seed: 1 });
    expect(l.map(x => x.kind)).toEqual(['gcd', 'lcm']);
    expect(addMistake(l, { kind: 'gcd', seed: 1, tn: true })).toHaveLength(3);   // bản trắc nghiệm là câu khác
    expect(dropMistake(l, { kind: 'lcm', seed: 2 })).toEqual([{ kind: 'gcd', seed: 1 }]);
    for (let i = 0; i < MAX + 5; i++) l = addMistake(l, { kind: 'k', seed: i });
    expect(l).toHaveLength(MAX);
    expect(l[0].seed).toBe(MAX + 4);
  });
});

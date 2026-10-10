import { describe, it, expect } from 'vitest';
import { addMistake, dropMistake, dropKind, kindCount, MAX } from '../logic/mistakes.js';

describe('ôn lại theo dạng', () => {
  it('dropKind gỡ mọi câu của dạng (đúng chế độ); kindCount đếm dạng khác nhau', () => {
    const l = [{ kind: 'a', seed: 1 }, { kind: 'a', seed: 2 }, { kind: 'a', seed: 3, tn: true }, { kind: 'b', seed: 4 }];
    expect(dropKind(l, { kind: 'a', seed: 99 }).map(x => x.seed)).toEqual([3, 4]);
    expect(dropKind(l, { kind: 'a', seed: 99, tn: true }).map(x => x.seed)).toEqual([1, 2, 4]);
    expect(kindCount(l)).toBe(2);
  });
});

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

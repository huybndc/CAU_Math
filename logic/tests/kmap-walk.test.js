import { describe, it, expect } from 'vitest';
import { readFunction, walk, isSpec, groupVars } from '../src/logic/kmap-walk.js';
import { exprTruthTable } from '../src/logic/expr-parser.js';
import { minimizeSOP, minimizePOS, implicantMinterms } from '../src/logic/quine-mccluskey.js';
import { randomValues } from '../src/logic/random-function.js';
import { seededRandom } from '@shared/logic/shuffle.js';

describe('đọc hàm theo cả hai cách', () => {
  it('phân biệt Σm/ΠM với biểu thức (x(y + z) không phải d(…))', () => {
    expect(isSpec('Σm(1, 3)')).toBe(true);
    expect(isSpec('m(1,3) + d(0)')).toBe(true);
    expect(isSpec('ΠM(0, 2)')).toBe(true);
    expect(isSpec("x'y + wz'")).toBe(false);
    expect(isSpec('x(y + z)')).toBe(false);
  });

  it('Σm + d: ra đúng giá trị ô, không khai triển', () => {
    const r = readFunction('F = Σm(1, 3) + d(0)', 3);
    expect(r.values).toEqual([2, 1, 0, 1, 0, 0, 0, 0]);
    expect(r.expand).toBeNull();
  });

  it("biểu thức: khai triển từng term thiếu biến (x'y thiếu z ⇒ m2, m3)", () => {
    const r = readFunction("F = x'y + xyz", 3);
    expect(r.source).toBe('expr');
    expect(r.expand).toEqual([
      { term: "x'y", missing: ['z'], minterms: [2, 3] },
      { term: 'xyz', missing: [], minterms: [7] },
    ]);
    expect(r.values).toEqual([0, 0, 1, 1, 0, 0, 0, 1]);
  });

  it('tự nâng số biến theo tên biến (có w ⇒ 4 biến)', () => {
    const r = readFunction("wx + y'", 3);
    expect(r.n).toBe(4);
    expect(r.values).toEqual(exprTruthTable("wx + y'", 4));
  });

  it('biểu thức có ngoặc: vẫn đọc được qua bảng chân trị, không khai triển', () => {
    const r = readFunction('x(y + z)', 3);
    expect(r.expand).toBeNull();
    expect(r.values).toEqual(exprTruthTable('x(y + z)', 3));
  });
});

describe('các bước rút gọn', () => {
  it('ví dụ Mano 3.9 (có don’t care): essential trước, rồi nhóm thêm; kết quả trùng bộ giải', () => {
    const { values } = readFunction('Σm(1, 3, 7, 11, 15) + d(0, 2, 5)', 4);
    const s = walk(values, 4);
    expect(s.map(x => x.kind)).toEqual(['read', 'primes', ...s.filter(x => x.kind === 'group').map(() => 'group'), 'result']);
    expect(s[0].cells).toEqual([1, 3, 7, 11, 15]);
    expect(s.at(-1).expr).toBe(minimizeSOP(values, 4).expr);
    expect(s.at(-1).literals).toBe(4);
    const yz = s.find(x => x.kind === 'group' && x.term === 'yz');
    expect(yz).toMatchObject({ ess: true, drop: ['w', 'x'], keep: [{ v: 'y', value: 1 }, { v: 'z', value: 1 }] });
    expect(yz.only.length).toBeGreaterThan(0);
  });

  it('mọi hàm ngẫu nhiên: các nhóm được chọn phủ hết ô cần phủ, ô cuối cùng "còn lại" rỗng', () => {
    for (let seed = 0; seed < 80; seed++) {
      const n = 3 + (seed % 2);
      const values = randomValues(n, seed % 3 === 0, seededRandom(seed));
      for (const pos of [false, true]) {
        const s = walk(values, n, pos);
        const groups = s.filter(x => x.kind === 'group');
        const target = s[0].cells;
        const covered = new Set(groups.flatMap(g => implicantMinterms(g.imp, n)));
        expect(target.every(m => covered.has(m)), `seed ${seed} pos ${pos}`).toBe(true);
        if (groups.length) expect(groups.at(-1).left).toEqual([]);
        expect(s.at(-1).expr).toBe((pos ? minimizePOS : minimizeSOP)(values, n).expr);
        groups.filter(g => g.ess).forEach(g => expect(g.only.length).toBeGreaterThan(0));
      }
    }
  });

  it('hàm hằng: chỉ bước đọc + kết quả', () => {
    expect(walk([0, 0, 0, 0], 2).map(x => x.kind)).toEqual(['read', 'result']);
    expect(walk([1, 1, 2, 1], 2).at(-1)).toMatchObject({ kind: 'result', constant: true });
  });

  it('groupVars: biến đổi giá trị bị khử, biến giữ nguyên kèm giá trị', () => {
    // nhóm ô 0, 1, 4, 5 của 3 biến: x, z đổi · y = 0
    expect(groupVars({ v: 0, d: 0b101 }, 3)).toEqual({ drop: ['x', 'z'], keep: [{ v: 'y', value: 0 }] });
  });
});

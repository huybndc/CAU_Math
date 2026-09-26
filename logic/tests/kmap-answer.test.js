import { describe, it, expect } from 'vitest';
import { groupsToExpr } from '../src/logic/kmap-answer.js';
import { minimizeSOP, minimizePOS } from '../src/logic/quine-mccluskey.js';
import { exprTruthTable } from '../src/logic/expr-parser.js';
import { randomValues } from '../src/logic/random-function.js';
import { seededRandom } from '@shared/logic/shuffle.js';

describe('groupsToExpr: khoanh đúng các nhóm tối ưu thì ra biểu thức tương đương', () => {
  it('SOP và POS, 150 hàm ngẫu nhiên có don\'t care', () => {
    for (let seed = 1; seed <= 150; seed++) {
      const n = seed % 2 ? 3 : 4;
      const values = randomValues(n, true, seededRandom(seed));
      for (const pos of [false, true]) {
        const best = pos ? minimizePOS(values, n) : minimizeSOP(values, n);
        const expr = groupsToExpr(best.terms.map(t => t.imp), n, pos);
        const tt = exprTruthTable(expr, n);
        values.forEach((v, m) => { if (v !== 2) expect(tt[m], `seed ${seed} pos=${pos} m${m}`).toBe(v); });
      }
    }
  });
  it('chưa khoanh nhóm nào thì rỗng; nhóm trùng chỉ tính một lần', () => {
    expect(groupsToExpr([], 3)).toBe('');
    expect(groupsToExpr([{ v: 0, d: 5 }, { v: 0, d: 5 }], 3)).toBe("y'");
  });
});

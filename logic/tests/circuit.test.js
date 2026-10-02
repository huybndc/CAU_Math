import { describe, it, expect } from 'vitest';
import { parseAst, evalAst } from '../src/logic/bool-ast.js';
import { minimizeSOP } from '../src/logic/quine-mccluskey.js';
import { netFromAst, netAndOr, netNandNand, evalNet, levels } from '../src/logic/circuit.js';

const EXPRS = [["wx + yz + w'y'z'", 4], ["x'y + xy'", 2], ["(x+y)(x'+z)", 3], ["w'x'y'z' + wxyz + wx'yz'", 4], ["!(xy + z)", 3], ["x", 3], ["vwxyz + v'", 5], ["(v+w+x+y+z)'", 5]];

describe('mạch từ biểu thức', () => {
  it('mạch đúng như gõ khớp bảng chân trị', () => {
    for (const [s, n] of EXPRS) {
      const ast = parseAst(s, n), net = netFromAst(ast, n);
      for (let m = 0; m < 1 << n; m++) expect(evalNet(net, m), `${s} @${m}`).toBe(evalAst(ast, m, n));
    }
  });
  it('AND–OR và NAND–NAND của SOP tối giản khớp hàm', () => {
    for (const [vals, n] of [[[0, 1, 1, 0, 1, 0, 0, 1], 3], [[1, 1, 1, 1, 0, 0, 0, 0], 3], [[0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1], 4]]) {
      const sop = minimizeSOP(vals, n).expr;
      for (const mk of [netAndOr, netNandNand]) {
        const net = mk(sop, n);
        vals.forEach((v, m) => expect(evalNet(net, m), `${sop} @${m}`).toBe(v));
        expect(net.gates.every(g => g.ins.length <= 3)).toBe(true);
      }
    }
  });
  it('mức cổng tăng theo độ sâu', () => {
    const net = netAndOr("wx + y'z", 4);
    expect(levels(net).at(-1)).toBeGreaterThan(Math.min(...levels(net)));
  });
});

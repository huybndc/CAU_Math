import { describe, it, expect } from 'vitest';
import { graphReport, parseEdges } from '../src/logic/report-graph.js';

const ans = r => Object.fromEntries(r.answer.map(a => [a.key, a.m]));
describe('đồ thị', () => {
  it('chu trình C5: liên thông, không hai phía, có chu trình Euler', () => {
    const a = ans(graphReport('1-2, 2-3, 3-4, 4-5, 5-1'));
    expect(a['dg.conn'].startsWith('✓')).toBe(true); expect(a['dg.bip']).toBe('✗'); expect(a['dg.eulerCircuit']).toBeDefined();
  });
  it('cây đường 1-2-3: là cây, hai phía, có đường đi Euler', () => {
    const a = ans(graphReport('1-2, 2-3'));
    expect(a['dg.tree']).toBe('✓'); expect(a['dg.bip']).toBe('✓'); expect(a['dg.eulerTrail']).toBeDefined();
  });
  it('hai thành phần', () => { expect(ans(graphReport('1-2, 3-4'))['dg.conn'].startsWith('✗')).toBe(true); });
  it('cạnh sai bị từ chối', () => { expect(() => parseEdges('1~2')).toThrow(); });
});

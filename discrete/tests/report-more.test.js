import { describe, it, expect } from 'vitest';
import { quantReport } from '../src/logic/report-quant.js';
import { stateReport, invariants, parseMoves } from '../src/logic/report-state.js';
import { graphReport, parseEdges } from '../src/logic/report-graph.js';

const ans = r => Object.fromEntries(r.answer.map(a => [a.key, a.m]));
describe('lượng từ', () => {
  it('x<y trên {1,2,3}: ∀∃ sai (3 không có y lớn hơn), ∃∀ sai', () => {
    const a = ans(quantReport('1, 2, 3', 'lt'));
    expect(a['dq.AE'].startsWith('F')).toBe(true); expect(a['dq.EA'].startsWith('F')).toBe(true); expect(a['dq.EE'].startsWith('T')).toBe(true);
  });
  it('x=y: ∀∃ đúng nhưng ∃∀ sai trên miền ≥ 2 phần tử', () => {
    const a = ans(quantReport('1, 2', 'eq'));
    expect(a['dq.AE'].startsWith('T')).toBe(true); expect(a['dq.EA'].startsWith('F')).toBe(true);
  });
});
describe('bất biến', () => {
  const moves = '2,-1; 1,-2; 1,1; -3,0';
  it('tìm được x − y ≡ 0 (mod 3) và chứng minh (0,2) không tới được', () => {
    expect(invariants(parseMoves(moves)).some(v => v.m === 3 && v.p === 1 && v.q === 2)).toBe(true);   // x + 2y ≡ x − y (mod 3)
    expect(stateReport(moves, '0,0', '0,2').answer[0].key).toBe('dst.never');
  });
  it('đích tới được thì ra đường đi', () => {
    const r = stateReport(moves, '0,0', '3,0');
    expect(r.answer[0].key).toBe('dst.reach');
  });
});
describe('đồ thị', () => {
  it('chu trình C5: liên thông, không hai phía, có chu trình Euler', () => {
    const a = ans(graphReport('1-2, 2-3, 3-4, 4-5, 5-1'));
    expect(a['dg.conn'].startsWith('T')).toBe(true); expect(a['dg.bip']).toBe('F'); expect(a['dg.eulerCircuit']).toBeDefined();
  });
  it('cây đường 1-2-3: là cây, hai phía, có đường đi Euler', () => {
    const a = ans(graphReport('1-2, 2-3'));
    expect(a['dg.tree']).toBe('T'); expect(a['dg.bip']).toBe('T'); expect(a['dg.eulerTrail']).toBeDefined();
  });
  it('hai thành phần', () => { expect(ans(graphReport('1-2, 3-4'))['dg.conn'].startsWith('F')).toBe(true); });
  it('cạnh sai bị từ chối', () => { expect(() => parseEdges('1~2')).toThrow(); });
});

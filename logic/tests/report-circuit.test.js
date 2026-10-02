import { describe, it, expect } from 'vitest';
import { rippleReport, implReport } from '../src/logic/report-circuit.js';

describe('cộng nối tiếp', () => {
  it('7 + 6 (4 bit) tràn; 6 − 3 không', () => {
    const o = rippleReport('0111', '0110', 'add'); expect(o.answer[0].m.startsWith('1101')).toBe(true); expect(o.answer[3].key).toBe('cc.overflow'); expect(o.check()).toBe(true);
    const s = rippleReport('0110', '0011', 'sub'); expect(s.answer[0].m.startsWith('0011')).toBe(true); expect(s.answer[3].key).toBe('cc.noOverflow');
  });
  it('mọi cặp 4 bit: số học đúng khi không tràn, check nhất quán', () => {
    for (let a = 0; a < 16; a++) for (let b = 0; b < 16; b++) for (const op of ['add', 'sub']) expect(rippleReport(a.toString(2).padStart(4, '0'), b.toString(2).padStart(4, '0'), op).check()).toBe(true);
  });
});
describe('thực hiện hàm', () => {
  it('Σm(1,2,6,7) bằng MUX 4→1: I0=z, I1=z\', I2=0, I3=1', () => {
    const r = implReport('Σm(1,2,6,7)', 3);
    expect(r.answer.at(-1).m).toContain('I0(00) = z'); expect(r.answer.at(-1).m).toContain("I1(01) = z'"); expect(r.answer.at(-1).m).toContain('I2(10) = 0'); expect(r.answer.at(-1).m).toContain('I3(11) = 1');
  });
});

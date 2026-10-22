/* Đề như thật (Logic, phỏng đoán): đáp án kiểm bằng phép tính viết riêng (bảng 7 đoạn, cộng bit, mã excess-3), công thức dựng được. */
import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { buildMock } from '@shared/logic/mock-exam.js';
import { LOGIC_MOCK } from '../src/logic/mock-exam.js';
import { gradeCircuit } from '../src/logic/mock-check.js';

const ex = buildMock(LOGIC_MOCK, 9);
const part = (q, p) => ex.questions[q].parts[p];
const bitsOf = (m, n) => Array.from({ length: n }, (_, k) => (m >> (n - 1 - k)) & 1);
const lit = (s, names, bits) => { const v = bits[names.indexOf(s[0])]; return s.endsWith("'") ? 1 - v : v; };
const evalSop = (expr, names, bits) => expr.split(' + ').some(t => [...t.matchAll(/[a-z]'?/g)].every(m => lit(m[0], names, bits)));
const SEG = { a: '0235 6789', f: '0456 89', e: '0268' };           // bảng chuẩn chép tay: đoạn nào sáng ở chữ số nào

describe('đề Logic', () => {
  it('3 câu, 200 điểm, 60 phút; chương 3–4; cùng seed ⇒ cùng đề', () => {
    expect(ex.questions.map(q => q.parts.length)).toEqual([3, 3, 3]);
    expect([ex.total, ex.minutes]).toEqual([200, 60]);
    ex.questions.forEach(q => q.refs.forEach(x => expect(x.sec).toMatch(/^[34]\./)));
    expect(buildMock(LOGIC_MOCK, 9)).toEqual(ex);
  });
  it('mọi công thức KaTeX dựng được, dấu $ cặp đủ, không NaN/undefined, không ",;"', () => {
    for (const str of ex.questions.flatMap(q => [q.stem, ...q.parts.flatMap(p => [p.q, ...p.a])])) {
      expect(str).not.toMatch(/undefined|NaN|,;|;;/);
      const pieces = str.split('$');
      expect(pieces.length % 2, str.slice(0, 50)).toBe(1);
      pieces.forEach((m, i) => { if (i % 2) katex.renderToString(m, { throwOnError: true }); });
    }
  });
  it('7 đoạn: bảng đúng chuẩn (6 sáng a, 9 sáng d→f không đổi), 10–15 là don\'t-care; SOP đúng mọi ô bắt buộc', () => {
    const f = part(0, 0).facts, s = part(0, 1).facts;
    for (const k of ['a', 'f', 'e']) {
      const on = [...SEG[k].replace(' ', '')].map(Number);
      f[k].forEach((v, m) => expect(v, `${k}${m}`).toBe(m >= 10 ? 2 : on.includes(m) ? 1 : 0));
      f[k].forEach((v, m) => { if (v !== 2) expect(evalSop(s.sop[k], s.names, bitsOf(m, 4)) ? 1 : 0, `${k} m${m}`).toBe(v); });
    }
  });
  it('mạch cộng: S và C khớp phép cộng bit; SOP đúng', () => {
    const f = part(1, 0).facts, s = part(1, 1).facts;
    for (let m = 0; m < 8; m++) {
      const [x, y, z] = bitsOf(m, 3), sum = x + y + z;
      expect(f.S[m]).toBe(sum & 1); expect(f.C[m]).toBe(sum >> 1);
      expect(evalSop(s.sopS, s.names, [x, y, z]) ? 1 : 0).toBe(sum & 1);
      expect(evalSop(s.sopC, s.names, [x, y, z]) ? 1 : 0).toBe(sum >> 1);
    }
  });
  it('excess-3: đầu ra = chữ số + 3 (4 bit); SOP đúng mọi ô bắt buộc', () => {
    const f = part(2, 0).facts.outs, s = part(2, 1).facts;
    for (let d = 0; d < 10; d++) {
      const code = ['E_3', 'E_2', 'E_1', 'E_0'].map(k => f[k][d]).join('');
      expect(parseInt(code, 2), `d${d}`).toBe(d + 3);
      for (const k of ['E_3', 'E_2', 'E_1', 'E_0']) expect(evalSop(s.sop[k], s.names, bitsOf(d, 4)) ? 1 : 0).toBe(f[k][d]);
    }
    for (let m = 10; m < 16; m++) expect(f.E_3[m]).toBe(2);
  });
  it('mọi đầu ra có hình mẫu và spec kiểm mạch; đáp án chuẩn tự chấm ĐÚNG', () => {
    const outs = ex.questions.flatMap(q => q.parts.filter(p => p.checks));
    expect(outs.length).toBe(3);
    outs.forEach(p => { expect(p.figs.length).toBe(p.checks.length); p.figs.forEach(g => expect(g.terms.length).toBeGreaterThan(0)); });
    for (const p of outs) p.checks.forEach((c, i) => {
      const text = p.figs[i].terms.map(t => t.join('')).join(' + ');
      const g = gradeCircuit(c, text);
      expect(g.ok, `${c.label}: ${text}`).toBe(true);
    });
  });
});

describe('gradeCircuit (mạch vẽ tay)', () => {
  const spec = { names: ['x', 'y', 'z'], values: [0, 0, 1, 1, 0, 1, 2, 1], refLits: 4 };   // m2,m3,m5,m7 =1; m6 = don't-care
  it('đúng hàm + tối giản ⇒ đúng; don\'t-care tuỳ ý', () => {
    expect(gradeCircuit(spec, "x'y + xz").ok).toBe(true);
    expect(gradeCircuit(spec, "x'y + xz + xy").functional).toBe(true);    // phủ m6 (don't-care) vẫn đúng hàm
  });
  it('thiếu hay thừa một ô bắt buộc ⇒ sai, nêu ô sai', () => {
    const miss = gradeCircuit(spec, "x'y");
    expect(miss.ok).toBe(false); expect(miss.wrong).toEqual([5, 7]);
    const extra = gradeCircuit(spec, "x'y + xz + x'y'z'");
    expect(extra.ok).toBe(false); expect(extra.wrong).toEqual([0]);
  });
  it('đúng hàm nhưng không tối giản ⇒ không đạt chuẩn; rỗng/sai cú pháp được báo riêng', () => {
    const big = gradeCircuit(spec, "x'yz + x'yz' + xy'z + xyz");
    expect(big.functional).toBe(true); expect(big.minimal).toBe(false); expect(big.ok).toBe(false);
    expect(gradeCircuit(spec, '  ').empty).toBe(true);
    expect(gradeCircuit(spec, "x'y +").error).toBeTruthy();
  });
});

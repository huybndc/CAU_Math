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
    expect(ex.questions.map(q => q.parts.length)).toEqual([3, 5, 4]);
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
  it('bộ cộng BCD: FA khớp phép cộng bit; C = v + wx + wy đúng trên mọi cặp chữ số và cin (cộng thập phân độc lập)', () => {
    const f = part(1, 0).facts;
    for (let m = 0; m < 8; m++) {
      const [x, y, z] = bitsOf(m, 3), sum = x + y + z;
      expect(f.S[m]).toBe(sum & 1); expect(f.C[m]).toBe(sum >> 1);
      expect(evalSop(f.sopS, f.names, [x, y, z]) ? 1 : 0).toBe(sum & 1);
      expect(evalSop(f.sopC, f.names, [x, y, z]) ? 1 : 0).toBe(sum >> 1);
    }
    const { expr, corr } = part(1, 3).facts;
    for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++) for (let cin = 0; cin <= 1; cin++) {
      const z = a + b + cin, c = evalSop(expr, ['v', 'w', 'x', 'y', 'z'], bitsOf(z, 5)) ? 1 : 0;
      expect(corr[z], `sum ${z}`).toBe(z >= 10 ? 1 : 0);
      expect(c, `${a}+${b}+${cin}`).toBe(z >= 10 ? 1 : 0);
      expect(c * 10 + ((z + (c ? 6 : 0)) & 15), `${a}+${b}+${cin}`).toBe(z);        // cộng 0110 khi C = 1 ra đúng BCD
    }
  });
  it('MUX: dữ liệu I0..I3 tái dựng đúng hàm F; DEMUX: D_k = x khi yz = k', () => {
    for (let s = 1; s <= 60; s++) {
      const { mins, data, f } = buildMock(LOGIC_MOCK, s * 977).questions[2].parts[2].facts;
      for (let m = 0; m < 8; m++) {
        const d = data[m >> 1], z = m & 1;
        expect(d === '0' ? 0 : d === '1' ? 1 : d === 'z' ? z : 1 - z, `seed ${s} m${m}`).toBe(f[m]);
        expect(mins.includes(m)).toBe(f[m] === 1);
      }
      expect(data.includes('z') && data.includes("z'")).toBe(true);
    }
    const { dExpr } = part(2, 3).facts;
    dExpr.forEach((e, k) => { for (let m = 0; m < 8; m++) expect(evalSop(e, ['x', 'y', 'z'], bitsOf(m, 3)) ? 1 : 0).toBe(m === 4 + k ? 1 : 0); });
  });
  it('mọi đầu ra có hình mẫu và spec kiểm mạch; đáp án chuẩn tự chấm ĐÚNG', () => {
    const outs = ex.questions.flatMap(q => q.parts.filter(p => p.checks && p.figs));
    expect(outs.length).toBe(3);
    outs.forEach(p => { expect(p.figs.length).toBe(p.checks.length); p.figs.forEach(g => expect(g.terms.length).toBeGreaterThan(0)); });
    expect(ex.questions[1].parts[4].figs[0].boxes.length).toBe(2);
    const c = part(1, 3).checks[0];                                  // C của bộ cộng BCD: đáp án chuẩn tự chấm đúng, thiếu số hạng thì sai
    expect(gradeCircuit(c, 'v + wx + wy').ok).toBe(true);
    expect(gradeCircuit(c, 'v + wx').ok).toBe(false);
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

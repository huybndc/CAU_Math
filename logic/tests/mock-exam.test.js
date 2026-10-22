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
  it('4 câu, 200 điểm, 60 phút; chương 3–4; cùng seed ⇒ cùng đề', () => {
    expect(ex.questions.map(q => q.parts.length)).toEqual([2, 2, 2, 3]);
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
  it('excess-3: đầu ra = chữ số + 3 (4 bit); SOP đúng mọi ô bắt buộc', () => {
    const f = part(1, 0).facts.outs, s = part(1, 1).facts;
    for (let d = 0; d < 10; d++) {
      const code = ['E_3', 'E_2', 'E_1', 'E_0'].map(k => f[k][d]).join('');
      expect(parseInt(code, 2), `d${d}`).toBe(d + 3);
      for (const k of ['E_3', 'E_2', 'E_1', 'E_0']) expect(evalSop(s.sop[k], s.names, bitsOf(d, 4)) ? 1 : 0).toBe(f[k][d]);
    }
    for (let m = 10; m < 16; m++) expect(f.E_3[m]).toBe(2);
  });
  it('bộ cộng BCD: C = v + wx + wy đúng trên mọi cặp chữ số và cin (cộng thập phân độc lập), cộng 0110 ra đúng BCD', () => {
    const { expr, corr } = part(2, 0).facts;
    for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++) for (let cin = 0; cin <= 1; cin++) {
      const z = a + b + cin, c = evalSop(expr, ['v', 'w', 'x', 'y', 'z'], bitsOf(z, 5)) ? 1 : 0;
      expect(corr[z], `sum ${z}`).toBe(z >= 10 ? 1 : 0);
      expect(c, `${a}+${b}+${cin}`).toBe(z >= 10 ? 1 : 0);
      expect(c * 10 + ((z + (c ? 6 : 0)) & 15), `${a}+${b}+${cin}`).toBe(z);
    }
    expect(part(2, 1).figs[0].boxes.length).toBe(2);
  });
  it('MUX: dữ liệu I0..I3 tái dựng đúng hàm F trên 60 mã đề, có cả z và z\'', () => {
    for (let s = 1; s <= 60; s++) {
      const { mins, data, f } = buildMock(LOGIC_MOCK, s * 977).questions[3].parts[1].facts;
      for (let m = 0; m < 8; m++) {
        const d = data[m >> 1], z = m & 1;
        expect(d === '0' ? 0 : d === '1' ? 1 : d === 'z' ? z : 1 - z, `seed ${s} m${m}`).toBe(f[m]);
        expect(mins.includes(m)).toBe(f[m] === 1);
      }
      expect(data.includes('z') && data.includes("z'")).toBe(true);
    }
  });
  it('đúng 2 câu K-map (7 đoạn, Excess-3; không vẽ) và 2 câu vẽ một mạch (bộ cộng BCD, MUX); đáp án chuẩn tự chấm ĐÚNG', () => {
    const text = ex.questions.flatMap(q => q.parts.flatMap(p => p.a)).join(' ');
    expect(text.match(/\\begin\{array\}\{c\|cccc\}/g).length).toBe(3 + 4);
    expect(ex.questions.map(q => q.parts.filter(p => p.figs).length)).toEqual([0, 0, 1, 1]);
    expect(gradeCircuit(part(2, 0).checks[0], 'v + wx + wy').ok).toBe(true);
    expect(gradeCircuit(part(2, 0).checks[0], 'v + wx').ok).toBe(false);
    for (const [q, p, keys] of [[0, 1, 'afe'], [1, 1, ['E_3', 'E_2', 'E_1', 'E_0']]]) {
      const pt = part(q, p);
      pt.checks.forEach((c, i) => expect(gradeCircuit(c, pt.facts.sop[keys[i]]).ok, c.label).toBe(true));
    }
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

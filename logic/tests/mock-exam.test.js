/* Đề thi thử (Logic, phỏng đoán): đáp án kiểm bằng phép tính viết riêng (bảng 7 đoạn, cộng bit, mã excess-3), công thức dựng được. */
import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { buildMock } from '@shared/logic/mock-exam.js';
import { LOGIC_MOCK } from '../src/logic/mock-exam.js';

const ex = buildMock(LOGIC_MOCK, 9);
const part = (q, p) => ex.questions[q].parts[p];
const bitsOf = (m, n) => Array.from({ length: n }, (_, k) => (m >> (n - 1 - k)) & 1);
const lit = (s, names, bits) => { const v = bits[names.indexOf(s[0])]; return s.endsWith("'") ? 1 - v : v; };
const evalSop = (expr, names, bits) => expr.split(' + ').some(t => [...t.matchAll(/[a-z]'?/g)].every(m => lit(m[0], names, bits)));
const SEEDS = Array.from({ length: 40 }, (_, i) => i * 131 + 7);
const qOf = kind => {
  for (const seed of SEEDS) for (const q of buildMock(LOGIC_MOCK, seed).questions) if (q.parts[0].facts.kind === kind) return q;
  throw new Error(`không mã đề nào có dạng ${kind}`);
};
// bảng mã chép tay theo sách (Mano Table 1.5): chữ số 0–9
const CODE_TABLE = {
  'code-E': ['0011', '0100', '0101', '0110', '0111', '1000', '1001', '1010', '1011', '1100'],
  'code-G': ['0000', '0001', '0011', '0010', '0110', '0111', '0101', '0100', '1100', '1101'],
  'code-D': ['0000', '0001', '0010', '0011', '0100', '1011', '1100', '1101', '1110', '1111'],
};
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
  it('chuyển mã: excess-3 / Gray / 2421 đúng bảng chép tay; SOP đúng mọi ô bắt buộc', () => {
    const seen = new Set();
    for (const seed of SEEDS) {
      const q = buildMock(LOGIC_MOCK, seed).questions[1], f = q.parts[0].facts, s = q.parts[1].facts;
      const L = f.kind.slice(-1), ks = [3, 2, 1, 0].map(n => `${L}_${n}`);
      seen.add(f.kind);
      for (let d = 0; d < 10; d++) {
        expect(ks.map(k => f.outs[k][d]).join(''), `${f.kind} d${d}`).toBe(CODE_TABLE[f.kind][d]);
        for (const k of ks) expect(evalSop(s.sop[k], s.names, bitsOf(d, 4)) ? 1 : 0, `${f.kind} ${k} d${d}`).toBe(f.outs[k][d]);
      }
      for (let m = 10; m < 16; m++) ks.forEach(k => expect(f.outs[k][m]).toBe(2));
    }
    expect([...seen].sort()).toEqual(['code-D', 'code-E', 'code-G']);
  });
  it('bộ cộng BCD: C = v + wx + wy đúng trên mọi cặp chữ số và cin (cộng thập phân độc lập), cộng 0110 ra đúng BCD', () => {
    const q = qOf('bcd');
    const { expr, corr } = q.parts[0].facts;
    for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++) for (let cin = 0; cin <= 1; cin++) {
      const z = a + b + cin, c = evalSop(expr, ['v', 'w', 'x', 'y', 'z'], bitsOf(z, 5)) ? 1 : 0;
      expect(corr[z], `sum ${z}`).toBe(z >= 10 ? 1 : 0);
      expect(c, `${a}+${b}+${cin}`).toBe(z >= 10 ? 1 : 0);
      expect(c * 10 + ((z + (c ? 6 : 0)) & 15), `${a}+${b}+${cin}`).toBe(z);
    }
    expect(q.parts[1].figs[0].boxes.length).toBe(2);
  });
  it('bộ so sánh 2 bit: bảng và biểu thức E, G, L đúng với so sánh số (tính độc lập)', () => {
    const q = qOf('cmp'), { rows, expr } = q.parts[0].facts;
    const ev = (e, v) => e.split(' + ').some(t => t.split(' ').every(l => (l.endsWith("'") ? 1 - v[l.slice(0, -1)] : v[l])));
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
      const v = { A1: a >> 1, A0: a & 1, B1: b >> 1, B0: b & 1 };
      v.x1 = +(v.A1 === v.B1); v.x0 = +(v.A0 === v.B0);
      const want = { E: a === b, G: a > b, L: a < b };
      expect(rows[a * 4 + b].slice(4).join(''), `${a}?${b}`).toBe(['E', 'G', 'L'].map(k => +want[k]).join(''));
      for (const k of ['E', 'G', 'L']) expect(ev(expr[k], v), `${k} ${a}?${b}`).toBe(want[k]);
    }
    expect(q.parts[1].figs[0].gates.map(g => g.op).sort().join()).toBe('AND,AND,AND,AND,AND,OR,OR,XNOR,XNOR');
  });
  it('MUX: dữ liệu I0..I3 tái dựng đúng hàm F trên 60 mã đề, có cả z và z\'', () => {
    for (let s = 1; s <= 60; s++) {
      const q3 = buildMock(LOGIC_MOCK, s * 977).questions[3];
      if (q3.parts[0].facts.kind === 'dec') continue;
      const { mins, data, f } = q3.parts[1].facts;
      for (let m = 0; m < 8; m++) {
        const d = data[m >> 1], z = m & 1;
        expect(d === '0' ? 0 : d === '1' ? 1 : d === 'z' ? z : 1 - z, `seed ${s} m${m}`).toBe(f[m]);
        expect(mins.includes(m)).toBe(f[m] === 1);
      }
      expect(data.includes('z') && data.includes("z'")).toBe(true);
    }
  });
  it('decoder: D_i là minterm i; cổng OR nối đúng các đầu ra của từng hàm; bảng F đúng', () => {
    for (const seed of SEEDS) {
      const q = buildMock(LOGIC_MOCK, seed).questions[3];
      if (q.parts[0].facts.kind !== 'dec') continue;
      const { f1, f2 } = q.parts[1].facts;
      expect(f1.join()).not.toBe(f2.join());
      [f1, f2].forEach(f => expect(f.length >= 2 && f.length <= 5).toBe(true));
      const minLine = q.parts[0].a[1];
      for (let i = 0; i < 8; i++) expect(minLine).toContain(`D_${i} = ${'xyz'.split('').map((c, k) => c + ((i >> (2 - k)) & 1 ? '' : "'")).join('')}`);
      const ors = q.parts[2].figs[0].gates;
      expect(ors.map(g => g.op)).toEqual(['OR', 'OR']);
      const fig = q.parts[2].figs[0];
      // nhãn chân vào của từng cổng OR: chữ canh phải, ngay trái cổng, trong chiều cao cổng
      const insOf = g => fig.texts.filter(t => t.a === 'end' && t.x === g.x - 60 && t.y > g.y - 50 && t.y < g.y + 90).map(t => '₀₁₂₃₄₅₆₇'.indexOf(t.t.slice(1)));
      expect(ors.map(insOf)).toEqual([f1, f2]);
      expect(q.parts[1].a[1]).toContain(`F_1 = ${f1.map(m => `D_${m}`).join(' + ')}`);
    }
    qOf('dec');
  });
  it('đề đa dạng: 10 mã đề liên tiếp cho ít nhất 6 tổ hợp dạng', () => {
    const combo = s => buildMock(LOGIC_MOCK, s).questions.map(q => q.parts[0].facts.kind ?? '7seg').join('/');
    expect(new Set(Array.from({ length: 10 }, (_, s) => combo(s + 1))).size).toBeGreaterThanOrEqual(6);
  });
  it('đúng 2 câu K-map (không vẽ) và 2 câu vẽ một mạch, ở mọi mã đề', () => {
    for (const seed of SEEDS) {
      const e = buildMock(LOGIC_MOCK, seed), text = e.questions.slice(0, 2).flatMap(q => q.parts.flatMap(p => p.a)).join(' ');
      expect(text.match(/\\begin\{array\}\{c\|cccc\}/g).length).toBe(3 + 4);
      expect(e.questions.map(q => q.parts.filter(p => p.figs).length)).toEqual([0, 0, 1, 1]);
      expect([e.total, e.minutes]).toEqual([200, 60]);
    }
  });
});

describe('mục sách trích dẫn khớp mục lục Mano 6th', () => {
  // Chép tay từ mục lục sách (chương 3–4) để bắt số mục sai như §3.6 cho don't-care (đúng là §3.5).
  const TOC = { '3.2': 'map method', '3.3': 'four-variable', '3.5': "don't-care", '4.4': 'design procedure', '4.5': 'adder', '4.6': 'decimal adder', '4.8': 'magnitude comparator', '4.9': 'decoder', '4.11': 'multiplexer' };
  it('mỗi ref có số mục trong mục lục và tên khớp', () => {
    for (const s of SEEDS) buildMock(LOGIC_MOCK, s).questions.forEach(q => q.refs.forEach(r => {
      expect(TOC[r.sec], `§${r.sec}`).toBeTruthy();
      expect(r.title.toLowerCase(), `§${r.sec}`).toContain(TOC[r.sec]);
    }));
  });
});

describe('thang chấm theo bước (chấm bài làm giấy)', () => {
  it('mọi ý có thang, tổng thang = điểm của ý, ở nhiều mã đề', () => {
    for (let seed = 0; seed < 30; seed++) for (const q of buildMock(LOGIC_MOCK, seed).questions) for (const p of q.parts) {
      expect(p.rubric?.length, `${seed} ${q.no}${p.label}`).toBeGreaterThan(1);
      expect(p.rubric.reduce((s, [n]) => s + n, 0), `${seed} ${q.no}${p.label}`).toBe(p.pts);
      for (const [, s] of p.rubric) for (const f of s.split('$').filter((_, i) => i % 2)) expect(() => katex.renderToString(f, { throwOnError: true })).not.toThrow();
    }
  });
});

/* Đề như thật (Logic, phỏng đoán): đáp án kiểm bằng phép tính viết riêng (đánh giá biểu thức, cộng bit), công thức dựng được. */
import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { buildMock } from '@shared/logic/mock-exam.js';
import { LOGIC_MOCK } from '../src/logic/mock-exam.js';

const SEEDS = Array.from({ length: 120 }, (_, i) => i * 7727 + 11);
const part = (ex, q, p) => ex.questions[q].parts[p].facts;
const bitsOf = (m, n) => Array.from({ length: n }, (_, k) => (m >> (n - 1 - k)) & 1);
const lit = (s, names, bits) => { const v = bits[names.indexOf(s[0])]; return s.endsWith("'") ? 1 - v : v; };
const evalSop = (expr, names, bits) => expr.split(' + ').some(t => [...t.matchAll(/[a-z]'?/g)].every(m => lit(m[0], names, bits)));
const evalPos = (expr, names, bits) => [...expr.matchAll(/\(([^)]*)\)/g)].every(g => g[1].split(' + ').some(l => lit(l.trim(), names, bits)));
const care = (values, i) => values[i] !== 2;

describe('đề Logic', () => {
  it('3 câu, 100 điểm, 60 phút; chương 3–4 (không có chương 1–2); cùng seed ⇒ cùng đề', () => {
    const ex = buildMock(LOGIC_MOCK, 9);
    expect(ex.questions.map(q => q.parts.length)).toEqual([3, 4, 3]);
    expect([ex.total, ex.minutes]).toEqual([100, 60]);
    ex.questions.forEach(q => q.refs.forEach(x => expect(x.sec).toMatch(/^[34]\./)));
    expect(buildMock(LOGIC_MOCK, 9)).toEqual(ex);
  });
  it('mọi công thức KaTeX dựng được, dấu $ cặp đủ, không NaN/undefined', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LOGIC_MOCK, s);
      for (const str of ex.questions.flatMap(q => [q.stem, ...q.parts.flatMap(p => [p.q, ...p.a])])) {
        expect(str).not.toMatch(/undefined|NaN/);
        const pieces = str.split('$');
        expect(pieces.length % 2, str.slice(0, 50)).toBe(1);
        pieces.forEach((m, i) => { if (i % 2) katex.renderToString(m, { throwOnError: true }); });
      }
    }
  });
  it('câu 1: SOP và POS tối giản đúng hàm trên mọi ô bắt buộc (không gán sai ô 1/0), không đụng ô don\'t-care sai', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LOGIC_MOCK, s), { values, pis } = part(ex, 0, 0), b = part(ex, 0, 1), c = part(ex, 0, 2);
      expect(pis.length).toBeGreaterThan(0);
      values.forEach((v, i) => {
        if (!care(values, i)) return;
        expect(evalSop(b.sop, b.names, bitsOf(i, 4)) ? 1 : 0, `sop seed ${s} m${i}`).toBe(v);
        expect(evalPos(c.pos, c.names, bitsOf(i, 4)) ? 1 : 0, `pos seed ${s} m${i}`).toBe(v);
      });
    }
  });
  it('câu 2: SOP đúng hàm; decoder = các minterm 1; MUX tái dựng đúng bảng chân trị', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LOGIC_MOCK, s), a = part(ex, 1, 0), d = part(ex, 1, 1), m = part(ex, 1, 2);
      a.values.forEach((v, i) => expect(evalSop(a.sop, a.names, bitsOf(i, 3)) ? 1 : 0).toBe(v));
      expect(d.ones).toEqual(a.values.map((v, i) => (v === 1 ? i : -1)).filter(i => i >= 0));
      a.values.forEach((v, i) => {                                     // chọn I_(xy), ngõ dữ liệu theo z
        const sel = m.mux[i >> 1], z = i & 1;
        expect(sel === '0' ? 0 : sel === '1' ? 1 : sel === 'z' ? z : 1 - z, `mux seed ${s} m${i}`).toBe(v);
      });
    }
  });
  it('câu 3: cộng, tràn số và trừ khớp phép tính số học riêng', () => {
    const sg = x => (x >= 8 ? x - 16 : x);
    for (const s of SEEDS) {
      const ex = buildMock(LOGIC_MOCK, s), a = part(ex, 2, 0), b = part(ex, 2, 1), c = part(ex, 2, 2);
      const sumVal = parseInt(a.sum, 2), tot = a.a + a.b;
      expect(sumVal).toBe(tot % 16);
      expect(a.carries[4]).toBe(tot >= 16 ? 1 : 0);
      const trueSigned = sg(a.a) + sg(a.b);
      expect(b.v).toBe(trueSigned < -8 || trueSigned > 7 ? 1 : 0);
      const diff = (a.a - a.b + 16) % 16, trueDiff = sg(a.a) - sg(a.b);
      expect(parseInt(c.sum, 2)).toBe(diff);
      expect(c.v).toBe(trueDiff < -8 || trueDiff > 7 ? 1 : 0);
    }
  });
});

describe('chuỗi đề không có ký tự thừa do thoát sai (\\; bị nuốt thành ;)', () => {
  it('không có ",;" hay ";;" trong đề và đáp án', () => {
    for (const s of SEEDS.slice(0, 40)) {
      const text = JSON.stringify(buildMock(LOGIC_MOCK, s), (k, v) => (k === 'facts' ? undefined : v));
      expect(text, `seed ${s}`).not.toMatch(/,;|;;/);
    }
  });
});

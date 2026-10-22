/* Đề như thật (Linear Algebra): kiểm đáp án bằng phép tính viết riêng (không dùng lại bộ giải của app). */
import { describe, it, expect } from 'vitest';
import { buildMock, seedCode, parseSeed, newSeed } from '@shared/logic/mock-exam.js';
import { mat } from '../src/logic/mock-tex.js';
import katex from 'katex';
import { LINALG_MOCK } from '../src/logic/mock-exam.js';

const mm = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
const mv = (A, x) => A.map(r => r.reduce((s, v, k) => s + v * x[k], 0));
const T = A => A[0].map((_, j) => A.map(r => r[j]));
const near = (A, B) => A.length === B.length && A.every((r, i) => (Array.isArray(r) ? r : [r]).every((v, j) => Math.abs(v - (Array.isArray(B[i]) ? B[i][j] : B[i])) < 1e-9));
const det3 = M => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const SEEDS = Array.from({ length: 150 }, (_, i) => i * 7919 + 3);
const part = (ex, q, p) => ex.questions[q].parts[p].facts;

describe('khung đề', () => {
  it('cùng seed ⇒ cùng đề và đáp án; khác seed ⇒ khác', () => {
    expect(buildMock(LINALG_MOCK, 123)).toEqual(buildMock(LINALG_MOCK, 123));
    expect(JSON.stringify(buildMock(LINALG_MOCK, 123))).not.toBe(JSON.stringify(buildMock(LINALG_MOCK, 124)));
  });
  it('tổng điểm 162, điểm từng câu theo đề thật, thời lượng 97 phút', () => {
    const ex = buildMock(LINALG_MOCK, 5);
    expect(ex.questions.map(q => q.pts)).toEqual([15, 10, 25, 20, 20, 12, 15, 25, 20]);
    expect([ex.total, ex.minutes]).toEqual([162, 97]);
  });
  it('mỗi câu ghi mục sách (chương khớp số đầu của mục) và có tên sách', () => {
    const ex = buildMock(LINALG_MOCK, 9);
    expect(ex.book).toMatch(/Strang/);
    expect(LINALG_MOCK.refs).toHaveLength(LINALG_MOCK.makers.length);
    for (const q of ex.questions) {
      expect(q.refs.length).toBeGreaterThan(0);
      for (const r of q.refs) { expect(r.sec).toMatch(/^[123]\.\d$/); expect(r.title.length).toBeGreaterThan(3); }
    }
  });
  it('công thức: dấu $ cặp đủ và KaTeX dựng được mọi đoạn (không lỗi cú pháp)', () => {
    for (const s of SEEDS.slice(0, 60)) {
      const ex = buildMock(LINALG_MOCK, s);
      const strings = ex.questions.flatMap(q => [q.stem, ...q.parts.flatMap(p => [p.q, ...p.a])]);
      for (const str of strings) {
        const pieces = str.split('$');
        expect(pieces.length % 2, `seed ${s}: ${str.slice(0, 60)}`).toBe(1);
        pieces.forEach((m, i) => { if (i % 2) katex.renderToString(m, { throwOnError: true }); });
      }
    }
  });
  it('lời giải khử của câu 3(a) theo đúng thứ tự sách: không đổi hàng, ba phép cộng ứng với ℓ21, ℓ31, ℓ32', () => {
    for (const s of SEEDS) {
      const lines = buildMock(LINALG_MOCK, s).questions[2].parts[0].a.filter(l => l.includes('quad'));
      expect(lines.some(l => l.includes('leftrightarrow')), `seed ${s}`).toBe(false);
      expect(lines).toHaveLength(3);
    }
  });
  it('mã seed: chuyển qua lại, từ chối mã sai', () => {
    for (const s of [0, 1, 35, 60466175]) expect(parseSeed(seedCode(s))).toBe(s);
    expect(seedCode(newSeed(() => 0.999999))).toHaveLength(5);
    expect(parseSeed('zz zz')).toBeNull();
    expect(parseSeed('')).toBeNull();
  });
  it('mọi chuỗi in ra không có undefined / NaN / Infinity', () => {
    for (const s of SEEDS) {
      const text = JSON.stringify(buildMock(LINALG_MOCK, s), (k, v) => (k === 'facts' ? undefined : v));
      expect(text, `seed ${s}`).not.toMatch(/undefined|NaN|Infinity/);
    }
  });
});

describe('đáp án đúng với phép tính riêng', () => {
  it('câu 1: tích vô hướng, góc, vector đơn vị', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), a = part(ex, 0, 0), b = part(ex, 0, 1), c = part(ex, 0, 2);
      expect(a.answer).toBe(1 - a.k ** 2);
      const d = (x, y) => x.reduce((t, v, i) => t + v * y[i], 0);
      expect(Math.acos(d(b.u, b.v) / Math.sqrt(d(b.u, b.u) * d(b.v, b.v))) * 180 / Math.PI).toBeCloseTo(b.deg, 6);
      expect(c.n * c.n).toBe(d(c.w, c.w));
    }
  });
  it('câu 2: tổ hợp tuyến tính', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), f = part(ex, 1, 0), g = part(ex, 1, 1);
      f.xs.forEach((x, i) => expect(mv(f.A, x)).toEqual(f.bs[i]));
      expect(mv(f.A, g.x)).toEqual(f.b);
    }
  });
  it('câu 3: khử, E, hỏng tạm thời và vĩnh viễn', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), a = part(ex, 2, 0), b = part(ex, 2, 1), c = part(ex, 2, 2);
      expect(mv(a.A0, a.x)).toEqual(a.bv);
      const U = mm(b.E, a.A0);
      expect([U[1][0], U[2][0], U[2][1]].map(v => Math.abs(v) < 1e-9)).toEqual([true, true, true]);
      expect([U[0][0], U[1][1], U[2][2]].map((v, i) => Math.abs(v - a.pivots[i]) < 1e-9)).toEqual([true, true, true]);
      expect(near(mm(b.E32, mm(b.E31, b.E21)), b.E)).toBe(true);
      expect(Math.abs(det3(c.Aperm))).toBeLessThan(1e-9);
      expect(Math.abs(det3(c.A))).toBeGreaterThan(0.5);
      expect(Math.abs(c.A[1][1] - c.A[1][0] * c.A[0][1])).toBeLessThan(1e-9);   // trụ 2 = 0 sau bước 1 ⇒ hỏng tạm thời
      expect(Math.abs(c.A[2][1] - c.A[2][0] * c.A[0][1])).toBeGreaterThan(0);     // có số khác 0 bên dưới ⇒ đổi hàng được
      expect(mm(c.P, I3)).toEqual(c.P);
    }
  });
  it('câu 4: nghịch đảo, nghiệm, (PA)⁻¹', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), a = part(ex, 3, 0), b = part(ex, 3, 1), c = part(ex, 3, 2);
      expect(near(mm(a.A, a.inverse), I3)).toBe(true);
      expect(mv(a.A, b.x)).toEqual(b.b);
      expect(near(mm(mm(c.P, a.A), c.PAinv), I3)).toBe(true);
    }
  });
  it('câu 5: A = LDLᵀ và PB = LU', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), a = part(ex, 4, 0), b = part(ex, 4, 1);
      expect(near(mm(mm(a.L, a.D), T(a.L)), a.A)).toBe(true);
      expect(near(mm(a.L, a.U), a.A)).toBe(true);
      expect(near(a.A, T(a.A))).toBe(true);
      expect(near(mm(b.P, b.B), mm(b.L, b.U))).toBe(true);
      expect(b.L.every((r, i) => r.every((v, j) => (j > i ? v === 0 : i === j ? v === 1 : true)))).toBe(true);
      expect(b.U.every((r, i) => r.every((v, j) => j >= i || Math.abs(v) < 1e-9))).toBe(true);
      expect(b.P.flat().reduce((t, v) => t + v, 0)).toBe(3);
      expect(near(b.P, I3)).toBe(false);                                            // thật sự phải đổi hàng
    }
  });
  it('câu 6: mặt phẳng và Ax = b', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), a = part(ex, 5, 0), b = part(ex, 5, 1);
      const n = [1, a.p, a.q];
      expect(n.reduce((t, v, i) => t + v * a.u[i], 0)).toBe(0);
      expect(n.reduce((t, v, i) => t + v * a.v[i], 0)).toBe(0);
      expect(mv(a.A, b.x)).toEqual(b.b);
    }
  });
  it('câu 7: A = uvᵀ, A², A¹⁰', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), a = part(ex, 6, 0), b = part(ex, 6, 1);
      expect(near(a.A, mm(a.u.map(x => [x]), [a.v]))).toBe(true);
      expect(near(a.A2, mm(a.A, a.A))).toBe(true);
      let P = a.A; for (let i = 1; i < 10; i++) P = mm(P, a.A);
      expect(near(b.A10, P)).toBe(true);
    }
  });
  it('câu 8: U, R, hạng, nghiệm đặc biệt, cột tự do', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), a = part(ex, 7, 0), b = part(ex, 7, 1), c = part(ex, 7, 2), d = part(ex, 7, 3);
      expect(b.rank).toBe(2);
      a.R.slice(0, 2).forEach((row, k) => a.R.forEach((r2, i) => expect(r2[b.pc[k]]).toBe(i === k ? 1 : 0)));
      expect(a.R[2].every(v => v === 0)).toBe(true);
      a.A.forEach(row => expect(near([row], [b.pc.reduce((t, c0, k) => t.map((v, j) => v + row[c0] * a.R[k][j]), [0, 0, 0, 0])])).toBe(true));
      expect(c.special).toHaveLength(2);
      c.special.forEach(v => { expect(mv(a.A, v).every(x => Math.abs(x) < 1e-9)).toBe(true); expect(v.some(x => x !== 0)).toBe(true); });
      b.fc.forEach(f => a.A.forEach(row => expect(row[f]).toBeCloseTo(b.pc.reduce((t, c0, k) => t + d.R[k][f] * row[c0], 0), 9)));
    }
  });
  it('câu 9: điều kiện có nghiệm, nghiệm riêng và nghiệm tổng quát', () => {
    for (const s of SEEDS) {
      const ex = buildMock(LINALG_MOCK, s), a = part(ex, 8, 0), b = part(ex, 8, 1), c = part(ex, 8, 2);
      expect(a.c[0] * b.b[0] + a.c[1] * b.b[1] + a.c[2] * b.b[2]).toBeCloseTo(0, 9);
      for (const x of [[1, 0, 0], [0, 1, 0], [0, 0, 1], [2, -1, 3]]) expect(a.c.reduce((t, v, i) => t + v * mv(a.A, x)[i], 0)).toBeCloseTo(0, 9);
      expect(near(mv(a.A, b.particular), b.b)).toBe(true);
      expect(mv(a.A, b.special[0]).every(v => Math.abs(v) < 1e-9)).toBe(true);
      expect(a.c.reduce((t, v, i) => t + v * c.bad[i], 0)).not.toBe(0);
    }
  });
  it('chữ đáp án in ra khớp số liệu đã kiểm (không lệch giữa facts và dòng đáp án)', () => {
    const SHOWN = [[2, 1, 'E'], [3, 0, 'inverse'], [3, 2, 'PAinv'], [4, 0, 'U'], [4, 1, 'U'], [4, 1, 'L'], [4, 1, 'P'], [6, 0, 'A2'], [6, 1, 'A10'], [7, 0, 'U'], [7, 0, 'R']];
    for (const s of SEEDS.slice(0, 40)) {
      const ex = buildMock(LINALG_MOCK, s);
      for (const [q, p, key] of SHOWN) expect(ex.questions[q].parts[p].a.join('\n'), `${q}.${p}.${key}`).toContain(mat(ex.questions[q].parts[p].facts[key]));
    }
  });
});

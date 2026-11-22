/* Đề thi thử cuối kỳ (Logic): chỉ chương 5, vì giữa kỳ đã thi chương 1–4 và cuối kỳ không ra lại (Huy, 2026-11-22). Oracle từng dạng ở mock-seq.test.js. */
import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { buildMock } from '@shared/logic/mock-exam.js';
import { LOGIC_MOCK } from '../src/logic/mock-exam.js';

const ex = buildMock(LOGIC_MOCK, 9);
const SEEDS = Array.from({ length: 40 }, (_, i) => i * 131 + 7);

describe('đề Logic', () => {
  it('4 câu, 200 điểm, 60 phút; chỉ chương 5 ở mọi mã đề (không ra lại dạng giữa kỳ); cùng seed ⇒ cùng đề; có ghi chú chấm', () => {
    for (const seed of SEEDS) {
      const e = buildMock(LOGIC_MOCK, seed);
      expect(e.questions.map(q => q.pts), `${seed}`).toEqual([40, 40, 60, 60]);
      expect([e.total, e.minutes]).toEqual([200, 60]);
      e.questions.forEach(q => { expect(q.refs.length).toBeGreaterThan(0); q.refs.forEach(x => expect(x.sec, `${seed}`).toMatch(/^5\./)); });
    }
    expect(ex.note).toMatch(/all or nothing/);
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
  it('đề đa dạng: 10 mã đề liên tiếp cho ít nhất 6 tổ hợp dạng', () => {
    const combo = s => buildMock(LOGIC_MOCK, s).questions.map(q => q.parts[0].facts.kind).join('/');
    expect(new Set(Array.from({ length: 10 }, (_, s) => combo(s + 1))).size).toBeGreaterThanOrEqual(6);
  });
  it('thứ tự dễ đến khó: flip-flop, rút gọn trạng thái, phân tích, thiết kế hoặc bộ đếm, ở mọi mã đề', () => {
    for (const seed of SEEDS) {
      const e = buildMock(LOGIC_MOCK, seed);
      expect(e.questions[0].parts[0].facts.kind).toMatch(/^ff-/);
      expect(e.questions[1].parts[0].facts.kind).toMatch(/^reduce-/);
      expect(e.questions[2].parts[0].facts.kind).toMatch(/^seq-/);
      expect(e.questions[3].parts[0].facts.kind).toMatch(/^(design|counter)-/);
      expect([e.total, e.minutes]).toEqual([200, 60]);
    }
  });
});

describe('mục sách trích dẫn khớp mục lục Mano 6th', () => {
  // Chép tay từ mục lục sách (chương 5) để bắt số mục sai.
  const TOC = { '5.3': 'latches', '5.4': 'flip-flops', '5.5': 'analysis of clocked sequential circuits', '5.7': 'state reduction and assignment', '5.8': 'design procedure' };
  it('mỗi ref có số mục trong mục lục và tên khớp', () => {
    for (const s of SEEDS) buildMock(LOGIC_MOCK, s).questions.forEach(q => q.refs.forEach(r => {
      expect(TOC[r.sec], `§${r.sec}`).toBeTruthy();
      expect(r.title.toLowerCase(), `§${r.sec}`).toContain(TOC[r.sec]);
    }));
  });
});

describe('thang chấm: không điểm từng phần', () => {
  it('mỗi ý đúng một dòng chấm (đúng hết hoặc 0), điểm dòng = điểm của ý, ở nhiều mã đề', () => {
    for (let seed = 0; seed < 30; seed++) for (const q of buildMock(LOGIC_MOCK, seed).questions) for (const p of q.parts) {
      expect(p.rubric?.length, `${seed} ${q.no}${p.label}`).toBe(1);
      expect(p.rubric[0][1]).toMatch(/^all of: /);
      expect(p.rubric.reduce((s, [n]) => s + n, 0), `${seed} ${q.no}${p.label}`).toBe(p.pts);
      for (const [, s] of p.rubric) for (const f of s.split('$').filter((_, i) => i % 2)) expect(() => katex.renderToString(f, { throwOnError: true })).not.toThrow();
    }
  });
});

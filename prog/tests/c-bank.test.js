/* Ngân hàng C (lô thử tuần 7): đáp án là kết quả clang thật. Test chạy lại clang trên máy và so với c-bank.json. */
import { describe, it, expect } from 'vitest';
import { variants, TEMPLATES } from '../src/logic/c-templates.js';
import { runC, hashSrc } from '../../scripts/gen-c-bank.mjs';
import BANK from '../src/content/c-bank.json';
import { buildMock } from '@shared/logic/mock-exam.js';
import { PROG_MOCK, SCOPE, plan } from '../src/logic/mock-exam.js';

const byId = Object.fromEntries(BANK.map(b => [b.id, b]));

describe('ngân hàng C sinh bằng clang', () => {
  it('mọi biến thể có trong c-bank.json, mã nguồn không đổi từ lần sinh (lệch ⇒ npm run gen:c)', () => {
    const vs = variants();
    expect(BANK.length).toBe(vs.length);
    for (const v of vs) expect(byId[v.id]?.hash, v.id).toBe(hashSrc(v.src));
  });
  it('100% câu đoán kết quả: chạy lại clang ra đúng stdout đã lưu', () => {
    for (const v of variants().filter(x => x.kind === 'predict')) {
      const r = runC(v.src);
      expect(r.ok, v.id).toBe(true);
      expect(byId[v.id].out, v.id).toBe(r.out);
      expect(r.out.trim().length, v.id).toBeGreaterThan(0);
    }
  }, 120000);
  it('câu tìm lỗi: bản sai lỗi đúng dòng đã lưu, bản sửa biên dịch được', () => {
    for (const v of variants().filter(x => x.kind === 'find')) {
      const r = runC(v.src);
      expect(r.ok, v.id).toBe(false);
      expect(r.line, v.id).toBe(byId[v.id].line);
      expect(runC(v.fixSrc).ok, v.id).toBe(true);
    }
  }, 120000);
});

describe('đề thi thử Lập trình C', () => {
  it('20 câu × 5 điểm, 120 phút; đáp án lấy đúng từ ngân hàng; không lặp biến thể trong một đề', () => {
    for (let seed = 0; seed < 30; seed++) {
      const ex = buildMock(PROG_MOCK, seed);
      expect([ex.questions.length, ex.total, ex.minutes]).toEqual([20, 100, 120]);
    }
    const ex = buildMock(PROG_MOCK, 3);
    for (const q of ex.questions) expect(q.code).toMatch(/^ 1 {2}#include <stdio.h>/);
  });
  it('mỗi câu: đáp án in ra khớp c-bank.json; 20 biến thể khác nhau', () => {
    for (let seed = 0; seed < 30; seed++) {
      const seen = new Set();
      PROG_MOCK.makers.forEach((make, i) => {
        const q = make(() => ((seed * 7 + i * 13) % 97) / 97);
        const b = byId[q.facts.id];
        seen.add(q.facts.id);
        if (q.facts.kind === 'predict') expect(q.parts[0].a[0]).toBe(`Output: ${b.out.trimEnd()}`);
        else expect(q.parts[0].a[0]).toMatch(new RegExp(`^Line ${b.line}\\. Fix: `));
        expect(q.parts[0].rubric.reduce((s, [n]) => s + n, 0)).toBe(q.parts[0].pts);
      });
      expect(seen.size, `seed ${seed}`).toBe(20);
    }
  });
  it('tỉ lệ phạm vi là hằng số SCOPE: 80% tuần ≥ 9, 20% nền; chưa có lô sau giữa kỳ thì toàn nền', () => {
    expect(SCOPE).toEqual({ questions: 20, postMidShare: 0.8, postMidFrom: 9 });
    const fake = [...TEMPLATES, { id: 'w9-a', week: 9 }, { id: 'w10-b', week: 10 }];
    const p = plan(fake);
    expect(p.filter(s => s.template.week >= 9).length).toBe(16);
    expect(p.filter(s => s.template.week < 9).length).toBe(4);
    expect(plan().every(s => s.template.week < 9)).toBe(true);
  });
});

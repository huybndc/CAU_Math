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
  it('câu nhiều ý: chạy lại clang khớp kết quả đã lưu; ý nào cũng có đáp án', () => {
    for (const v of variants().filter(x => x.kind === 'multi')) {
      const r = runC(v.src), b = byId[v.id];
      if (v.badSrc) expect(runC(v.badSrc, { san: true }).crashed, v.id).toBe(true);
      expect(r.ok, v.id).toBe(b.ok);
      if (r.ok) expect(r.out, v.id).toBe(b.out); else expect([r.line, r.why], v.id).toEqual([b.line, b.why]);
      for (const pt of v.parts(b)) expect(pt.a.every(l => l && !l.includes('undefined')), v.id).toBe(true);
    }
  }, 120000);
  it('bộ giải độc lập: tổng mảng, khoảng cách², đếm ký tự, x >> 4 khớp clang', () => {
    const out = id => byId[id].out.trim();
    TEMPLATES.find(t => t.id === 'fill-ptr-sum').params.forEach(([xs], i) => expect(Number(out(`fill-ptr-sum-${i}`))).toBe(xs.reduce((a, b) => a + b, 0)));
    TEMPLATES.find(t => t.id === 'fill-struct-dist').params.forEach(([a, b, c, d], i) => expect(Number(out(`fill-struct-dist-${i}`))).toBe((a - c) ** 2 + (b - d) ** 2));
    TEMPLATES.find(t => t.id === 'write-count-char').params.forEach(([w, c], i) => expect(Number(out(`write-count-char-${i}`))).toBe([...w].filter(x => x === c).length));
    TEMPLATES.find(t => t.id === 'mcq-bitops').params.forEach(([a, b, x], i) => {
      const v = variants().find(y => y.id === `mcq-bitops-${i}`), [p1, p2] = v.parts(byId[v.id]);
      expect(p1.a[0]).toContain(`(value ${a & b})`);
      expect(p2.a[0]).toContain('0x' + (x >> 4).toString(16).toUpperCase().padStart(2, '0'));
      expect(new Set(byId[v.id].out.trim().split('\n')[1].split(' ')).size).toBe(4);
    });
  });
});

describe('đề thi thử Lập trình C', () => {
  it('20 câu lớn, mỗi ý 2–4 điểm và chấm cả ý; có đủ 5 dạng', () => {
    for (let seed = 0; seed < 30; seed++) {
      const ex = buildMock(PROG_MOCK, seed);
      expect(ex.questions.length).toBe(20);
      for (const q of ex.questions) for (const p of q.parts) expect(p.pts >= 2 && p.pts <= 4 && p.rubric.length === 1).toBe(true);
    }
    const kinds = new Set(PROG_MOCK.makers.map((m, i) => { const f = m(() => 0).facts; return f.type ?? f.kind; }));
    for (const k of ['mcq', 'fill', 'compile', 'write', 'predict', 'find']) expect(kinds.has(k), k).toBe(true);
  });
  it('mỗi câu: đáp án in ra khớp c-bank.json; 20 biến thể khác nhau', () => {
    for (let seed = 0; seed < 30; seed++) {
      const seen = new Set();
      PROG_MOCK.makers.forEach((make, i) => {
        const q = make(() => ((seed * 7 + i * 13) % 97) / 97);
        const b = byId[q.facts.id];
        seen.add(q.facts.id);
        if (q.facts.kind === 'multi') return;
        if (q.facts.kind === 'predict') expect(q.parts[0].a[0]).toBe(`Output: ${b.out.trimEnd()}`);
        else expect(q.parts[0].a[0]).toMatch(new RegExp(`^Line ${b.line}\\. Fix: `));
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

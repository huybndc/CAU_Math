/* Ngân hàng C: đáp án là kết quả clang thật. Test chạy lại clang trên máy và so với c-bank.json. */
import { describe, it, expect } from 'vitest';
import { variants, TEMPLATES } from '../src/logic/c-templates.js';
import { runC, hashSrc, probeProblems } from '../../scripts/gen-c-bank.mjs';
import BANK from '../src/content/c-bank.json';
import { buildMock } from '@shared/logic/mock-exam.js';
import { PROG_MOCK, SCOPE, BLUEPRINT, plan, groupOf } from '../src/logic/mock-exam.js';

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
      const r = runC(v.src, { input: v.input }), b = byId[v.id];
      expect(probeProblems(v), v.id).toEqual([]);
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

describe('bộ giải độc lập: lô tuần 6–9 khớp clang', () => {
  const out = id => byId[id].out.trim();
  const each = (id, check) => TEMPLATES.find(t => t.id === id).params.forEach((p, i) => expect(out(`${id}-${i}`), `${id}-${i}`).toBe(check(p)));
  it('tuần 9', () => {
    each('callby', ([v, k]) => `${v} ${v + k}`);
    each('array-sizeof', ([xs]) => `${xs.length * 8} 8 ${xs.length}`);
    each('row-ptr', ([x, k]) => `2 3 ${x[5] + k} ${x[3] + k}`);
    each('dangling', ([v]) => String(v * 2));
    each('mcq-variadic', ([a, b, c]) => ((+a + +b + +c) / 3).toFixed(2));
    each('fill-array-len', ([xs]) => xs.reduce((s, x) => s + x, 0).toFixed(1));
    each('fill-swap', ([x, y]) => `${y} ${x}`);
    each('write-sum-all', ([xs]) => String(xs.reduce((s, x) => s + x, 0)));
    each('write-raise', ([a, b, k]) => `Python ${a + k} C ${b + k}`);
  });
  it('tuần 10', () => {
    const ops = (a, b) => [a + b, a - b, a * b];
    const tri = n => n * (n + 1) / 2;
    each('fp-pick', ([a, b, pick]) => pick.map(k => ops(a, b)[k]).join(' '));
    each('void-cast', ([a, d, k]) => `${a + k} ${(d * 2).toFixed(2)}`);
    each('file-mode', ([m, n1, n2]) => m === 'a' ? `${n1 + n2} ${tri(n1) + 10 * tri(n2)}` : `${n2} ${10 * tri(n2)}`);
    each('file-log-mode', ([xs]) => `${xs.length} ${xs.reduce((s, x) => s + x, 0)}`);
    each('fill-fp-array', ([a, b]) => ops(a, b).join('\n'));
    each('fill-file-write', ([x, y]) => String(x + y));
    each('write-add-2d', ([x, k]) => `${x[0] + k} ${x[4] + k} ${x[5] + k}`);
    each('write-fold', ([xs]) => `${xs.reduce((s, x) => s + x, 0)} ${xs.reduce((s, x) => s * x, 1)}`);
    // The learner sees the wrong program. It must run and print only the last score, as the question says.
    TEMPLATES.find(t => t.id === 'file-log-mode').params.forEach(([xs], i) => {
      const v = variants().find(y => y.id === `file-log-mode-${i}`);
      expect(runC(v.show).out.trim()).toBe(`1 ${xs.at(-1)}`);
    });
  });
  it('tuần 6–7', () => {
    each('str-eq', ([x, y]) => `0 1 ${x === y ? 1 : 0}`);
    each('mcq-scanf-string', ([s]) => s.split(' ')[0]);
    each('mcq-ptr-vs-2d', ([n]) => `24 ${3 * n}`);
    each('fill-scanf-string', ([n, s]) => `${s} ${n}`);
    each('fill-ptr-array', ([xs]) => `${xs.length} ${xs.join('').length}`);
    each('fill-struct-string', ([name]) => `same ${name}`);
    each('write-my-len', ([w]) => String(w.length));
    each('write-same', ([x, y, z]) => `${x === y ? 1 : 0} ${x === z ? 1 : 0}`);
    each('write-best', xs => xs.reduce((m, s) => (s[1] > m[1] ? s : m))[0]);
  });
  it('câu trắc nghiệm: bốn lựa chọn khác nhau, đúng một lựa chọn là đáp án', () => {
    for (const v of variants().filter(x => x.type === 'mcq')) for (const p of v.parts(byId[v.id])) {
      const opts = p.q.split(/[①②③④]/).slice(1).map(s => s.trim());
      expect(new Set(opts).size, `${v.id}: ${p.q}`).toBe(4);
      const [mark, ...rest] = p.a[0].split(' '), text = rest.join(' ');
      const shown = opts['①②③④'.indexOf(mark)];
      expect(shown, `${v.id}: ${p.a[0]}`).toBeDefined();
      if (!text.startsWith('(value')) expect(shown).toBe(text);
    }
  });
});

describe('đề thi thử Lập trình C', () => {
  it('only the four real midterm types: fill, predict, find/fix, write (no mcq, no compile)', () => {
    expect(Object.keys(BLUEPRINT).sort()).toEqual(['fill', 'fix', 'predict', 'write']);
    for (const pool of plan()) for (const t of pool) expect(['fill', 'predict', 'find', 'findrun', 'write']).toContain(t.type ?? t.kind);
  });
  const seeds = Array.from({ length: 30 }, (_, i) => i * 7919);
  it('20 câu lớn × 5 điểm = 100; 40 ý, mỗi ý 2–3 điểm; không còn ghi "all or nothing" ở từng ý', () => {
    for (const seed of seeds) {
      const ex = buildMock(PROG_MOCK, seed);
      expect(ex.questions.length).toBe(20);
      expect(ex.total).toBe(100);
      expect(ex.questions.flatMap(q => q.parts).length).toBe(40);
      for (const q of ex.questions) {
        expect(q.pts).toBe(5);
        expect(q.source).toMatch(/^Week \d+, /);
        for (const p of q.parts) { expect(p.pts >= 2 && p.pts <= 3, q.stem).toBe(true); expect(p.rubric).toBeUndefined(); }
      }
    }
    expect(buildMock(PROG_MOCK, 1).note).toMatch(/all or nothing/);
  });
  it('mọi mẫu đều đủ 5 điểm với mọi biến thể; có đủ các dạng', () => {
    for (const v of variants()) {
      const b = byId[v.id];
      if (v.kind === 'multi') expect(v.parts(b).reduce((s, p) => s + p.pts, 0), v.id).toBe(5);
      if (v.kind === 'predict') expect(v.follow(b).a.length, v.id).toBeGreaterThan(0);
    }
    const types = new Set(TEMPLATES.map(t => t.type ?? t.kind));
    for (const k of ['fill', 'findrun', 'write', 'predict', 'find']) expect(types.has(k), k).toBe(true);
  });
  it('đáp án in ra khớp c-bank.json; trong một đề không lặp mẫu; các mã đề khác nhau', () => {
    for (const seed of seeds) {
      const ids = PROG_MOCK.makers.map((make, i) => {
        let n = seed * 31 + i;
        const q = make(() => { n = (n * 7 + 13) % 97; return n / 97; });
        const b = byId[q.facts.id];
        if (q.facts.kind === 'predict') expect(q.parts[0].a[0]).toBe(`Output: ${b.out.trimEnd()}`);
        if (q.facts.kind === 'find') expect(q.parts[0].a[0]).toBe(`Line ${b.line}: ${b.why}`);
        return q.facts.id;
      });
      expect(new Set(ids.map(id => byId[id].template)).size, `seed ${seed}`).toBe(20);
    }
    const codes = seeds.map(seed => new Set(buildMock(PROG_MOCK, seed).questions.map(q => q.code)));
    const shared = codes.slice(1).map(c => [...codes[0]].filter(x => c.has(x)).length);
    expect(Math.max(...shared)).toBeLessThan(14);
  });
  it('mọi ô có mẫu; đúng số câu theo nhóm; tỉ lệ tuần ≥ 9 là SCOPE khi đủ mẫu, còn lại lấy nền', () => {
    expect(SCOPE).toEqual({ postMidShare: 0.8, postMidFrom: 9 });
    expect(Object.values(BLUEPRINT).reduce((a, b) => a + b, 0)).toBe(20);
    const pools = plan();
    expect(pools.length).toBe(20);
    for (const pool of pools) expect(pool.length).toBeGreaterThan(0);
    for (const [group, n] of Object.entries(BLUEPRINT)) expect(pools.filter(p => groupOf(p[0]) === group).length, group).toBe(n);
    const want = Object.keys(BLUEPRINT).reduce((s, g) => s + Math.min(4, TEMPLATES.filter(t => groupOf(t) === g && t.week >= 9).length), 0);
    expect(pools.filter(p => p[0].week >= 9).length).toBe(want);
    const fake = [...TEMPLATES, ...Object.keys(BLUEPRINT).flatMap(g => Array.from({ length: 6 }, (_, i) => ({ id: `${g}-${i}`, kind: 'multi', type: g, week: 10 })))];
    expect(plan(fake).filter(p => p[0].week >= 9).length).toBe(16);
    const early = [...TEMPLATES.filter(t => t.week < 9), ...Object.keys(BLUEPRINT).flatMap(g => [0, 1].map(i => ({ id: `${g}-old-${i}`, kind: 'multi', type: g === 'fix' ? 'find' : g, week: 5 })))];
    expect(plan(early).every(p => p.length > 0 && p[0].week < 9)).toBe(true);
  });
});

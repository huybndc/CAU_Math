/* Ngân hàng C: đáp án là kết quả clang thật. Test chạy lại clang trên máy và so với c-bank.json. */
import { describe, it, expect } from 'vitest';
import { variants, TEMPLATES } from '../src/logic/c-templates.js';
import { runC, hashSrc, probeProblems } from '../../scripts/gen-c-bank.mjs';
import BANK from '../src/content/c-bank.json';
import { buildMock } from '@shared/logic/mock-exam.js';
import { PROG_MOCK, SCOPE, BLUEPRINT, plan, groupOf, partsOf, levelOf, allocate } from '../src/logic/mock-exam.js';

const byId = Object.fromEntries(BANK.map(b => [b.id, b]));

describe('ngân hàng C sinh bằng clang', () => {
  it('mọi biến thể có trong c-bank.json, mã nguồn không đổi từ lần sinh (lệch ⇒ npm run gen:c)', () => {
    const vs = variants();
    expect(BANK.length).toBe(vs.length);
    for (const v of vs) expect(byId[v.id]?.hash, v.id).toBe(hashSrc(v.src));
  });
  const ofKind = k => TEMPLATES.filter(t => t.kind === k).map(t => t.id);
  it.each(ofKind('predict'))('100%% câu đoán kết quả %s: chạy lại clang ra đúng stdout đã lưu', id => {
    for (const v of variants().filter(x => x.template === id)) {
      const r = runC(v.src);
      expect(r.ok, v.id).toBe(true);
      expect(byId[v.id].out, v.id).toBe(r.out);
      expect(r.out.trim().length, v.id).toBeGreaterThan(0);
    }
  }, 120000);
  it.each(ofKind('find'))('câu tìm lỗi %s: bản sai lỗi đúng dòng đã lưu, bản sửa biên dịch được', id => {
    for (const v of variants().filter(x => x.template === id)) {
      const r = runC(v.src);
      expect(r.ok, v.id).toBe(false);
      expect(r.line, v.id).toBe(byId[v.id].line);
      expect(runC(v.fixSrc).ok, v.id).toBe(true);
    }
  }, 120000);
  // One test per template, so the worker can report between clang runs (one long test timed out the worker RPC).
  it.each(ofKind('multi'))('câu nhiều ý %s: chạy lại clang khớp kết quả đã lưu; ý nào cũng có đáp án', id => {
    for (const v of variants().filter(x => x.template === id)) {
      const r = runC(v.src, { input: v.input }), b = byId[v.id];
      expect(probeProblems(v), v.id).toEqual([]);
      if (v.logic) expect(runC(v.badSrc, { input: v.input }).out, v.id).toBe(b.badOut);
      else if (v.badSrc) expect(runC(v.badSrc, { san: true }).crashed, v.id).toBe(true);
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

describe('bộ giải độc lập: mẫu khó D73 khớp clang', () => {
  const out = id => byId[id].out.trim();
  const each = (id, check, field = 'out') => TEMPLATES.find(t => t.id === id).params.forEach((p, i) => expect(byId[`${id}-${i}`][field].trim(), `${id}-${i}`).toBe(check(p)));
  const trunc = Math.trunc;
  it('trắc nghiệm và đoán kết quả', () => {
    each('mcq-postinc', ([a, b]) => `${a} ${b + 1} ${a}`);
    each('mcq-sizeof-param', ([xs]) => `${xs.length} 2`);
    each('mcq-int-div', ([a, b]) => `${trunc(a / b).toFixed(2)} ${(a / b).toFixed(2)} ${a % b}`);
    each('mcq-char-arith', ([k]) => `${String.fromCharCode(65 + k)} ${k} ${String.fromCharCode(98 + k)}`);
    each('pred-ptr-walk', ([w]) => { const s = [...w]; s[1] = 'Z'; s[3] = s[0]; return `${s.join('')} ${s[3]} 3`; });
    each('pred-digit-sum', ([s]) => { const d = [...s].filter(c => c >= '0' && c <= '9').map(Number), t = d.reduce((a, b) => a + b, 0); return `${d.length} ${t} ${trunc(t / d.length)} ${(t / d.length).toFixed(1)}`; });
    each('pred-fp-loop', ([x, s]) => { const f = [(a, b) => a + b, (a, b) => a - b, (a, b) => a * b]; for (let i = 0; i < 4; i++) x = f[(i + s) % 3](x, i + 1); return String(x); });
    each('pred-swap-trap', ([x, y]) => `${y + trunc(x / 2)} ${x}`);
    each('pred-chain-struct', xs => {
      const a = xs.map(([n, q]) => ({ n, q })), use = (it, k) => { it.q -= k; it.n = it.n[0].toUpperCase() + it.n.slice(1); };
      use(a[1], 1); const l1 = `${a[1].n} ${a[1].q}`;
      use(a[0], trunc(a[2].q / 2)); const l2 = `${a[0].n} ${a[0].q}`;
      use(a[2], a[1].q); return [l1, l2, `${a[2].n} ${a[2].q} 2`].join('\n');
    });
    each('pred-chain-file', ([n, k]) => { const sum = k * n * (n + 1) / 2; return `${n} ${trunc(sum / n)}\n${n + 1} ${sum}\n-1`; });
    each('pred-chain-str', ([x, y]) => {
      const a = (x + y).slice(0, y.length), p = a.slice(1);
      return `${x + y} ${(x + y).length} 16\n${a} ${a === y ? 1 : 0}\n${String.fromCharCode(p.charCodeAt(0) + 1)} ${p} ${p.length}`;
    });
  });
  it('điền chỗ trống, tìm lỗi, viết hàm', () => {
    each('fill-void-print', ([n, d]) => `${n} ${d.toFixed(1)}`);
    each('fill-sort-names', ([xs]) => [...xs].sort().join(' '));
    each('fill-file-upper', ([t]) => `${[...t].filter(c => c >= 'A' && c <= 'Z').length} ${[...t].filter(c => c === '\n').length}`);
    each('fill-fp-apply', ([xs]) => xs.map(x => 2 * x - 1).join(' '));
    const avgLine = (xs, m) => `${m.toFixed(2)} ${xs.filter(x => x > m).length}`;
    each('fix-avg-intdiv', ([xs]) => avgLine(xs, xs.reduce((a, b) => a + b, 0) / xs.length));
    each('fix-avg-intdiv', ([xs]) => avgLine(xs, trunc(xs.reduce((a, b) => a + b, 0) / xs.length)), 'badOut');
    each('fix-strcmp-find', ([key, ss]) => `${key} ${ss.find(s => s[0] === key)[1]}`);
    each('fix-strcmp-find', () => 'none', 'badOut');
    each('write-person', ([n, age, k]) => `${n} ${age + k}`);
    each('write-rev', ([w]) => { const r = [...w].reverse().join(''); return `${r}\n${r[0]}${[...r.slice(1)].reverse().join('')}`; });
    each('write-file-sum', ([xs]) => `${xs.reduce((a, b) => a + b, 0)}\n-1`);
    each('write-row-sum', ([m]) => `${m.map(r => r.reduce((a, b) => a + b, 0)).join(' ')} \n${m[1][2] + m[0][0]}`);
  });
  it('mỗi mẫu khó trộn ít nhất 2 ý: có hàm ngoài main, struct, mảng 2 chiều, tệp hoặc bẫy kiểu dữ liệu', () => {
    for (const t of TEMPLATES.filter(x => x.level >= 2)) {
      const src = t.src(t.params[0]);
      const ideas = [/\b(?!main\b)\w+\([^;]*\)\s*\{/, /struct|typedef/, /\[\d*\]\[/, /FILE/, /\*\w+\+\+|\+\+\w*\)|\*\+\+/, /strcmp|strcat|strcpy|scanf/, /\(double\)|%zu|sizeof|'[A-Za-z0-9]'/, /void \*|\(\*\w+\)/, /\((const )?\w+ \*\w+[,)]/]
        .filter(re => re.test(src)).length;
      expect(ideas, t.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('đề thi thử Lập trình C (D73)', () => {
  const seeds = Array.from({ length: 30 }, (_, i) => i * 7919);
  const typeOf = q => (q.facts.kind === 'multi' ? q.facts.type : q.facts.kind);
  it('20 câu, 35–40 ý, mỗi câu 1–3 ý, tổng 100 điểm; có trắc nghiệm', () => {
    for (const seed of seeds) {
      const ex = buildMock(PROG_MOCK, seed), n = ex.questions.flatMap(q => q.parts).length;
      expect(ex.questions.length).toBe(20);
      expect(ex.total).toBe(100);
      expect(n >= 35 && n <= 40, `seed ${seed}: ${n} parts`).toBe(true);
      for (const q of ex.questions) {
        expect(q.parts.length >= 1 && q.parts.length <= 3).toBe(true);
        expect(q.source).toMatch(/^Week \d+, /);
        for (const p of q.parts) expect(p.pts >= 1 && p.pts <= 4, q.stem).toBe(true);
      }
    }
    expect(BLUEPRINT.mcq.length).toBeGreaterThanOrEqual(3);
    expect(buildMock(PROG_MOCK, 1).note).toMatch(/all or nothing/);
  });
  it('allocate: tổng đúng 100, ý khó không ít điểm hơn ý dễ', () => {
    const slots = [{ parts: 2, level: 1 }, { parts: 3, level: 3 }, { parts: 1, level: 2 }];
    const pts = allocate(slots, 20);
    expect(pts.flat().reduce((a, b) => a + b, 0)).toBe(20);
    expect(Math.min(...pts[1])).toBeGreaterThanOrEqual(Math.max(...pts[0]));
  });
  it('độ khó tăng dần, có xê dịch nhỏ: nửa đầu đề dễ hơn nửa sau, câu 3 ý dồn về cuối', () => {
    for (const seed of seeds) {
      const qs = buildMock(PROG_MOCK, seed).questions, lv = qs.map(q => q.level);
      expect(lv.slice(0, 10).reduce((a, b) => a + b, 0), `seed ${seed}`).toBeLessThan(lv.slice(10).reduce((a, b) => a + b, 0));
      expect(lv[0], `seed ${seed}`).toBeLessThan(3);
      expect(qs.slice(-5).filter(q => q.parts.length === 3).length, `seed ${seed}`).toBeGreaterThanOrEqual(2);
    }
    const orders = new Set(seeds.map(seed => buildMock(PROG_MOCK, seed).questions.map(q => q.level).join('')));
    expect(orders.size).toBeGreaterThan(5);
  });
  it('comparison round 2: at least 1 run-time find-the-error question; no obvious syntax error', () => {
    for (const seed of seeds) {
      const qs = PROG_MOCK.makers.map((make, i) => { let n = seed + i; return make(() => { n = (n * 7 + 13) % 97; return n / 97; }); });
      expect(qs.filter(q => typeOf(q) === 'findrun').length, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(qs.some(q => TEMPLATES.find(t => t.id === byId[q.facts.id].template).obvious), `seed ${seed}`).toBe(false);
    }
  });
  it('các dạng: trắc nghiệm, điền, đoán kết quả, tìm lỗi, viết; không có dạng "compile"', () => {
    expect(Object.keys(BLUEPRINT).sort()).toEqual(['fill', 'fix', 'mcq', 'predict', 'write']);
    for (const s of plan()) for (const t of s.pool) expect(['mcq', 'fill', 'predict', 'find', 'findrun', 'write']).toContain(t.type ?? t.kind);
  });
  it('câu tìm lỗi biên dịch: bản sai và bản sửa khác đúng 1 dòng, nên đáp án "sửa dòng N" (fixAt) cho ra bản sửa clang đã kiểm', () => {
    for (const v of variants().filter(x => x.kind === 'find')) {
      const a = v.src.split('\n'), b = v.fixSrc.split('\n');
      expect(a.filter((l, i) => l !== b[i]).length, v.id).toBe(1);
    }
  });
  it('mọi mẫu có 1–3 ý; câu trắc nghiệm của đề đến từ mẫu có bẫy (4 lựa chọn khác nhau)', () => {
    for (const t of TEMPLATES) expect(partsOf(t) >= 1 && partsOf(t) <= 3, t.id).toBe(true);
    for (const v of variants().filter(x => x.kind === 'predict')) expect(v.follow(byId[v.id]).a.length, v.id).toBeGreaterThan(0);
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
  it('mọi ô có mẫu; đúng số câu theo nhóm; tỉ lệ tuần ≥ 9 theo SCOPE khi đủ mẫu, còn lại lấy nền', () => {
    expect(SCOPE).toEqual({ postMidShare: 0.8, postMidFrom: 9 });
    const slots = plan();
    expect(slots.length).toBe(20);
    for (const s of slots) {
      expect(s.pool.length, `${s.group} ${s.parts} ${s.level}`).toBeGreaterThan(0);
      for (const t of s.pool) expect([groupOf(t), partsOf(t), levelOf(t)]).toEqual([s.group, s.parts, s.level]);
    }
    for (const [group, list] of Object.entries(BLUEPRINT)) expect(slots.filter(s => s.group === group).length, group).toBe(list.length);
    expect(slots.filter(s => s.pool[0].week >= 9).length).toBeGreaterThanOrEqual(10);
    const fake = [...TEMPLATES.map(t => ({ ...t, week: 3 })), ...TEMPLATES.map(t => ({ ...t, week: 11 }))];
    expect(plan(fake).filter(s => s.pool[0].week >= 9).length).toBe(16);
  });
});

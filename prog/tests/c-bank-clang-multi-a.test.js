/* clang re-runs of the C bank, split from c-bank.test.js so that no single worker runs longer than the vitest RPC timeout. */
import { describe, it, expect } from 'vitest';
import { variants, TEMPLATES } from '../src/logic/c-templates.js';
import { runC, probeProblems } from '../../scripts/gen-c-bank.mjs';
import BANK from '../src/content/c-bank.json';

const byId = Object.fromEntries(BANK.map(b => [b.id, b]));

describe('ngân hàng C: câu nhiều ý chạy lại bằng clang (a)', () => {
  // One test per template, so the worker can report between clang runs (one long test timed out the worker RPC).
  it.each(variants().filter(x => x.kind === 'multi').map(x => x.id).filter((_, i) => i % 2 === 0))('câu nhiều ý %s: chạy lại clang khớp kết quả đã lưu; ý nào cũng có đáp án', id => {
    for (const v of variants().filter(x => x.id === id)) {
      const r = runC(v.src, { input: v.input }), b = byId[v.id];
      expect(probeProblems(v), v.id).toEqual([]);
      if (v.logic) expect(runC(v.badSrc, { input: v.input }).out, v.id).toBe(b.badOut);
      else if (v.badSrc) expect(runC(v.badSrc, { san: true }).crashed, v.id).toBe(true);
      expect(r.ok, v.id).toBe(b.ok);
      if (r.ok) expect(r.out, v.id).toBe(b.out); else expect([r.line, r.why], v.id).toEqual([b.line, b.why]);
      for (const pt of v.parts(b)) expect(pt.a.every(l => l && !l.includes('undefined')), v.id).toBe(true);
    }
  }, 120000);
});

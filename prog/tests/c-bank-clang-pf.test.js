/* clang re-runs of the C bank, split from c-bank.test.js so that no single worker runs longer than the vitest RPC timeout. */
import { describe, it, expect } from 'vitest';
import { variants, TEMPLATES } from '../src/logic/c-templates.js';
import { runC, probeProblems } from '../../scripts/gen-c-bank.mjs';
import BANK from '../src/content/c-bank.json';

const byId = Object.fromEntries(BANK.map(b => [b.id, b]));
const ofKind = k => TEMPLATES.filter(t => t.kind === k).map(t => t.id);

describe('ngân hàng C: đoán kết quả và tìm lỗi chạy lại bằng clang', () => {
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
});

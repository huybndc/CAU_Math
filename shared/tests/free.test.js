import { describe, it, expect } from 'vitest';
import { validateProblem, summarize, nextUp } from '../logic/free.js';

const t = () => ({ title: 'T', q: 'Q', hints: ['a', 'b'], solution: ['s1', 's2'], rubric: ['r1', 'r2', 'r3'], pitfalls: ['p'] });
const good = () => ({ id: 'x-1', ch: 'ch1', level: 2, source: { name: 'MIT', license: 'CC BY-NC-SA 3.0' }, vi: t(), en: t() });

describe('tự luận: kiểm dữ liệu', () => {
  it('bài đủ trường thì hợp lệ; thiếu / lệch bản thì báo', () => {
    expect(validateProblem(good())).toEqual([]);
    const a = good(); delete a.en; expect(validateProblem(a).join()).toMatch(/thiếu bản en/);
    const b = good(); b.vi.hints = ['chỉ một']; expect(validateProblem(b).join()).toMatch(/vi.hints/);
    const c = good(); c.en.rubric = ['1', '2', '3', '4']; expect(validateProblem(c).join()).toMatch(/cùng số/);
    const d = good(); d.source = { name: 'x' }; expect(validateProblem(d).join()).toMatch(/nguồn/);
    expect(validateProblem({ id: 'Bad Id' })[0]).toMatch(/id/);
  });
  it('tóm tắt và chọn bài tiếp theo', () => {
    const ps = ['a', 'b', 'c', 'd'].map(id => ({ ...good(), id }));
    const rt = { a: { r: 'ok' }, b: { r: 'bad' }, c: { r: 'near' } };
    expect(summarize(ps, rt)).toEqual({ n: 4, ok: 1, near: 1, bad: 1, todo: 1 });
    expect(nextUp(ps, rt).id).toBe('b');
    expect(nextUp(ps, rt, 'b').id).toBe('c');
    expect(nextUp(ps, { a: { r: 'ok' } }, 'a').id).toBe('b');
  });
});

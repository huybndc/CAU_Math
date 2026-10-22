import { describe, it, expect } from 'vitest';
import { validateProblem, following } from '../logic/free.js';

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
  it('bài tiếp theo trong cùng danh sách; hết thì null', () => {
    const ps = ['a', 'b'].map(id => ({ ...good(), id }));
    expect(following(ps, 'a').id).toBe('b');
    expect(following(ps, 'b')).toBe(null);
  });
});

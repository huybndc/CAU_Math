import { describe, it, expect } from 'vitest';
import { freeFromGlob, validateProblem } from '../logic/free.js';
import * as logic from '../../logic/src/logic/chapters.js';
import * as linalg from '../../linalg/src/logic/chapters.js';
import * as discrete from '../../discrete/src/logic/chapters.js';

// một bộ kiểm cho cả 3 app (trước đây 3 file giống hệt nhau, chỉ khác tên môn)
const APPS = {
  logic: [logic, import.meta.glob('../../logic/src/content/free/*.json', { eager: true })],
  linalg: [linalg, import.meta.glob('../../linalg/src/content/free/*.json', { eager: true })],
  discrete: [discrete, import.meta.glob('../../discrete/src/content/free/*.json', { eager: true })],
};

describe.each(Object.entries(APPS))('%s: bài tự luận', (_name, [mod, glob]) => {
  const FREE = freeFromGlob(glob);
  const ids = (Array.isArray(mod.CHAPTERS) ? mod.CHAPTERS : Object.values(mod.CHAPTERS)).map(c => c.id);
  it('đủ trường, song ngữ cân, id không trùng, đúng chương', () => {
    expect(FREE.length).toBeGreaterThan(0);
    expect(FREE.flatMap(validateProblem)).toEqual([]);
    expect(new Set(FREE.map(p => p.id)).size).toBe(FREE.length);
    expect(FREE.filter(p => !ids.includes(p.ch)).map(p => p.id)).toEqual([]);
  });
});

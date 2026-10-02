import { describe, it, expect } from 'vitest';
import { freeFromGlob, validateProblem } from '@shared/logic/free.js';
import { CHAPTERS } from '../src/logic/chapters.js';

const FREE = freeFromGlob(import.meta.glob('../src/content/free/*.json', { eager: true }));
const ids = (Array.isArray(CHAPTERS) ? CHAPTERS : Object.values(CHAPTERS)).map(c => c.id);

describe('discrete: bài tự luận', () => {
  it('đủ trường, song ngữ cân, id không trùng, đúng chương', () => {
    expect(FREE.length).toBeGreaterThan(0);
    expect(FREE.flatMap(validateProblem)).toEqual([]);
    expect(new Set(FREE.map(p => p.id)).size).toBe(FREE.length);
    expect(FREE.filter(p => !ids.includes(p.ch)).map(p => p.id)).toEqual([]);
  });
});

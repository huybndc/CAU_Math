/* Guard (D73): questions in one C exam must not repeat one code skeleton.
   The guard normalizes each program (numbers, strings, and names of literals removed) and compares the sets of lines. */
import { describe, it, expect } from 'vitest';
import { buildMock } from '@shared/logic/mock-exam.js';
import { PROG_MOCK } from '../src/logic/mock-exam.js';

const BOILER = new Set(['', '{', '}', 'int main(void) {', 'return 0;', '#include <stdio.h>', '#include <string.h>', '#include <stdarg.h>', 'printf("S");',
  'fclose(f);', 'fclose(fp);', 'if (f == NULL) return N;', 'if (fp == NULL) return N;']);
/** Normalized code lines without boilerplate. Numbers become N, string and char literals become S. */
export const skeleton = code => new Set(code.split('\n')
  .map(l => l.replace(/^\s*\d+ {2}/, '').trim().replace(/"(?:[^"\\]|\\.)*"/g, '"S"').replace(/'(?:[^'\\]|\\.)*'/g, "'S'").replace(/\b\d+(\.\d+)?\b/g, 'N').replace(/\s+/g, ' '))
  .filter(l => !BOILER.has(l)));
const jaccard = (a, b) => { const inter = [...a].filter(x => b.has(x)).length; return inter / (a.size + b.size - inter || 1); };
/** Highest similarity between two questions of one exam, and the pair. */
export function maxSimilarity(questions) {
  const sk = questions.map(q => skeleton(q.code ?? ''));
  let best = [0, -1, -1];
  for (let i = 0; i < sk.length; i++) for (let j = i + 1; j < sk.length; j++) {
    const s = jaccard(sk[i], sk[j]);
    if (s > best[0]) best = [s, i + 1, j + 1];
  }
  return best;
}
/** Share of questions with code whose program has only main and no struct (the "main + printf" skeleton). A theory question without code is not main-only. */
export const onlyMainShare = questions => questions.filter(q => q.code && !/struct|typedef|\b(?!main\b)\w+\s*\([^;)]*\)\s*\{/.test(q.code)).length / questions.length;

export const LIMIT = 0.5, MAIN_LIMIT = 0.45;

describe('similarity guard for one C exam', () => {
  const seeds = Array.from({ length: 40 }, (_, i) => i * 104729 + 3);
  it(`no two questions share more than ${LIMIT * 100}% of their code lines; at most ${MAIN_LIMIT * 100}% are main-only`, () => {
    for (const seed of seeds) {
      const qs = buildMock(PROG_MOCK, seed).questions;
      const [s, i, j] = maxSimilarity(qs);
      expect(s, `seed ${seed}: questions ${i} and ${j}`).toBeLessThanOrEqual(LIMIT);
      expect(onlyMainShare(qs), `seed ${seed}`).toBeLessThanOrEqual(MAIN_LIMIT);
    }
  });
  it('mutation: the guard catches a repeated skeleton where only the numbers change', () => {
    const qs = buildMock(PROG_MOCK, 3).questions.map(q => ({ ...q }));
    qs[5].code = qs[2].code.replace(/\b\d+\b/g, d => String(Number(d) + 3)).replace(/"[^"]*"/g, '"other"');
    expect(maxSimilarity(qs)[0]).toBeGreaterThan(LIMIT);
    const mainOnly = qs.map(q => ({ code: 'int main(void) {\n    int a = 1;\n    printf("%d\\n", a);\n}' }));
    expect(onlyMainShare(mainOnly)).toBeGreaterThan(MAIN_LIMIT);
  });
});

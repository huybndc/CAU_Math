/* ---------------------------------------------------------------
   C Programming mock exam (pure): 20 questions, 5 points each, two parts each (format the learner approved on 2026-10-30).
   Questions come from c-bank.json. Every "predict" answer is real clang stdout. Every "find" answer is the line clang reports.
   SCOPE sets the share of weeks 9–15 (learner decision, 2026-10-27). The share grows when new week batches arrive.
   --------------------------------------------------------------- */
import { TEMPLATES, variants } from './c-templates.js';
import BANK from '../content/c-bank.json';

/** Edit this when the teacher publishes the exam scope. */
export const SCOPE = { postMidShare: 0.8, postMidFrom: 9 };
/**
 * Number of questions for each question group. The real midterm (2026-10-21) had only these four types:
 * find and fix the error, predict the output, write a struct or function, and fill in the blanks.
 * Templates of other types (mcq, compile) stay in the bank, but the exam does not use them (D68).
 */
export const BLUEPRINT = { fill: 5, predict: 5, fix: 5, write: 5 };

const FIX_TYPES = new Set(['find', 'findrun']);
/**
 * Code length mix inside a group (comparison round 1, 2026-11-10: the learner said the real find-the-error
 * questions had short, medium, and long programs). Lines: short ≤ 9, medium 10–19, long ≥ 20.
 */
export const SIZES = { fix: { short: 2, medium: 2, long: 1 } };
export const sizeOf = lineCount => (lineCount <= 9 ? 'short' : lineCount <= 19 ? 'medium' : 'long');
const shownLines = t => { const p = t.params?.[0]; if (!p) return 0; const s = t.kind === 'multi' && t.show ? t.show(p) : t.src(p); return s.trimEnd().split('\n').length; };
export const groupOf = t => { const k = t.type ?? t.kind; return FIX_TYPES.has(k) ? 'fix' : k; };

const byId = Object.fromEntries(BANK.map(b => [b.id, b]));
const VARS = variants();
const numbered = src => src.trimEnd().split('\n').map((l, i) => `${String(i + 1).padStart(2)}  ${l}`).join('\n');
const split = (list, n) => Array.from({ length: n }, (_, k) => list.filter((_, j) => j % n === k));

/**
 * Returns one template pool for each question. Pools do not overlap, so one exam never repeats a template.
 * A slot for weeks 9–15 uses an earlier week when that group has no more new templates.
 */
export function plan(templates = TEMPLATES, scope = SCOPE) {
  const pools = [];
  let slot = 0;
  for (const [group, n] of Object.entries(BLUEPRINT)) {
    let want = 0;
    for (let k = 0; k < n; k++, slot++) if (Math.floor((slot + 1) * scope.postMidShare) > Math.floor(slot * scope.postMidShare)) want++;
    const inGroup = templates.filter(t => groupOf(t) === group);
    const parts = SIZES[group] ? Object.entries(SIZES[group]).map(([size, k]) => [inGroup.filter(t => sizeOf(shownLines(t)) === size), k]) : [[inGroup, n]];
    let left = want;
    for (const [list, k] of parts) {
      const post = list.filter(t => t.week >= scope.postMidFrom), base = list.filter(t => t.week < scope.postMidFrom);
      const nPost = Math.max(k - base.length, Math.min(left, k, post.length));
      left -= nPost;
      pools.push(...split(post, nPost), ...split(base, k - nPost));
    }
  }
  return pools;
}

const STEM = {
  mcq: 'Choose one option for each part.',
  fill: 'Fill in the blanks so the program works as described.',
  compile: 'Read the program carefully (no compiler in the exam).',
  write: 'The main function is given. Write the missing part.',
  findrun: 'This program compiles, but it has one error when it runs.',
  predict: 'What does this program print?',
  find: 'This program has exactly one compile error.',
};

function question(pool, rnd) {
  const template = pool[Math.floor(rnd() * pool.length)];
  const all = VARS.filter(v => v.template === template.id);
  const v = all[Math.floor(rnd() * all.length)];
  const b = byId[v.id], source = `Week ${template.week}, ${TOPIC[template.topic]}. Written for this app. Answer checked with clang.`;
  if (template.kind === 'multi') {
    return { stem: STEM[template.type], code: numbered(v.show), source, facts: { id: v.id, kind: 'multi', type: template.type }, parts: v.parts(b) };
  }
  if (template.kind === 'predict') {
    return { stem: STEM.predict, code: numbered(v.src), source, facts: { id: v.id, kind: 'predict', out: b.out },
      parts: [{ pts: 3, q: 'Write the exact output.', a: [`Output: ${b.out.trimEnd()}`] }, { pts: 2, ...v.follow(b) }] };
  }
  const fixLine = v.fixSrc.split('\n')[b.line - 1].trim();
  return { stem: STEM.find, code: numbered(v.src), source, facts: { id: v.id, kind: 'find', line: b.line, fix: fixLine },
    parts: [{ pts: 2, q: 'Give the line number and the reason.', a: [`Line ${b.line}: ${b.why}`] }, { pts: 3, q: 'Rewrite that line correctly.', a: [fixLine] }] };
}

const TOPIC = { struct: 'Structures', union: 'Unions', typedef: 'typedef', operators: 'Operators', pointer: 'Pointers', array: 'Arrays', string: 'Strings', function: 'Functions and pointers', file: 'Files' };

export const PROG_MOCK = {
  id: 'prog', title: 'C Programming — Practice Exam',
  note: 'Marking: each part is all or nothing. A correct part gets full points. A wrong part gets 0.',
  minutesPerPoint: 120 / 100,
  makers: plan().map(pool => rnd => question(pool, rnd)),
};

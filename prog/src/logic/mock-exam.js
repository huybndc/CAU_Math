/* ---------------------------------------------------------------
   C Programming mock exam (pure): 20 questions, 1–3 parts each, 38 parts, 100 points (D73).
   Questions come from c-bank.json. Every "predict" answer is real clang stdout. Every "find" answer is the line clang reports.
   SCOPE sets the share of weeks 9–15 (learner decision, 2026-10-27). The share grows when new week batches arrive.
   --------------------------------------------------------------- */
import { TEMPLATES, variants } from './c-templates.js';
import BANK from '../content/c-bank.json';

/** Edit this when the teacher publishes the exam scope. */
export const SCOPE = { postMidShare: 0.8, postMidFrom: 9 };
/**
 * The real midterm (learner, 2026-11-10): 20 questions, about 35–40 parts, 1–3 parts each.
 * Main types: find and fix the error, predict the output, write a struct or function, fill in the blanks. Multiple choice also appears.
 * Each slot is [number of parts, difficulty level 1–3, kind]. Kind is 'run' or 'compile' for the fix group,
 * and 'theory' or 'output' for multiple choice (D74: about 2/3 of multiple choice is theory). 'any' (default) takes all.
 * D71: at least 1 run-time find-the-error question. Templates with `obvious: true` are not used.
 */
export const BLUEPRINT = {
  mcq: [[1, 1, 'theory'], [2, 2, 'theory'], [1, 2, 'output']],
  predict: [[2, 1], [1, 2], [1, 3], [2, 2], [3, 3]],
  fill: [[2, 1], [1, 2], [2, 2], [3, 3]],
  fix: [[2, 1, 'run'], [2, 2, 'compile'], [2, 2, 'compile'], [3, 3, 'any']],
  write: [[2, 1], [1, 2], [2, 2], [3, 3]],
};
/** Older templates that test two ideas at once. New templates set `level` themselves. */
const LEVEL2 = new Set(['mcq-scanf-string', 'mcq-ptr-vs-2d', 'mcq-variadic', 'row-ptr', 'void-cast', 'file-mode', 'array-sizeof',
  'fill-fp-array', 'fill-file-write', 'fill-array-len', 'err-calc-menu', 'err-total-ptr', 'err-const-param', 'err-void-func', 'err-bonus-arrow',
  'write-best', 'write-raise', 'write-add-2d', 'write-fold']);
export const levelOf = t => t.level ?? (LEVEL2.has(t.id) ? 2 : 1);

const FIX_TYPES = new Set(['find', 'findrun']);
export const kindOf = t => (t.type === 'mcq' ? (t.theory ? 'theory' : 'output') : t.type === 'findrun' ? 'run' : 'compile');
export const groupOf = t => { const k = t.type ?? t.kind; return FIX_TYPES.has(k) ? 'fix' : k; };

const byId = Object.fromEntries(BANK.map(b => [b.id, b]));
const VARS = variants();
/** Number of parts that a template gives. */
export const partsOf = t => {
  if (t.kind !== 'multi') return 2;
  const v = VARS.find(x => x.template === t.id);
  return v && byId[v.id] ? v.parts(byId[v.id]).length : 0;
};
const numbered = src => src.trimEnd().split('\n').map((l, i) => `${String(i + 1).padStart(2)}  ${l}`).join('\n');
const split = (list, n) => Array.from({ length: n }, (_, k) => list.filter((_, j) => j % n === k));

/** Points for each part: level 1 → 2, level 2 → 2.5, level 3 → 3, then scaled to `total` by largest remainder. */
export function allocate(slots, total = 100) {
  const w = slots.flatMap(s => Array(s.parts).fill(1.5 + s.level / 2));
  const sum = w.reduce((a, b) => a + b, 0), raw = w.map(x => (x * total) / sum), pts = raw.map(Math.floor);
  const order = raw.map((x, i) => [x - pts[i], i]).sort((a, b) => b[0] - a[0]);
  const missing = total - pts.reduce((a, b) => a + b, 0);
  for (let k = 0; k < missing; k++) pts[order[k][1]]++;
  let i = 0;
  return slots.map(s => pts.slice(i, (i += s.parts)));
}

/**
 * Returns one slot for each question: { group, parts, level, pts, pool }.
 * Pools do not overlap, so one exam never repeats a template. A slot for weeks 9–15 uses an earlier week when no new template fits.
 */
export function plan(templates = TEMPLATES, scope = SCOPE) {
  const slots = Object.entries(BLUEPRINT).flatMap(([group, list]) => list.map(([parts, level, kind = 'any']) => ({ group, parts, level, kind })));
  slots.forEach((s, i) => { s.post = Math.floor((i + 1) * scope.postMidShare) > Math.floor(i * scope.postMidShare); });
  const keyOf = s => `${s.group}|${s.parts}|${s.level}|${s.kind}`;
  for (const key of new Set(slots.map(keyOf))) {
    const same = slots.filter(s => keyOf(s) === key), [{ group, parts, level, kind }] = same;
    const list = templates.filter(t => groupOf(t) === group && !t.obvious && partsOf(t) === parts && levelOf(t) === level && (kind === 'any' || kindOf(t) === kind));
    const post = list.filter(t => t.week >= scope.postMidFrom), base = list.filter(t => t.week < scope.postMidFrom);
    const nPost = Math.max(same.length - base.length, Math.min(same.filter(s => s.post).length, post.length));
    const pools = [...split(post, nPost), ...split(base, same.length - nPost)];
    same.forEach((s, k) => { s.pool = pools[k]; });
  }
  allocate(slots).forEach((pts, i) => { slots[i].pts = pts; });
  return slots;
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

const TOPIC = { struct: 'Structures', union: 'Unions', typedef: 'typedef', operators: 'Operators', pointer: 'Pointers', array: 'Arrays', string: 'Strings', function: 'Functions and pointers', file: 'Files' };

function build(template, v) {
  const b = byId[v.id];
  if (template.kind === 'multi') return { stem: template.stem ?? STEM[template.type], code: v.show, facts: { id: v.id, kind: 'multi', type: template.type, theory: !!template.theory }, parts: v.parts(b) };
  if (template.kind === 'predict') {
    return { stem: STEM.predict, code: v.src, facts: { id: v.id, kind: 'predict', out: b.out },
      parts: [{ q: 'Write the exact output.', a: [`Output: ${b.out.trimEnd()}`] }, v.follow(b)] };
  }
  // The fix can be on another line than the one clang reports (for example a const parameter), so use the line that changes.
  const bad = v.src.split('\n'), good = v.fixSrc.split('\n'), at = good.findIndex((l, i) => l !== bad[i]);
  const fixLine = good[at].trim();
  return { stem: STEM.find, code: v.src, facts: { id: v.id, kind: 'find', line: b.line, fix: fixLine, fixAt: at + 1 },
    parts: [{ q: 'Give the line number and the reason.', a: [`Line ${b.line}: ${b.why}`] },
      { q: 'Fix the program: give the line to change and write it correctly.', a: [`Line ${at + 1}: ${fixLine}`] }] };
}

function question(slot, rnd) {
  const template = slot.pool[Math.floor(rnd() * slot.pool.length)];
  const all = VARS.filter(v => v.template === template.id);
  const v = all[Math.floor(rnd() * all.length)];
  const q = build(template, v);
  return { ...q, code: q.code ? numbered(q.code) : '', level: slot.level, parts: q.parts.map((p, i) => ({ ...p, pts: slot.pts[i] })),
    source: `Week ${template.week}, ${TOPIC[template.topic]}. Written for this app. Answer checked with clang.` };
}

const SLOTS = plan();
/** Question order: difficulty rises, longer questions go later, and a random shift lets levels mix a little. */
export const order = (slots, rnd) => slots.map((s, i) => [s.level + (s.parts - 2) * 0.4 + rnd() * 1.2, i]).sort((a, b) => a[0] - b[0]).map(x => x[1]);

export const PROG_MOCK = {
  id: 'prog', title: 'C Programming — Practice Exam',
  note: 'Marking: each part is all or nothing. A correct part gets full points. A wrong part gets 0.',
  minutesPerPoint: 120 / 100,
  makers: SLOTS.map(slot => rnd => question(slot, rnd)),
  order: rnd => order(SLOTS, rnd),
};

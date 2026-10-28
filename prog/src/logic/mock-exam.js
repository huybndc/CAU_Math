/* ---------------------------------------------------------------
   ĐỀ THI THỬ Lập trình C (thuần): 20 câu × 5 điểm, 120 phút (như đề giữa kỳ người học đã làm).
   Câu lấy từ ngân hàng c-bank.json: mọi đáp án "đoán kết quả" là stdout thật của clang, "tìm lỗi" là dòng clang báo lỗi.
   Tỉ lệ phạm vi ở SCOPE (người học chốt 2026-10-27): ~80% tuần 9–15, ~20% nền (tuần ≤ 7). Chưa có lô tuần 9–15 thì lấy nền.
   --------------------------------------------------------------- */
import { TEMPLATES, variants } from './c-templates.js';
import BANK from '../content/c-bank.json';

/** Chỉnh khi giảng viên công bố phạm vi thi. */
export const SCOPE = { questions: 20, postMidShare: 0.8, postMidFrom: 9 };

const byId = Object.fromEntries(BANK.map(b => [b.id, b]));
const VARS = variants();
const numbered = src => src.trimEnd().split('\n').map((l, i) => `${String(i + 1).padStart(2)}  ${l}`).join('\n');

/** Kế hoạch 20 ô: [{ template, half }] — 80% từ mẫu tuần ≥ postMidFrom (thiếu thì lấy nền), còn lại từ nền. */
export function plan(templates = TEMPLATES, scope = SCOPE) {
  const post = templates.filter(t => t.week >= scope.postMidFrom), base = templates.filter(t => t.week < scope.postMidFrom);
  const nPost = Math.round(scope.questions * scope.postMidShare);
  const take = (pool, n, from) => Array.from({ length: n }, (_, i) => ({ template: pool[(from + i) % pool.length], half: Math.floor((from + i) / pool.length) % 2 }));
  const postPart = post.length ? take(post, nPost, 0) : take(base, nPost, 0);
  const basePart = take(base, scope.questions - nPost, post.length ? 0 : nPost);
  return [...postPart, ...basePart];
}

const STEM = {
  predict: 'What does this program print? Write the exact output.',
  find: 'This program has exactly one compile error. Give the line number and rewrite that line correctly.',
};

function question({ template, half }, rnd) {
  const all = VARS.filter(v => v.template === template.id), pool = all.filter((_, i) => i % 2 === half);
  const v = (pool.length ? pool : all)[Math.floor(rnd() * (pool.length || all.length))];
  const b = byId[v.id];
  if (template.kind === 'predict') {
    return { stem: STEM.predict, code: numbered(v.src), facts: { id: v.id, kind: 'predict', out: b.out },
      parts: [{ pts: 5, q: '', a: [`Output: ${b.out.trimEnd()}`], rubric: [[3, 'values'], [2, 'exact format (spaces, line break)']] }] };
  }
  const fixLine = v.fixSrc.split('\n')[b.line - 1].trim();
  return { stem: STEM.find, code: numbered(v.src), facts: { id: v.id, kind: 'find', line: b.line, fix: fixLine },
    parts: [{ pts: 5, q: '', a: [`Line ${b.line}. Fix: ${fixLine}`], rubric: [[2, 'line number'], [3, 'a correct fixed line']] }] };
}

export const PROG_MOCK = {
  id: 'prog', title: 'C Programming — Practice Exam',
  book: 'Perfect C (Korean ed.); questions written for this app, answers checked with clang',
  minutesPerPoint: 120 / 100,
  makers: plan().map(slot => rnd => question(slot, rnd)),
  refs: plan().map(({ template }) => [[String(template.week), template.topic === 'union' ? 'Unions' : template.topic === 'typedef' ? 'typedef' : 'Structures']]),
};

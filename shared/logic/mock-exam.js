/* ---------------------------------------------------------------
   ĐỀ NHƯ THẬT — khung dùng chung (thuần, không đụng DOM).
   Mẫu đề (template) = { id, title, book, minutesPerPoint, makers[], refs[] }  (refs[i] = các mục sách của câu i: [['2.6', 'tên mục'], …]); mỗi maker(rnd) trả một câu:
     { stem, parts: [{ pts, q, a: string[], facts }] }   q = đề, a = các dòng đáp án, facts = số liệu thô để test.
   Một mã seed dựng lại đúng cả đề lẫn đáp án (in cùng mã trên hai file). Mỗi câu có bộ ngẫu nhiên riêng,
   nên sửa một maker không làm đổi các câu còn lại.
   --------------------------------------------------------------- */
import { seededRandom } from './shuffle.js';

const SEED_SPACE = 36 ** 5;

export const seedCode = seed => seed.toString(36).toUpperCase().padStart(5, '0');
/** Mã người dùng gõ → seed; không hợp lệ thì null. */
export function parseSeed(code) {
  const s = String(code ?? '').trim();
  if (!/^[0-9a-z]{1,5}$/i.test(s)) return null;
  return parseInt(s, 36);
}
export const newSeed = (rnd = Math.random) => Math.floor(rnd() * SEED_SPACE);

export function buildMock(template, seed) {
  const questions = template.makers.map((make, i) => {
    const rnd = seededRandom(Math.imul(seed + 1, 2654435761) + i * 40503);
    const q = make(rnd);
    const parts = q.parts.map((p, j) => ({ ...p, label: String.fromCharCode(97 + j) }));
    return { no: i + 1, stem: q.stem, parts, pts: parts.reduce((s, p) => s + p.pts, 0), refs: (template.refs?.[i] ?? []).map(([sec, title]) => ({ sec, title })) };
  });
  const total = questions.reduce((s, q) => s + q.pts, 0);
  return {
    id: template.id, title: template.title, book: template.book ?? '', seed, code: seedCode(seed), questions, total,
    minutes: Math.round(total * template.minutesPerPoint),
  };
}

/* ---------- giờ làm bài và tự chấm (thuần) ---------- */

/** Giây còn lại; run = { startedAt, minutes }. Không âm. */
export const secondsLeft = (run, now) => Math.max(0, Math.ceil((run.startedAt + run.minutes * 60000 - now) / 1000));

const clampPts = (v, max) => Math.min(max, Math.max(0, Math.round(Number(v) || 0)));

/**
 * Điểm tự chấm → tổng, theo câu, theo mục sách. grades = { 'no-label': điểm }.
 * Điểm của câu tính vào mục sách đầu tiên của câu (câu nhiều mục: mục chính).
 */
export function scoreSummary(ex, grades) {
  const byQuestion = ex.questions.map(q => ({
    no: q.no, max: q.pts, got: q.parts.reduce((s, p) => s + clampPts(grades[`${q.no}-${p.label}`], p.pts), 0),
  }));
  const sections = new Map();
  ex.questions.forEach((q, i) => {
    const r = q.refs[0] ?? { sec: '—', title: '' };
    const cur = sections.get(r.sec) ?? { sec: r.sec, title: r.title, got: 0, max: 0 };
    cur.got += byQuestion[i].got; cur.max += byQuestion[i].max;
    sections.set(r.sec, cur);
  });
  return {
    total: byQuestion.reduce((s, q) => s + q.got, 0), max: ex.total, byQuestion,
    bySection: [...sections.values()].sort((a, b) => a.got / a.max - b.got / b.max),   // yếu nhất lên đầu
  };
}

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

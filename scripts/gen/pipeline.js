/* ---------------------------------------------------------------
   CÁC BƯỚC THUẦN CỦA PIPELINE (D27) — generate.js chỉ lo đọc/ghi file và gọi mạng.
     pickSection   chọn mục còn ít câu nhất (của chương đã chọn, hoặc cả môn)
     normalizeRaw  câu Gemini trả → câu theo hợp đồng shared/logic/concepts.js
     processBatch  kiểm (validateItem + bộ kiểm phép tính của môn) + lọc trùng
   --------------------------------------------------------------- */

import { validateItem, isDuplicate } from '../../shared/logic/concepts.js';
import { SUBJECT_TOPICS, sectionIds, findSection } from './topics.js';

/** Mục cần soạn thêm: `section` cho sẵn thì dùng luôn; không thì mục ít câu nhất (hoà: mục đứng trước). */
export function pickSection(subject, { chapter, section } = {}, existing = []) {
  if (section) {
    const s = findSection(subject, section);
    if (!s) throw new Error(`Không có mục ${section} trong ${subject}`);
    return s;
  }
  const chapters = SUBJECT_TOPICS[subject].chapters;
  if (chapter && !chapters[chapter]) throw new Error(`Không có chương ${chapter} trong ${subject}`);
  const pool = Object.entries(chapters)
    .filter(([ch]) => !chapter || ch === chapter)
    .flatMap(([ch, list]) => list.map(s => ({ chapter: ch, ...s })));
  const count = id => existing.filter(it => it.section === id).length;
  return pool.reduce((best, s) => (count(s.id) < count(best.id) ? s : best));
}

/** Đề (EN) các câu đã có ở một mục — đưa vào prompt để Gemini không soạn trùng ý. */
export const avoidFor = (sectionId, existing) => existing.filter(it => it.section === sectionId).map(it => it.en?.q).filter(Boolean);

/** Câu Gemini trả → câu của app. `check_json` hỏng ⇒ giữ nguyên chuỗi để validate báo lỗi. */
export function normalizeRaw(raw, { chapter, id, source }) {
  const { check_json: cj, ...rest } = raw ?? {};
  const item = { id, chapter, ...rest, source };
  if (cj && String(cj).trim()) {
    try { item.check = JSON.parse(cj); } catch { item.check = { type: 'json-hỏng', raw: cj }; }
  }
  return item;
}

/**
 * @param {object[]} raws  câu thô từ Gemini
 * @param {{ subject, chapter, idPrefix, source, verify?, existing, stamp }} o
 *   existing: câu đã duyệt + nháp (để lọc trùng); stamp: chuỗi ngắn làm id duy nhất theo lô
 * @returns {{ accepted: object[], rejected: {item, errors}[] }}
 */
export function processBatch(raws, { subject, chapter, idPrefix, source, verify, existing = [], stamp }) {
  const sections = sectionIds(subject);
  const accepted = [], rejected = [];
  raws.forEach((raw, i) => {
    const item = normalizeRaw(raw, { chapter, id: `${idPrefix}${chapter.replace('ch', '')}-${stamp}${i}`, source });
    const errors = validateItem(item, { sections, verify });
    if (!errors.length && isDuplicate(item, [...existing, ...accepted])) errors.push('trùng ý với câu đã có');
    (errors.length ? rejected : accepted).push(errors.length ? { item, errors } : item);
  });
  return { accepted, rejected };
}

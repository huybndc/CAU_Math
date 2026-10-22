/* ---------------------------------------------------------------
   KIỂM MẠCH VẼ TAY (thuần): người học đọc biểu thức từ mạch mình vẽ trên giấy, gõ vào; app so với đầu ra chuẩn.
   Giáo không chấm điểm từng phần, nên chỉ có ĐÚNG / SAI cho cả câu:
     đúng hàm  = bằng giá trị chuẩn ở MỌI ô bắt buộc (ô don't-care thế nào cũng được);
     chuẩn     = số literal không nhiều hơn đáp án tối giản (mạch hai mức rút gọn bằng K-map).
   ĐÚNG khi đúng hàm và (nếu REQUIRE_MINIMAL) đạt chuẩn.
   --------------------------------------------------------------- */
import { exprTruthTable, countLiterals } from './expr-parser.js';

export const REQUIRE_MINIMAL = true;   // đề thật chấm theo đáp án chuẩn (tối giản); đổi false nếu giáo nhận mạch đúng hàm nhưng chưa tối giản

/**
 * @param {{ names: string[], values: number[], refLits: number }} spec  values: 0 | 1 | 2 (2 = don't care), refLits = số literal của đáp án chuẩn
 * @param {string} text biểu thức người học gõ (SOP/POS, dấu ' hoặc !, A–D kiểu Mano cũng được)
 * @returns {{ error?: string, ok?: boolean, functional?: boolean, wrong?: number[], lits?: number, minimal?: boolean }}
 */
export function gradeCircuit(spec, text) {
  const n = spec.names.length;
  if (!String(text).trim()) return { empty: true };
  let table;
  try { table = exprTruthTable(text, n); } catch (e) { return { error: String(e?.message ?? e) }; }
  const wrong = spec.values.map((v, m) => (v !== 2 && table[m] !== v ? m : -1)).filter(m => m >= 0);
  const lits = countLiterals(text, n), functional = wrong.length === 0, minimal = lits <= spec.refLits;
  return { functional, wrong, lits, minimal, ok: functional && (!REQUIRE_MINIMAL || minimal) };
}

/* ---------------------------------------------------------------
   SỔ CÂU SAI — thuần. Mỗi câu sai ở luyện tập được nhớ bằng (dạng, hạt giống, có phải bản trắc nghiệm) — đủ để sinh lại ĐÚNG câu đó
   (question-pool.js seededQuestion). Làm lại đúng thì gỡ khỏi sổ. Giữ tối đa MAX câu gần nhất.
   --------------------------------------------------------------- */

export const MAX = 60;
const same = (a, b) => a.kind === b.kind && a.seed === b.seed && !!a.tn === !!b.tn;

/** Thêm một câu sai (đưa lên đầu, không trùng). */
export const addMistake = (list, m) => [m, ...list.filter(x => !same(x, m))].slice(0, MAX);
/** Gỡ một câu (đã làm lại đúng). */
export const dropMistake = (list, m) => list.filter(x => !same(x, m));

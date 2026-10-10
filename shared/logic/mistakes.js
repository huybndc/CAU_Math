/* ---------------------------------------------------------------
   SỔ CÂU SAI — thuần. Mỗi câu sai ở luyện tập được nhớ bằng (dạng, hạt giống, có phải bản trắc nghiệm) — đủ để sinh lại ĐÚNG câu đó
   (question-pool.js seededQuestion). Làm lại đúng thì gỡ khỏi sổ. Giữ tối đa MAX câu gần nhất.
   --------------------------------------------------------------- */

export const MAX = 60;
const same = (a, b) => a.kind === b.kind && a.seed === b.seed && !!a.tn === !!b.tn;

/** Thêm một câu sai (đưa lên đầu, không trùng). */
export const addMistake = (list, m) => [m, ...list.filter(x => !same(x, m))].slice(0, MAX);
/** Gỡ một câu (đúng hạt giống). */
export const dropMistake = (list, m) => list.filter(x => !same(x, m));
/** Gỡ cả DẠNG (làm đúng một câu MỚI của dạng đó là đủ): ôn lại theo dạng, không nhớ vị trí đáp án của đúng câu cũ. */
export const dropKind = (list, m) => list.filter(x => x.kind !== m.kind || !!x.tn !== !!m.tn);
/** Số dạng khác nhau trong sổ. */
export const kindCount = list => new Set(list.map(x => x.kind)).size;

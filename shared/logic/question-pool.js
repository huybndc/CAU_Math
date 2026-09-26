/* ---------------------------------------------------------------
   KHÔNG RA LẶP CÂU — dùng chung cho luyện tập, thẻ học và bài full.
   Hai câu được coi là "cùng một câu" khi cùng dạng và cùng dữ liệu sinh đề (`meta`).
   Không có meta thì so thứ người học THẤY: đề, tham số, hình (không so thứ tự xáo phương án —
   cùng một câu xáo lại vẫn là lặp). Ví dụ: cùng cổng NAND hỏi bảng chân trị hai lần là lặp,
   dù phương án nhiễu khác nhau.
   Quy ước cho ngân hàng: `meta` chỉ chứa dữ liệu quyết định câu hỏi, không chứa thứ tự xáo.
   Thuần, không đụng DOM.
   --------------------------------------------------------------- */

export const signature = q => JSON.stringify([q.kind, q.meta
  ?? (q.textParams || q.figure ? [q.textKey ?? null, q.textParams ?? null, q.figure ?? null] : q.answer)]);

/**
 * Sinh một câu CHƯA có trong `hard` (bắt buộc) và, nếu được, chưa có trong `soft` (câu của lượt trước).
 * Thêm chữ ký câu chọn vào `hard`. Thử `tries` lần mà chỉ gặp câu trong `hard` ⇒ trả null
 * (dạng này đã hết câu mới) để người gọi chọn dạng khác hoặc kết thúc lượt, thay vì ra câu lặp.
 * @param {() => object} make  hàm sinh một câu
 */
export function freshQuestion(make, hard, soft = new Set(), tries = 30) {
  let old = null;                                   // câu mới với lượt này nhưng đã gặp ở lượt trước
  for (let i = 0; i < tries * 2; i++) {
    const q = make();
    const sig = signature(q);
    if (hard.has(sig)) continue;
    if (soft.has(sig) && i < tries) { old ??= q; continue; }
    hard.add(sig);
    return q;
  }
  if (old) hard.add(signature(old));
  return old;
}

/**
 * Ước lượng số câu KHÁC NHAU mà `make` sinh được (tối đa `need`): sinh thử `probes` lần, đếm chữ ký.
 * Dùng để rút ngắn lượt khi dạng bài chỉ có ít câu — ra câu lặp cho đủ 10 thì vô ích.
 */
export function poolSize(make, need, probes = 80) {
  const seen = new Set();
  for (let i = 0; i < probes && seen.size < need; i++) seen.add(signature(make()));
  return seen.size;
}

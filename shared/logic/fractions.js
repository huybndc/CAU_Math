/* ---------------------------------------------------------------
   PHÂN SỐ XẾP HAI HÀNG: tách chuỗi toán thành các đoạn chữ và phân số { n, d } để giao diện vẽ tử trên mẫu dưới
   (sách toán viết 2/3 thành hai tầng, dễ đọc hơn nhiều so với 2/3 trên một dòng).
   Chỉ nhận phân số của hai SỐ NGUYÊN không dính chữ/số/dấu chấm/căn xung quanh: "2/3", "-5/77" ⇒ phân số;
   "R3/4", "1.5/2", "1/√5", "2/3/4" ⇒ giữ nguyên. Thuần: không đụng DOM.
   --------------------------------------------------------------- */

const FRAC = /(?<![\p{L}\p{N}_./])(-|−)?(\d+)\/(\d+)(?![\p{L}\p{N}_./√])/gu;

/** @returns {(string | { n: string, d: string })[]} */
export function splitFractions(text) {
  const out = [];
  let at = 0;
  for (const m of String(text).matchAll(FRAC)) {
    if (m[3] === '0') continue;                                  // chia 0 không phải phân số hợp lệ
    if (m.index > at) out.push(text.slice(at, m.index));
    out.push({ n: (m[1] ? '−' : '') + m[2], d: m[3] });
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}

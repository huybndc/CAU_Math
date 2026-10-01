/* ---------------------------------------------------------------
   PHÂN SỐ XẾP HAI HÀNG: tách chuỗi toán thành các đoạn chữ và phân số { n, d } để giao diện vẽ tử trên mẫu dưới
   (sách toán viết 2/3 thành hai tầng, dễ đọc hơn nhiều so với 2/3 trên một dòng).
   Tử và mẫu là: số nguyên, √số, k√số, (k)π, hoặc một cụm trong ngoặc không có dấu chia: "2/3", "-5/77", "1/√5",
   "√2/2", "π/4", "1/(1·√2)" ⇒ phân số (ngoặc bao ngoài tử/mẫu được bỏ). Dính chữ/số/dấu chấm xung quanh thì giữ nguyên:
   "R3/4", "1.5/2", "2/3/4", "a/b". Thuần: không đụng DOM.
   --------------------------------------------------------------- */

const TERM = String.raw`(?:\d*π|\d*√\d+|\d+|\([^()/]*\))`;
const FRAC = new RegExp(String.raw`(?<![\p{L}\p{N}_./])(-|−)?(${TERM})\/(${TERM})(?![\p{L}\p{N}_./√π])`, 'gu');
const bare = x => x.replace(/^\((.*)\)$/, '$1');

/** @returns {(string | { n: string, d: string })[]} */
export function splitFractions(text) {
  const out = [];
  let at = 0;
  for (const m of String(text).matchAll(FRAC)) {
    if (m[3] === '0' || m[3] === '(0)') continue;                                  // chia 0 không phải phân số hợp lệ
    if (m.index > at) out.push(text.slice(at, m.index));
    out.push({ n: (m[1] ? '−' : '') + bare(m[2]), d: bare(m[3]) });
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}

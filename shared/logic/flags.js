/* Cờ "không quan trọng": gắn cho một DẠNG câu (prefix:kind). Dạng bị cờ không tính điểm, không xếp "cần luyện",
   không vào đề trộn, không chặn "Học tiếp". Vẫn chọn tay để luyện được. Thuần — lưu ở shared/ui/flags.js. */

export const flagKey = (prefix, kind) => `${prefix}:${kind}`;
/** Khoá điểm kiến thức 'prefix:kind[:nhãn]' → khoá cờ 'prefix:kind'. */
export const flagKeyOfPoint = key => key.split(':').slice(0, 2).join(':');
/** Bỏ các dạng bị cờ; nếu bỏ hết thì giữ nguyên (không để lượt rỗng). */
export function withoutFlagged(kinds, prefix, flags) {
  const keep = kinds.filter(k => !flags.has(flagKey(prefix, k)));
  return keep.length ? keep : kinds;
}

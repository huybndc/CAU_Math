/** Bạn đồng hành: bật/tắt + chọn 1 trong 3 nhân vật (mèo, cú, cây). Lưu {on, kind} theo môn; mặc định tắt, nhân vật đầu là mèo.
 *  Giá trị lưu cũ: `true` ⇒ bật mèo; chuỗi tên nhân vật ⇒ bật nhân vật đó; 'off'/lạ ⇒ tắt. */
export const KINDS = ['cat', 'owl', 'plant'];
export function normalizePet(v) {
  if (v === true) return { on: true, kind: 'cat' };
  if (typeof v === 'string') return { on: KINDS.includes(v), kind: KINDS.includes(v) ? v : 'cat' };
  if (v && typeof v === 'object') return { on: v.on === true, kind: KINDS.includes(v.kind) ? v.kind : 'cat' };
  return { on: false, kind: 'cat' };
}

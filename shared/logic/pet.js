/** Bạn đồng hành: bật/tắt + chọn 1 trong 3 nhân vật (mèo, cú, cây). Lưu {on, kind} theo môn; MẶC ĐỊNH BẬT (chưa lưu gì), nhân vật đầu là mèo; tắt được bằng công tắc.
 *  Giá trị lưu cũ: `true` ⇒ bật mèo; chuỗi tên nhân vật ⇒ bật nhân vật đó; 'off'/false ⇒ tắt; lạ ⇒ mặc định. */
export const KINDS = ['cat', 'owl', 'plant'];
export const DEFAULT_PET = { on: true, kind: 'cat' };
export function normalizePet(v) {
  if (v === true) return { on: true, kind: 'cat' };
  if (v === false || v === 'off') return { on: false, kind: 'cat' };
  if (typeof v === 'string' && KINDS.includes(v)) return { on: true, kind: v };
  if (v && typeof v === 'object') return { on: v.on !== false, kind: KINDS.includes(v.kind) ? v.kind : 'cat' };
  return { ...DEFAULT_PET };
}

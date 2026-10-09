/* Nhân vật pixel — thuần, không DOM. Nguồn thật của hình/màu/biểu cảm cho Hub, CAU_Math, Live_Lecture
   (qua design-pets.json). Hình + bộ chạy ở art.json / engine.js. Quy tắc: không chữ trên giao diện chính. */
import { ART_IDS, nameOf, frameSvg } from './pet-engine.js';

export const KIND_IDS = ART_IDS;
export const EXPRESSIONS = [
  'neutral', 'blink', 'happy', 'sleepy', 'surprised', 'sad', 'shy',
  'wink', 'cheer', 'proud', 'focus', 'final', 'wave', 'eager', 'relieved', 'hungry', 'yawn', 'lazy', 'petted', 'tilt', 'squint', 'wag', 'look',
];
export const DEFAULT_PET = { on: true, kind: KIND_IDS[0] };

/** Dữ liệu tay/mạng/localStorage → {on, kind} hợp lệ; sai thì về mặc định (bật, nhân vật đầu). */
export function normalizePet(v) {
  const o = v && typeof v === 'object' ? v : {};
  return { on: typeof o.on === 'boolean' ? o.on : DEFAULT_PET.on, kind: KIND_IDS.includes(o.kind) ? o.kind : DEFAULT_PET.kind };
}

/** Tên nhân vật — chỉ cho aria-label (trình đọc màn hình), không hiện trên giao diện. */
export const label = kind => nameOf(kind);

/** SVG chuỗi (crispEdges, không chữ); decorative nên aria-hidden — nút bao ngoài mới có nhãn. */
export const petSvg = frameSvg;

/** Sự kiện có ts xa tương lai (đồng hồ lệch/dữ liệu xấu) sẽ thắng mãi: bỏ qua khi ts > now + 5 phút (tự hết khi đồng hồ qua mốc đó). */
export const MAX_SKEW_MS = 5 * 60 * 1000;

/** Lựa chọn hiện tại từ nhật ký hub: pet.set MỚI NHẤT thắng — so (ts, rồi id theo thứ tự chuỗi), không phụ thuộc thứ tự mảng; chưa có thì mặc định. */
export function petOf(hub, now = Date.now()) {
  let last = null;
  for (const e of hub) if (e.type === 'pet.set' && !(e.ts > now + MAX_SKEW_MS) && (!last || e.ts > last.ts || (e.ts === last.ts && String(e.id) >= String(last.id)))) last = e;
  return normalizePet(last?.payload);
}

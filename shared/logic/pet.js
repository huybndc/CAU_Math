import DESIGN from './design-pets.json';

/** Bạn đồng hành: dựng từ design-pets.json (bản chép của Study_Hub — Hub làm chủ, KHÔNG sửa tay; Hub đổi thì chép lại).
 *  {on, kind} lưu theo môn; MẶC ĐỊNH BẬT. Hub ghi cùng lựa chọn bằng sự kiện pet.set. */
export const KIND_IDS = Object.keys(DESIGN.kinds);
export const KINDS = KIND_IDS;
export const DEFAULT_PET = { ...DESIGN.rules.default };
export const label = k => DESIGN.labels[k];

/** Dữ liệu tay/mạng/localStorage → {on, kind} hợp lệ; sai thì về mặc định. Chấp nhận cả giá trị lưu cũ (true/false/'off'/tên). */
export function normalizePet(v) {
  if (v === false || v === 'off') return { ...DEFAULT_PET, on: false };
  if (typeof v === 'string' && KINDS.includes(v)) return { on: true, kind: v };
  const o = v && typeof v === 'object' ? v : {};
  return { on: typeof o.on === 'boolean' ? o.on : DEFAULT_PET.on, kind: KINDS.includes(o.kind) ? o.kind : DEFAULT_PET.kind };
}

/** SVG chuỗi 16×16 (crispEdges, không chữ, aria-hidden — nút bao ngoài mới có nhãn). */
export function petSvg(kind, expr = 'neutral', cls = 'pet-art') {
  const { palette, frames } = DESIGN.kinds[kind];
  let rc = '';
  frames[expr].forEach((row, y) => [...row].forEach((ch, x) => { if (palette[ch]) rc += `<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[ch]}"/>`; }));
  return `<svg class="${cls}" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${rc}</svg>`;
}

/** Lựa chọn hiện tại từ nhật ký hub (đã sắp theo thời gian): bản pet.set cuối cùng thắng; chưa có thì mặc định. API như src/pets/index.js của Hub. */
export function petOf(hub) {
  let last = null;
  for (const e of hub) if (e.type === 'pet.set') last = e.payload;
  return normalizePet(last);
}

import { load, save } from './store.js';
import { flagKey } from '../logic/flags.js';

/** Các dạng đã gắn cờ "không quan trọng" của môn hiện tại (lưu ở máy). */
export const loadFlags = () => new Set(load('flags', []));
export const isFlagged = (prefix, kind) => loadFlags().has(flagKey(prefix, kind));
/** Bật/tắt cờ một dạng; trả về trạng thái mới. */
export function toggleFlag(prefix, kind) {
  const f = loadFlags(), k = flagKey(prefix, kind), on = !f.has(k);
  on ? f.add(k) : f.delete(k);
  save('flags', [...f]);
  return on;
}

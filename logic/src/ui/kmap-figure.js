import { buildMap, paintValues, drawGroups } from './kmap-common.js';
import { HUES } from './dom-helpers.js';

/**
 * Hình K-map kèm đề luyện tập: { n, values?, mark?, groups? }.
 * - values: hàm cần rút gọn (0 / 1 / 2 = X) → tô sẵn lên bản đồ;
 * - mark: minterm cần hỏi → ô đó hiện "?", các ô khác để trống, ẩn số thứ tự ô.
 * - groups: [{ imp, essential }] → khoanh sẵn các nhóm (đáp án của ví dụ mẫu).
 */
export function kmapFigure({ n, values, mark, groups }) {
  const host = document.createElement('div');
  host.className = 'maps kfig';
  const view = buildMap(host, n);
  if (values) paintValues(view, values);
  if (groups) drawGroups(view, groups.map((g, i) => ({ ...g, id: 'f' + i, hue: HUES[i % HUES.length] })), n);
  if (mark !== undefined) {
    host.classList.add('ask');
    view.cells.forEach((cell, m) => {
      cell.querySelector('.v').textContent = m === mark ? '?' : '';
      cell.classList.toggle('sel', m === mark);
    });
  }
  return host;
}

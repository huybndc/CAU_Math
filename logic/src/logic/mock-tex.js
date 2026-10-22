/* LaTeX cho "Đề như thật" của Logic (thuần): bản đồ Karnaugh, bảng, chuỗi nhị phân. Công thức nằm giữa $…$. */
export const M = s => `$${s}$`;
export const bin = (x, n = 4) => x.toString(2).padStart(n, '0');
const GRAY = [0, 1, 3, 2];
const cell = v => (v === 1 ? '1' : v === 0 ? '0' : '\\times');

/** Bản đồ K n = 3 (hàng: x; cột: yz) hoặc n = 4 (hàng: wx; cột: yz). Chỉ số ô = bit(các biến theo thứ tự tên). */
export function kmap(values, names) {
  const n = names.length, rowVars = names.slice(0, n - 2).join(''), colVars = names.slice(n - 2).join('');
  const rows = n === 4 ? GRAY : [0, 1], width = n === 4 ? 2 : 1;
  const head = GRAY.map(c => bin(c, 2)).join(' & ');
  const body = rows.map(r => `${bin(r, width)} & ${GRAY.map(c => cell(values[(r << 2) | c])).join(' & ')}`).join(' \\\\ ');
  return `\\begin{array}{c|cccc} ${rowVars}\\backslash ${colVars} & ${head} \\\\ \\hline ${body} \\end{array}`;
}

/** Bảng nhị phân: cols = tên cột, rows = mảng hàng (chuỗi/số). */
export function table(cols, rows) {
  return `\\begin{array}{${'c'.repeat(cols.length)}} ${cols.join(' & ')} \\\\ \\hline ${rows.map(r => r.join(' & ')).join(' \\\\ ')} \\end{array}`;
}

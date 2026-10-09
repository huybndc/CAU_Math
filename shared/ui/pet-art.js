/* Ba nhân vật SVG TẠM (mèo, cú, cây; mỗi cái ≤ 3KB, viewBox 64×64): chỉ là chỗ giữ; nghệ thuật thật do Study_Hub làm nguồn (design-pets.json) và sẽ thay file này. Mỗi nhân vật có mắt thường (.pe) và mắt vui (.ph). */
const S = 'stroke:var(--line-strong);stroke-width:2;stroke-linejoin:round';
const ARC = 'fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round';
const eyes = (xs, y, r) => `<g class="pe">${xs.map(x => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:var(--ink)"/>`).join('')}</g><g class="ph">${xs.map(x => `<path d="M${x - 3.5} ${y + 1}q3.5-5.5 7 0" style="${ARC}"/>`).join('')}</g>`;
const FACE = eyes([23, 41], 35, 3);
const CHEEK = '<circle cx="17" cy="43" r="3.5" style="fill:var(--accent);opacity:.35"/><circle cx="47" cy="43" r="3.5" style="fill:var(--accent);opacity:.35"/>';
const SMILE = '<path d="M28 44q4 4 8 0" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/>';
const svg = body => `<svg viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="" focusable="false">${body}</svg>`;

export const PET_ART = {
  cat: svg(`<path d="M14 24 8 8l16 8zM50 24 56 8 40 16z" style="fill:var(--panel2);${S}"/><ellipse cx="32" cy="38" rx="24" ry="20" style="fill:var(--panel2);${S}"/>${FACE}${SMILE}${CHEEK}`),
  owl: svg(`<path d="M12 22 10 8l14 8zM52 22 54 8 40 16z" style="fill:var(--panel2);${S}"/><ellipse cx="32" cy="38" rx="22" ry="22" style="fill:var(--panel2);${S}"/><circle cx="23" cy="33" r="8" style="fill:var(--panel);${S}"/><circle cx="41" cy="33" r="8" style="fill:var(--panel);${S}"/>${eyes([23, 41], 33, 3.5)}<path d="M28 42h8l-4 6z" style="fill:var(--accent);stroke:none"/><path d="M14 46q-4 8 4 10M50 46q4 8-4 10" style="fill:none;stroke:var(--line-strong);stroke-width:2;stroke-linecap:round"/>`),
  plant: svg(`<path d="M32 38V22" style="fill:none;stroke:var(--ink-dim);stroke-width:2.5;stroke-linecap:round"/><path d="M32 26C30 14 20 10 12 12c0 10 8 16 20 14zM32 22C34 10 44 6 52 8c0 10-8 16-20 14z" style="fill:var(--accent);opacity:.55;${S}"/><path d="M16 38h32l-4 20H20z" style="fill:var(--panel2);${S}"/>${eyes([27, 37], 46, 2.5)}<path d="M29 51q3 3 6 0" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/>`),
};

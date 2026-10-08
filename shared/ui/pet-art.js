/* Ba nhân vật SVG (mỗi cái ≤ 3KB, viewBox 64×64, màu lấy từ token qua style=…): mèo, cú, cây. Không ảnh, không thư viện. */
const S = 'stroke:var(--line-strong);stroke-width:2;stroke-linejoin:round';
const FACE = '<circle cx="23" cy="35" r="3" style="fill:var(--ink)"/><circle cx="41" cy="35" r="3" style="fill:var(--ink)"/>';
const CHEEK = '<circle cx="17" cy="43" r="3.5" style="fill:var(--accent);opacity:.35"/><circle cx="47" cy="43" r="3.5" style="fill:var(--accent);opacity:.35"/>';
const SMILE = '<path d="M28 44q4 4 8 0" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/>';
const svg = body => `<svg viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="" focusable="false">${body}</svg>`;

export const PET_ART = {
  cat: svg(`<path d="M14 24 8 8l16 8zM50 24 56 8 40 16z" style="fill:var(--panel2);${S}"/><ellipse cx="32" cy="38" rx="24" ry="20" style="fill:var(--panel2);${S}"/>${FACE}${SMILE}${CHEEK}`),
  owl: svg(`<path d="M12 22 10 8l14 8zM52 22 54 8 40 16z" style="fill:var(--panel2);${S}"/><ellipse cx="32" cy="38" rx="22" ry="22" style="fill:var(--panel2);${S}"/><circle cx="23" cy="33" r="8" style="fill:var(--panel);${S}"/><circle cx="41" cy="33" r="8" style="fill:var(--panel);${S}"/><circle cx="23" cy="33" r="3.5" style="fill:var(--ink)"/><circle cx="41" cy="33" r="3.5" style="fill:var(--ink)"/><path d="M28 42h8l-4 6z" style="fill:var(--accent);stroke:none"/><path d="M14 46q-4 8 4 10M50 46q4 8-4 10" style="fill:none;stroke:var(--line-strong);stroke-width:2;stroke-linecap:round"/>`),
  plant: svg(`<path d="M32 38V22" style="fill:none;stroke:var(--ink-dim);stroke-width:2.5;stroke-linecap:round"/><path d="M32 26C30 14 20 10 12 12c0 10 8 16 20 14zM32 22C34 10 44 6 52 8c0 10-8 16-20 14z" style="fill:var(--accent);opacity:.55;${S}"/><path d="M16 38h32l-4 20H20z" style="fill:var(--panel2);${S}"/><circle cx="27" cy="46" r="2.5" style="fill:var(--ink)"/><circle cx="37" cy="46" r="2.5" style="fill:var(--ink)"/><path d="M29 51q3 3 6 0" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/>`),
};

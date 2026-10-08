/* Ba nhân vật SVG (mỗi cái ≤ 3KB, viewBox 64×64, màu lấy từ token qua style=…): mèo, giọt nước, rô-bốt. Không ảnh, không thư viện. */
const S = 'stroke:var(--line-strong);stroke-width:2;stroke-linejoin:round';
const FACE = '<circle cx="23" cy="35" r="3" style="fill:var(--ink)"/><circle cx="41" cy="35" r="3" style="fill:var(--ink)"/>';
const CHEEK = '<circle cx="17" cy="43" r="3.5" style="fill:var(--accent);opacity:.35"/><circle cx="47" cy="43" r="3.5" style="fill:var(--accent);opacity:.35"/>';
const SMILE = '<path d="M28 44q4 4 8 0" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/>';
const svg = body => `<svg viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="" focusable="false">${body}</svg>`;

export const PET_ART = {
  cat: svg(`<path d="M14 24 8 8l16 8zM50 24 56 8 40 16z" style="fill:var(--panel2);${S}"/><ellipse cx="32" cy="38" rx="24" ry="20" style="fill:var(--panel2);${S}"/>${FACE}${SMILE}${CHEEK}`),
  blob: svg(`<path d="M8 54C6 30 18 12 32 12s26 18 24 42z" style="fill:var(--panel2);${S}"/><ellipse cx="22" cy="26" rx="5" ry="3" style="fill:var(--panel);opacity:.8"/>${FACE}${SMILE}${CHEEK}`),
  bot: svg(`<path d="M32 6v8" style="fill:none;${S}"/><circle cx="32" cy="6" r="3" style="fill:var(--accent)"/><rect x="10" y="14" width="44" height="40" rx="10" style="fill:var(--panel2);${S}"/><rect x="18" y="26" width="28" height="14" rx="6" style="fill:var(--panel);stroke:var(--line-strong);stroke-width:1.5"/><circle cx="26" cy="33" r="3" style="fill:var(--ink)"/><circle cx="38" cy="33" r="3" style="fill:var(--ink)"/><path d="M24 46h16" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/>`),
};

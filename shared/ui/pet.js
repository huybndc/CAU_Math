import { el } from './dom.js';
import { t as T } from '../i18n/index.js';
import { load, save } from './store.js';

/* ---------------------------------------------------------------
   KHU GIẢI TRÍ nhỏ ở Tổng quan: một nhân vật SVG thở nhẹ (keyframes `pet`, shared/style/pet.css).
   Mặc định TẮT; bật/tắt lưu theo môn (khoá `pet:<môn>`). Giảm chuyển động ⇒ đứng yên. Không ảnh, không thư viện.
   --------------------------------------------------------------- */

const ART = `<svg viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="" focusable="false">
<path d="M14 24 8 8l16 8zM50 24 56 8 40 16z" style="fill:var(--panel2);stroke:var(--line-strong);stroke-width:2;stroke-linejoin:round"/>
<ellipse cx="32" cy="38" rx="24" ry="20" style="fill:var(--panel2);stroke:var(--line-strong);stroke-width:2"/>
<circle cx="23" cy="35" r="3" style="fill:var(--ink)"/><circle cx="41" cy="35" r="3" style="fill:var(--ink)"/>
<path d="M28 44q4 4 8 0" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/>
<circle cx="17" cy="43" r="3.5" style="fill:var(--accent);opacity:.35"/><circle cx="47" cy="43" r="3.5" style="fill:var(--accent);opacity:.35"/></svg>`;

export function petBlock() {
  const on = load('pet', false) === true;
  const label = v => T(v ? 'pet.hide' : 'pet.show');
  const btn = el('button', { type: 'button', class: 'pet-toggle', 'aria-pressed': String(on), text: label(on) });
  const box = el('div', { class: `pet${on ? ' on' : ''}` }, [btn, el('span', { class: 'pet-art', 'aria-hidden': 'true', html: ART })]);
  btn.addEventListener('click', () => {
    const next = !box.classList.contains('on');
    box.classList.toggle('on', next);
    btn.setAttribute('aria-pressed', String(next));
    btn.textContent = label(next);
    save('pet', next);
  });
  return box;
}

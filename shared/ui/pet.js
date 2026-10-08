import { el } from './dom.js';
import { KINDS, normalizePet } from '../logic/pet.js';
import { PET_ART } from './pet-art.js';

/* ---------------------------------------------------------------
   KHU GIẢI TRÍ nhỏ: nút Bật/Tắt + 3 nút chọn nhân vật (mèo, cú, cây); keyframes `pet` thở nhẹ (shared/style/pet.css).
   Mặc định TẮT. Không phụ thuộc store/i18n để Hub dùng lại qua mirror: nơi gọi truyền
   storage = { get(): any, set({on, kind}) } và labels = { on, off, cat, owl, plant, aria }.
   --------------------------------------------------------------- */
export function petBlock(storage, labels) {
  let st = normalizePet(storage.get());
  const art = el('span', { class: 'pet-art', 'aria-hidden': 'true' });
  const toggle = el('button', { type: 'button', class: 'pet-toggle' });
  const kinds = el('div', { class: 'pet-kinds', role: 'radiogroup', 'aria-label': labels.aria }, KINDS.map(k =>
    el('button', { type: 'button', class: 'pet-kind', role: 'radio', 'data-kind': k, text: labels[k], onClick: () => { st = { ...st, kind: k }; paint(); storage.set(st); } })));
  const box = el('div', { class: 'pet' }, [art, el('div', { class: 'pet-ctl' }, [toggle, kinds])]);
  toggle.addEventListener('click', () => { st = { ...st, on: !st.on }; paint(); storage.set(st); });
  function paint() {
    box.dataset.pet = st.on ? st.kind : 'off';
    art.innerHTML = st.on ? PET_ART[st.kind] : '';
    toggle.textContent = st.on ? labels.off : labels.on;
    toggle.setAttribute('aria-pressed', String(st.on));
    kinds.hidden = !st.on;
    kinds.querySelectorAll('.pet-kind').forEach(b => b.setAttribute('aria-checked', String(b.dataset.kind === st.kind)));
  }
  paint();
  return box;
}

import { el } from './dom.js';
import { PETS, normalizePet } from '../logic/pet.js';
import { PET_ART } from './pet-art.js';

/* ---------------------------------------------------------------
   KHU GIẢI TRÍ nhỏ: chọn một trong ba nhân vật SVG (hoặc tắt); keyframes `pet` thở nhẹ (shared/style/pet.css).
   Mặc định TẮT. Không phụ thuộc store/i18n để Hub dùng lại qua mirror: nơi gọi truyền
   storage = { get(): any, set(v) } và labels = { off, cat, blob, bot, aria }.
   --------------------------------------------------------------- */
export function petBlock(storage, labels) {
  const art = el('span', { class: 'pet-art', 'aria-hidden': 'true' });
  const pick = el('select', { class: 'pet-pick', 'aria-label': labels.aria }, PETS.map(p => el('option', { value: p, text: labels[p] })));
  const box = el('div', { class: 'pet' }, [pick, art]);
  const show = v => { box.dataset.pet = v; pick.value = v; art.innerHTML = PET_ART[v] ?? ''; };
  show(normalizePet(storage.get()));
  pick.addEventListener('change', () => { const v = normalizePet(pick.value); show(v); storage.set(v); });
  return box;
}

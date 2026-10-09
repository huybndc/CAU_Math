import { el } from './dom.js';
import { KINDS, normalizePet } from '../logic/pet.js';
import { PET_ART } from './pet-art.js';

/* ---------------------------------------------------------------
   KHU GIẢI TRÍ nhỏ: nhân vật SVG thở nhẹ (keyframes `pet`, shared/style/pet.css) + MỘT biểu tượng cài đặt nhỏ cạnh nhân vật;
   bấm vào đó mở menu nhỏ: Bật/Tắt và chọn Mèo · Cú · Cây. Bấm nhân vật ⇒ mắt vui ~1,6 giây + một câu ngắn (xoay vòng);
   rê chuột hiện tên (title). Mặc định BẬT; tắt thì chỉ còn biểu tượng cài đặt. Không phụ thuộc store/i18n để Hub mirror: nơi gọi truyền
   storage = { get(): any, set({on, kind}) } và labels = { on, off, aria, settings, say: [câu…], cat, owl, plant }.
   --------------------------------------------------------------- */
const GEAR = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

export function petBlock(storage, labels) {
  let st = normalizePet(storage.get());
  let said = 0, timer = 0;
  const art = el('button', { type: 'button', class: 'pet-art' });
  const say = el('span', { class: 'pet-say', role: 'status' });
  const gear = el('button', { type: 'button', class: 'pet-gear', title: labels.settings, 'aria-label': labels.settings, 'aria-haspopup': 'true', 'aria-expanded': 'false', html: GEAR });
  const toggle = el('button', { type: 'button', class: 'pet-toggle' });
  const kinds = el('div', { class: 'pet-kinds', role: 'radiogroup', 'aria-label': labels.aria }, KINDS.map(k =>
    el('button', { type: 'button', class: 'pet-kind', role: 'radio', 'data-kind': k, text: labels[k], onClick: () => { st = { ...st, kind: k }; paint(); storage.set(st); } })));
  const menu = el('div', { class: 'pet-menu', hidden: true }, [toggle, kinds]);
  const box = el('div', { class: 'pet' }, [el('div', { class: 'pet-stage' }, [art, gear, menu]), say]);

  const open = v => { menu.hidden = !v; gear.setAttribute('aria-expanded', String(v)); };
  gear.addEventListener('click', e => { e.stopPropagation(); open(menu.hidden); });
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) open(false); });
  box.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { open(false); gear.focus(); } });
  toggle.addEventListener('click', () => { st = { ...st, on: !st.on }; paint(); storage.set(st); });
  art.addEventListener('click', () => {
    clearTimeout(timer);
    box.classList.add('happy');
    say.textContent = labels.say[said++ % labels.say.length];
    timer = setTimeout(() => { box.classList.remove('happy'); say.textContent = ''; }, 1600);
  });
  function paint() {
    clearTimeout(timer); box.classList.remove('happy'); say.textContent = '';
    box.dataset.pet = st.on ? st.kind : 'off';
    art.innerHTML = st.on ? PET_ART[st.kind] : '';
    art.title = art.ariaLabel = st.on ? labels[st.kind] : '';
    toggle.textContent = st.on ? labels.off : labels.on;
    toggle.setAttribute('aria-pressed', String(st.on));
    kinds.hidden = !st.on;
    kinds.querySelectorAll('.pet-kind').forEach(b => b.setAttribute('aria-checked', String(b.dataset.kind === st.kind)));
  }
  paint();
  return box;
}

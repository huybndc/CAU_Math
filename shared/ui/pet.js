import { el } from './dom.js';
import { KINDS, normalizePet, petSvg, label, BLINK_MS, CLICK, HOVER } from '../logic/pet.js';

/* ---------------------------------------------------------------
   Nhân vật (dựng từ design-pets.json, không chữ trên giao diện): bấm = vui, rê = ngạc nhiên, chớp mắt định kỳ.
   Bánh răng nhỏ cạnh tiêu đề → popover: 4 ô chọn nhân vật + công tắc Bật/Tắt. Mặc định BẬT; tắt thì chỉ còn bánh răng.
   Không phụ thuộc store/i18n để Hub mirror: nơi gọi truyền storage = { get(), set({on, kind}) } và labels = { settings, show }; trả { art, ctl }.
   --------------------------------------------------------------- */
const GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

export function petBlock(storage, labels) {
  let st = normalizePet(storage.get());
  let react = 0, blink = 0;
  const face = el('button', { type: 'button', class: 'pet-face' });
  const gear = el('button', { type: 'button', class: 'pet-gear', title: labels.settings, 'aria-label': labels.settings, 'aria-haspopup': 'true', 'aria-expanded': 'false', html: GEAR });
  const opts = el('div', { class: 'pet-opts', role: 'radiogroup', 'aria-label': labels.settings }, KINDS.map(k =>
    el('button', { type: 'button', class: 'pet-opt', role: 'radio', 'data-kind': k, 'aria-label': label(k), html: petSvg(k), onClick: () => set({ kind: k, on: true }) })));
  const sw = el('button', { type: 'button', class: 'pet-sw', role: 'switch', 'aria-label': labels.show, onClick: () => set({ on: !st.on }) }, el('i'));
  const pop = el('div', { class: 'pet-pop', hidden: true }, [opts, sw]);
  const box = el('span', { class: 'pet-ctl' }, [gear, pop]);   // cạnh tiêu đề "Tuần này"; nhân vật (face) đặt ở dải số

  const open = v => { pop.hidden = !v; gear.setAttribute('aria-expanded', String(v)); };
  const show = expr => { face.innerHTML = petSvg(st.kind, expr); };
  const swap = (expr, ms) => { clearTimeout(react); show(expr); react = setTimeout(() => show('neutral'), ms); };
  function set(patch) { st = { ...st, ...patch }; paint(); storage.set(st); }
  function paint() {
    clearTimeout(react);
    face.dataset.pet = st.on ? st.kind : 'off';
    face.hidden = !st.on;
    if (st.on) { face.setAttribute('aria-label', label(st.kind)); show('neutral'); }
    sw.setAttribute('aria-checked', String(st.on));
    opts.querySelectorAll('.pet-opt').forEach(b => b.setAttribute('aria-checked', String(b.dataset.kind === st.kind)));
  }
  gear.addEventListener('click', e => { e.stopPropagation(); open(pop.hidden); });
  document.addEventListener('click', e => { if (!pop.hidden && !pop.contains(e.target)) open(false); });
  box.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) { open(false); gear.focus(); } });
  face.addEventListener('click', () => swap(CLICK.expression, CLICK.ms));
  face.addEventListener('mouseenter', () => swap(HOVER.expression, HOVER.ms));
  clearInterval(petBlock.timer);
  petBlock.timer = setInterval(() => { if (!box.isConnected) clearInterval(petBlock.timer); else if (st.on) swap('blink', 140); }, BLINK_MS);
  paint();
  return { art: face, ctl: box };
}

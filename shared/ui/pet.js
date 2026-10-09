/* Nhân vật ở dải "Tuần này": không chữ nhìn thấy; nhãn chỉ cho trình đọc màn hình. Chọn qua bánh răng nhỏ cạnh tiêu đề → ô nhân vật + công tắc.
   Lựa chọn lưu theo tài khoản bằng sự kiện pet.set (bản mới nhất thắng), đồng bộ giữa Hub và app toán. */
import { el } from './dom.js';
import { KIND_IDS, petSvg, petOf, label } from '../logic/pet.js';
import { RULES, mood, shyBurst } from '../logic/pet-rules.js';
import { weekSummary } from '../logic/stats.js';

const GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
let popOpen = false;
let timer = 0;

// Bấm ra ngoài khối nhân vật thì đóng popover (đăng ký một lần).
document.addEventListener('click', e => {
  if (popOpen && !e.target.closest?.('.pet-ctl')) { popOpen = false; document.querySelector('.pet-pop')?.setAttribute('hidden', ''); document.querySelector('.pet-gear')?.setAttribute('aria-expanded', 'false'); }
});

/** Trả {art, ctl}: art = nhân vật (null khi tắt) đặt ở dải số; ctl = bánh răng + popover đặt cạnh tiêu đề "Tuần này". */
export function petBlock(ctx) {
  clearInterval(timer);
  const pet = petOf(ctx.data.hub);
  const set = patch => { popOpen = true; ctx.add('pet.set', { ...pet, ...patch }); ctx.render(); };

  let art = null;
  if (pet.on) {
    const now = Date.now(), w = weekSummary(ctx.acts, now);
    const base = mood({ now, lastTs: ctx.acts.reduce((m, a) => Math.max(m, a.ts), 0) || null, answered: w.answered, correct: w.correct });
    art = el('button', { class: 'pet-face', type: 'button', 'aria-label': label(pet.kind), html: petSvg(pet.kind, base) });
    const clicks = [];
    const swap = (expr, ms) => { if (!art.isConnected) return; art.innerHTML = petSvg(pet.kind, expr); setTimeout(() => { if (art.isConnected) art.innerHTML = petSvg(pet.kind, base); }, ms); };
    art.addEventListener('click', () => (shyBurst(clicks, Date.now()) ? swap(RULES.shy.expression, RULES.shy.ms) : swap(RULES.click.expression, RULES.click.ms)));
    art.addEventListener('mouseenter', () => swap(RULES.hover.expression, RULES.hover.ms));
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!still && base !== 'sleepy') timer = setInterval(() => (art.isConnected ? swap('blink', 140) : clearInterval(timer)), RULES.blinkEveryMs);
  }

  const pop = el('div', { class: 'pet-pop', hidden: !popOpen }, [
    el('div', { class: 'pet-opts', role: 'radiogroup', 'aria-label': 'Nhân vật' }, KIND_IDS.map(k => el('button', {
      class: 'pet-opt', type: 'button', role: 'radio', 'aria-checked': String(pet.kind === k), 'aria-label': label(k), html: petSvg(k), onclick: () => set({ kind: k, on: true }),
    }))),
    el('button', { class: 'pet-sw', type: 'button', role: 'switch', 'aria-checked': String(pet.on), 'aria-label': 'Hiện nhân vật', onclick: () => set({ on: !pet.on }) }, el('i')),
  ]);
  const gear = el('button', { class: 'pet-gear', type: 'button', 'aria-label': 'Cài đặt nhân vật', 'aria-expanded': String(popOpen), html: GEAR, onclick: () => {
    popOpen = !popOpen; pop.hidden = !popOpen; gear.setAttribute('aria-expanded', String(popOpen));
  } });
  return { art, ctl: el('span', { class: 'pet-ctl' }, [gear, pop]) };
}

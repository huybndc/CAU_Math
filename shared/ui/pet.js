/* Nhân vật ở dải "Tuần này": không chữ nhìn thấy; nhãn chỉ cho trình đọc màn hình. Chọn qua bánh răng nhỏ cạnh tiêu đề → ô nhân vật + công tắc.
   Lựa chọn lưu theo tài khoản bằng sự kiện pet.set (bản mới nhất thắng), đồng bộ giữa Hub và app toán. */
import { el } from './dom.js';
import { KIND_IDS, petSvg, petOf, label } from '../logic/pet.js';
import { createPet, SIGNATURE } from '../logic/pet-engine.js';
import { RULES, mood, shyBurst, pettedBurst, answerStats, greeting } from '../logic/pet-rules.js';
import { weekSummary } from '../logic/stats.js';

const GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
let popOpen = false;
let timers = [];                 // mọi hẹn giờ của nhân vật hiện tại; dọn khi vẽ lại
const GREET_KEY = 'study-pet-greeted';
const SCALE = 1.5;
const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

// Bấm ra ngoài khối nhân vật thì đóng popover (đăng ký một lần).
document.addEventListener('click', e => {
  if (popOpen && !e.target.closest?.('.pet-ctl')) { popOpen = false; document.querySelector('.pet-pop')?.setAttribute('hidden', ''); document.querySelector('.pet-gear')?.setAttribute('aria-expanded', 'false'); }
});

/** Trả {art, ctl}: art = nhân vật (null khi tắt) đặt ở dải số; ctl = bánh răng + popover đặt cạnh tiêu đề "Tuần này".
 *  ctx.petSignals?.(now) (tuỳ chọn, app chủ cấp): {newNote, examDays, relieved}. */
export function petBlock(ctx) {
  timers.forEach(clearTimeout); timers = [];     // clearTimeout cũng dừng được setInterval
  const pet = petOf(ctx.data.hub);
  const set = patch => { popOpen = true; ctx.add('pet.set', { ...pet, ...patch }); ctx.render(); };

  let art = null;
  if (pet.on) {
    const now = Date.now(), w = weekSummary(ctx.acts, now), st = answerStats(ctx.acts, now);
    const lastTs = ctx.acts.reduce((m, a) => Math.max(m, a.ts), 0) || null;
    const base = mood({ now, lastTs, answered: w.answered, correct: w.correct, ...st, signals: safe(() => ctx.petSignals?.(now), null) ?? {} });
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const eng = createPet(pet.kind), cv = el('canvas', { class: 'pet-art', width: eng.w, height: eng.h }), c2 = cv.getContext('2d');
    cv.style.width = `${eng.w * SCALE}px`; cv.style.height = `${eng.h * SCALE}px`;   // 1,5 px/ô = 3 px thiết bị trên màn retina (nét đều); ~67px cao như nhân vật cũ
    const inner = el('span', { class: 'pet-in' }, cv);
    art = el('button', { class: 'pet-face', type: 'button', 'aria-label': label(pet.kind) }, inner);
    art.dataset.mood = base;
    // động tác riêng của bộ phận nguyên tố (đuôi, đầu…): một lần, p = giây đã trôi
    const S = { expr: base, sig: null, t0: 0 };
    const lull = base === 'sleepy' ? 0.6 : 0;
    const draw = () => {
      const t = performance.now() / 1000;
      let p = S.sig ? t - S.t0 : 0;
      if (S.sig && p > SIGNATURE[pet.kind][S.sig]) { S.sig = null; p = 0; }
      const g = eng.render({ t, expr: S.expr, act: S.sig, p, lull, fx: !still });
      c2.clearRect(0, 0, eng.w, eng.h);
      g.forEach((row, y) => row.forEach((c, x) => { if (c) { c2.fillStyle = c; c2.fillRect(x, y, 1, 1); } }));
    };
    const signature = name => { if (still || !SIGNATURE[pet.kind][name]) return; S.sig = name; S.t0 = performance.now() / 1000; };
    draw();
    if (!still) timers.push(setInterval(() => { if (art.isConnected) draw(); }, 100));
    const later = (fn, ms) => { timers.push(setTimeout(() => { if (art.isConnected) fn(); }, ms)); };
    let hold = false, hovering = false, show = base;
    const put = x => { show = x; S.expr = x; draw(); };
    const swap = (expr, ms) => { put(expr); later(() => { if (show === expr) put(hovering ? RULES.hover.look : base); }, ms); };
    const act = name => { if (still || !name) return; inner.dataset.act = ''; void inner.offsetWidth; inner.dataset.act = name; };   // động tác thân một lần (CSS pet-*)
    inner.addEventListener('animationend', () => { inner.dataset.act = ''; });

    // lần mở đầu tiên trong ngày: chào
    const today = new Date(now).toDateString();
    if (safe(() => localStorage.getItem(GREET_KEY), today) !== today) {
      safe(() => localStorage.setItem(GREET_KEY, today));
      const g = greeting({ now, lastTs });
      if (g) { swap(g.expression, g.ms); act(g.expression === 'wave' ? RULES.acts.greet : RULES.acts.morning); }
    }

    const clicks = [], turns = [];
    let n = 0, lastX = null, dir = 0;
    art.addEventListener('click', () => {
      if (hold) { hold = false; return; }
      if (shyBurst(clicks, Date.now())) { swap(RULES.shy.expression, RULES.shy.ms); act(RULES.acts.shy); }
      else { swap(RULES.click.expressions[n++ % RULES.click.expressions.length], RULES.click.ms); act(RULES.acts.click); signature(RULES.persona[pet.kind].sig[n % 2]); }
    });
    art.addEventListener('dblclick', () => {
      swap(RULES.dblclick.expression, RULES.click.ms);
      act(RULES.acts.dblclick);
    });
    art.addEventListener('mouseenter', () => { hovering = true; swap(RULES.hover.expression, RULES.hover.ms); act(RULES.acts.hover); });
    art.addEventListener('mousemove', e => {
      const box = art.getBoundingClientRect(), dx = lastX == null ? 0 : e.clientX - lastX;
      if (Math.abs(dx) >= 3) {
        const d = Math.sign(dx);
        if (dir && d !== dir && pettedBurst(turns, Date.now())) { swap(RULES.petted.expression, RULES.petted.ms); act(RULES.acts.petted); }
        dir = d; lastX = e.clientX;
      } else if (lastX == null) lastX = e.clientX;
      if (show === base || show === RULES.hover.look) put(e.clientX > box.left + box.width / 2 + box.width * 0.1 ? RULES.hover.look : base);
    });
    art.addEventListener('mouseleave', () => { hovering = false; lastX = null; dir = 0; if (show === RULES.hover.look) put(base); });
    let holdTimer = 0;
    art.addEventListener('mousedown', () => { holdTimer = setTimeout(() => { hold = true; put(RULES.hold.expression); inner.dataset.pose = RULES.acts.poses.tilt; }, RULES.hold.afterMs); timers.push(holdTimer); });
    const release = () => { clearTimeout(holdTimer); delete inner.dataset.pose; if (show === RULES.hold.expression) put(base); };
    art.addEventListener('mouseup', release);
    art.addEventListener('mouseleave', release);

    // chớp mắt ngẫu nhiên; thỉnh thoảng nháy mắt hoặc nét riêng của nhân vật. Dừng khi giảm chuyển động hoặc đang buồn ngủ.
    if (!still && base !== 'sleepy') {
      let i = 0;
      const tick = () => later(() => { if (show === base) swap('blink', 140); tick(); }, RULES.blinkEveryMs * (0.5 + Math.random()));
      const idle = () => later(() => { if (show === base) swap(i++ % 2 ? (RULES.persona[pet.kind]?.idle ?? RULES.idle.expression) : RULES.idle.expression, RULES.idle.ms); idle(); }, RULES.idle.everyMs * (0.6 + Math.random() * 0.8));
      tick(); idle();
    }
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

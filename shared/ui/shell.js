import { $ } from './dom.js';
import { setupLangSwitch, onLangChange, t as T } from '../i18n/index.js';
import { setupScratch } from './scratch.js';
import { setupTips } from './tip.js';
import { setupPalette } from './palette.js';
import { startRouter, currentRoute } from './router.js';
import { showRoute } from './screens.js';
import { startSync } from './sync.js';
import { setupScreenHelp } from './screen-help.js';
import { syncProgress } from './store.js';

/* ---------------------------------------------------------------
   KHUNG CHUNG của mỗi app: menu theo việc (Tổng quan · Học · Luyện tập ·
   Thi thử), nút sáng/tối, nút mây đồng bộ (D37), VI/EN, nháp, nút ⓘ thay cho đoạn chữ hướng dẫn.
   main.js của app gọi setupShell(cfg) — cfg mô tả chương và ngân hàng câu.
   --------------------------------------------------------------- */

const THEME_KEY = 'study-theme';

/** Nút sáng/tối. Báo 'themechange' để canvas (đọc màu từ biến CSS) vẽ lại. */
export function setupTheme() {
  const btn = $('#theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, root.dataset.theme); } catch { /* chế độ riêng tư */ }
    window.dispatchEvent(new Event('themechange'));
  });
}

/**
 * Thu gọn menu trái thành cột icon (≥761px). Nhớ theo trình duyệt, chung khoá `study-nav` với Hub (cùng origin).
 * Nút ☰ đứng đầu hàng tên app (giống Live_Lecture); CSS ở modules.css.
 */
export function setupNavCollapse() {
  const brand = $('.nav-brand');
  if (!brand) return;
  const btn = Object.assign(document.createElement('button'), { type: 'button', className: 'nav-collapse' });
  const set = min => {
    document.documentElement.dataset.nav = min ? 'min' : '';
    btn.setAttribute('aria-pressed', String(min));
    btn.title = btn.ariaLabel = T(min ? 'shell.navOpen' : 'shell.navClose');
  };
  let min = false;
  try { min = localStorage.getItem('study-nav') === 'min'; } catch { /* riêng tư */ }
  set(min);
  btn.addEventListener('click', () => {
    min = !min;
    set(min);
    try { localStorage.setItem('study-nav', min ? 'min' : ''); } catch { /* riêng tư */ }
  });
  onLangChange(() => set(min));
  // cột icon: tên mục hiện khi rê chuột
  $('.appnav').addEventListener('pointerover', e => {
    const a = e.target.closest('.tab');
    if (a) a.title = document.documentElement.dataset.nav === 'min' ? a.textContent.trim() : '';
  });
  const head = Object.assign(document.createElement('div'), { className: 'nav-head' });
  brand.before(head);
  head.append(btn, brand);
}

/* ---------------- gợi ý: đoạn .hint → nút ⓘ mở popover ---------------- */

let hintSeq = 0;

/** Đặt popover ngay dưới nút ⓘ, không tràn khỏi màn hình. */
function place(pop, btn) {
  const r = btn.getBoundingClientRect();
  const left = Math.max(16, Math.min(r.left - 12, innerWidth - pop.offsetWidth - 16));
  const below = r.bottom + 8;
  const top = below + pop.offsetHeight > innerHeight - 16 ? r.top - pop.offsetHeight - 8 : below;
  pop.style.left = left + 'px';
  pop.style.top = Math.max(16, top) + 'px';
}

/**
 * Mỗi phần tử .hint (chữ hướng dẫn, vẫn giữ data-i18n nên đổi ngôn ngữ vẫn
 * đúng) thành một popover, mở bằng nút ⓘ cạnh tiêu đề panel chứa nó.
 * Chữ hướng dẫn không còn chiếm chỗ trên màn hình, cần thì mới xem.
 */
export function upgradeHints(root = document) {
  root.querySelectorAll('.hint:not([popover])').forEach(h => {
    h.id ||= 'hint-' + (++hintSeq);
    h.setAttribute('popover', '');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'info';
    btn.textContent = 'i';
    btn.setAttribute('popovertarget', h.id);
    btn.setAttribute('aria-expanded', 'false');
    const head = h.closest('.card')?.querySelector(':scope > h2');
    if (head) head.append(btn); else h.before(btn);
    h.addEventListener('toggle', e => {
      const open = e.newState === 'open';
      btn.setAttribute('aria-expanded', String(open));
      if (open) place(h, btn);
    });
  });
  labelHints();
}

function labelHints() {
  document.querySelectorAll('button.info').forEach(b => {
    b.setAttribute('aria-label', T('shell.hint'));
    b.title = T('shell.hint');
  });
}

/** Link sang Study Hub và Live Lecture ở cuối menu. Địa chỉ lấy lúc build từ .env.local (VITE_HUB_URL, VITE_LIVE_URL),
 *  không ghi trong repo công khai; thiếu biến thì không hiện link đó. */
function addAppLinks() {
  const tabs = document.querySelector('.appnav .tabs');
  if (!tabs || tabs.querySelector('.app-link')) return;
  const env = import.meta.env ?? {};
  for (const [url, key, app] of [[env.VITE_HUB_URL, 'shell.hub', 'hub'], [env.VITE_LIVE_URL, 'shell.live', 'live']]) {
    if (!url) continue;
    const a = document.createElement('a');
    Object.assign(a, { className: 'tab app-link', href: url, textContent: T(key) });
    Object.assign(a.dataset, { i18n: key, app });
    tabs.append(a);
  }
}

/**
 * @param {{ chapters: {id:string, bank?:object, prefix?:string}[], figures?:object,
 *           widgets?:object, lesson?:(chId:string)=>string }} cfg
 */
let markReady;
/** Xong ở cuối setupShell: các máy giải đọc ô nhập đã nhớ SAU mốc này (đồng bộ thư mục ở máy dev có thể vừa nạp dữ liệu). */
export const shellReady = new Promise(r => { markReady = r; });

export async function setupShell(cfg) {
  setupLangSwitch();
  setupTheme();
  setupNavCollapse();
  upgradeHints();
  setupTips();
  setupScratch();
  addAppLinks();
  startSync();
  syncProgress();
  const help = setupScreenHelp();
  startRouter(cfg.chapters.map(c => c.id), r => { showRoute(r, cfg); help.set(r); });
  setupPalette(cfg);
  onLangChange(() => { showRoute(currentRoute(), cfg); labelHints(); help.set(currentRoute()); });
  markReady();
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.hint:popover-open').forEach(h => h.hidePopover());
  }, { passive: true });
}

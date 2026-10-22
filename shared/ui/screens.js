import { $, el } from './dom.js';
import { t as T } from '../i18n/index.js';
import { chNo, chapterTitle } from './choices.js';
import { renderHome } from './home-screen.js';
import { renderLearn } from './learn-screen.js';
import { renderFree } from './free-screen.js';
import { renderMock } from './mock-screen.js';

/* ---------------------------------------------------------------
   CÁC MÀN CỦA MỘT APP (menu theo việc — RESEARCH U-R1..U-R3):
     home      Tổng quan (home-screen.js)
     learn     mục lục dạng cây: chương → thẻ (learn-screen.js)
     pane      một khung có sẵn của trang chương (ví dụ, công cụ, bài luyện cũ)
     tools     Công cụ: mọi công cụ bấm thử + ví dụ giải sẵn, gom theo chương (đọc từ các khung)
     free      Tự luận: đề · gợi ý · lời giải từng bước (free-screen.js)
     mock      Đề như thật: mã đề, in đề / đáp án (mock-screen.js)
   cfg = { chapters: [{ id, bank?, prefix? }], figures, widgets, lesson(chId) → md }
   --------------------------------------------------------------- */

/* ---------------- Công cụ: gom công cụ của mọi chương lên một màn ---------------- */
/** Tiêu đề một công cụ = chữ của thẻ h2 (bỏ nút ⓘ đi kèm). */
/** Tiêu đề thẻ: h2 trực tiếp, hoặc h2 trong summary khi thẻ đã được gập (fold-cards.js). */
const CARD_TITLES = '.card > h2, .card > summary > h2';
const titleOf = h => [...h.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();

function renderTools(r, cfg) {
  // mỗi chương MỘT dòng (tên các công cụ ghi nhỏ); chuyển giữa các công cụ làm ngay trong trang công cụ
  const rows = cfg.chapters.map(c => {
    const names = [...($(`#pane-${c.id}-interactive`)?.querySelectorAll(CARD_TITLES) ?? [])].filter(h => !h.closest('.card .card')).map(h => titleOf(h).split(/[:(]/)[0].trim());
    return names.length && el('a', { class: 'tool-card', href: `#/learn/${c.id}/interactive/0`, title: names.join(' · ') }, [
      el('span', { class: 'tool-ico', 'aria-hidden': 'true' }),
      el('span', { class: 'tool-main' }, [el('b', { text: chapterTitle(c.id) }), el('small', { text: names.join(' · ') })]),
      el('span', { class: 'tool-go' }, [T('tools.count', { n: names.length }), el('i', { 'aria-hidden': 'true' })]),
    ]);
  }).filter(Boolean);
  $('#screen-tools').replaceChildren(
    el('h1', { text: T('nav.tools') }),
    el('p', { class: 'subtitle', text: T('tools.sub') }),
    el('div', { class: 'tool-cards' }, rows),
  );
  return T('nav.tools');
}

/* ---------------- một khung có sẵn của trang chương ---------------- */
function renderPane(r, cfg, c) {
  const sub = $(`#pane-${c.id}-${r.sub}`) ? r.sub : 'theory';
  const back = r.at != null ? 'tools' : 'learn';
  const label = T('learn.' + sub);
  $('#pane-head').replaceChildren(
    el('a', { class: 'back', href: '#/' + back, 'data-icon': 'prev', text: T('nav.' + back) }),
    el('p', { class: 'crumb', text: `${T('shell.chapter', { n: chNo(c.id) })} · ${label}` }),
    el('h1', { text: T('nav.' + c.id) }),
  );
  document.querySelectorAll('#screen-pane .page').forEach(p => p.classList.toggle('active', p.id === 'page-' + c.id));
  $('#page-' + c.id).querySelectorAll(':scope > .pane').forEach(p => p.classList.toggle('active', p.id === `pane-${c.id}-${sub}`));
  // canvas trong khung vừa hiện cần đo lại kích thước
  window.dispatchEvent(new Event('resize'));
  // Công cụ: MỖI LÚC MỘT công cụ (thanh tab chọn) — không xếp chồng nhiều thẻ dài trên một trang
  if (sub === 'interactive') {
    const pane = $(`#pane-${c.id}-interactive`);
    const cards = [...pane.querySelectorAll(':scope > .card')];
    const at = Math.min(Math.max(r.at ?? 0, 0), cards.length - 1);
    cards.forEach((card, i) => { card.hidden = i !== at; });
    if (cards.length > 1) {
      $('#pane-head').append(el('nav', { class: 'tool-tabs', 'aria-label': T('nav.tools') }, cards.map((card, i) => el('a', {
        href: `#/learn/${c.id}/interactive/${i}`, 'aria-current': i === at ? 'page' : null, text: titleOf(card.querySelector(':scope > h2')).split(/[:(]/)[0].trim(),   // tên ngắn: bỏ phần giải thích sau ':' hoặc '('
      }))));
    }
  }
  return `${T('nav.' + c.id)} · ${label}`;
}

/* ---------------- chọn màn theo địa chỉ ---------------- */
export function showRoute(r, cfg) {
  const c = r.ch && cfg.chapters.find(x => x.id === r.ch);
  let screen = r.view;
  if (r.view === 'learn' && c) screen = 'pane';
  document.querySelectorAll('#app > .screen').forEach(s => s.classList.toggle('active', s.dataset.screen === screen));
  const nav = r.view === 'learn' && r.at != null ? 'tools' : ['free', 'mock'].includes(r.view) ? 'mock' : r.view;
  document.querySelectorAll('.tab').forEach(t => {
    if (t.dataset.nav === nav) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
  });
  const render = { home: renderHome, learn: renderLearn, tools: renderTools, pane: renderPane, free: renderFree, mock: renderMock }[screen];
  document.title = `${render(r, cfg, c)} · ${T('app.short')}`;
}

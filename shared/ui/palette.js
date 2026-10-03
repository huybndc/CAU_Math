import { $, el } from './dom.js';
import { t as T } from '../i18n/index.js';
import { splitCards } from '../logic/cards.js';
import { seekLesson } from './lesson.js';
import { go } from './router.js';

/* ---------------------------------------------------------------
   TÌM NHANH (Ctrl/⌘ + K, hoặc "/"): gõ vài chữ → nhảy thẳng tới thẻ bài học, công cụ hoặc luyện tập một chương.
   Chỉ tìm trong những gì đã có trên máy (bài học markdown + tiêu đề công cụ trong trang), không gọi mạng.
   Bỏ dấu tiếng Việt khi so ("euclid", "dong du" tìm được "Đồng dư"); mọi từ gõ vào phải có mặt.
   --------------------------------------------------------------- */

const plain = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
const stripMd = s => s.replace(/<[^>]+>|[*_`#>|]/g, ' ');

/** Mọi mục tìm được theo ngôn ngữ hiện tại: { kind, title, sub, hay, open() }. */
function buildIndex(cfg) {
  const items = [];
  cfg.chapters.forEach(({ id }) => {
    const chap = T('nav.' + id);
    const md = cfg.lesson?.(id);
    if (md) splitCards(md).cards.forEach((c, i) => items.push({
      kind: 'lesson', title: c.title, sub: chap, hay: plain(stripMd(c.body)), open: () => { seekLesson(id, i); go(`#/learn/${id}/theory`); },
    }));
    [...document.querySelectorAll(`#pane-${id}-interactive .card > h2`)].forEach((h, i) => items.push({
      kind: 'tool', title: [...h.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(), sub: chap, hay: '',
      open: () => { location.hash = `#/learn/${id}/interactive/${i}`; },
    }));
    items.push({ kind: 'practice', title: chap, sub: '', hay: '', open: () => { location.hash = `#/practice/${id}`; } });
  });
  return items;
}

/** Xếp hạng: tiêu đề chứa đủ từ ⇒ trước; chỉ nội dung chứa đủ từ ⇒ sau. */
export function search(items, query, limit = 12) {
  const words = plain(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return items.map(it => {
    const t = plain(it.title + ' ' + it.sub);
    const inTitle = words.every(w => t.includes(w));
    const inBody = !inTitle && words.every(w => t.includes(w) || it.hay.includes(w));
    return { it, score: inTitle ? (t.startsWith(words[0]) ? 0 : 1) : inBody ? 2 : 9 };
  }).filter(x => x.score < 9).sort((a, b) => a.score - b.score).slice(0, limit).map(x => x.it);
}

export function setupPalette(cfg) {
  let dlg = null;
  const close = () => dlg?.close();
  function open() {
    if (dlg?.open) return;
    const items = buildIndex(cfg);
    let hits = [], at = 0;
    const input = el('input', { type: 'search', class: 'pal-in', placeholder: T('palette.placeholder'), autocomplete: 'off', spellcheck: 'false', 'aria-label': T('palette.title') });
    const list = el('ul', { class: 'pal-list', role: 'listbox' });
    const paint = () => list.replaceChildren(...(hits.length ? hits.map((h, i) => el('li', {
      role: 'option', 'aria-selected': String(i === at), class: 'pal-row',
      onClick: () => pick(h), onMouseMove: () => { if (at !== i) { at = i; paint(); } },
    }, [el('b', { text: h.title }), el('small', { text: [T('palette.' + h.kind), h.sub].filter(Boolean).join(' · ') })]))
      : input.value.trim() ? [el('li', { class: 'pal-none', text: T('palette.none') })] : []));
    const pick = h => { close(); h.open(); };
    input.addEventListener('input', () => { hits = search(items, input.value); at = 0; paint(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); at = hits.length ? (at + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length : 0; paint(); list.children[at]?.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'Enter' && hits[at]) { e.preventDefault(); pick(hits[at]); }
    });
    dlg = el('dialog', { class: 'palette', 'aria-label': T('palette.title') }, [input, list]);
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
    dlg.addEventListener('close', () => dlg.remove());
    document.body.append(dlg);
    dlg.showModal();
    input.focus();
  }
  document.addEventListener('keydown', e => {
    const typing = e.target.closest?.('input, textarea, select, [contenteditable]');
    if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey)) { e.preventDefault(); open(); }
  });
  // nút nhỏ ở chân menu trái cho ai không biết phím tắt
  const foot = $('.appnav-foot');
  if (foot && !foot.querySelector('.nav-search')) {
    const b = el('button', { type: 'button', class: 'nav-search', title: T('palette.title'), 'aria-label': T('palette.title'), onClick: open });
    foot.prepend(b);
  }
}

import { $, el } from './dom.js';
import { t as T, getLang } from '../i18n/index.js';
import { load, save } from './store.js';
import { chNo, chapterTitle, row, leadCard, practiceTabs, tag } from './choices.js';
import { mdNodes } from './lesson.js';
import { following } from '../logic/free.js';

/* ---------------------------------------------------------------
   TỰ LUẬN (đề giống bộ đề giáo trình): máy chỉ đưa đề, gợi ý theo thang và lời giải mẫu từng bước.
   Người học tự đối chiếu trên giấy; app không lưu đánh giá, không phát sự kiện (bỏ tự chấm 2026-10-22).
   cfg.free = mảng bài (shared/logic/free.js). #/free = danh sách · #/free/<id> = một bài.
   --------------------------------------------------------------- */

const text = p => p[getLang()] ?? p.vi;
const stars = n => '●'.repeat(n) + '○'.repeat(3 - n);
const md = s => el('div', { class: 'free-md' }, mdNodes(s.replace(/\n/g, '  \n')));    // xuống dòng đơn trong đề giữ nguyên

let sess = { id: null, hints: 0, shown: false };      // trạng thái lúc đang xem một bài — không lưu

export function renderFree(r, cfg) {
  const all = cfg.free ?? [];
  const p = r.id && all.find(x => x.id === r.id);
  const host = $('#screen-free');
  if (!p) { if (r.id) location.hash = '#/free'; return list(host, all, cfg); }
  return problem(host, p, all, cfg);
}

/* ---------------- danh sách ---------------- */
function list(host, all, cfg) {
  const chapters = cfg.chapters.filter(c => all.some(p => p.ch === c.id));
  const head = [el('h1', { text: T('nav.mock') }), practiceTabs('free')];
  if (!all.length) {
    host.replaceChildren(...head, leadCard({ title: T('free.none'), note: T('free.noneNote'), href: '#/mock', cta: T('nav.mock') }));
    return T('free.title');
  }
  const cur = chapters.find(c => c.id === load('free-ch', null)) ?? chapters[0];
  const mine = all.filter(p => p.ch === cur.id);
  const bar = el('div', { class: 'chapter-bar', role: 'group', 'aria-label': T('shell.chapters') },
    chapters.map(c => el('button', {
      type: 'button', 'aria-pressed': String(c.id === cur.id),
      onClick: () => { save('free-ch', c.id); renderFree({ view: 'free' }, cfg); },
    }, [el('b', { text: chNo(c.id) }), T('nav.' + c.id)])));
  host.replaceChildren(
    ...head,
    el('p', { class: 'subtitle', text: T('free.sub') }),
    el('div', { class: 'practice-bars' }, bar),
    leadCard({
      title: T('free.startTitle'), note: T('free.count', { n: mine.length }),
      href: `#/free/${mine[0].id}`, cta: T('free.start'),
    }),
    el('div', { class: 'list mods' }, mine.map(q => row({
      href: `#/free/${q.id}`, title: text(q).title, sub: q.source.name,
      num: stars(q.level), acc: '',
    }))),
  );
  return T('free.title');
}

/* ---------------- một bài ---------------- */
function problem(host, p, all, cfg) {
  if (sess.id !== p.id) sess = { id: p.id, hints: 0, shown: false };
  const t = text(p);
  const redraw = () => renderFree({ view: 'free', id: p.id }, cfg);
  const mod = (title, body, open = true, cls = '') => el('details', { class: `card free-mod ${cls}`, open: open ? '' : null }, [el('summary', {}, el('h2', { text: title })), ...[body].flat()]);

  const hints = [
    ...t.hints.slice(0, sess.hints).map((h, i) => mod(T('free.hintN', { n: i + 1 }), md(h), true, 'free-hint')),
    sess.hints < t.hints.length && el('button', {
      type: 'button', class: 'btn', text: T('free.hintBtn', { n: sess.hints + 1, m: t.hints.length }),
      onClick: () => { sess.hints++; redraw(); },
    }),
  ];

  const nx = following(all.filter(x => x.ch === p.ch), p.id);
  const right = sess.shown ? [
    mod(T('free.solution'), el('ol', { class: 'free-sol' }, t.solution.map(x => el('li', {}, md(x))))),
    nx && el('a', { class: 'btn', href: `#/free/${nx.id}`, 'data-icon': 'next' }, el('span', { text: T('free.next') })),
  ] : [el('div', { class: 'card free-mod free-wait' }, [
    el('p', { class: 'subtitle', text: T('free.tryFirst') }),
    el('button', { type: 'button', class: 'btn primary', text: T('free.show'), onClick: () => { sess.shown = true; redraw(); } }),
  ])];

  host.replaceChildren(...[
    el('header', {}, [
      el('a', { class: 'back', href: '#/free', 'data-icon': 'prev', text: T('free.title') }),
      el('p', { class: 'crumb', text: `${chapterTitle(p.ch)} · ${stars(p.level)}` }),
      el('h1', { text: t.title }),
    ]),
    el('div', { class: 'free-cols' }, [
      el('div', { class: 'free-left' }, [mod(T('free.problem'), md(t.q), true, 'free-q'), ...hints, el('p', { class: 'free-src', text: T('free.source', { name: p.source.name, license: p.source.license }) })]),
      el('div', { class: 'free-right' }, right),
    ]),
  ].filter(Boolean));
  return t.title;
}

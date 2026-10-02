import { $, el } from './dom.js';
import { t as T, getLang } from '../i18n/index.js';
import { load, save } from './store.js';
import { chNo, chapterTitle, row, leadCard, practiceTabs, tag } from './choices.js';
import { mdNodes } from './lesson.js';
import { RATINGS, summarize, nextUp } from '../logic/free.js';

/* ---------------------------------------------------------------
   TỰ LUẬN (đề giống bộ đề giáo trình): máy chỉ đưa đề, gợi ý theo thang, lời giải mẫu chia ý và các ý chấm;
   NGƯỜI HỌC tự đối chiếu và tự đánh giá — không có bộ chấm. Đánh giá lưu theo môn (khoá 'free'), chỉ để xếp bài ôn.
   cfg.free = mảng bài (shared/logic/free.js). #/free = danh sách · #/free/<id> = một bài.
   --------------------------------------------------------------- */

const RATE_KEY = 'free';
const ratings = () => load(RATE_KEY, {});
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
  const rt = ratings();
  const chapters = cfg.chapters.filter(c => all.some(p => p.ch === c.id));
  const head = [el('h1', { text: T('nav.practice') }), practiceTabs('free')];
  if (!all.length) {
    host.replaceChildren(...head, leadCard({ title: T('free.none'), note: T('free.noneNote'), href: '#/practice', cta: T('nav.practice') }));
    return T('free.title');
  }
  const cur = chapters.find(c => c.id === load('free-ch', null)) ?? chapters[0];
  const mine = all.filter(p => p.ch === cur.id);
  const s = summarize(mine, rt);
  const next = nextUp(mine, rt);
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
      title: T(s.todo === s.n ? 'free.startTitle' : 'free.nextTitle'), note: T('free.stat', { n: s.n, ok: s.ok, near: s.near, bad: s.bad }),
      href: `#/free/${next.id}`, cta: T(s.todo === s.n ? 'free.start' : 'free.next'),
    }),
    el('div', { class: 'list mods' }, mine.map(q => row({
      href: `#/free/${q.id}`, title: text(q).title, sub: q.source.name,
      num: stars(q.level), acc: '',
      tag: rt[q.id] && tag(T('free.r_' + rt[q.id].r), rt[q.id].r === 'ok' ? 'ok' : 'hi'),
    }))),
  );
  return T('free.title');
}

/* ---------------- một bài ---------------- */
function problem(host, p, all, cfg) {
  if (sess.id !== p.id) sess = { id: p.id, hints: 0, shown: false };
  const t = text(p);
  const redraw = () => renderFree({ view: 'free', id: p.id }, cfg);
  const rt = ratings();
  const cur = rt[p.id]?.r;

  const hints = el('div', { class: 'free-hints' }, [
    ...t.hints.slice(0, sess.hints).map((h, i) => el('div', { class: 'free-hint' }, [el('b', { text: T('free.hintN', { n: i + 1 }) }), md(h)])),
    sess.hints < t.hints.length && el('button', {
      type: 'button', class: 'btn', text: T('free.hintBtn', { n: sess.hints + 1, m: t.hints.length }),
      onClick: () => { sess.hints++; redraw(); },
    }),
  ]);

  const body = sess.shown ? [
    el('h2', { text: T('free.solution') }),
    el('ol', { class: 'free-sol' }, t.solution.map(s => el('li', {}, md(s)))),
    el('h2', { text: T('free.rubric') }),
    el('p', { class: 'subtitle', text: T('free.rubricNote') }),
    el('ul', { class: 'free-rubric' }, t.rubric.map(x => el('li', {}, el('label', {}, [el('input', { type: 'checkbox' }), md(x)])))),
    el('h2', { text: T('free.pitfalls') }),
    el('ul', { class: 'free-pit' }, t.pitfalls.map(x => el('li', {}, md(x)))),
    el('h2', { text: T('free.rate') }),
    el('div', { class: 'free-rate', role: 'group' }, RATINGS.map(k => el('button', {
      type: 'button', class: 'btn' + (cur === k ? ' primary' : ''), 'aria-pressed': String(cur === k),
      onClick: () => { save(RATE_KEY, { ...ratings(), [p.id]: { r: k, t: Date.now() } }); redraw(); },
    }, T('free.rate_' + k)))),
  ] : [
    el('p', { class: 'subtitle', text: T('free.tryFirst') }),
    el('button', { type: 'button', class: 'btn primary', text: T('free.show'), onClick: () => { sess.shown = true; redraw(); } }),
  ];

  const n = nextUp(all.filter(x => x.ch === p.ch), rt, p.id);
  host.replaceChildren(...[
    el('header', {}, [
      el('a', { class: 'back', href: '#/free', 'data-icon': 'prev', text: T('free.title') }),
      el('p', { class: 'crumb', text: `${chapterTitle(p.ch)} · ${stars(p.level)}` }),
      el('h1', { text: t.title }),
    ]),
    el('div', { class: 'card free-q' }, md(t.q)),
    hints,
    ...body,
    el('p', { class: 'free-src', text: T('free.source', { name: p.source.name, license: p.source.license }) }),
    sess.shown && n && el('a', { class: 'btn', href: `#/free/${n.id}`, 'data-icon': 'next' }, el('span', { text: T('free.next') })),
  ].filter(Boolean));
  return t.title;
}

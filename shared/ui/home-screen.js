import { $, el } from './dom.js';
import { t as T } from '../i18n/index.js';
import { statsOf, weekSince } from '../logic/progress.js';
import { weekOf, WEEKS, EXAM_WEEKS, daysToMidterm } from '../logic/syllabus.js';
import { loadEvents, load, savePet } from './store.js';
import { loadFlags } from './flags.js';
import { chapterTitle, leadCard, studied } from './choices.js';
import { nextLearn } from '../logic/prereq.js';
import { splitCards } from '../logic/cards.js';
import { seekLesson, lessonGraph, readOf } from './lesson.js';
import { petBlock } from './pet.js';

/* ---------------------------------------------------------------
   TỔNG QUAN của một môn (D16, D19):
   - điểm nhấn duy nhất: dải 16 tuần + số ngày tới giữa kỳ;
   - MỘT việc chính (gợi ý cần nhất, kèm lý do — toeic D52); cột phải: Học · Luyện tập;
     số liệu 7 ngày viết thành một dòng, không đóng hộp;
   - không streak: nghỉ vài hôm quay lại không bị "phạt" (toeic D51).
   --------------------------------------------------------------- */

function termBlock(now) {
  const week = weekOf(new Date(now));
  const days = daysToMidterm(new Date(now));
  const cells = [];
  for (let w = 1; w <= WEEKS; w++) {
    const exam = EXAM_WEEKS[w];
    const cls = [w < week ? 'past' : '', w === week ? 'now' : '', exam ? 'exam' : ''].filter(Boolean).join(' ');
    // chỉ ghi nhãn ở tuần này và hai mốc thi — 16 con số chen nhau thì không đọc được gì
    const label = exam ? T(exam === 'mid' ? 'home.midShort' : 'home.finalShort') : w === week ? T('home.weekN', { w }) : '';
    cells.push(el('li', { class: cls, title: T('home.weekN', { w }) }, label && el('span', { text: label })));
  }
  return el('div', { class: 'semester' }, [
    el('div', { class: 'term-count' }, days >= 0
      ? [el('b', { text: String(days) }), el('span', { text: T('home.daysToMid') })]
      : [el('b', { text: String(week) }), el('span', { text: T('home.weekOf', { n: WEEKS }) })]),
    el('ol', { class: 'term-track', 'aria-label': T('home.term') }, cells),
  ]);
}

function today(cfg, events) {
  if (cfg.mock) return leadCard({ title: T('nav.mock'), note: T('mock.homeNote'), href: '#/mock', cta: T('mock.open') });
  const ch = studied(cfg, events)[0] ?? cfg.chapters[0].id;     // môn chưa có đề mẫu: mời học tiếp chương đang học
  return leadCard({ title: T('home.learnNow'), note: chapterTitle(ch), href: `#/learn/${ch}/theory`, cta: T('learn.start') });
}

/** Thẻ hành động nhẹ (viền mảnh, hover đổi nền): tên đậm + một dòng phụ + nút mũi tên tròn. */
const act = ({ href, title, note, onClick }) => el('a', { class: 'act', href, onClick }, [
  el('span', {}, [el('b', { text: title }), el('small', { text: note })]),
  el('span', { class: 'act-go', 'aria-hidden': 'true', text: '→' }),
]);

/** "Tuần này" như Hub: nhân vật + 3 số của 7 ngày qua (số câu, % đúng, số ngày có học). */
function weekBlock(events, now, ctx) {
  const since = weekSince(now), w = statsOf(events, { since });
  const days = new Set(events.filter(e => e.ts >= since && e.ts <= now).map(e => new Date(e.ts).toDateString())).size;
  const n = (v, t) => el('div', {}, [el('b', { class: 'num', text: String(v) }), t]);
  const { art, ctl } = petBlock(ctx);
  return [el('h2', { class: 'section-label wk' }, [el('span', { text: T('home.week') }), ctl]), el('div', { class: 'home-week' }, [
    art,
    n(w.attempts, T('home.wkDone')), n(w.attempts ? `${Math.round(w.accuracy * 100)}%` : '—', T('home.wkAcc')), n(days, T('home.wkDays')),
  ])];
}

function side(cfg, events, now) {
  const g = lessonGraph(cfg);
  const n = nextLearn(cfg.chapters.map(c => ({ ch: c.id, cards: splitCards(cfg.lesson?.(c.id) ?? '').cards })), g, events, readOf, loadFlags());
  return el('div', { class: 'home-side' }, [
    el('h2', { class: 'section-label', text: T('nav.learn') }),
    n ? act({ href: `#/learn/${n.ch}/theory`, title: T('learn.nextCard', { title: n.title }), note: chapterTitle(n.ch), onClick: () => seekLesson(n.ch, n.card) })
      : act({ href: '#/learn', title: T('home.actToc'), note: T('home.actTocNote', { n: cfg.chapters.length }) }),
    act({ href: '#/tools', title: T('nav.tools'), note: T('home.actToolsNote') }),
    el('h2', { class: 'section-label', text: T('nav.mock') }),
    ...(cfg.mock ? [act({ href: '#/mock', title: T('nav.mock'), note: T('mock.homeNote') })] : []),
    act({ href: '#/free', title: T('practice.tabFree'), note: T('home.actFreeNote') }),
  ]);
}

export function renderHome(r, cfg) {
  const events = loadEvents();
  const now = Date.now();
  // cùng API với Hub: ctx.data.hub (nhật ký có pet.set), ctx.add(type, payload), ctx.render()
  const saved = load('pet', null);
  const petCtx = { acts: events, data: { hub: saved == null ? [] : [{ type: 'pet.set', payload: saved }] }, add: (_type, payload) => savePet(payload), render: () => renderHome(r, cfg) };

  $('#screen-home').replaceChildren(
    el('h1', { text: T('app.short') }),
    el('p', { class: 'subtitle', text: T('app.book') }),
    termBlock(now),
    el('div', { class: 'home-cols' }, [
      el('div', { class: 'home-main' }, [
        el('h2', { class: 'section-label', text: T('home.today') }),
        today(cfg, events),
        ...weekBlock(events, now, petCtx),
      ]),
      side(cfg, events, now),
    ]),
  );
  return T('nav.home');
}

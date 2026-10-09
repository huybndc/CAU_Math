import { $, el } from './dom.js';
import { t as T } from '../i18n/index.js';
import { statsOf, recentStats, weekSince } from '../logic/progress.js';
import { weekOf, WEEKS, EXAM_WEEKS, daysToMidterm } from '../logic/syllabus.js';
import { loadEvents, load, save, savePet, subjectOf } from './store.js';
import { targetOf } from '../logic/exam-target.js';
import { chapterTitle, roundMinutes, rankedKinds, accCell, row, leadCard, studied } from './choices.js';
import { nextPoint } from '../logic/prereq.js';
import { seekLesson, lessonGraph } from './lesson.js';
import { petBlock } from './pet.js';

/* ---------------------------------------------------------------
   TỔNG QUAN của một môn (D16, D19):
   - điểm nhấn duy nhất: dải 16 tuần + số ngày tới giữa kỳ;
   - MỘT việc chính (gợi ý cần nhất, kèm lý do — toeic D52); cột phải: Học · Luyện tập;
     số liệu 7 ngày viết thành một dòng, không đóng hộp;
   - không streak: nghỉ vài hôm quay lại không bị "phạt" (toeic D51).
   --------------------------------------------------------------- */

const why = x => (x.reason === 'new' ? T('home.whyNew')
  : x.reason === 'few' ? T('home.whyFew', { n: x.stats.attempts })
    : T('home.whyWeak', { p: Math.round(x.stats.accuracy * 100) }));

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

function today(cfg, events, now) {
  const ranked = rankedKinds(cfg, events, now);
  if (!ranked.length) {                    // môn chưa có ngân hàng câu: mời học tiếp chương đang học
    const ch = studied(cfg, events)[0] ?? cfg.chapters[0].id;
    return leadCard({ title: T('home.learnNow'), note: chapterTitle(ch), href: `#/learn/${ch}/theory`, cta: T('learn.start') });
  }
  const [first] = ranked;
  return leadCard({
    title: T(`${first.prefix}.${first.kind}`),
    note: `${chapterTitle(first.ch)} · ${why(first)} · ~${roundMinutes(first.bank, [first.kind])} ${T('home.min')}`,
    href: `#/practice/${first.ch}/${first.kind}`, cta: T('practice.start'),
  });
}

/** Mục tiêu thi: thanh % đúng hiện tại + vạch mục tiêu (cùng số với Study_Hub: exam-target.json). */
function goalRow(events) {
  const t = targetOf(subjectOf());
  if (t == null) return '';
  const { accuracy } = statsOf(events);
  const p = accuracy === null ? null : Math.round(accuracy * 100);
  return el('div', { class: 'goal-row' }, [
    el('h2', { class: 'section-label', text: T('home.goalLabel', { t }) }),
    el('div', { class: 'goal-line' }, [
      el('span', { class: 'goal-bar', role: 'img', 'aria-label': T('home.goalNow', { p: p ?? 0, n: Math.max(0, t - (p ?? 0)) }) }, [
        el('i', { style: `width:${p ?? 0}%` }), el('u', { style: `left:${t}%` })]),
      el('span', { class: 'small', text: p === null ? T('practice.none') : p >= t ? T('home.goalDone', { p }) : T('home.goalNow', { p, n: t - p }) }),
    ]),
  ]);
}

/** Thẻ hành động nhẹ (viền mảnh, hover đổi nền): tên đậm + một dòng phụ + nút mũi tên tròn. */
const act = ({ href, title, note, onClick }) => el('a', { class: 'act', href, onClick }, [
  el('span', {}, [el('b', { text: title }), el('small', { text: note })]),
  el('span', { class: 'act-go', 'aria-hidden': 'true', text: '→' }),
]);

/** Cột phải: Học (2 thẻ) và Luyện tập (3 thẻ) — những việc không trùng khối "Hôm nay". */
/** "Tuần này" như Hub: nhân vật + 3 số của 7 ngày qua (số câu, % đúng, số ngày có học). */
function weekBlock(events, now) {
  const since = weekSince(now), w = statsOf(events, { since });
  const days = new Set(events.filter(e => e.ts >= since && e.ts <= now).map(e => new Date(e.ts).toDateString())).size;
  const n = (v, t) => el('div', {}, [el('b', { class: 'num', text: String(v) }), t]);
  return el('div', { class: 'home-week' }, [
    petBlock({ get: () => load('pet', null), set: savePet }, { settings: T('pet.settings'), show: T('pet.show') }),
    n(w.attempts, T('home.wkDone')), n(w.attempts ? `${Math.round(w.accuracy * 100)}%` : '—', T('home.wkAcc')), n(days, T('home.wkDays')),
  ]);
}

function side(cfg, events, now) {
  const g = lessonGraph(cfg);
  const nx = nextPoint(g, events);
  const n = nx && g.get(nx);
  const days = daysToMidterm(new Date(now));
  return el('div', { class: 'home-side' }, [
    el('h2', { class: 'section-label', text: T('nav.learn') }),
    n ? act({ href: `#/learn/${n.ch}/theory`, title: T('learn.nextCard', { title: n.title }), note: chapterTitle(n.ch), onClick: () => seekLesson(n.ch, n.card) })
      : act({ href: '#/learn', title: T('home.actToc'), note: T('home.actTocNote', { n: cfg.chapters.length }) }),
    act({ href: '#/tools', title: T('nav.tools'), note: T('home.actToolsNote') }),
    el('h2', { class: 'section-label', text: T('nav.practice') }),
    act({ href: '#/practice', title: T('practice.tabKinds'), note: T('home.actKindsNote') }),
    act({ href: '#/free', title: T('practice.tabFree'), note: T('home.actFreeNote') }),
    act({ href: '#/exam', title: T('nav.exam'), note: days >= 0 && days <= 21 ? T('home.actExamSoon', { n: days }) : T('home.actExamNote') }),
  ]);
}

export function renderHome(r, cfg) {
  const events = loadEvents();
  const now = Date.now();

  // mọi chương trong MỘT thẻ tự cuộn (~5 hàng): chương chưa làm vẫn hiện, không phải gập
  const chapters = cfg.chapters.filter(c => c.bank).map(c => {
    const tried = c.bank.KINDS.filter(k => statsOf(events, { prefix: c.prefix, kind: k }).attempts > 0).length;
    const a = row({
      href: '#/practice', title: chapterTitle(c.id),
      num: T('home.tried', { a: tried, b: c.bank.KINDS.length }),
      acc: accCell(recentStats(events, { prefix: c.prefix }, now)),
    });
    a.addEventListener('click', () => save('practice-ch', c.id));   // mở Luyện tập đúng chương này
    return a;
  });

  $('#screen-home').replaceChildren(
    el('h1', { text: T('app.short') }),
    el('p', { class: 'subtitle', text: T('app.book') }),
    termBlock(now),
    el('div', { class: 'home-cols' }, [
      el('div', { class: 'home-main' }, [
        goalRow(events),
        el('h2', { class: 'section-label', text: T('home.today') }),
        today(cfg, events, now),
        el('h2', { class: 'section-label', text: T('home.week') }),
        weekBlock(events, now),
        chapters.length ? el('h2', { class: 'section-label', text: T('home.byChapter') }) : '',
        chapters.length ? el('div', { class: 'list home-chapters' }, chapters) : '',
      ]),
      side(cfg, events, now),
    ]),
  );
  return T('nav.home');
}

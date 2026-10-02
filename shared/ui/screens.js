import { $, el } from './dom.js';
import { t as T } from '../i18n/index.js';
import { recentStats } from '../logic/progress.js';
import { loadEvents, load, save } from './store.js';
import { ROUND, chNo, chapterTitle, roundMinutes, accNote, accCell, rankedKinds, row, tag, leadCard, answerMode, modeBar, practiceTabs, studied } from './choices.js';
import { mountRunner } from './runner.js';
import { reviewOf } from './lesson.js';
import { renderHome } from './home-screen.js';
import { renderLearn } from './learn-screen.js';
import { renderExam } from './exam-screen.js';
import { renderFree } from './free-screen.js';
import { groupsOf, kindsFor } from '../logic/groups.js';
import { loadMistakes } from './store.js';

/* ---------------------------------------------------------------
   CÁC MÀN CỦA MỘT APP (menu theo việc — RESEARCH U-R1..U-R3):
     home      Tổng quan (home-screen.js)
     learn     mục lục dạng cây: chương → thẻ (learn-screen.js)
     practice  danh sách dạng, mỗi thẻ ghi "10 câu · ~M phút · đúng X%"
     run       bộ chạy luyện tập của một dạng / cả chương
     pane      một khung có sẵn của trang chương (ví dụ, công cụ, bài luyện cũ)
     tools     Công cụ: mọi công cụ bấm thử + ví dụ giải sẵn, gom theo chương (đọc từ các khung)
     exam      bài full / bài tập dài (exam-screen.js)
     free      Tự luận tự chấm theo lời giải (free-screen.js)
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
    return names.length && row({ href: `#/learn/${c.id}/interactive/0`, title: chapterTitle(c.id), sub: names.join(' · '), });
  }).filter(Boolean);
  $('#screen-tools').replaceChildren(
    el('h1', { text: T('nav.tools') }),
    el('p', { class: 'subtitle', text: T('tools.sub') }),
    el('div', { class: 'list mods' }, rows),
  );
  return T('nav.tools');
}

/* ---------------- Luyện tập: một chương một lúc ---------------- */
/** Số câu trong sổ câu sai của chương (đúng chế độ tự luận / trắc nghiệm đang chọn). */
const wrongN = c => loadMistakes(c.prefix, !!c.choiceBank && answerMode() === 'choice').length;

function renderPractice(r, cfg) {
  const events = loadEvents();
  const now = Date.now();
  const top = rankedKinds(cfg, events, now)[0];
  const fallback = studied(cfg, events)[0] ?? cfg.chapters[0].id;
  const saved = load('practice-ch', null);
  const c = cfg.chapters.find(x => x.id === saved) ?? cfg.chapters.find(x => x.id === fallback) ?? cfg.chapters[0];

  const bar = el('div', { class: 'chapter-bar', role: 'group', 'aria-label': T('shell.chapters') },
    cfg.chapters.map(x => el('button', {
      type: 'button', 'aria-pressed': String(x.id === c.id),
      onClick: () => { save('practice-ch', x.id); renderPractice(r, cfg); },
    }, [el('b', { text: chNo(x.id) }), T('nav.' + x.id)])));

  let body;
  if (!c.bank) {
    body = leadCard({ title: T('practice.old'), note: T('practice.oldNote'), href: `#/practice/${c.id}`, cta: T('practice.open') });
  } else {
    const { KINDS } = c.bank;
    // theo NHÓM chủ đề (D30): 3–4 dòng thay 8–10; tên các dạng trong nhóm ghi nhỏ bên dưới
    body = [
      leadCard({
        title: T('practice.mixCh', { n: chNo(c.id) }),
        note: `${T('practice.meta', { n: ROUND, m: roundMinutes(c.bank, KINDS) })} · ${accNote(recentStats(events, { prefix: c.prefix }, now))}`,
        href: `#/practice/${c.id}`, cta: T('practice.start'),
      }),
      ...(wrongN(c) ? [leadCard({ title: T('practice.wrong'), note: T('practice.wrongNote', { n: wrongN(c) }), href: `#/practice/${c.id}/wrong`, cta: T('practice.wrongCta') })] : []),
      el('div', { class: 'list mods' }, [
        el('div', { class: 'list-head' }, [
          el('span', { text: T('practice.kinds') }), el('span', { class: 'row-num', text: T('practice.time') }),
          el('span', { text: T('practice.acc') }), el('span'),
        ]),
        ...groupsOf(c.bank).map(g => row({
          href: `#/practice/${c.id}/${g.id}`, title: T(`${c.prefix}.${g.id}`),
          sub: g.kinds.length < 2 ? '' : g.kinds.map(k => T(`${c.prefix}.${k}`)).join(' · '),
          num: T('practice.mins', { m: roundMinutes(c.bank, g.kinds) }),
          acc: accCell(recentStats(events, { prefix: c.prefix, kinds: g.kinds }, now)),
          tag: top && top.prefix === c.prefix && g.kinds.includes(top.kind) && Object.assign(tag(T('practice.need')), { title: T('practice.needWhy') }),
        })),
      ]),
    ];
  }
  $('#screen-practice').replaceChildren(
    el('h1', { text: T('nav.practice') }),
    practiceTabs('practice'),
    el('div', { class: 'practice-bars' }, [bar, cfg.chapters.some(x => x.choiceBank) && modeBar(() => renderPractice(r, cfg))]),
    ...[body].flat(),
  );
  return T('nav.practice');
}

/* ---------------- làm bài một dạng / cả chương ---------------- */
let runner = null;
let runKey = '';
const stopRunner = () => { runner?.dispose(); runner = null; runKey = ''; };

function renderRun(r, cfg, c) {
  const wrong = r.kind === 'wrong';                  // "Ôn lại câu đã sai": đúng các câu trong sổ
  const pick = wrong ? null : kindsFor(c.bank, r.kind);            // nhóm, một dạng, hoặc null = cả chương
  const kind = pick?.kinds.length === 1 ? pick.kinds[0] : null;
  const title = wrong ? T('practice.wrong') : !pick ? T('practice.mix') : kind ? T(`${c.prefix}.${kind}`) : T(`${c.prefix}.${pick.group.id}`);
  $('#run-head').replaceChildren(
    el('a', { class: 'back', href: '#/practice', 'data-icon': 'prev', text: T('nav.practice') }),
    el('p', { class: 'crumb', text: chapterTitle(c.id) + (kind && pick.group ? ` · ${T(`${c.prefix}.${pick.group.id}`)}` : '') }),
    el('h1', { text: title }),
  );
  // trong một nhóm: thanh chọn "cả nhóm | từng dạng" — chọn dạng không cần quay lại danh sách
  if (pick?.group) {
    const g = pick.group;
    $('#run-head').append(el('div', { class: 'run-kindbar' }, [
      el('a', { href: `#/practice/${c.id}/${g.id}`, 'aria-current': String(!kind), text: T('run.allKinds') }),
      ...g.kinds.map(k => el('a', { href: `#/practice/${c.id}/${k}`, 'aria-current': String(k === kind), text: T(`${c.prefix}.${k}`) })),
    ]));
  }
  // luyện một dạng: link sang đúng thẻ dạy dạng đó (ví dụ mẫu + tự làm) — "học một dạng"
  const rv = kind && reviewOf(cfg, c.prefix, kind);
  if (rv) $('#run-head').append(el('a', { class: 'run-learn', href: rv.href, onClick: rv.open, text: T('run.learnKind', { title: rv.title }) }));
  const choice = !!c.choiceBank && answerMode() === 'choice';
  if (c.choiceBank) $('#run-head').append(el('div', { class: 'run-modebar' }, modeBar(() => renderRun(r, cfg, c))));
  const key = `${c.id}/${r.kind ?? ''}/${choice}`;
  if (key !== runKey) {        // đổi ngôn ngữ chỉ vẽ lại tiêu đề — không mất lượt đang làm
    stopRunner();
    runKey = key;
    runner = mountRunner($('#run-host'), {
      bank: choice ? c.choiceBank : c.bank, prefix: c.prefix, figures: cfg.figures, widgets: cfg.widgets,
      kinds: pick?.kinds, chips: false, review: (k, tag) => reviewOf(cfg, c.prefix, k, tag),
      queue: wrong ? loadMistakes(c.prefix, choice) : null,
    });
  }
  return title;
}

/* ---------------- một khung có sẵn của trang chương ---------------- */
function renderPane(r, cfg, c) {
  const sub = r.view === 'practice' ? 'practice' : ($(`#pane-${c.id}-${r.sub}`) ? r.sub : 'theory');
  const back = r.view === 'practice' ? 'practice' : r.at != null ? 'tools' : 'learn';
  const label = sub === 'practice' ? T('practice.old') : T('learn.' + sub);
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
  if (r.view === 'practice' && c) screen = c.bank ? 'run' : 'pane';
  if (screen !== 'run') stopRunner();
  document.body.classList.toggle('exam-focus', r.view === 'exam' && r.step === 'run');
  document.querySelectorAll('#app > .screen').forEach(s => s.classList.toggle('active', s.dataset.screen === screen));
  // Thi thử nằm trong Luyện tập (D30): menu sáng mục Luyện tập
  const nav = r.view === 'learn' && r.at != null ? 'tools' : ['exam', 'free'].includes(r.view) ? 'practice' : r.view;
  document.querySelectorAll('.tab').forEach(t => {
    if (t.dataset.nav === nav) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
  });
  const render = { home: renderHome, learn: renderLearn, tools: renderTools, practice: renderPractice, run: renderRun, pane: renderPane, exam: renderExam, free: renderFree }[screen];
  document.title = `${render(r, cfg, c)} · ${T('app.short')}`;
}

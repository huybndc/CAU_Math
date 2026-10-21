import { $, el } from './dom.js';
import { t as T } from '../i18n/index.js';
import { load, save } from './store.js';
import { leadCard, practiceTabs } from './choices.js';
import { mathSpan } from './question.js';
import { splitMatrices } from '../logic/steps.js';
import { buildMock, newSeed, parseSeed, secondsLeft, scoreSummary } from '../logic/mock-exam.js';

/* ---------------------------------------------------------------
   ĐỀ NHƯ THẬT: chọn mã seed → xem tóm tắt (câu · điểm · mục sách) → In đề / In đáp án (A4, hai file riêng cùng mã)
   → Bắt đầu tính giờ (làm trên giấy) → hết giờ hoặc Nộp → tự chấm điểm từng ý theo đáp án → kết quả theo câu và mục sách.
   cfg.mock = mẫu đề của môn (shared/logic/mock-exam.js). In: gắn body[data-print] rồi window.print(); mock.css ẩn mọi thứ khác.
   Chữ của đề tiếng Anh (như đề thi thật); chữ của màn hình theo VI/EN.
   --------------------------------------------------------------- */

const KEY = 'mock-seed', RUN = 'mock-run', HIST = 'mock-hist', HIST_MAX = 8;
let tick = null;
const clock = sec => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
const pct = (a, b) => (b ? Math.round(100 * a / b) : 0);
/** Chữ thường + ma trận '[1 2; 3 4]' vẽ thành lưới (mathSpan chỉ hợp chuỗi toán thuần, câu hỏi có chữ sẽ bị in nghiêng). */
const matStr = ({ rows, bar }) => `[${rows.map(r => (bar >= 0 ? [...r.slice(0, bar), '|', ...r.slice(bar)] : r).join(' ')).join('; ')}]`;
const math = s => {
  const e = el('span');
  for (const p of splitMatrices(String(s))) e.append(typeof p === 'string' ? document.createTextNode(p) : mathSpan(matStr(p)));
  return e;
};
const srcLine = (ex, q) => q.refs.length
  ? `Source: ${ex.book} — Ch. ${q.refs[0].sec[0]}, ${q.refs.map(r => `§${r.sec} ${r.title}`).join('; ')}`
  : '';

function paper(ex, key) {
  const head = el('header', { class: 'mp-head' }, [
    el('h1', { text: `${ex.title}${key ? ' — Answer key' : ''}` }),
    el('p', { text: `Code: ${ex.code} · Time: ${ex.minutes} min · Total: ${ex.total} points${key ? '' : ' · No calculator, no notes'}` }),
  ]);
  const qs = ex.questions.map(q => el('section', { class: 'mp-q' }, [
    el('h2', { text: `${q.no}. [${q.pts}] ${q.stem}` }),
    ...q.parts.map(p => el('div', { class: 'mp-part', style: key ? '' : `--pts:${p.pts}` }, [
      el('p', { class: 'mp-ask' }, [el('b', { text: `(${p.label}) [${p.pts}] ` }), math(p.q)]),
      ...(key ? p.a.map(line => el('p', { class: 'mp-ans' }, math(line))) : [el('div', { class: 'mp-space' })]),
    ])),
    el('p', { class: 'mp-src', text: srcLine(ex, q) }),
  ]));
  return el('div', {}, [head, ...qs]);
}

function print(ex, key) {
  let root = $('#mock-print');
  if (!root) { root = el('div', { id: 'mock-print' }); document.body.append(root); }
  root.replaceChildren(paper(ex, key));
  document.body.dataset.print = key ? 'key' : 'exam';
  const done = () => { delete document.body.dataset.print; root.replaceChildren(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}

export function renderMock(r, cfg) {
  clearInterval(tick);
  const host = $('#screen-mock');
  const head = [el('h1', { text: T('nav.mock') }), practiceTabs('mock')];
  if (!cfg.mock) {
    host.replaceChildren(...head, leadCard({ title: T('mock.none'), note: T('mock.noneNote'), href: '#/free', cta: T('practice.tabFree') }));
    return T('nav.mock');
  }
  const again = () => renderMock(r, cfg);
  const run = load(RUN, null);
  if (run) {
    const ex = buildMock(cfg.mock, run.seed);
    if (run.phase === 'grade' || secondsLeft(run, Date.now()) === 0) grading(host, head, ex, run, again);
    else working(host, head, ex, run, again);
  } else setup(host, head, cfg, load(KEY, null) ?? newSeed(), again);
  return T('nav.mock');
}

function working(host, head, ex, run, again) {
  const left = el('b', { class: 'mock-clock' });
  const paint = () => {
    const n = secondsLeft(run, Date.now());
    left.textContent = clock(n);
    if (!document.body.contains(left)) return clearInterval(tick);
    if (n === 0) { clearInterval(tick); save(RUN, { ...run, phase: 'grade', endedAt: Date.now() }); again(); }
  };
  host.replaceChildren(...head,
    el('div', { class: 'mock-run' }, [
      el('p', { class: 'muted', text: `${T('mock.seed')} ${ex.code} · ${T('mock.summary', { n: ex.questions.length, pts: ex.total, min: ex.minutes })}` }),
      el('p', { class: 'mock-left' }, [el('span', { text: T('mock.left') }), left]),
      el('p', { class: 'muted small', text: T('mock.runNote') }),
      el('div', { class: 'mock-actions' }, [
        el('button', { class: 'btn primary', type: 'button', text: T('mock.submit'), onClick: () => { save(RUN, { ...run, phase: 'grade', endedAt: Date.now() }); again(); } }),
        el('button', { class: 'btn', type: 'button', text: T('mock.cancel'), onClick: () => { if (confirm(T('mock.cancelAsk'))) { save(RUN, null); again(); } } }),
      ]),
    ]));
  paint();
  tick = setInterval(paint, 1000);
}

function grading(host, head, ex, run, again) {
  const grades = {}, inputs = [];
  const rows = ex.questions.map(q => el('div', { class: 'mock-grade-row' }, [
    el('b', { text: `${q.no}.` }),
    el('span', { class: 'muted', text: q.refs.map(x => `§${x.sec}`).join(' · ') }),
    ...q.parts.map(p => {
      const inp = el('input', { type: 'number', min: 0, max: p.pts, value: '', placeholder: '0', 'aria-label': `${q.no}${p.label}` });
      inputs.push([`${q.no}-${p.label}`, inp]);
      return el('label', {}, [`(${p.label}) `, inp, ` / ${p.pts}`]);
    }),
  ]));
  const finish = save_ => {
    const sum = scoreSummary(ex, Object.fromEntries(inputs.map(([k, inp]) => [k, inp.value])));
    const used = Math.min(ex.minutes, Math.max(1, Math.round(((run.endedAt ?? Date.now()) - run.startedAt) / 60000)));
    const entry = { seed: ex.seed, code: ex.code, at: Date.now(), usedMin: used, ...sum };
    if (save_) save(HIST, [entry, ...load(HIST, [])].slice(0, HIST_MAX));
    save(RUN, null);
    result(host, head, ex, entry, again);
  };
  host.replaceChildren(...head,
    el('h2', { class: 'section-label', text: T('mock.grade') }),
    el('p', { class: 'muted small', text: T('mock.gradeHint') }),
    el('div', { class: 'mock-actions' }, [
      el('button', { class: 'btn', type: 'button', text: T('mock.printKey'), onClick: () => print(ex, true) }),
      el('button', { class: 'btn primary', type: 'button', text: T('mock.save'), onClick: () => finish(true) }),
      el('button', { class: 'btn', type: 'button', text: T('mock.skip'), onClick: () => finish(false) }),
    ]),
    el('div', { class: 'list mock-grade' }, rows));
}

function result(host, head, ex, e, again) {
  host.replaceChildren(...head,
    el('h2', { class: 'section-label', text: `${T('mock.result')}: ${e.total} / ${e.max} (${pct(e.total, e.max)}%) · ${e.usedMin}/${ex.minutes} ${T('home.min')}` }),
    el('p', { class: 'muted small', text: T('mock.weak') }),
    el('div', { class: 'list mock-list' }, e.bySection.map(x => el('div', { class: 'row mock-row' }, [
      el('b', { text: `${x.got}/${x.max}` }), el('span', { text: `§${x.sec} ${x.title}` }), el('small', { class: 'muted', text: `${pct(x.got, x.max)}%` }),
    ]))),
    el('p', { class: 'muted small', text: `${T('mock.byQ')}: ${e.byQuestion.map(q => `${q.no}: ${q.got}/${q.max}`).join(' · ')}` }),
    el('div', { class: 'mock-actions' }, [el('button', { class: 'btn primary', type: 'button', text: T('mock.newExam'), onClick: again })]));
}

function setup(host, head, cfg, seed, again) {
  save(KEY, seed);
  const ex = buildMock(cfg.mock, seed);
  const input = el('input', { class: 'mock-seed', value: ex.code, maxlength: 5, size: 6, 'aria-label': T('mock.seed'), spellcheck: 'false' });
  input.addEventListener('change', () => { const s = parseSeed(input.value); if (s == null) input.value = ex.code; else setup(host, head, cfg, s, again); });
  const hist = load(HIST, []);
  host.replaceChildren(...head,
    el('div', { class: 'mock-bar' }, [
      el('label', {}, [el('span', { text: T('mock.seed') }), input]),
      el('button', { class: 'btn', type: 'button', onClick: () => setup(host, head, cfg, newSeed(), again), text: T('mock.new') }),
      el('span', { class: 'muted', text: T('mock.summary', { n: ex.questions.length, pts: ex.total, min: ex.minutes }) }),
      el('span', { class: 'mock-actions' }, [
        el('button', { class: 'btn', type: 'button', onClick: () => print(ex, false), text: T('mock.printExam') }),
        el('button', { class: 'btn', type: 'button', onClick: () => print(ex, true), text: T('mock.printKey') }),
        el('button', { class: 'btn primary', type: 'button', text: T('mock.start'), onClick: () => { save(RUN, { seed, startedAt: Date.now(), minutes: ex.minutes, phase: 'work' }); again(); } }),
      ]),
    ]),
    el('p', { class: 'muted small', text: `${T('mock.book')}: ${ex.book}${hist.length ? ` · ${T('mock.hist')}: ${hist.map(h => `${h.code} ${h.total}/${h.max}`).join(', ')}` : ''}` }),
    el('div', { class: 'list mock-list' }, ex.questions.map(q => el('div', { class: 'row mock-row' }, [
      el('b', { text: `${q.no}. ${q.pts}` }),
      el('span', {}, math(q.stem)),
      el('small', { class: 'muted', text: q.refs.map(x => `§${x.sec} ${x.title}`).join(' · ') }),
    ]))));
}

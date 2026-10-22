import { $, el } from './dom.js';
import { t as T } from '../i18n/index.js';
import { load, save } from './store.js';
import { leadCard, practiceTabs } from './choices.js';
import { buildMock, newSeed, parseSeed } from '../logic/mock-exam.js';

/* ---------------------------------------------------------------
   ĐỀ NHƯ THẬT: chọn mã seed → xem tóm tắt (câu · điểm · mục sách) → In đề / In đáp án (A4, hai file riêng cùng mã)
   Người học làm trên giấy, tự bấm giờ và tự chấm bằng đáp án in ra; app không giữ giờ hay điểm.
   cfg.mock = mẫu đề của môn (shared/logic/mock-exam.js). In: gắn body[data-print] rồi window.print(); mock.css ẩn mọi thứ khác.
   Chữ của đề tiếng Anh (như đề thi thật); chữ của màn hình theo VI/EN.
   --------------------------------------------------------------- */

const KEY = 'mock-seed';
/** KaTeX nạp một lần, chỉ khi mở màn này (không làm nặng các màn khác); công thức nằm giữa $…$ trong chuỗi đề/đáp án. */
let katex = null;
const loadKatex = async () => { if (!katex) { const [m] = await Promise.all([import('katex'), import('katex/dist/katex.min.css')]); katex = m.default; } };
const math = s => {
  const e = el('span');
  String(s).split('$').forEach((part, i) => {            // chỉ số lẻ = công thức
    if (!(i % 2)) { e.append(document.createTextNode(part)); return; }
    const m = el('span');
    m.innerHTML = katex.renderToString(part, { throwOnError: false });
    e.append(m);
  });
  return e;
};
const srcLine = (ex, q) => q.refs.length
  ? `Source: ${ex.book} — Ch. ${q.refs[0].sec.split(/[.–]/)[0]}, ${q.refs.map(r => `§${r.sec} ${r.title}`).join('; ')}`
  : '';

function paper(ex, key, tools) {
  const head = el('header', { class: 'mp-head' }, [
    el('h1', { text: `${ex.title}${key ? ' — Answer key' : ''}` }),
    el('p', { text: `Code: ${ex.code} · Time: ${ex.minutes} min · Total: ${ex.total} points${key ? '' : ' · No calculator, no notes'}` }),
  ]);
  const qs = ex.questions.map(q => el('section', { class: 'mp-q' }, [
    el('h2', {}, [`${q.no}. [${q.pts}] `, math(q.stem)]),
    ...q.parts.map(p => el('div', { class: 'mp-part', style: key ? '' : `--pts:${p.pts}` }, [
      el('p', { class: 'mp-ask' }, [el('b', { text: `(${p.label}) [${p.pts}] ` }), math(p.q)]),
      ...(key ? p.a.map(line => el('p', { class: 'mp-ans' }, math(line))) : [el('div', { class: 'mp-space' })]),
      ...(key && tools?.figure && p.figs ? [el('div', { class: `mp-figs${p.stack ? ' stack' : ''}` }, p.figs.map(f => el('figure', {}, [tools.figure(f)])))] : []),
    ])),
    el('p', { class: 'mp-src', text: srcLine(ex, q) }),
  ]));
  return el('div', {}, [head, ...qs]);
}

function print(ex, key, tools) {
  let root = $('#mock-print');
  if (!root) { root = el('div', { id: 'mock-print' }); document.body.append(root); }
  root.replaceChildren(paper(ex, key, tools));
  document.body.dataset.print = key ? 'key' : 'exam';
  const done = () => { delete document.body.dataset.print; root.replaceChildren(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}

export function renderMock(r, cfg) {
  const host = $('#screen-mock');
  const head = [el('h1', { text: T('nav.mock') }), practiceTabs('mock')];
  if (!cfg.mock) {
    host.replaceChildren(...head, leadCard({ title: T('mock.none'), note: T('mock.noneNote'), href: '#/free', cta: T('practice.tabFree') }));
    return T('nav.mock');
  }
  const go = () => draw(host, head, cfg, load(KEY, null) ?? newSeed());
  if (katex) go(); else loadKatex().then(go);
  return T('nav.mock');
}

let showKey = false;     // đang xem đề hay đáp án (không lưu)

function draw(host, head, cfg, seed) {
  save(KEY, seed);
  const ex = buildMock(cfg.mock, seed);
  const redraw = () => draw(host, head, cfg, seed);
  const input = el('input', { class: 'mock-seed', value: ex.code, maxlength: 5, size: 6, 'aria-label': T('mock.seed'), spellcheck: 'false' });
  input.addEventListener('change', () => { const s = parseSeed(input.value); if (s == null) input.value = ex.code; else draw(host, head, cfg, s); });
  const tab = (key, label) => el('button', { type: 'button', 'aria-pressed': String(showKey === key), onClick: () => { showKey = key; redraw(); } }, label);
  host.replaceChildren(...head,
    el('div', { class: 'mock-bar' }, [
      el('label', {}, [el('span', { text: T('mock.seed') }), input]),
      el('button', { class: 'btn', type: 'button', onClick: () => draw(host, head, cfg, newSeed()), text: T('mock.new') }),
      el('span', { class: 'muted', text: T('mock.summary', { n: ex.questions.length, pts: ex.total, min: ex.minutes }) }),
      el('span', { class: 'mock-actions' }, [
        el('span', { class: 'chapter-bar mode-bar', role: 'group', 'aria-label': T('nav.mock') }, [tab(false, T('mock.tabExam')), tab(true, T('mock.tabKey'))]),
        el('button', { class: 'btn primary', type: 'button', title: T('mock.printNote'), onClick: () => print(ex, showKey, cfg.mockTools), text: T('mock.print') }),
      ]),
    ]),
    el('div', { class: 'mock-sheet', tabindex: '0', 'aria-label': T(showKey ? 'mock.tabKey' : 'mock.tabExam') }, paper(ex, showKey, cfg.mockTools)));
}

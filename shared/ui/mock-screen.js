import { $, el } from './dom.js';
import { t as T } from '../i18n/index.js';
import { load, save } from './store.js';
import { leadCard, practiceTabs } from './choices.js';
import { mathSpan } from './question.js';
import { splitMatrices } from '../logic/steps.js';
import { buildMock, newSeed, parseSeed } from '../logic/mock-exam.js';

/* ---------------------------------------------------------------
   ĐỀ NHƯ THẬT: chọn mã seed → xem tóm tắt (câu · điểm · mục sách) → In đề / In đáp án (A4, hai file riêng cùng mã)
   Người học làm trên giấy, tự bấm giờ và tự chấm bằng đáp án in ra; app không giữ giờ hay điểm.
   cfg.mock = mẫu đề của môn (shared/logic/mock-exam.js). In: gắn body[data-print] rồi window.print(); mock.css ẩn mọi thứ khác.
   Chữ của đề tiếng Anh (như đề thi thật); chữ của màn hình theo VI/EN.
   --------------------------------------------------------------- */

const KEY = 'mock-seed';
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
  const host = $('#screen-mock');
  const head = [el('h1', { text: T('nav.mock') }), practiceTabs('mock')];
  if (!cfg.mock) {
    host.replaceChildren(...head, leadCard({ title: T('mock.none'), note: T('mock.noneNote'), href: '#/free', cta: T('practice.tabFree') }));
    return T('nav.mock');
  }
  draw(host, head, cfg, load(KEY, null) ?? newSeed());
  return T('nav.mock');
}

function draw(host, head, cfg, seed) {
  save(KEY, seed);
  const ex = buildMock(cfg.mock, seed);
  const input = el('input', { class: 'mock-seed', value: ex.code, maxlength: 5, size: 6, 'aria-label': T('mock.seed'), spellcheck: 'false' });
  input.addEventListener('change', () => { const s = parseSeed(input.value); if (s == null) input.value = ex.code; else draw(host, head, cfg, s); });
  host.replaceChildren(...head,
    el('div', { class: 'mock-bar' }, [
      el('label', {}, [el('span', { text: T('mock.seed') }), input]),
      el('button', { class: 'btn', type: 'button', onClick: () => draw(host, head, cfg, newSeed()), text: T('mock.new') }),
      el('span', { class: 'muted', text: T('mock.summary', { n: ex.questions.length, pts: ex.total, min: ex.minutes }) }),
      el('span', { class: 'mock-actions' }, [
        el('button', { class: 'btn primary', type: 'button', onClick: () => print(ex, false), text: T('mock.printExam') }),
        el('button', { class: 'btn', type: 'button', onClick: () => print(ex, true), text: T('mock.printKey') }),
      ]),
    ]),
    el('p', { class: 'muted small', text: `${T('mock.book')}: ${ex.book}` }),
    el('div', { class: 'list mock-list' }, ex.questions.map(q => el('div', { class: 'row mock-row' }, [
      el('b', { text: `${q.no}. ${q.pts}` }),
      el('span', {}, math(q.stem)),
      el('small', { class: 'muted', text: q.refs.map(x => `§${x.sec} ${x.title}`).join(' · ') }),
    ]))));
}

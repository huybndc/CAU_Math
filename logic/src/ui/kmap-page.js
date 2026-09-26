import { prime } from '@shared/ui/question.js';
import { $, el, HUES } from './dom-helpers.js';
import { buildMap, paintValues, drawGroups, setHot } from './kmap-common.js';
import { readFunction, walk } from '../logic/kmap-walk.js';
import { varNames, impCovers } from '../logic/quine-mccluskey.js';
import { toBits } from '../logic/gray.js';
import { formatSpec } from '../logic/expr-parser.js';
import { t as T, tError, onLangChange } from '../i18n/index.js';
import { randomValues } from '../logic/random-function.js';

/* ---------------------------------------------------------------
   CÔNG CỤ RÚT GỌN K-MAP (Chương 3) — một thẻ, hai cột:
     trái  bản đồ (bấm ô: 0 → 1 → X)
     phải  kết quả SOP | POS + các bước hiện dần, bản đồ tô đúng nhóm của bước đang xem
   Nhập hàm theo cả hai cách (kmap-walk.js readFunction): Σm/ΠM/d hoặc biểu thức theo tên biến —
   biểu thức thì bước đầu là khai triển từng term thiếu biến thành minterm.
   --------------------------------------------------------------- */

const K = { n: 4, values: [], pos: false, expand: null, steps: [], at: 0, view: null };

/** Đổi giá trị ô theo vòng 0 → 1 → X → 0. */
export const cycleValue = v => (v + 1) % 3;

const math = s => `<span class="step-math">${prime(s)}</span>`;
const list = a => a.join(', ');

/** Chữ của một bước (HTML từ từ điển + biểu thức phông sách). */
function stepHtml(s) {
  switch (s.kind) {
    case 'expand':
      return T('kt.expandHead') + '<div class="kt-lines">' + s.lines.map(e => (e.missing.length
        ? T('kt.expandMissing', { term: math(e.term), missing: math(e.missing.join(', ')),
          expanded: math(e.term + e.missing.map(v => `(${v} + ${v}')`).join('')), ms: list(e.minterms.map(m => 'm' + m)) })
        : T('kt.expandFull', { term: math(e.term), ms: 'm' + e.minterms[0] }))).map(x => `<div>${x}</div>`).join('') + '</div>';
    case 'read':
      return T(s.pos ? 'kt.readPos' : 'kt.readSop', { cells: list(s.cells) || '—' }) + (s.dcs.length ? ' ' + T('kt.readDc', { dcs: list(s.dcs) }) : '');
    case 'primes':
      return T('kt.primes', { count: s.count });
    case 'group': {
      const keep = s.keep.map(k => `${k.v} = ${k.value}`).join(', ');
      const head = s.drop.length
        ? T('kt.group', { cells: list(s.cells), drop: math(s.drop.join(', ')), keep: math(keep), term: math(s.term) })
        : T('kt.groupOne', { cells: list(s.cells), term: math(s.term) });
      const why = s.ess ? T('kt.whyEss', { only: list(s.only) }) : T('kt.whyMore', { covers: list(s.covers) });
      return `${head}<div class="kt-why">${why}</div>`;
    }
    case 'result':
      return s.constant ? T('kt.constant', { expr: math(s.expr) })
        : T('kt.result', { expr: math(s.expr), terms: s.terms, literals: s.literals });
    default: return '';
  }
}

/** Nhóm vẽ trên bản đồ ở bước đang xem; nhóm của chính bước đó được làm nổi. */
function paintStep() {
  const s = K.steps[K.at];
  const groups = (s.groups ?? []).map((g, i) => ({ id: 'g' + i, imp: g.imp, essential: !g.dashed, hue: HUES[i % HUES.length] }));
  drawGroups(K.view, groups, K.n);
  K.view.cells.forEach((c, m) => c.classList.toggle('sel', s.kind === 'read' && s.cells.includes(m)));
  const focus = s.focus && groups.find(g => g.imp === s.focus);
  setHot($('#k-maps'), focus ? new Set([focus.id]) : null);
}

function renderSteps() {
  const ol = $('#k-steps');
  ol.replaceChildren(...K.steps.slice(0, K.at + 1).map((s, i) => {
    const li = el('li', i === K.at ? 'on' : '');
    li.innerHTML = stepHtml(s);
    li.addEventListener('click', () => { K.at = i; renderSteps(); paintStep(); });
    return li;
  }));
  $('#st-next').disabled = K.at >= K.steps.length - 1;
  $('#st-all').disabled = K.at >= K.steps.length - 1;
}

/** Kết quả luôn hiện ở đầu cột phải (chip term, rê chuột ⇒ tô nhóm trên bản đồ). */
function renderResult() {
  const res = K.steps.at(-1);
  const host = $('#k-result');
  host.replaceChildren(el('span', 'kt-f', 'F ='));
  const groups = K.steps.filter(s => s.kind === 'group');
  if (!groups.length) host.append(el('span', null, prime(res.expr)));
  groups.forEach((g, i) => {
    if (i) host.append(el('span', 'plus', K.pos ? '·' : '+'));
    const chip = el('span', 'term' + (g.ess ? ' ess' : ''), prime(g.term));
    chip.style.setProperty('--gh', HUES[i % HUES.length]);
    chip.dataset.gid = 'g' + i;
    chip.addEventListener('mouseenter', () => { drawGroups(K.view, res.groups.map((x, j) => ({ id: 'g' + j, imp: x.imp, essential: true, hue: HUES[j % HUES.length] })), K.n); setHot($('#k-maps'), new Set(['g' + i])); });
    chip.addEventListener('mouseleave', paintStep);
    host.append(chip);
  });
  $('#k-cost').textContent = res.constant ? '' : T('kt.cost', { terms: res.terms, literals: res.literals });
}

function renderTruthTable() {
  const names = varNames(K.n);
  const t = el('table', 'grid');
  const hr = el('tr');
  [...names, 'm', 'F'].forEach(v => hr.appendChild(el('th', null, v)));
  t.appendChild(el('thead')).appendChild(hr);
  const tb = el('tbody');
  K.values.forEach((v, m) => {
    const tr = el('tr', 'tt-row' + (v === 1 ? ' on' : ''));
    [...toBits(m, K.n)].forEach(b => tr.appendChild(el('td', null, b)));
    tr.appendChild(el('td', 'muted', String(m)));
    tr.appendChild(el('td', v === 1 ? 'val-1' : v === 2 ? 'val-x' : 'val-0', v === 2 ? 'X' : String(v)));
    tr.addEventListener('click', () => setCell(m));
    tb.appendChild(tr);
  });
  t.appendChild(tb);
  $('#k-tt').replaceChildren(t);
}

/** Tính lại mọi thứ từ K.values; `keepAt` giữ bước đang xem (đổi ngôn ngữ). */
function refresh(keepAt = false) {
  const walked = walk(K.values, K.n, K.pos);
  K.steps = K.expand ? [{ kind: 'expand', lines: K.expand, groups: [] }, ...walked] : walked;
  if (!keepAt) K.at = 0;
  K.at = Math.min(K.at, K.steps.length - 1);
  paintValues(K.view, K.values);
  renderResult();
  renderSteps();
  paintStep();
  renderTruthTable();
}

function setN(n) {
  K.n = n;
  $('#k-n').value = String(n);
  K.view = buildMap($('#k-maps'), n, setCell, m => {
    if (m === null) { paintStep(); return; }
    const s = K.steps[K.at];
    const ids = (s.groups ?? []).flatMap((g, i) => (impCovers(g.imp, m) ? ['g' + i] : []));
    setHot($('#k-maps'), new Set(ids));
  });
}

function setCell(m) {
  K.values[m] = cycleValue(K.values[m]);
  K.expand = null;                                      // sửa tay ⇒ không còn là biểu thức đã gõ
  $('#k-spec').value = formatSpec(K.values);
  refresh();
}

function apply() {
  const err = $('#k-specerr');
  try {
    const r = readFunction($('#k-spec').value, K.n);
    if (r.n !== K.n) setN(r.n);
    K.values = r.values;
    K.expand = r.expand;
    err.textContent = '';
    refresh();
  } catch (e) {
    err.textContent = T('err.prefix') + tError(e);
  }
}

function load(values, text) {
  K.values = values;
  K.expand = null;
  $('#k-spec').value = text ?? formatSpec(values);
  $('#k-specerr').textContent = '';
  refresh();
}

export function setupKmapPage() {
  $('#k-n').addEventListener('change', () => { setN(+$('#k-n').value); load(new Array(1 << K.n).fill(0)); });
  $('#k-clear').addEventListener('click', () => load(new Array(1 << K.n).fill(0)));
  $('#k-rand').addEventListener('click', () => load(randomValues(K.n, true)));
  $('#k-apply').addEventListener('click', apply);
  $('#k-spec').addEventListener('keydown', e => { if (e.key === 'Enter') apply(); });
  $('#k-form').addEventListener('click', e => {
    const b = e.target.closest('button[data-f]');
    if (!b) return;
    K.pos = b.dataset.f === 'pos';
    $('#k-form').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    refresh();
  });
  $('#st-next').addEventListener('click', () => { K.at = Math.min(K.at + 1, K.steps.length - 1); renderSteps(); paintStep(); });
  $('#st-all').addEventListener('click', () => { K.at = K.steps.length - 1; renderSteps(); paintStep(); });
  $('#st-reset').addEventListener('click', () => { K.at = 0; renderSteps(); paintStep(); });
  onLangChange(() => refresh(true));
  setN(4);
  $('#k-spec').value = "x'y' + w'z + xyz'";                // ví dụ mở đầu: gõ theo tên biến ⇒ thấy cả bước khai triển
  apply();
}

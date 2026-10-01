import { el } from '@shared/ui/dom.js';
import { t as T, tError, onLangChange } from '../i18n/index.js';
import { createSolver } from '@shared/ui/solver.js';
import { parseNumbers } from '../logic/answer-check.js';
import { vectorReport, comboReport } from '../logic/report-vector.js';
import { systemReport } from '../logic/report-system.js';
import { matrixReport, OPS, NEEDS_B } from '../logic/report-matrix.js';
import { spaceReport } from '../logic/report-space.js';
import { matrixInput } from './matrix-input.js';
import { load, save } from '@shared/ui/store.js';

/* ---------------------------------------------------------------
   CÁC MÁY GIẢI của Đại số tuyến tính (màn Công cụ): mỗi máy = ô nhập + hàm report-*.js + khung gập shared/ui/solver.js.
   Mỗi hàm mountXxx(host) gắn vào một thẻ trống trong trang chương.
   --------------------------------------------------------------- */

const label = (text, ...kids) => el('label', {}, [el('span', { text }), ...kids]);
const field = (id, ph) => el('input', { type: 'text', id, placeholder: ph, autocomplete: 'off', spellcheck: 'false' });

/** Chạy tính toán; ngoại lệ có khoá từ điển ⇒ hiện thông báo thân thiện. */
const guard = (s, fn) => { try { s.show(fn()); } catch (e) { s.error(tError(e)); } };

/** Đọc một vector từ ô chữ: null nếu trống; ném Error(thông báo) nếu không đọc được. */
function readVec(text) {
  if (!text.trim()) return null;
  const v = parseNumbers(text);
  if (!v || !v.length) throw new Error(T('tool.badVec'));
  return v;
}
const tryUi = (s, fn) => { try { fn(); } catch (e) { s.error(tError(e)); } };

export function mountVectorSolver(host) {
  const store = 'tool-vec';
  const saved = load(store, { v: '1, 2, 2', w: '2, -1, 0' });
  const v = field('sv-v', T('tool.vecPh')), w = field('sv-w', T('tool.vecPh'));
  v.value = saved.v; w.value = saved.w;
  const s = createSolver(host, {
    practice: '#/practice/ch1',
    examples: [['3, 4', '4, 3'], ['1, 2, 2', '2, -1, 0'], ['1, 0', '1, 1'], ['1, 2', '2, 4']].map(([a, b]) => ({
      label: `(${a}) · (${b})`, apply: () => { v.value = a; w.value = b; run(); },
    })),
  });
  const labels = () => { s.inputs.replaceChildren(label(T('tool.vecV'), v), label(T('tool.vecW'), w)); };
  function run() {
    save(store, { v: v.value, w: w.value });
    tryUi(s, () => {
      const a = readVec(v.value);
      if (!a) { s.clear(); return; }
      guard(s, () => vectorReport(a, readVec(w.value)));
    });
  }
  v.addEventListener('input', run); w.addEventListener('input', run);
  labels(); onLangChange(labels);
  run();
}

export function mountComboSolver(host) {
  const store = 'tool-combo';
  const saved = load(store, { vs: '1, 0, 1\n0, 1, 1', w: '2, -1, 1' });
  const vs = el('textarea', { rows: '3', spellcheck: 'false', placeholder: '1, 0, 1\n0, 1, 1' });
  const w = field('sc-w', T('tool.vecPh'));
  vs.value = saved.vs; w.value = saved.w;
  const s = createSolver(host, {
    practice: '#/practice/ch1',
    examples: [
      { label: 'w = 2v₁ − v₂', apply: () => { vs.value = '1, 0, 1\n0, 1, 1'; w.value = '2, -1, 1'; run(); } },
      { label: () => T('sv.notCombo').replace(/\.$/, ''), apply: () => { vs.value = '1, 0, 0\n0, 1, 0'; w.value = '0, 0, 1'; run(); } },
    ],
  });
  const labels = () => { s.inputs.replaceChildren(label(T('tool.comboVs'), vs), label(T('tool.comboW'), w)); };
  function run() {
    save(store, { vs: vs.value, w: w.value });
    tryUi(s, () => {
      const rows = vs.value.split('\n').filter(l => l.trim());
      const target = readVec(w.value);
      if (!rows.length || !target) { s.clear(); return; }
      const vectors = rows.map(readVec);
      guard(s, () => comboReport(vectors, target));
    });
  }
  vs.addEventListener('input', run); w.addEventListener('input', run);
  labels(); onLangChange(labels);
  run();
}

export function mountSystemSolver(host) {
  const holder = el('div');
  const s = createSolver(host, {
    practice: '#/practice/ch2',
    examples: [
      { label: label3('2x+y+z=5…'), apply: () => mi.set([[2, 1, 1, 5], [4, -6, 0, -2], [-2, 7, 2, 9]]) },
      { label: label3('PA = LU'), apply: () => mi.set([[0, 1, 1, 1], [1, 2, 3, 2], [2, 1, 1, 3]]) },
      { label: () => T('ss.many').replace(/ \(.*$/, '').replace(/\.$/, ''), apply: () => mi.set([[1, 2, 3, 4], [2, 4, 6, 8]]) },
      { label: () => T('ss.none').replace(/\.$/, ''), apply: () => mi.set([[1, 1, 1], [1, 1, 2]]) },
    ],
  });
  const mi = matrixInput(holder, { key: 'system', augmented: true, initial: [[2, 1, 1, 5], [4, -6, 0, -2], [-2, 7, 2, 9]], onChange: run });
  const labels = () => s.inputs.replaceChildren(el('div', { class: 'sv-lab', text: T('tool.matAb') }), holder);
  function run() {
    const r = mi.read();
    if (r.empty) { s.clear(); return; }
    if (r.error) { s.error(r.error); return; }
    const A = r.M.map(row => row.slice(0, -1)), b = r.M.map(row => row.at(-1));
    guard(s, () => systemReport(A, b));
  }
  labels(); onLangChange(labels);
  run();
}
const label3 = text => () => text;

export function mountMatrixSolver(host) {
  const store = 'tool-matrix-op';
  let op = load(store, 'mul');
  const aHost = el('div'), bHost = el('div');
  const opBar = el('div', { class: 'seg sv-ops', role: 'group' });
  const s = createSolver(host, {
    practice: '#/practice/ch2',
    examples: [
      { label: 'A·B', apply: () => { pick('mul'); A.set([[1, 2], [3, 4]]); B.set([[5, 6], [7, 8]]); } },
      { label: 'det 3×3', apply: () => { pick('det'); A.set([[2, 1, 1], [4, -6, 0], [-2, 7, 2]]); } },
      { label: 'A⁻¹ 2×2', apply: () => { pick('inv'); A.set([[1, 2], [3, 4]]); } },
    ],
  });
  const A = matrixInput(aHost, { key: 'matA', initial: [[1, 2], [3, 4]], onChange: run });
  const B = matrixInput(bHost, { key: 'matB', initial: [[5, 6], [7, 8]], onChange: run });
  const aLab = el('div', { class: 'sv-lab' }), bLab = el('div', { class: 'sv-lab' });
  function pick(o) { op = o; save(store, op); drawOps(); run(); }
  function drawOps() {
    opBar.replaceChildren(...OPS.map(o => el('button', { type: 'button', 'aria-pressed': String(o === op), text: T('sm.op.' + o), onClick: () => pick(o) })));
    bHost.hidden = bLab.hidden = !NEEDS_B(op);
    aLab.textContent = T('tool.matA'); bLab.textContent = T('tool.matB');
  }
  s.inputs.replaceChildren(opBar, aLab, aHost, bLab, bHost);
  function run() {
    const a = A.read(), b = NEEDS_B(op) ? B.read() : { M: null };
    if (a.empty || b.empty) { s.clear(); return; }
    if (a.error || b.error) { s.error(a.error || b.error); return; }
    guard(s, () => matrixReport(op, a.M, b.M));
  }
  drawOps(); onLangChange(drawOps);
  run();
}

export function mountSpaceSolver(host) {
  const holder = el('div');
  const s = createSolver(host, {
    practice: '#/practice/ch3',
    examples: [
      { label: '3×3 hạng 2', apply: () => mi.set([[1, 2, 3], [2, 4, 6], [1, 0, 1]]) },
      { label: '2×3', apply: () => mi.set([[1, 2, 1], [2, 4, 3]]) },
      { label: '3×3 khả nghịch', apply: () => mi.set([[2, 1, 1], [4, -6, 0], [-2, 7, 2]]) },
    ],
  });
  const mi = matrixInput(holder, { key: 'space', initial: [[1, 2, 3], [2, 4, 6], [1, 0, 1]], onChange: run });
  const labels = () => s.inputs.replaceChildren(el('div', { class: 'sv-lab', text: T('tool.matA') }), holder);
  function run() {
    const r = mi.read();
    if (r.empty) { s.clear(); return; }
    if (r.error) { s.error(r.error); return; }
    guard(s, () => spaceReport(r.M));
  }
  labels(); onLangChange(labels);
  run();
}

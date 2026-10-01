import { el } from '@shared/ui/dom.js';
import { t as T, tError, onLangChange } from '../i18n/index.js';
import { createSolver } from '@shared/ui/solver.js';
import { vectorReport, comboReport, sub } from '../logic/report-vector.js';
import { systemReport } from '../logic/report-system.js';
import { matrixReport, OPS, NEEDS_B } from '../logic/report-matrix.js';
import { spaceReport } from '../logic/report-space.js';
import { randMatrix, randInvertible, randSystem, randVectorPair, randCombo, randLowRank } from '../logic/random-input.js';
import { matrixInput } from './matrix-input.js';
import { glossary } from './glossary.js';
import { load, save } from '@shared/ui/store.js';

/* ---------------------------------------------------------------
   CÁC MÁY GIẢI của Đại số tuyến tính (màn Công cụ): mỗi máy = ô nhập dạng LƯỚI (vector là CỘT) + hàm report-*.js
   + khung gập shared/ui/solver.js. Mỗi máy có nút 🎲 Ngẫu nhiên (logic/random-input.js).
   Mỗi hàm mountXxx(host) gắn vào một thẻ trống trong trang chương.
   --------------------------------------------------------------- */

const colsOf = M => M[0].map((_, j) => M.map(row => row[j]));      // cột → vector
/** Chạy tính toán; ngoại lệ có khoá từ điển ⇒ hiện thông báo thân thiện. */
const guard = (s, fn) => { try { s.show(fn()); } catch (e) { s.error(tError(e)); } };
/** Đọc lưới; trả null (và báo lỗi / xoá kết quả) nếu chưa dùng được. */
function readGrid(mi, s) {
  const r = mi.read();
  if (r.empty) { s.clear(); return null; }
  if (r.error) { s.error(r.error); return null; }
  return r.M;
}
const label = (host, text) => el('div', { class: 'sv-lab', text });

export function mountVectorSolver(host) {
  const holder = el('div');
  const s = createSolver(host, {
    terms: glossary,
    practice: '#/practice/ch1',
    random: () => mi.set(randVectorPair()),
    examples: [[[3, 4], [4, 3]], [[1, 2, 2], [2, -1, 0]], [[1, 0], [1, 1]], [[1, 2], [2, 4]]].map(([a, b]) => ({
      label: `(${a}) · (${b})`, apply: () => mi.set(a.map((x, i) => [x, b[i]])),
    })),
  });
  const mi = matrixInput(holder, { key: 'vec', initial: [[1, 2], [2, -1], [2, 0]], fixedCols: true, colLabels: ['v', 'w'], onChange: run });
  const draw = () => s.inputs.replaceChildren(label(host, T('tool.vecGrid')), holder);
  function run() {
    if (mi.colEmpty(0)) { s.clear(); return; }
    const M = readGrid(mi, s);
    if (!M) return;
    const [v, w] = colsOf(M);
    guard(s, () => vectorReport(v, mi.colEmpty(1) ? null : w));        // cột w trống ⇒ chỉ tính cho v
  }
  draw(); onLangChange(draw);
  run();
}

export function mountComboSolver(host) {
  const holder = el('div');
  const s = createSolver(host, {
    terms: glossary,
    practice: '#/practice/ch1',
    random: () => mi.set(randCombo()),
    examples: [
      { label: 'w = 2v₁ − v₂', apply: () => mi.set([[1, 0, 2], [0, 1, -1], [1, 1, 1]]) },
      { label: () => T('solver.notCombo'), apply: () => mi.set([[1, 0, 0], [0, 1, 0], [0, 0, 1]]) },
    ],
  });
  const mi = matrixInput(holder, {
    key: 'combo', augmented: true, initial: [[1, 0, 2], [0, 1, -1], [1, 1, 1]],
    colLabels: (j, isB) => (isB ? 'w' : `v${sub(j + 1)}`), onChange: run,
  });
  const draw = () => s.inputs.replaceChildren(label(host, T('tool.comboGrid')), holder);
  function run() {
    const M = readGrid(mi, s);
    if (!M) return;
    const cols = colsOf(M);
    guard(s, () => comboReport(cols.slice(0, -1), cols.at(-1)));
  }
  draw(); onLangChange(draw);
  run();
}

export function mountSystemSolver(host) {
  const holder = el('div');
  const s = createSolver(host, {
    terms: glossary,
    practice: '#/practice/ch2',
    random: () => mi.set(randSystem(3)),
    examples: [
      { label: '3×3 (Strang)', apply: () => mi.set([[2, 1, 1, 5], [4, -6, 0, -2], [-2, 7, 2, 9]]) },
      { label: 'PA = LU', apply: () => mi.set([[0, 1, 1, 1], [1, 2, 3, 2], [2, 1, 1, 3]]) },
      { label: () => T('solver.many'), apply: () => mi.set([[1, 2, 3, 4], [2, 4, 6, 8]]) },
      { label: () => T('solver.none'), apply: () => mi.set([[1, 1, 1], [1, 1, 2]]) },
    ],
  });
  const mi = matrixInput(holder, { key: 'system', augmented: true, initial: [[2, 1, 1, 5], [4, -6, 0, -2], [-2, 7, 2, 9]], onChange: run });
  const draw = () => s.inputs.replaceChildren(label(host, T('tool.matAb')), holder);
  function run() {
    const M = readGrid(mi, s);
    if (!M) return;
    guard(s, () => systemReport(M.map(row => row.slice(0, -1)), M.map(row => row.at(-1))));
  }
  draw(); onLangChange(draw);
  run();
}

export function mountMatrixSolver(host) {
  const store = 'tool-matrix-op';
  let op = load(store, 'mul');
  const aHost = el('div'), bHost = el('div');
  const opBar = el('div', { class: 'seg sv-ops', role: 'group' });
  const dim = () => 2 + Math.floor(Math.random() * 2);                // 2 hoặc 3
  function randomize() {                                              // cỡ phụ thuộc phép đang chọn
    const m = dim(), k = dim(), n = dim();
    if (op === 'mul') { A.set(randMatrix(m, k)); B.set(randMatrix(k, n)); }
    else if (op === 'add' || op === 'sub') { A.set(randMatrix(m, n)); B.set(randMatrix(m, n)); }
    else if (op === 'det' || op === 'inv') A.set(randInvertible(m));
    else if (op === 'rank') A.set(randLowRank(m, k + 1));
    else A.set(randMatrix(m, n));
  }
  const s = createSolver(host, {
    terms: glossary,
    practice: '#/practice/ch2',
    random: randomize,
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
    terms: glossary,
    practice: '#/practice/ch3',
    random: () => mi.set(randLowRank(3, 4)),
    examples: [
      { label: '3×3 hạng 2', apply: () => mi.set([[1, 2, 3], [2, 4, 6], [1, 0, 1]]) },
      { label: '2×3', apply: () => mi.set([[1, 2, 1], [2, 4, 3]]) },
      { label: '3×3 khả nghịch', apply: () => mi.set([[2, 1, 1], [4, -6, 0], [-2, 7, 2]]) },
    ],
  });
  const mi = matrixInput(holder, { key: 'space', initial: [[1, 2, 3], [2, 4, 6], [1, 0, 1]], onChange: run });
  const draw = () => s.inputs.replaceChildren(label(host, T('tool.matA')), holder);
  function run() {
    const M = readGrid(mi, s);
    if (!M) return;
    guard(s, () => spaceReport(M));
  }
  draw(); onLangChange(draw);
  run();
}

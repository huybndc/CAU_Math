import { t as T, onLangChange } from '../i18n/index.js';
import { el } from './dom-helpers.js';
import { mathSpan } from '@shared/ui/question.js';
import { parseNumber } from '../logic/answer-check.js';
import { fmt } from '../logic/num-format.js';
import { solve, generalSolutionString, residual } from '../logic/linear-system.js';
import { ldu, checkLdu, solveLdu } from '../logic/ldu.js';
import { fmtAug } from '../logic/quiz-kit.js';

/* ---------------------------------------------------------------
   NHÁP → "Giải Ax = b": điền A và b vào lưới, ra nghiệm + khử Gauss từng bước + phân tích PA = LDU.
   Dùng để KIỂM bài làm tay (D45: Nháp làm hộ phần chép, không thay bài đang kiểm tra) — các phần dài đều gập sẵn.
   Logic: logic/linear-system.js (Gauss), logic/ldu.js (LDU). Trạng thái lưu theo trình duyệt: `scratch-ax`.
   --------------------------------------------------------------- */

const MAX = 5;
const KEY = 'scratch-ax';
const blank = (r, c) => Array.from({ length: r }, () => Array(c).fill(''));
const mat = M => '[' + M.map(r => r.map(x => fmt(x)).join(' ')).join('; ') + ']';
const arrow = s => s.replace('<->', '↔').replace('<-', '←');

export function mountAxSolver(host, storageKey = KEY) {
  let st;
  try { st = JSON.parse(localStorage.getItem(storageKey)); } catch { /* chưa có / riêng tư */ }
  if (!st?.cells || !st.cells.length) st = { r: 3, c: 3, cells: blank(3, 4) };   // cột cuối là b
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(st)); } catch { /* đầy / riêng tư */ } };
  host.classList.add('ax');

  const bar = el('div', 'ax-bar');
  const grid = el('div', 'ax-grid');
  const out = el('div', 'ax-out');
  host.replaceChildren(bar, grid, out);

  const resize = (r, c) => {
    r = Math.max(1, Math.min(MAX, r)); c = Math.max(1, Math.min(MAX, c));
    st.cells = blank(r, c + 1).map((row, i) => row.map((_, j) => (j === c ? st.cells[i]?.[st.c] : st.cells[i]?.[j]) ?? ''));
    st.r = r; st.c = c;
    save(); drawBar(); drawGrid(); run();
  };
  const btn = (text, title, act, disabled) => {
    const b = el('button', 'mp-btn', text);
    b.type = 'button'; b.title = b.ariaLabel = title; b.disabled = !!disabled;
    b.addEventListener('click', act);
    return b;
  };
  function drawBar() {
    bar.replaceChildren(
      el('span', 'mp-dim', T('ax.rows')), btn('−', T('ax.rows') + ' −', () => resize(st.r - 1, st.c), st.r <= 1), btn('+', T('ax.rows') + ' +', () => resize(st.r + 1, st.c), st.r >= MAX),
      el('span', 'mp-dim', T('ax.cols')), btn('−', T('ax.cols') + ' −', () => resize(st.r, st.c - 1), st.c <= 1), btn('+', T('ax.cols') + ' +', () => resize(st.r, st.c + 1), st.c >= MAX),
      btn(T('ax.clear'), T('ax.clear'), () => { st.cells = blank(st.r, st.c + 1); save(); drawGrid(); run(); }),
    );
  }
  function drawGrid() {
    grid.style.gridTemplateColumns = `repeat(${st.c + 1}, 3.4em)`;
    const inputs = [];
    for (let i = 0; i < st.r; i++) for (let j = 0; j <= st.c; j++) {
      const inp = el('input', 'mp-cell' + (j === st.c ? ' bar' : ''));
      inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false;
      inp.setAttribute('aria-label', j === st.c ? `b${i + 1}` : `(${i + 1}, ${j + 1})`);
      inp.value = st.cells[i][j] ?? '';
      inp.addEventListener('input', () => { st.cells[i][j] = inp.value; save(); run(); });
      inp.addEventListener('keydown', e => {
        const at = (a, b) => inputs[a * (st.c + 1) + b];
        const go = t => { if (t) { e.preventDefault(); t.focus(); } };
        if (e.key === 'Enter') go(inputs[i * (st.c + 1) + j + 1]);
        else if (e.key === 'ArrowDown') go(at(i + 1, j));
        else if (e.key === 'ArrowUp') go(at(i - 1, j));
      });
      inputs.push(inp);
    }
    grid.replaceChildren(...inputs);
  }

  const fold = (title, ...kids) => { const d = el('details', 'ax-fold'); d.append(el('summary', null, title), ...kids); return d; };
  const line = (...kids) => { const d = el('div', 'ax-line'); d.append(...kids); return d; };
  const math = s => { const sp = mathSpan(s); return sp; };

  function run() {
    out.replaceChildren();
    const num = x => (String(x ?? '').trim() === '' ? 0 : parseNumber(x));
    const M = st.cells.map(row => row.map(num));
    if (M.some(row => row.some(v => v === null))) { out.append(el('p', 'ax-err', T('ax.bad'))); return; }
    if (M.every(row => row.every(v => v === 0))) { out.append(el('p', 'ax-tip', T('ax.tip'))); return; }
    const A = M.map(row => row.slice(0, -1)), b = M.map(row => row.at(-1));

    /* kết quả */
    const r = solve(A, b);
    const head = el('div', 'ax-result ' + r.type);
    if (r.type === 'none') head.append(el('b', null, T('ax.none')), el('p', null, T('ax.noneWhy', { row: r.badRow + 1 })));
    else if (r.type === 'unique') {
      head.append(el('b', null, T('ax.unique')));
      head.append(line(math(r.solution.map((v, i) => `x${'₁₂₃₄₅'[i]} = ${fmt(v)}`).join(',   '))));
    } else {
      head.append(el('b', null, T('ax.infinite', { k: r.freeCount })), line(math(generalSolutionString(r))));
    }
    if (r.solution || r.particular) head.append(el('small', 'mp-dim', T('ax.check', { e: residual(A, r.solution ?? r.particular, b).toExponential(0) })));
    out.append(head);

    /* khử Gauss từng bước (gập) */
    const steps = el('div', 'ax-steps');
    steps.append(line(math(fmtAug(r.start))));
    for (const s of [...r.forwardSteps, ...r.backwardSteps]) {
      if (!s.formula) continue;
      steps.append(line(el('span', 'ax-op', arrow(s.formula)), math(fmtAug(s.matrix))));
    }
    out.append(fold(T('ax.gauss', { n: r.forwardSteps.filter(s => s.formula).length + r.backwardSteps.length }), steps));

    /* PA = LDU (gập) */
    const f = ldu(A);
    const lu = el('div', 'ax-steps');
    const ok = checkLdu(A, f);
    if (f.swaps.length) lu.append(line(el('span', 'ax-op', T('ax.swaps', { list: f.swaps.map(([i, j]) => `R${i + 1}↔R${j + 1}`).join(', ') }))));
    const Dm = f.D && f.D.map((d, i) => f.D.map((_, j) => (i === j ? d : 0)));
    lu.append(line(math(`${f.swaps.length ? 'P = ' + mat(f.P) + '   ' : ''}L = ${mat(f.L)}`)));
    if (f.invertible) {
      lu.append(line(math(`D = ${mat(Dm)}`)), line(math(`U = ${mat(f.U1)}`)),
        line(el('span', 'ax-op', `${f.swaps.length ? 'PA' : 'A'} = L·D·U  ${ok ? '✓' : '✗'}`)));
      if (f.L.length === b.length) {
        const s = solveLdu(f, b);
        lu.append(line(el('span', 'ax-op', T('ax.sub')), math(`${f.swaps.length ? 'Pb' : 'b'} = (${s.pb.map(v => fmt(v)).join(', ')})`)),
          line(math(`Lc = ${f.swaps.length ? 'Pb' : 'b'} ⇒ c = (${s.c.map(v => fmt(v)).join(', ')})`)),
          line(math(`Dy = c ⇒ y = (${s.y.map(v => fmt(v)).join(', ')})`)),
          line(math(`Ux = y ⇒ x = (${s.x.map(v => fmt(v)).join(', ')})`)));
      }
    } else {
      lu.append(line(math(`U = ${mat(f.U)}`)), line(el('span', 'ax-op', T('ax.noD', { rank: f.rank })), ok ? '' : ' ✗'));
    }
    out.append(fold(T('ax.ldu'), lu));
  }
  drawBar(); drawGrid(); run();
  onLangChange(() => { drawBar(); run(); });
}

import { el } from './dom-helpers.js';
import { parseNumber } from '../logic/answer-check.js';

/* ---------------------------------------------------------------
   Ô TRẢ LỜI dạng toán: vector (cột có ngoặc, hoặc hàng có nhãn "x = …") và ma trận (lưới ô).
     vec     { n, labels?, orient?: 'col'|'row', tol? }  → get() "a, b, c"
     matrix  { rows, cols, tol? }                        → get() "[a b; c d]"
   Cùng một lưới: Enter / ↓ sang ô sau, ↑ về ô trước, Enter ở ô cuối = nộp; dán "1 2 3" tự rải vào các ô liền sau.
   Chuỗi trả về đúng định dạng logic/answer-check.js đang nhận nên phần chấm không đổi.
   --------------------------------------------------------------- */

/** Tách chuỗi đáp án cũ ("1, 2" hoặc "[1 2; 3 4]") thành mảng ô theo thứ tự hàng. */
export function cellsOf(given, rows, cols) {
  const s = String(given ?? '').replace(/[[\]()]/g, '').trim();
  if (!s) return [];
  return s.split(/[,;\s]+/).filter(Boolean);       // cột "a, b, c" (rows>1) và ma trận "a b; c d" đều tách đúng, không để dấu phẩy dính vào ô
}

function grid({ rows, cols, labels, cls }, ctx, tol, getWant) {
  const old = cellsOf(ctx.given, rows, cols);
  const want = ctx.locked ? getWant() : null;
  const g = el('div', 'matgrid ' + cls);
  g.style.gridTemplateColumns = `repeat(${labels && cols === 1 ? 2 : cols}, auto)`;
  const inputs = [];
  const fill = (from, parts) => parts.forEach((v, k) => { if (inputs[from + k]) inputs[from + k].value = v; });
  for (let i = 0; i < rows * cols; i++) {
    if (labels && cols === 1) g.append(el('span', 'matlab step-math', labels[i] + ' ='));
    const inp = el('input');
    inp.type = 'text';
    inp.autocomplete = 'off';
    inp.spellcheck = false;
    inp.setAttribute('aria-label', labels?.[i] ?? (cols === 1 ? `${i + 1}` : `(${Math.floor(i / cols) + 1}, ${(i % cols) + 1})`));
    inp.value = old[i] ?? '';
    inp.disabled = !!ctx.locked;
    if (want) {
      const v = parseNumber(inp.value);
      inp.classList.add(v !== null && Math.abs(v - want[i]) <= tol ? 'good' : 'bad');
    }
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (inputs[i + 1]) inputs[i + 1].focus(); else ctx.onSubmit();
      } else if (e.key === 'ArrowDown' && inputs[i + cols]) { e.preventDefault(); inputs[i + cols].focus(); }
      else if (e.key === 'ArrowUp' && inputs[i - cols]) { e.preventDefault(); inputs[i - cols].focus(); }
    });
    inp.addEventListener('paste', e => {
      const parts = cellsOf(e.clipboardData?.getData('text'), rows, cols);
      if (parts.length < 2) return;
      e.preventDefault();
      fill(i, parts);
    });
    inputs.push(inp);
    g.append(inp);
  }
  return { g, inputs };
}

const clean = x => x.value.replace(/\s+/g, '');
const bracket = (...kids) => { const b = el('div', 'matbox'); b.append(el('div', 'brk'), ...kids, el('div', 'brk r')); return b; };

export function vec(spec, ctx) {
  const row = spec.orient === 'row';
  const { g, inputs } = grid({ rows: row ? 1 : spec.n, cols: row ? spec.n : 1, labels: row ? null : spec.labels, cls: 'w-vec' + (row ? ' row' : '') },
    ctx, spec.tol ?? 1e-6, () => (Array.isArray(ctx.answer) ? ctx.answer : []));
  let host = bracket(g);
  if (spec.labels && row) {                     // hàng có nhãn: "x = [ ]  y = [ ]"
    host = el('div', 'w-fields');
    inputs.forEach((inp, i) => { const l = el('label', 'w-field'); l.append(el('span', 'step-math', spec.labels[i]), inp); host.append(l); });
  }
  const box = el('div', 'w-vecbox');
  box.append(host);
  return { el: box, get: () => (inputs.every(x => x.value.trim()) ? inputs.map(clean).join(', ') : ''), focus: () => inputs[0].focus() };
}

export function matrix(spec, ctx) {
  const { g, inputs } = grid({ rows: spec.rows, cols: spec.cols, cls: 'w-matrix-grid' },
    ctx, spec.tol ?? 1e-6, () => (Array.isArray(ctx.answer) ? ctx.answer.flat() : []));
  const box = bracket(g);
  box.classList.add('w-matrix');
  return {
    el: box,
    get: () => (inputs.every(x => x.value.trim())
      ? '[' + [...Array(spec.rows).keys()].map(i => inputs.slice(i * spec.cols, (i + 1) * spec.cols).map(clean).join(' ')).join('; ') + ']'
      : ''),
    focus: () => inputs[0].focus(),
  };
}

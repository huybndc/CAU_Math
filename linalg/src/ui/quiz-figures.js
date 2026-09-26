import { el } from './dom-helpers.js';
import { renderMatrix } from './matrix-view.js';
import { parseNumber } from '../logic/answer-check.js';

/* ---------------------------------------------------------------
   HÌNH & Ô TRẢ LỜI cho câu tự sinh (shared/ui/question.js gọi theo q.figure.type / q.input.type).
     mats    { items: [['A', ma trận], ['x', vector]] } → "A = [ … ]  x = [ … ]" có ngoặc vuông
     system  { lines: ['2x + y = 3', …] }               → hệ phương trình có ngoặc nhọn
     matrix  { rows, cols }                             → lưới ô nhập, get() → "[a b; c d]"
   --------------------------------------------------------------- */

export function mats(spec) {
  const box = el('div', 'q-mats');
  for (const [name, M] of spec.items) {
    const item = el('div', 'q-mat');
    const host = el('div');
    renderMatrix(host, Array.isArray(M[0]) ? M : M.map(x => [x]), { augmented: false });
    item.append(el('span', 'q-mat-name step-math', name), el('span', null, '='), host);
    box.append(item);
  }
  return box;
}

export function system(spec) {
  const box = el('div', 'q-system');
  spec.lines.forEach(s => box.append(el('div', 'step-math', s.replace(/-/g, '−'))));
  return box;
}

export function matrix(spec, ctx) {
  const old = String(ctx.given ?? '').replace(/[[\]]/g, '').split(';').map(r => r.trim().split(/\s+/));
  const want = ctx.locked && Array.isArray(ctx.answer) ? ctx.answer : null;
  const g = el('div', 'matgrid');
  g.style.gridTemplateColumns = `repeat(${spec.cols}, auto)`;
  const inputs = [];
  for (let i = 0; i < spec.rows; i++) {
    for (let j = 0; j < spec.cols; j++) {
      const inp = el('input');
      inp.type = 'text';
      inp.autocomplete = 'off';
      inp.inputMode = 'decimal';
      inp.setAttribute('aria-label', `(${i + 1}, ${j + 1})`);
      inp.value = old[i]?.[j] ?? '';
      inp.disabled = !!ctx.locked;
      if (want) {
        const v = parseNumber(inp.value);
        inp.classList.add(v !== null && Math.abs(v - want[i][j]) < 1e-6 ? 'good' : 'bad');
      }
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); ctx.onSubmit(); }
      });
      inputs.push(inp);
      g.append(inp);
    }
  }
  const box = el('div', 'matbox w-matrix');
  box.append(el('div', 'brk'), g, el('div', 'brk r'));
  return {
    el: box,
    get: () => (inputs.every(x => x.value.trim())
      ? '[' + [...Array(spec.rows).keys()].map(i => inputs.slice(i * spec.cols, (i + 1) * spec.cols).map(x => x.value.trim()).join(' ')).join('; ') + ']'
      : ''),
  };
}

export const FIGURES = { mats, system };
export const WIDGETS = { matrix };

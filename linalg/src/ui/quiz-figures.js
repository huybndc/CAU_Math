import { el } from './dom-helpers.js';
import { renderMatrix } from './matrix-view.js';
import { vec, matrix } from './answer-widgets.js';

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

export const FIGURES = { mats, system };
export const WIDGETS = { matrix, vec };

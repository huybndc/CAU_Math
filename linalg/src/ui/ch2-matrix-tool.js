import { $, el } from './dom-helpers.js';
import { t as T, tError, onLangChange } from '../i18n/index.js';
import { multiply } from '../logic/matrix.js';
import { fmt } from '../logic/num-format.js';
import { renderMatrix, renderMatrixInputs } from './matrix-view.js';

let A = null;
let B = null;

function sample(rows, cols, which) {
  if (rows === 2 && cols === 2) return which === 'A' ? [[1, 2], [3, 4]] : [[0, 1], [2, 1]];
  return Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (
    which === 'A' ? i * cols + j + 1 : (i + 2 * j) % 3 - 1
  )));
}

function labelInputs(inputs, name) {
  inputs.forEach((row, i) => row.forEach((input, j) => input.setAttribute('aria-label', `${name}${i + 1}${j + 1}`)));
}

function clearOutput(message = '') {
  $('#i2-mul-error').textContent = message;
  $('#i2-mul-size').textContent = '';
  $('#i2-mul-result').replaceChildren();
  $('#i2-mul-steps').replaceChildren();
}

function renderProduct() {
  if (!A || !B) {
    clearOutput(T('c2.mulError'));
    return;
  }

  try {
    const product = multiply(A, B);
    $('#i2-mul-error').textContent = '';
    $('#i2-mul-size').textContent = `${A.length}×${B[0].length}`;
    renderMatrix($('#i2-mul-result'), product, { augmented: false });
    const steps = product.flatMap((row, i) => row.map((value, j) => {
      const terms = A[i].map((a, k) => `(${fmt(a)})·(${fmt(B[k][j])})`).join(' + ');
      const step = el('div', 'step done');
      step.appendChild(el('div', 'opline', `c${i + 1}${j + 1} = ${terms} = ${fmt(value)}`));
      return step;
    }));
    $('#i2-mul-steps').replaceChildren(...steps);
  } catch (error) {
    clearOutput(T('err.prefix') + tError(error));
  }
}

function mountInputs() {
  const rows = Number($('#i2-mul-m').value);
  const inner = Number($('#i2-mul-k').value);
  const cols = Number($('#i2-mul-n').value);
  A = sample(rows, inner, 'A');
  B = sample(inner, cols, 'B');
  labelInputs(renderMatrixInputs($('#i2-mul-a'), A, next => { A = next; renderProduct(); }, { augmented: false }), 'A');
  labelInputs(renderMatrixInputs($('#i2-mul-b'), B, next => { B = next; renderProduct(); }, { augmented: false }), 'B');
  renderProduct();
}

export function setupCh2MatrixTool() {
  ['#i2-mul-m', '#i2-mul-k', '#i2-mul-n'].forEach(selector => $(selector).addEventListener('change', mountInputs));
  $('#i2-mul-reset').addEventListener('click', mountInputs);
  onLangChange(renderProduct);
  mountInputs();
}
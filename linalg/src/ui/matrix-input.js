import { el } from '@shared/ui/dom.js';
import { t as T, onLangChange } from '../i18n/index.js';
import { parseNumber } from '../logic/answer-check.js';
import { load, save } from '@shared/ui/store.js';

/* ---------------------------------------------------------------
   Ô NHẬP MA TRẬN cho các máy giải: lưới 1×1…5×5, nhớ kích thước + nội dung theo trình duyệt.
   Mũi tên / Enter chuyển ô. Ô trống = 0. `augmented`: cột cuối là vế phải b (vạch ngăn).
   --------------------------------------------------------------- */

const MAX = 5;
const blank = (r, c) => Array.from({ length: r }, () => Array(c).fill(''));

/**
 * @param {HTMLElement} host
 * @param {{ key: string, rows?: number, cols?: number, augmented?: boolean, initial?: number[][], onChange: () => void }} cfg
 *   cols = số cột của A (không tính cột b).
 * @returns {{ read(): { M?: number[][], empty?: boolean, error?: string }, set(M: (number|string)[][]): void }}
 */
export function matrixInput(host, { key, rows = 3, cols = 3, augmented = false, initial = null, onChange }) {
  const store = `mi-${key}`;
  let st = load(store, null);
  const width = c => c + (augmented ? 1 : 0);
  if (!st?.cells?.length || st.cells[0].length !== width(st.c)) {
    st = initial ? { r: initial.length, c: initial[0].length - (augmented ? 1 : 0), cells: initial.map(r => r.map(String)) } : { r: rows, c: cols, cells: blank(rows, width(cols)) };
  }
  const persist = () => save(store, st);

  const bar = el('div', { class: 'mp-bar' });
  const grid = el('div', { class: 'ax-grid' });
  host.classList.add('mi');
  host.replaceChildren(bar, grid);

  const btn = (text, title, act, disabled) => el('button', { type: 'button', class: 'mp-btn', text, title, 'aria-label': title, disabled: disabled ? '' : null, onClick: act });
  function resize(r, c) {
    r = Math.max(1, Math.min(MAX, r)); c = Math.max(1, Math.min(MAX, c));
    const old = st;
    st = {
      r, c,
      cells: blank(r, width(c)).map((row, i) => row.map((_, j) => (augmented && j === c ? old.cells[i]?.[old.c] : old.cells[i]?.[j]) ?? '')),
    };
    persist(); drawBar(); drawGrid(); onChange();
  }
  function drawBar() {
    bar.replaceChildren(
      el('span', { class: 'mp-dim', text: T('tool.rows') }), btn('−', T('tool.rows') + ' −', () => resize(st.r - 1, st.c), st.r <= 1), btn('+', T('tool.rows') + ' +', () => resize(st.r + 1, st.c), st.r >= MAX),
      el('span', { class: 'mp-dim', text: T('tool.cols') }), btn('−', T('tool.cols') + ' −', () => resize(st.r, st.c - 1), st.c <= 1), btn('+', T('tool.cols') + ' +', () => resize(st.r, st.c + 1), st.c >= MAX),
      btn(T('tool.clear'), T('tool.clear'), () => { st.cells = blank(st.r, width(st.c)); persist(); drawGrid(); onChange(); }),
    );
  }
  function drawGrid() {
    grid.style.gridTemplateColumns = `repeat(${width(st.c)}, 3.6em)`;
    const inputs = [];
    for (let i = 0; i < st.r; i++) {
      for (let j = 0; j < width(st.c); j++) {
        const inp = el('input', {
          class: 'mp-cell' + (augmented && j === st.c ? ' bar' : ''), type: 'text', autocomplete: 'off', spellcheck: 'false', inputmode: 'text',
          'aria-label': augmented && j === st.c ? `b${i + 1}` : `(${i + 1}, ${j + 1})`, placeholder: '0', value: st.cells[i][j] ?? '',
        });
        inp.addEventListener('input', () => { st.cells[i][j] = inp.value; persist(); onChange(); });
        inp.addEventListener('keydown', e => {
          const move = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0], Enter: [1, 0] }[e.key];
          if (!move) return;
          const at = (i + move[0]) * width(st.c) + j + move[1];
          if (inputs[at] && (i + move[0] >= 0) && (j + move[1] >= 0) && (j + move[1] < width(st.c))) { e.preventDefault(); inputs[at].focus(); inputs[at].select(); }
        });
        inputs.push(inp);
      }
    }
    grid.replaceChildren(...inputs);
  }
  drawBar(); drawGrid();
  onLangChange(drawBar);

  return {
    read() {
      const M = [];
      if (st.cells.every(r => r.every(x => String(x ?? '').trim() === ''))) return { empty: true };
      for (let i = 0; i < st.r; i++) {
        const row = [];
        for (let j = 0; j < width(st.c); j++) {
          const raw = String(st.cells[i][j] ?? '').trim();
          const v = raw === '' ? 0 : parseNumber(raw);
          if (v === null) return { error: T('tool.badCell', { r: i + 1, c: augmented && j === st.c ? 'b' : j + 1 }) };
          row.push(v);
        }
        M.push(row);
      }
      return { M };
    },
    set(M) {
      const r = M.length, c = M[0].length - (augmented ? 1 : 0);
      st = { r, c, cells: M.map(row => row.map(String)) };
      persist(); drawBar(); drawGrid(); onChange();
    },
  };
}

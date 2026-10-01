import { t as T } from '../i18n/index.js';
import { ht as h } from './dom.js';

/* ---------------------------------------------------------------
   NHÁP — LƯỚI MA TRẬN: điền số vào ma trận (tối đa 6 ma trận, mỗi cái ≤ 6×7) để làm tay khử Gauss, nhân ma trận…
   Chỉ làm hộ phần CHÉP (kích thước, vạch |, nhân bản bước trước xuống dưới) — không tự tính hộ phép biến đổi (D45).
   Lưu theo môn trong localStorage `scratch-mat:<môn>`: [{ r, c, bar, cells: [[…]] }].
   --------------------------------------------------------------- */

const MAX = { mats: 6, r: 6, c: 7 };
const blank = (r, c) => Array.from({ length: r }, () => Array(c).fill(''));
const fresh = () => ({ r: 3, c: 4, bar: true, cells: blank(3, 4) });

export function mountMatrixPad(host, key) {
  let mats;
  try { mats = JSON.parse(localStorage.getItem(key)); } catch { /* chưa có / riêng tư */ }
  if (!Array.isArray(mats) || !mats.length) mats = [fresh()];
  const save = () => { try { localStorage.setItem(key, JSON.stringify(mats)); } catch { /* đầy / riêng tư */ } };

  const btn = (text, title, act, disabled = false) => {
    const b = h('button', 'mp-btn', text);
    b.type = 'button';
    b.title = b.ariaLabel = title;
    b.disabled = disabled;
    b.addEventListener('click', act);
    return b;
  };
  const pressed = (b, on) => { b.setAttribute('aria-pressed', String(on)); return b; };
  const resize = (m, r, c) => {
    r = Math.max(1, Math.min(MAX.r, r)); c = Math.max(1, Math.min(MAX.c, c));
    m.cells = blank(r, c).map((row, i) => row.map((_, j) => m.cells[i]?.[j] ?? ''));
    m.r = r; m.c = c;
    if (c < 2) m.bar = false;
  };

  function cell(m, i, j, focusAt) {
    const inp = h('input', 'mp-cell' + (m.bar && j === m.c - 1 ? ' bar' : ''));
    inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false;
    inp.setAttribute('aria-label', `(${i + 1}, ${j + 1})`);
    inp.value = m.cells[i][j];
    inp.addEventListener('input', () => { m.cells[i][j] = inp.value; save(); });
    inp.addEventListener('keydown', e => {
      const at = (a, b) => host.querySelector(`[data-m="${focusAt}"] [data-p="${a},${b}"]`);
      const go = el => { if (!el) return false; e.preventDefault(); el.focus(); return true; };
      if (e.key === 'Enter') go(at(i, j + 1) ?? at(i + 1, 0));
      else if (e.key === 'ArrowDown') go(at(i + 1, j));
      else if (e.key === 'ArrowUp') go(at(i - 1, j));
      else if (e.key === 'ArrowRight' && inp.selectionStart === inp.value.length) go(at(i, j + 1));
      else if (e.key === 'ArrowLeft' && inp.selectionStart === 0) go(at(i, j - 1));
    });
    inp.dataset.p = `${i},${j}`;
    return inp;
  }

  function draw() {
    host.replaceChildren(...mats.map((m, k) => {
      const box = h('div', 'mp'); box.dataset.m = k;
      const bar = h('div', 'mp-bar');
      const redraw = fn => () => { fn(); save(); draw(); };
      bar.append(
        h('span', 'mp-dim', `${m.r}×${m.c}`),
        btn('−', T('scratch.matRows') + ' −', redraw(() => resize(m, m.r - 1, m.c)), m.r <= 1),
        btn(T('scratch.matRowsShort') + ' +', T('scratch.matRows') + ' +', redraw(() => resize(m, m.r + 1, m.c)), m.r >= MAX.r),
        btn('−', T('scratch.matCols') + ' −', redraw(() => resize(m, m.r, m.c - 1)), m.c <= 1),
        btn(T('scratch.matColsShort') + ' +', T('scratch.matCols') + ' +', redraw(() => resize(m, m.r, m.c + 1)), m.c >= MAX.c),
        pressed(btn('|', T('scratch.matBar'), redraw(() => { m.bar = !m.bar && m.c > 1; }), m.c < 2), m.bar),
        btn('⧉', T('scratch.matCopy'), redraw(() => mats.splice(k + 1, 0, structuredClone(m))), mats.length >= MAX.mats),
        btn('×', T('scratch.matDel'), redraw(() => { mats.splice(k, 1); if (!mats.length) mats.push(fresh()); })),
      );
      const g = h('div', 'mp-grid');
      g.style.gridTemplateColumns = `repeat(${m.c}, 3.4em)`;
      for (let i = 0; i < m.r; i++) for (let j = 0; j < m.c; j++) g.append(cell(m, i, j, k));
      const body = h('div', 'matbox');
      body.append(h('div', 'brk'), g, h('div', 'brk r'));
      box.append(bar, body);
      return box;
    }), btn('+ ' + T('scratch.matAdd'), T('scratch.matAdd'), () => { mats.push(fresh()); save(); draw(); }, mats.length >= MAX.mats));
  }
  draw();
  return { redraw: draw };
}

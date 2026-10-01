import { t as T } from '../i18n/index.js';
import { ht as h } from './dom.js';
import { evalRows, asFraction } from '../logic/calc-list.js';

/* ---------------------------------------------------------------
   MÁY TÍNH DẠNG DANH SÁCH (kiểu Desmos rút gọn) trong Nháp — logic ở logic/calc-list.js.
   Mỗi dòng một ô: kết quả hiện ngay bên phải; `a = 3` và `f(x) = x^2` định nghĩa cho các dòng sau.
   Enter: dòng mới · Backspace ở dòng trống: xoá dòng · ↑ ↓: đổi dòng. Lưu theo môn trong localStorage.
   --------------------------------------------------------------- */

const MAX_ROWS = 30;
const fmtNum = v => (Number.isInteger(v) ? String(v) : String(Number(v.toPrecision(10)))).replace('-', '−');

export function mountCalcList(host, key) {
  let lines;
  try { lines = JSON.parse(localStorage.getItem(key)); } catch { /* chưa có / riêng tư */ }
  if (!Array.isArray(lines) || !lines.length) lines = [''];
  const save = () => { try { localStorage.setItem(key, JSON.stringify(lines)); } catch { /* đầy / riêng tư */ } };

  host.classList.add('cl');
  const list = h('div', 'cl-list');
  const tip = h('p', 'cl-tip');
  const clear = h('button', 'link', '');
  clear.type = 'button';
  host.replaceChildren(list, tip, clear);

  const outs = [];
  const show = () => {
    evalRows(lines).forEach((r, i) => {
      const o = outs[i];
      o.className = 'cl-out ' + r.kind;
      if (r.kind === 'error') o.textContent = T(r.error, { at: r.at, name: r.name, base: 10 });
      else if (r.kind === 'value' || r.kind === 'var') {
        const f = asFraction(r.value);
        o.textContent = (r.kind === 'var' ? '' : '= ') + fmtNum(r.value) + (f ? `  (${f})` : '');
      } else o.textContent = r.kind === 'fn' ? `${r.name}(${r.params.join(', ')})` : '';
    });
  };

  function draw(focus) {
    outs.length = 0;
    list.replaceChildren(...lines.map((text, i) => {
      const row = h('div', 'cl-row');
      const n = h('span', 'cl-n', String(i + 1));
      const inp = h('input', 'cl-in');
      inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false; inp.value = text;
      const out = h('div', 'cl-out');
      outs.push(out);
      inp.addEventListener('input', () => { lines[i] = inp.value; save(); show(); });
      inp.addEventListener('keydown', e => {
        const at = k => list.children[k]?.querySelector('input');
        if (e.key === 'Enter' && lines.length < MAX_ROWS) { e.preventDefault(); lines.splice(i + 1, 0, ''); save(); draw(i + 1); }
        else if (e.key === 'Backspace' && !inp.value && lines.length > 1) { e.preventDefault(); lines.splice(i, 1); save(); draw(Math.max(0, i - 1)); }
        else if (e.key === 'ArrowDown' && at(i + 1)) { e.preventDefault(); at(i + 1).focus(); }
        else if (e.key === 'ArrowUp' && at(i - 1)) { e.preventDefault(); at(i - 1).focus(); }
      });
      row.append(n, inp, out);
      return row;
    }));
    show();
    if (focus != null) list.children[focus]?.querySelector('input').focus();
  }
  clear.addEventListener('click', () => { lines = ['']; save(); draw(0); });

  const label = () => { tip.textContent = T('calc.listTip'); clear.textContent = T('shell.scratchClear'); };
  label();
  draw();
  return { label };
}

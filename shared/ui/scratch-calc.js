import { t as T } from '../i18n/index.js';
import { ht as h } from './dom.js';
import { evalRows, asFraction } from '../logic/calc-list.js';

/* ---------------------------------------------------------------
   MÁY TÍNH DẠNG DANH SÁCH (kiểu Desmos scientific, rút gọn) trong Nháp — logic ở logic/calc-list.js.
   Mỗi dòng một ô: kết quả hiện ngay bên phải; `a = 3` và `f(x) = x^2` định nghĩa cho các dòng sau.
   Có đạo hàm diff(f, x0), tích phân int(f, a, b), tổng sum(f, k, a, b), ln log exp abs, sin cos tan (độ / radian).
   Bàn phím ảo (nút ⌨): chèn √ π ∫ Σ … vào dòng đang gõ, khỏi nhớ cú pháp; mở bàn phím thì tắt bàn phím hệ thống.
   Enter: dòng mới · Backspace ở dòng trống: xoá dòng · ↑ ↓: đổi dòng. Lưu theo môn trong localStorage.
   --------------------------------------------------------------- */

const MAX_ROWS = 30;
const fmtNum = v => (Number.isInteger(v) ? String(v) : String(Number(v.toPrecision(10)))).replace('-', '−');

/** Phím ảo: [nhãn, chữ chèn | lệnh]. Lệnh: '<' '>' (con trỏ), '⌫', '↵' (dòng mới), 'C' (xoá dòng). */
const PAGES = {
  '123': [
    ['7', '7'], ['8', '8'], ['9', '9'], ['÷', '÷'], ['(', '('], [')', ')'],
    ['4', '4'], ['5', '5'], ['6', '6'], ['×', '×'], ['^', '^'], [',', ','],
    ['1', '1'], ['2', '2'], ['3', '3'], ['−', '-'], ['√', '√('], ['π', 'π'],
    ['0', '0'], ['.', '.'], ['=', ' = '], ['+', '+'], ['x', 'x'], ['⌫', '⌫'],
    ['←', '<'], ['→', '>'], ['C', 'C'], ['↵', '↵'],
  ],
  'f(x)': [
    ['sin', 'sin('], ['cos', 'cos('], ['tan', 'tan('], ['sin⁻¹', 'asin('], ['cos⁻¹', 'acos('], ['tan⁻¹', 'atan('],
    ['ln', 'ln('], ['log', 'log('], ['eˣ', 'exp('], ['|x|', 'abs('], ['∛', 'cbrt('], ['e', 'e'],
    ['∫', 'int('], ['d/dx', 'diff('], ['Σ', 'sum('], ['x', 'x'], ['y', 'y'], ['n', 'n'],
    ['f(x)', 'f(x) = '], ['(', '('], [')', ')'], [',', ','], ['⌫', '⌫'], ['↵', '↵'],
  ],
};

export function mountCalcList(host, key, { angleDefault = 'deg' } = {}) {
  let lines;
  try { lines = JSON.parse(localStorage.getItem(key)); } catch { /* chưa có / riêng tư */ }
  if (!Array.isArray(lines) || !lines.length) lines = [''];
  const save = () => { try { localStorage.setItem(key, JSON.stringify(lines)); } catch { /* đầy / riêng tư */ } };

  let angle = angleDefault;
  try { angle = localStorage.getItem(key + ':angle') || angleDefault; } catch { /* riêng tư */ }
  let kbdOpen = false, page = '123';

  host.classList.add('cl');
  const bar = h('div', 'cl-bar');
  const angleBtn = h('button', 'mp-btn', ''), kbdBtn = h('button', 'mp-btn', '⌨');
  [angleBtn, kbdBtn].forEach(b => { b.type = 'button'; });
  bar.append(h('span', 'cl-grow'), angleBtn, kbdBtn);
  const list = h('div', 'cl-list');
  const keys = h('div', 'cl-keys');
  keys.hidden = true;
  const tip = h('p', 'cl-tip');
  const clear = h('button', 'link', '');
  clear.type = 'button';
  host.replaceChildren(bar, list, keys, tip, clear);
  let active = null;                                   // dòng đang gõ gần nhất (phím ảo chèn vào đây)

  const outs = [];
  const show = () => {
    evalRows(lines, { angle }).forEach((r, i) => {
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
      inp.inputMode = kbdOpen ? 'none' : 'text';           // phím ảo mở ⇒ không bật bàn phím hệ thống
      inp.addEventListener('focus', () => { active = i; });
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

  /** Chèn / điều khiển ở dòng đang gõ. */
  function press(cmd) {
    const i = Math.min(active ?? lines.length - 1, lines.length - 1);
    const inp = list.children[i].querySelector('input');
    if (cmd === '↵') { if (lines.length < MAX_ROWS) { lines.splice(i + 1, 0, ''); save(); draw(i + 1); } return; }
    if (cmd === 'C') { lines[i] = ''; save(); draw(i); return; }
    const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? a;
    let v = inp.value, at = a;
    if (cmd === '<') at = Math.max(0, a - 1);
    else if (cmd === '>') at = Math.min(v.length, b + 1);
    else if (cmd === '⌫') { const from = a === b ? Math.max(0, a - 1) : a; v = v.slice(0, from) + v.slice(b); at = from; }
    else { v = v.slice(0, a) + cmd + v.slice(b); at = a + cmd.length; }
    inp.value = v;
    inp.focus();
    inp.setSelectionRange(at, at);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function drawKeys() {
    keys.hidden = !kbdOpen;
    kbdBtn.setAttribute('aria-pressed', String(kbdOpen));
    list.querySelectorAll('input').forEach(x => { x.inputMode = kbdOpen ? 'none' : 'text'; });
    if (!kbdOpen) return;
    const tabs = h('div', 'cl-keytabs');
    for (const name of Object.keys(PAGES)) {
      const b = h('button', 'mp-btn', name);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(name === page));
      b.addEventListener('click', () => { page = name; drawKeys(); });
      tabs.append(b);
    }
    const grid = h('div', 'cl-grid');
    for (const [lab, cmd] of PAGES[page]) {
      const b = h('button', 'cl-key' + (/^[0-9.]$/.test(lab) ? ' num' : ''), lab);
      b.type = 'button';
      b.addEventListener('mousedown', e => e.preventDefault());       // giữ con trỏ ở ô đang gõ
      b.addEventListener('click', () => press(cmd));
      grid.append(b);
    }
    keys.replaceChildren(tabs, grid);
  }
  kbdBtn.addEventListener('click', () => { kbdOpen = !kbdOpen; drawKeys(); });
  angleBtn.addEventListener('click', () => {
    angle = angle === 'deg' ? 'rad' : 'deg';
    try { localStorage.setItem(key + ':angle', angle); } catch { /* riêng tư */ }
    label(); show();
  });

  const label = () => {
    tip.textContent = T('calc.listTip');
    clear.textContent = T('shell.scratchClear');
    angleBtn.textContent = T(angle === 'deg' ? 'calc.deg' : 'calc.rad');
    angleBtn.title = T('calc.angleTip');
    kbdBtn.title = T('calc.kbd');
  };
  label();
  draw();
  drawKeys();
  return { label };
}

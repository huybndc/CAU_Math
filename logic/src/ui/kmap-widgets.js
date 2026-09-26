import { el, HUES } from './dom-helpers.js';
import { buildMap, paintValues, drawGroups } from './kmap-common.js';
import { cellMinterm } from '../logic/kmap-layout.js';
import { splitValues, primeImplicants, implicantToSOP, implicantToPOS } from '../logic/quine-mccluskey.js';
import { checkGroup } from '../logic/practice-check.js';
import { groupsToExpr } from '../logic/kmap-answer.js';
import { t as T } from '../i18n/index.js';

/* ---------------------------------------------------------------
   WIDGET K-MAP cho bộ chạy luyện tập (shared/ui/runner.js).
   - kmapGroup: KHOANH NHÓM trực tiếp trên bản đồ → biểu thức tự hiện;
     vẫn có ô gõ tay cho ai thích gõ.
   - kmapPick:  bấm chọn ô (tìm minterm, liệt kê ô của hàm…).
   Trạng thái (các nhóm đã khoanh) giữ theo `spec` — cùng một câu hỏi thì
   vẽ lại (sau khi chấm, đổi ngôn ngữ) vẫn còn nguyên.
   --------------------------------------------------------------- */

const STATE = new WeakMap();

/** Kéo chuột để quét hình chữ nhật; bấm từng ô để chọn nhóm quấn biên. */
function attachSelect(root, view, sel, onChange, onDragDone) {
  view.cells.forEach((cell, m) => {
    cell.classList.add('picky');
    cell.addEventListener('pointerdown', ev => {
      ev.preventDefault();
      const base = new Set(sel);
      let moved = false;
      const move = e => {
        const c = document.elementFromPoint(e.clientX, e.clientY)?.closest('.kcell');
        if (!c || !root.contains(c) || c === cell || c.dataset.s !== cell.dataset.s) return;
        moved = true;
        sel.clear();
        base.forEach(x => sel.add(x));
        const r0 = Math.min(+cell.dataset.r, +c.dataset.r), r1 = Math.max(+cell.dataset.r, +c.dataset.r);
        const c0 = Math.min(+cell.dataset.c, +c.dataset.c), c1 = Math.max(+cell.dataset.c, +c.dataset.c);
        for (let r = r0; r <= r1; r++) for (let k = c0; k <= c1; k++) sel.add(cellMinterm(view.L, +cell.dataset.s, r, k));
        onChange();
      };
      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        if (!moved) { if (sel.has(m)) sel.delete(m); else sel.add(m); onChange(); }
        else onDragDone();
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
  });
}

/** spec = { n, values, pos } — khoanh nhóm ô 1 (SOP) hoặc ô 0 (POS). */
export function kmapGroup(spec, ctx) {
  const { n, values, pos } = spec;
  const st = STATE.get(spec) || { groups: [], typed: '' };
  STATE.set(spec, st);
  // POS: khoanh các ô 0 ⇒ coi 0 là "ô cần phủ"
  const target = pos ? values.map(v => (v === 2 ? 2 : 1 - v)) : values;
  const { ones, dcs } = splitValues(target);
  const allPIs = primeImplicants(ones, dcs, n);
  const sel = new Set();

  const root = el('div', 'w-kmap' + (ctx.locked ? ' locked' : ''));
  const tip = el('p', 'w-tip', T(pos ? 'wid.groupTipPos' : 'wid.groupTip'));
  const mapHost = el('div', 'maps');
  const view = buildMap(mapHost, n);
  const side = el('div', 'w-kmap-side');
  const exprBox = el('div', 'w-expr');
  const chips = el('div', 'w-groups');
  const warn = el('div', 'w-warn');
  const actions = el('div', 'row tight');
  const commitBtn = el('button', 'btn', T('wid.commit'));
  commitBtn.type = 'button';
  const typed = el('input');
  typed.type = 'text';
  typed.className = 'w-typed';
  typed.placeholder = T('wid.orType');
  typed.value = st.typed;
  typed.disabled = !!ctx.locked;
  typed.addEventListener('input', () => { st.typed = typed.value; });
  typed.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ctx.onSubmit(); } });

  const termOf = imp => (pos ? implicantToPOS(imp, n) : implicantToSOP(imp, n)).replace(/'/g, '′');

  function commit() {
    warn.textContent = '';
    if (!sel.size) return;
    const r = checkGroup([...sel], target, n, allPIs);
    if (!r.ok) {
      warn.textContent = r.errors.map(e => T(pos && e.key === 'prac.errHasZero' ? 'wid.hasOne' : e.key, e.params)).join('; ');
      sel.clear();
      paint();
      return;
    }
    st.groups.push({ cells: [...sel].sort((a, b) => a - b), imp: r.imp });
    sel.clear();
    paint();
  }

  function paint() {
    paintValues(view, values);
    view.cells.forEach((cell, m) => cell.classList.toggle('sel', sel.has(m)));
    drawGroups(view, st.groups.map((g, i) => ({ id: 'w' + i, imp: g.imp, essential: false, hue: HUES[i % HUES.length] })), n);
    chips.replaceChildren(...st.groups.map((g, i) => {
      const c = el('span', 'term');
      c.style.setProperty('--gh', HUES[i % HUES.length]);
      c.append(el('span', 'math', termOf(g.imp)));
      if (!ctx.locked) {
        const x = el('button', 'w-x', '×');
        x.type = 'button';
        x.setAttribute('aria-label', T('wid.remove'));
        x.addEventListener('click', () => { st.groups.splice(i, 1); paint(); });
        c.append(x);
      }
      return c;
    }));
    const expr = groupsToExpr(st.groups.map(g => g.imp), n, pos);
    exprBox.replaceChildren(el('span', 'w-f', 'F ='), el('span', 'math', expr.replace(/'/g, '′') || '…'));
    commitBtn.hidden = !sel.size || !!ctx.locked;
  }

  if (!ctx.locked) {
    attachSelect(root, view, sel, paint, commit);
    commitBtn.addEventListener('click', commit);
    const clear = el('button', 'link', T('wid.clearGroups'));
    clear.type = 'button';
    clear.addEventListener('click', () => { st.groups = []; sel.clear(); paint(); });
    actions.append(commitBtn, clear);
  }
  side.append(exprBox, chips, warn, actions, typed);
  root.append(ctx.locked ? '' : tip, el('div', 'w-kmap-row'));
  root.lastChild.append(mapHost, side);
  paint();
  return {
    el: root,
    get: () => typed.value.trim() || (st.groups.length ? groupsToExpr(st.groups.map(g => g.imp), n, pos) : ''),
  };
}

/** spec = { n, values?, single? } — bấm chọn ô; trả "1, 5, 7". */
export function kmapPick(spec, ctx) {
  const st = STATE.get(spec) || { picked: new Set((String(ctx.given || '').match(/\d+/g) || []).map(Number)) };
  STATE.set(spec, st);
  const root = el('div', 'w-kmap pick' + (ctx.locked ? ' locked' : ''));
  const mapHost = el('div', 'maps');
  const view = buildMap(mapHost, spec.n);
  if (!spec.showIndex) mapHost.classList.add('noidx');
  const want = ctx.locked && ctx.answer != null ? new Set([].concat(ctx.answer)) : null;
  const paint = () => view.cells.forEach((cell, m) => {
    const v = cell.querySelector('.v');
    v.textContent = spec.values ? (spec.values[m] === 2 ? 'X' : String(spec.values[m])) : (st.picked.has(m) ? '●' : '');
    if (spec.values) cell.dataset.v = spec.values[m];
    cell.classList.toggle('sel', st.picked.has(m));
    if (want) {                                   // đúng · bỏ sót (viền xanh nét đứt) · chọn thừa (đỏ)
      cell.classList.toggle('good', want.has(m) && st.picked.has(m));
      cell.classList.toggle('want', want.has(m) && !st.picked.has(m));
      cell.classList.toggle('miss', !want.has(m) && st.picked.has(m));
    }
  });
  if (!ctx.locked) {
    view.cells.forEach((cell, m) => {
      cell.classList.add('picky');
      cell.addEventListener('click', () => {
        if (spec.single) { st.picked.clear(); st.picked.add(m); }
        else if (st.picked.has(m)) st.picked.delete(m); else st.picked.add(m);
        paint();
      });
    });
  }
  paint();
  root.append(ctx.locked ? '' : el('p', 'w-tip', T(spec.tipKey || 'wid.pickTip')), mapHost);
  return { el: root, get: () => (st.picked.size ? [...st.picked].sort((a, b) => a - b).join(', ') : '') };
}

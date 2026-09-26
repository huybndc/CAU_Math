import { $, ht } from '@shared/ui/dom.js';
import { fail } from '@shared/logic/app-error.js';
import { parseIntSet } from '@shared/logic/answer-format.js';
import { t as T, tError, onLangChange } from '../i18n/index.js';
import { addSub, signedOf, muxInputs } from '../logic/combinational.js';
import { varNames } from '../logic/quine-mccluskey.js';

/* ---------------------------------------------------------------
   CÔNG CỤ CHƯƠNG 4 (mục Công cụ, D25): markup ở pages/ch4.html, ở đây chỉ đọc ô nhập và vẽ.
   Mọi phép tính lấy từ combinational.js — cùng lõi với lời giải câu hỏi.
     · Bộ cộng–trừ: đi từng bit từ bit 0 lên, cuối cùng C, V, cách đọc không dấu / có dấu.
     · Hàm bằng MUX / decoder: Σm → các ngõ dữ liệu Iₖ và ngõ ra D cần nối.
   --------------------------------------------------------------- */

const sub = k => String(k).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');
const num = x => String(x).replace('-', '−');
const say = (host, html) => { const p = ht('p', 'small'); p.innerHTML = html; host.append(p); };

/** Chạy một lần vẽ; lỗi (AppError) hiện ở ô lỗi của công cụ thay vì làm vỡ trang. */
function guarded(errSel, clear, draw) {
  return () => {
    clear();
    $(errSel).textContent = '';
    try { draw(); } catch (e) { clear(); $(errSel).textContent = T('err.prefix') + tError(e); }
  };
}

function table(host, head, rows) {
  const thead = ht('thead'), tbody = ht('tbody'), tr = ht('tr');
  head.forEach(x => tr.append(ht('th', null, x)));
  thead.append(tr);
  rows.forEach(cells => { const r = ht('tr'); cells.forEach(x => r.append(ht('td', null, String(x)))); tbody.append(r); });
  host.replaceChildren(thead, tbody);
}

/* ---------------- Bộ cộng–trừ đi từng bit ---------------- */
let shown = 0;                   // số bit đã hiện (từ bit 0 lên)

function readBits(sel) {
  const s = $(sel).value.replace(/\s+/g, '');
  if (!/^[01]{1,8}$/.test(s)) fail('t4a.errBits');
  return s;
}

const drawAdder = guarded('#t4a-err', () => { $('#t4a-table').replaceChildren(); $('#t4a-out').replaceChildren(); }, () => {
  const sa = readBits('#t4a-a'), sb = readBits('#t4a-b');
  const n = Math.max(sa.length, sb.length);
  const a = parseInt(sa, 2), b = parseInt(sb, 2);
  const m = Number($('#t4a-m [aria-pressed="true"]').dataset.m);
  const r = addSub(a, b, m, n);
  shown = Math.min(shown, n);
  const bx = [...r.bx].reverse();
  table($('#t4a-table'), ['bit', 'Aᵢ', 'Bᵢ ⊕ M', 'Cᵢ', 'Sᵢ', 'Cᵢ₊₁'],
    Array.from({ length: shown }, (_, i) => [i, (a >> i) & 1, bx[i], r.carries[i], r.sum[n - 1 - i], r.carries[i + 1]]));
  const out = $('#t4a-out');
  say(out, T(m ? 't4a.modeSub' : 't4a.modeAdd', { bx: r.bx }));
  if (shown < n) { say(out, T('t4a.more', { i: shown })); return; }
  const op = m ? '−' : '+';
  say(out, T('t4a.result', { n: sub(n), c: r.cout, s: r.sum }));
  say(out, T('t4a.v', { n: sub(n), n1: sub(n - 1), cn: r.carries[n], cn1: r.carries[n - 1], v: r.v }));
  // không dấu: cộng thì C là bit thứ n + 1; trừ thì C = 1 ⇔ A ≥ B
  const ua = m ? a - b : a + b;
  say(out, T('t4a.unsigned', { a, op, b, exact: num(ua), verdict: T(m ? (r.cout ? 't4a.subOk' : 't4a.borrow') : (r.cout ? 't4a.carryOut' : 't4a.fits')) }));
  const exact = m ? signedOf(a, n) - signedOf(b, n) : signedOf(a, n) + signedOf(b, n);
  say(out, T('t4a.signed', {
    a: num(signedOf(a, n)), op, b: num(signedOf(b, n)), exact: num(exact), got: num(signedOf(parseInt(r.sum, 2), n)),
    lo: num(-(1 << (n - 1))), hi: (1 << (n - 1)) - 1, verdict: T(r.v ? 't4a.overflow' : 't4a.noOverflow'),
  }));
});

/* ---------------- Hàm bằng MUX / decoder ---------------- */
const drawMux = guarded('#t4m-err', () => { $('#t4m-table').replaceChildren(); $('#t4m-out').replaceChildren(); }, () => {
  const n = Number($('#t4m-n').value);
  const list = parseIntSet($('#t4m-f').value);
  if (!list || list.some(x => x < 0 || x >= 1 << n)) fail('t4m.errList', { max: (1 << n) - 1 });
  const names = varNames(n), last = names[n - 1];
  const tt = Array.from({ length: 1 << n }, (_, i) => (list.includes(i) ? 1 : 0));
  const ins = muxInputs(tt, last).map(s => s.replace("'", '′'));
  table($('#t4m-table'), [names.slice(0, -1).join(''), `F (${last} = 0)`, `F (${last} = 1)`, T('t4m.input')],
    ins.map((s, k) => [k.toString(2).padStart(n - 1, '0'), `m${2 * k}: ${tt[2 * k]}`, `m${2 * k + 1}: ${tt[2 * k + 1]}`, `I${sub(k)} = ${s}`]));
  const out = $('#t4m-out');
  say(out, T('t4m.mux', { size: ins.length, sel: names.slice(0, -1).join(', '), last }));
  const zeros = tt.flatMap((v, i) => (v ? [] : [i]));
  say(out, T('t4m.decoder', { n, size: 1 << n, ones: list.join(', ') || '—', zeros: zeros.join(', ') || '—' }));
});

export function setupCh4Tools() {
  const reset = () => { shown = 0; drawAdder(); };
  ['#t4a-a', '#t4a-b'].forEach(s => $(s).addEventListener('input', reset));
  $('#t4a-m').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    $('#t4a-m').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    reset();
  });
  $('#t4a-next').addEventListener('click', () => { shown++; drawAdder(); });
  $('#t4a-all').addEventListener('click', () => { shown = 8; drawAdder(); });
  ['#t4m-f', '#t4m-n'].forEach(s => $(s).addEventListener('input', drawMux));
  drawAdder();
  drawMux();
  onLangChange(() => { drawAdder(); drawMux(); });
}

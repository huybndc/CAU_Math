import { $, el } from './dom-helpers.js';
import { toDecimal, convertBase, fracToBaseSteps, positionalTerms } from '../logic/number-systems.js';
import { diminishedComplement, radixComplement, subtractByComplement, subtractValue, complementResultValue } from '../logic/complements.js';
import { FORMATS, range, encode, decode, addTwos, subTwos, compareFormats } from '../logic/signed-binary.js';
import { t as T, tError, onLangChange } from '../i18n/index.js';

/* Chương 1 — Tương tác: bộ chuyển đổi cơ số (4 cơ số + khai triển theo vị trí), complement
   (từng bước N → (r−1)'s → r's) & trừ bằng complement, số nhị phân có dấu (tô bit dấu) + tràn số. */

const BASE_KEY = { 2: 'c1.base2', 8: 'c1.base8', 10: 'c1.base10', 16: 'c1.base16' };
const FORMAT_KEY = { magnitude: 'c1.fmtMagnitude', ones: 'c1.fmtOnes', twos: 'c1.fmtTwos' };

const line = (host, label, value, cls) => {
  const d = el('div');
  d.innerHTML = '<span class="muted">' + label + '</span> <span class="' + (cls || 'hl') + '">' + value + '</span>';
  host.appendChild(d);
};

/* ---------------- 1. Bộ chuyển đổi cơ số ----------------
   Một số ⇒ cả 4 cơ số cùng lúc + khai triển theo vị trí Σ aₖ·rᵏ (chiều cơ số r → thập phân).
   Chiều ngược (chia lấy dư / nhân phần lẻ) đã có bảng từng bước ở tab Ví dụ nên không lặp lại ở đây. */
function renderConverter() {
  const raw = $('#i1-in').value.trim();
  const from = +$('#i1-from').value;
  const out = $('#i1-out'), pos = $('#i1-pos');
  out.innerHTML = ''; pos.innerHTML = '';
  if (!raw) { $('#i1-err').textContent = T('c1.convErr'); return; }

  let dec, terms;
  try {
    dec = toDecimal(raw, from);
    terms = positionalTerms(raw, from);
  } catch (e) {
    $('#i1-err').textContent = T('err.prefix') + tError(e);
    return;
  }
  $('#i1-err').textContent = '';

  const tb = el('tbody');
  [2, 8, 10, 16].forEach(r => {
    const tr = el('tr', r === from ? 'src' : null);
    tr.appendChild(el('th', null, T(BASE_KEY[r])));
    const exact = fracToBaseSteps(dec % 1, r).exact;
    tr.appendChild(el('td', null, (r === from ? raw.toUpperCase() : convertBase(raw, from, r)) + (exact ? '' : '…')));
    tb.appendChild(tr);
  });
  out.appendChild(tb);

  terms.forEach((t, i) => {
    if (i) pos.append(' + ');
    const term = el('span', 'term');
    term.innerHTML = '<b>' + t.value + '</b>×' + from + '<sup>' + t.power + '</sup>';
    pos.appendChild(term);
  });
  pos.append(' = ');
  pos.appendChild(el('b', 'hl', String(dec)));
}

/* ---------------- 2. Complement & trừ bằng complement ---------------- */
function renderComplement() {
  const M = $('#i2-m').value.trim(), N = $('#i2-n').value.trim();
  const r = +$('#i2-r').value;
  const steps = $('#i2-steps');
  steps.innerHTML = ''; $('#i2-comp').textContent = ''; $('#i2-check').textContent = '';
  if (!M || !N) { $('#i2-err').textContent = T('c1.needBoth'); return; }

  let dim, rad, sub;
  try {
    dim = diminishedComplement(N, r);
    rad = radixComplement(N, r);
    sub = subtractByComplement(M, N, r);
  } catch (e) {
    $('#i2-err').textContent = T('err.prefix') + tError(e);
    return;
  }
  $('#i2-err').textContent = '';

  // N → (r−1)'s (mỗi chữ số lấy r−1 trừ) → +1 → r's; tô chữ số bị phép +1 làm đổi
  const comp = $('#i2-comp');
  comp.innerHTML = '';
  const row = (label, digits, mark) => {
    const tr = el('tr');
    tr.appendChild(el('th', null, label));
    [...digits].forEach((d, k) => tr.appendChild(el('td', mark?.(k) ? 'bitchg' : null, d)));
    comp.appendChild(tr);
  };
  const n = N.toUpperCase();
  row('N', n);
  row(T('c1.complDim', { r1: r - 1 }), dim.digits);
  row('+1', '1'.padStart(n.length, '\u00a0'));
  row(T('c1.complRad', { r }), rad.digits, k => rad.digits[k] !== dim.digits[k]);

  sub.steps.filter(s => s.labelKey !== 'sub.compN')          // r's complement của N đã có ở bảng trên
    .forEach(s => line(steps, T(s.labelKey) + ':', s.value));

  const got = complementResultValue(sub, r);
  const want = subtractValue(M, N, r);
  const c = $('#i2-check');
  c.className = 'msg ' + (got === want ? 'ok' : 'bad');
  const dec = v => String(v).replace('-', '−');          // dùng nhất quán dấu trừ Unicode
  c.textContent = ''
    + T('c1.subResult', { sign: sub.negative ? '−' : '', digits: sub.digits, r, dec: dec(got) })
    + (got === want ? '.' : T('c1.subMismatch', { want: dec(want) }));
}

/* ---------------- 3. Số có dấu & phép cộng ---------------- */
function renderSigned() {
  const w = +$('#i3-w').value;
  const raw = $('#i3-v').value.trim();
  const t = $('#i3-table');
  t.innerHTML = '';
  const v = Number(raw);
  if (raw === '' || !Number.isInteger(v)) {
    $('#i3-err').textContent = T('c1.signedErr');
    return;
  }
  $('#i3-err').textContent = '';

  const hr = el('tr');
  [T('c1.colFormat'), T('c1.colBits', { w }), T('c1.colRange')].forEach(h => hr.appendChild(el('th', null, h)));
  t.appendChild(el('thead')).appendChild(hr);
  const tb = el('tbody');
  compareFormats(v, w).forEach(({ format, bits }) => {
    const { min, max } = range(format, w);
    const tr = el('tr');
    tr.appendChild(el('td', null, T(FORMAT_KEY[format])));
    const td = el('td', bits ? 'val-1' : 'bad', bits ? null : T('c1.cantRepresent'));
    if (bits) td.append(el('span', 'signbit', bits[0]), bits.slice(1));     // MSB = bit dấu
    tr.appendChild(td);
    tr.appendChild(el('td', 'muted', min + ' … ' + max));
    tb.appendChild(tr);
  });
  t.appendChild(tb);
}

let signedOp = 'add';

function renderSignedAdd() {
  const w = +$('#i3-w').value;
  const a = Number($('#i3-a').value.trim()), b = Number($('#i3-b').value.trim());
  const host = $('#i3-add');
  host.innerHTML = ''; $('#i3-ov').textContent = '';
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    $('#i3-aerr').textContent = T('c1.addErr');
    return;
  }
  let A, B, r;
  try {
    A = encode(a, 'twos', w);
    B = encode(b, 'twos', w);
    r = signedOp === 'add' ? addTwos(A, B) : subTwos(A, B);
  } catch (e) {
    $('#i3-aerr').textContent = T('err.prefix') + tError(e);
    return;
  }
  $('#i3-aerr').textContent = '';

  if (signedOp === 'sub') {
    line(host, T('c1.negB'), r.negB + '  (' + decode(r.negB, 'twos') + ')');
  }
  r.steps.forEach(s => line(host, T(s.labelKey) + ':', s.value));
  line(host, T('c1.endCarry'), String(r.carryOut) + (r.carryOut ? T('c1.dropped') : ''), 'muted');

  const exact = signedOp === 'add' ? a + b : a - b;
  const ov = $('#i3-ov');
  ov.className = 'msg ' + (r.overflow ? 'bad' : 'ok');
  ov.textContent = r.overflow
    ? T('c1.overflow', { exact, min: range('twos', w).min, max: range('twos', w).max, w })
    : T('c1.noOverflow', { got: r.value, exact });
}

export function setupCh1InteractivePage() {
  ['#i1-in', '#i1-from'].forEach(s => {
    $(s).addEventListener('input', renderConverter);
    $(s).addEventListener('change', renderConverter);
  });
  ['#i2-m', '#i2-n', '#i2-r'].forEach(s => {
    $(s).addEventListener('input', renderComplement);
    $(s).addEventListener('change', renderComplement);
  });
  ['#i3-v', '#i3-w'].forEach(s => {
    $(s).addEventListener('input', () => { renderSigned(); renderSignedAdd(); });
    $(s).addEventListener('change', () => { renderSigned(); renderSignedAdd(); });
  });
  ['#i3-a', '#i3-b'].forEach(s => $(s).addEventListener('input', renderSignedAdd));
  document.querySelectorAll('#i3-op button').forEach(b => b.addEventListener('click', () => {
    signedOp = b.dataset.op;
    document.querySelectorAll('#i3-op button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderSignedAdd();
  }));

  onLangChange(() => { renderConverter(); renderComplement(); renderSigned(); renderSignedAdd(); });
  renderConverter();
  renderComplement();
  renderSigned();
  renderSignedAdd();
}

export { FORMATS };

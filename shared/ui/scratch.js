import { onLangChange, t as T } from '../i18n/index.js';
import { evaluate, show } from '../logic/calc.js';

/* ---------------------------------------------------------------
   NHÁP: ngăn kéo bên phải để tính tay khi giải bài.
   - Máy tính: DEC là máy tính thường (thập phân, chia thật); chọn 2/8/16 để gõ số ở cơ số đó,
     (+ − × ÷ %, ngoặc) ⇒ kết quả hiện ngay ở cả 4 cơ số; bấm một kết quả để
     chép nó xuống ô ghi chú.
   - Ô ghi chú font đều (mono) để kẻ bảng chân trị / cộng cột bit thẳng hàng, kèm
     hàng ký hiệu bàn phím không gõ được (Σ Π ′ ⊕ …).
   Lưu theo từng môn trong localStorage — đóng, mở, F5 vẫn còn.
   ponytail: chỉ có chữ, chưa vẽ tay; thêm canvas khi dùng máy có bút.
   --------------------------------------------------------------- */

const BASES = [2, 8, 10, 16];
const SYMBOLS = ['Σm(', 'ΠM(', '′', '⊕', '·', '→', '≠'];

export function setupScratch() {
  const subject = document.documentElement.dataset.subject || 'home';
  const key = 'scratch:' + subject;
  const baseKey = 'calc-base:' + subject;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'scratch-btn';
  btn.setAttribute('aria-expanded', 'false');
  const pane = document.createElement('aside');
  pane.className = 'scratch';
  pane.hidden = true;
  pane.innerHTML = '<header><b></b><button type="button" class="link"></button>'
    + '<button type="button" class="scratch-x">×</button></header>'
    + '<section class="calc"><div class="calc-bases" role="group"></div>'
    + '<input type="text" class="calc-in" spellcheck="false" autocomplete="off">'
    + '<p class="calc-err" hidden></p><dl class="calc-out"></dl></section>'
    + '<div class="scratch-syms"></div><textarea spellcheck="false"></textarea>';
  const [title, clear, close, ta, bases, inp, errEl, out, syms] =
    ['b', '.link', '.scratch-x', 'textarea', '.calc-bases', '.calc-in', '.calc-err', '.calc-out', '.scratch-syms'].map(s => pane.querySelector(s));

  try { ta.value = localStorage.getItem(key) || ''; } catch { /* chế độ riêng tư */ }
  const save = () => { try { localStorage.setItem(key, ta.value); } catch { /* đầy/riêng tư */ } };
  ta.addEventListener('input', save);

  /** Chèn chữ vào ô ghi chú tại con trỏ. */
  const insert = text => {
    const { selectionStart: a, selectionEnd: b, value } = ta;
    ta.value = value.slice(0, a) + text + value.slice(b);
    ta.selectionStart = ta.selectionEnd = a + text.length;
    ta.focus();
    save();
  };
  SYMBOLS.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s;
    b.addEventListener('click', () => insert(s));
    syms.append(b);
  });

  /* ---------- máy tính ---------- */
  let base = 10;
  try { base = Number(localStorage.getItem(baseKey)) || 10; } catch { /* riêng tư */ }
  const drawBases = () => {
    bases.replaceChildren(...BASES.map(r => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = T('calc.base' + r);
      b.setAttribute('aria-pressed', String(r === base));
      b.addEventListener('click', () => {
        // đổi cơ số gõ vào: đổi luôn số đang có sang cơ số mới để khỏi gõ lại
        const cur = evaluate(inp.value, base);
        base = r;
        try { localStorage.setItem(baseKey, String(r)); } catch { /* riêng tư */ }
        if (Number.isInteger(cur.value)) inp.value = (cur.value < 0 ? '-' : '') + Math.abs(cur.value).toString(r).toUpperCase();
        drawBases();
        calc();
        inp.focus();
      });
      return b;
    }));
    inp.placeholder = T('calc.ph' + base);
  };
  const calc = () => {
    const r = evaluate(inp.value, base);
    errEl.hidden = !r.error;
    if (r.error) errEl.textContent = T(r.error, { at: r.at, base });
    out.replaceChildren(...BASES.flatMap(b => {
      const dt = document.createElement('dt');
      dt.textContent = T('calc.base' + b);
      const dd = document.createElement('dd');
      dd.textContent = r.value == null ? '—' : show(r.value, b);
      if (r.value != null) {
        dd.title = T('calc.copy');
        dd.addEventListener('click', () => insert(`${dd.textContent}`));
      }
      if (b === base) dt.classList.add('on');
      return [dt, dd];
    }));
  };
  inp.addEventListener('input', calc);

  const open = on => {
    pane.hidden = !on;
    btn.setAttribute('aria-expanded', String(on));
    if (on) inp.focus(); else btn.focus();
  };
  btn.addEventListener('click', () => open(pane.hidden));
  close.addEventListener('click', () => open(false));
  clear.addEventListener('click', () => { ta.value = ''; save(); ta.focus(); });
  pane.addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });

  const label = () => {
    btn.textContent = title.textContent = T('shell.scratch');
    clear.textContent = T('shell.scratchClear');
    close.setAttribute('aria-label', T('shell.close'));
    ta.placeholder = T('shell.scratchPh');
    syms.title = T('calc.syms');
    drawBases();
    calc();
  };
  label();
  onLangChange(label);
  document.body.append(btn, pane);
}

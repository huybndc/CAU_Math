/* ---------------------------------------------------------------
   TOOLTIP TỨC THÌ thay cho thuộc tính `title` của trình duyệt (trễ ~1 s, có máy tới 3–4 s, cảm ứng thì không hiện).
   Mọi phần tử có `title` / `data-tip` đều được: rê chuột ⇒ hiện sau 150 ms; focus bằng bàn phím ⇒ hiện ngay;
   cảm ứng ⇒ nhấn giữ ~0.45 s. `title` được chuyển sang `data-tip` lúc đầu tiên chạm tới (nút chỉ có icon thì
   thêm aria-label để người đọc màn hình vẫn có tên). Gọi setupTips() một lần.
   --------------------------------------------------------------- */

const SHOW_MS = 150, TOUCH_MS = 450, TOUCH_HIDE_MS = 2500;

export function setupTips() {
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.append(tip);
  let timer = 0, current = null;

  const targetOf = e => e.target?.closest?.('[title],[data-tip]') ?? null;
  const textOf = n => {
    const t = n.getAttribute('title');
    if (t) {
      n.dataset.tip = t;
      if (!n.getAttribute('aria-label') && !n.textContent.trim()) n.setAttribute('aria-label', t);
    }
    n.removeAttribute('title');
    return n.dataset.tip || '';
  };
  const hide = () => { clearTimeout(timer); timer = 0; current = null; tip.hidden = true; };
  const show = n => {
    const text = textOf(n);
    if (!text || !n.isConnected) return;
    current = n;
    tip.textContent = text;
    tip.hidden = false;
    const r = n.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    const below = r.bottom + 8 + h <= innerHeight - 8;
    tip.style.left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 8)) + 'px';
    tip.style.top = Math.max(8, below ? r.bottom + 8 : r.top - h - 8) + 'px';
  };
  const schedule = (n, ms, autoHide = 0) => {
    clearTimeout(timer);
    textOf(n);                                   // chuyển title ngay để trình duyệt không hiện bản gốc
    if (!n.dataset.tip) return;
    timer = setTimeout(() => { show(n); if (autoHide) timer = setTimeout(hide, autoHide); }, ms);
  };

  document.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    const n = targetOf(e);
    if (n && n !== current) schedule(n, SHOW_MS); else if (!n) hide();
  }, true);
  document.addEventListener('pointerout', e => { if (e.pointerType !== 'touch' && targetOf(e)) hide(); }, true);
  document.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch') { hide(); return; }
    const n = targetOf(e);
    if (n) schedule(n, TOUCH_MS, TOUCH_HIDE_MS);
  }, true);
  for (const type of ['pointerup', 'pointercancel']) document.addEventListener(type, e => { if (e.pointerType === 'touch' && !current) clearTimeout(timer); }, true);
  document.addEventListener('focusin', e => { const n = targetOf(e); if (n?.matches(':focus-visible')) schedule(n, 0); }, true);
  document.addEventListener('focusout', hide, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); }, true);
  addEventListener('scroll', hide, { passive: true, capture: true });
}

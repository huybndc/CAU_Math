/* ---------------------------------------------------------------
   KHUNG NHÁP KÉO THẢ + ĐỔI KÍCH THƯỚC (iPad / chuột): kéo tiêu đề để dời, kéo mép / góc để đổi cỡ,
   bấm đúp tiêu đề để về vị trí mặc định. Toạ độ lưu `scratch-geom` (chung mọi môn, theo trình duyệt).
   Khung NỔI trên trang (không đẩy nội dung bên dưới), như cửa sổ nổi trên điện thoại.
   Dùng pointer events: chuột, bút, ngón tay đều chạy.
   --------------------------------------------------------------- */

const KEY = 'scratch-geom';
const MIN = { w: 300, h: 260 };
const DIRS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

export function mountFrame(pane, handle) {
  let g = null;
  try { g = JSON.parse(localStorage.getItem(KEY)); } catch { /* chưa có / riêng tư */ }
  if (!(g && [g.x, g.y, g.w, g.h].every(Number.isFinite))) g = null;
  const save = () => { try { if (g) localStorage.setItem(KEY, JSON.stringify(g)); else localStorage.removeItem(KEY); } catch { /* riêng tư */ } };

  const clamp = () => {
    g.w = Math.min(Math.max(g.w, MIN.w), innerWidth);
    g.h = Math.min(Math.max(g.h, MIN.h), innerHeight);
    g.x = Math.min(Math.max(g.x, 0), innerWidth - g.w);
    g.y = Math.min(Math.max(g.y, 0), innerHeight - g.h);
  };
  function apply() {
    const s = pane.style;
    if (!g) {
      ['left', 'top', 'right', 'bottom', 'width', 'height'].forEach(k => s.removeProperty(k));
      return;
    }
    clamp();
    Object.assign(s, { left: g.x + 'px', top: g.y + 'px', right: 'auto', bottom: 'auto', width: g.w + 'px', height: g.h + 'px' });
  }
  const own = () => { if (!g) { const r = pane.getBoundingClientRect(); g = { x: r.left, y: r.top, w: r.width, h: r.height }; } };

  /** Bắt đầu kéo: onMove(dx, dy, bắt đầu) cập nhật g. */
  function track(ev, onMove) {
    if (ev.button > 0) return;
    ev.preventDefault();
    own();
    const start = { ...g }, x0 = ev.clientX, y0 = ev.clientY;
    const move = e => { onMove(start, e.clientX - x0, e.clientY - y0); apply(); };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); save(); };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
  }

  handle.style.cursor = 'move';
  handle.style.touchAction = 'none';
  handle.addEventListener('pointerdown', e => {
    if (e.target.closest('button, a, input')) return;                 // nút trong tiêu đề vẫn bấm được
    track(e, (s, dx, dy) => { g.x = s.x + dx; g.y = s.y + dy; });
  });
  handle.addEventListener('dblclick', e => { if (e.target.closest('button, a, input')) return; g = null; apply(); save(); });

  for (const d of DIRS) {
    const h = document.createElement('div');
    h.className = 'scratch-rs ' + d;
    h.addEventListener('pointerdown', e => track(e, (s, dx, dy) => {
      let { x, y, w, hh } = { x: s.x, y: s.y, w: s.w, hh: s.h };
      if (d.includes('e')) w = s.w + dx;
      if (d.includes('s')) hh = s.h + dy;
      if (d.includes('w')) { w = s.w - dx; x = s.x + dx; }
      if (d.includes('n')) { hh = s.h - dy; y = s.y + dy; }
      if (w < MIN.w) { if (d.includes('w')) x -= MIN.w - w; w = MIN.w; }   // đã chạm cỡ tối thiểu: không để mép đối diện trôi
      if (hh < MIN.h) { if (d.includes('n')) y -= MIN.h - hh; hh = MIN.h; }
      Object.assign(g, { x, y, w, h: hh });
    }));
    pane.append(h);
  }
  addEventListener('resize', () => { if (g) apply(); });
  apply();
  return { apply };
}

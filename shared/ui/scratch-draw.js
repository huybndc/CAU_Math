import { t as T } from '../i18n/index.js';
import { ht as h } from './dom.js';

/* ---------------------------------------------------------------
   NHÁP — NGĂN VẼ (iPad + Apple Pencil, chuột, ngón tay): bút, tẩy nét, 4 màu, 2 cỡ nét, giấy kẻ ô, hoàn tác / làm lại.
   Bút áp lực: nét dày theo lực nhấn. Đã dùng bút một lần thì BỎ QUA ngón tay (chống chạm nhầm bằng lòng bàn tay).
   Nét lưu theo môn (`scratch-draw:<môn>`): mỗi nét { c: màu, w: cỡ, p: [x, y, x, y …] làm tròn 0.1px }.
   ponytail: toạ độ px cố định (không co giãn khi đổi cỡ khung), không có chọn / dời nét; thêm khi cần.
   --------------------------------------------------------------- */

const COLORS = ['#1f2933', '#d9480f', '#1971c2', '#2f9e44'];
const SIZES = [2, 5];
const MAX_POINTS = 60000;                       // chặn localStorage phình (~ vài trăm nét dài)

export function mountDraw(host, key) {
  let strokes = [], redo = [];
  try { strokes = JSON.parse(localStorage.getItem(key)) || []; } catch { /* chưa có / riêng tư */ }
  const save = () => { try { localStorage.setItem(key, JSON.stringify(strokes)); } catch { /* đầy / riêng tư */ } };
  let color = 0, size = 0, tool = 'pen', grid = true, penSeen = false;

  host.classList.add('dr');
  const bar = h('div', 'dr-bar');
  const wrap = h('div', 'dr-wrap');
  const cv = h('canvas', 'dr-cv');
  wrap.append(cv);
  host.replaceChildren(bar, wrap);
  const ctx = cv.getContext('2d');

  const dark = () => matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.dataset.theme === 'dark';
  const ink = c => (dark() && c === 0 ? '#e6e8eb' : c);                   // mực đen đổi thành trắng trên nền tối
  function paint(live) {
    const dpr = devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (grid) {
      ctx.strokeStyle = dark() ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < W; x += 24) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
      for (let y = 0; y < H; y += 24) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
      ctx.stroke();
    }
    ctx.lineCap = ctx.lineJoin = 'round';
    for (const s of live ? [...strokes, live] : strokes) {
      const p = s.p;
      ctx.strokeStyle = ink(COLORS[s.c]);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = s.w;
      if (p.length < 4) { ctx.beginPath(); ctx.arc(p[0] / 10, p[1] / 10, s.w / 2, 0, 7); ctx.fill(); continue; }
      ctx.beginPath();
      ctx.moveTo(p[0] / 10, p[1] / 10);
      for (let i = 2; i < p.length - 2; i += 2) ctx.quadraticCurveTo(p[i] / 10, p[i + 1] / 10, (p[i] + p[i + 2]) / 20, (p[i + 1] + p[i + 3]) / 20);
      ctx.lineTo(p.at(-2) / 10, p.at(-1) / 10);
      ctx.stroke();
    }
  }
  new ResizeObserver(() => paint()).observe(wrap);

  /* ---------- vẽ ---------- */
  let cur = null, id = null;
  const at = e => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) * 10), Math.round((e.clientY - r.top) * 10)]; };
  const near = (s, x, y, r) => { for (let i = 0; i < s.p.length; i += 2) if (Math.hypot(s.p[i] - x, s.p[i + 1] - y) < r * 10) return true; return false; };
  function erase(e) {
    const [x, y] = at(e);
    const n = strokes.length;
    strokes = strokes.filter(s => !near(s, x, y, 10));
    if (strokes.length !== n) { redo = []; paint(); save(); drawBar(); }
  }
  cv.style.touchAction = 'none';
  cv.addEventListener('pointerdown', e => {
    if (e.pointerType === 'pen') penSeen = true;
    if (e.pointerType === 'touch' && penSeen) return;                    // lòng bàn tay khi đang dùng bút
    if (e.button > 0 || id !== null) return;
    id = e.pointerId;
    cv.setPointerCapture(id);
    if (tool === 'eraser') { erase(e); return; }
    const w = SIZES[size] * (e.pointerType === 'pen' ? 0.6 + e.pressure : 1);
    cur = { c: color, w, p: at(e) };
    paint(cur);
  });
  cv.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    if (tool === 'eraser') { erase(e); return; }
    if (!cur) return;
    for (const ev of e.getCoalescedEvents?.() ?? [e]) cur.p.push(...at(ev));
    paint(cur);
  });
  const end = e => {
    if (e.pointerId !== id) return;
    id = null;
    if (cur) {
      const total = strokes.reduce((t, s) => t + s.p.length, 0) / 2;
      if (total + cur.p.length / 2 <= MAX_POINTS) { strokes.push(cur); redo = []; save(); } else alert(T('draw.full'));
      cur = null; paint(); drawBar();
    }
  };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);

  /* ---------- thanh công cụ ---------- */
  const btn = (text, title, act, { on, disabled, cls = '' } = {}) => {
    const b = h('button', 'mp-btn ' + cls, text);
    b.type = 'button'; b.title = b.ariaLabel = title; b.disabled = !!disabled;
    if (on !== undefined) b.setAttribute('aria-pressed', String(on));
    b.addEventListener('click', act);
    return b;
  };
  function drawBar() {
    const dots = COLORS.map((c, i) => {
      const b = btn('', T('draw.color', { n: i + 1 }), () => { color = i; tool = 'pen'; drawBar(); }, { on: tool === 'pen' && color === i, cls: 'dr-dot' });
      b.style.setProperty('--c', i === 0 && dark() ? '#e6e8eb' : c);
      return b;
    });
    bar.replaceChildren(
      btn('✎', T('draw.pen'), () => { tool = 'pen'; drawBar(); }, { on: tool === 'pen' }), ...dots,
      btn(size ? '━' : '─', T('draw.size'), () => { size = 1 - size; drawBar(); }),
      btn('⌫', T('draw.eraser'), () => { tool = 'eraser'; drawBar(); }, { on: tool === 'eraser' }),
      btn('▦', T('draw.grid'), () => { grid = !grid; paint(); drawBar(); }, { on: grid }),
      h('span', 'cl-grow'),
      btn('↶', T('draw.undo'), () => { const s = strokes.pop(); if (s) { redo.push(s); save(); paint(); drawBar(); } }, { disabled: !strokes.length }),
      btn('↷', T('draw.redo'), () => { const s = redo.pop(); if (s) { strokes.push(s); save(); paint(); drawBar(); } }, { disabled: !redo.length }),
      btn('✕', T('draw.clear'), () => { if (strokes.length && confirm(T('draw.clearAsk'))) { strokes = []; redo = []; save(); paint(); drawBar(); } }, { disabled: !strokes.length }),
    );
  }
  drawBar();
  return { redraw: () => { drawBar(); paint(); } };
}

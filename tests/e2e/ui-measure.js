/* Chạy trong trang (page.evaluate). Trả {fail, warn, info}. Ngưỡng ở THR: nguồn = huy-ui-design (Apple HIG desktop); xem lại khi đổi chuẩn. */
export const THR = { minFontPx: 12, targetFail: 20, targetWarn: 28, overlapPx2: 16, contrastText: 4.5, contrastLarge: 3 };
export function measure(THR) {
  const out = { fail: [], warn: [], info: {} };
  const rect = e => e.getBoundingClientRect();
  const hit = e => {
    const r = rect(e);
    if (r.width <= 0 || r.height <= 0) return false;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return false;
    const s = getComputedStyle(e);
    if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false;
    const t = document.elementFromPoint(cx, cy);
    return !!t && (e.contains(t) || t.contains(e));
  };
  const name = e => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 28);
  // canvas chuẩn hoá mọi định dạng màu CSS (color-mix, oklab…) về RGBA
  const cx2 = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const parse = c => { cx2.clearRect(0, 0, 1, 1); cx2.fillStyle = '#000'; cx2.fillStyle = c; cx2.fillRect(0, 0, 1, 1); const d = cx2.getImageData(0, 0, 1, 1).data; return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 }; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = e => {
    const layers = [];
    for (let n = e; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage !== 'none') return null;
      const c = parse(s.backgroundColor);
      if (c.a > 0) layers.push(c);
      if (c.a >= 1) break;
    }
    let base = { r: 255, g: 255, b: 255 };
    for (const c of layers.reverse()) base = { r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a) };
    return base;
  };
  const textEls = [...document.body.querySelectorAll('*')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && hit(e));
  const ctrls = [...document.body.querySelectorAll('a[href],button,summary,input,select,[role=button],[tabindex]')].filter(hit);
  let minF = 99;
  const seen = new Set();
  for (const e of textEls) {
    const s = getComputedStyle(e), f = parseFloat(s.fontSize);
    minF = Math.min(minF, f);
    if (f < THR.minFontPx) out.fail.push(`chữ ${f}px < ${THR.minFontPx}: "${name(e)}"`);
    const bg = bgOf(e);
    if (bg) {
      const fg = parse(s.color);
      const mixed = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) };
      const L1 = lum(mixed), L2 = lum(bg);
      const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const large = f >= 24 || (f >= 18.66 && +s.fontWeight >= 700);
      const need = large ? THR.contrastLarge : THR.contrastText;
      const key = s.color + bg.r + bg.g + bg.b + f;
      if (cr < need && !seen.has(key)) { seen.add(key); out.fail.push(`tương phản ${cr.toFixed(1)}:1 < ${need}: "${name(e)}"`); }
    }
    if (e.scrollWidth > e.clientWidth + 1 && /hidden|clip/.test(s.overflowX) && s.textOverflow !== 'ellipsis' && !ctrls.includes(e)) out.warn.push(`chữ bị cắt: "${name(e)}"`);
  }
  out.info.minFontPx = minF;
  for (const e of ctrls) {
    if (getComputedStyle(e).display === 'inline') continue;
    const r = rect(e), m = Math.min(r.width, r.height);
    if (m < THR.targetFail) out.fail.push(`vùng bấm ${Math.round(r.width)}×${Math.round(r.height)} < ${THR.targetFail}: "${name(e)}"`);
    else if (m < THR.targetWarn) out.warn.push(`vùng bấm ${Math.round(r.width)}×${Math.round(r.height)} < ${THR.targetWarn}: "${name(e)}"`);
  }
  const boxes = [...new Set([...ctrls, ...textEls])];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.contains(b) || b.contains(a)) continue;
    const A = rect(a), B = rect(b);
    const w = Math.min(A.right, B.right) - Math.max(A.left, B.left), h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (w > 2 && h > 2 && w * h > THR.overlapPx2) out.fail.push(`đè nhau: "${name(a)}" × "${name(b)}"`);
  }
  if (document.documentElement.scrollHeight > innerHeight + 1) out.fail.push('trang cuộn dọc ở khung hiện tại');
  out.info.controls = ctrls.length;
  return out;
}

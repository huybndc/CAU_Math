/* Hình minh hoạ nhỏ cho máy giải vector (chỉ 2 chiều, chỉ để xem): v, w, cung góc, và hình chiếu của v lên w (nét đứt). */
const NS = 'http://www.w3.org/2000/svg';
const S = (tag, attrs = {}, kids = []) => {
  const e = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  e.append(...kids);
  return e;
};

export function vectorFigure(v, w = null) {
  const R = 100, C = 110;                                   // nửa cạnh hình, tâm
  const top = Math.max(1, ...v.map(Math.abs), ...(w ?? []).map(Math.abs));
  const k = R * 0.85 / top;
  const P = ([x, y]) => [C + x * k, C - y * k];
  const seg = (a, b, attrs) => { const [x1, y1] = P(a), [x2, y2] = P(b); return S('line', { x1, y1, x2, y2, ...attrs }); };
  const arrow = (u, cls, name) => {
    const [x, y] = P(u);
    return S('g', { class: cls }, [seg([0, 0], u, { 'stroke-width': 2.5 }), S('circle', { cx: x, cy: y, r: 3.5 }), S('text', { x: x + 6, y: y - 6 }, [name])]);
  };
  const kids = [seg([-top, 0], [top, 0], { class: 'vf-axis' }), seg([0, -top], [0, top], { class: 'vf-axis' })];
  const ww = w && (w[0] || w[1]) ? w : null;
  if (ww) {
    const t = (v[0] * ww[0] + v[1] * ww[1]) / (ww[0] ** 2 + ww[1] ** 2), p = [t * ww[0], t * ww[1]];
    kids.push(seg(v, p, { class: 'vf-proj', 'stroke-dasharray': '4 3' }), seg([0, 0], p, { class: 'vf-proj', 'stroke-width': 5, opacity: 0.35 }));
    const a = Math.atan2(v[1], v[0]), b = Math.atan2(ww[1], ww[0]);
    const d = ((b - a + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    if (v[0] || v[1]) {
      const pt = ang => [C + 24 * Math.cos(ang), C - 24 * Math.sin(ang)];
      const [x1, y1] = pt(a), [x2, y2] = pt(a + d);
      kids.push(S('path', { class: 'vf-arc', d: `M ${x1} ${y1} A 24 24 0 0 ${d > 0 ? 0 : 1} ${x2} ${y2}` }));
    }
    kids.push(arrow(ww, 'vf-w', 'w'));
  }
  kids.push(arrow(v, 'vf-v', 'v'));
  return S('svg', { viewBox: `0 0 ${2 * C} ${2 * C}`, class: 'vfig', role: 'img', 'aria-label': 'v, w' }, kids);
}

import { gateSymbol } from './gate-svg.js';
import { varNames } from '../logic/quine-mccluskey.js';

/* ---------------------------------------------------------------
   SƠ ĐỒ MẠCH TỰ VẼ từ một net (logic/circuit.js). Cổng xếp thành cột từ trái sang phải (cổng gốc ở cột cuối),
   mỗi dây chỉ nối hai cột kề nhau; biến vào bằng nhãn ở đầu ngõ vào (có bộ đảo ngay trước ngõ vào nếu là biến bù).
   Nét theo màu chữ nên tự đúng ở sáng / tối. Chỉ để xem — hàm được chấm theo bảng chân trị, không theo hình vẽ.
   --------------------------------------------------------------- */

const SVG = 'http://www.w3.org/2000/svg';
const GW = 46, PITCH = 150, SLOT = 60, LEFT = 14;
const PINS = { 1: [20], 2: [12, 28], 3: [6, 20, 34] };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** net → cây hiển thị: biến (có thể kèm bộ đảo), hằng, hoặc cổng. */
function toTree(net) {
  const go = ref => {
    if (ref.c != null) return { kind: 'const', v: ref.c };
    if (ref.v != null) return { kind: 'var', k: ref.v, inv: false };
    const g = net.gates[ref.g];
    if (g.op === 'NOT' && g.ins[0].v != null) return { kind: 'var', k: g.ins[0].v, inv: true };
    return { kind: 'gate', op: g.op, kids: g.ins.map(go) };
  };
  return go(net.out);
}
const depth = t => (t.kind === 'gate' ? 1 + Math.max(...t.kids.map(depth)) : 0);

/** Gán cột, bề cao khe và toạ độ y (tâm) cho mỗi cổng. */
function place(t, col, top) {
  if (t.kind !== 'gate') return { h: 0 };
  t.col = col;
  const gk = t.kids.filter(k => k.kind === 'gate');
  let y = top;
  for (const k of gk) y += place(k, col - 1, y).h;
  t.h = Math.max(SLOT, y - top);
  t.cy = gk.length ? (gk[0].cy + gk.at(-1).cy) / 2 : top + t.h / 2;
  return t;
}

export function netSvg(net, names = varNames(net.n)) {
  const root = toTree(net);
  const D = depth(root), s = document.createElementNS(SVG, 'svg');
  let g = '', ox, oy, h, width = LEFT + (D + 1) * PITCH + 60;
  const lab = (x, y, t) => `<text x="${x}" y="${y}" text-anchor="end" dominant-baseline="middle" class="lit">${esc(t)}</text>`;
  const stub = (leaf, px, py) => {                                  // nhãn (và bộ đảo) nối vào ngõ vào tại (px, py)
    const text = leaf.kind === 'const' ? String(leaf.v) : names[leaf.k];
    if (leaf.inv) {
      const x0 = px - 58;
      g += lab(x0 - 4, py, text) + `<path d="M${x0} ${py} H${x0 + 4} M${x0 + 4} ${py - 5} L${x0 + 22} ${py} L${x0 + 4} ${py + 5} Z M${x0 + 29} ${py} H${px}"/><circle cx="${x0 + 25.5}" cy="${py}" r="3"/>`;
    } else g += lab(px - 30, py, text) + `<path d="M${px - 26} ${py} H${px}"/>`;
  };
  const draw = t => {
    const x = LEFT + 66 + t.col * PITCH, cy = t.cy, y = cy - 20;
    const sym = gateSymbol(t.op, x, y);
    g += sym.d; t.x = x; t.out = sym.out;
    const ys = PINS[Math.min(3, t.kids.length)];
    t.kids.forEach((k, i) => {
      const py = y + ys[i], pinX = t.op === 'AND' || t.op === 'NAND' ? x : x + 2;
      if (k.kind === 'gate') {
        draw(k);
        const mid = (k.out + x) / 2 + 4 * (i - (t.kids.length - 1) / 2);
        g += `<path d="M${k.out} ${k.cy} H${mid} V${py} H${pinX}"/>`;
      } else stub(k, pinX, py);
    });
  };
  if (root.kind === 'gate') {
    place(root, D, 14);
    draw(root);
    oy = root.cy; ox = root.out; h = root.h + 28;
  } else {                                                          // đầu ra là một biến / hằng
    stub(root, LEFT + 66 + 20, 40); ox = LEFT + 66 + 20; oy = 40; h = 80;
  }
  g += `<path d="M${ox} ${oy} H${ox + 36}"/><text x="${ox + 44}" y="${oy}" dominant-baseline="middle" class="lit out">F</text>`;
  const vw = Math.max(width, ox + 70);
  s.setAttribute('viewBox', `0 0 ${vw} ${Math.max(h, 70)}`);
  s.style.width = `${Math.round(vw * 0.8)}px`;
  s.setAttribute('class', 'fig-circuit fig-net');
  s.setAttribute('role', 'img');
  s.innerHTML = `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">${g}</g>`;
  return s;
}

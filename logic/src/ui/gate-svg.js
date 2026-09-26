/* ---------------------------------------------------------------
   KÝ HIỆU CỔNG & SƠ ĐỒ MẠCH HAI MỨC (SVG) — hình kèm đề luyện tập.
   Nét theo màu chữ (currentColor) nên tự đúng ở cả sáng lẫn tối.
   --------------------------------------------------------------- */

const SVG = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Thân cổng vẽ trong ô 40×40 bắt đầu ở (x, y): trả về { d, out } — đường và điểm ra. */
function body(kind, x, y) {
  const or = `M${x} ${y} Q${x + 12} ${y + 20} ${x} ${y + 40} Q${x + 28} ${y + 40} ${x + 42} ${y + 20} Q${x + 28} ${y} ${x} ${y} Z`;
  switch (kind) {
    case 'AND': return { d: `M${x} ${y} H${x + 22} A20 20 0 0 1 ${x + 22} ${y + 40} H${x} Z`, out: x + 42 };
    case 'OR': return { d: or, out: x + 42 };
    case 'XOR': return { d: `${or} M${x - 7} ${y} Q${x + 5} ${y + 20} ${x - 7} ${y + 40}`, out: x + 42 };
    case 'BUF': return { d: `M${x} ${y + 2} L${x + 36} ${y + 20} L${x} ${y + 38} Z`, out: x + 36 };
    default: return null;
  }
}

const BASE = { AND: 'AND', NAND: 'AND', OR: 'OR', NOR: 'OR', XOR: 'XOR', XNOR: 'XOR', NOT: 'BUF', Buffer: 'BUF' };
const BUBBLE = new Set(['NAND', 'NOR', 'XNOR', 'NOT']);

function svg(w, h, inner, cls) {
  const s = document.createElementNS(SVG, 'svg');
  s.setAttribute('viewBox', `0 0 ${w} ${h}`);
  s.setAttribute('class', cls);
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = inner;
  return s;
}

/** Một ký hiệu cổng: { gate: 'NAND' }. */
export function gateFigure({ gate, n = 2 }) {
  const b = body(BASE[gate], 22, 6);
  const one = BASE[gate] === 'BUF';
  const bub = BUBBLE.has(gate);
  const end = b.out + (bub ? 9 : 0);
  const ys = one ? [26] : n === 3 ? [14, 26, 38] : [16, 36];          // ngõ vào: 1, 2 hoặc 3 đường
  const ins = `<path d="${ys.map(y => `M2 ${y} H${one ? 22 : 24}`).join(' ')}"/>`;
  return svg(96, 52, `<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round">
    ${ins}<path d="${b.d}"/>${bub ? `<circle cx="${b.out + 4.5}" cy="26" r="4"/>` : ''}<path d="M${end} 26 H94"/></g>`, 'fig-gate');
}

/**
 * Mạch AND–OR hai mức từ một SOP: { terms: [['x', "y'"], ['z']] }.
 * Mỗi term một cổng AND (term 1 literal thì nối thẳng), gom vào một cổng OR ra F.
 */
export function circuitFigure({ terms }) {
  const GAP = 58, top = 14;
  const h = top * 2 + terms.length * GAP;
  const orY = h / 2 - 20;
  let g = '';
  const lab = (x, y, t) => `<text x="${x}" y="${y}" text-anchor="end" dominant-baseline="middle" class="lit">${esc(t.replace(/'/g, '′'))}</text>`;
  terms.forEach((lits, i) => {
    const y = top + i * GAP + (GAP - 40) / 2;
    const cy = y + 20;
    const inY = k => y + 8 + (lits.length === 1 ? 12 : (24 * k) / (lits.length - 1));
    if (lits.length === 1) {
      g += lab(70, cy, lits[0]) + `<path d="M76 ${cy} H176"/>`;
    } else {
      g += `<path d="${body('AND', 112, y).d}"/>`;
      lits.forEach((l, k) => { g += lab(70, inY(k), l) + `<path d="M76 ${inY(k)} H112"/>`; });
      g += `<path d="M154 ${cy} H176"/>`;
    }
    // dây từ đầu ra term tới ngõ vào cổng OR
    const ty = orY + 6 + (terms.length === 1 ? 14 : (28 * i) / (terms.length - 1));
    g += `<path d="M176 ${cy} H196 V${ty} H214"/>`;
  });
  g += `<path d="${body('OR', 212, orY).d}"/><path d="M254 ${orY + 20} H290"/>`;
  g += `<text x="298" y="${orY + 20}" dominant-baseline="middle" class="lit out">F</text>`;
  return svg(320, h, `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">${g}</g>`, 'fig-circuit');
}

/**
 * Mạch hai tầng cổng bất kỳ (§4.3): { gates: [G1, G2, G3] }, G1, G2 nhận literal, ra T₁, T₂;
 * G3 nhận T₁, T₂ (và có thể thêm một literal) ra F. Cổng: AND · OR · NAND · NOR · XOR.
 */
export function netFigure({ gates }) {
  const lab = (x, y, t, cls = 'lit') => `<text x="${x}" y="${y}" text-anchor="end" dominant-baseline="middle" class="${cls}">${esc(t.replace(/'/g, '′'))}</text>`;
  const gate = (op, x, y) => {
    const b = body(BASE[op], x, y);
    const bub = BUBBLE.has(op);
    return { d: `<path d="${b.d}"/>${bub ? `<circle cx="${b.out + 4.5}" cy="${y + 20}" r="4"/>` : ''}`, out: b.out + (bub ? 9 : 0) };
  };
  let g = '';
  const outs = [10, 96].map((y, i) => {                        // tầng 1: hai cổng, mỗi cổng hai literal
    const { d, out } = gate(gates[i].op, 104, y);
    gates[i].ins.forEach((l, k) => { g += lab(66, y + 10 + 20 * k, l) + `<path d="M72 ${y + 10 + 20 * k} H106"/>`; });
    g += d + `<text x="${out + 6}" y="${y + 12}" class="lit tag">T${'₁₂'[i]}</text>`;
    return { x: out, y: y + 20 };
  });
  const last = gates[2], three = last.ins.length === 3;
  const y3 = 53, ins3 = three ? [y3 + 7, y3 + 20, y3 + 33] : [y3 + 10, y3 + 30];
  g += `<path d="M${outs[0].x} ${outs[0].y} H166 V${ins3[0]} H232"/>`;
  g += `<path d="M${outs[1].x} ${outs[1].y} H176 V${ins3.at(-1)} H232"/>`;
  if (three) g += lab(206, ins3[1], last.ins[2]) + `<path d="M211 ${ins3[1]} H232"/>`;
  const { d, out } = gate(last.op, 230, y3);
  g += d + `<path d="M${out} ${y3 + 20} H312"/><text x="318" y="${y3 + 20}" dominant-baseline="middle" class="lit out">F</text>`;
  return svg(340, 146, `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">${g}</g>`, 'fig-circuit');
}

/* Hình khối mạch lớn cho "Đề thi thử" (dữ liệu thuần, UI vẽ bằng blockFigure): { w, h, boxes:[{x,y,w,h,t}], gates:[{op,x,y}], paths:[d], texts:[{x,y,t,a}] }. */
const sub = i => '₀₁₂₃₄₅₆₇₈'[i];
const T = (x, y, t, a = 'start') => ({ x, y, t, a });

/** Bộ cộng 4 bit nối từ 4 FA (carry lan truyền): A₃B₃…A₀B₀, C₀ vào, C₄ ra. */
export function adder4() {
  const boxes = [], paths = [], texts = [];
  for (let i = 3; i >= 0; i--) {
    const x = 40 + (3 - i) * 100;
    boxes.push({ x, y: 40, w: 64, h: 54, t: 'FA' });
    paths.push(`M${x + 16} 20 V40`, `M${x + 48} 20 V40`, `M${x + 32} 94 V118`);
    texts.push(T(x + 16, 12, `A${sub(i)}`, 'middle'), T(x + 48, 12, `B${sub(i)}`, 'middle'), T(x + 32, 132, `S${sub(i)}`, 'middle'));
    if (i > 0) { paths.push(`M${x + 100} 67 H${x + 64}`); texts.push(T(x + 82, 60, `C${sub(i)}`, 'middle')); }
  }
  paths.push('M40 67 H26', 'M434 67 H404');
  texts.push(T(22, 71, 'C₄', 'end'), T(440, 71, 'C₀'));
  return { w: 470, h: 142, boxes, gates: [], paths, texts };
}

/** Bộ cộng BCD (§4.6): cộng nhị phân, C = K + Z₈Z₄ + Z₈Z₂, bộ cộng thứ hai cộng thêm 0 C C 0 (+6 khi C = 1). */
export function bcdAdder() {
  const zx = [80, 110, 140, 170], zn = ['Z₈', 'Z₄', 'Z₂', 'Z₁'], sn = ['S₈', 'S₄', 'S₂', 'S₁'];
  const paths = ['M22 56 H60', 'M22 80 H60', 'M135 14 V44', 'M210 69 H316 V116 H330', 'M292 128 H330', 'M292 180 H310 V140 H330', 'M372 128 H394', 'M30 266 H60', 'M210 265 H240'];
  const texts = [T(8, 60, 'A'), T(8, 84, 'B'), T(135, 10, 'C_in', 'middle'), T(216, 63, 'K'), T(398, 132, 'C'), T(6, 250, '0 C C 0'), T(246, 269, '(carry out ignored)')];
  zx.forEach((x, k) => {
    paths.push(`M${x} 94 V240`, `M${x} 290 V316`);
    texts.push(T(x + 4, 112, zn[k]), T(x, 330, sn[k], 'middle'));
  });
  texts.push(T(224, 118, 'Z₈', 'end'), T(224, 142, 'Z₄', 'end'), T(224, 170, 'Z₈', 'end'), T(224, 194, 'Z₂', 'end'));
  paths.push('M226 118 H250', 'M226 142 H250', 'M226 170 H250', 'M226 194 H250');
  return {
    w: 430, h: 340,
    boxes: [{ x: 60, y: 44, w: 150, h: 50, t: '4-bit adder #1' }, { x: 60, y: 240, w: 150, h: 50, t: '4-bit adder #2' }],
    gates: [{ op: 'AND', x: 250, y: 108 }, { op: 'AND', x: 250, y: 160 }, { op: 'OR', x: 330, y: 108 }],
    paths, texts,
  };
}

/** MUX 4×1 thực hiện một hàm 3 biến: data = ngõ vào I₀…I₃ (0, 1, z, z'), chọn S₁ = x, S₀ = y. */
export function muxBox(data) {
  const ys = [40, 70, 100, 130];
  const paths = ys.map(y => `M20 ${y} H60`).concat('M80 170 V196', 'M110 170 V196', 'M130 95 H190');
  const texts = ys.map((y, k) => T(16, y + 4, data[k], 'end')).concat(T(80, 210, 'x', 'middle'), T(110, 210, 'y', 'middle'), T(196, 99, 'F'));
  return { w: 220, h: 220, boxes: [{ x: 60, y: 20, w: 70, h: 150, t: '4×1 MUX' }], gates: [], paths, texts };
}

/** Mạch cổng nối theo nhãn: gates = [{ op, ins:[nhãn], out, col, row }]; nhãn vào cách nhau GAP rồi dây chụm vào thân cổng. */
function labeledGates(gates, { colW = 210, rowH = 62, ox = 0, oy = 0 } = {}) {
  const OUT = { AND: 42, OR: 42, XOR: 42, XNOR: 51 }, GAP = 22;
  const paths = [], texts = [], gs = [];
  let w = 0, h = 0;
  for (const g of gates) {
    const x = ox + 100 + g.col * colW, y = Math.round(oy + 14 + g.row * rowH), out = x + OUT[g.op], n = g.ins.length;
    const pin = g.op === 'XOR' || g.op === 'XNOR' ? x - 4 : x + 2;
    gs.push({ op: g.op, x, y });
    g.ins.forEach((t, k) => {
      const yy = Math.round(y + 20 + (k - (n - 1) / 2) * GAP), yg = Math.round(y + (40 * (k + 1)) / (n + 1));
      paths.push(`M${x - 56} ${yy} H${x - 20} L${pin} ${yg}`);
      texts.push(T(x - 60, yy, t, 'end'));
      h = Math.max(h, yy + 16);
    });
    paths.push(`M${out} ${y + 20} H${out + 18}`);
    texts.push(T(out + 22, y + 20, g.out));
    w = Math.max(w, out + 90); h = Math.max(h, y + 54);
  }
  return { w, h, boxes: [], gates: gs, paths, texts };
}

/** Bộ so sánh 2 bit (§4.8): xᵢ = (Aᵢ ⊙ Bᵢ), E = x₁x₀, G = A₁B₁′ + x₁A₀B₀′, L = A₁′B₁ + x₁A₀′B₀. */
export function comparator2() {
  return labeledGates([
    { op: 'XNOR', ins: ['A₁', 'B₁'], out: 'x₁', col: 0, row: 0 },
    { op: 'XNOR', ins: ['A₀', 'B₀'], out: 'x₀', col: 0, row: 1 },
    { op: 'AND', ins: ['x₁', 'x₀'], out: 'E (A=B)', col: 1, row: 0 },
    { op: 'AND', ins: ["A₁", "B₁'"], out: 'g₁', col: 1, row: 1 },
    { op: 'AND', ins: ['x₁', 'A₀', "B₀'"], out: 'g₀', col: 1, row: 2 },
    { op: 'AND', ins: ["A₁'", 'B₁'], out: 'l₁', col: 1, row: 3 },
    { op: 'AND', ins: ['x₁', "A₀'", 'B₀'], out: 'l₀', col: 1, row: 4 },
    { op: 'OR', ins: ['g₁', 'g₀'], out: 'G (A>B)', col: 2, row: 1.5 },
    { op: 'OR', ins: ['l₁', 'l₀'], out: 'L (A<B)', col: 2, row: 3.5 },
  ], { rowH: 74 });
}

/** Decoder 3×8 + một cổng OR cho mỗi hàm (§4.9): fns = [[tên, [minterm…]], …]. */
export function decoderOr(fns) {
  const ys = Array.from({ length: 8 }, (_, k) => 26 + k * 26);
  const paths = ['M20 70 H60', 'M20 110 H60', 'M20 150 H60', ...ys.map(y => `M150 ${y} H172`)];
  const texts = [T(16, 70, 'x', 'end'), T(16, 110, 'y', 'end'), T(16, 150, 'z', 'end'), ...ys.map((y, k) => T(176, y, `D${sub(k)}`))];
  const g = labeledGates(fns.map(([name, mins], i) => ({ op: 'OR', ins: mins.map(m => `D${sub(m)}`), out: name, col: 0, row: i })), { ox: 220, oy: 30, rowH: 130 });
  return { w: g.w, h: Math.max(g.h, 240), boxes: [{ x: 60, y: 14, w: 90, h: 212, t: '3×8 DEC' }], gates: g.gates, paths: [...paths, ...g.paths], texts: [...texts, ...g.texts] };
}

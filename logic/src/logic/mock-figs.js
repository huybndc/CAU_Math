/* Hình khối mạch lớn cho "Đề như thật" (dữ liệu thuần, UI vẽ bằng blockFigure): { w, h, boxes:[{x,y,w,h,t}], gates:[{op,x,y}], paths:[d], texts:[{x,y,t,a}] }. */
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

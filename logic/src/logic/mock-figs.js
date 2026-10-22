/* Hình khối cho "Đề như thật" (dữ liệu thuần, UI vẽ bằng blockFigure): { w, h, boxes, gates:[{op,x,y}], paths:[d], texts:[{x,y,t,a}], dots:[[x,y]] }. */
const T = (x, y, t, a = 'start') => ({ x, y, t, a });

/** Mạch cộng đầy đủ dạng XOR: S = (x ⊕ y) ⊕ z, C = z(x ⊕ y) + xy — một mạch hai đầu ra dùng chung cổng XOR đầu. */
export function fullAdderCircuit() {
  const L = (x, y, t) => [T(x - 4, y, t, 'end'), `M${x} ${y} H${x + (x > 100 ? 28 : 24)}`];
  const lits = [L(76, 28, 'x'), L(76, 52, 'y'), L(172, 32, 'z'), L(172, 122, 'z'), L(172, 158, 'x'), L(172, 182, 'y')];
  return {
    w: 400, h: 210, boxes: [],
    gates: [{ op: 'XOR', x: 100, y: 20 }, { op: 'XOR', x: 200, y: 24 }, { op: 'AND', x: 200, y: 90 }, { op: 'AND', x: 200, y: 150 }, { op: 'OR', x: 300, y: 120 }],
    paths: [...lits.map(l => l[1]), 'M142 40 H186', 'M186 40 V98 M186 56 H200 M186 98 H200', 'M242 44 H290', 'M242 110 H270 V130 H300', 'M242 170 H270 V150 H300', 'M342 140 H380'],
    texts: [...lits.map(l => l[0]), T(294, 44, 'S'), T(386, 140, 'C')],
    dots: [[186, 40], [186, 56]],
  };
}

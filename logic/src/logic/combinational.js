/* ---------------------------------------------------------------
   MẠCH TỔ HỢP (Mano §4.3–4.11) — thuần, không biết ngôn ngữ.
   Số nhiều bit trả về dạng chuỗi '0'/'1', bit cao bên trái như sách.
   --------------------------------------------------------------- */

const bitsOf = (v, n) => (v >>> 0).toString(2).padStart(n, '0').slice(-n);
const bit = (v, i) => (v >> i) & 1;

/** Bộ cộng nối tiếp n bit (§4.5): S_i = A_i ⊕ B_i ⊕ C_i, C_{i+1} = A_iB_i + C_i(A_i ⊕ B_i). carries = [C0 … Cn]. */
export function rippleAdd(a, b, c0 = 0, n = 4) {
  const carries = [c0];
  let sum = '';
  for (let i = 0; i < n; i++) {
    const ai = bit(a, i), bi = bit(b, i), ci = carries[i];
    sum = String(ai ^ bi ^ ci) + sum;
    carries.push((ai & bi) | (ci & (ai ^ bi)));
  }
  return { sum, carries, cout: carries[n] };
}

/** Bộ cộng–trừ (§4.5): M = 0 ⇒ A + B; M = 1 ⇒ A + B′ + 1 = A − B (bù 2). V = C_n ⊕ C_{n−1}. */
export function addSub(a, b, m, n = 4) {
  const bx = m ? ~b & ((1 << n) - 1) : b;
  const r = rippleAdd(a, bx, m, n);
  return { ...r, bx: bitsOf(bx, n), v: r.carries[n] ^ r.carries[n - 1] };
}

/** Giá trị có dấu (bù 2) của n bit. */
export const signedOf = (v, n = 4) => (bit(v, n - 1) ? v - (1 << n) : v);

/** Cộng BCD một chữ số (§4.6): tổng nhị phân K Z8Z4Z2Z1; tổng > 9 ⇒ cộng 0110, ra C = 1. */
export function bcdAdd(a, b, cin = 0) {
  const z = a + b + cin;                       // 0 … 19
  const fix = z > 9;                           // Mano: C = K + Z8Z4 + Z8Z2
  return { z, binary: bitsOf(z, 5), fix, cout: fix ? 1 : 0, s: bitsOf(fix ? z + 6 : z, 4) };
}

/** So sánh độ lớn n bit (§4.8): x_i = A_iB_i + A_i′B_i′ (1 khi bit i bằng nhau); at = bit cao nhất khác nhau (−1 nếu A = B). */
export function compare(a, b, n = 4) {
  let x = '', at = -1;
  for (let i = n - 1; i >= 0; i--) {
    const same = bit(a, i) === bit(b, i);
    x += same ? '1' : '0';
    if (!same && at < 0) at = i;
  }
  return { x, at, gt: a > b, lt: a < b };
}

/** Bộ mã hoá ưu tiên 4 ngõ vào (§4.10, D3 ưu tiên cao nhất): d[i] = D_i. Không ngõ nào bằng 1 ⇒ V = 0, x y tuỳ ý. */
export function priorityEncode(d) {
  const hi = [3, 2, 1, 0].find(i => d[i]);
  return hi === undefined ? { v: 0, hi: -1 } : { v: 1, hi, x: hi >> 1, y: hi & 1 };
}

/**
 * Thực hiện F(n biến) bằng MUX 2^(n−1) → 1 (§4.11): n − 1 biến đầu vào ngõ chọn, biến cuối vào ngõ dữ liệu.
 * Ngõ I_k xét hai dòng m = 2k (biến cuối = 0) và 2k + 1 (= 1): cùng 0 → '0', cùng 1 → '1', 0 rồi 1 → 'z', 1 rồi 0 → "z'".
 */
export function muxInputs(tt, last = 'z') {
  return Array.from({ length: tt.length / 2 }, (_, k) => {
    const f0 = tt[2 * k], f1 = tt[2 * k + 1];
    return f0 === f1 ? String(f0) : f1 ? last : `${last}'`;
  });
}

/** Ngược lại: các ngõ dữ liệu → cột F. inputs[k] ∈ '0' | '1' | 'z' | "z'" (z = biến cuối). */
export function muxOutput(inputs) {
  return inputs.flatMap(s => [0, 1].map(z => (s === '0' ? 0 : s === '1' ? 1 : s.endsWith("'") ? 1 - z : z)));
}

/* ---- Mạch nhiều mức: phân tích bằng cách đặt tên đầu ra từng cổng (§4.3) ---- */

export const GATE_OPS = ['AND', 'OR', 'NAND', 'NOR', 'XOR'];
const APPLY = {
  AND: v => v.every(Boolean), OR: v => v.some(Boolean), XOR: v => v.reduce((a, b) => a ^ b, 0) === 1,
  NAND: v => !v.every(Boolean), NOR: v => !v.some(Boolean),
};

/**
 * Cột chân trị của từng cổng. gates = [{ op, ins }], ins là literal ('x', "y'") hoặc đầu ra cổng trước ('T1', 'T2').
 * Dòng m: biến thứ k (tên names[k]) = bit thứ n − 1 − k của m.
 */
export function evalNet(gates, names) {
  const n = names.length;
  const cols = [];
  for (const g of gates) {
    cols.push(Array.from({ length: 1 << n }, (_, m) => {
      const val = s => {
        if (/^T\d$/.test(s)) return cols[Number(s[1]) - 1][m];
        const v = bit(m, n - 1 - names.indexOf(s[0]));
        return s.endsWith("'") ? 1 - v : v;
      };
      return APPLY[g.op](g.ins.map(val)) ? 1 : 0;
    }));
  }
  return cols;
}

/** Biểu thức một cổng như sách: AND viết liền (có T thì chấm ·), NAND/NOR bù cả khối. */
export function gateExpr({ op, ins }) {
  const lits = ins.map(s => s.replace("'", '′').replace(/^T(\d)$/, (_, d) => 'T' + '₀₁₂₃'[d]));
  const and = lits.join(ins.some(s => s[0] === 'T') ? '·' : '');
  const or = lits.join(' + ');
  switch (op) {
    case 'AND': return and;
    case 'OR': return or;
    case 'XOR': return lits.join(' ⊕ ');
    case 'NAND': return `(${and})′`;
    default: return `(${or})′`;
  }
}

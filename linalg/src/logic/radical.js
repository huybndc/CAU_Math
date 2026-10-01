import { fmt, near } from './num-format.js';
import { toFraction } from './num-format.js';

/* ---------------------------------------------------------------
   CĂN DẠNG CHÍNH XÁC cho lời giải: √12 = 2√3, √9 = 3. Số không nguyên thì viết thập phân (kèm ≈ nếu không đúng hẳn).
   --------------------------------------------------------------- */

/** √n với n nguyên ≥ 0 → { k, r } sao cho √n = k·√r, r không chứa ước chính phương. */
export function radical(n) {
  let k = 1, r = n;
  for (let d = 2; d * d <= r; d++) {
    while (r % (d * d) === 0) { r /= d * d; k *= d; }
  }
  return { k, r };
}

/** Chuỗi của √x: "3", "2√3", "√5", "1.5" hoặc "≈ 1.414". */
export function sqrtText(x) {
  if (near(x, 0)) return '0';
  if (Number.isInteger(x)) {
    const { k, r } = radical(x);
    if (r === 1) return String(k);
    return (k === 1 ? '' : String(k)) + '√' + r;
  }
  const s = Math.sqrt(x);
  return (toFraction(s, 999) ? '' : '≈ ') + fmt(s);
}

/** Góc đặc biệt (độ) → "π/3" ... ; không đặc biệt → null. */
export function specialAngle(deg) {
  const T = { 0: '0', 30: 'π/6', 45: 'π/4', 60: 'π/3', 90: 'π/2', 120: '2π/3', 135: '3π/4', 150: '5π/6', 180: 'π' };
  const k = Math.round(deg);
  return near(deg, k, 1e-7) && T[k] ? T[k] : null;
}

/* ---------------------------------------------------------------
   ĐỒ NGHỀ CHO CÁC BỘ KIỂM ĐỘC LẬP (D41) của Logic — chỉ test dùng, không import gì từ src/logic.
   Bộ đọc biểu thức Mano (AND viết liền, +, ⊕, dấu ′ hoặc ') viết riêng, khác hẳn expr-parser.js.
   --------------------------------------------------------------- */

export function mano(text) {
  const s = text.replace(/\s+/g, '').replace(/′/g, "'");
  let i = 0;
  // ⊕ (cổng XOR trên hình) ưu tiên thấp nhất, rồi +, rồi AND viết liền
  const xor = () => { const xs = [sum()]; while (s[i] === '⊕') { i++; xs.push(sum()); } return env => xs.reduce((a, x) => a !== x(env), false); };
  const sum = () => { const ps = [prod()]; while (s[i] === '+') { i++; ps.push(prod()); } return env => ps.some(p => p(env)); };
  const prod = () => {
    const fs = [];
    while (i < s.length && s[i] !== '+' && s[i] !== '⊕' && s[i] !== ')') { if (s[i] === '·') i++; fs.push(factor()); }
    if (!fs.length) throw new Error('term rỗng trong ' + text);
    return env => fs.every(f => f(env));
  };
  const factor = () => {
    let f;
    const c = s[i++];
    if (c === '(') { f = xor(); if (s[i++] !== ')') throw new Error('thiếu ) trong ' + text); }
    else if (c === '0' || c === '1') { const v = c === '1'; f = () => v; }
    else if (/[a-z]/.test(c)) f = env => { if (!(c in env)) throw new Error(`biến ${c}`); return env[c]; };
    else throw new Error(`không đọc được "${c}" trong ${text}`);
    while (s[i] === "'") { i++; const g = f; f = env => !g(env); }
    return f;
  };
  const f = xor();
  if (i !== s.length) throw new Error('thừa ký hiệu trong ' + text);
  return f;
}

export const NAMES = { 2: ['x', 'y'], 3: ['x', 'y', 'z'], 4: ['w', 'x', 'y', 'z'] };
export const envOf = (names, m) => Object.fromEntries(names.map((v, k) => [v, ((m >> (names.length - 1 - k)) & 1) === 1]));
export const column = (f, names) => Array.from({ length: 1 << names.length }, (_, m) => (f(envOf(names, m)) ? 1 : 0));
export const GATES = {
  AND: v => v.every(Boolean), OR: v => v.some(Boolean), NAND: v => !v.every(Boolean), NOR: v => !v.some(Boolean),
  XOR: v => v.filter(Boolean).length % 2 === 1, XNOR: v => v.filter(Boolean).length % 2 === 0,
};

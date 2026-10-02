import { fail } from '@shared/logic/app-error.js';
import { readFunction } from './kmap-walk.js';
import { varNames } from './quine-mccluskey.js';
import { autoVars } from './report-expr.js';

/* ---------------------------------------------------------------
   MÁY GIẢI MẠCH TỔ HỢP (Chương 4) — thuần, chỉ khoá từ điển.
   rippleReport: cộng / trừ hai số nhị phân n bit từng cột (bộ cộng nối tiếp) — bảng aᵢ, bᵢ, cᵢ → sᵢ, cᵢ₊₁, cờ tràn.
   implReport:   thực hiện một hàm bằng bộ giải mã + cổng OR (hoặc NOR) và bằng MUX 2ⁿ⁻¹→1.
   --------------------------------------------------------------- */

const bits = (t, name) => {
  const s = String(t).replace(/\s|_/g, '');
  if (!/^[01]{1,8}$/.test(s)) fail('cc.badBits', { name });
  return s;
};

export function rippleReport(aText, bText, op = 'add') {
  let a = bits(aText, 'A'), b = bits(bText, 'B');
  const n = Math.max(a.length, b.length);
  a = a.padStart(n, '0'); b = b.padStart(n, '0');
  const sub = op === 'sub';
  const bx = sub ? [...b].map(x => x ^ 1).join('') : b;
  let c = sub ? 1 : 0;
  const cols = [], carries = [c];
  for (let i = n - 1; i >= 0; i--) {
    const x = +a[i], y = +bx[i], s = x ^ y ^ c, co = (x & y) | (x & c) | (y & c);
    cols.push({ i: n - 1 - i, x, y, c, s, co }); c = co; carries.push(co);
  }
  const sum = cols.map(k => k.s).reverse().join('');
  const cin = carries[n - 1], cout = carries[n], V = cin ^ cout;
  const signed = s => parseInt(s, 2) - (s[0] === '1' ? 2 ** s.length : 0);
  const exact = signed(a) + (sub ? -signed(b) : signed(b));
  return {
    answer: [
      { key: 'cc.sum', m: `${sum}   (${op === 'sub' ? 'A − B' : 'A + B'})` },
      { key: 'cc.carry', m: `C${n} = ${cout}` }, { key: 'cc.signed', m: `${signed(sum)}  ${V ? '' : '✓'}` }, { key: V ? 'cc.overflow' : 'cc.noOverflow', m: `V = C${n} ⊕ C${n - 1} = ${cout} ⊕ ${cin} = ${V}` },
    ],
    steps: [
      { group: 'cc.tabCols', head: { key: 'cc.stCols' }, why: { key: 'cc.whyCols' },
        lines: [...(sub ? [{ key: 'cc.subNote', m: `B' = ${bx}, C0 = 1` }] : []), ...cols.map(k => `bit ${k.i}:  a=${k.x}  b=${k.y}  c=${k.c}  →  s=${k.s}  c=${k.co}`)] },
      { group: 'cc.tabCheck', head: { key: 'cc.stCheck' }, why: { key: 'cc.whyV' },
        lines: [`${signed(a)} ${sub ? '−' : '+'} ${signed(b)} = ${exact}`, { key: 'cc.range', m: `[${-(2 ** (n - 1))}, ${2 ** (n - 1) - 1}]` }] },
    ],
    check: () => (V ? exact !== signed(sum) : exact === signed(sum)),
  };
}

export function implReport(text, n = autoVars(text)) {
  const f = readFunction(text, n);
  const N = f.n, names = varNames(N);
  if (N < 2 || N > 4) fail('cc.badVars');
  const vals = f.values.map(v => (v === 1 ? 1 : 0));
  const ones = vals.flatMap((v, m) => (v ? [m] : [])), zeros = vals.flatMap((v, m) => (v ? [] : [m]));
  const sel = names.slice(0, -1), last = names.at(-1), M = 2 ** (N - 1);
  const data = Array.from({ length: M }, (_, k) => {
    const lo = vals[2 * k], hi = vals[2 * k + 1];
    return lo === hi ? String(lo) : hi ? last : `${last}'`;
  });
  const lbl = k => k.toString(2).padStart(N - 1, '0');
  return {
    answer: [
      { key: 'cc.dec', m: `${N}→${2 ** N}:  F = ${ones.length ? ones.map(m => `m${m}`).join(' + ') : '0'}   (OR ${ones.length})` },
      { key: 'cc.decN', m: zeros.length < ones.length ? `F = (${zeros.map(m => `m${m}`).join(' + ') || '0'})'   (NOR ${zeros.length})` : '' },
      { key: 'cc.mux', m: `${M}→1  S = ${sel.join('')}:  ${data.map((d, k) => `I${k}(${lbl(k)}) = ${d}`).join(',  ')}` },
    ].filter(l => l.m),
    steps: [
      { group: 'cc.tabDec', head: { key: 'cc.stDec' }, why: { key: 'cc.whyDec' }, lines: [`Σm(${ones.join(', ')})`, `${N}→${2 ** N} decoder`] },
      { group: 'cc.tabMux', head: { key: 'cc.stMux', params: { sel: sel.join(''), last } }, why: { key: 'cc.whyMux' },
        lines: data.map((d, k) => `${sel.join('')} = ${lbl(k)}:  F(${vals[2 * k]}, ${vals[2 * k + 1]}) → ${d}`) },
    ],
    check: () => true,
  };
}

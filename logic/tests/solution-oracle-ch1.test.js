import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch1 from '../src/logic/ch1-quiz.js';

/* ---------------------------------------------------------------
   KIỂM ĐỘC LẬP LỜI GIẢI Logic Ch1 — hệ đếm, bù, số có dấu, mã (D41, D45).
   Không import gì từ src/logic ngoài hàm sinh đề. Đọc chữ của đề, tự tính lại đáp án bằng phép toán số nguyên
   thường, rồi dò TỪNG DÒNG lời giải: phép chia liên tiếp, trọng số, nhóm bit, cộng/trừ trong hệ r, lật bit, bảng mã.
   --------------------------------------------------------------- */

const SEEDS = 300;
const textOf = w => (typeof w === 'string' ? w : w.m ?? '');
const keyOf = w => (typeof w === 'string' ? null : w.key);
const minus = s => s.replace(/−/g, '-');
const DIG = '0123456789ABCDEF';
/** Chuỗi chữ số hệ r → số; chữ số lạ ⇒ lỗi (đề in sai hệ). */
function val(s, r) {
  return [...s].reduce((v, c) => {
    const d = DIG.indexOf(c.toUpperCase());
    if (d < 0 || d >= r) throw new Error(`"${s}" không phải số hệ ${r}`);
    return v * r + d;
  }, 0);
}
const inBase = (v, r, w = 1) => v.toString(r).toUpperCase().padStart(w, '0');
const flip = s => [...s].map(b => (b === '1' ? '0' : '1')).join('');
const fromSub = s => Number([...s].map(c => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).join(''));

/** Biểu thức thập phân: + − × ·, mũ ⁰¹²…, ngoặc, dấu trừ đầu. */
function calc(text) {
  const s = minus(text).replace(/[×·]/g, '*').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => '^' + [...m].map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')).replace(/\s+/g, '');
  let i = 0;
  const expr = () => { let v = term(); while (s[i] === '+' || s[i] === '-') v = s[i++] === '+' ? v + term() : v - term(); return v; };
  const term = () => { let v = unary(); while (s[i] === '*') { i++; v *= unary(); } return v; };
  const unary = () => (s[i] === '-' ? (i++, -unary()) : power());
  const power = () => { const b = atom(); if (s[i] === '^') { i++; return b ** atom(); } return b; };
  const atom = () => {
    if (s[i] === '(') { i++; const v = expr(); if (s[i++] !== ')') throw new Error(text); return v; }
    const m = /^\d+/.exec(s.slice(i));
    if (!m) throw new Error(`không tính được "${text}"`);
    i += m[0].length;
    return Number(m[0]);
  };
  const v = expr();
  if (i !== s.length) throw new Error(`thừa ký hiệu trong "${text}"`);
  return v;
}
/** "0110000 + 1 = 0110001" trong hệ r: mọi vế bằng nhau; trả các chuỗi số đã đọc. */
function eqIn(line, r) {
  const sides = line.split('=').map(side => {
    const toks = minus(side).trim().split(/\s+/);
    let v = val(toks[0].replace('-', ''), r) * (toks[0][0] === '-' ? -1 : 1);
    for (let k = 1; k < toks.length; k += 2) v += (toks[k] === '+' ? 1 : -1) * val(toks[k + 1], r);
    return { v, toks };
  });
  sides.slice(1).forEach(s => expect(s.v, `"${line}" (hệ ${r})`).toBe(sides[0].v));
  return sides.map(s => s.toks);
}
const arrow = line => textOf(line).split('→').map(s => s.trim());

function each(kind, fn) {
  it(kind, () => {
    for (let s = 1; s <= SEEDS; s++) {
      const q = ch1.makeQuestion(kind, seededRandom(s));
      const seen = fn(q, q.work.map(w => [keyOf(w), textOf(w)]));
      expect(seen, `${kind}: lời giải phải có dòng được dò`).toBeGreaterThan(0);
    }
  });
}

describe('Logic Ch1: đáp án tính lại từ chữ của đề, dò từng dòng lời giải', () => {
  each('convert', (q, lines) => {
    const from = Number(q.textParams.from.slice(5)), to = Number(q.textParams.to.slice(5)), src = q.textParams.src;
    const v = val(src, from);
    expect(q.answer).toBe(inBase(v, to));
    let seen = 0, next = v, digits = [];
    lines.forEach(([key, t], k) => {
      const d = /^(\d+) = (\d+)×(\d+) \+ (\d+)(?:\s+\(([0-9A-F])\))?$/.exec(t);
      if (d) {                                                  // chia liên tiếp
        const [a, qq, b, r] = d.slice(1, 5).map(Number);
        expect([a, b], t).toEqual([next, to]);
        expect(a === qq * b + r && r < b, t).toBe(true);
        expect(d[5] ?? String(r), t).toBe(DIG[r]);
        digits.unshift(DIG[r]);
        next = qq;
        seen++;
      } else if (t.startsWith(src + ' = ')) {                   // trọng số: chữ số × cơ số^vị trí
        const terms = t.slice(src.length + 3).split(' + ');
        const nz = [...src].map((c, i) => [val(c, from), src.length - 1 - i]).filter(([x]) => x);
        expect(terms.map(calc), t).toEqual(nz.map(([x, e]) => x * from ** e));
        lines[k + 1][1].split('=').slice(1).forEach(seg => expect(calc(seg), lines[k + 1][1]).toBe(v));
        seen++;
      } else if (key === 's1.expand' || key === 's1.group') {
        const [L, R] = arrow(t).map(s => s.split(/\s+/));
        const kBits = key === 's1.expand' ? q.work[k].params.k : q.work[k].params.k;
        expect(L.length, t).toBe(R.length);
        L.forEach((l, j) => {
          const [digit, bits, base] = key === 's1.expand' ? [l, R[j], from] : [R[j], l, q.work[k].params.to];
          expect(bits.length, t).toBe(kBits);
          expect(val(digit, base), t).toBe(val(bits, 2));
        });
        expect(val((key === 's1.expand' ? R : L).join(''), 2), t).toBe(v);
        seen++;
      } else if (key === 's1.dropZeros') {
        expect(val(t.slice(2), 2)).toBe(v);
      } else if (key === 's1.result') {
        const [, a, ra, b, rb] = /^\(([0-9A-F]+)\)([₀-₉]+) = \(([0-9A-F]+)\)([₀-₉]+)$/.exec(t);
        expect([a, fromSub(ra), b, fromSub(rb)]).toEqual([src, from, q.answer, to]);
        expect(val(b, to)).toBe(v);
        seen++;
      } else if (key === 's1.readUp') {
        expect(t).toBe(digits.join(''));
        expect(next, 'chia tới thương 0').toBe(0);
        expect(t).toBe(q.answer);
      }
    });
    return seen;
  });

  for (const kind of ['complement', 'dimcomplement']) {
    each(kind, (q, lines) => {
      const { r, src } = q.textParams, w = src.length;
      expect(q.answer).toBe(inBase(r ** w - (kind === 'complement' ? 0 : 1) - val(src, r), r, w));
      let seen = 0;
      for (const [key, t] of lines) {
        if (key === 's1.subEach') {
          const [[top, , x], [y]] = eqIn(t, r);
          expect([top, x]).toEqual([DIG[r - 1].repeat(w), src]);
          if (kind === 'dimcomplement') expect(y).toBe(q.answer);
          seen++;
        } else if (key === 's1.flip') {
          const [x, y] = arrow(t);
          expect([x, y]).toEqual([src, flip(src)]);
          if (kind === 'dimcomplement') expect(y).toBe(q.answer);
          seen++;
        } else if (key === 's1.plus1') {
          expect(eqIn(t, r).at(-1)[0]).toBe(q.answer);
          seen++;
        }
      }
      return seen;
    });
  }

  each('subtract', (q, lines) => {
    const { r, a, b, width } = q.textParams;
    const d = val(a, r) - val(b, r);
    expect(q.answer).toBe((d < 0 ? '-' : '') + inBase(Math.abs(d), r, width));
    let seen = 0, comp = null, sum = null;
    for (const [key, t] of lines) {
      if (key === 's1.compN') {
        const [[c], [cn]] = eqIn(t, r);
        expect(c, t).toBe([...b].map(x => DIG[r - 1 - val(x, r)]).join(''));
        comp = cn;
      } else if (key === 's1.addM') {
        const [[x, , y], [s]] = eqIn(t, r);
        expect([x, y]).toEqual([a, comp]);
        sum = s;
      } else if (key === 's1.carryYes') {
        expect(val(t, r), t).toBe(val(sum, r) - r ** width);
        expect(t).toBe(q.answer);
      } else if (key === 's1.carryNo') {
        const [x, y] = arrow(t);
        expect([x.length, y.length, val(y, r)]).toEqual([width, width, r ** width - val(x, r)]);
        expect(x).toBe(sum);
      } else if (key === 's1.result') expect(minus(t)).toBe(q.answer);
      else if (key === 's1.check') {
        const [lhs, rhs] = t.split('=');
        expect(calc(lhs), t).toBe(calc(rhs));
        expect(calc(lhs), t).toBe(d);
      } else continue;
      seen++;
    }
    return seen;
  });

  const FMT = { 'c1.fmtMagnitude': 'magnitude', 'c1.fmtOnes': 'ones', 'c1.fmtTwos': 'twos' };
  each('signed', (q, lines) => {
    const { value: v, w } = q.textParams, fmt = FMT[q.textParams.format], abs = inBase(Math.abs(v), 2, w);
    const want = v >= 0 ? abs : fmt === 'magnitude' ? '1' + abs.slice(1) : fmt === 'ones' ? flip(abs) : inBase(2 ** w + v, 2, w);
    expect(q.answer).toBe(want);
    if (!(fmt === 'twos' && v === -(2 ** (w - 1)))) expect(abs[0], 'giá trị vừa w bit').toBe('0');   // −2^(w−1) chỉ bù 2 mới có
    let seen = 0;
    for (const [key, t] of lines) {
      if (key === 's1.absBits' || key === 's1.posPad') expect(t.replace(/^\d+ = /, '')).toBe(abs);
      else if (key === 's1.flipAll') { const [x, y] = arrow(t); expect(y).toBe(flip(x)); }
      else if (key === 's1.setSign') { const [x, y] = arrow(t); expect([x, y]).toEqual([abs, '1' + abs.slice(1)]); }
      else if (key === 's1.plus1') expect(eqIn(t, 2).at(-1)[0]).toBe(q.answer);
      else continue;
      seen++;
    }
    return seen;
  });

  each('decode', (q, lines) => {
    const { bits } = q.textParams, fmt = FMT[q.textParams.format], w = bits.length, neg = bits[0] === '1';
    const want = !neg ? val(bits, 2) : fmt === 'magnitude' ? -val(bits.slice(1), 2) : fmt === 'ones' ? -val(flip(bits), 2) : val(bits, 2) - 2 ** w;
    expect(q.answer).toBe(want);
    let seen = 0;
    lines.forEach(([key, t], k) => {
      if (key === 's1.magRest') { const [x, n] = t.split(' = '); expect([x, val(x, 2)]).toEqual([bits.slice(1), Number(n)]); seen++; }
      if (key === 's1.flipAll') { const [x, rest] = arrow(t); const [y, n] = rest.split(' = '); expect([x, y, val(y, 2)]).toEqual([bits, flip(bits), Number(n)]); seen++; }
      if (key === 's1.twosWeight') {
        const [lhs, rhs] = lines[k + 1][1].split('=');
        expect([calc(lhs), calc(rhs)]).toEqual([want, want]);
        expect(calc(lhs.split('+')[0])).toBe(-(2 ** (w - 1)));
        seen++;
      }
      if (key === 's1.result') expect(Number(minus(t))).toBe(want);
    });
    return seen;
  });

  each('range', (q, lines) => {
    const { w } = q.textParams, fmt = FMT[q.textParams.format];
    const want = fmt === 'twos' ? [-(2 ** (w - 1)), 2 ** (w - 1) - 1] : [-(2 ** (w - 1) - 1), 2 ** (w - 1) - 1];
    expect(q.answer).toEqual(want);
    const t = lines.find(([key, x]) => !key && x.includes('…'))[1];
    t.split('=').forEach(side => expect(side.split('…').map(calc), t).toEqual(want));
    return 1;
  });

  const CODE = {
    'code.bcd': d => inBase(d, 2, 4), 'code.excess3': d => inBase(d + 3, 2, 4),
    'code.2421': d => ['0000', '0001', '0010', '0011', '0100', '1011', '1100', '1101', '1110', '1111'][d],
  };
  each('bcd', (q, lines) => {
    const { dec, code } = q.textParams, enc = CODE[code];
    expect(q.answer).toBe([...dec].map(c => enc(Number(c))).join(' '));
    const rows = lines.filter(([key, t]) => !key && t.includes('→')).map(([, t]) => t);
    expect(rows).toHaveLength(dec.length);
    rows.forEach((t, k) => {
      const [lhs, bits] = arrow(t), [digit, sum] = lhs.split(' = ');
      expect(Number(digit.split(' + ')[0]), t).toBe(Number(dec[k]));
      if (sum) expect(calc(digit), t).toBe(Number(sum));
      expect(bits, t).toBe(enc(Number(dec[k])));
    });
    return rows.length;
  });

  each('gray', (q, lines) => {
    const { bits } = q.textParams, toGray = q.textKey === 'c1q.qBinToGray';
    const out = [...bits].map(Number);
    if (toGray) for (let i = out.length - 1; i > 0; i--) out[i] ^= out[i - 1];
    else for (let i = 1; i < out.length; i++) out[i] ^= out[i - 1];
    expect(q.answer).toBe(out.join(''));
    let seen = 0;
    for (const [key, t] of lines) {
      if (key === 's1.grayFirst' || key === 's1.binFirst') expect(t).toBe(bits[0]);
      const m = /^[gb]([₀-₉]+) = [gb][₀-₉]+ ⊕ [gb][₀-₉]+ = ([01]) ⊕ ([01]) = ([01])$/.exec(t);
      if (!m) continue;
      const i = fromSub(m[1]) - 1, [x, y, z] = m.slice(2).map(Number);
      expect([x, y, z], t).toEqual([toGray ? +bits[i - 1] : out[i - 1], +bits[i], out[i]]);
      seen++;
    }
    expect(seen).toBe(bits.length - 1);
    return seen;
  });

  each('parity', (q, lines) => {
    const { bits } = q.textParams, ones = [...bits].filter(b => b === '1').length;
    const bit = q.textParams.parity === 'c1q.parity.even' ? ones % 2 : 1 - (ones % 2);
    expect(q.answer).toBe(bits + bit);
    const [x, n] = arrow(lines.find(([key]) => key === 's1.countOnes')[1]);
    expect([x, Number(n)]).toEqual([bits, ones]);
    expect(q.work.find(w => /^s1\.parity(Even|Odd)$/.test(w.key)).params).toEqual({ ones, bit: String(bit) });
    return 1;
  });
});

describe('bộ tính Ch1 tự kiểm', () => {
  it('khớp tính tay', () => {
    expect(calc('−(2⁷ − 1)')).toBe(-127);
    expect(calc('1×2⁶ + 1×2⁴')).toBe(80);
    expect(calc('3 + (−7)')).toBe(-4);
    expect(val('3C', 16)).toBe(60);
    expect(() => val('19', 8)).toThrow();
    expect(eqIn('101000 + 101101 = 1010101', 2)[1]).toEqual(['1010101']);
    expect(() => eqIn('9999 − 0387 = 9613', 10)).toThrow();
  });
});

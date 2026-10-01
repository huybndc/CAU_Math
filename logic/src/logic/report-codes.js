import { fail } from '@shared/logic/app-error.js';
import { CODE_TABLES, encodeDecimal, addBcd, parityBit } from './binary-codes.js';
import { binToGray, grayToBin, binToGraySteps, grayToBinSteps } from './gray.js';

/* ---------------------------------------------------------------
   MÁY GIẢI MÃ NHỊ PHÂN (Chương 1): số thập phân → BCD / 2421 / Excess-3 · cộng BCD (+6) · nhị phân ↔ Gray · bit parity.
   Trả { answer, steps, expect } cho shared/ui/solver.js. Thuần: không DOM, chỉ khoá từ điển.
   --------------------------------------------------------------- */

export const CODE_OPS = ['dec', 'bcdAdd', 'bin2gray', 'gray2bin', 'parity'];
const bitsOnly = s => { const t = String(s).replace(/\s+/g, ''); if (!/^[01]+$/.test(t)) fail('err.bitsOnly'); return t; };
const decOnly = s => { const t = String(s).trim(); if (!/^\d+$/.test(t)) fail('err.decimalOnly'); return t; };

function decReport(x) {
  const n = decOnly(x);
  const per = ['bcd', '2421', 'excess3'].map(t => ({ t, groups: encodeDecimal(n, t).map(g => g.bits) }));
  return {
    answer: per.map(p => ({ key: CODE_TABLES[p.t].nameKey, m: p.groups.join(' ') })),
    expect: per.flatMap(p => [p.groups.join(' '), p.groups.join('')]),
    steps: [{
      head: { key: 'cd.stDigits' }, why: { key: 'cd.whyDigits' },
      lines: [...n].map(d => `${d}  →  ${per.map(p => encodeDecimal(d, p.t)[0].bits).join('   ')}`).concat([{ key: 'cd.colsNote' }]),
    }],
  };
}

function bcdAddReport(x, y) {
  const A = decOnly(x), B = decOnly(y);
  const r = addBcd(A, B);
  const code = [...r.digits].map(d => encodeDecimal(d, 'bcd')[0].bits).join(' ');
  return {
    answer: [{ key: 'cd.sumIs', m: r.digits }, { key: 'cd.bcd', m: code }],
    expect: [r.digits, code, code.replace(/ /g, '')],
    steps: [...r.cols].reverse().map((c, i) => ({
      head: { key: 'cd.stCol', params: { i: i + 1, a: c.a, b: c.b } }, ...(i === 0 ? { why: { key: 'cd.whyFix' } } : {}),
      lines: c.steps.map(s => ({ key: s.labelKey, m: s.value })),
    })),
  };
}

function grayReport(x, toGray) {
  const s = bitsOnly(x);
  const out = toGray ? binToGray(s) : grayToBin(s);
  const st = toGray ? binToGraySteps(s) : grayToBinSteps(s);
  return {
    answer: [{ key: toGray ? 'cd.grayIs' : 'cd.binIs', m: out }],
    expect: [out],
    steps: [{
      head: { key: toGray ? 'cd.stToGray' : 'cd.stToBin' }, why: { key: toGray ? 'cd.whyToGray' : 'cd.whyToBin' },
      lines: st.map(p => (p.first ? { key: 'cd.keepFirst', m: `${p.b}` } : `${p.a} ⊕ ${p.b} = ${p.r}`)).concat([{ key: 'cd.readOut', m: out }]),
    }],
  };
}

function parityReport(x, kind) {
  const s = bitsOnly(x);
  const p = parityBit(s, kind === 'odd' ? 'odd' : 'even');
  const ones = [...s].filter(b => b === '1').length;
  return {
    answer: [{ key: kind === 'odd' ? 'cd.parityOdd' : 'cd.parityEven', m: p }, { key: 'cd.withParity', m: s + p }],
    expect: [p, s + p],
    steps: [{
      head: { key: 'cd.stParity' }, why: { key: kind === 'odd' ? 'cd.whyOdd' : 'cd.whyEven' },
      lines: [{ key: 'cd.countOnes', params: { n: ones }, m: s }, { key: 'cd.parityBit', m: p }],
    }],
  };
}

export function codesReport(op, x, y = '', kind = 'even') {
  switch (op) {
    case 'dec': return decReport(x);
    case 'bcdAdd': return bcdAddReport(x, y);
    case 'bin2gray': return grayReport(x, true);
    case 'gray2bin': return grayReport(x, false);
    case 'parity': return parityReport(x, kind);
    default: return fail('err.badQuizKind', { kind: op });
  }
}

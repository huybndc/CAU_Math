/* ---------------------------------------------------------------
   LỜI GIẢI TỪNG BƯỚC — Chương 1 (thuần, không biết ngôn ngữ).
   Mỗi dòng là một trong ba dạng (shared/ui/question.js explainBlock in ra):
     'chuỗi toán'                 dòng tính thuần (số, bit, biểu thức)
     { key, params }              một câu giải thích (khoá từ điển)
     { key, params, m }           câu dẫn + phép tính theo sau
   Hiện cho MỌI câu sau khi trả lời, dù đúng hay sai (D23).
   --------------------------------------------------------------- */

import { toDecimal, intToBaseSteps } from './number-systems.js';
import { diminishedComplement, radixComplement } from './complements.js';
import { range } from './signed-binary.js';
import { encodeDecimal } from './binary-codes.js';
import { toBits } from './gray.js';
import { line as L } from '@shared/logic/steps.js';

const sup = n => String(n).replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
const sub = n => String(n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
const val = ch => parseInt(ch, 16);
const minus = s => String(s).replace(/-/g, '−');

/** Đổi cơ số: gộp nhóm bit khi đi giữa 2, 8, 16 (cách nhanh của Mano); còn lại đi qua thập phân. */
function convert(q) {
  const { src, from, to } = q.meta;
  const k = { 8: 3, 16: 4 };
  if (from !== 10 && to !== 10) {
    const lines = [];
    let bin = src;
    if (from !== 2) {                               // mỗi chữ số → 3 hoặc 4 bit
      const parts = [...src].map(c => toBits(val(c), k[from]));
      lines.push(L('s1.expand', { from, k: k[from] }, `${[...src].join('  ')} → ${parts.join(' ')}`));
      bin = parts.join('').replace(/^0+(?=.)/, '');
    }
    if (to === 2) {
      lines.push(L('s1.dropZeros', {}, `= ${bin}`));
    } else {                                        // gộp từ PHẢI sang trái, đệm 0 bên trái
      const w = k[to];
      const padded = bin.padStart(Math.ceil(bin.length / w) * w, '0');
      const groups = padded.match(new RegExp(`.{${w}}`, 'g'));
      lines.push(L('s1.group', { k: w, to }, `${groups.join(' ')} → ${groups.map(g => parseInt(g, 2).toString(16).toUpperCase()).join('  ')}`));
    }
    lines.push(L('s1.result', {}, `(${src})${sub(from)} = (${q.answer})${sub(to)}`));
    return lines;
  }
  const lines = [];
  const dec = toDecimal(src, from);
  if (from !== 10) {                                // nhân mỗi chữ số với trọng số rồi cộng
    const d = [...src];
    const nz = d.map((c, i) => [val(c), from ** (d.length - 1 - i), d.length - 1 - i]).filter(t => t[0] !== 0);
    lines.push(L('s1.weights', { from }));
    lines.push(`${src} = ${nz.map(([v, , e]) => `${v}×${from}${sup(e)}`).join(' + ')}`);
    lines.push(nz.length > 1 ? `= ${nz.map(([v, w]) => v * w).join(' + ')} = ${dec}` : `= ${dec}`);
  }
  if (to !== 10) {                                  // chia liên tiếp — các dòng này ch1-help.js dùng để chỉ phép chia sai
    lines.push(L('s1.divide', { to }));
    for (const s of intToBaseSteps(dec, to).steps) {
      lines.push(`${s.value} = ${s.quotient}×${to} + ${s.remainder}` + (String(s.remainder) === s.digit ? '' : `  (${s.digit})`));
    }
    lines.push(L('s1.readUp', {}, String(q.answer)));
  }
  return lines;
}

function complementLines(src, r) {
  const dim = diminishedComplement(src, r);
  const top = (r - 1).toString(r).toUpperCase().repeat(src.length);
  return {
    dim,
    first: r === 2 ? L('s1.flip', {}, `${src} → ${dim.digits}`) : L('s1.subEach', { r1: r - 1 }, `${top} − ${src} = ${dim.digits}`),
  };
}

function signed(q) {
  const { value, format, w } = q.meta;
  const abs = Math.abs(value);
  const mag = toBits(abs, w);
  if (value >= 0) return [L('s1.posPad', { w }, `${abs} = ${mag}`)];
  const lines = [L('s1.absBits', { abs, w }, mag)];
  if (format === 'magnitude') lines.push(L('s1.setSign', {}, `${mag} → ${q.answer}`));
  if (format === 'ones') lines.push(L('s1.flipAll', {}, `${mag} → ${q.answer}`));
  if (format === 'twos') {
    const ones = [...mag].map(b => (b === '0' ? '1' : '0')).join('');
    lines.push(L('s1.flipAll', {}, `${mag} → ${ones}`), L('s1.plus1', {}, `${ones} + 1 = ${q.answer}`));
  }
  return lines;
}

function decodeLines(q) {
  const { bits, format } = q.meta;
  const w = bits.length;
  const rest = bits.slice(1);
  if (format === 'magnitude') {
    return [L('s1.signBit'), L('s1.magRest', {}, `${rest} = ${parseInt(rest, 2)}`), L('s1.result', {}, minus(q.answer))];
  }
  if (format === 'ones') {
    const flip = [...bits].map(b => (b === '0' ? '1' : '0')).join('');
    return [L('s1.signBit'), L('s1.flipAll', {}, `${bits} → ${flip} = ${parseInt(flip, 2)}`), L('s1.result', {}, minus(q.answer))];
  }
  const parts = [...bits].flatMap((b, i) => (b === '1' ? [i === 0 ? -(2 ** (w - 1)) : 2 ** (w - 1 - i)] : []));
  return [
    L('s1.twosWeight', { w1: w - 1, top: minus(-(2 ** (w - 1))) }),
    minus(`${parts.map((p, i) => (i && p > 0 ? `+ ${p}` : String(p))).join(' ')} = ${q.answer}`),
  ];
}

function gray(q) {
  const { bits, toGray } = q.meta;
  const out = String(q.answer);
  const lines = [L(toGray ? 's1.grayFirst' : 's1.binFirst', {}, `${bits[0]}`)];
  for (let i = 1; i < bits.length; i++) {
    lines.push(toGray
      ? `g${sub(i + 1)} = b${sub(i)} ⊕ b${sub(i + 1)} = ${bits[i - 1]} ⊕ ${bits[i]} = ${out[i]}`
      : `b${sub(i + 1)} = b${sub(i)} ⊕ g${sub(i + 1)} = ${out[i - 1]} ⊕ ${bits[i]} = ${out[i]}`);
  }
  return lines;
}

export function stepsOf(q) {
  const m = q.meta;
  switch (q.kind) {
    case 'convert': return convert(q);
    case 'complement': {
      const { first, dim } = complementLines(m.src, m.r);
      return [first, L('s1.plus1', {}, `${dim.digits} + 1 = ${q.answer}`)];
    }
    case 'dimcomplement': return [complementLines(m.src, m.r).first];
    case 'subtract': {
      const { r, a, b, comp, sum } = q.explainParams;
      const res = radixComplement(sum, r);
      const lines = [
        L('s1.compN', { r, b }, `${diminishedComplement(b, r).digits} + 1 = ${comp}`),
        L('s1.addM', {}, `${a} + ${comp} = ${q.explainKey === 'c1q.xSubPos' ? '1' : ''}${sum}`),
      ];
      if (q.explainKey === 'c1q.xSubPos') lines.push(L('s1.carryYes', {}, q.answer));
      else lines.push(L('s1.carryNo', { r }, `${sum} → ${res.digits}`), L('s1.result', {}, minus(q.answer)));
      lines.push(L('s1.check', {}, minus(`${toDecimal(a, r)} − ${toDecimal(b, r)} = ${toDecimal(a, r) - toDecimal(b, r)}`)));
      return lines;
    }
    case 'signed': return signed(q);
    case 'decode': return decodeLines(q);
    case 'range': {
      const { min, max } = range(m.format, m.w);
      return m.format === 'twos'
        ? [L('s1.rangeTwos'), minus(`−2${sup(m.w - 1)} … 2${sup(m.w - 1)} − 1 = ${min} … ${max}`)]
        : [L('s1.rangeSym'), minus(`−(2${sup(m.w - 1)} − 1) … 2${sup(m.w - 1)} − 1 = ${min} … ${max}`)];
    }
    case 'bcd':
      return [
        L('s1.bcdEach', { code: 'code.' + m.table }),
        ...encodeDecimal(m.dec, m.table).map(g => (m.table === 'excess3' ? `${g.digit} + 3 = ${g.digit + 3} → ${g.bits}` : `${g.digit} → ${g.bits}`)),
        L('s1.result', {}, q.answer),
      ];
    case 'gray': return [...gray(q), L('s1.result', {}, q.answer)];
    case 'parity': {
      const ones = [...m.bits].filter(b => b === '1').length;
      const bit = String(q.answer).at(-1);
      return [L('s1.countOnes', {}, `${m.bits} → ${ones}`), L(m.kind === 'even' ? 's1.parityEven' : 's1.parityOdd', { ones, bit }), L('s1.result', {}, q.answer)];
    }
    default: return [];
  }
}

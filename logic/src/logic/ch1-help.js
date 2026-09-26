/* ---------------------------------------------------------------
   HỖ TRỢ SỬA SAI CHƯƠNG 1 — thuần, không biết ngôn ngữ.
   (Lời giải từng bước nằm ở steps-ch1.js.)
   - diagnose(): xem đáp án SAI của người học trông giống lỗi nào (quên +1, sai cơ số,
     nhầm dạng biểu diễn, sai dấu, đổi ngược chiều…) rồi chỉ đúng chỗ. Không đoán
     được thì chỉ ra vị trí đầu tiên khác đáp án đúng.
   --------------------------------------------------------------- */

import { toDecimal, convertBase, fromDecimal } from './number-systems.js';
import { diminishedComplement, radixComplement } from './complements.js';
import { encode, decode, range, FORMATS } from './signed-binary.js';
import { encodeDecimal, withParity } from './binary-codes.js';
import { binToGray, grayToBin, toBits } from './gray.js';
import { sameDigits, sameBits, parseNumber } from '@shared/logic/answer-format.js';

export const FMT_KEY = { magnitude: 'c1.fmtMagnitude', ones: 'c1.fmtOnes', twos: 'c1.fmtTwos' };
const val = ch => parseInt(ch, 16);

/** Chỉ giữ ký tự có thể là chữ số / dấu — an toàn để in lại trong lời nhắn (không lọt HTML). */
export const clean = s => String(s ?? '').replace(/[^0-9A-Fa-f.\-−\s]/g, '').replace(/−/g, '-').trim().toUpperCase().slice(0, 40);
const flat = s => clean(s).replace(/\s+/g, '');

const STEP = /^\d+ = \d+×\d+ \+ /;          // một dòng phép chia (thương, dư) trong steps-ch1.js

const note = (detailKey, detailParams = {}) => ({ detailKey, detailParams });
const attempt = f => { try { return f(); } catch { return undefined; } };

/** Vị trí đầu tiên khác (đếm từ trái) khi hai dãy cùng độ dài. */
function diff(got, want) {
  if (got.length !== want.length) return note('c1q.dLen', { want: want.length, got: got.length });
  const at = [...want].map((c, i) => (c === got[i] ? -1 : i)).filter(i => i >= 0);
  if (!at.length) return null;
  const [i] = at;
  const p = { pos: i + 1, got: got[i], want: want[i] };
  return at.length === 1 ? note('c1q.dPos', p) : note('c1q.dPosMore', { ...p, more: at.length - 1 });
}

/** Đáp án sai `given` của câu q → { detailKey, detailParams } hoặc null. */
export function diagnose(q, given) {
  const m = q.meta;
  const g = flat(given);
  const want = flat(q.answerText ?? q.answer);
  switch (q.kind) {
    case 'convert': {
      const v = toDecimal(m.src, m.from);
      for (const b of [2, 8, 10, 16]) if (b !== m.to && attempt(() => toDecimal(g, b)) === v) return note('c1q.dWrongBase', { b, to: m.to });
      const bad = [...g].find(c => c !== '.' && !(val(c) < m.to));
      if (bad) return note('c1q.dBadDigit', { ch: bad, to: m.to, top: (m.to - 1).toString(16).toUpperCase() });
      // đích là thập phân (hoặc khác độ dài): chữ số không tương ứng vị trí ⇒ so giá trị
      if (m.to === 10 || g.length !== want.length) return note('c1q.dValue', { given: g, to: m.to, got: attempt(() => toDecimal(g, m.to)), want: v });
      // chữ số phải nhất là số dư của phép chia THỨ NHẤT, kế tiếp đi dần sang trái:
      // chữ số sai phải nhất chính là phép chia đầu tiên bị tính sai
      const k = [...want].reverse().findIndex((c, i) => c !== g[g.length - 1 - i]);
      if (k < 0) return null;
      const line = q.work.filter(l => typeof l === 'string' && STEP.test(l))[k];
      if (!line) return diff(g, want);                           // đổi bằng gộp nhóm bit: không có phép chia để chỉ
      return note('c1q.dStep', { k: k + 1, line, got: g[g.length - 1 - k], want: want[want.length - 1 - k] });
    }
    case 'complement':
      if (sameDigits(g, diminishedComplement(m.src, m.r).digits)) return note('c1q.dNoPlus1', { r1: m.r - 1 });
      return diff(g, want);
    case 'dimcomplement':
      if (sameDigits(g, radixComplement(m.src, m.r).digits)) return note('c1q.dExtra1', { r1: m.r - 1 });
      return diff(g, want);
    case 'subtract': {
      const pos = q.answer.replace('-', '');
      if (sameDigits(g.replace('-', ''), pos)) return note('c1q.dSign', { sign: q.answer.startsWith('-') ? 'c1q.signNeg' : 'c1q.signPos' });
      return diff(g.replace('-', ''), pos);
    }
    case 'signed': {
      for (const f of FORMATS) if (f !== m.format && attempt(() => sameBits(g, encode(m.value, f, m.w)))) return note('c1q.dOtherFmt', { fmt: FMT_KEY[f], want: FMT_KEY[m.format] });
      return diff(g, want);
    }
    case 'decode': {
      const n = parseNumber(given);
      if (n === null) return null;
      for (const f of FORMATS) if (f !== m.format && attempt(() => decode(m.bits, f)) === n) return note('c1q.dReadAs', { fmt: FMT_KEY[f], want: FMT_KEY[m.format] });
      return n === -q.answer ? note('c1q.dSignRead') : null;
    }
    case 'range': {
      const nums = String(given).replace(/[−–]/g, '-').match(/-?\d+/g)?.map(Number);
      if (!nums || nums.length !== 2) return null;
      for (const f of FORMATS) {
        if (f === m.format) continue;
        const r = range(f, m.w);
        if (r.min === nums[0] && r.max === nums[1]) return note('c1q.dRangeFmt', { fmt: FMT_KEY[f] });
      }
      return null;
    }
    case 'bcd': {
      const groups = encodeDecimal(m.dec, m.table);
      if (g.length !== groups.length * 4) return note('c1q.dLen', { want: groups.length * 4, got: g.length });
      const i = groups.findIndex((gr, k) => g.slice(k * 4, k * 4 + 4) !== gr.bits);
      return i < 0 ? null : note('c1q.dBcdDigit', { i: i + 1, d: groups[i].digit, want: groups[i].bits, got: g.slice(i * 4, i * 4 + 4) });
    }
    case 'gray': {
      const back = m.toGray ? grayToBin(m.bits) : binToGray(m.bits);
      return sameBits(g, back) ? note('c1q.dReverse') : diff(g, want);
    }
    case 'parity': {
      const other = m.kind === 'even' ? 'odd' : 'even';
      if (sameBits(g, withParity(m.bits, other))) return note('c1q.dParityFlip', { used: 'c1q.parity.' + other, want: 'c1q.parity.' + m.kind });
      return diff(g, want);
    }
    default: return null;
  }
}

/* ---------------- phương án nhiễu cho đề trắc nghiệm (shared/logic/mcq.js) ---------------- */
const strip0 = s => s.replace(/^0+(?=.)/, '');
const rev = s => [...s].reverse().join('');
const minus = s => String(s).replace(/-/g, '−');

/** Các đáp án SAI hay gặp nhất của câu q (xếp theo độ phổ biến) + đáp án đúng ở dạng chuỗi. */
export function wrongOf(q) {
  const m = q.meta;
  const ok = s => String(s);
  const each = (list, f) => list.flatMap(x => { const v = attempt(() => f(x)); return v === undefined ? [] : [v]; });
  switch (q.kind) {
    case 'convert':
      return {
        correct: ok(q.answer),
        candidates: [strip0(rev(String(q.answer))),                     // đọc số dư từ TRÊN xuống
          ...each([2, 8, 10, 16].filter(b => b !== m.to && b !== m.from), b => convertBase(m.src, m.from, b))],   // nhầm cơ số đích
      };
    case 'complement':
      return { correct: ok(q.answer), candidates: [diminishedComplement(m.src, m.r).digits, rev(q.answer)] };   // quên +1
    case 'dimcomplement':
      return { correct: ok(q.answer), candidates: [radixComplement(m.src, m.r).digits, rev(q.answer)] };        // cộng thừa 1
    case 'subtract': {
      const neg = q.answer.startsWith('-');
      const v = (neg ? -1 : 1) * toDecimal(q.answer.replace('-', ''), m.r);
      const fmt = x => (x < 0 ? '-' : '') + fromDecimal(Math.abs(x), m.r).padStart(m.width, '0');
      return { correct: q.answer, candidates: [fmt(-v), fmt(v + 1), fmt(v - 1), fmt(v + 2)].filter(s => s.replace('-', '').length === m.width) };
    }
    case 'signed':
      return {
        correct: q.answer,
        candidates: [...each(FORMATS.filter(f => f !== m.format), f => encode(m.value, f, m.w)),     // dạng biểu diễn khác
          (q.answer[0] === '1' ? '0' : '1') + q.answer.slice(1),                                      // lật bit dấu
          attempt(() => '0' + toBits(Math.abs(m.value), m.w - 1))].filter(Boolean),                   // chỉ độ lớn, bit dấu 0
      };
    case 'decode':
      return {
        correct: ok(q.answer),
        candidates: [...each(FORMATS.filter(f => f !== m.format), f => decode(m.bits, f)),           // đọc theo dạng khác
          -q.answer, parseInt(m.bits, 2)],                                                            // sai dấu / đọc như số không dấu
      };
    case 'range': {
      const fmt = r => minus(`${r.min} … ${r.max}`);
      const w = m.w;
      return {
        correct: minus(q.answerText),
        candidates: [...FORMATS.filter(f => f !== m.format).map(f => fmt(range(f, w))),             // khoảng của dạng khác
          fmt({ min: 0, max: 2 ** w - 1 }), fmt({ min: -(2 ** (w - 1)), max: 2 ** (w - 1) })],      // không dấu / lệch 1
      };
    }
    case 'bcd': {
      const len = m.dec.length * 4;
      const group = s => s.match(/.{1,4}/g).join(' ');
      const plain = group(toBits(Number(m.dec), len));                                                // nhị phân thường
      const others = ['bcd', 'excess3', '2421'].filter(t => t !== m.table)
        .map(t => encodeDecimal(m.dec, t).map(g => g.bits).join(' '));                                // bảng mã khác
      return { correct: q.answer, candidates: [...others, plain] };
    }
    case 'gray':
      return { correct: q.answer, candidates: [m.toGray ? grayToBin(m.bits) : binToGray(m.bits), m.bits] };   // đổi ngược chiều / chép lại
    case 'parity':
      return { correct: q.answer, candidates: [withParity(m.bits, m.kind === 'even' ? 'odd' : 'even')] };
    default: return null;
  }
}

/* ---------------------------------------------------------------
   SINH & CHẤM ĐỀ CHƯƠNG 1 — Hệ đếm & mã nhị phân (Mano §1.2–1.9).
   Thuần, không đụng DOM, không biết ngôn ngữ: đề/gợi ý/lời giải là khoá
   từ điển + tham số. `meta` giữ tham số sinh đề để test kiểm chứng lại.
   Câu hỏi theo hợp đồng của shared/ui/runner.js.
   --------------------------------------------------------------- */

import { convertBase, fromDecimal, toDecimal } from './number-systems.js';
import { diminishedComplement, radixComplement, subtractByComplement } from './complements.js';
import { encode, decode, range } from './signed-binary.js';
import { encodeDecimal, withParity } from './binary-codes.js';
import { binToGray, grayToBin, toBits } from './gray.js';
import { diagnose, FMT_KEY } from './ch1-help.js';
import { stepsOf } from './steps-ch1.js';
import { fail } from '@shared/logic/app-error.js';
import { pick, int } from '@shared/logic/shuffle.js';
import { sameDigits, sameBits, parseNumber } from '@shared/logic/answer-format.js';

export const KINDS = ['convert', 'complement', 'dimcomplement', 'subtract', 'signed', 'decode',
  'range', 'bcd', 'gray', 'parity'];

/** Nhóm dạng liền chủ đề — mục Luyện tập hiện theo nhóm cho gọn (D30); nhãn: T(`${prefix}.${id}`). */
export const GROUPS = [
  { id: 'g-base', kinds: ['convert'] },
  { id: 'g-compl', kinds: ['complement', 'dimcomplement', 'subtract'] },
  { id: 'g-signed', kinds: ['signed', 'decode', 'range'] },
  { id: 'g-codes', kinds: ['bcd', 'gray', 'parity'] },
];

/** Thời gian chuẩn (giây) để làm một câu mỗi dạng — cho "~M phút" và dựng bài full 60–90 phút. */
export const SECONDS = {
  convert: 75, complement: 60, dimcomplement: 45, subtract: 120, signed: 75, decode: 60,
  range: 45, bcd: 60, gray: 45, parity: 30,
};

const CODE_KEY = { bcd: 'code.bcd', excess3: 'code.excess3', '2421': 'code.2421' };

/** Đổi cơ số (§1.3–1.4). */
function makeConvert(rnd) {
  const from = pick([2, 8, 10, 16], rnd);
  const to = pick([2, 8, 10, 16].filter(b => b !== from), rnd);
  const v = int(5, 255, rnd);
  const src = fromDecimal(v, from);
  const answer = convertBase(src, from, to);
  return {
    kind: 'convert', format: 'text',
    textKey: 'c1q.qConvert', textParams: { src, from: 'base.' + from, to: 'base.' + to },
    answer, input: to === 2 ? { type: 'bits', length: 8 } : undefined,
    hintKey: 'c1q.hConvert', hintParams: { to },
    explainKey: 'c1q.xConvert', explainParams: { src, from, to, dec: v, answer },
    meta: { src, from, to },
    // thẻ bài học riêng cho từng kiểu đổi (xem data-also trong theory-ch1.*.md)
    review: from === 10 ? 'fromDec' : to === 10 ? 'toDec' : 'group',
  };
}

/** r's complement (§1.5). */
function makeComplement(rnd) {
  const r = pick([2, 10], rnd);
  const width = r === 2 ? 7 : 4;
  const src = fromDecimal(int(1, r ** width - 2, rnd), r).padStart(width, '0');
  const res = radixComplement(src, r);
  return {
    kind: 'complement', format: 'text',
    textKey: 'c1q.qComplement', textParams: { r, src, width }, formatParams: { width, r1: r - 1 },
    answer: res.digits, input: r === 2 ? { type: 'bits', length: width } : undefined,
    hintKey: 'c1q.hComplement', hintParams: { r1: r - 1 },
    explainKey: 'c1q.xComplement', explainParams: { r1: r - 1, src, dim: res.diminished, answer: res.digits },
    meta: { src, r, width },
  };
}

/** (r−1)'s complement (§1.5). */
function makeDimComplement(rnd) {
  const r = pick([2, 8, 10, 16], rnd);
  const width = r === 2 ? 8 : 5;
  const src = fromDecimal(int(1, r ** width - 2, rnd), r).padStart(width, '0');
  const answer = diminishedComplement(src, r).digits;
  return {
    kind: 'dimcomplement', format: 'text',
    textKey: 'c1q.qDim', textParams: { r1: r - 1, r, src },
    answer, input: r === 2 ? { type: 'bits', length: width } : undefined,
    hintKey: 'c1q.hDim', hintParams: { r1: r - 1, top: (r - 1).toString(r).toUpperCase() },
    explainKey: 'c1q.xDim', explainParams: { r1: r - 1, src, answer },
    meta: { src, r },
  };
}

/** Trừ bằng complement (§1.5.3). */
function makeSubtract(rnd) {
  const r = pick([2, 10], rnd);
  const width = r === 2 ? 6 : 3;
  const hi = r ** width - 1;
  const A = fromDecimal(int(1, hi, rnd), r).padStart(width, '0');
  const B = fromDecimal(int(1, hi, rnd), r).padStart(width, '0');
  const res = subtractByComplement(A, B, r);
  const answer = (res.negative ? '-' : '') + res.digits;
  return {
    kind: 'subtract', format: 'text',
    textKey: 'c1q.qSubtract', textParams: { r, a: A, b: B, width },
    answer,
    hintKey: 'c1q.hSubtract', hintParams: { r },
    explainKey: res.endCarry ? 'c1q.xSubPos' : 'c1q.xSubNeg',
    explainParams: { r, a: A, b: B, comp: res.compN, sum: res.sum, answer },
    meta: { m: A, n: B, r, width },
  };
}

/** Biểu diễn số có dấu (§1.6). */
function makeSigned(rnd) {
  const w = pick([5, 8], rnd);
  const format = pick(['magnitude', 'ones', 'twos'], rnd);
  const { min, max } = range(format, w);
  let v = int(min, max, rnd);
  if (v >= 0 && rnd() < 0.7) v = -Math.max(1, Math.abs(v));      // số âm mới là chỗ khó
  const answer = encode(v, format, w);
  return {
    kind: 'signed', format: 'text',
    textKey: 'c1q.qSigned', textParams: { value: v, format: FMT_KEY[format], w },
    answer, input: { type: 'bits', length: w },
    hintKey: v >= 0 ? 'c1q.hSignedPos' : 'c1q.hSignedNeg', hintParams: { w, format: FMT_KEY[format] },
    explainKey: 'c1q.xSigned.' + (v >= 0 ? 'pos' : format),
    explainParams: { value: v, abs: Math.abs(v), w, mag: toBits(Math.abs(v), w), answer },
    meta: { value: v, format, w },
  };
}

/** Đọc ngược: chuỗi bit có dấu → giá trị thập phân. */
function makeDecode(rnd) {
  const w = pick([5, 6, 8], rnd);
  const format = pick(['magnitude', 'ones', 'twos'], rnd);
  const { min } = range(format, w);
  const v = int(min, -1, rnd);
  const bits = encode(v, format, w);
  return {
    kind: 'decode', format: 'number',
    textKey: 'c1q.qDecode', textParams: { bits, format: FMT_KEY[format] },
    answer: decode(bits, format),
    hintKey: 'c1q.hDecode', hintParams: { format: FMT_KEY[format] },
    explainKey: 'c1q.xDecode.' + format, explainParams: { bits, w, answer: v, weight: -(2 ** (w - 1)) },
    meta: { bits, format },
  };
}

/** Khoảng biểu diễn được của w bit. */
function makeRange(rnd) {
  const w = pick([4, 5, 6, 8, 16], rnd);
  const format = pick(['magnitude', 'ones', 'twos'], rnd);
  const { min, max } = range(format, w);
  return {
    kind: 'range', format: 'text',
    textKey: 'c1q.qRange', textParams: { w, format: FMT_KEY[format] },
    answer: [min, max], answerText: `${min} … ${max}`.replace(/-/g, '−'),
    input: { type: 'fields', labels: ['wid.min', 'wid.max'] },
    hintKey: 'c1q.hRange',
    explainKey: format === 'twos' ? 'c1q.xRangeTwos' : 'c1q.xRangeSym',
    explainParams: { w, w1: w - 1, min: String(min).replace('-', '−'), max },
    meta: { w, format },
  };
}

/** Mã hoá số thập phân bằng BCD / Excess-3 / 2421 (§1.7). */
function makeBcd(rnd) {
  const table = pick(['bcd', 'bcd', 'excess3', '2421'], rnd);
  const dec = String(int(10, 999, rnd));
  const groups = encodeDecimal(dec, table);
  const answer = groups.map(g => g.bits).join(' ');
  return {
    kind: 'bcd', format: 'text',
    textKey: 'c1q.qBcd', textParams: { dec, code: CODE_KEY[table] },
    answer, input: { type: 'bits', length: dec.length * 4, group: 4 },
    hintKey: 'c1q.hBcd.' + table,
    explainKey: 'c1q.xBcd', explainParams: { steps: groups.map(g => `${g.digit} → ${g.bits}`).join(' · '), answer },
    meta: { dec, table },
  };
}

/** Gray code (§1.7): binary → Gray hoặc Gray → binary. */
function makeGray(rnd) {
  const n = int(4, 6, rnd);
  const bits = toBits(int(1, 2 ** n - 1, rnd), n);
  const toGray = rnd() < 0.6;
  const answer = toGray ? binToGray(bits) : grayToBin(bits);
  return {
    kind: 'gray', format: 'text',
    textKey: toGray ? 'c1q.qBinToGray' : 'c1q.qGrayToBin', textParams: { bits },
    answer, input: { type: 'bits', length: n },
    hintKey: toGray ? 'c1q.hBinToGray' : 'c1q.hGrayToBin',
    explainKey: toGray ? 'c1q.xBinToGray' : 'c1q.xGrayToBin', explainParams: { bits, answer },
    meta: { bits, toGray },
  };
}

/** Bit parity (§1.9): gắn bit parity vào cuối thông điệp 7 bit. */
function makeParity(rnd) {
  const bits = toBits(int(1, 127, rnd), 7);
  const kind = pick(['even', 'odd'], rnd);
  const answer = withParity(bits, kind);
  const ones = [...bits].filter(b => b === '1').length;
  return {
    kind: 'parity', format: 'text',
    textKey: 'c1q.qParity', textParams: { bits, parity: 'c1q.parity.' + kind },
    answer, input: { type: 'bits', length: 8, group: 7 },
    hintKey: 'c1q.hParity.' + kind,
    explainKey: 'c1q.xParity', explainParams: { ones, parity: 'c1q.parity.' + kind, bit: answer.at(-1), answer },
    meta: { bits, kind },
  };
}

const MAKERS = {
  convert: makeConvert, complement: makeComplement, dimcomplement: makeDimComplement,
  subtract: makeSubtract, signed: makeSigned, decode: makeDecode, range: makeRange,
  bcd: makeBcd, gray: makeGray, parity: makeParity,
};

/** Sinh một câu hỏi; kind = 'mix' thì chọn ngẫu nhiên. */
export function makeQuestion(kind = 'mix', rnd = Math.random) {
  const k = kind === 'mix' ? pick(KINDS, rnd) : kind;
  const make = MAKERS[k];
  if (!make) fail('err.badQuizKind', { kind });
  const q = make(rnd);
  q.work = stepsOf(q);                  // lời giải từng bước — hiện sau mỗi câu, đúng hay sai
  q.formatKey ??= `c1q.f_${k}`;          // khoá dòng hướng dẫn cách trả lời (hiện dưới đề)
  return q;
}

/** Giữ tên cũ cho các chỗ đang dùng: so chuỗi chữ số, bỏ khoảng trắng/đệm 0. */
export const compareAnswer = sameDigits;

/** Chấm đúng/sai (không kèm chẩn đoán). */
function grade(q, given) {
  switch (q.kind) {
    case 'decode': {
      const n = parseNumber(given);
      if (n === null) return { retry: true, detailKey: 'run.needNumber' };
      return { ok: n === q.answer };
    }
    case 'range': {
      const nums = String(given).replace(/[−–]/g, '-').match(/-?\d+/g);
      if (!nums || nums.length !== 2) return { retry: true, detailKey: 'c1q.needTwo' };
      return { ok: Number(nums[0]) === q.answer[0] && Number(nums[1]) === q.answer[1] };
    }
    case 'bcd': case 'gray': case 'parity':
      return { ok: sameBits(given, q.answer) };
    default:
      return { ok: sameDigits(given, q.answer) };
  }
}

/** Chấm một câu. Trả { ok } hoặc { retry, detailKey } khi không đọc được; sai thì kèm chẩn đoán lỗi (ch1-help.js). */
export function checkAnswer(q, given) {
  const r = grade(q, given);
  return r.ok || r.retry ? r : { ...r, ...diagnose(q, given) };
}

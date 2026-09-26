/* ---------------------------------------------------------------
   SINH & CHẤM ĐỀ CHƯƠNG 3 — Rút gọn cấp cổng (Mano §3.2–3.5, §3.8).
   Hàm cho sẵn trên K-map (hình kèm đề); người học viết SOP/POS tối giản.
   Chấm: tương đương trên mọi ô KHÔNG phải don't care, rồi so số literal
   với lời giải tối ưu (Quine–McCluskey). Thuần, không đụng DOM.
   --------------------------------------------------------------- */

import { minimizeSOP, minimizePOS, totalLiterals, varNames, splitValues, implicantToSOP } from './quine-mccluskey.js';
import { mapLayout, mintermPositions } from './kmap-layout.js';
import { exprTruthTable, countLiterals } from './expr-parser.js';
import { randomValues } from './random-function.js';
import { stepsOf } from './steps-ch3.js';
import { fail } from '@shared/logic/app-error.js';
import { pick, int } from '@shared/logic/shuffle.js';
import { parseIntSet, sameSet, parseNumber, setNote } from '@shared/logic/answer-format.js';

export const KINDS = ['sop', 'pos', 'dontcare', 'pis', 'epis', 'cell', 'xor'];

/** Nhóm dạng liền chủ đề — mục Luyện tập hiện theo nhóm cho gọn (D30); nhãn: T(`${prefix}.${id}`). */
export const GROUPS = [
  { id: 'g-min', kinds: ['sop', 'pos', 'dontcare'] },
  { id: 'g-read', kinds: ['cell', 'pis', 'epis', 'xor'] },
];

/** Thời gian chuẩn (giây) để làm một câu mỗi dạng — rút gọn K-map 4 biến mất vài phút. */
export const SECONDS = { sop: 180, pos: 210, dontcare: 180, pis: 120, epis: 120, cell: 20, xor: 45 };

const spec = list => list.join(', ');

/** Chuỗi đề "Σm(…) + d(…)" / "ΠM(…)". */
function specOf(values, pos) {
  const { ones, zeros, dcs } = splitValues(values);
  const main = pos ? `ΠM(${spec(zeros)})` : `Σm(${spec(ones)})`;
  return dcs.length ? `${main} + d(${spec(dcs)})` : main;
}

/** Hàm "đáng rút gọn": có ít nhất 2 ô 1, ít nhất 2 ô 0, lời giải có > 1 term; dạng don't care thì phải có ô d. */
function niceValues(n, withDC, rnd) {
  for (;;) {
    const values = randomValues(n, withDC, rnd);
    const { ones, zeros, dcs } = splitValues(values);
    if (withDC && !dcs.length) continue;
    if (ones.length >= 2 && zeros.length >= 2 && minimizeSOP(values, n).terms.length > 1) return values;
  }
}

function minimize(kind, rnd) {
  const n = pick([3, 4, 4], rnd);
  const withDC = kind === 'dontcare';
  const pos = kind === 'pos';
  const values = niceValues(n, withDC, rnd);
  const best = pos ? minimizePOS(values, n) : minimizeSOP(values, n);
  const lit = totalLiterals(best.terms, n);
  return {
    kind, format: 'text',
    textKey: pos ? 'c3q.qPos' : 'c3q.qSop', textParams: { spec: specOf(values, pos), vars: varNames(n).join(', ') },
    answer: best.expr,
    input: { type: 'kmapGroup', n, values, pos },
    // ví dụ mẫu trong thẻ học: bản đồ đã điền → cuối cùng vẽ các nhóm của lời giải
    exampleFigure: { type: 'kmap', n, values },
    answerFigure: { type: 'kmap', n, values, groups: best.terms.map(t => ({ imp: t.imp, essential: t.essential })) },
    hintKey: pos ? 'c3q.hPos' : withDC ? 'c3q.hDc' : 'c3q.hSop',
    explainKey: 'c3q.xMin',
    explainParams: { terms: best.terms.map(t => t.text + (t.essential ? ' (EPI)' : '')).join(pos ? ' · ' : ' + '), answer: best.expr, lit },
    meta: { n, values, lit, pos },
  };
}

function countPIs(kind, rnd) {
  const n = pick([3, 4], rnd);
  const values = niceValues(n, false, rnd);
  const best = minimizeSOP(values, n);
  const answer = kind === 'pis' ? best.pis.length : best.essential.length;
  return {
    kind, format: 'number',
    textKey: kind === 'pis' ? 'c3q.qPis' : 'c3q.qEpis', textParams: { spec: specOf(values, false) },
    answer,
    figure: { type: 'kmap', n, values },
    hintKey: kind === 'pis' ? 'c3q.hPis' : 'c3q.hEpis',
    explainKey: kind === 'pis' ? 'c3q.xPis' : 'c3q.xEpis',
    explainParams: {
      list: best.pis.map(p => implicantToSOP(p, n)).join(', '),
      ess: best.essential.map(i => implicantToSOP(best.pis[i], n)).join(', ') || '—',
      answer,
    },
    meta: { n, values },
  };
}

/**
 * Ô nào là minterm số mấy — hiểu thứ tự Gray của hàng/cột K-map (§3.2–3.3).
 * Hai chiều: ô đánh dấu → số minterm, hoặc số minterm → bấm đúng ô.
 */
function makeCell(rnd) {
  const n = pick([3, 4, 4], rnd);
  const m = int(0, (1 << n) - 1, rnd);
  const L = mapLayout(n);
  const pos = mintermPositions(L)[m];
  const find = rnd() < 0.5;
  return {
    kind: 'cell', format: 'number',
    textKey: find ? 'c3q.qFindCell' : 'c3q.qCell', textParams: { vars: varNames(n).join(''), m },
    answer: m,
    ...(find ? { input: { type: 'kmapPick', n, single: true }, formatKey: 'c3q.f_cellFind', needsInput: true } : { figure: { type: 'kmap', n, mark: m } }),
    hintKey: 'c3q.hCell',
    explainKey: 'c3q.xCell',
    explainParams: { row: L.rowCodes[pos.r], col: L.colCodes[pos.c], bits: m.toString(2).padStart(n, '0'), answer: m },
    meta: { n, m, find },
    review: 'n' + n,                   // thẻ K-map 3 biến / 4 biến
  };
}

/**
 * Hàm lẻ / chẵn (§3.8): x ⊕ y ⊕ z bằng 1 ở những minterm nào. Mỗi literal có thể mang dấu ′ và cả biểu thức có thể
 * bị bù ngoài; mỗi dấu bù đảo "hàm lẻ" ↔ "hàm chẵn" (3–4 biến × các kiểu dấu ⇒ 48 câu khác nhau).
 */
function makeXor(rnd) {
  const n = pick([3, 4], rnd);
  const names = varNames(n);
  const comps = names.map(() => (rnd() < 0.35 ? 1 : 0));
  const neg = rnd() < 0.4;
  const flips = comps.reduce((a, b) => a + b, 0) + (neg ? 1 : 0);
  const odd = flips % 2 === 0;                                   // số lần đảo chẵn ⇒ vẫn là hàm lẻ
  const list = [...Array(1 << n).keys()].filter(m => (m.toString(2).split('1').length - 1) % 2 === (odd ? 1 : 0));
  const expr = names.map((v, i) => v + (comps[i] ? "'" : '')).join(' ⊕ ');
  return {
    kind: 'xor', format: 'set',
    textKey: neg ? 'c3q.qXnor' : 'c3q.qXor', textParams: { expr },
    answer: list, answerText: `Σm(${spec(list)})`,
    input: { type: 'kmapPick', n },
    answerFigure: { type: 'kmap', n, values: [...Array(1 << n).keys()].map(m => (list.includes(m) ? 1 : 0)) },
    hintKey: 'c3q.hXor',
    explainKey: 'c3q.xXorFlip', explainParams: { flips, kind: odd ? 'c3q.kOdd' : 'c3q.kEven', list: spec(list) },
    meta: { n, comps, neg },
  };
}

const MAKERS = {
  sop: rnd => minimize('sop', rnd), pos: rnd => minimize('pos', rnd), dontcare: rnd => minimize('dontcare', rnd),
  pis: rnd => countPIs('pis', rnd), epis: rnd => countPIs('epis', rnd), cell: makeCell, xor: makeXor,
};

export function makeQuestion(kind = 'mix', rnd = Math.random) {
  const k = kind === 'mix' ? pick(KINDS, rnd) : kind;
  const make = MAKERS[k];
  if (!make) fail('err.badQuizKind', { kind });
  const q = make(rnd);
  q.formatKey ??= `c3q.f_${k}`;
  q.work = stepsOf(q);                  // lời giải từng bước — hiện sau mỗi câu, đúng hay sai          // khoá dòng hướng dẫn cách trả lời (hiện dưới đề)
  return q;
}

export function checkAnswer(q, given) {
  if (q.format === 'number') {
    const v = parseNumber(given);
    if (v === null) return { retry: true, detailKey: 'run.needNumber' };
    return { ok: v === q.answer };
  }
  if (q.format === 'set') {
    const list = parseIntSet(given);
    if (!list) return { retry: true, detailKey: 'run.needList' };
    return sameSet(list, q.answer) ? { ok: true } : { ok: false, ...setNote(list, q.answer) };
  }
  const { n, values, lit } = q.meta;
  let tt;
  try {
    tt = exprTruthTable(String(given), n);
  } catch (e) {
    return { retry: true, detailKey: e.key || 'c2q.parseFail', detailParams: e.params || {} };
  }
  const wrong = values.flatMap((v, m) => (v !== 2 && v !== tt[m] ? [m] : []));
  if (wrong.length) return { ok: false, detailKey: 'c3q.wrongCells', detailParams: { cells: spec(wrong) } };
  const got = countLiterals(given, n);
  if (got > lit) return { ok: false, detailKey: 'c3q.notMinimal', detailParams: { got, lit } };
  return { ok: true };
}

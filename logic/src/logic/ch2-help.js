/* ---------------------------------------------------------------
   CHẨN ĐOÁN ĐÁP ÁN SAI — Chương 2 (thuần, không biết ngôn ngữ).
   Chỉ ra CHỖ SAI cụ thể: cổng nào bạn đã chọn, dòng nào của bảng chân trị lệch,
   minterm nào thiếu/thừa, nhầm minterm ↔ maxterm. Không nhận ra thì trả null.
   --------------------------------------------------------------- */

import { GATE_NAMES, gateBits } from './logic-gates.js';
import { exprTruthTable } from './expr-parser.js';
import { mutantsOf, classicWrong, redundantSops } from './expr-mutate.js';
import { sopTerms } from './nand-conversion.js';
import { varNames } from './quine-mccluskey.js';
import { setNote } from '@shared/logic/answer-format.js';

const note = (detailKey, detailParams = {}) => ({ detailKey, detailParams });

/** Dòng đầu tiên của bảng chân trị mà hai cột khác nhau: "xyz = 101 (m5)". */
export function rowDiff(got, want) {
  const n = Math.log2(want.length);
  const at = [...want].map((w, m) => (Number(w) === Number(got[m]) ? -1 : m)).filter(m => m >= 0);
  if (!at.length) return null;
  const m = at[0];
  return note(at.length === 1 ? 'c2q.dRow' : 'c2q.dRowMore', {
    vars: varNames(n).join(''), inputs: m.toString(2).padStart(n, '0'), m, got: got[m], want: want[m], more: at.length - 1,
  });
}

/** Đáp án sai của câu q → { detailKey, detailParams } hoặc null. `given` đã qua kiểm tra định dạng. */
export function diagnose(q, given, { list, bits, tt, want } = {}) {
  if (q.format === 'choice') {
    const chosen = GATE_NAMES.find(g => g === q.choices[Number(given)]?.label);
    return chosen ? note('c2q.dChose', { gate: chosen, bits: gateBits(chosen, q.meta.n), want: q.meta.bits }) : null;
  }
  if (q.format === 'set') {
    // maxterm là các dòng F = 0: liệt kê các dòng F = 1 (hoặc ngược lại) là nhầm loại
    const all = [...Array(1 << q.meta.n).keys()];
    const flipped = all.filter(m => !q.answer.includes(m));
    if (list.length === flipped.length && list.every((v, i) => v === flipped[i])) return note(q.kind === 'maxterms' ? 'c2q.dSwapMax' : 'c2q.dSwapMin');
    return setNote(list, q.answer);
  }
  if (bits) return rowDiff(bits, q.answer);
  if (tt) return rowDiff(tt, want);
  return null;
}

/* ---------------- phương án nhiễu cho đề trắc nghiệm (shared/logic/mcq.js) ---------------- */
const g4 = bits => String(bits).replace(/\s+/g, '').replace(/(.{4})(?=.)/g, '$1 ');       // 01101001 → 0110 1001
const bitsOf = (expr, n) => exprTruthTable(expr, n).join('');
const setText = (head, list) => `${head}(${list.join(', ')})`;
const ones = tt => tt.flatMap((v, m) => (v === 1 ? [m] : []));
const zeros = tt => tt.flatMap((v, m) => (v === 0 ? [m] : []));
const compl = (list, n) => [...Array(1 << n).keys()].filter(m => !list.includes(m));
const flipAll = bits => [...bits].map(b => (b === '0' ? '1' : '0')).join('');

/** Các đáp án SAI hay gặp nhất của câu q (xếp theo độ phổ biến) + đáp án đúng ở dạng chuỗi. */
export function wrongOf(q, rnd) {
  const m = q.meta;
  switch (q.kind) {
    case 'gate':
      return { correct: g4(q.answer), candidates: [...GATE_NAMES.filter(g => g !== m.gate).map(g => g4(gateBits(g, m.n))), g4(flipAll(q.answer))] };
    case 'column': case 'circuit': {
      const wrong = mutantsOf(m.expr, m.n, rnd, 6).map(e => g4(bitsOf(e, m.n)));     // đọc sai một literal / một cổng
      return { correct: g4(q.answer), candidates: [g4(flipAll(q.answer)), ...wrong] };
    }
    case 'minterms': {
      const mut = mutantsOf(m.expr, m.n, rnd, 6).map(e => setText('Σm', ones(exprTruthTable(e, m.n))));
      return { correct: q.answerText, candidates: [setText('Σm', compl(q.answer, m.n)), ...mut] };   // nhầm F = 0 với F = 1
    }
    case 'maxterms': {
      const mut = mutantsOf(m.expr, m.n, rnd, 6).map(e => setText('ΠM', zeros(exprTruthTable(e, m.n))));
      return { correct: q.answerText, candidates: [setText('ΠM', compl(q.answer, m.n)), ...mut] };
    }
    case 'canon':
      return { correct: q.answerText, candidates: [setText('ΠM', m.list)] };        // chép lại chính danh sách Σm
    case 'complement': {
      const c = classicWrong(m.expr, m.n);
      return { correct: q.answer, candidates: [c.literals, c.same, c.dual, ...mutantsOf(q.answer, m.n, rnd, 6)] };
    }
    case 'dual': {
      const c = classicWrong(m.expr, m.n);
      return { correct: q.answer, candidates: [c.same, c.literals, c.complement, ...mutantsOf(q.answer, m.n, rnd, 6)] };
    }
    case 'simplify':
      // đúng nhưng chưa tối giản (thừa một PI) / sai một bước; cuối cùng mới đến chính dạng chính tắc đề cho
      return { correct: q.answer, candidates: [...redundantSops(q.target.values, m.n, q.answer), ...mutantsOf(q.answer, m.n, rnd, 6), q.target.expr] };
    case 'nand': {
      const t = sopTerms(m.expr, m.n);
      const nd = e => `(${e})'`;
      return {
        correct: q.answer,
        candidates: [t.map(nd).join(' + '),                       // quên NAND ngoài cùng (vẫn còn dấu +)
          nd(t.map(e => `(${e})`).join('')),                      // quên NAND từng term
          nd(t.join(' + ')), ...mutantsOf(q.answer, m.n, rnd, 6)],
      };
    }
    default: return null;
  }
}

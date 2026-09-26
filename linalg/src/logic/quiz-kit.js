/* ---------------------------------------------------------------
   BỘ ĐỒ NGHỀ CHUNG cho ngân hàng câu tự sinh của Đại số tuyến tính (thuần).
   Đáp án của mọi dạng tính toán là một số, một vector hoặc một ma trận ⇒ chấm
   theo GIÁ TRỊ (sai số tol), người học viết "3, -2", "(3; -2)", "√5", "1/2" đều được.
   Mỗi câu tự khai `mistakes`: các đáp án SAI hay gặp kèm lời chẩn đoán —
   vừa để chẩn đoán khi gõ tay, vừa làm phương án nhiễu cho trắc nghiệm.
   --------------------------------------------------------------- */

import { parseNumbers } from './answer-check.js';
import { fmt, fmtVec, clean } from './num-format.js';
import { fail } from '@shared/logic/app-error.js';
import { pick } from '@shared/logic/shuffle.js';
import { solve } from './linear-system.js';

export { pick, int } from '@shared/logic/shuffle.js';

export const isMat = a => Array.isArray(a) && Array.isArray(a[0]);
export const fmtMat = M => '[' + M.map(r => r.map(x => fmt(x)).join(' ')).join('; ') + ']';
/** Số / vector / ma trận → chuỗi đáp án (cũng là chuỗi phương án trắc nghiệm). */
export const show = a => (isMat(a) ? fmtMat(a) : Array.isArray(a) ? fmtVec(a) : fmt(a));
const flat = a => (isMat(a) ? a.flat() : Array.isArray(a) ? a : [a]);
const same = (a, b, tol) => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) <= tol);

/** Một đáp án sai hay gặp: giá trị + khoá lời chẩn đoán. */
export const mistake = (value, key, params = {}) => ({ value, key, params });

/** Chấm câu tính toán: { ok } | { retry, detailKey } | sai kèm chẩn đoán. */
export function gradeValue(q, given) {
  const want = flat(q.answer);
  const got = parseNumbers(given);
  if (!got) return { retry: true, detailKey: 'la.needNums' };
  if (got.length !== want.length) return { retry: true, detailKey: 'la.needCount', detailParams: { n: want.length, got: got.length } };
  const tol = q.tol ?? 1e-6;
  if (same(got, want, tol)) return { ok: true };
  for (const m of q.mistakes || []) {
    if (same(got, flat(m.value), tol)) return { ok: false, detailKey: m.key, detailParams: m.params };
  }
  // không khớp lỗi nào quen: chỉ ra ô sai đầu tiên
  const bad = want.map((x, i) => (Math.abs(x - got[i]) <= tol ? -1 : i)).filter(i => i >= 0);
  if (want.length === 1) return { ok: false, detailKey: 'la.dValue', detailParams: { got: fmt(got[0]) } };
  const i = bad[0];
  const cols = isMat(q.answer) ? q.answer[0].length : 0;
  const pos = cols ? `(${Math.floor(i / cols) + 1}, ${(i % cols) + 1})` : String(i + 1);
  return {
    ok: false, detailKey: bad.length > 1 ? 'la.dEntryMore' : 'la.dEntry',
    detailParams: { pos, got: fmt(got[i]), want: fmt(want[i]), more: bad.length - 1 },
  };
}

/** Câu chọn (loại nghiệm, độc lập?…): sai thì nhắc lại lý do cốt lõi (q.why). */
export function gradeChoice(q, given) {
  if (String(given).trim() === '') return { retry: true, detailKey: 'run.empty' };
  if (Number(given) === q.answer) return { ok: true };
  return { ok: false, detailKey: q.why?.key, detailParams: q.why?.params };
}

export const checkAnswer = (q, given) => (q.format === 'choice' ? gradeChoice(q, given) : gradeValue(q, given));

/** Nhiễu dự phòng theo hình dạng đáp án: đổi dấu một ô, lệch ±1 một ô. */
function nearby(answer, rnd) {
  const out = [];
  const edit = (i, f) => {
    const v = flat(answer).slice();
    v[i] = clean(f(v[i]));
    if (!isMat(answer)) return Array.isArray(answer) ? v : v[0];
    const c = answer[0].length;
    return answer.map((r, k) => v.slice(k * c, k * c + c));
  };
  const n = flat(answer).length;
  const order = [...Array(n).keys()].sort(() => rnd() - 0.5);
  for (const i of order) {
    if (flat(answer)[i] !== 0) out.push(edit(i, x => -x));
    out.push(edit(i, x => x + pick([1, -1], rnd)));
  }
  return out;
}

/** Cho mcqBank: đáp án đúng + nhiễu (lỗi thật trước, nhiễu dự phòng sau). */
export function wrongOf(q, rnd) {
  if (q.format === 'choice') return null;
  return {
    correct: show(q.answer),
    candidates: [...(q.mistakes || []).map(m => show(m.value)), ...nearby(q.answer, rnd).map(show)],
  };
}

/** makeQuestion chung: chọn dạng, gắn khoá dòng hướng dẫn và chuỗi đáp án. */
export function makeWith(MAKERS, KINDS, prefix) {
  return (kind = 'mix', rnd = Math.random) => {
    const k = kind === 'mix' ? pick(KINDS, rnd) : kind;
    const make = MAKERS[k];
    if (!make) fail('err.badQuizKind', { kind });
    const q = make(rnd);
    q.kind = k;
    q.format ??= Array.isArray(q.answer) ? 'vector' : 'number';
    q.formatKey ??= q.format === 'choice' ? 'run.fChoice' : `${prefix}.f_${k}`;
    if (q.format === 'choice') q.formatParams ??= { n: q.choices.length };
    if (q.format !== 'choice') q.answerText ??= show(q.answer);
    return q;
  };
}

/* ---------- số học nhỏ dùng khi sinh đề ---------- */
export const dotv = (a, b) => clean(a.reduce((s, x, i) => s + x * b[i], 0));
export const sum = a => a.reduce((s, x) => s + x, 0);
export const P = x => (x < 0 ? `(${fmt(x)})` : fmt(x));          // số trong tích: âm thì có ngoặc
export const matMul = (A, B) => A.map(r => B[0].map((_, j) => clean(r.reduce((s, x, k) => s + x * B[k][j], 0))));
export const transpose = A => A[0].map((_, j) => A.map(r => r[j]));
export const col = (A, j) => A.map(r => r[j]);

/** [A | b] → "[1 2 | 3; 0 1 | 4]". */
export const fmtAug = M => '[' + M.map(r => r.slice(0, -1).map(x => fmt(x)).join(' ') + ' | ' + fmt(r.at(-1))).join('; ') + ']';

/** Các dòng khử Gauss–Jordan của [A | b]: "R2 ← R2 − 2R1:  [..]" — cho lời giải từng bước. */
export function elimLines(A, b) {
  const r = solve(A, b);
  const op = s => s.formula.replace('<->', '↔').replace('<-', '←');
  return [
    fmtAug(r.start),
    ...[...r.forwardSteps, ...r.backwardSteps].filter(s => s.formula).map(s => `${op(s)}:   ${fmtAug(s.matrix)}`),
  ];
}

/* Mẫu "Đề như thật" của Discrete (phỏng đoán theo mô tả của người học, chưa có đề thật): 3 câu, 7 ý, 200 điểm, 60 phút. Cả đề chỉ có 2 gợi ý nhỏ: "Each part may use the previous ones" (câu 2) và "by induction" (câu 3, nêu phương pháp). */
import { shuffle } from '@shared/logic/shuffle.js';
import { DEFINITIONS, LEMMAS, FERMAT, RSA, TREE_CLAIMS } from './mock-proofs.js';

const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

function makeDefinitions(rnd) {
  const defs = shuffle([...DEFINITIONS], rnd).slice(0, 3);
  const seen = new Set();
  return {
    stem: 'Definitions. State each definition precisely (quantifiers and the conditions under which it is defined). Examples alone earn nothing.',
    parts: defs.map(d => ({ pts: 10, q: d.q, a: d.a, facts: { id: d.id } })),
    refs: defs.map(d => d.ref).filter(x => !seen.has(x[0]) && seen.add(x[0])),
  };
}

function makeNumberTheory(rnd) {
  const lemma = pick(LEMMAS, rnd);
  return {
    stem: 'Number theory proofs. Each part may use the previous ones.',
    parts: [{ pts: 30, q: lemma.q, a: lemma.a, facts: { id: lemma.id } }, { pts: 40, q: FERMAT.q, a: FERMAT.a, facts: {} }, { pts: 40, q: RSA.q, a: RSA.a, facts: {} }],
  };
}

function makeTreeInduction(rnd) {
  const c = pick(TREE_CLAIMS, rnd);
  return { stem: 'Induction on trees.', parts: [{ pts: 60, q: c.q, a: c.a, facts: { id: c.id } }] };
}

// Số mục theo MCS (MIT 6.042J, 2017), như các chương khác của app. Câu 1 tự lấy mục theo khái niệm được chọn.
export const DISCRETE_MOCK = {
  id: 'discrete', title: 'Discrete Math — Practice Exam',
  book: 'Lehman, Leighton, Meyer, Mathematics for Computer Science (MIT 6.042J, 2017 ed.)',
  minutesPerPoint: 60 / 200,
  makers: [makeDefinitions, makeNumberTheory, makeTreeInduction],
  refs: [null,
    [['9.9', 'Multiplicative inverses and cancelling'], ['9.10', "Euler's theorem"], ['9.11', 'RSA public key encryption']],
    [['5.1', 'Ordinary induction'], ['12', 'Simple graphs (forests and trees)']]],
};

import * as ch1 from './ch1-quiz.js';
import * as ch2 from './ch2-quiz.js';
import * as ch3 from './ch3-quiz.js';
import * as ch4 from './ch4-quiz.js';
import { CHOICE_BANKS } from './mcq-banks.js';
import { withConcepts } from '@shared/logic/concepts.js';
import concepts from '../content/concepts.json';

/* ---------------------------------------------------------------
   BẢNG CHƯƠNG → NGÂN HÀNG CÂU (thuần). main.js, test và script tái hiện câu (scripts/show-question.js) dùng chung
   một bảng ⇒ mã câu luôn sinh lại đúng câu người học đã thấy (hub D33). Câu khái niệm đã duyệt (D27) thành thêm
   một dạng "Khái niệm" ở chương có câu.
   --------------------------------------------------------------- */

const withCq = (bank, id) => withConcepts(bank, concepts.filter(c => c.chapter === id));
export const CHAPTERS = [ch1, ch2, ch3, ch4].map((bank, i) => {
  const id = `ch${i + 1}`, prefix = `c${i + 1}q`;
  return { id, prefix, bank: withCq(bank, id), choiceBank: withCq(CHOICE_BANKS[prefix], id) };
});

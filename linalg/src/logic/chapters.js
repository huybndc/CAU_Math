import * as ch1 from './ch1-quiz.js';
import * as ch2 from './ch2-quiz.js';
import * as ch3 from './ch3-quiz.js';
import { CHOICE_BANKS } from './mcq-banks.js';
import { withConcepts } from '@shared/logic/concepts.js';
import concepts from '../content/concepts.json';

/* ---------------------------------------------------------------
   BẢNG CHƯƠNG → NGÂN HÀNG CÂU (thuần). main.js, test và script tái hiện câu (scripts/show-question.js) dùng chung
   một bảng ⇒ mã câu luôn sinh lại đúng câu người học đã thấy (hub D33).
   --------------------------------------------------------------- */

// câu khái niệm lấy từ đề/bài có lời giải (math D48) thành thêm một dạng ở cả bản tự luận lẫn trắc nghiệm
const withCq = (bank, id) => withConcepts(bank, concepts.filter(c => c.chapter === id));
export const CHAPTERS = [ch1, ch2, ch3].map((bank, i) => ({
  id: `ch${i + 1}`, prefix: `c${i + 1}q`, bank: withCq(bank, `ch${i + 1}`), choiceBank: withCq(CHOICE_BANKS[`c${i + 1}q`], `ch${i + 1}`),
}));

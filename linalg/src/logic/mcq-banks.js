/* Ngân hàng TRẮC NGHIỆM của Đại số tuyến tính: bọc ngân hàng tự luận từng chương bằng
   các "lỗi hay gặp" mà mỗi câu tự khai (quiz-kit.js wrongOf) — xem shared/logic/mcq.js. */

import { mcqBank } from '@shared/logic/mcq.js';
import { wrongOf } from './quiz-kit.js';
import * as ch1 from './ch1-quiz.js';
import * as ch2 from './ch2-quiz.js';
import * as ch3 from './ch3-quiz.js';

export const CHOICE_BANKS = {
  c1q: mcqBank(ch1, { wrongOf }),
  c2q: mcqBank(ch2, { wrongOf }),
  c3q: mcqBank(ch3, { wrongOf }),
};

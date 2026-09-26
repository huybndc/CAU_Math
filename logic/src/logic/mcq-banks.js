/* Ngân hàng TRẮC NGHIỆM của Logic Circuit: bọc ngân hàng tự luận từng chương bằng danh sách
   đáp án sai hay gặp của chương đó (chN-help.js) — xem shared/logic/mcq.js. */

import { mcqBank } from '@shared/logic/mcq.js';
import * as ch1 from './ch1-quiz.js';
import * as ch2 from './ch2-quiz.js';
import * as ch3 from './ch3-quiz.js';
import * as ch4 from './ch4-quiz.js';
import { wrongOf as wrong1 } from './ch1-help.js';
import { wrongOf as wrong2 } from './ch2-help.js';
import { wrongOf as wrong3 } from './ch3-help.js';
import { wrongOf as wrong4 } from './ch4-help.js';

/** Đề tự luận nói "khoanh / điền / bấm" — bản trắc nghiệm dùng đề riêng. */
const TEXT = {
  'c2q.qGate': 'c2q.mGate', 'c2q.qColumn': 'c2q.mColumn', 'c2q.qCircuit': 'c2q.mCircuit',
  'c3q.qSop': 'c3q.mSop', 'c3q.qPos': 'c3q.mPos', 'c3q.qXor': 'c3q.mXor', 'c3q.qXnor': 'c3q.mXnor',
};

export const CHOICE_BANKS = {
  c1q: mcqBank(ch1, { wrongOf: wrong1, textKeys: TEXT }),
  c2q: mcqBank(ch2, { wrongOf: wrong2, textKeys: TEXT }),
  c3q: mcqBank(ch3, { wrongOf: wrong3, textKeys: TEXT }),
  c4q: mcqBank(ch4, { wrongOf: wrong4, textKeys: TEXT }),
};

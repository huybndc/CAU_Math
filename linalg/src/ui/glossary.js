import { t as T, getLang } from '../i18n/index.js';
import { splitCards } from '@shared/logic/cards.js';
import { seekLesson } from '@shared/ui/lesson.js';
import theoryCh1Vi from '../content/theory-ch1.vi.md?raw';
import theoryCh1En from '../content/theory-ch1.en.md?raw';
import theoryCh2Vi from '../content/theory-ch2.vi.md?raw';
import theoryCh2En from '../content/theory-ch2.en.md?raw';
import theoryCh3Vi from '../content/theory-ch3.vi.md?raw';
import theoryCh3En from '../content/theory-ch3.en.md?raw';

/* ---------------------------------------------------------------
   TỪ ĐIỂN THUẬT NGỮ của các máy giải. Mỗi mục: khoá `gl.<id>` = các cách viết cách nhau '|', `gl.<id>.d` = định nghĩa một câu,
   và (tuỳ chọn) thẻ bài học để mở: ch + mẫu tiêu đề thẻ trong theory-*.md. Dùng với shared/ui/terms.js.
   --------------------------------------------------------------- */

const THEORY = { vi: { ch1: theoryCh1Vi, ch2: theoryCh2Vi, ch3: theoryCh3Vi }, en: { ch1: theoryCh1En, ch2: theoryCh2En, ch3: theoryCh3En } };

const ENTRIES = [
  ['rank', 'ch2', /trụ|pivot/i], ['pivot', 'ch2', /trụ|pivot/i], ['free', 'ch2', /trụ|pivot/i],
  ['indep', 'ch3', /độc lập|independen/i], ['dot', 'ch1', /vô hướng|dot/i], ['proj', 'ch1', /vô hướng|dot/i],
  ['orth', 'ch1', /góc|angle/i], ['combo', 'ch1', /tổ hợp|combination/i],
  ['colsp', 'ch3', /column space/i], ['nullsp', 'ch3', /null space/i], ['basis', 'ch3', /cơ sở|basis/i],
  ['elem'], ['lu'], ['inv'], ['gj'], ['mult'], ['det'],
];

function lessonLink(ch, titleRe) {
  const md = THEORY[getLang()]?.[ch];
  if (!md) return null;
  const i = splitCards(md).cards.findIndex(c => titleRe.test(c.title));
  return i < 0 ? null : { href: `#/learn/${ch}/theory`, title: splitCards(md).cards[i].title, open: () => seekLesson(ch, i) };
}

/** Các mục thuật ngữ theo ngôn ngữ hiện tại (gọi lại mỗi lần vẽ để đổi VI/EN đúng). */
export const glossary = () => ENTRIES.map(([id, ch, re]) => ({
  words: T('gl.' + id).split('|'), def: T(`gl.${id}.d`), link: ch ? lessonLink(ch, re) : null,
}));

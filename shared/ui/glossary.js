import { splitCards } from '../logic/cards.js';
import { seekLesson } from './lesson.js';
import { t as T, getLang } from '../i18n/index.js';

/* ---------------------------------------------------------------
   TỪ ĐIỂN THUẬT NGỮ dựng từ danh sách mục + bài học của app. Mỗi mục [id, ch?, mẫu tiêu đề thẻ?]: khoá `gl.<id>` = các cách viết
   cách nhau '|', `gl.<id>.d` = định nghĩa một câu; có ch + mẫu ⇒ kèm link mở đúng thẻ bài học. Dùng với shared/ui/terms.js.
   theory = { vi: { ch1: md, … }, en: { … } }.
   --------------------------------------------------------------- */
export function makeGlossary(entries, theory) {
  const lessonLink = (ch, re) => {
    const md = theory[getLang()]?.[ch];
    if (!md) return null;
    const cards = splitCards(md).cards, i = cards.findIndex(c => re.test(c.title));
    return i < 0 ? null : { href: `#/learn/${ch}/theory`, title: cards[i].title, open: () => seekLesson(ch, i) };
  };
  /** Các mục theo ngôn ngữ hiện tại (gọi lại mỗi lần vẽ để đổi VI/EN đúng). */
  return () => entries.map(([id, ch, re]) => ({ words: T('gl.' + id).split('|'), def: T(`gl.${id}.d`), link: ch ? lessonLink(ch, re) : null }));
}

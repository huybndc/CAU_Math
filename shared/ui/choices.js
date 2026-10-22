import { el } from './dom.js';
import { t as T } from '../i18n/index.js';
import { studiedChapters } from '../logic/progress.js';

/* ---------------------------------------------------------------
   KHỐI DÙNG CHUNG cho Tổng quan / Học / Đề như thật / Tự luận (D19):
   danh sách kẻ dòng thay lưới thẻ; mỗi dòng nói trước giá phải trả
   (~phút, % đúng) như toeic R1, nhưng gọn thành cột số bên phải.
   --------------------------------------------------------------- */

export const chNo = id => id.replace('ch', '');
export const chapterTitle = id => `${T('shell.chapter', { n: chNo(id) })} · ${T('nav.' + id)}`;

/** Chương người học đã học (đã làm câu), mới nhất trước — không đoán theo syllabus (D43). */
export const studied = (cfg, events) => studiedChapters(cfg.chapters, events);

/** Một dòng bấm được: tên (+ nhãn) · cột số · cột % · mũi tên. */
export const row = ({ href, title, sub, num, acc, tag }) => el('a', { class: 'entry', href }, [
  el('span', { class: 'row-main' }, [el('b', {}, [title, tag]), sub && el('small', { text: sub })]),
  el('span', { class: 'row-num', text: num ?? '' }),
  acc ?? el('span'),
  el('span', { class: 'row-go', 'aria-hidden': 'true' }),
]);

export const tag = (text, kind = 'hi') => el('span', { class: `tag ${kind}`, text });

/**
 * Khối "việc chính": một dòng tiêu đề + ghi chú + nút màu nhấn; `alt` là lựa chọn thứ hai
 * viết thành một dòng chữ (không thêm hộp nữa).
 */
export const leadCard = ({ title, note, href, cta, alt }) => el('div', {
  class: 'lead-card',
  onClick: e => { if (!e.target.closest('a')) location.hash = href; },       // bấm chỗ nào trên khung cũng đi; link nhỏ bên trong vẫn bấm riêng
}, [
  el('div', { class: 'lead-main' }, [el('b', { text: title }), el('small', { text: note }), alt]),
  el('a', { class: 'btn primary', href, 'data-icon': 'next' }, el('span', { text: cta })),
]);

/** Các thẻ đầu mục "Đề thi": Đề như thật | Tự luận. */
export const practiceTabs = active => el('nav', { class: 'page-tabs', 'aria-label': T('nav.mock') }, [
  el('a', { href: '#/mock', 'aria-current': active === 'mock' ? 'page' : null, text: T('nav.mock') }),
  el('a', { href: '#/free', 'aria-current': active === 'free' ? 'page' : null, text: T('practice.tabFree') }),
]);

import { getLang } from '../i18n/index.js';

/* ---------------------------------------------------------------
   TRỢ GIÚP THEO MÀN HÌNH: nút ? (hoặc phím ?) mở thẻ nhỏ chỉ nói về màn đang xem — không có trang hướng dẫn riêng,
   không phải cuộn (tối đa ~6 dòng). Thêm màn/tính năng mới ⇒ thêm một dòng vào HELP, cả vi và en.
   Dòng: [nhãn, giải thích, 'warn' nếu là chỗ hay gặp sự cố]
   --------------------------------------------------------------- */

export const HELP = {
  mock: {
    vi: { title: 'Đề thi thử', rows: [
      ['Mã đề', 'Mỗi mã sinh đúng một đề. Đề và đáp án dùng chung mã, nên in lúc nào cũng khớp.'],
      ['In đề · In đáp án', 'Mở hộp thoại in của trình duyệt (chọn A4, in hai mặt, hoặc Lưu thành PDF). Đề chừa chỗ viết theo điểm.'],
      ['Nguồn', 'Mỗi câu ghi chương và mục trong sách để tìm lại mà làm thêm. Số mục theo bản 4th.'],
      ['Thời gian', 'Số phút gợi ý theo tỉ lệ đề thật (0,6 phút mỗi điểm), in trên đầu đề. Tự bấm giờ và tự chấm bằng đáp án.'],
    ] },
    en: { title: 'Exam practice', rows: [
      ['Exam code', 'Each code makes exactly one exam. The exam and its answer key share the code, so they always match.'],
      ['Print exam · Print key', 'Opens the browser print dialog (A4, two-sided, or Save as PDF). Writing space follows the points.'],
      ['Source', 'Each question names the book chapter and section so you can find more to practise. Section numbers follow the 4th edition.'],
      ['Time', 'Suggested minutes follow the real exam rate (0.6 min per point), printed in the header. Time yourself and mark with the answer key.'],
    ] },
  },
  home: {
    vi: { title: 'Tổng quan', rows: [
      ['Hôm nay', 'Bài gợi ý cho bạn lúc này. Bấm Bắt đầu để làm ngay.'],
      ['Học · Đề thi', 'Cột bên phải: học tiếp thẻ kế, công cụ, đề thi thử, tự luận.'],
      ['Study Hub · Live Lecture', 'Cuối menu bên trái: link sang hai app kia.'],
      ['Ctrl K', 'Tìm nhanh trong app (gõ không dấu cũng được), Enter mở đúng bài.'],
      ['Nháp', 'Nút nổi góc dưới phải, mở ở mọi màn: ghi chú, máy tính, bảng chân trị, bìa K, vẽ.'],
      ['Đám mây', 'Bản online không đồng bộ giữa các máy; dữ liệu lưu trong trình duyệt này.'],
    ] },
    en: { title: 'Overview', rows: [
      ['Today', 'The suggested task right now. Press Start to do it now.'],
      ['Learn · Exams', 'Right column: next lesson card, tools, exam practice, free-response.'],
      ['Study Hub · Live Lecture', 'Bottom of the left menu: links to the other two apps.'],
      ['Ctrl K', 'Quick search in the app; press Enter to open the result.'],
      ['Scratch', 'Floating button at the bottom right on every screen: notes, calculator, truth table, K-map, draw.'],
      ['Cloud', 'The online version does not sync between devices; data stays in this browser.'],
    ] },
  },
  learn: {
    vi: { title: 'Học', rows: [
      ['Chương', 'Mở một chương để xem các thẻ bài học theo thứ tự.'],
      ['Chấm xanh', 'Điểm kiến thức đã nắm (đúng liên tiếp đủ số lần khi luyện).'],
      ['Học tiếp', 'Thẻ được gợi ý tiếp theo trong chương.'],
      ['Lỗi thường gặp', 'Cuối mỗi chương: những chỗ hay nhầm, nên đọc trước khi luyện.'],
    ] },
    en: { title: 'Learn', rows: [
      ['Chapter', 'Open a chapter to see its lesson cards in order.'],
      ['Green dot', 'A knowledge point you have mastered (enough correct answers in a row while practising).'],
      ['Learn next', 'The suggested next card in the chapter.'],
      ['Common mistakes', 'At the end of each chapter: where people slip. Read it before practising.'],
    ] },
  },
  lesson: {
    vi: { title: 'Thẻ bài học', rows: [
      ['Đọc rồi luyện', 'Cuối thẻ có nút mở đúng máy giải hoặc dạng bài liên quan.'],
      ['Nháp', 'Tính tay ở nút Nháp (góc dưới phải) thay giấy nháp.'],
    ] },
    en: { title: 'Lesson card', rows: [
      ['Read, then practise', 'The end of a card has a button to the matching solver or question type.'],
      ['Scratch', 'Work things out in Scratch (bottom right) instead of on paper.'],
    ] },
  },
  tools: {
    vi: { title: 'Công cụ', rows: [
      ['Máy giải', 'Chọn máy theo chương, nhập đề, xem lời giải từng bước. Ô nhập được nhớ khi tải lại.'],
      ['Đáp án của bạn', 'Ô này chấm đúng/sai; Gợi ý mở dần, rồi mới Hiện đáp án.'],
      ['Sao chép lời giải', 'Có nút sao chép ở cuối lời giải.'],
      ['Thao tác trực quan', 'Một số công cụ cho kéo, bấm trực tiếp (bảng chân trị, K-map, mạch).'],
    ] },
    en: { title: 'Tools', rows: [
      ['Solvers', 'Pick a solver by chapter, enter the problem, read the step-by-step solution. Inputs are remembered on reload.'],
      ['Your answer', 'This box checks right/wrong; hints open gradually, then Show answer.'],
      ['Copy solution', 'There is a copy button at the end of the solution.'],
      ['Hands-on', 'Some tools let you drag and click directly (truth table, K-map, circuits).'],
    ] },
  },
  free: {
    vi: { title: 'Tự luận', rows: [
      ['Đề → lời giải', 'Làm nháp trước, mở gợi ý nếu kẹt, rồi bấm hiện lời giải từng bước để đối chiếu.'],
    ] },
    en: { title: 'Free response', rows: [
      ['Problem → solution', 'Work it out first, open a hint if stuck, then reveal the step-by-step solution to compare.'],
    ] },
  },
};

/** Màn nào của route nào có thẻ trợ giúp. */
export function helpKey(r) {
  if (!r) return null;
  if (r.view === 'learn' && r.ch) return 'lesson';
  return r.view in HELP ? r.view : null;
}

export function setupScreenHelp() {
  const mk = (tag, cls, text) => Object.assign(document.createElement(tag), { className: cls, ...(text != null && { textContent: text }) });
  const box = Object.assign(mk('div', 'helpbox'), { hidden: true });
  box.setAttribute('role', 'dialog');
  const btn = Object.assign(mk('button', 'helpbtn', '?'), { type: 'button', hidden: true });
  btn.setAttribute('aria-expanded', 'false');
  document.body.append(btn, box);
  let key = null;
  const close = () => { box.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  const labels = () => (getLang() === 'en' ? ['Help', 'Help (key ?)'] : ['Trợ giúp', 'Trợ giúp (phím ?)']);
  const open = () => {
    const h = key && (HELP[key][getLang()] ?? HELP[key].vi);
    if (!h) return;
    box.setAttribute('aria-label', labels()[0]);
    box.replaceChildren(mk('h3', '', h.title), ...h.rows.map(([k, t, kind]) => {
      const row = mk('div', `hrow ${kind ?? ''}`);
      row.append(mk('span', 'hk', k), mk('span', '', t));
      return row;
    }));
    box.hidden = false; btn.setAttribute('aria-expanded', 'true');
  };
  const toggle = () => (box.hidden ? open() : close());
  btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  document.addEventListener('click', e => { if (!box.hidden && !box.contains(e.target)) close(); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    else if (e.key === '?' && !e.target.closest?.('input, textarea, select, [contenteditable]')) { e.preventDefault(); toggle(); }
  });
  return {
    set(route) {
      key = helpKey(route);
      close();
      btn.hidden = !key;
      const [aria, title] = labels();
      btn.setAttribute('aria-label', aria); btn.title = title;
    },
  };
}

import { getLang } from '../i18n/index.js';

/* ---------------------------------------------------------------
   TRỢ GIÚP THEO MÀN HÌNH: nút ? (hoặc phím ?) mở thẻ nhỏ chỉ nói về màn đang xem — không có trang hướng dẫn riêng,
   không phải cuộn (tối đa ~6 dòng). Thêm màn/tính năng mới ⇒ thêm một dòng vào HELP, cả vi và en.
   Dòng: [nhãn, giải thích, 'warn' nếu là chỗ hay gặp sự cố]
   --------------------------------------------------------------- */

export const HELP = {
  home: {
    vi: { title: 'Tổng quan', rows: [
      ['Hôm nay', 'Bài gợi ý cho bạn lúc này. Bấm Bắt đầu để làm ngay.'],
      ['7 ngày', 'Số phút học, % đúng và số câu trong 7 ngày gần nhất, tính cả máy khác; cùng số với Thống kê ở Study Hub.'],
      ['Theo chương', 'Bấm một chương để vào luyện đúng chương đó; danh sách dài thì cuộn trong khung.'],
      ['Học · Luyện tập', 'Cột bên phải: học tiếp thẻ kế, công cụ, luyện theo dạng, tự luận, thi thử. Ô chọn cuối cột: bạn đồng hành giải trí (mèo, giọt nước, rô-bốt; mặc định tắt).'],
      ['Ctrl K', 'Tìm nhanh trong app (gõ không dấu cũng được), Enter mở đúng bài.'],
      ['Nháp', 'Nút nổi góc dưới phải, mở ở mọi màn: ghi chú, máy tính, bảng chân trị, bìa K, vẽ.'],
      ['Đám mây', 'Trạng thái đồng bộ tiến độ với Study Hub. Số khác Hub thì chờ vài giây rồi tải lại.', 'warn'],
    ] },
    en: { title: 'Overview', rows: [
      ['Today', 'The suggested task right now. Press Start to do it now.'],
      ['7 days', 'Minutes studied, % correct and questions in the last 7 days, including other devices; same numbers as Study Hub stats.'],
      ['By chapter', 'Open a chapter to practise exactly that chapter; a long list scrolls inside its frame.'],
      ['Learn · Practice', 'Right column: next lesson card, tools, practice by type, free-response, mock exam. The last dropdown picks a decorative companion (cat, blob, robot; off by default).'],
      ['Ctrl K', 'Quick search in the app; press Enter to open the result.'],
      ['Scratch', 'Floating button at the bottom right on every screen: notes, calculator, truth table, K-map, draw.'],
      ['Cloud', 'Progress sync status with Study Hub. If numbers differ from the Hub, wait a few seconds and reload.', 'warn'],
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
  practice: {
    vi: { title: 'Luyện tập', rows: [
      ['Theo dạng', 'Luyện một dạng bài. Mỗi dạng ghi % đúng (mọi lần) và thời gian ước tính.'],
      ['Tự luận / Trắc nghiệm', 'Tự luận: xem lời giải rồi tự đánh giá. Trắc nghiệm: chọn đáp án, chấm ngay.'],
      ['Trộn cả chương', 'Mười câu lẫn các dạng của chương.'],
      ['Bài dài 60–90 phút', 'Một lượt luyện dài liên tục (khác với từng dạng ngắn).'],
      ['Nhắc nhở', 'Dạng ghi "cần nhất" là dạng bạn đang sai nhiều.'],
    ] },
    en: { title: 'Practice', rows: [
      ['By type', 'Practise one question type. Each shows % correct (all time) and estimated time.'],
      ['Free response / MCQ', 'Free response: read the solution and rate yourself. MCQ: pick an answer, graded at once.'],
      ['Mix a chapter', 'Ten questions mixing the chapter\'s types.'],
      ['Long 60–90 min', 'One long continuous practice run (unlike the short per-type rounds).'],
      ['Hint', 'A type marked "most needed" is where you are missing most.'],
    ] },
  },
  run: {
    vi: { title: 'Làm bài', rows: [
      ['Kiểm tra', 'Điền đáp án rồi bấm Kiểm tra. Điền thiếu ô thì các ô đã điền vẫn được giữ.'],
      ['Gợi ý', 'Mở dần từng gợi ý trước khi xem đáp án.'],
      ['Xem đáp án', 'Tính là chưa làm đúng câu này.', 'warn'],
      ['Đúng liên tiếp', 'Đúng liên tiếp đủ số lần thì điểm kiến thức được tính là đã nắm (chấm xanh ở tab Học).'],
      ['Mã câu', 'Bấm để sao chép; gửi kèm khi báo câu sai để tái hiện đúng câu đó.'],
      ['Hết lượt', 'Xem kết quả rồi Luyện lại dạng còn sai hoặc Làm lại các câu sai.'],
    ] },
    en: { title: 'Question', rows: [
      ['Check', 'Fill in the answer and press Check. If a field is missing, the filled ones are kept.'],
      ['Hint', 'Open hints gradually before looking at the answer.'],
      ['Show answer', 'Counts as not having answered this question correctly.', 'warn'],
      ['Streak', 'Enough correct answers in a row marks the knowledge point as mastered (green dot in Learn).'],
      ['Question code', 'Click to copy; send it when reporting a wrong question so it can be reproduced.'],
      ['End of round', 'See the result, then practise the weak type again or redo the wrong questions.'],
    ] },
  },
  free: {
    vi: { title: 'Tự luận', rows: [
      ['Đề → lời giải', 'Làm nháp trước, bấm hiện lời giải, rồi tự đánh giá đúng/sai.'],
      ['Lưu', 'Kết quả tự đánh giá lưu theo môn trên máy này (không đổi số liệu Thống kê).'],
    ] },
    en: { title: 'Free response', rows: [
      ['Problem → solution', 'Work it out first, reveal the solution, then rate yourself.'],
      ['Saved', 'Your self-rating is saved per course on this device (it does not change the stats).'],
    ] },
  },
  exam: {
    vi: { title: 'Thi thử', rows: [
      ['Điểm cả đề', 'Điểm tính trên cả đề. Câu bỏ trống không ghi vào lịch sử luyện (nên % luyện tập khác điểm đề).'],
      ['Tập trung', 'Khi đang thi, menu ẩn đi để bạn không bị phân tâm.'],
    ] },
    en: { title: 'Mock exam', rows: [
      ['Whole-exam score', 'The score is over the whole exam. Blank answers are not recorded in practice history (so practice % differs from the exam score).'],
      ['Focus', 'While you take the exam the menu is hidden to avoid distraction.'],
    ] },
  },
};

/** Màn nào của route nào có thẻ trợ giúp. */
export function helpKey(r) {
  if (!r) return null;
  if (r.view === 'practice' && r.kind) return 'run';
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

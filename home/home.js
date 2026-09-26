import { SUBJECTS, WEEKS, EXAM_WEEKS, weekOf, daysToMidterm } from '@shared/logic/syllabus.js';
import { statsOf, DAY } from '@shared/logic/progress.js';
import { loadEvents } from '@shared/ui/store.js';
import { setupTheme } from '@shared/ui/shell.js';
import { startSync } from '@shared/ui/sync.js';

/* ---------------------------------------------------------------
   TỔNG QUAN CẢ BA MÔN: học kỳ đang ở tuần nào, còn bao lâu tới giữa kỳ,
   và 7 ngày qua mỗi môn làm được bao nhiêu (đọc nhật ký `progress:<môn>` của
   từng app — cùng một origin nên đọc chung được). Không ghi "tuần này học gì"
   theo syllabus: giảng viên dạy khác thứ tự (D43) — màn Học của app tự mở chương đang học.
   --------------------------------------------------------------- */

const $ = sel => document.querySelector(sel);

function weekStrip(now) {
  const cells = [];
  for (let w = 1; w <= WEEKS; w++) {
    const exam = EXAM_WEEKS[w];
    const cls = ['wk', w < now ? 'past' : '', w === now ? 'now' : '', exam ? 'exam' : ''].filter(Boolean).join(' ');
    const label = exam === 'mid' ? 'Giữa kỳ' : exam === 'final' ? 'Cuối kỳ' : '';
    cells.push(`<li class="${cls}" title="Tuần ${w}${label ? ' · ' + label : ''}"><span>${w}</span>${label ? `<em>${label}</em>` : ''}</li>`);
  }
  return `<ol class="strip" aria-label="16 tuần của học kỳ">${cells.join('')}</ol>`;
}

function subjectCard(s) {
  const ready = s.chapters.length > 0;
  const st = statsOf(loadEvents(s.id), { since: Date.now() - 7 * DAY });
  const stat = st.attempts ? `đúng ${Math.round(st.accuracy * 100)}% · ${st.attempts} câu trong 7 ngày` : 'chưa làm câu nào trong 7 ngày';
  return `<article class="subject" data-subject="${s.id}">
    <div class="subject-head">
      <div><h2>${ready ? `<a href="/${s.id}/#/">${s.name}</a>` : s.name}</h2><p>${s.book}</p></div>
      ${ready ? `<span class="stat">${stat}</span>` : '<span class="stat">đang xây dựng</span>'}
    </div>
    ${ready ? `<div class="actions">
      <a class="btn primary" href="/${s.id}/#/learn">Học</a>
      <a class="btn" href="/${s.id}/#/practice">Luyện tập</a>
    </div>` : ''}
  </article>`;
}

function render() {
  const now = new Date();
  const week = weekOf(now);
  const days = daysToMidterm(now);
  const lead = days > 0 ? `Còn ${days} ngày tới giữa kỳ — cả ba môn thi tuần 8.` : days > -7 ? 'Tuần này thi giữa kỳ.' : 'Đã qua giữa kỳ.';
  $('#home').innerHTML = `
    <header class="head">
      <h1>Tổng quan</h1>
      <p class="subtitle">${week >= 1 && week <= WEEKS ? `Tuần ${week}/${WEEKS} của học kỳ` : 'Ngoài học kỳ'} · ${lead}</p>
    </header>
    ${weekStrip(week)}
    <section class="subjects">${SUBJECTS.map(subjectCard).join('')}</section>`;
}

setupTheme();
startSync();
render();

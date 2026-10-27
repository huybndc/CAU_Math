// Nguồn: Study_Hub/semester.js (npm run semester:export), chép vào CAU_Math 2026-10-27. Không sửa tay: Hub đổi thì chép lại.
// BẢN SAO SINH TỰ ĐỘNG từ Study_Hub src/logic/semester.js (`npm run semester:export`). Không sửa tay.
/* ---------------------------------------------------------------
   QUY TẮC KỲ HỌC dùng chung 3 app (Huy 2026-10-27). Thuần, không import: CAU_Math và Live_Lecture chép
   bản sinh tự động `semester.js` ở gốc Study_Hub (`npm run semester:export`). Chỉ sửa file này.
   Kỳ xuân bắt đầu 1/3, kỳ thu 1/9 hằng năm. Tuần 1 bắt đầu đúng ngày đó. Hết tuần 16 là nghỉ.
   --------------------------------------------------------------- */

export const TERM_STARTS = [{ term: 'spring', month: 3, day: 1 }, { term: 'fall', month: 9, day: 1 }];
export const WEEKS = 16;
export const EXAMS = [[8, 'giữa kỳ'], [16, 'cuối kỳ']];

// Theo ngày lịch địa phương: dựng Date(y, m, d) để ngày đổi giờ không lệch.
const day0 = when => { const d = new Date(when); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
const days = (a, b) => Math.round((day0(b) - day0(a)) / 864e5);
const startsAround = year => [year - 1, year, year + 1].flatMap(y => TERM_STARTS.map(t => ({ term: t.term, start: new Date(y, t.month - 1, t.day).getTime() })));

/**
 * Kỳ gần nhất đã bắt đầu (≤ now). Sau tuần 16: term 'break', week vẫn đếm theo kỳ vừa qua (UI giữ trạng thái kỳ đó).
 * @returns {{ term: 'spring'|'fall'|'break', start: number, next: number, week: number, exam: {name: string, days: number} | null }}
 *   exam.days ≤ 0 ⇒ đang trong tuần thi đó; null ⇒ đã qua tuần thi cuối.
 */
export function semesterInfo(now) {
  const all = startsAround(new Date(now).getFullYear()).sort((a, b) => a.start - b.start);
  const cur = all.filter(t => t.start <= day0(now)).at(-1);
  const next = all.find(t => t.start > day0(now)).start;
  const week = Math.floor(days(cur.start, now) / 7) + 1;
  const ex = EXAMS.find(([w]) => w >= week);
  const examDay = w => new Date(new Date(cur.start).setDate(new Date(cur.start).getDate() + (w - 1) * 7)).getTime();
  return {
    term: week > WEEKS ? 'break' : cur.term,
    start: cur.start,
    next,
    week,
    exam: ex ? { name: ex[1], days: days(now, examDay(ex[0])) } : null,
  };
}

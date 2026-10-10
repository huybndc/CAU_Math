/* ---------------------------------------------------------------
   ĐIỂM MỤC TIÊU THI (Tổng quan) — thuần. Điểm = 80% luyện tập + 20% đã đọc (0–100).
   - Luyện tập: % đúng trên RECENT câu gần nhất (mọi chế độ), nhân min(1, n/MIN_N) để vài câu đầu không cho 100%.
     Câu của dạng bị cờ "không quan trọng" bỏ ra.
   - Đã đọc: tỉ lệ thẻ bài học đã xong (đọc qua hoặc đã nắm); thẻ mà mọi điểm đều bị cờ không tính vào mẫu số.
   Chưa có bài học nào thì điểm = phần luyện tập.
   --------------------------------------------------------------- */
import { flagKeyOfPoint } from './flags.js';

export const RECENT = 50;
export const MIN_N = 20;
export const W_PRACTICE = 0.8;

/**
 * @param {{ts:number, prefix:string, kind:string, ok:boolean}[]} events
 * @param {Set<string>} flags khoá 'prefix:kind'
 * @param {{done:boolean, keys:string[]}[]} cards mỗi thẻ: đã xong chưa + khoá điểm kiến thức trên thẻ
 */
export function scoreOf({ events, flags, cards }) {
  const mine = events.filter(e => !flags.has(`${e.prefix}:${e.kind}`)).sort((a, b) => a.ts - b.ts).slice(-RECENT);
  const practice = mine.length ? (mine.filter(e => e.ok).length / mine.length) * Math.min(1, mine.length / MIN_N) : 0;
  const open = cards.filter(c => !(c.keys.length && c.keys.every(k => flags.has(flagKeyOfPoint(k)))));
  const learn = open.length ? open.filter(c => c.done).length / open.length : null;
  const total = learn === null ? practice : W_PRACTICE * practice + (1 - W_PRACTICE) * learn;
  return { score: Math.round(total * 100), practice, learn };
}

import { statsOf, weekSince } from './progress.js';

/** Tên và dạng như logic/stats.js của Hub (pet.js dùng chung): 7 ngày qua từ nhật ký làm bài; không thêm thống kê mới. */
export function weekSummary(acts, now) {
  const w = statsOf(acts, { since: weekSince(now) });
  return { answered: w.attempts, correct: w.correct };
}

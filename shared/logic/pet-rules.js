/* Quy tắc kích hoạt biểu cảm — một nguồn cho Hub, CAU_Math, Live_Lecture (xuất sang design-pets.json). Thuần, không thêm thống kê mới:
   chỉ dùng nhật ký hoạt động sẵn có (acts: {ts, ok?}) và đồng hồ máy.
   Thứ tự ưu tiên khi nhiều biểu cảm cùng muốn hiện: ngượng > ngạc nhiên (rê) > vui (bấm) > chớp > tâm trạng nền (buồn > buồn ngủ) > thường. */
export const RULES = {
  blinkEveryMs: 4000,
  click: { expression: 'happy', ms: 1200 },
  hover: { expression: 'surprised', ms: 700 },
  shy: { expression: 'shy', clicks: 3, withinMs: 2000, ms: 1500 },     // bấm ≥3 lần trong 2 giây
  sad: { expression: 'sad', minAnswered: 10, maxAccuracy: 0.5 },       // tuần này trả lời ≥10 câu mà đúng <50%
  sleepy: { expression: 'sleepy', idleDays: 3, quietHours: [23, 5] },  // ≥3 ngày không có hoạt động nào, hoặc 23:00–04:59
  reducedMotion: 'không chớp tự động; tâm trạng nền là hình tĩnh, vẫn hiện',
};

const DAY = 864e5;

/** Tâm trạng nền (thay cho "thường"): 'sad' | 'sleepy' | 'neutral'. */
export function mood({ now, lastTs = null, answered = 0, correct = 0 }) {
  if (answered >= RULES.sad.minAnswered && correct / answered < RULES.sad.maxAccuracy) return 'sad';
  const h = new Date(now).getHours(), [from, to] = RULES.sleepy.quietHours;
  if (h >= from || h < to) return 'sleepy';
  if (lastTs != null && now - lastTs >= RULES.sleepy.idleDays * DAY) return 'sleepy';   // chưa từng học: không buồn ngủ
  return 'neutral';
}

/** Bấm liên tiếp: trả true khi đủ RULES.shy.clicks lần trong cửa sổ; `times` là mảng ts các lần bấm (được cắt gọn tại chỗ). */
export function shyBurst(times, now) {
  times.push(now);
  while (times.length && now - times[0] > RULES.shy.withinMs) times.shift();
  return times.length >= RULES.shy.clicks;
}

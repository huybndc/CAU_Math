/* Quy tắc kích hoạt biểu cảm — một nguồn cho Hub, CAU_Math, Live_Lecture (xuất sang design-pets.json). Thuần, không DOM.
   Chỉ dùng nhật ký hoạt động sẵn có (acts: {ts, ok?}), đồng hồ máy và vài tín hiệu tuỳ chọn do app chủ cấp (signals).
   Tương tác (ngắn, tự về nền): ngượng (bấm nhanh) > vuốt ve > ngạc nhiên (rê) > vui/nháy mắt (bấm) > chớp > tâm trạng nền.
   Tâm trạng nền, ưu tiên từ cao xuống: buồn > hớn hở > tự hào > buồn ngủ > nhẹ nhõm > háo hức > tập trung > đói bài > thư thả > thường. */
export const RULES = {
  blinkEveryMs: 4000,
  click: { expressions: ['happy', 'wink'], ms: 1200 },                 // bấm luân phiên
  hover: { expression: 'surprised', ms: 700, look: 'look' },          // rê vào: ngạc nhiên + đung đưa, rồi nhìn theo con trỏ
  shy: { expression: 'shy', clicks: 3, withinMs: 2000, ms: 1500 },     // bấm ≥3 lần trong 2 giây
  petted: { expression: 'petted', turns: 4, withinMs: 900, ms: 1500 }, // vuốt ve: đổi chiều chuột ≥4 lần trong 0,9 giây
  hold: { expression: 'tilt', afterMs: 600 },                          // bấm giữ ≥0,6 giây: nghiêng đầu, thả ra thì về
  dblclick: { expression: 'happy' },                                   // bấm đôi: nảy một nhịp
  idle: { expression: 'wink', everyMs: 11000, ms: 500 },               // thỉnh thoảng tự nháy mắt
  persona: { cao: { idle: 'wink', sig: ['wag', 'flare'] }, cu: { idle: 'wink', sig: ['flap', 'shoot'] }, tho: { idle: 'wag', sig: ['ears', 'rain'] }, gau: { idle: 'wink', sig: ['bloom', 'shake'] }, rua: { idle: 'squint', sig: ['glow', 'hide'] }, meo: { idle: 'wink', sig: ['bubble', 'wag'] } },   // cá tính: nét mặt thay nháy mắt + động tác bộ phận nguyên tố thỉnh thoảng tự chạy (engine SIGNATURE)
  signatureEveryMs: [7000, 13000],
  sad: { expression: 'sad', minAnswered: 10, maxAccuracy: 0.5 },       // tuần này trả lời ≥10 câu mà đúng <50%
  cheer: { expression: 'cheer', streak: 5, withinMs: 12 * 36e5, todayAnswered: 10, todayAccuracy: 0.8 },   // 5 câu đúng liền (trong 12 giờ) hoặc hôm nay ≥10 câu đúng ≥80%
  proud: { expression: 'proud', days: 3 },                             // 3 ngày liên tiếp có hoạt động (tính cả hôm nay)
  relieved: { expression: 'relieved' },                                // signals.relieved: môn vừa qua mốc mục tiêu
  eager: { expression: 'eager' },                                      // signals.newNote: có ghi chú mới chưa đọc
  focus: { expression: 'focus', examDays: 3, final: 'final', finalDay: -6 },   // còn ≤3 ngày tới kỳ thi; ngày cuối tuần thi: thêm lấp lánh
  hungry: { expression: 'hungry', afterHour: 18 },                     // sau 18:00 mà hôm nay chưa làm câu nào
  lazy: { expression: 'lazy', days: [0, 6] },                          // thứ Bảy, Chủ nhật, chưa làm câu nào
  sleepy: { expression: 'sleepy', idleDays: 3, quietHours: [23, 5] },  // ≥3 ngày không có hoạt động nào, hoặc 23:00–04:59
  greet: { back: { expression: 'wave', idleDays: 2, ms: 2500 }, morning: { expression: 'yawn', beforeHour: 8, ms: 2500 } },   // lần mở đầu tiên trong ngày
  // Động tác thân (CSS keyframes pet-*, một lần, ≤4px / ≤8°, tắt khi giảm chuyển động): tâm trạng nền thỉnh thoảng làm lại sau everyMs [ngắn, dài].
  acts: { mood: { cheer: 'hop', proud: 'puff', final: 'puff', eager: 'sway', wave: 'sway', hungry: 'shake', relieved: 'stretch', yawn: 'stretch', sleepy: 'nod', lazy: 'nod' },
    everyMs: [4500, 8500], click: 'hop', dblclick: 'hop', hover: 'sway', shy: 'shake', petted: 'squish', greet: 'sway', morning: 'stretch',
    poses: { sad: 'droop', tilt: 'tilt' } },                           // tư thế giữ nguyên (không lặp): buồn thì chùng xuống, bấm giữ thì nghiêng
  breathSeconds: { calm: 5, glad: 3, slow: 7 },                        // chu kỳ thở (CSS đọc từ data-mood); ≥2,5 giây
  reducedMotion: 'không chớp/nháy tự động, không đung đưa, không nảy; tâm trạng nền là hình tĩnh, vẫn hiện',
};

const DAY = 864e5;
const GLAD = new Set(['cheer', 'proud', 'eager', 'wave']);
const SLOW = new Set(['sleepy', 'lazy', 'yawn', 'relieved']);

/** Chu kỳ thở theo tâm trạng: vui nhanh, buồn ngủ chậm. */
export const breathOf = m => (GLAD.has(m) ? RULES.breathSeconds.glad : SLOW.has(m) ? RULES.breathSeconds.slow : RULES.breathSeconds.calm);

const dayNo = ts => { const d = new Date(ts); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY); };

/** Thống kê từ nhật ký hoạt động (thuần): chuỗi đúng liền, số câu hôm nay, chuỗi ngày có hoạt động. */
export function answerStats(acts, now) {
  const answers = acts.filter(a => a.ok !== undefined).sort((a, b) => a.ts - b.ts);
  let streak = 0;
  for (let i = answers.length - 1; i >= 0 && answers[i].ok; i--) streak++;
  const today = dayNo(now), days = new Set(acts.map(a => dayNo(a.ts)));
  const mine = answers.filter(a => dayNo(a.ts) === today);
  let run = 0;
  while (days.has(today - run)) run++;
  return {
    streak, lastAnswerTs: answers.at(-1)?.ts ?? null,
    todayAnswered: mine.length, todayCorrect: mine.filter(a => a.ok).length, dayStreak: run,
  };
}

/**
 * Tâm trạng nền (thay cho "thường"). Trường chưa biết để mặc định thì quy tắc đó không bật:
 * todayAnswered=null ⇒ không đói bài/thư thả; signals trống ⇒ không háo hức/nhẹ nhõm/tập trung.
 */
export function mood({ now, lastTs = null, answered = 0, correct = 0, streak = 0, lastAnswerTs = null, todayAnswered = null, todayCorrect = 0, dayStreak = 0, signals = {} }) {
  if (answered >= RULES.sad.minAnswered && correct / answered < RULES.sad.maxAccuracy) return 'sad';
  const c = RULES.cheer;
  if ((streak >= c.streak && lastAnswerTs != null && now - lastAnswerTs < c.withinMs)
    || (todayAnswered >= c.todayAnswered && todayCorrect / todayAnswered >= c.todayAccuracy)) return c.expression;
  if (dayStreak >= RULES.proud.days) return RULES.proud.expression;
  const d = new Date(now), h = d.getHours(), [from, to] = RULES.sleepy.quietHours;
  if (h >= from || h < to) return 'sleepy';
  if (lastTs != null && now - lastTs >= RULES.sleepy.idleDays * DAY) return 'sleepy';   // chưa từng học: không buồn ngủ
  if (signals.relieved) return RULES.relieved.expression;
  if (signals.newNote) return RULES.eager.expression;
  if (signals.examDays != null && signals.examDays <= RULES.focus.examDays) return signals.examDays === RULES.focus.finalDay ? RULES.focus.final : RULES.focus.expression;
  if (todayAnswered === 0 && lastTs != null && h >= RULES.hungry.afterHour) return RULES.hungry.expression;
  if (todayAnswered === 0 && RULES.lazy.days.includes(d.getDay())) return RULES.lazy.expression;
  return 'neutral';
}

/** Lời chào lần mở đầu tiên trong ngày: 'wave' (nghỉ ≥2 ngày) > 'yawn' (trước 8:00) > null. */
export function greeting({ now, lastTs = null }) {
  const g = RULES.greet;
  if (lastTs != null && now - lastTs >= g.back.idleDays * DAY) return g.back;
  if (new Date(now).getHours() < g.morning.beforeHour) return g.morning;
  return null;
}

/** Bấm liên tiếp: trả true khi đủ RULES.shy.clicks lần trong cửa sổ; `times` là mảng ts các lần bấm (được cắt gọn tại chỗ). */
export function shyBurst(times, now) {
  times.push(now);
  while (times.length && now - times[0] > RULES.shy.withinMs) times.shift();
  return times.length >= RULES.shy.clicks;
}

/** Vuốt ve: `moves` = các lần đổi chiều chuột {ts}; true khi đủ RULES.petted.turns lần đổi chiều trong cửa sổ (cắt gọn tại chỗ). */
export function pettedBurst(turns, now) {
  turns.push(now);
  while (turns.length && now - turns[0] > RULES.petted.withinMs) turns.shift();
  return turns.length >= RULES.petted.turns;
}

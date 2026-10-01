import { seededRandom, shuffle } from './shuffle.js';
import { signature, seededQuestion } from './question-pool.js';

/* ---------------------------------------------------------------
   BÀI FULL 60–90 PHÚT (Phase 2) — hàm thuần, không đụng DOM.
   Đề chỉ lưu { seed, chapters, minutes }: dựng lại từ hạt giống nên F5
   giữa bài vẫn ra đúng đề cũ (mọi makeQuestion chỉ được dùng `rnd`).
   chapters: [{ id, prefix, weight?, bank: { KINDS, SECONDS, makeQuestion, checkAnswer } }]
   weight = số tuần học chương đó theo syllabus: chương học 2 tuần chiếm gấp đôi thời gian.
   --------------------------------------------------------------- */

export const EXAM_MINUTES = [60, 75, 90];
/** Chỉ lấp 85% thời gian chuẩn: chừa ~10 phút soát bài, và người mới làm chậm hơn chuẩn. */
export const FILL = 0.85;
/** Dạng dưới 40 giây là câu nhận diện nhanh (khởi động) — đề thật không có, bài full bỏ qua. */
export const MIN_SECONDS = 40;
/** Trần số câu một dạng trong một đề: quá thì đề toàn câu cùng khuôn đổi số (người học thử đề Discrete 2026-09-26: 16/67 câu
 *  là tổng dãy). Câu khái niệm mỗi câu một ý khác nhau nên trần cao hơn. Hết dạng thì đề ngắn hơn thời gian, không lặp. */
export const maxPerKind = kind => (kind === 'concept' ? 6 : 3);

/** Các dạng đưa vào bài full của một chương (chương chỉ có dạng ngắn thì lấy hết). */
export function examKinds({ KINDS, SECONDS }) {
  const long = KINDS.filter(k => (SECONDS?.[k] ?? 60) >= MIN_SECONDS);
  return long.length ? long : KINDS;
}

/**
 * Chọn dạng câu: mỗi lần thêm một câu cho chương đang ít thời gian nhất so với trọng số
 * (thời gian chia theo tuần học dù dạng chương này ngắn, chương kia dài); trong một chương đi hết các dạng theo
 * thứ tự đã xáo rồi mới lặp. Tổng thời gian chuẩn ≤ minutes · FILL.
 * Thứ tự câu XÁO TRỘN (người học, 2026-09-25: thích đề trộn hơn đề xếp theo bài giảng — phải tự nhận ra dạng bài),
 * và không để hai câu cùng dạng đứng liền nhau khi còn cách.
 * @returns {{ci:number, kind:string}[]}
 */
export function planExam(chapters, minutes, rnd, mixed = true) {
  const budget = minutes * 60 * FILL;
  const queues = chapters.map(() => []);
  const spent = chapters.map(() => 0);
  const full = chapters.map(() => false);
  const slots = [];
  const count = {};
  let used = 0;
  for (;;) {
    let i = -1;
    const load = j => spent[j] / (chapters[j].weight ?? 1);
    spent.forEach((_, j) => { if (!full[j] && (i < 0 || load(j) < load(i))) i = j; });
    if (i < 0) break;
    const { SECONDS } = chapters[i].bank;
    if (!queues[i].length) queues[i] = shuffle(examKinds(chapters[i].bank).filter(k => (count[`${i}:${k}`] ?? 0) < maxPerKind(k)), rnd);
    if (!queues[i].length) { full[i] = true; continue; }
    const s = SECONDS?.[queues[i][0]] ?? 60;
    if (used + s > budget) { full[i] = true; continue; }
    const kind = queues[i].shift();
    count[`${i}:${kind}`] = (count[`${i}:${kind}`] ?? 0) + 1;
    slots.push({ ci: i, kind });
    spent[i] += s;
    used += s;
  }
  if (mixed) return spreadKinds(shuffle(slots, rnd));
  // bài tạo trước khi đổi sang đề trộn (không có st.order): giữ thứ tự cũ để đáp án đã lưu khớp đúng câu
  const order = s => s.ci * 1000 + chapters[s.ci].bank.KINDS.indexOf(s.kind);
  return slots.sort((a, b) => order(a) - order(b));
}

/**
 * Không để hai câu cùng dạng liền nhau: đi theo thứ tự đã xáo, mỗi bước lấy câu đầu tiên KHÁC dạng câu trước;
 * dạng nào còn quá nửa số câu còn lại thì phải đặt nó ngay (không thì cuối đề bị dồn). Hết cách thì chấp nhận liền nhau.
 */
export function spreadKinds(slots) {
  const kindOf = s => `${s.ci}:${s.kind}`;
  const left = [...slots], out = [];
  while (left.length) {
    const last = out.length ? kindOf(out.at(-1)) : null;
    const count = {};
    left.forEach(s => { count[kindOf(s)] = (count[kindOf(s)] ?? 0) + 1; });
    const [big, n] = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
    let i = big !== last && n * 2 > left.length ? left.findIndex(s => kindOf(s) === big) : left.findIndex(s => kindOf(s) !== last);
    if (i < 0) i = 0;
    out.push(left.splice(i, 1)[0]);
  }
  return out;
}

/* ---------------------------------------------------------------
   ĐỀ THEO KIỂU TOPIK (D53) — SỐ CÂU CỐ ĐỊNH, 80% tự luận · 20% trắc nghiệm (mọi môn).
   order 'part':   mỗi chương là một PART có số câu cố định (chia theo số tuần học), trong part xếp DỄ → KHÓ
                   (dạng nhanh trước); part theo thứ tự giáo trình.
   order 'random': cùng số câu, trộn hết, không hiện tên chương khi làm bài.
   Đề cũ lưu order 'mixed' / không có order vẫn dựng bằng planExam ở trên (đáp án đã lưu khớp đúng câu).
   --------------------------------------------------------------- */

export const EXAM_COUNTS = { 60: 30, 75: 38, 90: 45 };
export const MCQ_SHARE = 0.2;
export const MIN_PART = 3;
export const isFixedOrder = order => order === 'part' || order === 'random';
export const examTotal = minutes => EXAM_COUNTS[minutes] ?? EXAM_COUNTS[90];

/** Sức chứa của một chương: số câu khác dạng tối đa (mỗi dạng ≤ maxPerKind). */
const capacity = ch => examKinds(ch.bank).reduce((s, k) => s + maxPerKind(k), 0);

/**
 * Chia `total` câu cho các chương theo trọng số (phần dư chia theo phần thập phân lớn nhất), tối thiểu MIN_PART,
 * không vượt sức chứa; phần thừa dồn sang chương còn chỗ. Trả mảng số câu cùng thứ tự `chapters`.
 */
export function partSizes(chapters, total) {
  const w = chapters.map(c => c.weight ?? 1);
  const cap = chapters.map(capacity);
  const sumW = w.reduce((a, b) => a + b, 0);
  const ideal = w.map(x => (total * x) / sumW);
  const size = ideal.map((x, i) => Math.min(cap[i], Math.max(MIN_PART, Math.floor(x))));
  const order = ideal.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  for (let guard = 0; guard < 10000; guard++) {
    const diff = total - size.reduce((a, b) => a + b, 0);
    if (diff === 0) break;
    const room = diff > 0 ? order.filter(i => size[i] < cap[i]) : [...order].reverse().filter(i => size[i] > Math.min(MIN_PART, cap[i]));
    if (!room.length) break;                                    // đủ chỗ cũng không: đề ngắn hơn số cố định
    size[room[0]] += diff > 0 ? 1 : -1;
  }
  return size;
}

/** Số câu thật của đề (có thể < total khi các chương chọn quá ít dạng). */
export const examSize = (chapters, minutes) => partSizes(chapters, examTotal(minutes)).reduce((a, b) => a + b, 0);

const choiceMemo = new WeakMap();
/** Dạng này vốn là câu trắc nghiệm (phân loại nghiệm, khái niệm…)? Đo bằng một câu mẫu, nhớ theo ngân hàng. */
function isChoiceKind(bank, kind) {
  const m = choiceMemo.get(bank) ?? choiceMemo.set(bank, {}).get(bank);
  return (m[kind] ??= bank.makeQuestion(kind, seededRandom(1)).format === 'choice');
}

/**
 * n dạng cho một chương: đi vòng qua các dạng đã xáo, mỗi dạng ≤ maxPerKind. Dạng vốn trắc nghiệm chỉ chiếm tối đa
 * MCQ_SHARE (nếu để tự do thì chương có nhiều dạng khái niệm / phân loại vượt quá 20%); thiếu dạng tự luận mới nới ra.
 */
function pickKinds(ch, n, rnd) {
  const all = shuffle(examKinds(ch.bank), rnd);
  const choiceK = all.filter(k => isChoiceKind(ch.bank, k)), typedK = all.filter(k => !choiceK.includes(k));
  const room = ks => ks.reduce((t, k) => t + maxPerKind(k), 0);
  const take = (ks, m) => {
    const count = {}, out = [];
    while (out.length < m) {
      const open = ks.filter(k => (count[k] ?? 0) < maxPerKind(k));
      if (!open.length) break;
      for (const k of open) { if (out.length === m) break; count[k] = (count[k] ?? 0) + 1; out.push(k); }
    }
    return out;
  };
  const c = Math.min(Math.round(n * MCQ_SHARE), room(choiceK));
  const typed = take(typedK, n - c);
  const rest = take(choiceK, n - typed.length);              // thiếu tự luận ⇒ bù bằng dạng trắc nghiệm
  return shuffle([...typed, ...rest], rnd);
}

/** Độ khó ≈ thời gian chuẩn của dạng (càng ngắn càng dễ). */
const hardness = (ch, kind) => ch.bank.SECONDS?.[kind] ?? 60;

/** @returns {{ci:number, kind:string, part?:number}[]} */
export function planFixed(chapters, minutes, rnd, order) {
  const sizes = partSizes(chapters, examTotal(minutes));
  const parts = chapters.map((ch, ci) => {
    const kinds = pickKinds(ch, sizes[ci], rnd);                 // đã xáo ⇒ cùng độ khó thì thứ tự ngẫu nhiên (sort ổn định)
    return kinds.sort((a, b) => hardness(ch, a) - hardness(ch, b)).map(kind => ({ ci, kind, part: ci }));
  });
  if (order === 'part') return parts.flat();
  return spreadKinds(shuffle(parts.flat(), rnd));
}

/** Đổi bớt câu tự luận thành trắc nghiệm cho đủ MCQ_SHARE trong phạm vi `scope` (mảng item); câu vốn là trắc nghiệm được tính. */
function mixChoice(scope, chaptersById, rnd) {
  const want = Math.round(scope.length * MCQ_SHARE);
  let have = scope.filter(it => it.q.format === 'choice').length;
  for (const it of shuffle(scope.filter(it => it.q.format !== 'choice' && chaptersById[it.ch].choiceBank), rnd)) {
    if (have >= want) break;
    const c = chaptersById[it.ch];
    const q = seededQuestion(c.choiceBank, it.q.kind, it.q.seed);
    if (q.format !== 'choice') continue;                         // dạng này không làm trắc nghiệm được
    Object.assign(it, { bank: c.choiceBank, q });
    have++;
  }
}

function buildFixed(chapters, { seed, minutes, order }) {
  const slots = planFixed(chapters, minutes, seededRandom(seed), order);
  const seen = new Set();
  const items = slots.map((s, i) => {
    const c = chapters[s.ci];
    let q;
    for (let j = 0; j < 40; j++) {
      q = seededQuestion(c.bank, s.kind, seed + 7919 * (i + 1) + 104729 * j);
      if (!seen.has(signature(q))) break;
    }
    seen.add(signature(q));
    return { ch: c.id, prefix: c.prefix, bank: c.bank, q, part: order === 'part' ? s.part : undefined };
  });
  const byId = Object.fromEntries(chapters.map(c => [c.id, c]));
  const rnd = seededRandom(seed + 1);
  if (order === 'part') for (const ci of new Set(slots.map(s => s.part))) mixChoice(items.filter(it => it.part === ci), byId, rnd);
  else mixChoice(items, byId, rnd);
  return items;
}

/**
 * Dựng đề: mỗi câu một hạt giống con (câu i không phụ thuộc số câu trước nó về dạng), và không có
 * hai câu trùng chữ ký (question-pool.js) — trùng thì thử hạt giống kế tiếp, vẫn xác định nên F5 ra đúng đề cũ.
 */
export function buildExam(chapters, { seed, minutes, order }) {
  if (isFixedOrder(order)) return buildFixed(chapters, { seed, minutes, order });
  const seen = new Set();
  return planExam(chapters, minutes, seededRandom(seed), order === 'mixed').map((s, i) => {
    const c = chapters[s.ci];
    let q;
    for (let j = 0; j < 40; j++) {
      q = seededQuestion(c.bank, s.kind, seed + 7919 * (i + 1) + 104729 * j);     // hạt giống riêng từng câu ⇒ có mã câu
      if (!seen.has(signature(q))) break;
    }
    seen.add(signature(q));
    return { ch: c.id, prefix: c.prefix, bank: c.bank, q };
  });
}

export const isBlank = g => !String(g ?? '').trim();

/** Chấm một câu; đáp án không đọc được (retry) tính là sai khi đã nộp bài. */
export function gradeItem(item, given) {
  if (isBlank(given)) return { ok: false, blank: true };
  const r = item.bank.checkAnswer(item.q, given);
  return { ok: !r.retry && !!r.ok, blank: false, detailKey: r.detailKey, detailParams: r.detailParams };
}

/** Đếm đúng/tổng theo khoá (chương, dạng…), giữ thứ tự gặp đầu tiên. */
export function tally(items, results, keyOf) {
  const m = new Map();
  items.forEach((it, i) => {
    const k = keyOf(it);
    const v = m.get(k) ?? { key: k, item: it, ok: 0, n: 0 };
    v.n++;
    if (results[i].ok) v.ok++;
    m.set(k, v);
  });
  return [...m.values()];
}

/** Giây còn lại của bài thi thử (âm = hết giờ). */
export const secondsLeft = (exam, now) => exam.minutes * 60 - Math.floor((now - exam.startedAt) / 1000);

/** 75 → "01:15", 4000 → "66:40" (đồng hồ phút:giây). */
export const clock = s => {
  const t = Math.max(0, s);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

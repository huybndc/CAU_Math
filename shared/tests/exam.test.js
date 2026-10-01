import { describe, it, expect } from 'vitest';
import { planExam, buildExam, gradeItem, tally, secondsLeft, clock, examKinds, maxPerKind, FILL } from '../logic/exam.js';
import { seededRandom } from '../logic/shuffle.js';

/* ngân hàng giả: câu "cộng hai số", thời gian chuẩn theo dạng */
const bank = (kinds, seconds) => ({
  KINDS: kinds, SECONDS: seconds,
  makeQuestion: (kind, rnd) => ({ kind, a: Math.floor(rnd() * 100), answer: kind }),
  checkAnswer: (q, g) => (g === 'x' ? { retry: true } : { ok: g === q.answer }),
});
const CH = [
  { id: 'ch1', prefix: 'a', bank: bank(['k1', 'k2', 'k3'], { k1: 60, k2: 90, k3: 30 }) },
  { id: 'ch2', prefix: 'b', bank: bank(['m1', 'm2'], { m1: 120, m2: 180 }) },
];
const cost = slots => slots.reduce((s, x) => s + CH[x.ci].bank.SECONDS[x.kind], 0);

describe('dựng đề', () => {
  it('đủ dạng thì lấp gần đủ thời gian nhưng không vượt', () => {
    const many = n => Array.from({ length: n }, (_, i) => `k${i}`);
    const BIG = [{ id: 'x', bank: bank(many(20), Object.fromEntries(many(20).map(k => [k, 120]))) }];
    for (const m of [60, 75, 90]) {
      const slots = planExam(BIG, m, seededRandom(m));
      const c = slots.length * 120;
      expect(c).toBeLessThanOrEqual(m * 60 * FILL);
      expect(c).toBeGreaterThan(m * 60 * FILL - 120);
    }
  });

  it('một dạng không quá maxPerKind câu: hết dạng thì đề ngắn lại, không lặp khuôn', () => {
    const slots = planExam(CH, 90, seededRandom(5));
    const counts = {};
    slots.forEach(s => { counts[s.kind] = (counts[s.kind] ?? 0) + 1; });
    for (const [k, n] of Object.entries(counts)) expect(n, k).toBeLessThanOrEqual(maxPerKind(k));
    expect(cost(slots)).toBeLessThanOrEqual(90 * 60 * FILL);
    expect(maxPerKind('concept')).toBeGreaterThan(maxPerKind('sum'));
  });

  it('chia đều thời gian các chương, đi hết mọi dạng trước khi lặp', () => {
    const slots = planExam(CH, 90, seededRandom(1));
    const per = ci => cost(slots.filter(s => s.ci === ci));
    expect(Math.abs(per(0) - per(1))).toBeLessThan(900);
    for (const k of ['k1', 'k2']) expect(slots.some(s => s.kind === k)).toBe(true);
  });

  it('trọng số: chương nặng gấp đôi được gấp đôi thời gian', () => {
    const W = [{ ...CH[0], weight: 1 }, { ...CH[1], weight: 2 }];
    const slots = planExam(W, 90, seededRandom(2));
    const per = ci => cost(slots.filter(s => s.ci === ci));
    expect(per(1) / per(0)).toBeGreaterThan(1.6);
    expect(per(1) / per(0)).toBeLessThan(2.5);
  });

  it('bỏ dạng nhận diện nhanh (< 40 giây), trừ khi chương chỉ có dạng ngắn', () => {
    expect(examKinds(CH[0].bank)).toEqual(['k1', 'k2']);
    expect(examKinds(bank(['a', 'b'], { a: 20, b: 30 }))).toEqual(['a', 'b']);
    expect(planExam(CH, 90, seededRandom(4)).some(s => s.kind === 'k3')).toBe(false);
  });

  it('bài cũ (không có order) giữ thứ tự theo chương — đáp án đã lưu không lệch câu', () => {
    const slots = planExam(CH, 60, seededRandom(3), false);
    const key = s => s.ci * 10 + CH[s.ci].bank.KINDS.indexOf(s.kind);
    expect(slots.map(key)).toEqual([...slots.map(key)].sort((a, b) => a - b));
  });

  it('câu xáo trộn (không xếp theo chương), không hai câu cùng dạng liền nhau khi còn cách', () => {
    let mixed = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const slots = planExam(CH, 90, seededRandom(seed));
      const key = s => s.ci * 10 + CH[s.ci].bank.KINDS.indexOf(s.kind);
      if (slots.map(key).join() !== [...slots.map(key)].sort((a, b) => a - b).join()) mixed++;
      const counts = {};
      slots.forEach(s => { counts[key(s)] = (counts[key(s)] ?? 0) + 1; });
      // còn cách tách (không dạng nào chiếm quá nửa đề) thì không có hai câu cùng dạng liền nhau
      if (Math.max(...Object.values(counts)) <= slots.length / 2) {
        slots.forEach((s, i) => { if (i) expect(key(s) === key(slots[i - 1]), `seed ${seed} câu ${i}`).toBe(false); });
      }
    }
    expect(mixed).toBeGreaterThan(15);
  });

  it('cùng hạt giống ⇒ cùng đề (F5 giữa bài)', () => {
    const a = buildExam(CH, { seed: 42, minutes: 75 }).map(x => x.q);
    const b = buildExam(CH, { seed: 42, minutes: 75 }).map(x => x.q);
    expect(a).toEqual(b);
    expect(buildExam(CH, { seed: 43, minutes: 75 }).map(x => x.q)).not.toEqual(a);
  });
});

describe('chấm đề', () => {
  const [item] = buildExam(CH, { seed: 5, minutes: 60 });
  it('bỏ trống / sai / không đọc được / đúng', () => {
    expect(gradeItem(item, ' ')).toEqual({ ok: false, blank: true });
    expect(gradeItem(item, 'zz')).toMatchObject({ ok: false, blank: false });
    expect(gradeItem(item, 'x')).toMatchObject({ ok: false, blank: false });
    expect(gradeItem(item, item.q.answer)).toMatchObject({ ok: true });
  });

  it('đếm theo chương', () => {
    const items = buildExam(CH, { seed: 5, minutes: 60 });
    const res = items.map((it, i) => ({ ok: i % 2 === 0 }));
    const t = tally(items, res, it => it.ch);
    expect(t.map(x => x.key)).toEqual(['ch1', 'ch2']);
    expect(t.reduce((s, x) => s + x.n, 0)).toBe(items.length);
    expect(t.reduce((s, x) => s + x.ok, 0)).toBe(Math.ceil(items.length / 2));
  });
});

describe('đồng hồ', () => {
  it('giây còn lại và định dạng', () => {
    expect(secondsLeft({ minutes: 60, startedAt: 0 }, 61_500)).toBe(3539);
    expect(clock(3539)).toBe('58:59');
    expect(clock(-3)).toBe('00:00');
    expect(clock(5400)).toBe('90:00');
  });
});

/* ---------- đề kiểu TOPIK (D53): số câu cố định, part dễ → khó, 80/20 ---------- */
import { partSizes, examSize, planFixed, EXAM_COUNTS, MCQ_SHARE } from '../logic/exam.js';

const many = (p, n) => Array.from({ length: n }, (_, i) => `${p}${i}`);
const sec = (ks, f) => Object.fromEntries(ks.map((k, i) => [k, f(i)]));
const choiceOf = b => ({ ...b, makeQuestion: (k, rnd) => ({ ...b.makeQuestion(k, rnd), format: 'choice', choices: ['a', 'b', 'c', 'd'], answer: 0 }) });
const mk = (id, n, weight) => {
  const ks = many(id, n), b = bank(ks, sec(ks, i => 40 + 15 * i));
  return { id, prefix: id, weight, bank: b, choiceBank: choiceOf(b) };
};
const FIX = [mk('p', 10, 2), mk('q', 10, 3), mk('r', 10, 3)];

describe('đề kiểu TOPIK', () => {
  it('số câu cố định theo thời lượng, chia part theo trọng số', () => {
    for (const m of [60, 75, 90]) {
      const sizes = partSizes(FIX, EXAM_COUNTS[m]);
      expect(sizes.reduce((a, b) => a + b, 0)).toBe(EXAM_COUNTS[m]);
      expect(sizes[0]).toBeLessThan(sizes[1]);
      expect(examSize(FIX, m)).toBe(EXAM_COUNTS[m]);
    }
  });
  it('chương nhỏ hơn sức chứa thì dồn phần thừa sang chương khác', () => {
    const small = { ...mk('s', 2, 5) };            // 2 dạng × 3 = 6 câu tối đa
    const sizes = partSizes([small, mk('t', 10, 1)], 30);
    expect(sizes[0]).toBeLessThanOrEqual(6);
    expect(sizes[0] + sizes[1]).toBe(30);
  });
  it('part: mỗi part đúng số câu, theo thứ tự chương, trong part dạng nhanh trước', () => {
    const slots = planFixed(FIX, 60, seededRandom(3), 'part');
    const sizes = partSizes(FIX, EXAM_COUNTS[60]);
    FIX.forEach((c, i) => {
      const mine = slots.filter(s => s.part === i);
      expect(mine.length).toBe(sizes[i]);
      const t = mine.map(s => c.bank.SECONDS[s.kind]);
      expect(t).toEqual([...t].sort((a, b) => a - b));
    });
    expect(slots.map(s => s.part)).toEqual([...slots.map(s => s.part)].sort((a, b) => a - b));
  });
  it('random: cùng số câu, không có part', () => {
    const slots = planFixed(FIX, 60, seededRandom(3), 'random');
    expect(slots.length).toBe(30);
    expect(new Set(slots.map(s => s.ci)).size).toBe(3);        // trộn đủ cả ba chương
  });
  it('80% tự luận / 20% trắc nghiệm trong từng part; dựng lại cùng hạt giống ra đúng đề', () => {
    const items = buildExam(FIX, { seed: 7, minutes: 90, order: 'part' });
    expect(items.length).toBe(45);
    for (let p = 0; p < 3; p++) {
      const part = items.filter(it => it.part === p);
      const mcq = part.filter(it => it.q.format === 'choice').length;
      expect(mcq).toBe(Math.round(part.length * MCQ_SHARE));
    }
    const again = buildExam(FIX, { seed: 7, minutes: 90, order: 'part' });
    expect(again.map(it => it.q.kind + it.q.a)).toEqual(items.map(it => it.q.kind + it.q.a));
    const rnd = buildExam(FIX, { seed: 7, minutes: 90, order: 'random' });
    expect(rnd.filter(it => it.q.format === 'choice').length).toBe(Math.round(45 * MCQ_SHARE));
    expect(rnd.some(it => it.part !== undefined)).toBe(false);
  });
});

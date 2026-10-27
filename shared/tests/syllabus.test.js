import { describe, it, expect } from 'vitest';
import { weekOf, breakDays, SUBJECTS, WEEKS, EXAM_WEEKS, daysToMidterm, chapterWeeks } from '../logic/syllabus.js';

describe('tuần học', () => {
  it('thứ Ba 01/09 là tuần 1 (31/08 còn ngoài học kỳ), 24/09 là tuần 4, 20/10 là tuần 8', () => {
    expect(weekOf('2026-08-31T09:00')).toBe(WEEKS + 1);      // nghỉ hè sau kỳ xuân
    expect(weekOf('2026-09-01T09:00')).toBe(1);
    expect(weekOf('2026-09-07T23:00')).toBe(1);
    expect(weekOf('2026-09-08T09:00')).toBe(2);
    expect(weekOf('2026-09-24T09:00')).toBe(4);
    expect(weekOf('2026-10-19T09:00')).toBe(7);
    expect(weekOf('2026-10-20T09:00')).toBe(8);
  });
  it('trước học kỳ = 0, sau học kỳ không vượt quá 17', () => {
    expect(weekOf('2026-12-22')).toBe(WEEKS + 1);
    expect(weekOf('2027-03-01T09:00')).toBe(1);
  });
});

describe('lịch từng môn', () => {
  it('không môn nào có bài học vào tuần thi, và chương trỏ tới đều nằm trong app', () => {
    for (const s of SUBJECTS) {
      for (const [w, [, ...chs]] of Object.entries(s.weeks)) {
        expect(EXAM_WEEKS[w], `${s.id} tuần ${w}`).toBeUndefined();
        for (const ch of chs) expect(s.chapters, `${s.id} tuần ${w}`).toContain(ch);
      }
    }
  });
});

describe('mốc giữa kỳ', () => {
  it('giữa kỳ bắt đầu tuần 8 (thứ Ba 2026-10-20)', () => {
    expect(daysToMidterm(new Date('2026-09-24T10:00:00'))).toBe(26);
    expect(daysToMidterm(new Date('2026-10-20T08:00:00'))).toBe(0);
    expect(daysToMidterm(new Date('2026-10-21T08:00:00'))).toBe(-1);
  });
});

describe('trọng số chương cho bài full', () => {
  it('số tuần học mỗi chương', () => {
    expect(chapterWeeks('logic')).toEqual({ ch1: 1, ch2: 1, ch3: 2, ch4: 2 });
    expect(chapterWeeks('linalg')).toEqual({ ch1: 1, ch2: 3, ch3: 3 });
    expect(chapterWeeks('nope')).toEqual({});
  });
});

describe('kỳ nghỉ (quy tắc chung semester.js: xuân 1/3, thu 1/9, 16 tuần)', () => {
  it('22/12/2026 là kỳ nghỉ, còn 69 ngày tới 1/3/2027; 1/3/2027 hết nghỉ (dải tuần trở lại, tuần 1)', () => {
    expect(breakDays(new Date('2026-12-22T10:00:00'))).toBe(69);
    expect(breakDays(new Date('2027-03-01T10:00:00'))).toBe(null);
    expect(weekOf(new Date('2027-03-01T10:00:00'))).toBe(1);
  });
  it('trong kỳ thì không phải nghỉ; tuần 16 còn trong kỳ, tuần 17 là nghỉ', () => {
    expect(breakDays(new Date('2026-10-27T10:00:00'))).toBe(null);
    expect(breakDays(new Date('2026-12-21T10:00:00'))).toBe(null);   // 1/9 + 15 tuần + 6 ngày: cuối tuần 16
    expect(breakDays(new Date('2026-12-22T00:30:00'))).toBe(69);
  });
});

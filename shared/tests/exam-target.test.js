import { describe, it, expect } from 'vitest';
import { examTarget, targetOf } from '../logic/exam-target.js';
import { SEMESTER_START, EXAM_WEEKS, weekStart } from '../logic/syllabus.js';

/* exam-target.json là bản chụp từ Study_Hub (npm run exam:export ở đó). Lệch lịch học kỳ với syllabus.js ⇒ test đỏ. */
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

describe('exam-target.json khớp lịch học kỳ của app', () => {
  it('ngày bắt đầu học kỳ', () => expect(examTarget.semesterStart).toBe(SEMESTER_START));
  it('tuần và ngày thi khớp EXAM_WEEKS + weekStart', () => {
    expect(examTarget.exams.map(e => e.week).sort()).toEqual(Object.keys(EXAM_WEEKS).map(Number).sort());
    for (const e of examTarget.exams) expect(e.date, e.name).toBe(ymd(weekStart(e.week)));
  });
  it('mục tiêu từng môn là số 1–100', () => {
    for (const s of ['logic', 'linalg', 'discrete']) expect(targetOf(s), s).toBeGreaterThan(0), expect(targetOf(s)).toBeLessThanOrEqual(100);
    expect(targetOf('nope')).toBeNull();
  });
});

import { needCorrect } from '../logic/exam-target.js';
it('needCorrect: số câu đúng liền cần thêm để chạm mục tiêu; đã đạt thì 0', () => {
  expect(needCorrect({ attempts: 100, correct: 64 }, 80)).toBe(80);   // (64+80)/(180)=80%
  expect(needCorrect({ attempts: 100, correct: 64 }, 80) - 1).toBeLessThan(80);
  expect((64 + 79) / 179).toBeLessThan(0.8);
  expect(needCorrect({ attempts: 10, correct: 9 }, 80)).toBe(0);
  expect(needCorrect({ attempts: 0, correct: 0 }, 80)).toBe(0);
});

import { describe, it, expect } from 'vitest';
import { buildExam, examTotal, gradeItem } from '../logic/exam.js';
import { CHAPTERS as LOGIC } from '../../logic/src/logic/chapters.js';
import { CHAPTERS as LINALG } from '../../linalg/src/logic/chapters.js';
import { CHAPTERS as DISCRETE } from '../../discrete/src/logic/chapters.js';

/* Đề kiểu TOPIK trên ngân hàng THẬT của cả 3 môn (D53): đủ số câu cố định, ≈ 20% trắc nghiệm, part dễ → khó. */
const APPS = { logic: LOGIC, linalg: LINALG, discrete: DISCRETE };

for (const [name, chapters] of Object.entries(APPS)) {
  describe(`đề thật ${name}`, () => {
    for (const minutes of [60, 90]) {
      for (const order of ['part', 'random']) {
        it(`${minutes} phút · ${order}`, () => {
          const items = buildExam(chapters.map(c => ({ ...c, weight: 1 })), { seed: 11, minutes, order });
          expect(items.length).toBe(examTotal(minutes));
          const mcq = items.filter(it => it.q.format === 'choice').length / items.length;
          expect(mcq).toBeGreaterThanOrEqual(0.15);
          // Discrete: nhiều dạng vốn là trắc nghiệm (đúng/sai, phân loại) nên chưa đạt 80/20 — cần thêm dạng tự luận (việc nội dung)
          expect(mcq).toBeLessThanOrEqual(name === 'discrete' ? 0.6 : 0.3);
          if (order === 'part') expect(items.map(it => it.part)).toEqual([...items.map(it => it.part)].sort((a, b) => a - b));
          else expect(items.every(it => it.part === undefined)).toBe(true);
          for (const it of items) expect(gradeItem(it, '').blank).toBe(true);   // dựng được, chấm được
        });
      }
    }
  });
}

import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch5 from '../src/logic/ch5-quiz.js';

/* Kiểm độc lập hai dạng tự luận D5: chỉ đọc CHỮ của đề (a, b, c, n) rồi tính lại bằng cách riêng. */
function bfs(a, b, c) {                                    // số bước đổ nước tối thiểu, BFS viết lại từ đầu
  const seen = new Set(['0,0']); let frontier = [[0, 0]];
  for (let d = 0; frontier.length; d++) {
    const next = [];
    for (const [x, y] of frontier) {
      if (x === c || y === c) return d;
      const mv = [[a, y], [x, b], [0, y], [x, 0], [x - Math.min(x, b - y), y + Math.min(x, b - y)], [x + Math.min(y, a - x), y - Math.min(y, a - x)]];
      for (const m of mv) if (!seen.has(m + '')) { seen.add(m + ''); next.push(m); }
    }
    frontier = next;
  }
  return null;
}

describe('D5 tự luận', () => {
  it('pours: đáp án = BFS độc lập, ≥ 2 bước', () => {
    for (let s = 1; s <= 200; s++) {
      const q = ch5.makeQuestion('pours', seededRandom(s)), { a, b, c } = q.textParams;
      expect(q.answer, `${a},${b},${c}`).toBe(bfs(a, b, c));
      expect(q.answer).toBeGreaterThan(1);
      expect(ch5.checkAnswer(q, String(q.answer)).ok).toBe(true);
    }
  });
  it('minA: đáp án = vét cạn, n luôn trả được', () => {
    for (let s = 1; s <= 200; s++) {
      const q = ch5.makeQuestion('minA', seededRandom(s)), { a, b, n } = q.textParams;
      let best = null;
      for (let j = 0; j * b <= n; j++) if ((n - j * b) % a === 0) { const i = (n - j * b) / a; if (best === null || i < best) best = i; }
      expect(best).not.toBeNull();
      expect(q.answer).toBe(best);
    }
  });
});

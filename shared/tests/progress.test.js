import { describe, it, expect } from 'vitest';
import { statsOf, recentStats, minutesSince, needOf, rankNeeds, studiedChapters, DAY } from '../logic/progress.js';

const NOW = Date.UTC(2026, 8, 24);
const ev = (daysAgo, prefix, kind, ok) => ({ ts: NOW - daysAgo * DAY, prefix, kind, ok, mode: 'practice' });

describe('nhật ký làm bài', () => {
  const log = [
    ev(1, 'c1q', 'convert', true), ev(1, 'c1q', 'convert', false), ev(2, 'c1q', 'gray', true),
    ev(10, 'c3q', 'sop', false), ev(10, 'c3q', 'sop', false),
  ];

  it('đếm câu và tỉ lệ đúng theo bộ lọc', () => {
    expect(statsOf(log)).toEqual({ attempts: 5, correct: 2, accuracy: 0.4 });
    expect(statsOf(log, { prefix: 'c1q', kind: 'convert' })).toEqual({ attempts: 2, correct: 1, accuracy: 0.5 });
    expect(statsOf(log, { prefix: 'c2q' }).accuracy).toBeNull();
  });

  it('7 ngày qua nếu có, không thì tổng cộng', () => {
    expect(recentStats(log, { prefix: 'c1q' }, NOW)).toMatchObject({ attempts: 3, scope: 'week' });
    expect(recentStats(log, { prefix: 'c3q' }, NOW)).toMatchObject({ attempts: 2, scope: 'all' });
  });

  it('phút học = tổng thời gian chuẩn, dạng lạ tính 60 giây', () => {
    expect(minutesSince(log, { c1q: { convert: 60, gray: 60 } }, NOW - 7 * DAY)).toBe(3);
    expect(minutesSince(log, {}, 0)).toBe(5);
  });

  it('độ cần: chưa làm 70 > mới làm 55; đủ số liệu thì theo % sai', () => {
    expect(needOf({ attempts: 0, accuracy: null })).toEqual({ need: 70, reason: 'new' });
    expect(needOf({ attempts: 3, accuracy: 1 })).toEqual({ need: 55, reason: 'few' });
    expect(needOf({ attempts: 10, accuracy: 0.2 })).toEqual({ need: 80, reason: 'weak' });
  });

  it('xếp hạng giữ thứ tự gốc khi bằng điểm', () => {
    const items = [{ prefix: 'c1q', kind: 'convert' }, { prefix: 'c2q', kind: 'identify' }, { prefix: 'c2q', kind: 'gate' }];
    expect(rankNeeds(log, items, NOW).map(x => x.kind)).toEqual(['identify', 'gate', 'convert']);
  });
});

describe('studiedChapters (D43)', () => {
  const chs = [{ id: 'ch1', prefix: 'c1q' }, { id: 'ch2', prefix: 'c2q' }, { id: 'ch8', prefix: 'c8q' }, { id: 'ch9' }];
  it('suy từ việc làm thật, mới nhất trước — không theo thứ tự syllabus', () => {
    const ev = [{ ts: 1, prefix: 'c1q' }, { ts: 5, prefix: 'c8q' }, { ts: 3, prefix: 'c1q' }, { ts: 9, prefix: 'zzz' }];
    expect(studiedChapters(chs, ev)).toEqual(['ch8', 'ch1']);
  });
  it('chưa làm câu nào = rỗng (nơi gọi tự lấy mọi chương)', () => {
    expect(studiedChapters(chs, [])).toEqual([]);
  });
});

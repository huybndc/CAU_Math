import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch2 from '../src/logic/ch2-quiz.js';
import { mano, NAMES, envOf, column, GATES } from './oracle-kit.js';

/* ---------------------------------------------------------------
   KIỂM ĐỘC LẬP LỜI GIẢI Ch2 — bảng chân trị (người học, 2026-09-25: lời giải phải luôn đúng, kiểm kĩ trước khi ra đề).
   Bộ đọc biểu thức Mano (oracle-kit.js) viết riêng, không import từ expr-parser.js;
   nó chỉ đọc thứ người học THẤY (biểu thức trong đề, các term trên hình mạch, tên cổng) rồi tính lại
   đáp án và TỪNG Ô của bảng trong lời giải. Hai bộ lệch nhau ⇒ test đỏ.
   --------------------------------------------------------------- */

/** Từng ô của bảng lời giải: cột 'm' = chỉ số dòng, cột biến = bit, '#1' = số ngõ bằng 1, còn lại là biểu thức (F = cả hàm). */
function checkTable(t, names, whole) {
  t.rows.forEach((r, m) => {
    const env = envOf(names, m);
    t.head.forEach((h, j) => {
      const want = h === 'm' ? m : h in env ? +env[h] : h === '#1' ? names.filter(v => env[v]).length : +(h === 'F' ? whole : mano(h))(env);
      expect(r[j], `dòng ${m}, cột ${h}`).toBe(want);
    });
  });
}

const tableOf = q => q.work.find(w => w.table)?.table;
const SEEDS = 300;
const each = (kind, fn) => it(kind, () => { for (let s = 1; s <= SEEDS; s++) fn(ch2.makeQuestion(kind, seededRandom(s))); });

describe('Ch2: bộ đọc Mano độc lập xác nhận đáp án và từng ô bảng chân trị trong lời giải', () => {
  each('column', q => {
    const names = NAMES[q.meta.n], f = mano(q.textParams.expr);
    expect(q.answer).toBe(column(f, names).join(''));
    checkTable(tableOf(q), names, f);
  });

  each('circuit', q => {
    // đọc biểu thức từ HÌNH MẠCH người học thấy: mỗi cổng AND một term, gom bằng OR
    const names = NAMES[q.meta.n], f = mano(q.figure.terms.map(t => t.join('')).join(' + '));
    expect(q.answer).toBe(column(f, names).join(''));
    checkTable(tableOf(q), names, f);
  });

  for (const kind of ['minterms', 'maxterms']) {
    each(kind, q => {
      const names = q.textParams.vars.split(', '), f = mano(q.textParams.expr);
      const want = column(f, names).flatMap((v, m) => (v === (kind === 'minterms' ? 1 : 0) ? [m] : []));
      expect(q.answer).toEqual(want);
      const t = tableOf(q);
      checkTable(t, names, f);
      expect(t.pick).toEqual(want);                     // dòng tô màu đúng là các dòng được chọn
    });
  }

  each('gate', q => {
    const names = NAMES[q.figure.n ?? 2], g = GATES[q.figure.gate];
    const f = env => g(names.map(v => env[v]));
    expect(q.answer).toBe(column(f, names).join(''));
    checkTable(tableOf(q), names, f);
  });
});

describe('bộ đọc Mano tự kiểm', () => {
  it('khớp các luật sách', () => {
    const n3 = NAMES[3];
    expect(column(mano("x + x'y"), n3)).toEqual(column(mano('x + y'), n3));
    expect(column(mano("(x + y)'"), n3)).toEqual(column(mano("x'y'"), n3));
    expect(column(mano("xy + x'z + yz"), n3)).toEqual(column(mano("xy + x'z"), n3));   // consensus
    expect(column(mano("x'y'z' + x'y'z"), n3).join('')).toBe('11000000');
  });
});

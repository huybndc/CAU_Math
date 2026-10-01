import { describe, it, expect } from 'vitest';
import { setVars, pasteBlock, loadTable, moveColumn } from '../logic/scratch-table.js';

describe('Nháp — bảng chân trị', () => {
  it('chọn số biến: 2^n hàng, biến đầu là bit cao; cột F/trung gian giữ chữ và dời theo', () => {
    const t3 = setVars({ cols: 4, cells: [] }, 3, 'logic');
    expect(t3.cells[0]).toEqual(['x', 'y', 'z', 'F']);
    expect(t3.cells[2]).toEqual(['0', '0', '1']);
    t3.cells[8][3] = '1';                              // người học ghi F ở dòng 111
    t3.cells[0][4] = "x'y";
    const t4 = setVars({ ...t3, cols: 5 }, 4, 'logic');
    expect(t4).toMatchObject({ rows: 16, cols: 6, vars: 4 });
    expect(t4.cells[0]).toEqual(['w', 'x', 'y', 'z', 'F', "x'y"]);
    expect(t4.cells[8]).toEqual(['0', '1', '1', '1', '1']);   // F đi theo dòng số 7
    expect(t4.cells[16].slice(0, 4)).toEqual(['1', '1', '1', '1']);
    expect(setVars(t4, 2, 'discrete').cells[0]).toEqual(['p', 'q', 'F', "x'y"]);
  });

  it('dán khối Tab/xuống dòng từ ô (r, c), nới bảng', () => {
    const t = pasteBlock({ rows: 2, cols: 2, cells: [] }, 2, 1, '1\t0\t1\r\n0\t0\t0\r\n');
    expect(t).toMatchObject({ rows: 3, cols: 4 });
    expect(t.cells[2]).toEqual(['', '1', '0', '1']);
    expect(t.cells[3]).toEqual(['', '0', '0', '0']);
  });

  it('bảng lưu cũ (chưa có số biến) đoán số biến theo số hàng', () => {
    expect(loadTable(JSON.stringify({ rows: 16, cols: 5, cells: [] }), 'logic').vars).toBe(4);
    expect(loadTable(null, 'logic')).toMatchObject({ rows: 8, vars: 3 });
  });

  it('kéo cột biểu thức: dời cả cột, cột biến đứng yên, vị trí không hợp lệ thì bỏ qua', () => {
    const t = setVars({ cols: 4, cells: [] }, 2, 'logic');          // x y | F
    t.cols = 5; t.cells[0][3] = 'G'; t.cells[0][4] = 'H';
    t.cells[1][2] = 'f1'; t.cells[1][3] = 'g1'; t.cells[1][4] = 'h1';
    const m = moveColumn(t, 4, 2);                                   // H lên đầu nhóm biểu thức
    expect(m.cells[0]).toEqual(['x', 'y', 'H', 'F', 'G']);
    expect(m.cells[1].slice(2)).toEqual(['h1', 'f1', 'g1']);
    expect(m.cells[0].slice(0, 2)).toEqual(['x', 'y']);
    expect(moveColumn(t, 0, 3)).toBe(t);                             // cột biến không dời
    expect(moveColumn(t, 3, 1)).toBe(t);                             // không chèn vào giữa cột biến
    expect(moveColumn(t, 3, 3)).toBe(t);
  });
});

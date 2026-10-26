/* Mẫu "Đề thi thử" của Linear Algebra, theo cấu trúc đề giữa kỳ thật bỏ phần Đúng/Sai (162/200 điểm). */
import { makeDot, makeCombo, makePlane, makeRankOne } from './mock-vectors.js';
import { makeParam, makeInverse, makeLdl, makeRref, makeSolvable } from './mock-systems.js';

// 120 phút / 200 điểm của đề thật ⇒ 0,6 phút mỗi điểm; đề rút còn 162 điểm ⇒ 97 phút.
export const LINALG_MOCK = {
  id: 'linalg', title: 'Linear Algebra — Practice Exam',
  // Số mục theo bản 4th (2009) của sách; chương 1–2 trùng bản 5th, chương 3 bản 5th gộp 3.3 vào 3.2 nên lệch.
  book: 'Gilbert Strang, Introduction to Linear Algebra (4th ed.)',
  minutesPerPoint: 120 / 200,
  makers: [makeDot, makeCombo, makeParam, makeInverse, makeLdl, makePlane, makeRankOne, makeRref, makeSolvable],
  refs: [
    [['1.2', 'Lengths and Dot Products']],
    [['2.1', 'Vectors and Linear Equations'], ['1.3', 'Matrices']],
    [['2.2', 'The Idea of Elimination'], ['2.3', 'Elimination Using Matrices']],
    [['2.5', 'Inverse Matrices'], ['2.7', 'Transposes and Permutations']],
    [['2.6', 'Elimination = Factorization: A = LU'], ['2.7', 'Transposes and Permutations']],
    [['3.1', 'Spaces of Vectors']],
    [['2.4', 'Rules for Matrix Operations']],
    [['3.2', 'The Nullspace of A: Solving Ax = 0'], ['3.3', 'The Rank and the Row Reduced Form']],
    [['3.4', 'The Complete Solution to Ax = b']],
  ],
};

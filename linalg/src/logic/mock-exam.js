/* Mẫu "Đề như thật" của Linear Algebra, theo cấu trúc đề giữa kỳ thật bỏ phần Đúng/Sai (162/200 điểm). */
import { makeDot, makeCombo, makePlane, makeRankOne } from './mock-vectors.js';
import { makeParam, makeInverse, makeLdl, makeRref, makeSolvable } from './mock-systems.js';

// 120 phút / 200 điểm của đề thật ⇒ 0,6 phút mỗi điểm; đề rút còn 162 điểm ⇒ 97 phút.
export const LINALG_MOCK = {
  id: 'linalg', title: 'Linear Algebra — Practice Exam',
  minutesPerPoint: 120 / 200,
  makers: [makeDot, makeCombo, makeParam, makeInverse, makeLdl, makePlane, makeRankOne, makeRref, makeSolvable],
};

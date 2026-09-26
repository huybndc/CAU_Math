/* ---------------------------------------------------------------
   Nhóm người học khoanh trên K-map → biểu thức đáp án (thuần).
   SOP: mỗi nhóm ô 1 là một tích, cộng lại. POS: mỗi nhóm ô 0 là một
   tổng (DeMorgan), nhân lại. Nhóm trùng nhau chỉ tính một lần.
   --------------------------------------------------------------- */

import { implicantToSOP, implicantToPOS, impKey } from './quine-mccluskey.js';

/** @param {{v:number,d:number}[]} imps  @returns {string} rỗng nếu chưa có nhóm nào */
export function groupsToExpr(imps, n, pos = false) {
  const seen = new Set();
  const uniq = imps.filter(i => !seen.has(impKey(i)) && seen.add(impKey(i)));
  if (!uniq.length) return '';
  return pos ? uniq.map(i => implicantToPOS(i, n)).join('') : uniq.map(i => implicantToSOP(i, n)).join(' + ');
}

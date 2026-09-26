/* ---------------------------------------------------------------
   PHƯƠNG ÁN NHIỄU CHO ĐỀ TRẮC NGHIỆM — Chương 3 (thuần).
   SOP/POS: biến thể sai MỘT bước của đáp án tối giản (nhóm quá lớn / quá nhỏ / bỏ nhóm)
   và dạng chính tắc đúng-nhưng-chưa-tối-giản. Đếm PI: nhầm PI với EPI. Ô K-map: đọc
   chỉ số hàng/cột thay vì mã Gray. XOR: nhầm hàm lẻ với hàm chẵn.
   --------------------------------------------------------------- */

import { mutantsOf, redundantSops } from './expr-mutate.js';
import { varNames, minimizeSOP } from './quine-mccluskey.js';
import { mapLayout, mintermPositions } from './kmap-layout.js';

const setText = list => `Σm(${list.join(', ')})`;

export function wrongOf(q, rnd) {
  const m = q.meta;
  switch (q.kind) {
    case 'sop': case 'pos': case 'dontcare': {
      const names = varNames(m.n);
      const canon = m.values.flatMap((v, i) => (v === 1
        ? [names.map((x, k) => x + ((i >> (m.n - 1 - k)) & 1 ? '' : "'")).join('')] : [])).join(' + ');
      return {
        correct: q.answer,
        candidates: [...(m.pos ? [] : redundantSops(m.values, m.n, q.answer)), ...mutantsOf(q.answer, m.n, rnd, 8), ...(m.pos ? [] : [canon])],
        extra: { figure: { type: 'kmap', n: m.n, values: m.values } },      // trắc nghiệm: đưa K-map ra thay vì bắt khoanh
      };
    }
    case 'pis': case 'epis': {
      const values = m.values;
      const best = minimizeSOP(values, m.n);
      const other = q.kind === 'pis' ? best.essential.length : best.pis.length;
      return { correct: String(q.answer), candidates: [String(other)] };    // nhầm PI với EPI
    }
    case 'cell': {
      const L = mapLayout(m.n);
      const pos = mintermPositions(L)[m.m];
      const colBits = Math.log2(L.colCodes.length);
      const byIndex = (pos.r << colBits) | pos.c;                          // đọc chỉ số hàng/cột thay vì mã Gray
      return { correct: String(q.answer), candidates: [byIndex, m.m ^ 1, m.m ^ 2, m.m ^ 4].map(String) };
    }
    case 'xor': {
      const all = [...Array(1 << m.n).keys()];
      return { correct: q.answerText, candidates: [setText(all.filter(v => !q.answer.includes(v)))] };   // hàm lẻ ↔ chẵn
    }
    default: return null;
  }
}

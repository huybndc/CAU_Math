/* ---------------------------------------------------------------
   RÚT GỌN K-MAP TỪNG BƯỚC (công cụ Chương 3) — thuần, không biết ngôn ngữ.
   Thay kmap-explain.js (bước cũ chỉ in một dòng F = … mỗi bước).

   readFunction(text, n) — nhận CẢ HAI cách viết hàm:
     'Σm(1, 3, 5) + d(0)' / 'ΠM(0, 2)'     → giá trị ô
     "x'y + wz'"                            → khai triển từng term thiếu biến thành minterm
   walk(values, n, pos) — chuỗi bước: điền ô → các nhóm lớn nhất → từng nhóm được chọn
     (ô nào, biến nào đổi nên bị khử, giữ biến nào ⇒ term, vì sao chọn) → ghép kết quả.
   Mỗi bước mang `groups` (implicant cần vẽ) và `focus` (nhóm của bước này) để UI tô K-map.
   --------------------------------------------------------------- */

import { exprTruthTable, parseSpec, varsCount } from './expr-parser.js';
import { sopTerms } from './nand-conversion.js';
import {
  varNames, minimizeSOP, minimizePOS, splitValues, impCovers, implicantMinterms,
  implicantToSOP, implicantToPOS, totalLiterals,
} from './quine-mccluskey.js';

/** Chuỗi là Σm / ΠM / d(…) chứ không phải biểu thức theo tên biến. */
export const isSpec = text => /[Σ∑Π∏]|(^|[^A-Za-z])[mMd]\s*\(/.test(String(text));

/**
 * @returns {{ n, values, source: 'spec'|'expr', expand: {term, missing: string[], minterms: number[]}[] | null }}
 *   expand = null khi biểu thức không phải tổng các tích (có ngoặc…) — khi đó đi thẳng qua bảng chân trị.
 */
export function readFunction(text, n) {
  const src = String(text).trim().replace(/^F\s*(\([^)]*\))?\s*=\s*/i, '');
  if (isSpec(src)) return { n, values: parseSpec(src, n), source: 'spec', expand: null };
  const need = Math.max(n, varsCount(src));
  const values = exprTruthTable(src, need);
  let expand = null;
  try {
    const names = varNames(need);
    expand = sopTerms(src, need).map(term => {
      const has = new Set([...term.toLowerCase()].filter(c => names.includes(c)));
      return {
        term,
        missing: names.filter(v => !has.has(v)),
        minterms: exprTruthTable(term, need).flatMap((v, m) => (v ? [m] : [])),
      };
    });
  } catch { /* không phải SOP phẳng: bảng chân trị là đủ */ }
  return { n: need, values, source: 'expr', expand };
}

/** Biến đổi giá trị trong nhóm (bị khử) và biến giữ nguyên kèm giá trị. */
export function groupVars(imp, n) {
  const names = varNames(n);
  const drop = [], keep = [];
  names.forEach((name, k) => {
    const bit = n - 1 - k;
    if ((imp.d >> bit) & 1) drop.push(name);
    else keep.push({ v: name, value: (imp.v >> bit) & 1 });
  });
  return { drop, keep };
}

/**
 * @param {number[]} values  0 | 1 | 2 (X)
 * @param {boolean} pos      rút gọn POS (khoanh ô 0) thay vì SOP
 * @returns {Array<{ kind: 'read'|'primes'|'group'|'result', groups: object[], focus?: object, … }>}
 */
export function walk(values, n, pos = false) {
  const { ones, zeros, dcs } = splitValues(values);
  const target = pos ? zeros : ones;                      // ô cần phủ
  const best = pos ? minimizePOS(values, n) : minimizeSOP(values, n);
  const termOf = imp => (pos ? implicantToPOS(imp, n) : implicantToSOP(imp, n));
  const steps = [{ kind: 'read', pos, cells: target, dcs, groups: [] }];

  if (!target.length || target.length + dcs.length === values.length) {   // hằng số: không có gì để khoanh
    steps.push({ kind: 'result', pos, expr: best.expr, constant: true, literals: 0, terms: 0, groups: [] });
    return steps;
  }

  steps.push({ kind: 'primes', pos, count: best.pis.length, groups: best.pis.map(imp => ({ imp, dashed: true })) });

  const chosen = [];
  let left = target.slice();
  const order = [...best.essential, ...best.cover.filter(i => !best.essential.includes(i))];
  for (const i of order) {
    const imp = best.pis[i];
    const ess = best.essential.includes(i);
    const cells = implicantMinterms(imp, n);
    // essential: có ô chỉ nhóm này phủ ; thêm: phủ các ô còn trống
    const only = ess ? target.filter(m => impCovers(imp, m) && best.pis.every((p, j) => j === i || !impCovers(p, m))) : [];
    const covers = left.filter(m => impCovers(imp, m));
    left = left.filter(m => !impCovers(imp, m));
    chosen.push(imp);
    steps.push({
      kind: 'group', pos, ess, imp, cells, term: termOf(imp), ...groupVars(imp, n),
      only, covers, left: left.slice(),
      focus: imp, groups: chosen.map(p => ({ imp: p, essential: best.essential.some(j => best.pis[j] === p) })),
    });
  }

  steps.push({
    kind: 'result', pos, expr: best.expr, terms: best.terms.length, literals: totalLiterals(best.terms, n),
    groups: best.terms.map(t => ({ imp: t.imp, essential: t.essential })),
  });
  return steps;
}

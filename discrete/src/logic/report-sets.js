import { fail } from '@shared/logic/app-error.js';

/* ---------------------------------------------------------------
   MÁY GIẢI TẬP HỢP (D3) và TỔNG (D4). Thuần: chỉ khoá từ điển. Trả { answer, steps, check? } cho shared/ui/solver.js.
   --------------------------------------------------------------- */

const MAX_ELEMS = 40;

/** "{1, 2, 3}" | "1 2 3" | "a,b" → mảng phần tử không trùng (số xếp theo giá trị, còn lại theo chữ). */
export function parseSet(text) {
  const items = String(text).replace(/[{}()]/g, ' ').split(/[,;\s]+/).filter(Boolean);
  const uniq = [...new Set(items)];
  if (uniq.length > MAX_ELEMS) fail('ds.tooMany', { n: MAX_ELEMS });
  return uniq.every(x => /^-?\d+$/.test(x)) ? uniq.sort((x, y) => x - y) : uniq.sort();
}
const show = a => `{${a.join(', ')}}`;
const order = (a, ref) => [...a].sort((x, y) => ref.indexOf(x) - ref.indexOf(y));

export function setReport(aText, bText, uText = '') {
  const A = parseSet(aText), B = parseSet(bText);
  const base = parseSet([...A, ...B].join(' '));
  const U = uText.trim() ? parseSet(uText) : base;
  const missing = [...A, ...B].find(x => !U.includes(x));
  if (missing !== undefined) fail('ds.notInU', { x: missing });
  const inB = new Set(B), inA = new Set(A);
  const union = order([...new Set([...A, ...B])], U), inter = A.filter(x => inB.has(x));
  const aMinusB = A.filter(x => !inB.has(x)), bMinusA = B.filter(x => !inA.has(x));
  const sym = order([...aMinusB, ...bMinusA], U);
  const compA = U.filter(x => !inA.has(x)), compB = U.filter(x => !inB.has(x));
  const op = (key, m) => ({ key, m });
  return {
    answer: [op('ds.union', show(union)), op('ds.inter', show(inter)), op('ds.aMinusB', show(aMinusB)), op('ds.sym', show(sym))],
    steps: [
      {
        group: 'ds.tabOps', head: { key: 'ds.stOps' }, why: { key: 'ds.whyOps' },
        lines: [op('ds.bMinusA', show(bMinusA)), op('ds.compA', show(compA)), op('ds.compB', show(compB)), `U = ${show(U)}`],
      },
      {
        group: 'ds.tabCount', head: { key: 'ds.stCount' }, why: { key: 'ds.whyIncl' },
        lines: [`|A| = ${A.length},  |B| = ${B.length},  |A ∩ B| = ${inter.length}`,
          `|A ∪ B| = ${A.length} + ${B.length} − ${inter.length} = ${A.length + B.length - inter.length}`,
          op('ds.power', `|P(A)| = 2^${A.length} = ${2 ** A.length},  |P(B)| = 2^${B.length} = ${2 ** B.length}`),
          op('ds.product', `|A × B| = ${A.length}·${B.length} = ${A.length * B.length}`)],
      },
    ],
  };
}

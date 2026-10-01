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

export const SUMS = ['arith', 'geom', 'squares', 'cubes', 'odd'];
const MAX_SAFE = 1e15;

/** Tổng đóng của n số hạng đầu; p = [a₁, d | r] (cấp số cộng / nhân). Kiểm bằng cộng trực tiếp. */
export function sumReport(kind, n, p1 = 1, p2 = 1) {
  if (!SUMS.includes(kind)) fail('err.badQuizKind', { kind });
  if (!Number.isInteger(n) || n < 1 || n > 60) fail('ds.badN');
  const terms = Array.from({ length: n }, (_, i) => {
    const k = i + 1;
    return kind === 'arith' ? p1 + i * p2 : kind === 'geom' ? p1 * p2 ** i : kind === 'squares' ? k * k : kind === 'cubes' ? k ** 3 : 2 * k - 1;
  });
  const direct = terms.reduce((s, x) => s + x, 0);
  if (!Number.isSafeInteger(direct) || Math.abs(direct) > MAX_SAFE) fail('ds.tooBig');
  let formula, plug, value;
  if (kind === 'arith') { formula = 'S = n(2a + (n − 1)d)/2'; plug = `S = (${n}·(2·${p1} + ${n - 1}·${p2}))/2`; value = n * (2 * p1 + (n - 1) * p2) / 2; }
  else if (kind === 'geom') {
    if (p2 === 0) fail('ds.badRatio');
    formula = 'S = a(rⁿ − 1)/(r − 1)';
    if (p2 === 1) { plug = `r = 1 ⇒ S = n·a = ${n}·${p1}`; value = n * p1; }
    else { plug = `S = (${p1}·(${p2}^${n} − 1))/(${p2} − 1)`; value = p1 * (p2 ** n - 1) / (p2 - 1); }
  } else if (kind === 'squares') { formula = 'S = n(n + 1)(2n + 1)/6'; plug = `S = (${n}·${n + 1}·${2 * n + 1})/6`; value = n * (n + 1) * (2 * n + 1) / 6; }
  else if (kind === 'cubes') { formula = 'S = (n(n + 1)/2)²'; plug = `S = ((${n}·${n + 1})/2)²`; value = (n * (n + 1) / 2) ** 2; }
  else { formula = 'S = n²'; plug = `S = ${n}²`; value = n * n; }
  const head = terms.length > 8 ? `${terms.slice(0, 4).join(' + ')} + … + ${terms.at(-1)}` : terms.join(' + ');
  return {
    answer: [{ key: 'ds.sumIs', m: `S = ${String(value).replace('-', '−')}` }],
    steps: [
      { head: { key: 'ds.stFormula' }, why: { key: `ds.why.${kind}` }, lines: [formula, plug, `S = ${String(value).replace('-', '−')}`] },
      { head: { key: 'ds.stCheck' }, why: { key: 'ds.whyCheck' }, lines: [`${head} = ${String(direct).replace('-', '−')}`, value === direct ? { key: 'ds.match' } : { key: 'ds.mismatch' }] },
    ],
    check: t => { const v = Number(String(t).replace(/[−–]/g, '-').match(/-?\d+/)?.[0]); return v === value; },
  };
}

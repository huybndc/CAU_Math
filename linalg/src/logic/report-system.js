import { solve, residual, systemStrings } from './linear-system.js';
import { eliminationE, inverseSteps } from './elementary.js';
import { ldu, solveLdu, checkLdu } from './ldu.js';
import { fmtAug, fmtMat } from './quiz-kit.js';
import { fmt, fmtCol, parseNums, near } from './num-format.js';
import { formatRowOp } from './elimination.js';
import { multiply, checkMatrix, shape } from './matrix.js';
import { sub } from './report-vector.js';

/* ---------------------------------------------------------------
   MÁY GIẢI HỆ Ax = b. Ba ngăn: "Cách làm" (khử xuôi · khử ngược + nghiệm · kiểm), "E · P · LU", "Nghịch đảo".
   Mỗi ngăn tối đa 3 bước; vector viết dạng cột. Cùng định dạng với report-vector.js. Thuần: không đụng DOM.
   --------------------------------------------------------------- */

const arrow = s => s.replace('<->', '↔').replace('<-', '←');
const NAMES = ['x', 'y', 'z', 'w'];
const varName = (i, n) => (n <= 4 ? NAMES[i] : `x${sub(i + 1)}`);
const TAB_ELU = 'ss.tabELU', TAB_INV = 'ss.tabInv';
const opLine = s => `${arrow(s.formula)}:   ${fmtAug(s.matrix)}`;

/** Nghiệm tổng quát dạng cột: "[1; 0; 2] + t·[2; 1; 0]". */
function generalCols(r) {
  const letters = ['t', 's', 'u', 'r'];
  return fmtCol(r.particular) + r.special.map((sv, i) => ` + ${letters[i] || 'k' + i}·${fmtCol(sv)}`).join('');
}

export function systemReport(A, b) {
  checkMatrix(A);
  const { rows: m, cols: n } = shape(A);
  const r = solve(A, b);
  const steps = [];
  const answer = [{ key: 'ss.rank', params: { a: r.rankA, b: r.rankAug } }];

  if (r.type === 'unique') answer.unshift(...r.solution.map((x, i) => `${varName(i, n)} = ${fmt(x)}`));
  else if (r.type === 'infinite') answer.unshift({ key: 'ss.many', params: { k: r.freeCount } }, `x = ${generalCols(r)}`);
  else answer.unshift({ key: 'ss.none' });

  // 1) khử xuôi: hệ + ma trận mở rộng + từng phép (hàng của cột không có trụ được ghi chú)
  const fwd = [...systemStrings(A, b), fmtAug(r.start)];
  for (const s of r.forwardSteps) fwd.push(s.formula ? opLine(s) : { key: 'ss.freeCol', params: { c: s.freeCol + 1 } });
  steps.push({ why: { key: 'ww.forward' }, head: { key: 'ss.stForward', params: { k: r.forwardSteps.filter(s => s.formula).length } }, lines: fwd });
  if (r.type === 'none') {
    steps.push({ head: { key: 'ss.stWhyNone' }, lines: [{ key: 'ss.whyNone', params: { r: r.badRow + 1 } }, fmtAug(r.ref)] });
    return { answer, steps };
  }

  // 2) khử ngược + đọc nghiệm
  const back = r.backwardSteps.filter(s => s.formula).map(opLine);
  back.push({ key: 'ss.pivots', params: { p: r.pivotCols.map(c => varName(c, n)).join(', ') } });
  if (r.freeCols.length) back.push({ key: 'ss.frees', params: { f: r.freeCols.map(c => varName(c, n)).join(', ') } });
  back.push(`x = ${r.type === 'unique' ? fmtCol(r.solution) : generalCols(r)}`);
  steps.push({ why: { key: 'ww.back' }, head: { key: 'ss.stBack' }, lines: back });

  // 3) kiểm
  const x = r.solution ?? r.particular;
  steps.push({ head: { key: 'ss.stCheck' }, lines: [`A·${fmtCol(x)} = ${fmtCol(multiply(A, x.map(v => [v])).map(row => row[0]))}`, `b = ${fmtCol(b)}  ${residual(A, x, b) < 1e-9 ? '✓' : '✗'}`] });

  // ngăn E · P · LU (Strang 2.3, 2.6)
  const e = eliminationE(A);
  if (e.steps.length) {
    steps.push({
      group: TAB_ELU, why: { key: 'ww.elu' }, head: { key: 'ss.stE' },
      lines: [
        { key: 'ss.eNote' },
        ...e.steps.map((s, i) => `E${sub(i + 1)} = ${fmtMat(s.E)}   (${arrow(formatRowOp(s.op))})`),
        { key: 'ss.eProd', m: `E${sub(e.steps.length)}…E₁ = ${fmtMat(e.product)}` },
        `E${sub(e.steps.length)}…E₁·A = U = ${fmtMat(e.U)}`,
      ],
    });
  }
  const f = ldu(A);
  const hasSwap = f.swaps.length > 0;
  steps.push({
    group: TAB_ELU, why: { key: 'ww.lu' }, head: { key: hasSwap ? 'ss.stPLU' : 'ss.stLU' },
    lines: [
      { key: 'ss.luNote' },
      ...f.steps.map(s => `ℓ${sub(s.row + 1)}${sub(s.pivotRow + 1)} = ${fmt(s.k)}`),
      ...(hasSwap ? [`P = ${fmtMat(f.P)}`] : []),
      `L = ${fmtMat(f.L)}`,
      `U = ${fmtMat(f.U)}`,
      `${hasSwap ? 'P·A' : 'A'} = ${fmtMat(multiply(f.P, A))} = L·U  ${checkLdu(A, f) ? '✓' : '✗'}`,
    ],
  });
  if (m === n && f.invertible) {
    const s = solveLdu(f, b);
    steps.push({
      group: TAB_ELU, why: { key: 'ww.solveLU' }, head: { key: 'ss.stSolveLU' },
      lines: [`${hasSwap ? 'P·b' : 'b'} = ${fmtCol(s.pb)}`, { key: 'ss.fwdSub', m: `c = ${fmtCol(s.c)}` }, { key: 'ss.scaleD', m: `y = ${fmtCol(s.y)}` }, { key: 'ss.backSub', m: `x = ${fmtCol(s.x)}` }],
    });
  }
  // ngăn Nghịch đảo
  if (m === n) {
    const inv = inverseSteps(A);
    steps.push({
      group: TAB_INV, why: { key: 'ww.inverse' }, head: { key: 'ss.stInverse' },
      lines: inv.invertible
        ? [`[A | I] = ${fmtMat(inv.start)}`, ...[...inv.forwardSteps, ...inv.backwardSteps].filter(s => s.formula).map(s => `${arrow(s.formula)}:   ${fmtMat(s.matrix)}`), `A⁻¹ = ${fmtMat(inv.inverse)}`]
        : [{ key: 'ss.notInv', params: { r: inv.rank, n } }],
    });
  }
  return { answer, steps, ...(r.type === 'unique' ? { check: t => { const v = parseNums(t); return v.length === n && v.every((c, i) => near(c, r.solution[i], 1e-6)); } } : {}) };
}

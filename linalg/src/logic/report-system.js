import { solve, generalSolutionString, residual, systemStrings } from './linear-system.js';
import { eliminationE, inverseSteps } from './elementary.js';
import { ldu, solveLdu, checkLdu } from './ldu.js';
import { fmtAug, fmtMat } from './quiz-kit.js';
import { fmt, fmtVec } from './num-format.js';
import { formatRowOp } from './elimination.js';
import { multiply } from './matrix.js';
import { sub } from './report-vector.js';
import { checkMatrix, shape } from './matrix.js';

/* ---------------------------------------------------------------
   MÁY GIẢI HỆ Ax = b: nghiệm + khử Gauss từng cột + ma trận E + PA = LU + giải qua LU + nghịch đảo.
   Cùng định dạng với report-vector.js. Thuần: không đụng DOM.
   --------------------------------------------------------------- */

const arrow = s => s.replace('<->', '↔').replace('<-', '←');
const NAMES = ['x', 'y', 'z', 'w'];
const varName = (i, n) => (n <= 4 ? NAMES[i] : `x${sub(i + 1)}`);

/** Các phép của khử xuôi gom theo cột trụ: một bước gập cho mỗi cột. */
function groupByColumn(steps) {
  const groups = [];
  for (const s of steps) {
    const col = s.pivot ? s.pivot.col : s.freeCol;
    let g = groups.at(-1);
    if (!g || g.col !== col) groups.push(g = { col, lines: [] });
    g.lines.push(s.formula ? `${arrow(s.formula)}:   ${fmtAug(s.matrix)}` : { key: 'ss.freeCol', params: { c: col + 1 } });
  }
  return groups;
}

export function systemReport(A, b) {
  checkMatrix(A);
  const { rows: m, cols: n } = shape(A);
  const r = solve(A, b);
  const steps = [];
  const answer = [{ key: 'ss.rank', params: { a: r.rankA, b: r.rankAug } }];

  if (r.type === 'unique') answer.unshift(...r.solution.map((x, i) => `${varName(i, n)} = ${fmt(x)}`));
  else if (r.type === 'infinite') answer.unshift({ key: 'ss.many', params: { k: r.freeCount } }, `x = ${generalSolutionString(r)}`);
  else answer.unshift({ key: 'ss.none' });

  steps.push({ head: { key: 'ss.stSetup' }, lines: [...systemStrings(A, b), fmtAug(r.start)] });
  for (const g of groupByColumn(r.forwardSteps)) steps.push({ head: { key: 'ss.stCol', params: { c: g.col + 1 } }, lines: g.lines });
  if (r.type === 'none') {
    steps.push({ head: { key: 'ss.stWhyNone' }, lines: [{ key: 'ss.whyNone', params: { r: r.badRow + 1 } }, fmtAug(r.ref)] });
    return { answer, steps };
  }
  if (r.backwardSteps.length) {
    steps.push({ head: { key: 'ss.stBack' }, lines: r.backwardSteps.filter(s => s.formula).map(s => `${arrow(s.formula)}:   ${fmtAug(s.matrix)}`) });
  }
  const read = [{ key: 'ss.pivots', params: { p: r.pivotCols.map(c => varName(c, n)).join(', ') } }];
  if (r.freeCols.length) read.push({ key: 'ss.frees', params: { f: r.freeCols.map(c => varName(c, n)).join(', ') } });
  read.push(`x = ${generalSolutionString(r)}`);
  steps.push({ head: { key: 'ss.stRead' }, lines: read });
  const x = r.solution ?? r.particular;
  steps.push({ head: { key: 'ss.stCheck' }, lines: [`A·${fmtVec(x)} = ${fmtVec(multiply(A, x.map(v => [v])).map(row => row[0]))}`, `b = ${fmtVec(b)}  ${residual(A, x, b) < 1e-9 ? '✓' : '✗'}`] });

  // ma trận E, P, L — phần giáo trình (Strang 2.3, 2.6)
  const e = eliminationE(A);
  if (e.steps.length) {
    steps.push({
      head: { key: 'ss.stE' },
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
    head: { key: hasSwap ? 'ss.stPLU' : 'ss.stLU' },
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
      head: { key: 'ss.stSolveLU' },
      lines: [`${hasSwap ? 'P·b' : 'b'} = ${fmtVec(s.pb)}`, { key: 'ss.fwdSub', m: `c = ${fmtVec(s.c)}` }, { key: 'ss.scaleD', m: `y = ${fmtVec(s.y)}` }, { key: 'ss.backSub', m: `x = ${fmtVec(s.x)}` }],
    });
  }
  if (m === n) {
    const inv = inverseSteps(A);
    if (inv.invertible) {
      steps.push({
        head: { key: 'ss.stInverse' },
        lines: [`[A | I] = ${fmtMat(inv.start)}`, ...[...inv.forwardSteps, ...inv.backwardSteps].filter(s => s.formula).map(s => `${arrow(s.formula)}:   ${fmtMat(s.matrix)}`),
          `A⁻¹ = ${fmtMat(inv.inverse)}`],
      });
    } else steps.push({ head: { key: 'ss.stInverse' }, lines: [{ key: 'ss.notInv', params: { r: inv.rank, n } }] });
  }
  return { answer, steps };
}


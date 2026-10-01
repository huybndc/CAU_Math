import { forward } from './elimination.js';
import { solve } from './linear-system.js';
import { columnSpaceBasis, nullSpaceBasis, rowSpaceBasis, dimensions, isIndependent, matrixFromColumns } from './subspace.js';
import { columns, checkMatrix, shape, multiply } from './matrix.js';
import { fmtMat } from './quiz-kit.js';
import { fmt, fmtVec, fmtParen } from './num-format.js';
import { sub } from './report-vector.js';

/* ---------------------------------------------------------------
   MÁY GIẢI KHÔNG GIAN: cơ sở C(A), N(A), C(Aᵀ), số chiều, các cột có độc lập không.
   Cùng định dạng với report-vector.js. Thuần: không đụng DOM.
   --------------------------------------------------------------- */

const list = vs => (vs.length ? vs.map(fmtVec).join(',  ') : '{0}');

export function spaceReport(A) {
  checkMatrix(A);
  const { rows: m, cols: n } = shape(A);
  const d = dimensions(A);
  const colB = columnSpaceBasis(A), rowB = rowSpaceBasis(A), nullB = nullSpaceBasis(A);
  const fw = forward(A.map(r => [...r, 0]));
  const pivotCols = fw.pivots.map(p => p.col);
  const freeCols = Array.from({ length: n }, (_, i) => i).filter(i => !pivotCols.includes(i));
  const U = fw.matrix.map(r => r.slice(0, n));
  const answer = [
    { key: 'sp.dims', params: { r: d.rank, nul: d.nullDim, n } },
    { key: 'sp.basisCol', m: list(colB) },
    { key: 'sp.basisNull', m: list(nullB) },
    { key: 'sp.basisRow', m: list(rowB) },
  ];
  const steps = [
    { head: { key: 'sp.stRef' }, lines: [`A = ${fmtMat(A)}`, `U = ${fmtMat(U)}`, { key: 'sp.pivotInfo', params: { p: pivotCols.map(c => c + 1).join(', '), f: freeCols.length ? freeCols.map(c => c + 1).join(', ') : '—' } }] },
    { head: { key: 'sp.stCol' }, lines: [{ key: 'sp.colRule' }, ...pivotCols.map(c => `a${sub(c + 1)} = ${fmtVec(columns(A)[c])}`)] },
    { head: { key: 'sp.stNull' }, lines: nullB.length
      ? [{ key: 'sp.nullRule' }, ...nullB.map((s, i) => `s${sub(i + 1)} = ${fmtVec(s)}   (x${sub(freeCols[i] + 1)} = 1)`)]
      : [{ key: 'sp.nullTrivial' }] },
    { head: { key: 'sp.stRow' }, lines: [{ key: 'sp.rowRule' }, ...rowB.map(fmtVec)] },
    { head: { key: 'sp.stRank' }, lines: [`rank + dim N(A) = ${d.rank} + ${d.nullDim} = ${n}  ✓`, ...nullB.map((s, i) => `A·s${sub(i + 1)} = ${fmtVec(multiply(A, s.map(v => [v])).map(r => r[0]))}`)] },
  ];
  // các cột có độc lập không? phụ thuộc thì chỉ ra cột nào bằng tổ hợp của cột nào (đọc từ RREF)
  const cols = columns(A);
  const lines = [];
  if (isIndependent(cols)) lines.push({ key: 'sp.indep' });
  else {
    lines.push({ key: 'sp.dep' });
    const r = solve(A, new Array(m).fill(0));
    r.special.forEach((s, i) => {
      const f = r.freeCols[i];
      const rel = r.pivotCols.filter(c => s[c] !== 0).map(c => `${fmtParen(-s[c])}·a${sub(c + 1)}`).join(' + ') || '0';
      lines.push(`a${sub(f + 1)} = ${rel}`);
    });
  }
  lines.push({ key: m === n && d.rank === n ? 'sp.isBasis' : 'sp.notBasis', params: { m } });
  steps.push({ head: { key: 'sp.stIndep' }, lines });
  return { answer, steps };
}

import * as V from './vector.js';
import { fmt, fmtVec, fmtParen, near, clean } from './num-format.js';
import { sqrtText, specialAngle } from './radical.js';
import { solve, generalSolutionString, residual, systemStrings } from './linear-system.js';
import { matrixFromColumns, isIndependent } from './subspace.js';
import { fmtAug } from './quiz-kit.js';
import { fail } from '@shared/logic/app-error.js';

/* ---------------------------------------------------------------
   MÁY GIẢI VECTOR: độ dài, góc, chiếu… kèm lời giải gập từng bước.
   Trả { answer: dòng[], steps: { head: {key, params}, lines: dòng[] }[] };
   dòng = chuỗi toán thuần | { key, params, m } (xem shared/ui/question.js stepLine). Thuần: không đụng DOM.
   --------------------------------------------------------------- */

const SUB = '₀₁₂₃₄₅₆₇₈₉';
export const sub = i => String(i).split('').map(d => SUB[d]).join('');
const sq = x => fmtParen(x) + '²';
const rad = x => sqrtText(x);

/** "|v| = √(1² + 2² + 2²) = √9 = 3" */
function normLine(name, v) {
  const n2 = V.norm2(v);
  const inside = v.map(sq).join(' + ');
  const r = rad(n2);
  return `|${name}| = √(${inside}) = √${fmt(n2)} = ${r}`;
}

const dotLine = (a, b, an, bn) => {
  const terms = a.map((x, i) => `${fmtParen(x)}·${fmtParen(b[i])}`).join(' + ');
  return `${an}·${bn} = ${terms} = ${fmt(V.dot(a, b))}`;
};

/** v một vector, hoặc cả v và w. */
export function vectorReport(v, w = null) {
  V.checkVector(v);
  const steps = [];
  const answer = [`|v| = ${rad(V.norm2(v))}`];
  steps.push({ head: { key: 'sv.stNorm' }, lines: [normLine('v', v), ...(w ? [normLine('w', w)] : [])] });
  if (w) V.sameDim(v, w);
  if (w) V.checkVector(w);
  if (w) answer.push(`|w| = ${rad(V.norm2(w))}`);

  if (!V.isZero(v)) {
    const u = V.normalize(v), n = V.norm(v);
    steps.push({ head: { key: 'sv.stUnit' }, lines: [`v / |v| = (1/${rad(V.norm2(v))})·${fmtVec(v)} ≈ ${fmtVec(u.map(x => Number(x.toFixed(4))))}`] });
  }
  if (!w) return { answer, steps };

  const d = V.dot(v, w);
  answer.push(`v·w = ${fmt(d)}`);
  steps.push({ head: { key: 'sv.stDot' }, lines: [dotLine(v, w, 'v', 'w')] });

  if (!V.isZero(v) && !V.isZero(w)) {
    const nv = V.norm(v), nw = V.norm(w);
    const cos = Math.min(1, Math.max(-1, d / (nv * nw)));
    const deg = clean(Math.acos(cos) * 180 / Math.PI);
    const sp = specialAngle(deg);
    answer.push(`θ = ${sp ? `${fmt(Math.round(deg))}° = ${sp}` : `${fmt(Number(deg.toFixed(2)))}°`}`);
    steps.push({
      head: { key: 'sv.stAngle' },
      lines: [
        `cos θ = v·w / (|v|·|w|) = ${fmt(d)} / (${rad(V.norm2(v))}·${rad(V.norm2(w))}) ≈ ${fmt(Number(cos.toFixed(4)))}`,
        `θ = arccos(${fmt(Number(cos.toFixed(4)))}) ≈ ${fmt(Number(deg.toFixed(2)))}° ≈ ${fmt(Number((deg * Math.PI / 180).toFixed(4)))} rad${sp ? ` = ${sp}` : ''}`,
      ],
    });
    const k = d / V.norm2(w);
    const p = V.projection(v, w);
    steps.push({
      head: { key: 'sv.stProj' },
      lines: [
        `proj_w v = (v·w / w·w)·w = (${fmt(d)}/${fmt(V.norm2(w))})·${fmtVec(w)} = ${fmtVec(p)}`,
        `v − proj_w v = ${fmtVec(V.perpendicular(v, w))}  (${'⟂ w'})`,
        { key: 'sv.scalarProj', params: { n: fmt(Number(V.scalarProjection(v, w).toFixed(4))) } },
      ],
    });
    const rel = [];
    rel.push({ key: V.isOrthogonal(v, w) ? 'sv.orth' : 'sv.notOrth' });
    rel.push({ key: V.isParallel(v, w) ? 'sv.par' : 'sv.notPar' });
    rel.push(`|v·w| = ${fmt(Math.abs(d))} ≤ |v|·|w| = ${fmt(Number((nv * nw).toFixed(4)))}  (Cauchy–Schwarz)`);
    steps.push({ head: { key: 'sv.stRel' }, lines: rel });
    if (V.isOrthogonal(v, w)) answer.push({ key: 'sv.orth' });
    else if (V.isParallel(v, w)) answer.push({ key: 'sv.par' });
  }
  return { answer, steps };
}

/** w có phải tổ hợp tuyến tính của các vector không? Nếu có thì hệ số là gì. */
export function comboReport(vectors, w) {
  if (!vectors.length) fail('err.noVectors', {});
  vectors.forEach(V.checkVector);
  V.checkVector(w);
  vectors.forEach(v => V.sameDim(v, w));
  const A = matrixFromColumns(vectors);
  const r = solve(A, w);
  const names = vectors.map((_, i) => `c${sub(i + 1)}`);
  const steps = [
    { head: { key: 'sv.stCombo' }, lines: [`${names.map((n, i) => `${n}·v${sub(i + 1)}`).join(' + ')} = w`, ...systemStrings(A, w)] },
    { head: { key: 'sv.stGauss' }, lines: [fmtAug(r.start), ...[...r.forwardSteps, ...r.backwardSteps].filter(s => s.formula)
      .map(s => `${s.formula.replace('<->', '↔').replace('<-', '←')}:   ${fmtAug(s.matrix)}`)] },
  ];
  const answer = [];
  if (r.type === 'none') {
    answer.push({ key: 'sv.notCombo' });
  } else {
    const c = r.type === 'unique' ? r.solution : r.particular;
    const term = (x, i) => `${fmtParen(x)}·v${sub(i + 1)}`;
    answer.push({ key: 'sv.isCombo' });
    answer.push(`w = ${c.map(term).join(' + ')}`);
    if (r.type === 'infinite') answer.push({ key: 'sv.manyWays' });
    steps.push({
      head: { key: 'sv.stCheck' },
      lines: [`${c.map(term).join(' + ')} = ${fmtVec(V.combine(c, vectors))}`, `w = ${fmtVec(w)}  ${residual(A, c, w) < 1e-9 ? '✓' : '✗'}`,
        ...(r.type === 'infinite' ? [`${generalSolutionString(r)}`] : [])],
    });
  }
  steps.push({ head: { key: 'sv.stIndep' }, lines: [{ key: isIndependent(vectors) ? 'sv.indep' : 'sv.dep' }] });
  return { answer, steps };
}

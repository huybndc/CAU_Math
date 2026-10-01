import * as V from './vector.js';
import { fmt, fmtCol, fmtParen, clean, fmtDec } from './num-format.js';
import { sqrtText, specialAngle } from './radical.js';
import { solve, residual, equationString } from './linear-system.js';
import { matrixFromColumns, isIndependent } from './subspace.js';
import { fmtAug } from './quiz-kit.js';
import { fail } from '@shared/logic/app-error.js';

/* ---------------------------------------------------------------
   MÁY GIẢI VECTOR: độ dài, góc, chiếu… Mỗi ngăn (tab) là MỘT khối dòng, không gập thêm một tầng nữa.
   Vector viết dạng CỘT (fmtCol) như trong sách.
   Trả { answer: dòng[], steps: { group?, head: {key, params}, lines: dòng[] }[] };
   dòng = chuỗi toán thuần | { key, params, m } (xem shared/ui/question.js stepLine). Thuần: không đụng DOM.
   --------------------------------------------------------------- */

const SUB = '₀₁₂₃₄₅₆₇₈₉';
export const sub = i => String(i).split('').map(d => SUB[d]).join('');
const sq = x => fmtParen(x) + '²';
const rad = x => sqrtText(x);
const r4 = x => fmtDec(Number(x.toFixed(4)));

/** "|v| = √(1² + 2² + 2²)" rồi "= √9" rồi "= 3" — mỗi vế một dòng. */
const normLines = (name, v) => [`|${name}| = √(${v.map(sq).join(' + ')})`, `= √${fmt(V.norm2(v))}`, ...(rad(V.norm2(v)) === `√${fmt(V.norm2(v))}` ? [] : [`= ${rad(V.norm2(v))}`])];

const dotLine = (a, b) => `v·w = ${a.map((x, i) => `${fmtParen(x)}·${fmtParen(b[i])}`).join(' + ')} = ${fmt(V.dot(a, b))}`;

/** "2·[..] − 1·[..]" — hệ số đứng trước từng vector cột. */
export function lincomb(coefs, vectors) {
  return coefs.map((c, i) => {
    const neg = c < 0 && i > 0;
    const k = fmt(neg ? -c : c);
    return `${i === 0 ? '' : neg ? ' − ' : ' + '}${i === 0 && c < 0 ? `(${k})` : k}·${fmtCol(vectors[i])}`;
  }).join('');
}

/** v một vector, hoặc cả v và w. */
export function vectorReport(v, w = null) {
  V.checkVector(v);
  if (w) { V.checkVector(w); V.sameDim(v, w); }
  const steps = [];
  const answer = [`|v| = ${rad(V.norm2(v))}`];
  if (w) answer.push(`|w| = ${rad(V.norm2(w))}`);

  const len = [...normLines('v', v), ...(w ? normLines('w', w) : [])];
  if (!V.isZero(v)) len.push(`v / |v| = (1/${rad(V.norm2(v))})·${fmtCol(v)}`, `= ${fmtCol(V.normalize(v))}`);
  steps.push({ group: 'sv.tabLen', why: { key: 'ww.norm' }, head: { key: 'sv.stNorm' }, lines: len });
  if (!w) return { answer, steps };

  const d = V.dot(v, w);
  answer.push(`v·w = ${fmt(d)}`);
  const ang = [dotLine(v, w)];
  if (!V.isZero(v) && !V.isZero(w)) {
    const nv = V.norm(v), nw = V.norm(w);
    const cos = Math.min(1, Math.max(-1, d / (nv * nw)));
    const deg = clean(Math.acos(cos) * 180 / Math.PI);
    const sp = specialAngle(deg);
    answer.push(`θ = ${sp ? `${fmt(Math.round(deg))}° = ${sp}` : `${fmtDec(Number(deg.toFixed(2)))}°`}`);
    ang.push(`cos θ = ${fmt(d)}/(${rad(V.norm2(v))}·${rad(V.norm2(w))})`, `= ${r4(cos)}`,
      `θ = arccos(${r4(cos)}) ≈ ${fmtDec(Number(deg.toFixed(2)))}°`, `≈ ${r4(deg * Math.PI / 180)} rad${sp ? ` = ${sp}` : ''}`);
    if (V.isOrthogonal(v, w)) ang.push({ key: 'sv.orth' });
    else if (V.isParallel(v, w)) ang.push({ key: 'sv.par' });
    if (V.isOrthogonal(v, w)) answer.push({ key: 'sv.orth' });
    else if (V.isParallel(v, w)) answer.push({ key: 'sv.par' });
    steps.push({ group: 'sv.tabAngle', why: { key: 'ww.angle' }, head: { key: 'sv.stAngle' }, lines: ang });
    steps.push({
      group: 'sv.tabProj', why: { key: 'ww.proj' }, head: { key: 'sv.stProj' },
      lines: [
        `proj_w v = (v·w / w·w)·w = (${fmt(d)}/${fmt(V.norm2(w))})·${fmtCol(w)}`,
        `= ${fmtCol(V.projection(v, w))}`,
        `v − proj_w v = ${fmtCol(V.perpendicular(v, w))}   (⟂ w)`,
      ],
    });
  } else {
    steps.push({ group: 'sv.tabAngle', why: { key: 'ww.angle' }, head: { key: 'sv.stAngle' }, lines: ang });
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
    {
      head: { key: 'sv.stSolve' },
      lines: [
        `${names.map((n, i) => `${n}·v${sub(i + 1)}`).join(' + ')} = w`, ...A.map((row, i) => equationString(row, w[i], names)), fmtAug(r.start),
        ...[...r.forwardSteps, ...r.backwardSteps].filter(s => s.formula).map(s => `${s.formula.replace('<->', '↔').replace('<-', '←')}:   ${fmtAug(s.matrix)}`),
      ],
    },
  ];
  const answer = [];
  const tail = [];
  if (r.type === 'none') {
    answer.push({ key: 'sv.notCombo' });
  } else {
    const c = r.type === 'unique' ? r.solution : r.particular;
    answer.push({ key: 'sv.isCombo' });
    answer.push(`w = ${lincomb(c, vectors)}`);
    if (r.type === 'infinite') answer.push({ key: 'sv.manyWays' });
    tail.push(`${lincomb(c, vectors)} = ${fmtCol(V.combine(c, vectors))}`, `w = ${fmtCol(w)}  ${residual(A, c, w) < 1e-9 ? '✓' : '✗'}`);
  }
  tail.push({ key: isIndependent(vectors) ? 'sv.indep' : 'sv.dep' });
  steps.push({ head: { key: 'sv.stCheck' }, lines: tail });
  return { answer, steps };
}

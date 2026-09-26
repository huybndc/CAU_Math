/* ---------------------------------------------------------------
   LỜI GIẢI TỪNG BƯỚC — Chương 3 (thuần, không biết ngôn ngữ). Dạng dòng: xem steps-ch1.js.
   Mỗi nhóm K-map: các ô, biến nào đổi (bị khử), biến nào giữ ⇒ term.
   --------------------------------------------------------------- */

import { varNames, minimizeSOP, minimizePOS, implicantMinterms, implicantToSOP, splitValues } from './quine-mccluskey.js';
import { mapLayout, mintermPositions } from './kmap-layout.js';
import { line as L } from '@shared/logic/steps.js';


/** "m(0, 1, 4, 5): x, z đổi · giữ y = 0 ⇒ y′" */
function groupLine(imp, n, term, pos, ess) {
  const names = varNames(n);
  const cells = implicantMinterms(imp, n).join(', ');
  const drop = names.filter((_, k) => (imp.d >> (n - 1 - k)) & 1);
  const keep = names.flatMap((v, k) => ((imp.d >> (n - 1 - k)) & 1 ? [] : [`${v} = ${(imp.v >> (n - 1 - k)) & 1}`]));
  if (!drop.length) return L('s3.groupOne', { cells, term, ess: ess ? 's3.ess' : 's3.noEss' });
  return L(pos ? 's3.groupPos' : 's3.group', {
    cells, drop: drop.join(', ') || '—', keep: keep.join(', ') || '—', term, ess: ess ? 's3.ess' : 's3.noEss',
  });
}

export function stepsOf(q) {
  const m = q.meta;
  const n = m.n;
  switch (q.kind) {
    case 'sop': case 'dontcare': case 'pos': {
      const pos = q.kind === 'pos';
      const best = pos ? minimizePOS(m.values, n) : minimizeSOP(m.values, n);
      const { ones, zeros, dcs } = splitValues(m.values);
      return [
        L(pos ? 's3.readPos' : 's3.readSop', {}, `${pos ? 'ΠM' : 'Σm'}(${(pos ? zeros : ones).join(', ')})${dcs.length ? ` + d(${dcs.join(', ')})` : ''}`),
        L('s3.bigFirst'),
        ...(pos ? [L('s3.posRule')] : []),
        ...best.terms.map(t => groupLine(t.imp, n, t.text, pos, t.essential)),
        L(pos ? 's3.joinPos' : 's3.joinSop', {}, `F = ${best.expr}`),
      ];
    }
    case 'pis': case 'epis': {
      const best = minimizeSOP(m.values, n);
      const ones = best.ones;
      const lines = [L('s3.piDef')];
      best.pis.forEach((p, i) => {
        const cells = implicantMinterms(p, n);
        const only = ones.filter(o => cells.includes(o) && best.pis.every((x, j) => j === i || !implicantMinterms(x, n).includes(o)));
        lines.push(L(only.length ? 's3.piEss' : 's3.piNotEss', { term: implicantToSOP(p, n), cells: cells.join(', '), only: only.join(', ') }));
      });
      lines.push(L(q.kind === 'pis' ? 's3.countPi' : 's3.countEpi', { n: q.answer }));
      return lines;
    }
    case 'cell': {
      const Lay = mapLayout(n);
      const p = mintermPositions(Lay)[m.m];
      const bits = Lay.rowCodes[p.r] + Lay.colCodes[p.c];
      return [
        L('s3.cellCodes', { rows: Lay.rowVars.join(''), cols: Lay.colVars.join(''), row: Lay.rowCodes[p.r], col: Lay.colCodes[p.c] }),
        L('s3.cellJoin', {}, `${varNames(n).join('')} = ${bits}`),
        `${[...bits].map((b, i) => `${b}·${2 ** (n - 1 - i)}`).join(' + ')} = ${m.m}`,
      ];
    }
    case 'xor': {
      const all = [...Array(1 << n).keys()];
      const rows = all.map(v => {
        const b = v.toString(2).padStart(n, '0');
        return `${b} (${[...b].filter(x => x === '1').length})${q.answer.includes(v) ? ' ✓' : ''}`;
      });
      const chunks = [];
      for (let i = 0; i < rows.length; i += 4) chunks.push(rows.slice(i, i + 4).join('    '));
      return [L('s3.countEach'), ...chunks, L('s3.xorPick', {}, `Σm(${q.answer.join(', ')})`)];
    }
    default: return [];
  }
}

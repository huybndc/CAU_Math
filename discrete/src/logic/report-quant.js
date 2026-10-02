import { fail } from '@shared/logic/app-error.js';
import { parseSet } from './report-sets.js';

/* ---------------------------------------------------------------
   MÁY GIẢI LƯỢNG TỪ (D2): miền hữu hạn + một quan hệ P(x, y) có sẵn → bảng giá trị P và chân trị của các cách đặt lượng từ
   (∀∀, ∃∃, ∀∃, ∃∀ theo hai thứ tự), kèm nhân chứng / phản ví dụ. Thuần; chỉ khoá từ điển.
   --------------------------------------------------------------- */

export const RELS = {
  lt: ['x < y', (x, y) => x < y], le: ['x ≤ y', (x, y) => x <= y], eq: ['x = y', (x, y) => x === y], ne: ['x ≠ y', (x, y) => x !== y],
  div: ['x | y', (x, y) => x !== 0 && y % x === 0], sum0: ['x + y = 0', (x, y) => x + y === 0], sq: ['y = x²', (x, y) => y === x * x], even: ['x·y chẵn', (x, y) => (x * y) % 2 === 0],
};
const pair = (x, y) => `(${x}, ${y})`;

export function quantReport(domText, rel) {
  const D = parseSet(domText);
  if (!D.length || !D.every(x => /^-?\d+$/.test(x))) fail('dq.badDom');
  if (D.length > 8) fail('dq.tooBig');
  const [label, f] = RELS[rel] ?? fail('dq.badRel');
  const P = (x, y) => f(+x, +y);
  const rows = D.map(x => D.map(y => P(x, y)));
  const all = (xs, g) => xs.every(g), any = (xs, g) => xs.some(g);
  const res = [
    ['dq.AA', all(D, x => all(D, y => P(x, y))), (() => { for (const x of D) for (const y of D) if (!P(x, y)) return `${pair(x, y)} ✗`; return ''; })()],
    ['dq.EE', any(D, x => any(D, y => P(x, y))), (() => { for (const x of D) for (const y of D) if (P(x, y)) return `${pair(x, y)} ✓`; return ''; })()],
    ['dq.AE', all(D, x => any(D, y => P(x, y))), (() => { const bad = D.find(x => !any(D, y => P(x, y))); return bad !== undefined ? `x = ${bad}: ∄y` : D.map(x => `${x}→${D.find(y => P(x, y))}`).join(', '); })()],
    ['dq.EA', any(D, x => all(D, y => P(x, y))), (() => { const w = D.find(x => all(D, y => P(x, y))); return w !== undefined ? `x = ${w}` : ''; })()],
    ['dq.AEr', all(D, y => any(D, x => P(x, y))), (() => { const bad = D.find(y => !any(D, x => P(x, y))); return bad !== undefined ? `y = ${bad}: ∄x` : D.map(y => `${y}←${D.find(x => P(x, y))}`).join(', '); })()],
    ['dq.EAr', any(D, y => all(D, x => P(x, y))), (() => { const w = D.find(y => all(D, x => P(x, y))); return w !== undefined ? `y = ${w}` : ''; })()],
  ];
  const mark = b => (b ? '✓' : '·');
  return {
    answer: res.map(([key, v, w]) => ({ key, m: `${v ? 'T' : 'F'}${w ? '   ' + w : ''}` })),
    steps: [
      {
        group: 'dq.tabTable', head: { key: 'dq.stTable', params: { p: label } }, why: { key: 'dq.whyTable' },
        lines: [`  y→  ${D.join('  ')}`, ...D.map((x, i) => `x=${x}   ${rows[i].map(mark).join('  ')}`)],
      },
      {
        group: 'dq.tabOrder', head: { key: 'dq.stOrder' }, why: { key: 'dq.whyOrder' },
        lines: [{ key: 'dq.orderNote', m: res[2][1] !== res[5][1] || res[3][1] !== res[4][1] ? 'F ≠ T' : '' }].filter(l => l.m),
      },
    ].filter(s => s.lines.length),
  };
}

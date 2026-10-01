import { t as T, tError, onLangChange } from '../i18n/index.js';
import { fail } from '@shared/logic/app-error.js';
import { createSolver } from '@shared/ui/solver.js';
import { fieldRow } from '@shared/ui/fields.js';
import { baseReport, complementReport, signedReport } from '../logic/report-number.js';
import { exprReport, autoVars } from '../logic/report-expr.js';
import { randomValues } from '../logic/random-function.js';
import { formatSpec } from '../logic/expr-parser.js';
import { glossary } from './glossary.js';

/* ---------------------------------------------------------------
   CÁC MÁY GIẢI của Logic Circuit (màn Công cụ): Đổi cơ số · Trừ bằng số bù · Số có dấu · Biểu thức Boole.
   Mỗi máy = hàng ô nhập (shared/ui/fields.js) + hàm report-*.js + khung gập shared/ui/solver.js, có nút 🎲 Ngẫu nhiên.
   Mỗi mountXxx(host) gắn vào một thẻ trống trong trang chương.
   --------------------------------------------------------------- */

const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = a => a[rnd(0, a.length - 1)];
const baseOpts = () => [2, 8, 10, 16].map(r => ({ v: r, t: T(`c1.base${r}`) }));

/** Ghép máy giải: specs → fieldRow, run() đọc ô rồi gọi report. read() trả null nếu chưa đủ dữ liệu. */
function mount(host, { key, specs, examples = [], random, report, practice }) {
  let fr;
  const s = createSolver(host, { terms: glossary, practice, random: random && (() => fr.set(random())), examples: examples.map(([label, vals]) => ({ label, apply: () => fr.set(vals) })) });
  const run = () => {
    try {
      const out = report(fr.get);
      if (out) s.show(out); else s.clear();
    } catch (e) { s.error(tError(e)); }
  };
  const draw = () => { const old = fr ? Object.fromEntries(specs().map(sp => [sp.id, fr.get(sp.id)])) : {}; fr = fieldRow(specs().map(sp => ({ ...sp, value: old[sp.id] ?? sp.value })), run, 'tool-' + key); s.inputs.replaceChildren(fr.node); };
  draw(); onLangChange(draw);
  run();
}

export function mountBaseSolver(host) {
  mount(host, {
    key: 'base',
    practice: '#/practice/ch1',
    specs: () => [{ id: 'x', label: T('ln.number'), value: '1101.1', size: 14 }, { id: 'from', label: T('ln.fromBase'), value: 2, options: baseOpts() }],
    random: () => { const from = pick([2, 8, 10, 16]); const v = rnd(5, 400) + (Math.random() < 0.4 ? pick([0.5, 0.25, 0.75, 0.125]) : 0); return { x: v.toString(from).toUpperCase(), from }; },
    examples: [['1101.1₂', { x: '1101.1', from: 2 }], ['255₁₀', { x: '255', from: 10 }], ['3F.8₁₆', { x: '3F.8', from: 16 }]],
    report: g => (g('x') ? baseReport(g('x'), +g('from')) : null),
  });
}

export function mountComplementSolver(host) {
  mount(host, {
    key: 'compl',
    practice: '#/practice/ch1',
    specs: () => [{ id: 'm', label: 'M', value: '1010100', size: 12 }, { id: 'n', label: 'N', value: '1000011', size: 12 }, { id: 'r', label: T('ln.base'), value: 2, options: baseOpts() }],
    random: () => { const r = pick([2, 10, 16]); const a = rnd(10, 200), b = rnd(10, 200); return { m: a.toString(r).toUpperCase(), n: b.toString(r).toUpperCase(), r }; },
    examples: [['1010100 − 1000011', { m: '1010100', n: '1000011', r: 2 }], ['72532 − 13250', { m: '72532', n: '13250', r: 10 }], ['3250 − 72532', { m: '3250', n: '72532', r: 10 }]],
    report: g => (g('m') && g('n') ? complementReport(g('m'), g('n'), +g('r')) : null),
  });
}

export function mountSignedSolver(host) {
  mount(host, {
    key: 'signed',
    practice: '#/practice/ch1',
    specs: () => [
      { id: 'a', label: 'A', value: '5', size: 8 }, { id: 'b', label: 'B', value: '-3', size: 8 },
      { id: 'op', label: T('ln.op'), value: 'add', options: [{ v: 'add', t: 'A + B' }, { v: 'sub', t: 'A − B' }] },
      { id: 'w', label: T('ln.bits'), value: 8, options: [4, 8, 16].map(v => ({ v, t: String(v) })) },
    ],
    random: () => ({ a: rnd(-60, 60), b: rnd(-60, 60), w: 8 }),
    examples: [['5 + (−3)', { a: 5, b: -3, op: 'add', w: 8 }], ['100 + 100', { a: 100, b: 100, op: 'add', w: 8 }], ['−7 (4 bit)', { a: -7, b: '', op: 'add', w: 4 }]],
    report: g => {
      const num = x => (/^-?\d+$/.test(x.replace('−', '-')) ? +x.replace('−', '-') : NaN);
      const a = num(g('a')), b = g('b') === '' ? null : num(g('b'));
      if (g('a') === '') return null;
      if (Number.isNaN(a) || Number.isNaN(b)) fail('c1.signedErr');
      return signedReport(a, b, +g('w'), g('op'));
    },
  });
}

export function mountExprSolver(host) {
  mount(host, {
    key: 'expr',
    practice: '#/practice/ch2',
    specs: () => [
      { id: 'f', label: 'F =', value: "wx + yz + w'y'z'", size: 28, ph: "xy' + z   |   Σm(1,3,5) + d(0)" },
      { id: 'n', label: T('ln.vars'), value: 'a', options: [{ v: 'a', t: T('ln.auto') }, ...[2, 3, 4, 5].map(v => ({ v, t: String(v) }))] },
    ],
    random: () => { const n = pick([3, 4]); return { f: formatSpec(randomValues(n, true)), n }; },
    examples: [["x'y + xy'", { f: "x'y + xy'", n: 'a' }], ['Σm(1,3,5,7)', { f: 'Σm(1,3,5,7)', n: 'a' }], ["w'x + yz'", { f: "w'x + yz'", n: 'a' }]],
    report: g => (g('f') ? exprReport(g('f'), g('n') === 'a' ? autoVars(g('f')) : +g('n')) : null),
  });
}

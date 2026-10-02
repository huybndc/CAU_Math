import { t as T, tError, onLangChange } from '../i18n/index.js';
import { fail } from '@shared/logic/app-error.js';
import { createSolver } from '@shared/ui/solver.js';
import { fieldRow } from '@shared/ui/fields.js';
import { truthReport, euclidReport, congruenceReport, diophantineReport, powReport } from '../logic/report-tools.js';
import { setReport, sumReport, SUMS } from '../logic/report-sets.js';
import { quantReport, RELS } from '../logic/report-quant.js';
import { stateReport } from '../logic/report-state.js';
import { graphReport } from '../logic/report-graph.js';
import { glossary } from './glossary.js';

/* ---------------------------------------------------------------
   CÁC MÁY GIẢI của Toán rời rạc (màn Công cụ): Bảng chân trị/tương đương · Euclid + Pulverizer · Đồng dư ax ≡ b · Lũy thừa mod.
   Mỗi máy = hàng ô nhập (shared/ui/fields.js) + hàm logic/report-tools.js + khung gập shared/ui/solver.js, có nút 🎲 Ngẫu nhiên.
   --------------------------------------------------------------- */

const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = a => a[rnd(0, a.length - 1)];
const int = (x, big = false) => {
  const s = x.replace('−', '-').replace(/[\s,_]/g, '');
  if (!/^-?\d+$/.test(s)) fail('err.needInt');
  if (!Number.isSafeInteger(+s)) { if (big) return BigInt(s); fail('err.bigInt'); }
  return +s;
};

function mount(host, { key, specs, examples = [], random, report, practice }) {
  let fr;
  const s = createSolver(host, { terms: glossary, practice, random: random && (() => fr.set(random())), examples: examples.map(([label, vals]) => ({ label, apply: () => fr.set(vals) })) });
  const run = () => {
    try {
      const out = report(fr.get);
      if (out) s.show(out); else s.clear();
    } catch (e) { s.error(tError(e)); }
  };
  const draw = () => {
    const old = fr ? Object.fromEntries(specs().map(sp => [sp.id, fr.get(sp.id)])) : {};
    fr = fieldRow(specs().map(sp => ({ ...sp, value: old[sp.id] ?? sp.value })), run, 'tool-' + key);
    s.inputs.replaceChildren(fr.node);
  };
  draw(); onLangChange(draw);
  run();
}

export function mountTruthSolver(host) {
  const FORMS = ['p -> q', 'p & (q | r)', 'p xor q', '(p -> q) & (q -> r) -> (p -> r)'];
  mount(host, {
    key: 'truth',
    practice: '#/practice/ch1',
    specs: () => [{ id: 'f', label: 'F =', value: FORMS[3], size: 30 }, { id: 'g', label: `G = (${T('tool.optional')})`, value: '', size: 24 }],
    random: () => ({ f: pick(FORMS), g: '' }),
    examples: [['p → q  vs  ¬p ∨ q', { f: 'p -> q', g: '~p | q' }], ['(p → q) ∧ (q → r) → (p → r)', { f: FORMS[3], g: '' }], ['¬(p ∧ q)  vs  ¬p ∧ ¬q', { f: '~(p & q)', g: '~p & ~q' }]],
    report: g => (g('f') ? truthReport(g('f'), g('g')) : null),
  });
}

export function mountEuclidSolver(host) {
  mount(host, {
    key: 'euclid',
    practice: '#/practice/ch6',
    specs: () => [{ id: 'a', label: 'a', value: '259', size: 8 }, { id: 'b', label: 'b', value: '70', size: 8 }],
    random: () => ({ a: rnd(20, 999), b: rnd(10, 400) }),
    examples: [['gcd(259, 70)', { a: 259, b: 70 }], ['gcd(17, 5) = 1', { a: 17, b: 5 }], ['gcd(84, 36)', { a: 84, b: 36 }]],
    report: g => (g('a') && g('b') ? euclidReport(int(g('a')), int(g('b'))) : null),
  });
}

export function mountCongruenceSolver(host) {
  mount(host, {
    key: 'congr',
    practice: '#/practice/ch7',
    specs: () => [{ id: 'a', label: 'a', value: '7', size: 6 }, { id: 'b', label: 'b', value: '3', size: 6 }, { id: 'n', label: 'n', value: '15', size: 6 }],
    random: () => { const n = rnd(5, 60); return { a: rnd(2, n - 1), b: rnd(1, n - 1), n }; },
    examples: [['7x ≡ 3 (mod 15)', { a: 7, b: 3, n: 15 }], ['6x ≡ 4 (mod 10)', { a: 6, b: 4, n: 10 }], ['6x ≡ 3 (mod 10)', { a: 6, b: 3, n: 10 }]],
    report: g => (g('a') && g('b') && g('n') ? congruenceReport(int(g('a')), int(g('b')), int(g('n'))) : null),
  });
}

export function mountDiophantineSolver(host) {
  mount(host, {
    key: 'dioph',
    practice: '#/practice/ch5',
    specs: () => [{ id: 'a', label: 'a', value: '7', size: 6 }, { id: 'b', label: 'b', value: '5', size: 6 }, { id: 'c', label: 'c', value: '53', size: 6 }],
    random: () => ({ a: rnd(3, 15), b: rnd(3, 15), c: rnd(20, 120) }),
    examples: [['7x + 5y = 53', { a: 7, b: 5, c: 53 }], ['6x + 9y = 21', { a: 6, b: 9, c: 21 }], ['6x + 9y = 20', { a: 6, b: 9, c: 20 }]],
    report: g => (g('a') && g('b') && g('c') ? diophantineReport(int(g('a')), int(g('b')), int(g('c'))) : null),
  });
}

export function mountPowSolver(host) {
  mount(host, {
    key: 'pow',
    practice: '#/practice/ch7',
    specs: () => [{ id: 'a', label: 'a', value: '7', size: 6 }, { id: 'k', label: 'k', value: '45', size: 6 }, { id: 'n', label: 'n', value: '13', size: 8 }],
    random: () => ({ a: rnd(2, 40), k: rnd(5, 200), n: rnd(7, 97) }),
    examples: [['7^45 mod 13', { a: 7, k: 45, n: 13 }], ['2^100 mod 7', { a: 2, k: 100, n: 7 }], ['3^202 mod 11', { a: 3, k: 202, n: 11 }]],
    report: g => (g('a') && g('k') && g('n') ? powReport(int(g('a'), true), int(g('k'), true), int(g('n'), true)) : null),
  });
}

export function mountSetSolver(host) {
  mount(host, {
    key: 'sets',
    practice: '#/practice/ch3',
    specs: () => [{ id: 'a', label: T('ds.setA'), value: '1, 2, 3, 4', size: 18 }, { id: 'b', label: T('ds.setB'), value: '3, 4, 5', size: 18 }, { id: 'u', label: T('ds.setU'), value: '', size: 22 }],
    random: () => { const pickN = n => [...Array(10).keys()].map(i => i + 1).sort(() => Math.random() - 0.5).slice(0, n).sort((x, y) => x - y).join(', '); return { a: pickN(rnd(3, 6)), b: pickN(rnd(3, 6)), u: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10' }; },
    examples: [['{1,2,3,4} · {3,4,5}', { a: '1, 2, 3, 4', b: '3, 4, 5', u: '' }], ['U = {1…8}', { a: '2, 4, 6, 8', b: '1, 2, 3, 4', u: '1, 2, 3, 4, 5, 6, 7, 8' }], ['{a,b,c} · {c,d}', { a: 'a, b, c', b: 'c, d', u: '' }]],
    report: g => (g('a') && g('b') ? setReport(g('a'), g('b'), g('u')) : null),
  });
}

export function mountSumSolver(host) {
  mount(host, {
    key: 'sums',
    practice: '#/practice/ch4',
    specs: () => [
      { id: 'kind', label: T('ds.kind'), value: 'arith', options: SUMS.map(v => ({ v, t: T(`ds.k.${v}`) })) },
      { id: 'n', label: T('ds.n'), value: '10', size: 6 }, { id: 'p1', label: T('ds.p1'), value: '3', size: 6 }, { id: 'p2', label: T('ds.p2'), value: '4', size: 6 },
    ],
    random: () => ({ kind: pick(SUMS), n: rnd(5, 20), p1: rnd(1, 6), p2: rnd(2, 4) }),
    examples: [['1 + 2 + … + 10 (a=1, d=1)', { kind: 'arith', n: 10, p1: 1, p2: 1 }], ['1 + 2 + 4 + … (2ⁿ⁻¹)', { kind: 'geom', n: 10, p1: 1, p2: 2 }], ['1² + … + 10²', { kind: 'squares', n: 10 }]],
    report: g => (g('n') ? sumReport(g('kind'), int(g('n')), int(g('p1') || '1'), int(g('p2') || '1')) : null),
  });
}

export function mountQuantSolver(host) {
  mount(host, {
    key: 'quant',
    practice: '#/practice/ch2',
    specs: () => [{ id: 'd', label: T('dq.dom'), value: '1, 2, 3, 4', size: 16 }, { id: 'r', label: T('dq.rel'), value: 'lt', options: Object.entries(RELS).map(([v, [t]]) => ({ v, t })) }],
    random: () => ({ d: [...Array(rnd(3, 6)).keys()].map(i => i + rnd(0, 1) * -1).join(', '), r: pick(Object.keys(RELS)) }),
    examples: [['x < y', { d: '1, 2, 3, 4', r: 'lt' }], ['x = y', { d: '1, 2, 3', r: 'eq' }], ['x + y = 0', { d: '-2, -1, 0, 1, 2', r: 'sum0' }]],
    report: g => (g('d') ? quantReport(g('d'), g('r')) : null),
  });
}

export function mountStateSolver(host) {
  mount(host, {
    key: 'state',
    practice: '#/practice/ch5',
    specs: () => [{ id: 'm', label: T('dst.moves'), value: '2,-1; 1,-2; 1,1; -3,0', size: 26 }, { id: 's', label: T('dst.start'), value: '0, 0', size: 8 }, { id: 'g', label: T('dst.goal'), value: '0, 2', size: 8 }],
    random: () => { const mv = Array.from({ length: rnd(2, 4) }, () => `${rnd(-3, 3)},${rnd(-3, 3)}`).filter(x => x !== '0,0'); return { m: (mv.length ? mv : ['1,2']).join('; '), s: '0, 0', g: `${rnd(-4, 6)}, ${rnd(-4, 6)}` }; },
    examples: [['Wall-E → (0, 2)', { m: '2,-1; 1,-2; 1,1; -3,0', s: '0, 0', g: '0, 2' }], ['Wall-E → (3, 0)', { m: '2,-1; 1,-2; 1,1; -3,0', s: '0, 0', g: '3, 0' }], ['(+2,+4) ; (+6,0)', { m: '2,4; 6,0', s: '0, 0', g: '5, 5' }]],
    report: g => (g('m') && g('s') && g('g') ? stateReport(g('m'), g('s'), g('g')) : null),
  });
}

export function mountGraphSolver(host) {
  mount(host, {
    key: 'graph',
    practice: '#/practice/ch8',
    specs: () => [{ id: 'e', label: T('dg.edges'), value: '1-2, 2-3, 3-4, 4-1, 1-3', size: 34 }],
    random: () => { const n = rnd(4, 7), es = new Set(); while (es.size < rnd(n - 1, n + 3)) { const a = rnd(1, n), b = rnd(1, n); if (a !== b) es.add(`${Math.min(a, b)}-${Math.max(a, b)}`); } return { e: [...es].join(', ') }; },
    examples: [['K₄ − cạnh', { e: '1-2, 2-3, 3-4, 4-1, 1-3' }], ['C₅', { e: '1-2, 2-3, 3-4, 4-5, 5-1' }], ['2 thành phần', { e: '1-2, 2-3, 4-5' }]],
    report: g => (g('e') ? graphReport(g('e')) : null),
  });
}

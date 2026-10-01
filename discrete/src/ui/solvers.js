import { t as T, tError, onLangChange } from '../i18n/index.js';
import { fail } from '@shared/logic/app-error.js';
import { createSolver } from '@shared/ui/solver.js';
import { fieldRow } from '@shared/ui/fields.js';
import { truthReport, euclidReport, congruenceReport, powReport } from '../logic/report-tools.js';
import { glossary } from './glossary.js';

/* ---------------------------------------------------------------
   CÁC MÁY GIẢI của Toán rời rạc (màn Công cụ): Bảng chân trị/tương đương · Euclid + Pulverizer · Đồng dư ax ≡ b · Lũy thừa mod.
   Mỗi máy = hàng ô nhập (shared/ui/fields.js) + hàm logic/report-tools.js + khung gập shared/ui/solver.js, có nút 🎲 Ngẫu nhiên.
   --------------------------------------------------------------- */

const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = a => a[rnd(0, a.length - 1)];
const int = x => { const s = x.replace('−', '-'); if (!/^-?\d+$/.test(s)) fail('err.needInt'); return +s; };

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

export function mountPowSolver(host) {
  mount(host, {
    key: 'pow',
    practice: '#/practice/ch7',
    specs: () => [{ id: 'a', label: 'a', value: '7', size: 6 }, { id: 'k', label: 'k', value: '45', size: 6 }, { id: 'n', label: 'n', value: '13', size: 8 }],
    random: () => ({ a: rnd(2, 40), k: rnd(5, 200), n: rnd(7, 97) }),
    examples: [['7^45 mod 13', { a: 7, k: 45, n: 13 }], ['2^100 mod 7', { a: 2, k: 100, n: 7 }], ['3^202 mod 11', { a: 3, k: 202, n: 11 }]],
    report: g => (g('a') && g('k') && g('n') ? powReport(int(g('a')), int(g('k')), int(g('n'))) : null),
  });
}

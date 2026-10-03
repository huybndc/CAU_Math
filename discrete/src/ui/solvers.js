import { t as T, tError, onLangChange } from '../i18n/index.js';
import { fail } from '@shared/logic/app-error.js';
import { createSolver } from '@shared/ui/solver.js';
import { el } from '@shared/ui/dom.js';
import { fieldRow } from '@shared/ui/fields.js';
import { save } from '@shared/ui/store.js';
import { truthReport, euclidReport, congruenceReport, diophantineReport, powReport } from '../logic/report-tools.js';
import { setReport } from '../logic/report-sets.js';
import { graphReport, parseEdges } from '../logic/report-graph.js';
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
    } catch (e) { s.error(tError(e)); return false; }
  };
  const draw = () => {
    const old = fr ? Object.fromEntries(specs().map(sp => [sp.id, fr.get(sp.id)])) : {};
    fr = fieldRow(specs().map(sp => ({ ...sp, value: old[sp.id] ?? sp.value })), run, 'tool-' + key);
    s.inputs.replaceChildren(fr.node);
  };
  draw(); onLangChange(draw);
  if (run() === false) { save('tool-' + key, {}); fr = null; draw(); run(); }   // giá trị đã nhớ từ trước mà lỗi: về mặc định
  return { get: id => fr.get(id), set: v => fr.set(v) };
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

/** Hình đồ thị: đỉnh trên vòng tròn; bấm 2 đỉnh để thêm/xoá cạnh. Hai phía ⇒ tô 2 màu; đỉnh bậc lẻ viền đứt. */
function graphFigure({ V, E, deg, color, odd }, toggle) {
  const NS = 'http://www.w3.org/2000/svg', R = 118, C = 150, S = 300;
  const mk = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent?.append(n); return n; };
  const svg = mk('svg', { viewBox: `0 0 ${S} ${S}`, width: S, height: S, role: 'img', style: 'max-width:100%;cursor:pointer' });
  const pos = Object.fromEntries(V.map((v, i) => { const a = (2 * Math.PI * i) / V.length - Math.PI / 2; return [v, [C + R * Math.cos(a), C + R * Math.sin(a)]]; }));
  for (const [a, b] of E) mk('line', { x1: pos[a][0], y1: pos[a][1], x2: pos[b][0], y2: pos[b][1], stroke: 'currentColor', 'stroke-width': 1.6, opacity: 0.7 }, svg);
  let first = null;
  const dots = {};
  for (const v of V) {
    const [x, y] = pos[v], g = mk('g', {}, svg);
    const fill = color ? (color[v] ? 'var(--panel)' : 'var(--accent-soft)') : 'var(--panel)';
    dots[v] = mk('circle', { cx: x, cy: y, r: 17, fill, stroke: odd.includes(v) ? 'var(--accent)' : 'currentColor', 'stroke-width': odd.includes(v) ? 2.6 : 1.4, 'stroke-dasharray': odd.includes(v) ? '4 3' : '' }, g);
    mk('text', { x, y: y + 4.5, 'text-anchor': 'middle', 'font-size': 13, fill: 'currentColor', 'font-weight': 600 }, g).textContent = v;
    mk('text', { x: x + (x - C) * 0.2, y: y + (y - C) * 0.2 + 4, 'text-anchor': 'middle', 'font-size': 10.5, fill: 'var(--ink-dim)' }, g).textContent = deg[v];
    g.addEventListener('click', () => {
      if (first === null) { first = v; dots[v].setAttribute('stroke-width', 4); return; }
      const a = first; first = null;
      if (a !== v) toggle(a, v);
      else dots[v].setAttribute('stroke-width', odd.includes(v) ? 2.6 : 1.4);
    });
  }
  return el('div', { class: 'graph-fig' }, [svg, el('small', { class: 'dim', text: T('dg.hint') })]);
}

export function mountGraphSolver(host) {
  let api;
  const toggle = (a, b) => {
    const { V, edges } = parseEdges(api.get('e'));
    const key = ([x, y]) => [x, y].sort().join('|'), k = key([a, b]);
    const has = edges.some(e => key(e) === k);
    const next = has ? edges.filter(e => key(e) !== k) : [...edges, [a, b]];
    const used = new Set(next.flat());
    const iso = V.filter(v => !used.has(v));
    api.set({ e: [...next.map(e => e.join('-')), ...iso].join(', ') });
  };
  const addV = d => {
    const { V, edges } = parseEdges(api.get('e') || '1');
    const nums = V.filter(v => /^\d+$/.test(v)).map(Number);
    let list = V;
    if (d > 0) list = [...V, String((nums.length ? Math.max(...nums) : 0) + 1)];
    else if (V.length > 1) { const last = V[V.length - 1]; list = V.slice(0, -1); edges.splice(0, edges.length, ...edges.filter(e => !e.includes(last))); }
    const used = new Set(edges.flat());
    api.set({ e: [...edges.map(e => e.join('-')), ...list.filter(v => !used.has(v))].join(', ') });
  };
  api = mount(host, {
    key: 'graph',
    practice: '#/practice/ch8',
    specs: () => [{ id: 'e', label: T('dg.edges'), value: '1-2, 2-3, 3-4, 4-1, 1-3', size: 34 }],
    random: () => { const n = rnd(4, 7), es = new Set(); while (es.size < rnd(n - 1, n + 3)) { const a = rnd(1, n), b = rnd(1, n); if (a !== b) es.add(`${Math.min(a, b)}-${Math.max(a, b)}`); } return { e: [...es].join(', ') }; },
    examples: [['K₄ − cạnh', { e: '1-2, 2-3, 3-4, 4-1, 1-3' }], ['C₅', { e: '1-2, 2-3, 3-4, 4-5, 5-1' }], ['2 thành phần', { e: '1-2, 2-3, 4-5' }]],
    report: g => {
      if (!g('e')) return null;
      const r = graphReport(g('e'));
      r.figure = () => el('div', {}, [graphFigure(r.graph, toggle), el('div', { class: 'row tight' }, [
        el('button', { type: 'button', class: 'btn', onClick: () => addV(1) }, T('dg.addV')),
        el('button', { type: 'button', class: 'btn', onClick: () => addV(-1) }, T('dg.delV'))])]);
      return r;
    },
  });
}

/* ---------------------------------------------------------------
   Final-exam questions for Chapter 5 (Mano 5.3–5.5), pure: latches and flip-flops, and the analysis of a clocked
   sequential circuit with two flip-flops (A, B), one input x and one output y. Answers come from simulation;
   the test re-simulates the circuit with its own evaluator.
   --------------------------------------------------------------- */
import { minimizeSOP } from './quine-mccluskey.js';
import { table } from './mock-tex.js';

const r = String.raw;
const VARS = ['A', 'B', 'x'];
// Truth tables over (A, B, x) use the index m = 4A + 2B + x, as in a 3-variable map.
const bitOf = (m, v) => (m >> (2 - VARS.indexOf(v))) & 1;
const evalTerm = (t, m) => t.every(([v, neg]) => (bitOf(m, v) ^ neg) === 1);
const evalSop = (terms, m) => (terms.some(t => evalTerm(t, m)) ? 1 : 0);
const texTerm = t => t.map(([v, neg]) => v + (neg ? "'" : '')).join('');
export const texSop = terms => (terms.length ? terms.map(texTerm).join(' + ') : '0');
// Write each implicant {v, d} of the minimal cover with the names A, B, x (bit 2 = A).
const impText = imp => VARS.filter((_, k) => !((imp.d >> (2 - k)) & 1)).map(v => v + (((imp.v >> (2 - VARS.indexOf(v))) & 1) ? '' : "'")).join('') || '1';
const minimal = values => {
  const { terms, ones } = minimizeSOP(values, 3);
  return ones.length ? terms.map(t => impText(t.imp)).join(' + ') : '0';
};
const pickOf = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

function randomTerm(rnd) {
  const n = rnd() < 0.45 ? 1 : 2;
  const vars = [...VARS].sort(() => rnd() - 0.5).slice(0, n).sort((a, b) => VARS.indexOf(a) - VARS.indexOf(b));
  return vars.map(v => [v, rnd() < 0.5 ? 1 : 0]);
}
const lits = terms => terms.reduce((n, t) => n + t.length, 0);
const impLits = imp => [0, 1, 2].filter(k => !((imp.d >> k) & 1)).length;
// Keep only equations that are already minimal (no A + AB, no A + A'), as a textbook circuit prints them.
function randomSop(rnd) {
  for (;;) {
    const terms = Array.from({ length: rnd() < 0.5 ? 1 : 2 }, () => randomTerm(rnd));
    const { terms: min, ones } = minimizeSOP(Array.from({ length: 8 }, (_, m) => evalSop(terms, m)), 3);
    if (ones.length && ones.length < 8 && min.length === terms.length && lits(terms) === min.reduce((n, t) => n + impLits(t.imp), 0)) return terms;
  }
}

const FF = {
  D: { ins: ['D'], next: (q, [d]) => d, eq: r`Q(t+1) = D` },
  T: { ins: ['T'], next: (q, [t]) => q ^ t, eq: r`Q(t+1) = T \oplus Q = TQ' + T'Q` },
  JK: { ins: ['J', 'K'], next: (q, [j, k]) => (j && k ? 1 - q : j ? 1 : k ? 0 : q), eq: r`Q(t+1) = JQ' + K'Q` },
};

/** Next state and output for each row m = 4A + 2B + x. */
export function simulate(kind, eqs, out) {
  const ff = FF[kind];
  return Array.from({ length: 8 }, (_, m) => {
    const a = bitOf(m, 'A'), b = bitOf(m, 'B');
    const inA = ff.ins.map(p => evalSop(eqs[`${p}_A`], m)), inB = ff.ins.map(p => evalSop(eqs[`${p}_B`], m));
    return { a, b, x: m & 1, na: ff.next(a, inA), nb: ff.next(b, inB), y: evalSop(out, m), inA, inB };
  });
}

function reachable(rows) {
  const seen = new Set([0]), todo = [0];
  while (todo.length) {
    const s = todo.pop();
    for (const x of [0, 1]) {
      const row = rows[s * 2 + x], n = row.na * 2 + row.nb;
      if (!seen.has(n)) { seen.add(n); todo.push(n); }
    }
  }
  return seen.size;
}

/** Draw a circuit that is worth analysing: every state is reachable from 00, x matters in at least 3 states, and y is not constant. */
function drawCircuit(kind, rnd) {
  for (;;) {
    const eqs = {};
    for (const p of FF[kind].ins) for (const f of ['A', 'B']) eqs[`${p}_${f}`] = randomSop(rnd);
    const mealy = rnd() < 0.6;
    const out = mealy ? [[[pickOf(['A', 'B'], rnd), rnd() < 0.5 ? 1 : 0], ['x', rnd() < 0.5 ? 1 : 0]]] : [[['A', rnd() < 0.5 ? 1 : 0], ['B', rnd() < 0.5 ? 1 : 0]]];
    const rows = simulate(kind, eqs, out);
    const xMatters = [0, 1, 2, 3].filter(s => rows[s * 2].na !== rows[s * 2 + 1].na || rows[s * 2].nb !== rows[s * 2 + 1].nb).length;
    const selfLoops = [0, 1, 2, 3].filter(s => [0, 1].every(x => rows[s * 2 + x].na * 2 + rows[s * 2 + x].nb === s)).length;
    const ys = new Set(rows.map(row => row.y));
    if (reachable(rows) === 4 && xMatters >= 3 && selfLoops === 0 && ys.size === 2) return { eqs, out, mealy, rows };
  }
}

export function makeSeqAnalysis(rnd) {
  const kind = pickOf(['D', 'JK', 'T'], rnd);
  const { eqs, out, mealy, rows } = drawCircuit(kind, rnd);
  const ins = FF[kind].ins;
  const eqTex = ['A', 'B'].flatMap(f => ins.map(p => `${p}_${f} = ${texSop(eqs[`${p}_${f}`])}`)).join(',\\quad ');
  const nextA = minimal(rows.map(row => row.na)), nextB = minimal(rows.map(row => row.nb));
  const seq = Array.from({ length: 6 }, () => (rnd() < 0.5 ? 1 : 0));
  let s = 0;
  const trace = seq.map(x => {
    const row = rows[s * 2 + x];
    const step = { from: s, x, y: row.y, to: row.na * 2 + row.nb };
    s = step.to;
    return step;
  });
  const st = n => n.toString(2).padStart(2, '0');
  const inCols = ['A', 'B'].flatMap(f => ins.map(p => `${p}_${f}`));
  const stateRows = rows.map(row => [row.a, row.b, row.x, ...(kind === 'D' ? [] : [...row.inA, ...row.inB]), row.na, row.nb, row.y].map(String));
  const arrows = [0, 1, 2, 3].flatMap(q => [0, 1].map(x => {
    const row = rows[q * 2 + x];
    return mealy ? `${st(q)} \\xrightarrow{${x}/${row.y}} ${st(row.na * 2 + row.nb)}` : `${st(q)} \\xrightarrow{${x}} ${st(row.na * 2 + row.nb)}`;
  }));
  const moore = mealy ? '' : r` Output $y$ depends only on the state, so write it inside each state circle: ${[0, 1, 2, 3].map(q => `$${st(q)}/${rows[q * 2].y}$`).join(', ')}.`;
  return {
    stem: r`A clocked sequential circuit has two ${kind} flip-flops $A$ and $B$ (positive-edge triggered), one input $x$ and one output $y$. The flip-flop input equations and the output equation are $${eqTex}$ and $y = ${texSop(out)}$.`,
    parts: [
      { pts: 10, q: r`Write the state equations $A(t+1)$ and $B(t+1)$ as minimal sums of products in $A$, $B$, $x$.`,
        a: [r`Characteristic equation of the ${kind} flip-flop: $${FF[kind].eq}$. Substitute the input equations and simplify (check with a $3$-variable map).`,
          r`$A(t+1) = ${nextA}$, $\quad B(t+1) = ${nextB}$`],
        rubric: [[4, r`characteristic equation used`], [6, r`both state equations correct and minimal`]], facts: { kind: `seq-${kind}`, nextA, nextB } },
      { pts: 20, q: r`Make the state table with the columns present state $AB$, input $x$, ${kind === 'D' ? '' : r`flip-flop inputs, `}next state and output $y$ (all $8$ rows).`,
        a: [r`$${table(['A', 'B', 'x', ...(kind === 'D' ? [] : inCols), 'A^+', 'B^+', 'y'], stateRows)}$`],
        rubric: [[6, r`rows in order, inputs evaluated`], [10, r`next state in every row`], [4, r`output in every row`]], facts: { kind, eqs, out, rows } },
      { pts: 15, q: r`Draw the state diagram. Label each arrow with ${mealy ? r`input/output ($x/y$)` : r`the input $x$`}.`,
        a: [r`One circle per state $AB$ and two arrows from each state (for $x = 0$ and $x = 1$).${moore}`, `$${arrows.slice(0, 4).join(',\\quad ')}$`, `$${arrows.slice(4).join(',\\quad ')}$`],
        rubric: [[5, r`four states`], [7, r`eight arrows to the right states`], [3, mealy ? r`labels $x/y$` : r`outputs in the circles`]], facts: { mealy } },
      { pts: 15, q: r`The circuit starts in state $AB = 00$. The input is $x = ${seq.join(', ')}$ at six clock edges, in this order. Give the state after each edge and the output $y$ just before each edge.`,
        a: [r`Follow the state table one row at a time.`,
          r`$${table(['\\text{edge}', 'AB', 'x', 'y', 'AB^+'], trace.map((t, i) => [String(i + 1), st(t.from), String(t.x), String(t.y), st(t.to)]))}$`],
        rubric: [[10, r`six next states`], [5, r`six outputs`]], facts: { seq, trace } },
    ],
    refs: [['5.4', 'Storage elements: flip-flops'], ['5.5', 'Analysis of clocked sequential circuits']],
  };
}

const LATCH = {
  JK: {
    name: r`a positive-edge-triggered JK flip-flop`, ins: ['J', 'K'], eq: r`Q(t+1) = JQ' + K'Q`,
    rows: [['0', '0', 'Q(t)', r`\text{no change}`], ['0', '1', '0', r`\text{reset}`], ['1', '0', '1', r`\text{set}`], ['1', '1', "Q'(t)", r`\text{complement}`]],
    next: (q, [j, k]) => (j && k ? 1 - q : j ? 1 : k ? 0 : q), legal: () => true,
    fromD: r`D = JQ' + K'Q`, fromDNote: r`Feed $D$ with the characteristic equation: an inverter for $Q'$ and $K'$, two ANDs and one OR.`, unit: 'clock edge',
  },
  T: {
    name: r`a positive-edge-triggered T flip-flop`, ins: ['T'], eq: r`Q(t+1) = T \oplus Q`,
    rows: [['0', 'Q(t)', r`\text{no change}`], ['1', "Q'(t)", r`\text{complement}`]],
    next: (q, [t]) => q ^ t, legal: () => true,
    fromD: r`D = T \oplus Q`, fromDNote: r`One XOR gate with inputs $T$ and $Q$ drives $D$.`, unit: 'clock edge',
  },
  SR: {
    name: r`an SR latch built from two NOR gates`, ins: ['S', 'R'], eq: r`Q(t+1) = S + R'Q \quad (SR = 0)`,
    rows: [['0', '0', 'Q(t)', r`\text{no change}`], ['0', '1', '0', r`\text{reset}`], ['1', '0', '1', r`\text{set}`], ['1', '1', '?', r`\text{not allowed}`]],
    next: (q, [s, rr]) => (s ? 1 : rr ? 0 : q), legal: ([s, rr]) => !(s && rr),
    fromD: r`S = D \cdot En,\; R = D' \cdot En`, fromDNote: r`This is the D latch: two ANDs (or NANDs) with the enable $En$ and one inverter, so $S = R = 1$ can never happen.`, unit: 'input change',
  },
};

export function makeFlipFlop(rnd) {
  const kind = pickOf(['JK', 'T', 'SR'], rnd), L = LATCH[kind];
  const steps = [];
  let q = 0;
  while (steps.length < 6) {
    const v = L.ins.map(() => (rnd() < 0.5 ? 1 : 0));
    if (!L.legal(v)) continue;
    q = L.next(q, v);
    steps.push({ v, q });
  }
  const conv = kind === 'SR' ? r`Build a D latch (inputs $D$ and enable $En$) from this SR latch: write $S$ and $R$ in terms of $D$ and $En$, and say why the forbidden input cannot occur.`
    : r`Build this ${kind} flip-flop from one D flip-flop and gates: write $D$ in terms of ${L.ins.map(p => `$${p}$`).join(', ')} and $Q$.`;
  return {
    stem: r`Consider ${L.name}, with output $Q$.`,
    parts: [
      { pts: 8, q: r`Write its characteristic table (${L.ins.map(p => `$${p}$`).join(', ')}, next state $Q(t+1)$, and the name of each action).`,
        a: [r`$${table([...L.ins, 'Q(t+1)', r`\text{action}`], L.rows)}$`], rubric: [[6, r`every row correct`], [2, r`actions named`]], facts: { kind: `ff-${kind}` } },
      { pts: 7, q: r`Write its characteristic equation.`, a: [r`$${L.eq}$`], rubric: [[4, r`terms of the equation`], [3, kind === 'SR' ? r`condition $SR = 0$ stated` : r`equation in $Q$ form`]], facts: {} },
      { pts: 10, q: r`$Q$ starts at $0$. Give $Q$ after each ${L.unit}, for the inputs $${L.ins.length > 1 ? `(${L.ins.join(', ')})` : L.ins[0]} = ${steps.map(s => (s.v.length > 1 ? `(${s.v.join(',')})` : s.v[0])).join(',\\ ')}$ in this order.`,
        a: [r`Apply the characteristic table step by step.`, r`$Q = ${steps.map(s => s.q).join(', ')}$`], rubric: [[5, r`first three values of $Q$`], [5, r`last three values of $Q$`]], facts: { steps } },
      { pts: 10, q: conv, a: [r`$${L.fromD}$`, L.fromDNote], rubric: [[6, kind === 'SR' ? r`$S$ and $R$ equations` : r`equation for $D$`], [4, kind === 'SR' ? r`reason: $D$ and $D'$ are never both $1$` : r`gates named`]], facts: { fromD: L.fromD } },
    ],
    refs: kind === 'SR' ? [['5.3', 'Storage elements: latches']] : [['5.4', 'Storage elements: flip-flops']],
  };
}

/* ---------------------------------------------------------------
   Final-exam questions for Chapter 5 (Mano 5.3–5.5, 5.7–5.8), pure: latches and flip-flops, the analysis of a clocked
   sequential circuit with two flip-flops (A, B), one input x and one output y, state reduction and assignment (5.7),
   and the design of a circuit from a state table, a word specification or a binary counter (5.8). Answers come from
   simulation; the test re-simulates the circuit with its own evaluator.
   --------------------------------------------------------------- */
import { minimizeSOP } from './quine-mccluskey.js';
import { table, kmap } from './mock-tex.js';

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

/* ---- Mano 5.7: state reduction and assignment (slides Ch5 Part 2, pp. 1–18) ---- */
const LBL = 'abcde';
/** Equivalence classes of a Mealy table by partition refinement: split by outputs, then by the classes of the next states. */
function classesOf(next, out) {
  let cls = out.map(o => o.join('')), count = new Set(cls).size;
  for (;;) {
    const sig = next.map((nx, s) => `${cls[s]}|${nx.map(t => cls[t]).join(',')}`), ids = [...new Set(sig)];
    cls = sig.map(g => ids.indexOf(g));
    if (ids.length === count) return cls;
    count = ids.length;
  }
}
const REDUCE_COLS = ['Q', 'Q^+(x{=}0)', 'Q^+(x{=}1)', 'y(x{=}0)', 'y(x{=}1)'];

function drawReduction(rnd) {
  for (;;) {
    const m = rnd() < 0.5 ? 3 : 4, rand = n => Math.floor(rnd() * n);
    const base = Array.from({ length: m }, () => [rand(m), rand(m)]), baseOut = Array.from({ length: m }, () => [rand(2), rand(2)]);
    if (new Set(classesOf(base, baseOut)).size !== m) continue;
    const k = rand(m);
    const next = base.map(nx => nx.map(t => (t === k && rnd() < 0.5 ? m : t))).concat([[...base[k]]]), out = baseOut.concat([[...baseOut[k]]]);
    if (!next.slice(0, m).some(nx => nx.includes(m))) continue;
    // Shuffle the labels so that the equivalent pair is not always at the bottom.
    const perm = Array.from({ length: m + 1 }, (_, i) => i).sort(() => rnd() - 0.5);
    const inv = perm.map((_, l) => perm.indexOf(l));
    return { m, next: inv.map(o => next[o].map(t => perm[t])), out: inv.map(o => out[o]), pair: [perm[k], perm[m]].sort() };
  }
}

export function makeStateReduction(rnd) {
  const { m, next, out, pair: [p, q] } = drawReduction(rnd), n = m + 1;
  const keep = Array.from({ length: n }, (_, s) => s).filter(s => s !== q), at = s => (s === q ? p : s);
  const rNext = keep.map(s => next[s].map(at)), rOut = keep.map(s => out[s]);
  const rows = (nx, ot, ids) => ids.map((s, i) => [LBL[s], LBL[nx[i][0]], LBL[nx[i][1]], String(ot[i][0]), String(ot[i][1])]);
  const ffs = c => Math.max(1, Math.ceil(Math.log2(c)));
  const code = s => keep.indexOf(s).toString(2).padStart(2, '0');
  const coded = keep.flatMap((s, i) => [0, 1].map(x => [...code(s), String(x), ...code(rNext[i][x]), String(rOut[i][x])]));
  return {
    stem: r`The state table of a clocked Mealy circuit (input $x$, output $y$) is $${table(REDUCE_COLS, rows(next, out, [...Array(n).keys()]))}$ It has ${n} states, written $a$ to $${LBL[n - 1]}$. Two of them are equivalent.`,
    parts: [
      { pts: 10, q: r`Find the two equivalent states and explain why they are equivalent.`,
        a: [r`$${LBL[p]} \equiv ${LBL[q]}$`, r`They give the same output for $x = 0$ and for $x = 1$. For each $x$ their next states are the same state, or the pair $${LBL[p]}, ${LBL[q]}$ itself, so no input sequence can tell them apart.`],
        rubric: [[6, r`the equivalent pair`], [4, r`same outputs and equivalent next states`]], facts: { kind: 'reduce-pair', next, out, pair: [p, q] } },
      { pts: 10, q: r`Merge them and write the reduced state table (keep the state $${LBL[p]}$ and replace $${LBL[q]}$ by $${LBL[p]}$ everywhere).`,
        a: [r`$${table(REDUCE_COLS, rows(rNext, rOut, keep))}$`], rubric: [[4, r`the state $${LBL[q]}$ removed`], [6, r`every next state and output correct`]], facts: { kind: 'reduce-table', keep } },
      { pts: 5, q: r`How many flip-flops does a binary state code need before and after the reduction? How many with one-hot encoding?`,
        a: [r`Binary needs the smallest $n$ with $2^n \ge$ the number of states: $${ffs(n)}$ flip-flops for ${n} states and $${ffs(m)}$ for ${m} states.${ffs(n) === ffs(m) ? ' Fewer states did not save a flip-flop here.' : ''}`,
          r`One-hot uses one flip-flop per state: $${n}$ before and $${m}$ after.`],
        rubric: [[3, r`binary count before and after`], [2, r`one-hot count before and after`]], facts: { kind: 'reduce-ff', n, m, bin: [ffs(n), ffs(m)], hot: [n, m] } },
      { pts: 10, q: r`Assign binary codes to the reduced states in the order ${keep.map(s => `$${LBL[s]}$`).join(', ')} (the first is $00$, then $01$, and so on). Write the binary state table with columns $A$, $B$, $x$, $A^+$, $B^+$, $y$.`,
        a: [r`$${table(['A', 'B', 'x', 'A^+', 'B^+', 'y'], coded)}$`, m === 3 ? r`The code $11$ is not used. Treat it as a don't-care when you simplify.` : r`All four codes are used.`],
        rubric: [[3, r`codes in the given order`], [7, r`every row correct`]], facts: { kind: 'reduce-coded', coded } },
    ],
    refs: [['5.7', 'State reduction and assignment (slides Ch5 Part 2, pp. 1–18)']],
  };
}

/* ---- Mano 5.8: design procedure (slides Ch5 Part 2, pp. 19–49) ---- */
const SX = '\\times';
// Excitation tables (Mano Table 5.12): inputs needed for the move q -> n; 2 means don't-care.
const EXC = {
  D: { ins: ['D'], f: (q, n) => [n] },
  T: { ins: ['T'], f: (q, n) => [q ^ n] },
  JK: { ins: ['J', 'K'], f: (q, n) => (q ? (n ? [2, 0] : [2, 1]) : (n ? [1, 2] : [0, 2])) },
};
const cellOf = v => (v === 2 ? SX : String(v));

function randomMachine(rnd) {
  for (;;) {
    const moore = rnd() < 0.5, ns = Array.from({ length: 8 }, () => Math.floor(rnd() * 4));
    const yS = Array.from({ length: 4 }, () => (rnd() < 0.5 ? 1 : 0)), yR = Array.from({ length: 8 }, () => (rnd() < 0.5 ? 1 : 0));
    const rows = ns.map((n, m) => ({ a: m >> 2, b: (m >> 1) & 1, x: m & 1, na: n >> 1, nb: n & 1, y: moore ? yS[m >> 1] : yR[m] }));
    const xMatters = [0, 1, 2, 3].filter(s => rows[s * 2].na !== rows[s * 2 + 1].na || rows[s * 2].nb !== rows[s * 2 + 1].nb).length;
    const loops = [0, 1, 2, 3].filter(s => [0, 1].every(x => rows[s * 2 + x].na * 2 + rows[s * 2 + x].nb === s)).length;
    if (reachable(rows) === 4 && xMatters >= 3 && !loops && new Set(rows.map(row => row.y)).size === 2) return { moore, rows };
  }
}

/** Gate list for minimal equations: an AND gate for each product of 2 or more literals, one OR gate for a sum of 2 or more products. */
function gateLines(eqs) {
  let and = 0, or = 0;
  const lines = Object.entries(eqs).map(([name, e]) => {
    const terms = e.split(' + '), prods = terms.filter(t => (t.match(/[ABx]'?/g) ?? []).length > 1);
    and += prods.length;
    or += terms.length > 1 ? 1 : 0;
    return `$${name} = ${e}$: ${prods.length} AND, ${terms.length > 1 ? 1 : 0} OR`;
  });
  return { lines, and, or };
}

export function makeSeqDesign(rnd) {
  const kind = pickOf(['D', 'JK', 'T'], rnd), E = EXC[kind], detector = rnd() < 0.5;
  let rows, stem, moore = true;
  if (detector) {
    const b = rnd() < 0.5 ? 1 : 0;
    rows = Array.from({ length: 8 }, (_, m) => {
      const s = m >> 1, x = m & 1, n = x === b ? Math.min(s + 1, 3) : 0;
      return { a: s >> 1, b: s & 1, x, na: n >> 1, nb: n & 1, y: +(s === 3) };
    });
    stem = r`Design a circuit that detects three or more consecutive $${b}$s in a serial input $x$. The output $y$ is $1$ exactly in the state that means three or more. The states are $S_0$ (no $${b}$ yet), $S_1$, $S_2$ and $S_3$ (that many consecutive $${b}$s; $S_3$ means three or more) with codes $AB = 00, 01, 10, 11$. Use two ${kind} flip-flops $A$ and $B$.`;
  } else {
    ({ moore, rows } = randomMachine(rnd));
    stem = r`A circuit has two ${kind} flip-flops $A$ and $B$, one input $x$ and one output $y$. Its state table is $${table(['A', 'B', 'x', 'A^+', 'B^+', 'y'], rows.map(w => [w.a, w.b, w.x, w.na, w.nb, w.y].map(String)))}$ Design the circuit.`;
  }
  const raw = {};
  ['A', 'B'].forEach((f, i) => {
    const cols = rows.map(w => E.f(i ? w.b : w.a, i ? w.nb : w.na));
    E.ins.forEach((p, k) => { raw[`${p}_${f}`] = cols.map(c => c[k]); });
  });
  const eqs = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, minimal(v)]));
  const yVals = rows.map(w => w.y), yExpr = minimal(yVals);
  const inCols = Object.keys(raw), names = ['A', 'B', 'x'];
  const full = rows.map((w, m) => [w.a, w.b, w.x, w.na, w.nb, w.y, ...inCols.map(c => cellOf(raw[c][m]))].map(String));
  const gates = gateLines({ ...eqs, y: yExpr });
  return {
    stem,
    parts: [
      { pts: 10, q: detector ? r`Write the state table with columns $A$, $B$, $x$, $A^+$, $B^+$, $y$ and the flip-flop inputs ${inCols.map(c => `$${c}$`).join(', ')}.` : r`Add the flip-flop input columns ${inCols.map(c => `$${c}$`).join(', ')} to the state table (use the excitation table of the ${kind} flip-flop; $${SX}$ is a don't-care).`,
        a: [kind === 'JK' ? r`Excitation table of JK: $0 \to 0$ needs $J = 0, K = ${SX}$; $0 \to 1$ needs $J = 1, K = ${SX}$; $1 \to 0$ needs $J = ${SX}, K = 1$; $1 \to 1$ needs $J = ${SX}, K = 0$.` : kind === 'T' ? r`Excitation table of T: $T = 1$ when the flip-flop must change, $T = 0$ when it must stay.` : r`For a D flip-flop the input is the next state: $D = Q(t+1)$.`,
          r`$${table(['A', 'B', 'x', 'A^+', 'B^+', 'y', ...inCols], full)}$`],
        rubric: [[4, detector ? r`state table from the specification` : r`present and next states copied`], [6, r`every flip-flop input correct`]], facts: { kind: `design-${kind}`, flavor: detector ? 'detector' : 'table', rows, inCols } },
      { pts: 20, q: r`Using Karnaugh maps in $A$, $B$, $x$, find the minimal sum-of-products equation of each flip-flop input${kind === 'JK' ? r` (use the don't-cares)` : ''}.`,
        a: inCols.flatMap(c => [r`$${c}$: $${kmap(raw[c], names)}$`, r`$${c} = ${eqs[c]}$`]),
        rubric: [[8, r`maps filled from the table`], [12, r`minimal equations`]], facts: { eqs, raw } },
      { pts: 10, q: moore ? r`Find the minimal equation of the output $y$.` : r`Find the minimal equation of the output $y$ (it depends on $x$ too).`,
        a: [r`$y$: $${kmap(yVals, names)}$`, r`$y = ${yExpr}$`], rubric: [[4, r`map of $y$`], [6, r`minimal equation`]], facts: { yExpr, yVals } },
      { pts: 20, q: r`Draw the logic diagram. Say which gates drive each flip-flop input and the output, and count the AND gates and OR gates (a single literal needs no gate; take complements from the flip-flop outputs $Q'$ and an inverter for $x'$).`,
        a: [...gates.lines, r`Total: $${gates.and}$ AND gates and $${gates.or}$ OR gates, two flip-flops $A$ and $B$ with one common clock.`],
        rubric: [[8, r`each input and the output driven by the right gates`], [6, r`gate count`], [6, r`clock and feedback of $Q$ to the gates`]], facts: { and: gates.and, or: gates.or } },
    ],
    refs: [['5.8', 'Design procedure (slides Ch5 Part 2, pp. 19–43)']],
  };
}

export function makeCounterDesign(rnd) {
  const n = rnd() < 0.5 ? 3 : 4, size = 1 << n, pulses = 5 + Math.floor(rnd() * 9);
  const bitsOf = (s, w) => s.toString(2).padStart(w, '0').split('');
  const Aname = i => `A_${i}`, order = Array.from({ length: n }, (_, k) => n - 1 - k);
  const T = i => order.filter(j => j < i).map(Aname).join('') || '1';
  const rows = Array.from({ length: size }, (_, s) => [...bitsOf(s, n), ...bitsOf((s + 1) % size, n), ...order.map(i => String(((s ^ ((s + 1) % size)) >> i) & 1))]);
  const after = pulses % size, before = (pulses - 1) % size, toggled = order.filter(i => ((before ^ after) >> i) & 1);
  const eqLines = order.map(i => r`$T_${i} = ${T(i)}$`);
  const and = order.filter(i => i >= 2).length;
  return {
    stem: r`Design a ${n}-bit binary up counter with T flip-flops $${order.map(Aname).join(', ')}$. The only input is the clock. The count goes $0, 1, \ldots, ${size - 1}$ and returns to $0$.`,
    parts: [
      { pts: 10, q: r`Write the state table (present state, next state) and the T inputs.`,
        a: [r`A T flip-flop toggles when $T = 1$, so $T_i = 1$ exactly when bit $i$ changes.`, r`$${table([...order.map(Aname), ...order.map(i => `A_${i}^+`), ...order.map(i => `T_${i}`)], rows)}$`],
        rubric: [[4, r`next states in counting order`], [6, r`every $T$ input correct`]], facts: { kind: 'counter-T', n, rows } },
      { pts: 20, q: r`Find the simplified equation of each T input.`,
        a: [r`Bit $i$ changes exactly when all lower bits are $1$.`, ...eqLines], rubric: [[6, r`$T_0$ and $T_1$`], [14, r`the equations for the higher bits`]], facts: { n, eq: order.map(T) } },
      { pts: 10, q: r`The counter is in state $0$. Give the state after ${pulses} clock pulses and the T inputs that equal $1$ just before the last pulse.`,
        a: [r`The count is ${pulses} mod ${size}, so the state is $${bitsOf(after, n).join('')}$.`, r`Just before the last pulse the state is $${bitsOf(before, n).join('')}$; the T inputs equal $1$ for ${toggled.map(i => `$T_${i}$`).join(', ')}.`],
        rubric: [[5, r`state after the pulses`], [5, r`the T inputs that equal $1$`]], facts: { pulses, size, after, toggled } },
      { pts: 20, q: r`Draw the circuit. Say how each T input is driven and count the flip-flops and the AND gates.`,
        a: [r`$T_0$ is tied to $1$ and $T_1 = A_0$ is a wire. Each higher $T_i$ comes from one AND gate with the lower bits as inputs.`, r`Total: $${n}$ T flip-flops and $${and}$ AND gates, with one common clock.`],
        rubric: [[8, r`$T_0$ and $T_1$ wiring`], [8, r`AND gates for the higher bits`], [4, r`counts and clock`]], facts: { n, and } },
    ],
    refs: [['5.8', 'Design procedure (slides Ch5 Part 2, pp. 44–49)']],
  };
}

/* Chapter 5 final-exam questions (analysis, flip-flops, state reduction, design): an independent oracle re-simulates each circuit from the printed equations
   with its own characteristic tables (copied by hand from Mano Tables 5.1 and 5.2), then checks every answer line. */
import { describe, it, expect } from 'vitest';
import { buildMock } from '@shared/logic/mock-exam.js';
import { LOGIC_MOCK } from '../src/logic/mock-exam.js';

const SEEDS = Array.from({ length: 60 }, (_, i) => i * 389 + 11);
const exams = SEEDS.map(s => buildMock(LOGIC_MOCK, s));
// Mano Table 5.1: JK = 00 hold, 01 reset, 10 set, 11 toggle; T = 1 toggles; NOR SR latch: S sets, R resets.
const CHAR = {
  JK: (q, [j, k]) => [[q, 0], [1, 1 - q]][j][k],
  T: (q, [t]) => (t ? 1 - q : q),
  D: (q, [d]) => d,
  SR: (q, [s, r]) => (s ? 1 : r ? 0 : q),
};
const INS = { JK: ['J', 'K'], T: ['T'], D: ['D'] };
// Evaluate a printed SOP such as "A'x + B" at (A, B, x); this parser does not share code with the generator.
const evalText = (expr, v) => (expr === '0' ? 0 : expr === '1' ? 1 : expr.split(' + ').some(t => [...t.matchAll(/([ABx])('?)/g)].every(([, n, p]) => (p ? 1 - v[n] : v[n]) === 1)) ? 1 : 0);
const evalTerms = (terms, v) => (terms.some(t => t.every(([n, neg]) => (neg ? 1 - v[n] : v[n]) === 1)) ? 1 : 0);
const texOf = terms => terms.map(t => t.map(([n, neg]) => n + (neg ? "'" : '')).join('')).join(' + ');

function oracle(kind, eqs, out) {
  return Array.from({ length: 8 }, (_, m) => {
    const v = { A: m >> 2, B: (m >> 1) & 1, x: m & 1 };
    const inp = f => INS[kind].map(p => evalTerms(eqs[`${p}_${f}`], v));
    return { v, na: CHAR[kind](v.A, inp('A')), nb: CHAR[kind](v.B, inp('B')), y: evalTerms(out, v) };
  });
}

describe('Ch5 sequential analysis (Q4)', () => {
  const qs = exams.map(e => e.questions[3]).filter(q => (q.parts[0].facts.kind ?? '').startsWith('seq-'));
  it('state table, state equations, diagram and trace match the oracle on 60 seeds', () => {
    for (const q of qs) {
      const [pEq, pTab, pDia, pSeq] = q.parts;
      const kind = pTab.facts.kind, { eqs, out, rows } = pTab.facts, want = oracle(kind, eqs, out);
      // the stem prints the same equations the oracle reads
      for (const [k, terms] of Object.entries(eqs)) expect(q.stem).toContain(`${k} = ${texOf(terms)}`);
      expect(q.stem).toContain(`y = ${texOf(out)}`);
      want.forEach((w, m) => {
        expect([rows[m].na, rows[m].nb, rows[m].y], `${kind} row ${m}`).toEqual([w.na, w.nb, w.y]);
        expect(evalText(pEq.facts.nextA, w.v), `A+ ${m}`).toBe(w.na);
        expect(evalText(pEq.facts.nextB, w.v), `B+ ${m}`).toBe(w.nb);
      });
      // printed state table rows: A B x ... A+ B+ y
      const body = pTab.a[0].split('\\hline')[1].replace('\\end{array}$', '').split('\\\\').map(r => r.split('&').map(c => c.trim()));
      body.forEach((cells, m) => expect(cells.slice(-3).join(''), `table row ${m}`).toBe(`${want[m].na}${want[m].nb}${want[m].y}`));
      // every arrow of the diagram
      const st = n => n.toString(2).padStart(2, '0'), arrows = pDia.a.slice(1).join(' ');
      want.forEach((w, m) => expect(arrows).toContain(`${st(m >> 1)} \\xrightarrow{${w.v.x}${pDia.facts.mealy ? `/${w.y}` : ''}} ${st(w.na * 2 + w.nb)}`));
      // trace from 00
      let s = 0;
      pSeq.facts.seq.forEach((x, i) => {
        const w = want[s * 2 + x], t = pSeq.facts.trace[i];
        expect([t.from, t.y, t.to]).toEqual([s, w.y, w.na * 2 + w.nb]);
        s = t.to;
      });
    }
  });
  it('every circuit reaches all 4 states from 00, input x matters, y is not constant', () => {
    for (const q of qs) {
      const { kind, eqs, out } = q.parts[1].facts, want = oracle(kind, eqs, out);
      const seen = new Set([0]);
      for (let i = 0; i < 4; i++) for (const s of [...seen]) for (const x of [0, 1]) seen.add(want[s * 2 + x].na * 2 + want[s * 2 + x].nb);
      expect(seen.size).toBe(4);
      expect(new Set(want.map(w => w.y)).size).toBe(2);
    }
  });
  it('all three flip-flop kinds and both Mealy and Moore outputs occur', () => {
    expect(new Set(qs.map(q => q.parts[1].facts.kind))).toEqual(new Set(['D', 'JK', 'T']));
    expect(new Set(qs.map(q => q.parts[2].facts.mealy))).toEqual(new Set([true, false]));
  });
  it('mutation: the oracle notices one wrong next state', () => {
    const { kind, eqs, out, rows } = qs[0].parts[1].facts, want = oracle(kind, eqs, out);
    const bad = rows.map((r, m) => (m === 5 ? { ...r, na: 1 - r.na } : r));
    expect(bad.some((r, m) => r.na !== want[m].na)).toBe(true);
    expect(evalText("A'x + B", { A: 0, B: 0, x: 1 })).toBe(1);
    expect(evalText("A'x + B", { A: 1, B: 0, x: 1 })).toBe(0);
  });
});

describe('Ch5 latch and flip-flop (Q3)', () => {
  const qs = exams.map(e => e.questions[2]).filter(q => (q.parts[0].facts.kind ?? '').startsWith('ff-'));
  it('Q sequence follows the hand-copied characteristic table; SR never gets S = R = 1', () => {
    for (const q of qs) {
      const kind = q.parts[0].facts.kind.slice(3), { steps } = q.parts[2].facts;
      let s = 0;
      for (const st of steps) {
        if (kind === 'SR') expect(st.v[0] && st.v[1]).toBe(0);
        s = CHAR[kind](s, st.v);
        expect(st.q).toBe(s);
      }
      expect(q.parts[2].a[1]).toBe(`$Q = ${steps.map(t => t.q).join(', ')}$`);
    }
  });
  it('the D conversion equation gives the same next state as the flip-flop', () => {
    for (const q of qs) {
      const kind = q.parts[0].facts.kind.slice(3);
      if (kind === 'SR') { expect(q.parts[3].facts.fromD).toContain("D'"); continue; }
      for (const Q of [0, 1]) for (const a of [0, 1]) for (const b of [0, 1]) {
        const v = kind === 'T' ? [a] : [a, b];
        const d = kind === 'T' ? a ^ Q : (a & (1 - Q)) | ((1 - b) & Q);
        expect(d, `${kind} Q=${Q} in=${v}`).toBe(CHAR[kind](Q, v));
      }
      expect(q.parts[3].facts.fromD).toBe(kind === 'T' ? 'D = T \\oplus Q' : "D = JQ' + K'Q");
    }
  });
  it('all three kinds occur', () => {
    expect(new Set(qs.map(q => q.parts[0].facts.kind))).toEqual(new Set(['ff-JK', 'ff-T', 'ff-SR']));
  });
});

// ---- helpers: read the tables and equations exactly as the learner sees them ----
const tableOf = str => str.match(/\\begin\{array\}.*?\\end\{array\}/s)[0].split('\\hline')[1].replace('\\end{array}', '').split('\\\\').map(r => r.split('&').map(c => c.trim()));
const ARR = '\\times';
const qOfKind = prefix => exams.map(e => e.questions).flat().filter(q => (q.parts[0].facts.kind ?? '').startsWith(prefix));
// an equation printed as "$name = expr$" in the answer lines
const eqOf = (lines, name) => lines.map(l => l.match(new RegExp(`^\\$${name.replace('_', '_')} = (.*)\\$(?::|$)`))).find(Boolean)?.[1];
const evalSopText = (expr, v) => (expr === '0' ? 0 : expr === '1' ? 1 : expr.split(' + ').some(t => [...t.matchAll(/([ABx])('?)/g)].every(([, n, p]) => (p ? 1 - v[n] : v[n]) === 1)) ? 1 : 0);

describe('Ch5 state reduction and assignment (Q3, Mano 5.7)', () => {
  const qs = qOfKind('reduce-pair');
  // Own oracle: run every input string of length <= 6 from a state and collect the outputs.
  const run = (nx, ot, s, str) => str.map(x => { const o = ot[s][x]; s = nx[s][x]; return o; }).join('');
  const strings = Array.from({ length: 127 }, (_, i) => (i + 1).toString(2).slice(1).split('').map(Number));
  const parse = t => {
    const lab = t.map(r => r[0]), idx = c => lab.indexOf(c);
    return { lab, nx: t.map(r => [idx(r[1]), idx(r[2])]), ot: t.map(r => [+r[3], +r[4]]) };
  };
  function check(q) {
    const orig = parse(tableOf(q.stem)), red = parse(tableOf(q.parts[1].a[0])), coded = tableOf(q.parts[3].a[0]);
    const pair = q.parts[0].a[0].match(/\$(\w) \\equiv (\w)\$/).slice(1);
    // 1. every original state behaves like its representative in the reduced table (merge of the pair only)
    const rep = c => (c === pair[1] ? pair[0] : c);
    const ok1 = orig.lab.every((c, s) => strings.every(str => run(orig.nx, orig.ot, s, str) === run(red.nx, red.ot, red.lab.indexOf(rep(c)), str)));
    // 2. the pair is equivalent in the original, and the reduced table has exactly one state fewer and no equivalent pair left
    const sa = orig.lab.indexOf(pair[0]), sb = orig.lab.indexOf(pair[1]);
    const ok2 = strings.every(str => run(orig.nx, orig.ot, sa, str) === run(orig.nx, orig.ot, sb, str)) && red.lab.length === orig.lab.length - 1;
    const ok3 = red.lab.every((_, s) => red.lab.every((_, t) => s === t || strings.some(str => run(red.nx, red.ot, s, str) !== run(red.nx, red.ot, t, str))));
    // 3. coded table: code of the i-th reduced state is i in binary; rows follow (state, x)
    const code = i => i.toString(2).padStart(2, '0');
    const ok4 = red.lab.every((_, i) => [0, 1].every(x => coded[i * 2 + x].join('') === `${code(i)}${x}${code(red.nx[i][x])}${red.ot[i][x]}`));
    // 4. flip-flop counts printed in the answer
    const need = c => { let n = 1; while ((1 << n) < c) n++; return n; };
    const nF = orig.lab.length, mF = red.lab.length;
    const ok5 = q.parts[2].a[0].includes(`$${need(nF)}$ flip-flops for ${nF} states and $${need(mF)}$ for ${mF} states`) && q.parts[2].a[1] === `One-hot uses one flip-flop per state: $${nF}$ before and $${mF}$ after.`;
    return [ok1, ok2, ok3, ok4, ok5];
  }
  it('pair, reduced table, flip-flop counts and coded table match the oracle on 60 seeds', () => {
    expect(qs.length).toBeGreaterThan(15);
    for (const q of qs) expect(check(q)).toEqual([true, true, true, true, true]);
  });
  it('both 3-state and 4-state reductions occur (no flip-flop saved when 4 -> 3)', () => {
    expect(new Set(qs.map(q => q.parts[1].facts.keep.length))).toEqual(new Set([3, 4]));
  });
  it('mutation: one wrong output in the reduced table, or one wrong code, is caught', () => {
    const q = qs[0], rows = tableOf(q.parts[1].a[0]);
    const flip = (str, row, col) => { const t = rows.map(r => [...r]); t[row][col] = t[row][col] === '0' ? '1' : '0'; return `$\\begin{array}{ccccc} h \\\\ \\hline ${t.map(r => r.join(' & ')).join(' \\\\ ')} \\end{array}$`; };
    expect(check({ ...q, parts: [q.parts[0], { ...q.parts[1], a: [flip('', 1, 3)] }, q.parts[2], q.parts[3]] })[0]).toBe(false);
    const bad = tableOf(q.parts[3].a[0]).map(r => [...r]);
    bad[1][4] = bad[1][4] === '0' ? '1' : '0';
    const badText = `$\\begin{array}{cccccc} h \\\\ \\hline ${bad.map(r => r.join(' & ')).join(' \\\\ ')} \\end{array}$`;
    expect(check({ ...q, parts: [q.parts[0], q.parts[1], q.parts[2], { ...q.parts[3], a: [badText] }] })[3]).toBe(false);
  });
});

describe('Ch5 sequential design (Q4, Mano 5.8)', () => {
  const qs = qOfKind('design-');
  // Own excitation tables (Mano Table 5.12): required inputs for the move q -> n; null = don't-care.
  const EXC = { D: (q, n) => [n], T: (q, n) => [q === n ? 0 : 1], JK: (q, n) => [[[0, null], [1, null]], [[null, 1], [null, 0]]][q][n] };
  const NAMES = { D: ['D'], T: ['T'], JK: ['J', 'K'] };
  function check(q) {
    const kind = q.parts[0].facts.kind.slice(7), detector = q.parts[0].facts.flavor === 'detector';
    const full = tableOf(q.parts[0].a[1]);
    const spec = detector ? null : tableOf(q.stem);
    const bBit = detector ? +q.stem.match(/consecutive \$(\d)\$s/)[1] : null;
    let ok = [];
    // state table: from the stem (table flavour) or from my own detector simulation (word flavour)
    ok.push(full.every((r, m) => {
      const s = m >> 1, x = m & 1;
      const next = detector ? (x === bBit ? Math.min(s + 1, 3) : 0) : +spec[m][3] * 2 + +spec[m][4];
      const y = detector ? +(s === 3) : +spec[m][5];
      return +r[0] * 2 + +r[1] === s && +r[2] === x && +r[3] * 2 + +r[4] === next && +r[5] === y;
    }));
    // flip-flop input columns against the excitation table; equations against every non-don't-care row
    const cols2 = q.parts[0].facts.inCols;
    ok.push(full.every(r => [0, 1].every(f => EXC[kind](+r[f], +r[3 + f]).every((want, k) => {
      const col = 6 + cols2.indexOf(`${NAMES[kind][k]}_${'AB'[f]}`);
      return want === null ? r[col] === ARR : +r[col] === want;
    }))));
    ok.push(cols2.every(c => full.every((r, m) => {
      const e = eqOf(q.parts[1].a, c), cell = r[6 + cols2.indexOf(c)];
      return e !== undefined && (cell === ARR || evalSopText(e, { A: m >> 2, B: (m >> 1) & 1, x: m & 1 }) === +cell);
    })));
    ok.push(full.every((r, m) => evalSopText(eqOf(q.parts[2].a, 'y'), { A: m >> 2, B: (m >> 1) & 1, x: m & 1 }) === +r[5]));
    // gate counts re-counted from the printed equations
    const eqs = [...cols2.map(c => eqOf(q.parts[1].a, c)), eqOf(q.parts[2].a, 'y')];
    const and = eqs.reduce((n, e) => n + e.split(' + ').filter(t => (t.match(/[ABx]'?/g) ?? []).length > 1).length, 0), or = eqs.filter(e => e.includes(' + ')).length;
    ok.push(q.parts[3].a.at(-1).startsWith(`Total: $${and}$ AND gates and $${or}$ OR gates`));
    return ok;
  }
  it('state table, flip-flop inputs, minimal equations (every row) and gate counts match the oracle', () => {
    expect(qs.length).toBeGreaterThan(15);
    for (const q of qs) expect(check(q), q.parts[0].facts.kind).toEqual([true, true, true, true, true]);
  });
  it('D, JK and T, and both the word (detector) and table flavours occur', () => {
    expect(new Set(qs.map(q => q.parts[0].facts.kind))).toEqual(new Set(['design-D', 'design-JK', 'design-T']));
    expect(new Set(qs.map(q => q.parts[0].facts.flavor))).toEqual(new Set(['detector', 'table']));
  });
  it('mutation: a wrong equation, a wrong input cell or a wrong gate count is caught', () => {
    const q = qs[0], c = q.parts[0].facts.inCols[0];
    expect(check(q).every(Boolean)).toBe(true);
    const withEq = e => ({ ...q, parts: [q.parts[0], { ...q.parts[1], a: q.parts[1].a.map(l => (l.startsWith(`$${c} = `) ? `$${c} = ${e}$` : l)) }, q.parts[2], q.parts[3]] });
    expect(["A", "A'", 'B', "B'", 'x', "x'"].some(e => check(withEq(e))[2] === false)).toBe(true);
    const bad = tableOf(q.parts[0].a[1]).map(r => [...r]);
    bad[3][6] = bad[3][6] === ARR ? '0' : bad[3][6] === '0' ? '1' : '0';
    const text = `$\\begin{array}{c} h \\\\ \\hline ${bad.map(r => r.join(' & ')).join(' \\\\ ')} \\end{array}$`;
    expect(check({ ...q, parts: [{ ...q.parts[0], a: [q.parts[0].a[0], text] }, ...q.parts.slice(1)] })[1]).toBe(false);
    const gates = q.parts[3].a.map((l, i, all) => (i === all.length - 1 ? l.replace(/\$(\d+)\$ AND/, (_, n) => `$${+n + 1}$ AND`) : l));
    expect(check({ ...q, parts: [q.parts[0], q.parts[1], q.parts[2], { ...q.parts[3], a: gates }] })[4]).toBe(false);
  });
});

describe('Ch5 binary counter design (Q4, Mano 5.8)', () => {
  const qs = qOfKind('counter-');
  const check = q => {
    const n = q.parts[0].facts.n, size = 2 ** n, t = tableOf(q.parts[0].a[1]);
    const rowsOk = t.length === size && t.every((r, s) => r.slice(0, n).join('') === s.toString(2).padStart(n, '0')
      && r.slice(n, 2 * n).join('') === ((s + 1) % size).toString(2).padStart(n, '0')
      && r.slice(2 * n).join('') === (s ^ ((s + 1) % size)).toString(2).padStart(n, '0'));
    // equations: T_i = product of the lower bits; evaluate the printed text on every row
    const eqs = q.parts[1].a.slice(1).map(l => l.match(/^\$T_(\d) = (.*)\$$/).slice(1));
    const eqOk = eqs.length === n && eqs.every(([i, e]) => t.every((r, s) => {
      const bitAt = j => (s >> j) & 1, prod = e === '1' ? 1 : [...e.matchAll(/A_(\d)/g)].every(m => bitAt(+m[1]) === 1) ? 1 : 0;
      return prod === +r[2 * n + (n - 1 - +i)];
    }));
    const p = +q.parts[2].q.match(/after (\d+) clock pulses/)[1], after = p % size, before = (p - 1) % size;
    const stateOk = q.parts[2].a[0].includes(`$${after.toString(2).padStart(n, '0')}$`) && q.parts[2].a[1].includes(`$${before.toString(2).padStart(n, '0')}$`);
    const togg = [...Array(n).keys()].filter(i => ((before ^ after) >> i) & 1).map(i => `$T_${i}$`);
    const ands = eqs.filter(([, e]) => (e.match(/A_/g) ?? []).length > 1).length;
    return [rowsOk, eqOk, stateOk && togg.every(x => q.parts[2].a[1].includes(x)), q.parts[3].a[1].includes(`$${n}$ T flip-flops and $${ands}$ AND gates`)];
  };
  it('table, equations, count after the pulses and gate count match the oracle', () => {
    expect(qs.length).toBeGreaterThan(10);
    for (const q of qs) expect(check(q)).toEqual([true, true, true, true]);
    expect(new Set(qs.map(q => q.parts[0].facts.n))).toEqual(new Set([3, 4]));
  });
  it('mutation: one wrong T equation is caught', () => {
    const q = qs[0], bad = { ...q, parts: [q.parts[0], { ...q.parts[1], a: q.parts[1].a.map(l => l.replace(/^\$T_1 = A_0\$/, '$T_1 = 1$')) }, q.parts[2], q.parts[3]] };
    expect(check(bad)[1]).toBe(false);
  });
});

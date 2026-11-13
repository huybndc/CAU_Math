/* Chapter 5 final-exam questions: an independent oracle re-simulates each circuit from the printed equations
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
  const qs = exams.map(e => e.questions[3]);
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
  const qs = exams.map(e => e.questions[2]);
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

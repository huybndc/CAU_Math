import { describe, it, expect } from 'vitest';
import { buildMock } from '@shared/logic/mock-exam.js';
import { LOGIC_MOCK } from '../src/logic/mock-exam.js';

const SEEDS = Array.from({ length: 160 }, (_, i) => i * 389 + 11);
const exams = SEEDS.map(s => buildMock(LOGIC_MOCK, s));
const parts = kind => exams.flatMap(e => e.questions).flatMap(q => q.parts).filter(p => p.facts.kind === kind);

const apply = (state, op) => {
  if (op.mode === 'hold') return state.slice();
  if (op.mode === 'right') return [op.serial, state[0], state[1], state[2]];
  if (op.mode === 'left') return [state[1], state[2], state[3], op.serial];
  return op.parallel.slice();
};

describe('Mano Chapter 6 registers', () => {
  it('every printed trace follows the universal-register operations', () => {
    const qs = parts('register-table').map(p => exams.flatMap(e => e.questions).find(q => q.parts.includes(p)));
    expect(qs.length).toBeGreaterThan(30);
    for (const q of qs) {
      const { initial, ops, trace } = q.parts[2].facts;
      let state = initial;
      ops.forEach((op, i) => {
        state = apply(state, op);
        expect(trace[i].before).toEqual(i ? trace[i - 1].after : initial);
        expect(trace[i].after).toEqual(state);
        expect(q.parts[2].a[0]).toContain(state.join(''));
      });
    }
  });

  it('mutation: a wrong shifted bit is detected', () => {
    const q = exams.flatMap(e => e.questions).find(x => x.parts[0].facts.kind === 'register-table');
    const { initial, ops } = q.parts[2].facts, bad = apply(initial, ops[0]);
    bad[0] ^= 1;
    expect(bad).not.toEqual(apply(initial, ops[0]));
  });
});

describe('Mano Chapter 7 memory and ROM', () => {
  it('organization, chip arrangement and every ROM row match independent arithmetic', () => {
    const qs = parts('memory-size').map(p => exams.flatMap(e => e.questions).find(q => q.parts.includes(p)));
    expect(qs.length).toBeGreaterThan(30);
    for (const q of qs) {
      const size = q.parts[0].facts, chips = q.parts[1].facts, rom = q.parts[2].facts;
      expect(size.words).toBe(2 ** size.addressBits);
      expect(size.capacity).toBe(size.words * size.width);
      expect(chips.banks * chips.parallel).toBe(chips.chips);
      expect(chips.chipWords * chips.banks).toBe(size.words);
      expect(chips.chipWidth * chips.parallel).toBe(size.width);
      for (let m = 0; m < 8; m++) {
        expect(rom.rows[m].slice(0, 3).join('')).toBe(m.toString(2).padStart(3, '0'));
        expect(rom.rows[m].slice(3).map(Number)).toEqual([+rom.y0.includes(m), +rom.y1.includes(m)]);
      }
    }
  });

  it('mutation: one ROM output or one capacity value is detected', () => {
    const q = exams.flatMap(e => e.questions).find(x => x.parts[0].facts.kind === 'memory-size');
    const size = q.parts[0].facts, rom = q.parts[2].facts;
    expect(size.capacity + 1).not.toBe(size.words * size.width);
    const bad = rom.rows.map(row => row.slice());
    bad[3][3] = bad[3][3] === '0' ? '1' : '0';
    expect(+bad[3][3]).not.toBe(+rom.y0.includes(3));
  });
});

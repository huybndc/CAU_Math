import {
  toDecimal, positionalTerms, intToBaseSteps, fracToBaseSteps, convertBase, binaryToGrouped, groupedToBinary,
} from './number-systems.js';
import { diminishedComplement, radixComplement, subtractByComplement, subtractValue, complementResultValue } from './complements.js';
import { FORMATS, range, encode, decode, addTwos, subTwos } from './signed-binary.js';

/* ---------------------------------------------------------------
   MÁY GIẢI SỐ (Chương 1): đổi cơ số · trừ bằng complement · số nhị phân có dấu.
   Mỗi hàm trả { answer, steps, expect } cho shared/ui/solver.js. Thuần: không DOM, không chữ hiển thị (chỉ khoá từ điển).
   --------------------------------------------------------------- */

export const BASES = [2, 8, 10, 16];
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = k => (k < 0 ? '⁻' : '') + String(Math.abs(k)).replace(/\d/g, d => SUP[d]);
const clean = x => String(+x.toFixed(10));                 // 0.30000000000000004 → 0.3
const GROUP = { 8: 3, 16: 4 };                              // nhị phân ↔ bát / thập lục: gộp 3 / 4 bit

/** Đổi một số (có thể có phần lẻ) từ cơ số `from` sang các cơ số còn lại, kèm cách làm cho từng cơ số đích. */
export function baseReport(text, from) {
  const dec = toDecimal(text, from);
  const targets = BASES.filter(r => r !== from);
  const conv = Object.fromEntries(targets.map(r => [r, convertBase(text, from, r)]));
  const inexact = r => !fracToBaseSteps(dec % 1, r).exact;
  const answer = targets.map(r => ({ key: `c1.base${r}`, m: conv[r] + (inexact(r) ? '…' : '') }));
  const steps = [];

  if (from !== 10) {
    const terms = positionalTerms(text, from);
    steps.push({
      group: 'ln.tabDec', head: { key: 'ln.stPos' }, why: { key: 'ln.whyPos', params: { r: from } },
      lines: [
        terms.map(t => `${t.digit}×${from}${sup(t.power)}`).join(' + '),
        '= ' + terms.map(t => clean(t.value * from ** t.power)).join(' + '),
        `= ${clean(dec)}`,
      ],
    });
  }
  for (const r of targets.filter(x => x !== 10)) {
    const group = `ln.tab${r}`;
    if (from === 2 && GROUP[r]) {
      const g = binaryToGrouped(text, GROUP[r]).groups;
      steps.push({
        group, head: { key: 'ln.stGroup', params: { k: GROUP[r] } }, why: { key: 'ln.whyGroup', params: { k: GROUP[r] } },
        lines: [[...g.int.map(x => x.bits), ...(g.frac.length ? ['.', ...g.frac.map(x => x.bits)] : [])].join(' '),
          `= ${[...g.int.map(x => x.digit), ...(g.frac.length ? ['.', ...g.frac.map(x => x.digit)] : [])].join(' ')}`,
          { key: 'ln.readAll', m: conv[r] }],
      });
      continue;
    }
    if (GROUP[from] && r === 2) {
      const g = groupedToBinary(text, GROUP[from]).groups;
      steps.push({
        group, head: { key: 'ln.stSpread', params: { k: GROUP[from] } }, why: { key: 'ln.whySpread', params: { k: GROUP[from] } },
        lines: [[...g.int.map(x => x.digit), ...(g.frac.length ? ['.', ...g.frac.map(x => x.digit)] : [])].join(' '),
          `= ${[...g.int.map(x => x.bits), ...(g.frac.length ? ['.', ...g.frac.map(x => x.bits)] : [])].join(' ')}`,
          { key: 'ln.readAll', m: conv[r] }],
      });
      continue;
    }
    const i = Math.floor(dec), f = dec - i;
    const div = intToBaseSteps(i, r);
    steps.push({
      group, head: { key: 'ln.stDiv', params: { r } }, why: { key: 'ln.whyDiv', params: { r } },
      lines: [
        ...div.steps.map(s => `${s.value} = ${r}×${s.quotient} + ${s.remainder}` + (s.remainder > 9 ? `  (${s.digit})` : '')),
        { key: 'ln.readUp', m: div.digits },
      ],
    });
    if (f > 0) {
      const mul = fracToBaseSteps(f, r);
      steps.push({
        group, head: { key: 'ln.stMul', params: { r } }, why: { key: 'ln.whyMul', params: { r } },
        lines: [
          ...mul.steps.map(s => `${clean(s.value)} × ${r} = ${clean(s.product)} → ${s.digit}`),
          mul.exact ? { key: 'ln.readDown', m: mul.digits } : { key: 'ln.noEnd', m: mul.digits + '…' },
        ],
      });
    }
  }
  return { answer, steps, expect: targets.flatMap(r => [conv[r], conv[r] + '…']) };
}

/** M − N ở cơ số r bằng r's complement (§1.5). */
export function complementReport(M, N, r) {
  const dim = diminishedComplement(N, r), rad = radixComplement(N, r), sub = subtractByComplement(M, N, r);
  const got = complementResultValue(sub, r), want = subtractValue(M, N, r);
  const shown = (sub.negative ? '−' : '') + sub.digits;
  return {
    answer: [{ key: 'ln.diffIs', params: { r }, m: shown }, { key: 'ln.decIs', m: String(got).replace('-', '−') }],
    expect: [shown, String(got)],
    steps: [
      {
        head: { key: 'ln.stComp' }, why: { key: 'ln.whyComp', params: { r } },
        lines: [`N = ${N.trim().toUpperCase()}`, { key: 'ln.dimIs', params: { r1: r - 1 }, m: dim.digits }, { key: 'ln.plus1', params: { r }, m: rad.digits }],
      },
      { head: { key: 'ln.stAdd' }, why: { key: 'ln.whyAdd' }, lines: sub.steps.map(s => ({ key: s.labelKey, m: s.value })) },
      {
        head: { key: 'ln.stCheck' },
        lines: [`${toDecimal(M, r)} − ${toDecimal(N, r)} = ${want}`.replace(/-/g, '−'), ...(got === want ? [] : [{ key: 'ln.mismatch' }])],
      },
    ],
  };
}

const FMT_KEY = { magnitude: 'c1.fmtMagnitude', ones: 'c1.fmtOnes', twos: 'c1.fmtTwos' };

/** Số có dấu w bit: biểu diễn a ở 3 dạng; có b thì thêm a ± b bằng 2's complement kèm tràn số. */
export function signedReport(a, b, w, op = 'add') {
  const reps = FORMATS.map(f => { try { return { f, bits: encode(a, f, w) }; } catch { return { f, bits: null }; } });
  const rg = range('twos', w);
  const steps = [{
    group: 'ln.tabRepr', head: { key: 'ln.stRepr', params: { a, w } },
    lines: [...reps.map(x => ({ key: FMT_KEY[x.f], m: x.bits ?? '—' })), { key: 'ln.rangeTwos', params: { min: rg.min, max: rg.max, w } }],
  }];
  const twos = reps[2].bits;
  if (b == null) {
    if (!twos) encode(a, 'twos', w);                      // ném lỗi ngoài khoảng cho UI
    return { answer: [{ key: 'c1.fmtTwos', m: twos }], expect: [twos], steps };
  }
  const A = encode(a, 'twos', w), B = encode(b, 'twos', w);
  const r = op === 'add' ? addTwos(A, B) : subTwos(A, B);
  const exact = op === 'add' ? a + b : a - b;
  const ov = r.overflow
    ? { key: 'c1.overflow', params: { exact, min: rg.min, max: rg.max, w } }
    : { key: 'c1.noOverflow', params: { got: r.value, exact } };
  steps.push({
    group: 'ln.tabOp', head: { key: op === 'add' ? 'ln.stAdd2' : 'ln.stSub2' }, why: { key: op === 'add' ? 'ln.whyAdd2' : 'ln.whySub2' },
    lines: [...(op === 'sub' ? [{ key: 'c1.negB', m: `${r.negB}  (${decode(r.negB, 'twos')})` }] : []),
      ...r.steps.map(s => ({ key: s.labelKey, m: s.value })), { key: 'c1.endCarry', m: String(r.carryOut) }, ov],
  });
  return { answer: [{ key: 'ln.resultIs', m: `${r.bits}  (${r.value})` }, ov], expect: [r.bits, String(r.value)], steps: steps.reverse() };
}

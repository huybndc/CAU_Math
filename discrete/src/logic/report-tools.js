import { fail } from '@shared/logic/app-error.js';
import { parseProp, varsOf, formatProp, classify, truthTable, evalProp, rowEnv } from './prop-logic.js';
import { euclid, pulverize, modPow, modInverse, lcm, mod } from './number-theory.js';

/* ---------------------------------------------------------------
   MÁY GIẢI của Toán rời rạc: bảng chân trị / tương đương · Euclid + Pulverizer · phương trình đồng dư ax ≡ b (mod n) ·
   lũy thừa mod. Trả { answer, steps, check } cho shared/ui/solver.js. Thuần: chỉ khoá từ điển.
   --------------------------------------------------------------- */

export const MAX_VARS = 6;
const num = x => String(x).replace('-', '−');
const par = x => (x < 0 ? `(${num(x)})` : num(x));
const firstInt = s => { const m = String(s).replace('−', '-').match(/-?\d+/); return m ? +m[0] : NaN; };

export function truthReport(fText, gText = '') {
  const f = parseProp(fText), g = gText.trim() ? parseProp(gText) : null;
  const vars = [...new Set([...varsOf(f), ...(g ? varsOf(g) : [])])].sort();
  if (vars.length > MAX_VARS) fail('t1.tooMany', { n: MAX_VARS });
  const T = truthTable(g ? [f, g] : [f], vars);
  const diff = g ? T.rows.flatMap((_, m) => (evalProp(f, rowEnv(vars, m)) !== evalProp(g, rowEnv(vars, m)) ? [m] : [])) : [];
  const answer = [{ key: `c1q.cls.${classify(f)}`, m: `F = ${formatProp(f)}` }];
  if (g) {
    answer.push({ key: `c1q.cls.${classify(g)}`, m: `G = ${formatProp(g)}` });
    answer.push(diff.length ? { key: 'dr.notEquiv', params: { rows: diff.map(i => i + 1).join(', ') } } : { key: 'c1q.yesEquiv' });
  }
  const ones = T.rows.flatMap((r, m) => (r[T.outs[0]] ? [m] : []));
  return {
    answer,
    steps: [
      { head: { key: 'dr.stTable' }, why: { key: 'dr.whyTable' }, lines: [{ key: 'dr.truth', table: { ...T, mark: diff, pick: [] } }] },
      { head: { key: 'dr.stMinterms' }, lines: [`Σm(${ones.join(', ')})`] },
    ],
    expect: [classify(f)],
  };
}

export function euclidReport(a, b) {
  if (a <= 0 || b <= 0) fail('err.needPositive');
  const E = euclid(a, b), P = pulverize(a, b);
  const g = P.gcd, l = lcm(a, b), inv = g === 1 ? [mod(P.s, b), mod(P.t, a)] : null;
  const answer = [{ key: 'dr.gcdIs', m: `${g} = ${par(P.s)}·${a} + ${par(P.t)}·${b}` }, { key: 'dr.lcmIs', m: `${a}·${b} / ${g} = ${l}` }];
  if (inv) answer.push({ key: 'dr.invIs', m: `${a}⁻¹ ≡ ${inv[0]} (mod ${b}),  ${b}⁻¹ ≡ ${inv[1]} (mod ${a})` });
  return {
    answer,
    steps: [
      { group: 'dr.tabEuclid', head: { key: 'dr.stEuclid' }, why: { key: 'dr.whyEuclid' }, lines: [...E.steps.map(s => `${s.a} = ${s.q}·${s.b} + ${s.r}`), { key: 'dr.lastNonzero', m: String(g) }] },
      {
        group: 'dr.tabPulv', head: { key: 'dr.stPulv' }, why: { key: 'dr.whyPulv' },
        lines: [{ key: 'dr.pulvTable', table: { head: ['#', 'q', 'r', 's', 't', 's·a + t·b'], vars: 0, outs: [2], pick: [P.rows.length - 2],
          rows: P.rows.map((w, i) => [i, w.q ?? '', num(w.r), num(w.s), num(w.t), num(w.s * a + w.t * b)]) } }],
      },
      { group: 'dr.tabPulv', head: { key: 'dr.stCheck' }, lines: [`${par(P.s)}·${a} + ${par(P.t)}·${b} = ${num(P.s * a + P.t * b)}`] },
    ],
    check: s => firstInt(s) === g,
  };
}

/** ax ≡ b (mod n): có nghiệm ⇔ gcd(a, n) | b; rút gọn rồi nhân với nghịch đảo (Pulverizer). */
export function congruenceReport(a, b, n) {
  if (n <= 0) fail('err.modPositive');
  const P = pulverize(mod(a, n), n), g = P.gcd;
  const head = { key: 'dr.stGcdDiv' };
  const gcdStep = { head, why: { key: 'dr.whyGcdDiv' }, lines: [`gcd(${a}, ${n}) = ${g}`, g === 0 || mod(b, g) === 0 ? { key: 'dr.divides', m: `${g} | ${b}` } : { key: 'dr.notDivides', m: `${g} ∤ ${b}` }] };
  if (mod(b, g) !== 0) return { answer: [{ key: 'dr.noSol' }], steps: [gcdStep], check: s => /∅|none|\bno\b|vo\s*nghiem/i.test(s) };
  const a1 = mod(a, n) / g, b1 = mod(b, n) / g, n1 = n / g;
  const inv = n1 === 1 ? 0 : modInverse(a1, n1);
  const x0 = mod(inv * b1, n1);
  const all = Array.from({ length: g }, (_, k) => x0 + k * n1);
  const ok = mod(a * x0 - b, n) === 0;
  return {
    answer: [{ key: 'dr.solIs', m: `x ≡ ${x0} (mod ${n1})` }, ...(g > 1 ? [{ key: 'dr.allSol', params: { g, n }, m: all.join(', ') }] : [])],
    steps: [
      gcdStep,
      { head: { key: 'dr.stReduce' }, why: { key: 'dr.whyReduce', params: { g } }, lines: [`${a1}·x ≡ ${b1} (mod ${n1})`] },
      { head: { key: 'dr.stInv' }, why: { key: 'dr.whyInv' }, lines: n1 === 1 ? [{ key: 'dr.trivialMod' }] : [`${a1}⁻¹ ≡ ${inv} (mod ${n1})`, `x ≡ ${inv}·${b1} ≡ ${x0} (mod ${n1})`] },
      { head: { key: 'dr.stCheck' }, lines: [`${a}·${x0} = ${a * x0} ≡ ${mod(a * x0, n)} ≡ ${mod(b, n)} (mod ${n})` + (ok ? '  ✓' : '')] },
    ],
    check: s => { const x = firstInt(s); return Number.isFinite(x) && mod(a * x - b, n) === 0; },
  };
}

export function powReport(a, k, n) {
  const P = modPow(a, k, n), used = new Set(P.used);
  const terms = P.used.map(i => P.squares[i].v);
  return {
    answer: [{ key: 'dr.powIs', m: `${a}^${k} ≡ ${P.value} (mod ${n})` }],
    steps: [
      { head: { key: 'dr.stBits' }, why: { key: 'dr.whyBits' }, lines: [`${k} = ${P.bits}₂ = ${P.used.map(i => 2 ** i).join(' + ') || '0'}`] },
      {
        head: { key: 'dr.stSquares' }, why: { key: 'dr.whySquares' },
        lines: [{ key: 'dr.sqTable', table: { head: ['i', '2ⁱ', `a^(2ⁱ) mod ${n}`, 'bit'], vars: 0, outs: [2], pick: [...used],
          rows: P.squares.map(({ i, v }) => [i, 2 ** i, v, used.has(i) ? 1 : 0]) } }],
      },
      { head: { key: 'dr.stProduct' }, lines: [`${terms.join(' · ') || '1'} ≡ ${P.value} (mod ${n})`] },
    ],
    check: s => firstInt(s) === P.value,
  };
}

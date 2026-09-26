import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch6 from '../src/logic/ch6-quiz.js';
import * as ch7 from '../src/logic/ch7-quiz.js';
import * as ch8 from '../src/logic/ch8-quiz.js';

/* ---------------------------------------------------------------
   KIỂM ĐỘC LẬP LỜI GIẢI D6–D8 (D41, D46). Không import number-theory.js hay graph.js.
   Số học: gcd, nghịch đảo, lũy thừa mod, φ tính bằng vét cạn / nhân lặp; từng dòng Euclid, Pulverizer, bình phương
   liên tiếp phải đúng số học. Đồ thị: đọc cạnh trên HÌNH, tự BFS, tô 2 màu, đếm thành phần, vét cạn đẳng cấu.
   --------------------------------------------------------------- */

const SEEDS = 300;
const textOf = w => (typeof w === 'string' ? w : w.m ?? '');
const nums = s => (s.replace(/−/g, '-').match(/-?\d+/g) || []).map(Number);
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const mod = (a, n) => ((a % n) + n) % n;
const fromSup = s => Number([...s].map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join(''));
function each(bank, kind, fn) {
  it(kind, () => { for (let s = 1; s <= SEEDS; s++) fn(bank.makeQuestion(kind, seededRandom(s))); });
}

/** Các dòng "a = q·b + r": đúng phép chia, nối đuôi nhau (b, r thành a, b của dòng sau), dừng ở r = 0. */
function checkEuclid(lines, a, b) {
  const rows = lines.map(textOf).filter(t => /^\d+ = \d+·\d+ \+ \d+$/.test(t)).map(nums);
  expect(rows.length).toBeGreaterThan(0);
  rows.forEach(([x, q, y, r], k) => {
    expect([x, y], `dòng ${k + 1}`).toEqual(k ? [rows[k - 1][2], rows[k - 1][3]] : [a, b]);
    expect(x === q * y + r && r >= 0 && r < y, `${x} = ${q}·${y} + ${r}`).toBe(true);
  });
  expect(rows.at(-1)[3]).toBe(0);
  return rows.at(-1)[2];
}
/** Dòng Pulverizer "r = (s)·a + (t)·b": đúng số học. */
const checkPulver = (lines, a, b) => lines.map(textOf).filter(t => /^\d+ = .*·\d+ \+ .*·\d+/.test(t)).forEach(t => {
  const [r, s, x, u, y] = nums(t);
  expect([x, y], t).toEqual([a, b]);
  expect(s * a + u * b, t).toBe(r);
});

describe('D6 gcd, Bézout', () => {
  each(ch6, 'gcd', q => {
    const { a, b } = q.textParams;
    expect(q.answer).toBe(gcd(a, b));
    expect(checkEuclid(q.work, a, b)).toBe(gcd(a, b));
    expect(textOf(q.work.at(-1))).toBe(`gcd(${a}, ${b}) = ${gcd(a, b)}`);
  });
  each(ch6, 'bezout', q => {
    const { a, b, g } = q.textParams;
    expect(g).toBe(gcd(a, b));
    expect(q.answer[0] * a + q.answer[1] * b).toBe(g);
    checkPulver(q.work, a, b);
    const [s, x, t, y, v] = nums(textOf(q.work.find(w => w.key === 's6.check')));
    expect([s, x, t, y, v]).toEqual([q.answer[0], a, q.answer[1], b, g]);
    expect(q.work.find(w => w.key === 's6.many').params).toEqual({ a2: b / g, b2: a / g });
  });
  each(ch6, 'lcm', q => {
    const { a, b } = q.textParams;
    let l = Math.max(a, b);
    while (l % a || l % b) l += Math.max(a, b);
    expect(q.answer).toBe(l);
    checkEuclid(q.work, a, b);
  });
});

describe('D7 Đồng dư, RSA', () => {
  each(ch7, 'mod', q => {
    const { a, n } = q.textParams;
    expect(q.answer).toBe(mod(a, n));
    const [x, qq, y, r] = nums(textOf(q.work[0]));
    expect([x, y, r]).toEqual([a, n, mod(a, n)]);
    expect(qq * n + r).toBe(a);
  });
  const inverse = (a, n) => [...Array(n).keys()].find(x => mod(a * x, n) === 1) ?? 'none';
  each(ch7, 'inverse', q => {
    const { a, n } = q.textParams;
    expect(q.answer).toBe(inverse(a, n));
    if (q.answer === 'none') expect(q.work[0].params.g).toBe(gcd(a, n));
    else {
      checkPulver(q.work, n, a);
      expect(textOf(q.work.find(w => w.key === 's7.checkInv'))).toBe(`${a}·${q.answer} = ${a * q.answer} ≡ 1 (mod ${n})`);
    }
  });
  const powMod = (a, k, n) => { let r = 1; for (let i = 0; i < k; i++) r = (r * a) % n; return r; };
  /** Bình phương liên tiếp: k = tổng lũy thừa 2, mỗi a^(2^i) ≡ bình phương cái trước, tích các cái dùng ≡ đáp án. */
  function checkSquares(q, a, k, n) {
    const bits = textOf(q.work.find(w => w.key === 's7.bits'));
    const [lhs, bin, sum] = bits.split(' = ');
    expect([Number(lhs), parseInt(bin.slice(1, bin.indexOf(')')), 2), sum.split(' + ').reduce((s, x) => s + Number(x), 0)], bits).toEqual([k, k, k]);
    const sq = textOf(q.work[q.work.findIndex(w => w.key === 's7.squares') + 1]).split(/,\s+/).map(t => {
      const [, base, e, v] = /^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) ≡ (\d+)$/.exec(t);
      expect(Number(base)).toBe(a);
      return [fromSup(e), Number(v)];
    });
    sq.forEach(([e, v], i) => expect([e, v], `${a}^${e}`).toEqual([2 ** i, i ? (sq[i - 1][1] ** 2) % n : a % n]));
    const used = sum.split(' + ').map(Number);
    const mult = textOf(q.work.find(w => w.key === 's7.multiply'));
    const factors = mult.split(' ≡ ')[1].split(' · ').map(Number);
    expect(factors).toEqual(used.map(p => sq.find(([e]) => e === p)[1]));
    expect(nums(mult.split(' ≡ ')[2])[0]).toBe(factors.reduce((r, x) => (r * x) % n, 1));
  }
  each(ch7, 'power', q => {
    const { a, k, n } = q.textParams;
    expect(q.answer).toBe(powMod(a, k, n));
    checkSquares(q, a, k, n);
  });
  each(ch7, 'phi', q => {
    const { n } = q.textParams;
    const phi = [...Array(n).keys()].filter(x => x > 0 && gcd(x, n) === 1).length;
    expect(q.answer).toBe(phi);
    const factors = textOf(q.work[0]).split(' = ')[1].split(' · ').map(f => f.split('^').map(Number));
    expect(factors.reduce((s, [p, e = 1]) => s * p ** e, 1)).toBe(n);
    factors.forEach(([p]) => expect([...Array(p).keys()].slice(2).every(d => p % d), `${p} nguyên tố`).toBe(true));
    const rule = textOf(q.work[1]).split(' = ');
    const val = rule[1].split(/\s*·\s*/).map(t => (t.startsWith('(') ? nums(t)[0] - nums(t)[1] : t.split('^').map(Number).reduce((p, e) => p ** e)));
    expect(val.reduce((s, x) => s * x, 1)).toBe(phi);
    expect(Number(rule[2])).toBe(phi);
  });
  each(ch7, 'rsa', q => {
    if (q.review === 'rsaD') {
      const { p, q: qq, e } = q.textParams, f = (p - 1) * (qq - 1);
      expect(mod(e * q.answer, f)).toBe(1);
      expect(q.answer).toBe(inverse(e, f));
      expect(textOf(q.work[0])).toBe(`n = ${p}·${qq} = ${p * qq},  φ = ${p - 1}·${qq - 1} = ${f}`);
      checkPulver(q.work, f, e);
    } else {
      const { n, e, m } = q.textParams;
      expect(q.answer).toBe(powMod(m, e, n));
      checkSquares(q, m, e, n);
    }
  });
});

/* ---------- D8: đồ thị — đọc cạnh trên hình ---------- */

const name = v => 'abcdefghijklmnop'[v];
const idx = s => 'abcdefghijklmnop'.indexOf(s);
const adj = g => { const A = Array.from({ length: g.n }, () => Array(g.n).fill(0)); for (const [a, b] of g.edges) { A[a][b] = 1; A[b][a] = 1; } return A; };
const degs = g => adj(g).map(r => r.reduce((s, x) => s + x, 0));
const bfsDist = (g, s) => {
  const A = adj(g), d = Array(g.n).fill(-1), queue = [s];
  d[s] = 0;
  while (queue.length) { const u = queue.shift(); A[u].forEach((x, v) => { if (x && d[v] < 0) { d[v] = d[u] + 1; queue.push(v); } }); }
  return d;
};
const comps = g => {
  const seen = new Set(), out = [];
  for (let v = 0; v < g.n; v++) if (!seen.has(v)) { const c = bfsDist(g, v).flatMap((d, u) => (d >= 0 ? [u] : [])); c.forEach(u => seen.add(u)); out.push(c); }
  return out;
};
const setText = vs => `{${vs.map(name).join(', ')}}`;
const hh = seq => { let s = [...seq].sort((a, b) => b - a); while (s.length && s[0] > 0) { const [d, ...r] = s; if (d > r.length) return false; s = r.map((x, i) => (i < d ? x - 1 : x)).sort((a, b) => b - a); if (s.some(x => x < 0)) return false; } return true; };
const perms = n => (n === 0 ? [[]] : perms(n - 1).flatMap(p => [...Array(n).keys()].map(i => [...p.slice(0, i), n - 1, ...p.slice(i)])));
const isoMap = (G, H) => {
  const B = adj(H);
  return G.n !== H.n || G.edges.length !== H.edges.length ? null : perms(G.n).find(f => G.edges.every(([a, b]) => B[f[a]][f[b]])) ?? null;
};
const triangles = g => { const A = adj(g); let t = 0; for (let a = 0; a < g.n; a++) for (let b = a + 1; b < g.n; b++) for (let c = b + 1; c < g.n; c++) t += A[a][b] * A[b][c] * A[a][c]; return t; };
const twoColorable = g => g.edges.every(([a, b]) => { const c = comps(g).find(x => x.includes(a)); const d = bfsDist(g, c[0]); return d[a] % 2 !== d[b] % 2; });
const graphOf = q => q.figure.graphs[0];

describe('D8 Đồ thị', () => {
  each(ch8, 'degree', q => {
    const seq = nums(q.textParams.seq), sum = seq.reduce((s, x) => s + x, 0);
    expect(sum % 2).toBe(0);
    expect(hh(seq), 'dãy bậc của đồ thị thật').toBe(true);
    expect(q.answer).toBe(sum / 2);
    expect(q.work.slice(1).map(textOf)).toEqual([`${seq.join(' + ')} = ${sum}`, `|E| = ${sum} / 2 = ${sum / 2}`]);
  });
  each(ch8, 'valid', q => {
    const seq = nums(q.textParams.seq), sum = seq.reduce((s, x) => s + x, 0);
    expect(q.choices[q.answer]).toBe(sum % 2 === 0 && hh(seq) ? 'c8q.yes' : 'c8q.no');
    const steps = q.work.map(textOf).filter(t => /^\(.*\)$/.test(t)).map(nums);
    steps.slice(1).forEach((s, k) => {                          // mỗi bước: bỏ đỉnh bậc lớn nhất d, trừ 1 ở d đỉnh kế
      const [d, ...r] = [...steps[k]].sort((a, b) => b - a);
      expect([...s].sort((a, b) => b - a), `bước ${k + 1}`).toEqual(r.map((x, i) => (i < d ? x - 1 : x)).sort((a, b) => b - a));
    });
  });
  each(ch8, 'special', q => {
    const g = q.textParams.g.replace(/[₀-₉]/g, c => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c));
    const [, t, m, n] = /^([KCL])(\d+)(?:,(\d+))?$/.exec(g).map((x, i) => (i > 1 && x ? Number(x) : x));
    expect(q.answer).toBe(n ? m * n : t === 'K' ? (m * (m - 1)) / 2 : t === 'C' ? m : m - 1);
  });
  each(ch8, 'walks', q => {
    const g = graphOf(q), A = adj(g), mul = (X, Y) => X.map(r => Y[0].map((_, j) => r.reduce((s, x, k) => s + x * Y[k][j], 0)));
    const P = q.textParams.k === 2 ? mul(A, A) : mul(mul(A, A), A);
    expect(q.answer).toBe(P[idx(q.textParams.u)][idx(q.textParams.v)]);
    const mats = q.work.map(textOf).filter(t => /^A/.test(t)).map(t => t.slice(t.lastIndexOf('[') + 1, -1).split('; ').map(nums));
    expect(mats[0]).toEqual(A);
    expect(mats[1]).toEqual(mul(A, A));
    if (q.textParams.k === 3) expect(mats[2]).toEqual(P);
  });
  each(ch8, 'dist', q => {
    const g = graphOf(q), s = idx(q.textParams.s), t = idx(q.textParams.t), d = bfsDist(g, s), A = adj(g);
    expect(q.answer).toBe(d[t]);
    q.work.map(textOf).filter(x => /^\d+: /.test(x)).forEach(x => {
      const [lv, vs] = x.split(': ');
      expect(vs.split(', ').map(idx).sort(), `tầng ${lv}`).toEqual(d.flatMap((dv, v) => (dv === Number(lv) ? [v] : [])).sort());
    });
    const path = textOf(q.work.at(-1)).split(' – ').map(idx);
    expect([path[0], path.at(-1), path.length - 1]).toEqual([s, t, d[t]]);
    path.slice(1).forEach((v, k) => expect(A[path[k]][v], `${name(path[k])}–${name(v)} phải là cạnh`).toBe(1));
  });
  each(ch8, 'comp', q => {
    const cs = comps(graphOf(q));
    expect(q.answer).toBe(cs.length);
    expect(q.work.map(textOf).filter(t => /^\{/.test(t)).sort()).toEqual(cs.map(setText).sort());
  });
  each(ch8, 'bipartite', q => {
    const g = graphOf(q), A = adj(g), ok = twoColorable(g);
    expect(q.choices[q.answer]).toBe(ok ? 'c8q.yes' : 'c8q.no');
    if (ok) {
      const [X, Y] = q.work.map(textOf).filter(t => /^[XY] = /.test(t)).map(t => t.slice(5, -1).split(', ').map(idx));
      expect([...X, ...Y].sort((a, b) => a - b)).toEqual([...Array(g.n).keys()]);
      g.edges.forEach(([a, b]) => expect(X.includes(a) !== X.includes(b), `cạnh ${name(a)}${name(b)} nối hai phía`).toBe(true));
    } else {
      const cyc = textOf(q.work.at(-1)).split(' – ').map(idx), len = q.work.at(-1).params.len;
      expect([cyc[0], cyc.length - 1, len % 2]).toEqual([cyc.at(-1), len, 1]);
      expect(new Set(cyc.slice(0, -1)).size, 'chu trình không lặp đỉnh').toBe(len);
      cyc.slice(1).forEach((v, k) => expect(A[cyc[k]][v]).toBe(1));
    }
  });
  each(ch8, 'euler', q => {
    const g = graphOf(q), odd = degs(g).flatMap((d, v) => (d % 2 ? [v] : []));
    expect(comps(g)).toHaveLength(1);
    expect(q.choices[q.answer]).toBe(`c8q.eu.${odd.length === 0 ? 'circuit' : odd.length === 2 ? 'path' : 'none'}`);
    expect(textOf(q.work[1])).toBe(degs(g).map((d, v) => `deg ${name(v)} = ${d}`).join(',  '));
    expect(q.work[2].params.n).toBe(odd.length);
  });
  each(ch8, 'tree', q => {
    const p = q.textParams;
    if (q.textKey === 'c8q.qLeaves') {
      const g = graphOf(q);
      expect([g.edges.length, comps(g).length], 'hình là một cây').toEqual([g.n - 1, 1]);
      expect(q.answer).toBe(degs(g).filter(d => d === 1).length);
    } else expect(q.answer).toBe(q.textKey === 'c8q.qForest' ? p.n - p.c : p.m - (p.n - 1));
  });
  each(ch8, 'iso', q => {
    const [G, H] = q.figure.graphs, f = isoMap(G, H);
    expect(q.choices[q.answer]).toBe(f ? 'c8q.yes' : 'c8q.no');
    const sortedDeg = g => [...degs(g)].sort((a, b) => b - a).join(', ');
    expect(q.work.map(textOf).filter(t => /^[GH]: /.test(t))).toEqual([`G: ${sortedDeg(G)}`, `H: ${sortedDeg(H)}`]);
    const last = q.work.at(-1);
    if (f) {
      // song ánh in trong lời giải: mỗi cạnh của G sang đúng một cạnh của H
      const B = adj(H), map = textOf(q.work.at(-2)).split(',  ').map(s => s.split(' → '));
      expect(map).toHaveLength(G.edges.length);
      for (const [ge, he] of map) expect(B[H.labels.indexOf(he[0])][H.labels.indexOf(he[1])], `${ge} → ${he}`).toBe(1);
    } else {
      // không đẳng cấu: lời giải phải chỉ ra một bất biến khác nhau, người học tự kiểm được
      const inv = { vertices: g => g.n, edges: g => g.edges.length, degrees: sortedDeg, components: g => comps(g).length, triangles, bipartite: twoColorable };
      const id = last.key.replace('s8.inv.', '');
      expect(inv[id], `lời giải "${last.key}" phải nêu bất biến cụ thể`).toBeTruthy();
      expect(inv[id](G)).not.toEqual(inv[id](H));
    }
  });
});

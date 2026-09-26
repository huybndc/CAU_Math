import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch2 from '../src/logic/ch2-quiz.js';
import * as ch3 from '../src/logic/ch3-quiz.js';
import * as ch4 from '../src/logic/ch4-quiz.js';
import * as ch5 from '../src/logic/ch5-quiz.js';

/* ---------------------------------------------------------------
   KIỂM ĐỘC LẬP LỜI GIẢI D2–D5 (D41, D46). Không import gì từ src/logic ngoài hàm sinh đề.
   D2: tự đọc công thức lượng từ, thử trên MỌI diễn giải của miền 2 phần tử + diễn giải ngẫu nhiên miền 3 phần tử.
   D3: tự làm phép tập hợp / đếm / xét hàm từ chữ của đề. D4: tự đọc chuỗi tổng "1 + 3 + … + (2n − 1)" và các
   công thức đóng, tính bằng cộng dồn. D5: BFS trạng thái bình nước và vét cạn tem viết riêng.
   --------------------------------------------------------------- */

const SEEDS = 300;
const textOf = w => (typeof w === 'string' ? w : w.m ?? '');
const nums = s => (s.match(/-?\d+/g) || []).map(Number);
function each(bank, kind, fn) {
  it(kind, () => { for (let s = 1; s <= SEEDS; s++) fn(bank.makeQuestion(kind, seededRandom(s))); });
}

/* ---------- D2: công thức lượng từ ---------- */

/** "∀x ∃y (R(x, y) ∧ Q(y))" → hàm (diễn giải, gán biến) → bool. ¬ > ∧ > ∨ > →; lượng từ ôm một khối đứng sau. */
function parseQ(text) {
  const toks = text.match(/[∀∃][a-z]|[PQR]\([a-z](?:, [a-z])?\)|[¬∧∨→()]/g);
  let i = 0;
  const impl = () => { const a = or(); if (toks[i] === '→') { i++; const b = impl(); return (I, e) => !a(I, e) || b(I, e); } return a; };
  const or = () => { let a = and(); while (toks[i] === '∨') { i++; const l = a, r = and(); a = (I, e) => l(I, e) || r(I, e); } return a; };
  const and = () => { let a = unary(); while (toks[i] === '∧') { i++; const l = a, r = unary(); a = (I, e) => l(I, e) && r(I, e); } return a; };
  const unary = () => {
    const t = toks[i++];
    if (t === '¬') { const a = unary(); return (I, e) => !a(I, e); }
    if (t === '(') { const a = impl(); if (toks[i++] !== ')') throw new Error(text); return a; }
    if (/^[∀∃]/.test(t)) {
      const v = t[1], body = unary(), every = t[0] === '∀';
      return (I, e) => I.D[every ? 'every' : 'some'](d => body(I, { ...e, [v]: d }));
    }
    const [p, ...args] = t.match(/[PQRa-z]/g);
    return (I, e) => I[p](...args.map(a => e[a]));
  };
  const f = impl();
  if (i !== toks.length) throw new Error('thừa ký hiệu: ' + text);
  return f;
}
/** Diễn giải: mọi cách chọn P, Q ⊆ D, R ⊆ D² với D = {0, 1}; thêm 300 diễn giải ngẫu nhiên với D = {0, 1, 2}. */
const INTERPS = (() => {
  const out = [];
  for (let m = 0; m < 256; m++) out.push({ D: [0, 1], P: x => !!(m >> x & 1), Q: x => !!(m >> (2 + x) & 1), R: (x, y) => !!(m >> (4 + 2 * x + y) & 1) });
  const rnd = seededRandom(42);
  for (let k = 0; k < 300; k++) {
    const p = [0, 1, 2].map(() => rnd() < 0.5), q = [0, 1, 2].map(() => rnd() < 0.5), r = [...Array(9)].map(() => rnd() < 0.5);
    out.push({ D: [0, 1, 2], P: x => p[x], Q: x => q[x], R: (x, y) => r[3 * x + y] });
  }
  return out;
})();
const sameQ = (f, g) => INTERPS.every(I => f(I, {}) === g(I, {}));

/** Quan hệ hai biến viết như trong đề ("x = y²", "x · y ≥ x") → hàm; chỉ nhận các ký hiệu toán này. */
function rel(s) {
  expect(s).toMatch(/^[xy0-9+·<>=≤≥≠² ]+$/);
  const js = s.replace(/=/g, '===').replace(/·/g, '*').replace(/²/g, '**2').replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/≠/g, '!==');
  return new Function('x', 'y', `return ${js};`);
}

describe('D2 Lượng từ', () => {
  each(ch2, 'truth', q => {
    const [, qo, vo, qi, vi, body] = /^([∀∃])([xy]) ([∀∃])([xy]) \((.+)\)$/.exec(q.textParams.f);
    const D = nums(q.textParams.d), R = rel(body);
    const holds = (o, i) => (vo === 'x' ? R(o, i) : R(i, o));
    const inner = o => D[qi === '∀' ? 'every' : 'some'](i => holds(o, i));
    const value = D[qo === '∀' ? 'every' : 'some'](inner);
    expect(q.choices[q.answer]).toBe(value ? 'c2q.true' : 'c2q.false');
    // từng dòng: phần tử chứng minh / phản ví dụ đúng là như vậy
    for (const w of q.work) {
      const o = w.params?.o ? Number(w.params.o.split(' = ')[1]) : typeof w === 'string' ? Number(w.split(':')[0].split(' = ')[1]) : null;
      if (o === null || Number.isNaN(o)) continue;
      if (w.key === 's2.counter') expect(holds(o, Number(w.params.c.split(' = ')[1])), JSON.stringify(w)).toBe(false);
      else if (w.key === 's2.noWitness') expect(D.some(i => holds(o, i))).toBe(false);
      else if (/✓$/.test(w)) {
        const m = / = (-?\d+) ✓$/.exec(w.split(':')[1] ?? '');
        if (m) expect(holds(o, Number(m[1])), w).toBe(true); else expect(D.every(i => holds(o, i)), w).toBe(true);
      }
    }
  });

  each(ch2, 'negate', q => {
    const f = parseQ(q.textParams.f), neg = (I, e) => !f(I, e);
    q.choices.forEach((c, k) => expect(sameQ(parseQ(c), neg), `${c} ${k === q.answer ? 'phải' : 'không được'} tương đương ¬(${q.textParams.f})`).toBe(k === q.answer));
    expect(textOf(q.work.at(-1))).toBe(q.choices[q.answer]);
  });
});

/* ---------- D3: tập hợp, hàm ---------- */

const setOf = s => nums(s);
describe('D3 Tập hợp & hàm', () => {
  each(ch3, 'setop', q => {
    const A = setOf(q.textParams.A), B = setOf(q.textParams.B), U = setOf(q.textParams.U);
    const inA = x => A.includes(x), inB = x => B.includes(x);
    const test = { 'A ∪ B': x => inA(x) || inB(x), 'A ∩ B': x => inA(x) && inB(x), 'A − B': x => inA(x) && !inB(x), 'A ⊕ B': x => inA(x) !== inB(x), 'Aᶜ': x => !inA(x) }[q.textParams.op];
    expect(q.answer).toEqual(U.filter(test));
    expect(textOf(q.work.at(-1))).toBe(`${q.textParams.op} = {${q.answer.join(', ')}}`);
  });
  each(ch3, 'count', q => {
    const p = q.textParams;
    const want = q.textKey === 'c3q.qPower' ? 2 ** setOf(p.A).length : q.textKey === 'c3q.qProduct' ? p.m * p.n : p.a + p.b - p.c;
    expect(q.answer).toBe(want);
    expect(nums(textOf(q.work.at(-1))).at(-1)).toBe(want);
    if (q.textKey === 'c3q.qIncl') expect(p.c <= Math.min(p.a, p.b), '|A ∩ B| không vượt |A|, |B|').toBe(true);
  });
  each(ch3, 'func', q => {
    const A = nums(q.textParams.A), B = q.textParams.B.slice(1, -1).split(', ');
    const arrows = q.textParams.f.split(',  ').map(s => s.split(' ↦ ')).map(([x, y]) => [Number(x), y]);
    const isFunc = A.every(x => arrows.filter(([p]) => p === x).length === 1);
    const imgs = arrows.map(([, y]) => y);
    const inj = new Set(imgs).size === imgs.length, sur = B.every(y => imgs.includes(y));
    const want = !isFunc ? 'notfunc' : inj && sur ? 'bij' : inj ? 'inj' : sur ? 'sur' : 'neither';
    expect(q.choices[q.answer]).toBe('c3q.fn.' + want);
    for (const w of q.work) {
      if (w.key === 's3.notInj') expect(imgs.filter(y => y === w.params.y).length).toBeGreaterThan(1);
      if (w.key === 's3.notSur') expect(imgs).not.toContain(w.params.y);
    }
  });
});

/* ---------- D4: quy nạp ---------- */

/** Biểu thức một biến (n hoặc k): số, biến, ( ), + − · /, nhân ngầm "2n", "n(n + 1)", mũ viết nhỏ "2ⁿ⁻¹", "(k + 1)²". */
function poly(text, v) {
  const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', ⁿ: 'n', ᵏ: 'k', '⁺': '+', '⁻': '-' };
  const s = text.replace(/−/g, '-').replace(/\s+/g, '');
  let i = 0;
  const expr = () => { let f = term(); while (s[i] === '+' || s[i] === '-') { const op = s[i++], l = f, r = term(); f = x => (op === '+' ? l(x) + r(x) : l(x) - r(x)); } return f; };
  const term = () => {
    let f = factor();
    for (;;) {
      if (s[i] === '·' || s[i] === '/') { const op = s[i++], l = f, r = factor(); f = x => (op === '·' ? l(x) * r(x) : l(x) / r(x)); }
      else if (i < s.length && /[\d(a-z]/.test(s[i])) { const l = f, r = factor(); f = x => l(x) * r(x); }
      else return f;
    }
  };
  const factor = () => {
    const b = atom();
    let sup = '';
    while (SUP[s[i]]) sup += SUP[s[i++]];
    if (!sup) return b;
    const e = poly(sup, v);
    return x => b(x) ** e(x);
  };
  const atom = () => {
    if (s[i] === '(') { i++; const f = expr(); if (s[i++] !== ')') throw new Error(text); return f; }
    if (s[i] === v) { i++; return x => x; }
    const m = /^\d+/.exec(s.slice(i));
    if (!m) throw new Error(`không đọc được "${text}" tại ${i}`);
    i += m[0].length;
    return () => Number(m[0]);
  };
  const f = expr();
  if (i !== s.length) throw new Error(`thừa ký hiệu trong "${text}"`);
  return f;
}
/** "1 + 3 + 5 + … + (2n − 1)" → số hạng thứ i (đọc từ số hạng cuối), kiểm các số hạng đầu viết đúng. */
function series(text, v = 'n') {
  const [head, last] = text.split(' + … + ');
  const term = poly(last, v);
  head.split(' + ').forEach((t, k) => expect(poly(t, v)(0), `số hạng ${k + 1} của ${text}`).toBe(term(k + 1)));
  return { term, S: n => Array.from({ length: n }, (_, k) => term(k + 1)).reduce((a, b) => a + b, 0) };
}

describe('D4 Quy nạp', () => {
  each(ch4, 'sum', q => {
    const { S } = series(q.textParams.s);
    expect(q.answer).toBe(S(q.textParams.n));
    const closed = poly(textOf(q.work[0]).split(' = ')[1], 'n');
    for (let n = 1; n <= 12; n++) expect(closed(n), `công thức đóng tại n = ${n}`).toBe(S(n));
  });
  each(ch4, 'formula', q => {
    const { S } = series(q.textParams.s);
    const ok = c => [...Array(12).keys()].every(k => Math.abs(poly(c, 'n')(k + 1) - S(k + 1)) < 1e-9);
    q.choices.forEach((c, k) => expect(ok(c), c).toBe(k === q.answer));
    for (const w of q.work.filter(x => x.key === 's4.fails')) {
      const f = poly(w.params.f, 'n'), first = [...Array(12).keys()].map(k => k + 1).find(n => f(n) !== S(n));
      expect(w.params.n, `${w.params.f} lệch đầu tiên tại`).toBe(first);
    }
    expect(textOf(q.work.find(w => w.key === 's4.values'))).toBe([1, 2, 3, 4, 5].map(S).join(', '));
  });
  each(ch4, 'step', q => {
    const { S, term } = series(q.textParams.s);
    const ks = [...Array(10).keys()].map(k => k + 1);
    // bước đúng: vế trái = S(k) + số hạng thứ k+1, vế phải = S(k+1), và đẳng thức đúng với mọi k
    const right = c => {
      const [l, r] = c.split(' = ').map(x => poly(x, 'k'));
      return ks.every(k => Math.abs(l(k) - r(k)) < 1e-9 && Math.abs(r(k) - S(k + 1)) < 1e-9 && Math.abs(l(k) - S(k) - term(k + 1)) < 1e-9);
    };
    q.choices.forEach((c, k) => expect(right(c), c).toBe(k === q.answer));
  });
});

/* ---------- D5: bất biến ---------- */

/** BFS trạng thái (x, y): số bước ít nhất tới khi một bình có đúng c lít, hoặc −1. */
function pourDist(a, b, c) {
  const seen = new Map([['0,0', 0]]), queue = [[0, 0]];
  while (queue.length) {
    const [x, y] = queue.shift(), d = seen.get(`${x},${y}`);
    if (x === c || y === c) return d;
    const xy = Math.min(x, b - y), yx = Math.min(y, a - x);
    for (const [nx, ny] of [[a, y], [x, b], [0, y], [x, 0], [x - xy, y + xy], [x + yx, y - yx]]) {
      if (!seen.has(`${nx},${ny}`)) { seen.set(`${nx},${ny}`, d + 1); queue.push([nx, ny]); }
    }
  }
  return -1;
}
/** Một bước đổ nước hợp lệ (đổ đầy, đổ hết, rót sang tới khi bình nhận đầy hoặc bình rót cạn). */
const move = (a, b, [x, y], [nx, ny]) => {
  const xy = Math.min(x, b - y), yx = Math.min(y, a - x);
  return [[a, y], [x, b], [0, y], [x, 0], [x - xy, y + xy], [x + yx, y - yx]].some(([p, q]) => p === nx && q === ny);
};
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

describe('D5 Bất biến & quy nạp mạnh', () => {
  each(ch5, 'jugs', q => {
    const { a, b, c } = q.textParams, d = pourDist(a, b, c);
    expect(q.choices[q.answer]).toBe(d >= 0 ? 'c5q.can' : 'c5q.cannot');
    expect(q.work[0].params.g).toBe(gcd(a, b));
    const last = q.work.at(-1);
    if (d >= 0) {
      const states = textOf(last).split(' → ').map(nums);
      expect(states[0]).toEqual([0, 0]);
      states.slice(1).forEach((s, k) => expect(move(a, b, states[k], s), `${states[k]} → ${s}`).toBe(true));
      expect(states.at(-1).includes(c)).toBe(true);
      expect([last.params.n, states.length - 1], 'chuỗi đổ ngắn nhất').toEqual([d, d]);
    } else expect(last.key).toBe(c > b ? 's5.tooBig' : 's5.notMultiple');
    if (last.key === 's5.notMultiple') expect(c % gcd(a, b)).not.toBe(0);
  });
  each(ch5, 'stamps', q => {
    const { a, b } = q.textParams;
    const pay = n => [...Array(Math.floor(n / a) + 1).keys()].some(i => (n - i * a) % b === 0);
    const bad = [...Array(a * b).keys()].filter(n => n > 0 && !pay(n));
    if (q.textKey === 'c5q.qLargest') {
      expect(q.answer).toBe(bad.at(-1));
      expect(textOf(q.work[0])).toBe(bad.join(', '));
    } else {
      const { n } = q.textParams;
      expect(q.choices[q.answer]).toBe(pay(n) ? 'c5q.can' : 'c5q.cannot');
      if (pay(n)) {
        const [lhs, rhs] = textOf(q.work[0]).split(' = ');
        const [i, x, j, y] = nums(rhs);
        expect([Number(lhs), x, y, i >= 0 && j >= 0]).toEqual([n, a, b, true]);
        expect(i * a + j * b).toBe(n);
      }
    }
  });
});

describe('bộ đọc D2/D4 tự kiểm', () => {
  it('khớp sách', () => {
    expect(sameQ(parseQ('¬∀x (P(x) → Q(x))'), parseQ('∃x (P(x) ∧ ¬Q(x))'))).toBe(true);
    expect(sameQ(parseQ('∀x ∃y R(x, y)'), parseQ('∃y ∀x R(x, y)'))).toBe(false);
    expect(rel('x = y²')(4, -2)).toBe(true);
    expect(rel('x · y ≥ x')(2, 0)).toBe(false);
    expect(poly('(n − 1)2ⁿ⁺¹ + 2', 'n')(3)).toBe(34);
    expect(poly('(n(n + 1)/2)²', 'n')(3)).toBe(36);
    expect(series('1·2 + 2·2² + … + n·2ⁿ').S(3)).toBe(34);
  });
});

import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch1 from '../src/logic/ch1-quiz.js';
import * as ch2 from '../src/logic/ch2-quiz.js';
import * as ch3 from '../src/logic/ch3-quiz.js';

/* ---------------------------------------------------------------
   KIỂM ĐỘC LẬP LỜI GIẢI LinAlg (D41 mở rộng — người học, 2026-09-25: lời giải phải luôn đúng, kiểm kĩ trước khi ra đề).
   Mọi thứ dưới đây viết riêng, không import gì từ src/logic ngoài hai hàm sinh/chấm đề:
   - đọc CHỮ người học thấy (vector trong đề, hệ phương trình trên hình, ma trận trên hình) rồi tự tính lại đáp án;
   - dò TỪNG BƯỚC biến đổi hàng trong lời giải: làm lại phép "R2 ← R2 − 2R1" trên ma trận in ở bước trước,
     phải ra đúng ma trận in ở bước này; ℓᵢⱼ = a/b phải đúng là hai số trên ma trận;
   - mọi dấu "=" trong một dòng lời giải mà hai vế đều là số/vector/ma trận thì hai vế phải bằng nhau.
   --------------------------------------------------------------- */

const SEEDS = 300;
const TOL = 1e-9;

/* ---------- bộ tính biểu thức số / vector / ma trận ---------- */

/** "[1 -3 | 4; 0 1 | 2]" → [[1, -3, 4], [0, 1, 2]] (bỏ vạch |, mỗi ô là một số hoặc phân số). */
function matLit(s) {
  return s.slice(1, -1).split(';').map(r => r.trim().split(/[\s|]+/).filter(Boolean).map(x => evaluate(x)));
}

/** Tính một đoạn chữ: số, + − · / ² ^ √, ngoặc, bộ "(a, b)" = vector, "[..]" = ma trận. Có chữ cái ⇒ ném lỗi. */
function evaluate(text) {
  const mats = [];
  const s = text.replace(/\[[^\]]*\]/g, m => `M${mats.push(m) - 1}#`)
    .replace(/−/g, '-').replace(/[·×]/g, '*').replace(/²/g, '^2').replace(/\s+/g, '');
  let i = 0;
  const add = (a, b, k) => (Array.isArray(a) ? a.map((x, j) => add(x, b[j], k)) : a + k * b);
  const scale = (a, k) => (Array.isArray(a) ? a.map(x => scale(x, k)) : a * k);
  const shape = a => (Array.isArray(a) ? [a.length, ...shape(a[0])] : []);
  const expr = () => {
    let v = term();
    while (s[i] === '+' || s[i] === '-') {
      const k = s[i++] === '+' ? 1 : -1, w = term();
      if (String(shape(v)) !== String(shape(w))) throw new Error('cộng khác cỡ');
      v = add(v, w, k);
    }
    return v;
  };
  const term = () => {
    let v = unary();
    for (;;) {
      if (s[i] === '*') { i++; const w = unary(); v = Array.isArray(v) ? (Array.isArray(w) ? bad() : scale(v, w)) : scale(w, v); }
      else if (s[i] === '/') { i++; const w = unary(); if (Array.isArray(w)) bad(); v = scale(v, 1 / w); }
      else if (s[i] === '√') { v = scale(unary(), v); }                          // 2√3
      else return v;
    }
  };
  const unary = () => (s[i] === '-' ? (i++, scale(unary(), -1)) : power());
  const power = () => { const v = atom(); if (s[i] === '^') { i++; return v ** unary(); } return v; };
  const atom = () => {
    const c = s[i];
    if (c === '√') { i++; return Math.sqrt(atom()); }
    if (c === 'M') { const j = s.indexOf('#', i); const m = matLit(mats[+s.slice(i + 1, j)]); i = j + 1; return m; }
    if (c === '(') {
      i++;
      const parts = [expr()];
      while (s[i] === ',') { i++; parts.push(expr()); }
      if (s[i++] !== ')') bad();
      return parts.length > 1 ? parts : parts[0];
    }
    const m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (!m) bad();
    i += m[0].length;
    return Number(m[0]);
  };
  const bad = () => { throw new Error(`không tính được "${text}"`); };
  const v = expr();
  if (i !== s.length) bad();
  return v;
}

const flat = a => (Array.isArray(a) ? a.flatMap(flat) : [a]);
const close = (a, b, tol = TOL) => {
  const x = flat(a), y = flat(b);
  return x.length === y.length && x.every((v, k) => Math.abs(v - y[k]) <= tol);
};
const expectClose = (got, want, msg, tol) => expect(close(got, want, tol), `${msg}: ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`).toBe(true);
const vec = s => evaluate(s);
const vecsIn = s => [...s.matchAll(/\([^)]*\)/g)].map(m => vec(m[0]));
const textOf = w => (typeof w === 'string' ? w : w.m ?? '');

/** Mọi dấu = (≈) trong dòng: các vế tính được phải bằng nhau. Trả số lần so sánh. */
function checkEquals(line) {
  const approx = line.includes('≈');
  const vals = line.split(/=|≈/).flatMap(seg => { try { return [evaluate(seg.trim())]; } catch { return []; } });
  vals.slice(1).forEach(v => expectClose(v, vals[0], `dòng "${line}"`, approx ? 1e-3 : 1e-6));
  return Math.max(0, vals.length - 1);
}

/* ---------- đại số tuyến tính tự viết ---------- */

const mul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
const mv = (A, x) => A.map(r => r.reduce((s, a, j) => s + a * x[j], 0));
const dot = (a, b) => a.reduce((s, x, k) => s + x * b[k], 0);

/** Khử Gauss–Jordan có chọn trụ lớn nhất: { R (dạng bậc thang rút gọn), pivots (cột trụ) }. */
function rref(M0) {
  const M = M0.map(r => r.slice());
  const pivots = [];
  let row = 0;
  for (let c = 0; c < M[0].length && row < M.length; c++) {
    let p = row;
    for (let r = row + 1; r < M.length; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-9) continue;
    [M[row], M[p]] = [M[p], M[row]];
    const d = M[row][c];
    M[row] = M[row].map(x => x / d);
    for (let r = 0; r < M.length; r++) if (r !== row) { const k = M[r][c]; M[r] = M[r].map((x, j) => x - k * M[row][j]); }
    pivots.push(c);
    row++;
  }
  return { R: M, pivots };
}
const rank = M => rref(M).pivots.length;
const cols = vs => vs[0].map((_, i) => vs.map(v => v[i]));

/** Hệ trên hình "2x - z = 6" (biến x, y, z) → { A, b }; vế trái phải đọc hết, không sót ký hiệu. */
function systemOf(lines, n) {
  const vars = ['x', 'y', 'z'].slice(0, n);
  const rows = lines.map(l => {
    const [lhs, rhs] = l.split('=');
    const coef = {};
    const left = lhs.replace(/\s+/g, '');
    const terms = [...left.matchAll(/([+-]?)([\d./]*)([xyz])/g)];
    expect(terms.map(t => t[0]).join(''), `đọc hết vế trái "${l}"`).toBe(left === '0' ? '' : left);
    for (const [, sg, k, v] of terms) coef[v] = (coef[v] ?? 0) + (sg === '-' ? -1 : 1) * (k ? evaluate(k) : 1);
    return { coef, b: evaluate(rhs.trim()) };
  });
  return { A: rows.map(r => vars.map(v => r.coef[v] ?? 0)), b: rows.map(r => r.b) };
}

/* ---------- dò chuỗi biến đổi hàng trong lời giải ---------- */

const num = t => (t === '' ? 1 : t === '-' ? -1 : evaluate(t.replace(/^\((.*)\)$/, '$1')));

/** "R2 ← R2 − (-2)·R1" → hàm biến ma trận; ném lỗi nếu không nhận ra phép. */
function rowOp(text) {
  const s = text.replace(/\s+/g, '').replace(/−/g, '-').replace(/·/g, '').replace('<->', '↔').replace('<-', '←');
  let m;
  if ((m = /^R(\d)↔R(\d)$/.exec(s))) return M => M.map((r, i) => (i === m[1] - 1 ? M[m[2] - 1] : i === m[2] - 1 ? M[m[1] - 1] : r));
  if ((m = /^R(\d)←R(\d)([+-])(.*)R(\d)$/.exec(s)) && m[1] === m[2]) {
    const k = (m[3] === '-' ? -1 : 1) * num(m[4]), i = m[1] - 1, j = m[5] - 1;
    return M => M.map((r, t) => (t === i ? r.map((x, c) => x + k * M[j][c]) : r));
  }
  if ((m = /^R(\d)←R(\d)\/(.+)$/.exec(s)) && m[1] === m[2]) { const d = num(m[3]); return M => M.map((r, t) => (t === m[1] - 1 ? r.map(x => x / d) : r)); }
  if ((m = /^R(\d)←(.*)R(\d)$/.exec(s)) && m[1] === m[3]) { const k = num(m[2]); return M => M.map((r, t) => (t === m[1] - 1 ? r.map(x => x * k) : r)); }
  throw new Error(`không đọc được phép biến đổi "${text}"`);
}

const STEP = /^(?:ℓ(\d)(\d) = (.+?) = (\S+):\s+)?(R\d.*?):?\s+(\[[^\]]*\])$/;

/**
 * Dò mọi dòng biến đổi: ma trận đầu tiên (dòng chỉ có "[..]") phải bằng `start`; mỗi bước làm lại phép trên ma trận trước.
 * Trả { steps, last } — số bước đã dò và ma trận cuối.
 */
function checkChain(work, start) {
  let prev = null, steps = 0;
  for (const w of work) {
    const t = textOf(w).trim();
    if (/^\[[^\]]*\]$/.test(t)) {
      expectClose(matLit(t), start, 'ma trận mở đầu lời giải khác đề');
      prev = matLit(t);
      continue;
    }
    const m = STEP.exec(t);
    if (!m) continue;
    prev ??= start;                                             // lời giải bắt đầu ngay bằng phép (ma trận đầu đã in ở dòng A = …)
    if (m[1]) {                                                 // ℓij = a/b = l  ⇒  a, b đúng là hai số trên ma trận, l = a/b
      const i = m[1] - 1, j = m[2] - 1;
      expectClose(evaluate(m[3]), prev[i][j] / prev[j][j], `${t}: ℓ`);
      expectClose(evaluate(m[3]), evaluate(m[4]), `${t}: ℓ`);
      const [a, b] = m[3].split('/');
      expectClose(evaluate(a), prev[i][j], `${t}: tử số`);
      expectClose(evaluate(b), prev[j][j], `${t}: mẫu số (trụ)`);
    }
    const next = matLit(m[6]);
    expectClose(next, rowOp(m[5])(prev), `bước "${t}"`, 1e-6);
    prev = next;
    steps++;
  }
  return { steps, last: prev };
}

/* ---------- chạy ---------- */

const bank = { ch1, ch2, ch3 };
const counts = {};
function each(ch, kind, fn) {
  it(`${ch} ${kind}`, () => {
    counts[kind] = { eq: 0, steps: 0 };
    for (let s = 1; s <= SEEDS; s++) {
      const q = bank[ch].makeQuestion(kind, seededRandom(s));
      for (const w of q.work) counts[kind].eq += checkEquals(textOf(w));
      if (q.format !== 'choice') counts[kind].eq += checkEquals(q.answerText) || (expectClose(evaluate(q.answerText), q.answer, 'chữ đáp án'), 1);
      fn(q, counts[kind]);
    }
  });
}
const mats = q => Object.fromEntries(q.figure.items);
const choice = q => q.choices[q.answer];

describe('Ch1 Vector: bộ tính độc lập xác nhận đáp án và mọi dấu "=" trong lời giải', () => {
  each('ch1', 'combine', q => {
    const [, c, sg, d] = /^(-?[\d./]*)v ([+-]) ([\d./]*)w$/.exec(q.textParams.e);
    const k1 = num(c === '-' ? '-' : c), k2 = (sg === '-' ? -1 : 1) * num(d);
    expectClose(q.answer, vec(q.textParams.v).map((x, i) => k1 * x + k2 * vec(q.textParams.w)[i]), q.textParams.e);
  });
  each('ch1', 'dot', q => expectClose(q.answer, dot(vec(q.textParams.v), vec(q.textParams.w)), 'v·w'));
  each('ch1', 'length', q => expectClose(q.answer, Math.hypot(...vec(q.textParams.v)), '‖v‖'));
  each('ch1', 'unit', q => {
    const v = vec(q.textParams.v), n = Math.hypot(...v);
    expectClose(q.answer, v.map(x => x / n), 'v/‖v‖');
  });
  each('ch1', 'angle', q => {
    const v = vec(q.textParams.v), w = vec(q.textParams.w);
    expectClose(q.answer, (Math.acos(dot(v, w) / (Math.hypot(...v) * Math.hypot(...w))) * 180) / Math.PI, 'góc', 1e-6);
  });
  each('ch1', 'perp', q => {
    const parts = q.textParams.v.slice(1, -1).split(',').map(x => x.trim());
    const k = parts.indexOf('c'), w = vec(q.textParams.w);
    const v = parts.map((x, i) => (i === k ? q.answer : evaluate(x)));
    expect(k).toBeGreaterThanOrEqual(0);
    expectClose(dot(v, w), 0, `v·w với c = ${q.answer}`);
  });
  each('ch1', 'matvec', q => { const { A, x } = mats(q); expectClose(q.answer, mv(A, x), 'Ax'); });
  each('ch1', 'coefs', (q, n) => {
    const v = vec(q.textParams.v), w = vec(q.textParams.w), b = vec(q.textParams.b);
    const A = cols([v, w]);
    expect(Math.abs(A[0][0] * A[1][1] - A[0][1] * A[1][0])).toBeGreaterThan(0);
    expectClose(mv(A, q.answer), b, 'cv + dw = b');
    const { steps, last } = checkChain(q.work, A.map((r, i) => [...r, b[i]]));
    expectClose(last.map(r => r.at(-1)), q.answer, 'cột cuối sau khử = (c, d)');
    n.steps += steps;
  });
});

describe('Ch2 Ax = b: đáp án tính lại từ hình, và làm lại từng bước khử', () => {
  for (const [kind, n] of [['solve2', 2], ['solve3', 3]]) {
    each('ch2', kind, (q, c) => {
      const { A, b } = systemOf(q.figure.lines, n);
      expect(rank(A)).toBe(n);                                   // đúng là nghiệm duy nhất
      expectClose(mv(A, q.answer), b, 'Ax = b');
      const { steps, last } = checkChain(q.work, A.map((r, i) => [...r, b[i]]));
      expectClose(last.map(r => r.slice(0, n)), A.map((_, i) => A.map((__, j) => +(i === j))), 'khử xong phải ra [I | x]');
      expectClose(last.map(r => r[n]), q.answer, 'đọc nghiệm từ cột cuối');
      c.steps += steps;
    });
  }
  each('ch2', 'classify', (q, c) => {
    const n = q.figure.lines.length;                              // hệ vuông n × n
    expect(q.textParams.vars, 'đề ghi rõ các ẩn').toBe(['x, y', 'x, y, z'][n - 2]);
    const { A, b } = systemOf(q.figure.lines, n);
    for (let j = 0; j < n; j++) expect(A.some(r => r[j] !== 0), `ẩn thứ ${j + 1} không hiện trên đề`).toBe(true);
    const aug = A.map((r, i) => [...r, b[i]]);
    const rA = rank(A), rAug = rank(aug);
    const want = rA < rAug ? 'c2q.tNone' : rA === n ? 'c2q.tUnique' : 'c2q.tInfinite';
    expect(choice(q)).toBe(want);
    expect(q.why.params).toMatchObject({ rank: rA, rankAug: rAug, n });
    c.steps += checkChain(q.work, aug).steps;
  });
  const noSwap = A => {                                            // khử xuôi không đổi hàng: { L, U }
    const U = A.map(r => r.slice()), L = A.map((_, i) => A.map((__, j) => +(i === j)));
    for (let j = 0; j < A.length; j++) for (let i = j + 1; i < A.length; i++) {
      expect(U[j][j], 'trụ 0 ⇒ phải đổi hàng').not.toBe(0);
      L[i][j] = U[i][j] / U[j][j];
      U[i] = U[i].map((x, k) => x - L[i][j] * U[j][k]);
    }
    return { L, U };
  };
  each('ch2', 'pivots', (q, c) => {
    const { U } = noSwap(mats(q).A);
    expectClose(q.answer, U.map((r, i) => r[i]), 'các trụ');
    c.steps += checkChain(q.work, mats(q).A).steps;
  });
  each('ch2', 'lu', (q, c) => {
    const { A } = mats(q);
    const { L } = noSwap(A);
    expectClose(q.answer, [L[1][0], L[2][0], L[2][1]], 'ℓ21, ℓ31, ℓ32');
    const [Ls, Us] = textOf(q.work.at(-1)).match(/\[[^\]]*\]/g).map(matLit);
    expectClose(mul(Ls, Us), A, 'L·U in trong lời giải phải bằng A');
    c.steps += checkChain(q.work, A).steps;
  });
  each('ch2', 'matmul', q => { const { A, B } = mats(q); expectClose(q.answer, mul(A, B), 'AB'); });
  each('ch2', 'entry', q => {
    const { A, B } = mats(q);
    const [i, j] = [...q.textParams.ij].map(d => d - 1);
    expectClose(q.answer, mul(A, B)[i][j], `(AB)${q.textParams.ij}`);
  });
  each('ch2', 'inverse', (q, c) => {
    const { A } = mats(q);
    const I = A.map((_, i) => A.map((__, j) => +(i === j)));
    expectClose(mul(A, q.answer), I, 'A·A⁻¹ = I');
    if (A.length === 3) {
      const { steps, last } = checkChain(q.work, A.map((r, i) => [...r, ...I[i]]));
      expectClose(last.map(r => r.slice(0, 3)), I, 'vế trái về I');
      expectClose(last.map(r => r.slice(3)), q.answer, 'vế phải là A⁻¹');
      c.steps += steps;
    }
  });
  each('ch2', 'xtay', q => expectClose(q.answer, dot(vec(q.textParams.x), mv(mats(q).A, vec(q.textParams.y))), 'xᵀAy'));
});

describe('Ch3 Không gian con: hạng tự tính, nghiệm thế lại vào Ax = 0 / Ax = b', () => {
  const colsStart = (q, b) => { const A = cols(vecsIn(q.textParams.vs)); return A.map((r, i) => [...r, b ? b[i] : 0]); };
  each('ch3', 'independent', (q, c) => {
    const vs = vecsIn(q.textParams.vs), r = rank(cols(vs));
    expect(choice(q)).toBe(r === vs.length ? 'c3q.yes' : 'c3q.no');
    expect(q.why.params).toMatchObject({ rank: r, count: vs.length });
    c.steps += checkChain(q.work, colsStart(q)).steps;
  });
  each('ch3', 'spankind', (q, c) => {
    const r = rank(cols(vecsIn(q.textParams.vs)));
    expect(choice(q)).toBe(`c3q.${['point', 'line', 'plane', 'space'][r]}`);
    c.steps += checkChain(q.work, colsStart(q)).steps;
  });
  each('ch3', 'inspan', (q, c) => {
    const vs = vecsIn(q.textParams.vs), b = vec(q.textParams.b);
    const inside = rank(cols(vs)) === rank(cols([...vs, b]));
    expect(choice(q)).toBe(inside ? 'c3q.yes' : 'c3q.no');
    if (inside) expectClose(mv(cols(vs), [vec(q.why.params.c)].flat()), b, 'hệ số in trong lời giải');
    c.steps += checkChain(q.work, colsStart(q, b)).steps;
  });
  const withZero = A => A.map(r => [...r, 0]);
  each('ch3', 'rank', (q, c) => { const { A } = mats(q); expect(q.answer).toBe(rank(A)); c.steps += checkChain(q.work, withZero(A)).steps; });
  each('ch3', 'nulldim', (q, c) => { const { A } = mats(q); expect(q.answer).toBe(A[0].length - rank(A)); c.steps += checkChain(q.work, withZero(A)).steps; });
  each('ch3', 'dims', (q, c) => {
    const { A } = mats(q), m = A.length, n = A[0].length, r = rank(A);
    expect([q.textParams.m, q.textParams.n]).toEqual([m, n]);
    expect(q.answer).toEqual([r, r, n - r, m - r]);
    c.steps += checkChain(q.work, withZero(A)).steps;
  });
  const freeOf = A => A[0].map((_, j) => j).filter(j => !rref(A).pivots.includes(j));
  each('ch3', 'special', (q, c) => {
    const { A } = mats(q), free = freeOf(A);
    expect(free, 'đề nói đúng một biến tự do').toHaveLength(1);
    expect(q.answer[free[0]]).toBe(1);
    expectClose(mv(A, q.answer), A.map(() => 0), 'As = 0');
    c.steps += checkChain(q.work, withZero(A)).steps;
  });
  each('ch3', 'particular', (q, c) => {
    const { A, b } = mats(q), free = freeOf(A);
    expect(free).toEqual([Number(q.textParams.free.slice(1)) - 1]);
    expect(vec(q.textParams.b)).toEqual(b);
    expect(q.answer[free[0]]).toBe(0);
    expectClose(mv(A, q.answer), b, 'Axₚ = b');
    c.steps += checkChain(q.work, A.map((r, i) => [...r, b[i]])).steps;
  });
});

describe('bộ kiểm không rỗng và tự kiểm', () => {
  it('mọi dạng tính toán đều có dấu "=" hoặc bước khử được dò thật', () => {
    for (const [kind, c] of Object.entries(counts)) expect(c.eq + c.steps, kind).toBeGreaterThan(SEEDS / 2);
    for (const kind of ['solve2', 'solve3', 'classify', 'lu', 'inverse', 'coefs', 'rank', 'special', 'particular']) {
      expect(counts[kind].steps, `${kind}: phải dò được bước khử`).toBeGreaterThan(SEEDS / 2);
    }
  });
  it('bộ tính và bộ đọc phép biến đổi khớp tay', () => {
    expect(evaluate('(3 + (-4), -6 + 2)')).toEqual([-1, -4]);
    expect(evaluate('2·(1, 3) + (-1)·(2, 0)')).toEqual([0, 6]);
    expect(evaluate('(1/2)·[4 -2; 0 6]')).toEqual([[2, -1], [0, 3]]);
    expect(evaluate('10 / (√5·√20)')).toBeCloseTo(1);
    expect(evaluate('3² + 4²')).toBe(25);
    expect(() => evaluate('v·w')).toThrow();
    const M = [[2, 4], [1, 3]];
    expect(rowOp('R2 ← R2 − (1/2)·R1')(M)).toEqual([[2, 4], [0, 1]]);
    expect(rowOp('R2 <- R2 + 0.5R1')(M)).toEqual([[2, 4], [2, 5]]);
    expect(rowOp('R1 ↔ R2')(M)).toEqual([[1, 3], [2, 4]]);
    expect(rowOp('R1 ← R1/(-2)')(M)).toEqual([[-1, -2], [1, 3]]);
    expect(rowOp('R1 ← -R1')(M)).toEqual([[-2, -4], [1, 3]]);
    expect(systemOf(['-4x - 4y + 4z = -8', '2x - z = 6', '-2y = 4'], 3)).toEqual({ A: [[-4, -4, 4], [2, 0, -1], [0, -2, 0]], b: [-8, 6, 4] });
  });
});

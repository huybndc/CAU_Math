import { evaluate } from './calc.js';

/* ---------------------------------------------------------------
   MÁY TÍNH DẠNG DANH SÁCH (bản rút gọn kiểu Desmos) — thuần, dùng lại evaluate() của calc.js (hệ 10).
   Mỗi dòng là một biểu thức, hoặc một định nghĩa: `a = 3`, `f(x) = x^2 + 1`, `g(x, y) = x*y`.
   Dòng sau dùng được biến / hàm của các dòng TRƯỚC. Kết quả mỗi dòng: { kind, value?, error?, params? }.
   Cách làm: thay biến và lời gọi hàm bằng số rồi đưa chuỗi còn lại cho evaluate().
   ponytail: không có đồ thị, không đệ quy, biến nhiều chữ phải gõ rõ (2a được, ab thì không).
   --------------------------------------------------------------- */

const CALCULUS = new Set(['int', 'diff', 'sum']);
const BUILTIN = new Set(['sqrt', 'cbrt', 'abs', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'exp', 'pi', 'e', ...CALCULUS]);
const ID = '[a-zA-Z][a-zA-Z0-9_]*';
const FN_DEF = new RegExp(`^\\s*(${ID})\\s*\\(\\s*(${ID}(?:\\s*,\\s*${ID})*)\\s*\\)\\s*=\\s*(.+)$`);
const VAR_DEF = new RegExp(`^\\s*(${ID})\\s*=\\s*(.+)$`);

const fail = (error, extra = {}) => { throw Object.assign(new Error(error), { key: error, ...extra }); };
const numStr = v => v.toLocaleString('en', { useGrouping: false, maximumFractionDigits: 15 });

/** Đọc đối số của lời gọi: text[at] đứng ngay sau "(" → { args (tách ở dấu phẩy ngoài ngoặc), end (vị trí sau ")") }. */
function callArgs(text, at) {
  let depth = 1, j = at;
  for (; j < text.length && depth; j++) depth += text[j] === '(' ? 1 : text[j] === ')' ? -1 : 0;
  if (depth) fail('calc.paren');
  const args = [];
  let d = 0, cur = '';
  for (const c of text.slice(at, j - 1)) {
    if (c === ',' && !d) { args.push(cur); cur = ''; continue; }
    d += c === '(' ? 1 : c === ')' ? -1 : 0;
    cur += c;
  }
  args.push(cur);
  return { args, end: j };
}

const tidy = v => Number(v.toPrecision(10));        // bỏ bụi số học của phép lấy xấp xỉ: 6.000000000012 → 6

/** Đạo hàm số tại x0 (công thức 5 điểm). */
function derivative(f, x0) {
  const h = 1e-3 * Math.max(1, Math.abs(x0));
  return tidy((-f(x0 + 2 * h) + 8 * f(x0 + h) - 8 * f(x0 - h) + f(x0 - 2 * h)) / (12 * h));
}

/** Tích phân số [a, b] bằng Simpson thích nghi (sai số 1e-10). */
function integral(f, a, b) {
  const simpson = (fa, fm, fb, l, r) => ((r - l) / 6) * (fa + 4 * fm + fb);
  const rec = (l, r, fl, fm, fr, whole, tol, depth) => {
    const m = (l + r) / 2, lm = (l + m) / 2, rm = (m + r) / 2;
    const flm = f(lm), frm = f(rm);
    const left = simpson(fl, flm, fm, l, m), right = simpson(fm, frm, fr, m, r);
    if (depth <= 0 || Math.abs(left + right - whole) <= 15 * tol) return left + right + (left + right - whole) / 15;
    return rec(l, m, fl, flm, fm, left, tol / 2, depth - 1) + rec(m, r, fm, frm, fr, right, tol / 2, depth - 1);
  };
  if (a === b) return 0;
  const fa = f(a), fb = f(b), fm = f((a + b) / 2);
  const r = rec(a, b, fa, fm, fb, simpson(fa, fm, fb, a, b), 1e-10, 18);
  if (!Number.isFinite(r)) fail('calc.domain');
  return tidy(r);
}

/** Tính `text` với biến `vars` (tên → số) và hàm `fns` (tên → { params, body }). Ném lỗi { key, name?, at? }. */
function value(text, vars, fns, opt) {
  let out = '', i = 0;
  while (i < text.length) {
    const m = /^[a-zA-Z][a-zA-Z0-9_]*/.exec(text.slice(i));
    if (!m) { out += text[i++]; continue; }
    const name = m[0];
    i += name.length;
    const lower = name.toLowerCase();
    const open = /^\s*\(/.test(text.slice(i));
    if (CALCULUS.has(lower) && open) {                    // int(f, a, b) · diff(f, x0) · sum(f, k, a, b); biến mặc định x
      const { args, end } = callArgs(text, i + text.slice(i).indexOf('(') + 1);
      i = end;
      let body = args[0].trim();
      if (fns[body]) body = `${body}(x)`;
      const ev = (idx) => value(args[idx], vars, fns, opt);
      const fn = v => t => value(body, { ...vars, [v]: t }, fns, opt);
      if (lower === 'diff') {
        if (args.length < 2) fail('calc.argc', { name });
        out += `(${numStr(derivative(fn((args[2] ?? 'x').trim()), ev(1)))})`;
      } else if (lower === 'int') {
        if (args.length < 3) fail('calc.argc', { name });
        out += `(${numStr(integral(fn((args[3] ?? 'x').trim()), ev(1), ev(2)))})`;
      } else {
        if (args.length !== 4) fail('calc.argc', { name });
        const k = args[1].trim(), lo = Math.round(ev(2)), hi = Math.round(ev(3));
        if (hi - lo > 100000) fail('calc.tooBig');
        let t = 0;
        for (let n = lo; n <= hi; n++) t += fn(k)(n);
        out += `(${numStr(tidy(t))})`;
      }
      continue;
    }
    if (BUILTIN.has(lower)) { out += name; continue; }
    if (open && fns[name]) {
      const { args, end } = callArgs(text, i + text.slice(i).indexOf('(') + 1);
      i = end;
      const { params, body } = fns[name];
      if (args.length !== params.length) fail('calc.argc', { name });
      const local = { ...vars };
      params.forEach((p, k) => { local[p] = value(args[k], vars, fns, opt); });
      out += `(${numStr(value(body, local, fns, opt))})`;
      continue;
    }
    if (!(name in vars)) fail('calc.undef', { name });
    out += `(${numStr(vars[name])})`;
  }
  const r = evaluate(out, 10, opt);
  if (r.error) fail(r.error, { at: r.at });
  return r.value ?? fail('calc.missing');
}

/** @returns {{ kind: 'empty'|'value'|'var'|'fn'|'error', value?: number, name?: string, params?: string[], error?: string, at?: number }[]} */
export function evalRows(lines, opt = {}) {
  const vars = {}, fns = {};
  return lines.map(line => {
    if (!String(line).trim()) return { kind: 'empty' };
    try {
      const f = FN_DEF.exec(line), v = !f && VAR_DEF.exec(line);
      if (f || v) {
        const name = (f || v)[1];
        if (BUILTIN.has(name.toLowerCase())) fail('calc.reserved', { name });
        if (f) {
          const params = f[2].split(',').map(s => s.trim());
          fns[name] = { params, body: f[3] };
          delete vars[name];
          value(f[3], { ...vars, ...Object.fromEntries(params.map(p => [p, 1])) }, fns, opt);   // thử một lần để báo lỗi ngay ở dòng định nghĩa
          return { kind: 'fn', name, params };
        }
        vars[name] = value(v[2], vars, fns, opt);
        delete fns[name];
        return { kind: 'var', name, value: vars[name] };
      }
      return { kind: 'value', value: value(line, vars, fns, opt) };
    } catch (e) {
      if (!e.key) throw e;
      return { kind: 'error', error: e.key, at: e.at, name: e.name };
    }
  });
}

/** Phân số p/q (q ≤ 1000) bằng đúng v, hoặc null — để hiện 0.6667 kèm 2/3. */
export function asFraction(v) {
  if (Number.isInteger(v)) return null;
  for (let q = 2; q <= 1000; q++) {
    const p = Math.round(v * q);
    if (Math.abs(v - p / q) < 1e-9) return `${p < 0 ? '−' : ''}${Math.abs(p)}/${q}`;
  }
  return null;
}

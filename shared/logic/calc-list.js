import { evaluate } from './calc.js';

/* ---------------------------------------------------------------
   MÁY TÍNH DẠNG DANH SÁCH (bản rút gọn kiểu Desmos) — thuần, dùng lại evaluate() của calc.js (hệ 10).
   Mỗi dòng là một biểu thức, hoặc một định nghĩa: `a = 3`, `f(x) = x^2 + 1`, `g(x, y) = x*y`.
   Dòng sau dùng được biến / hàm của các dòng TRƯỚC. Kết quả mỗi dòng: { kind, value?, error?, params? }.
   Cách làm: thay biến và lời gọi hàm bằng số rồi đưa chuỗi còn lại cho evaluate().
   ponytail: không có đồ thị, không đệ quy, biến nhiều chữ phải gõ rõ (2a được, ab thì không).
   --------------------------------------------------------------- */

const BUILTIN = new Set(['sqrt', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'pi']);
const ID = '[a-zA-Z][a-zA-Z0-9_]*';
const FN_DEF = new RegExp(`^\\s*(${ID})\\s*\\(\\s*(${ID}(?:\\s*,\\s*${ID})*)\\s*\\)\\s*=\\s*(.+)$`);
const VAR_DEF = new RegExp(`^\\s*(${ID})\\s*=\\s*(.+)$`);

const fail = (error, extra = {}) => { throw Object.assign(new Error(error), { key: error, ...extra }); };
const numStr = v => v.toLocaleString('en', { useGrouping: false, maximumFractionDigits: 15 });

/** Tính `text` với biến `vars` (tên → số) và hàm `fns` (tên → { params, body }). Ném lỗi { key, name?, at? }. */
function value(text, vars, fns) {
  let out = '', i = 0;
  while (i < text.length) {
    const m = /^[a-zA-Z][a-zA-Z0-9_]*/.exec(text.slice(i));
    if (!m) { out += text[i++]; continue; }
    const name = m[0];
    i += name.length;
    if (BUILTIN.has(name.toLowerCase())) { out += name; continue; }
    if (/^\s*\(/.test(text.slice(i)) && fns[name]) {
      i += text.slice(i).indexOf('(') + 1;
      let depth = 1, j = i;
      for (; j < text.length && depth; j++) depth += text[j] === '(' ? 1 : text[j] === ')' ? -1 : 0;
      if (depth) fail('calc.paren');
      const inner = text.slice(i, j - 1);
      i = j;
      const args = [];                                   // tách ở dấu phẩy ngoài ngoặc
      let d = 0, cur = '';
      for (const c of inner) {
        if (c === ',' && !d) { args.push(cur); cur = ''; continue; }
        d += c === '(' ? 1 : c === ')' ? -1 : 0;
        cur += c;
      }
      args.push(cur);
      const { params, body } = fns[name];
      if (args.length !== params.length) fail('calc.argc', { name });
      const local = { ...vars };
      params.forEach((p, k) => { local[p] = value(args[k], vars, fns); });
      out += `(${numStr(value(body, local, fns))})`;
      continue;
    }
    if (!(name in vars)) fail('calc.undef', { name });
    out += `(${numStr(vars[name])})`;
  }
  const r = evaluate(out, 10);
  if (r.error) fail(r.error, { at: r.at });
  return r.value ?? fail('calc.missing');
}

/** @returns {{ kind: 'empty'|'value'|'var'|'fn'|'error', value?: number, name?: string, params?: string[], error?: string, at?: number }[]} */
export function evalRows(lines) {
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
          value(f[3], { ...vars, ...Object.fromEntries(params.map(p => [p, 1])) }, fns);   // thử một lần để báo lỗi ngay ở dòng định nghĩa
          return { kind: 'fn', name, params };
        }
        vars[name] = value(v[2], vars, fns);
        delete fns[name];
        return { kind: 'var', name, value: vars[name] };
      }
      return { kind: 'value', value: value(line, vars, fns) };
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

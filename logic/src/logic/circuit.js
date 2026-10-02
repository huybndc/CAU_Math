import { parseAst, evalAst } from './bool-ast.js';

/* ---------------------------------------------------------------
   MẠCH CỔNG TỪ BIỂU THỨC (thuần, không DOM) — đầu vào cho sơ đồ tự vẽ.
   Net = { n, gates: [{ id, op, ins }], out }; ref = { v: k } (biến thứ k) | { g: id } (đầu ra cổng) | { c: 0|1 }.
   op: AND · OR · NAND · NOT. Cổng nhiều hơn MAXIN ngõ vào được tách thành cây.
   Ba kiểu dựng: `netFromAst` (đúng như người dùng gõ), `netAndOr` (SOP hai mức), `netNandNand` (toàn NAND).
   --------------------------------------------------------------- */

const MAXIN = 3;

class Builder {
  constructor(n) { this.n = n; this.gates = []; this.nots = new Map(); }
  add(op, ins) {
    if (ins.length > MAXIN && op === 'NAND') return this.add('NOT', [this.add('AND', ins)]);   // NAND nhiều ngõ: AND dạng cây rồi đảo
    if (ins.length > MAXIN) {                                      // tách cây: AND/OR kết hợp được
      const mid = Math.ceil(ins.length / 2);
      return this.add(op, [this.add(op, ins.slice(0, mid)), this.add(op, ins.slice(mid))]);
    }
    const g = { id: this.gates.length, op, ins }; this.gates.push(g); return { g: g.id };
  }
  not(ref) {                                                       // dùng chung một NOT cho mỗi biến
    if (ref.v == null) return this.add('NOT', [ref]);
    if (!this.nots.has(ref.v)) this.nots.set(ref.v, this.add('NOT', [ref]));
    return this.nots.get(ref.v);
  }
  done(out) { return { n: this.n, gates: this.gates, out }; }
}

function fromAst(b, a) {
  switch (a.t) {
    case 'const': return { c: a.v };
    case 'var': return { v: a.k };
    case 'not': return b.not(fromAst(b, a.x));
    default: return b.add(a.t === 'or' ? 'OR' : 'AND', a.parts.map(p => fromAst(b, p)));
  }
}

/** Mạch đúng cấu trúc biểu thức đã gõ. */
export function netFromAst(ast, n) { const b = new Builder(n); return b.done(fromAst(b, ast)); }
export const netFromText = (text, n) => netFromAst(parseAst(text, n), n);

/** Tách một SOP thành các term, mỗi term là danh sách literal (ast var / not var). */
function termsOf(sop, n) {
  const a = parseAst(sop, n);
  const parts = a.t === 'or' ? a.parts : [a];
  return parts.map(p => (p.t === 'and' ? p.parts : [p]));
}
const litRef = (b, l) => (l.t === 'not' ? b.not({ v: l.x.k }) : { v: l.k });

/** SOP hai mức AND–OR (term một literal nối thẳng). */
export function netAndOr(sop, n) {
  const b = new Builder(n);
  const outs = termsOf(sop, n).map(t => (t.length === 1 ? litRef(b, t[0]) : b.add('AND', t.map(l => litRef(b, l)))));
  return b.done(outs.length === 1 ? outs[0] : b.add('OR', outs));
}

/** SOP chuyển thành NAND–NAND; term một literal đi qua bộ đảo (hoặc dùng thẳng nếu đã là literal bù). */
export function netNandNand(sop, n) {
  const b = new Builder(n);
  const outs = termsOf(sop, n).map(t => {
    if (t.length > 1) return b.add('NAND', t.map(l => litRef(b, l)));
    const l = t[0];                                                 // (l)' : đảo literal
    return l.t === 'not' ? { v: l.x.k } : b.not({ v: l.k });
  });
  return b.done(outs.length === 1 ? b.not(outs[0]) : b.add('NAND', outs));
}

const val = (net, ref, m, memo) => {
  if (ref.c != null) return ref.c;
  if (ref.v != null) return (m >> (net.n - 1 - ref.v)) & 1;
  if (!memo.has(ref.g)) {
    const g = net.gates[ref.g], xs = g.ins.map(r => val(net, r, m, memo));
    memo.set(ref.g, g.op === 'NOT' ? xs[0] ^ 1 : g.op === 'AND' ? +xs.every(Boolean) : g.op === 'OR' ? +xs.some(Boolean) : +!xs.every(Boolean));
  }
  return memo.get(ref.g);
};
/** Giá trị đầu ra của mạch tại minterm m (A là MSB). */
export const evalNet = (net, m) => val(net, net.out, m, new Map());

/** Mức của từng cổng (biến = 0; cổng = 1 + mức lớn nhất của ngõ vào). */
export function levels(net) {
  const lv = [];
  for (const g of net.gates) lv[g.id] = 1 + Math.max(0, ...g.ins.map(r => (r.g != null ? lv[r.g] : 0)));
  return lv;
}
export { evalAst };

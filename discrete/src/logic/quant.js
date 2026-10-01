/* ---------------------------------------------------------------
   LƯỢNG TỪ TRÊN MIỀN HỮU HẠN (MCS 3.6; Rosen 1.4–1.5) — thuần.
   Cây: { t: 'all'|'ex', v, body } | { t: 'atom', p, args: ['x','y'] } | { t: 'not'|'and'|'or'|'imp', a, b }
   Diễn giải (interp): { domain: [..], preds: { P: (x, y) => bool } } — tính đúng/sai bằng vét cạn,
   nên mọi đáp án (đúng/sai, phủ định) đều KIỂM được trên máy, không dựa vào nhãn soạn tay.
   --------------------------------------------------------------- */

export const all = (v, body) => ({ t: 'all', v, body });
export const ex = (v, body) => ({ t: 'ex', v, body });
export const atom = (p, ...args) => ({ t: 'atom', p, args });
export const not = a => ({ t: 'not', a });
export const and = (a, b) => ({ t: 'and', a, b });
export const or = (a, b) => ({ t: 'or', a, b });
export const imp = (a, b) => ({ t: 'imp', a, b });

export function evalQ(f, interp, env = {}) {
  switch (f.t) {
    case 'all': return interp.domain.every(d => evalQ(f.body, interp, { ...env, [f.v]: d }));
    case 'ex': return interp.domain.some(d => evalQ(f.body, interp, { ...env, [f.v]: d }));
    case 'atom': return !!interp.preds[f.p](...f.args.map(a => env[a]));
    case 'not': return !evalQ(f.a, interp, env);
    case 'and': return evalQ(f.a, interp, env) && evalQ(f.b, interp, env);
    case 'or': return evalQ(f.a, interp, env) || evalQ(f.b, interp, env);
    case 'imp': return !evalQ(f.a, interp, env) || evalQ(f.b, interp, env);
    default: throw new Error('quant: ' + f.t);
  }
}

/** Phủ định đẩy vào trong: ¬∀ = ∃¬, ¬∃ = ∀¬, DeMorgan, ¬(A → B) = A ∧ ¬B, ¬¬A = A. */
export function negate(f) {
  switch (f.t) {
    case 'all': return ex(f.v, negate(f.body));
    case 'ex': return all(f.v, negate(f.body));
    case 'not': return f.a;
    case 'and': return or(negate(f.a), negate(f.b));
    case 'or': return and(negate(f.a), negate(f.b));
    case 'imp': return and(f.a, negate(f.b));
    default: return not(f);
  }
}

const SYM = { imp: '→', or: '∨', and: '∧' };
const isQ = f => f.t === 'all' || f.t === 'ex';

/** In như sách: ∀x ∃y (P(x, y) → ¬Q(y)). Ngoặc khi hai phép nhị phân khác nhau lồng nhau, hoặc lượng từ nằm trong một vế. */
export function formatQ(f) {
  switch (f.t) {
    case 'all': case 'ex': {
      const q = `${f.t === 'all' ? '∀' : '∃'}${f.v}`;
      return f.body.t in SYM ? `${q} (${formatQ(f.body)})` : `${q} ${formatQ(f.body)}`;
    }
    case 'atom': return `${f.p}(${f.args.join(', ')})`;
    case 'not': return '¬' + (f.a.t === 'atom' || f.a.t === 'not' ? formatQ(f.a) : `(${formatQ(f.a)})`);
    default: {
      const w = (c, left) => ((c.t in SYM && (c.t !== f.t || (f.t === 'imp' && left))) || (isQ(c) && left) ? `(${formatQ(c)})` : formatQ(c));
      return `${w(f.a, true)} ${SYM[f.t]} ${w(f.b, false)}`;
    }
  }
}

/**
 * Tương đương "trên máy": so giá trị qua nhiều diễn giải ngẫu nhiên trên miền nhỏ.
 * Hai công thức khác nhau về nghĩa gần như chắc chắn lộ ra ở một diễn giải nào đó.
 */
export function sameOnSamples(f, g, rnd, preds = { P: 1, Q: 1 }, tries = 200) {
  for (let i = 0; i < tries; i++) {
    const domain = [0, 1, 2].slice(0, 2 + Math.floor(rnd() * 2));
    const tables = Object.fromEntries(Object.entries(preds).map(([p]) => [p, new Map()]));
    const interp = {
      domain,
      preds: Object.fromEntries(Object.keys(preds).map(p => [p, (...xs) => {
        const k = xs.join(',');
        if (!tables[p].has(k)) tables[p].set(k, rnd() < 0.5);
        return tables[p].get(k);
      }])),
    };
    if (evalQ(f, interp) !== evalQ(g, interp)) return false;
  }
  return true;
}

/* ---------- đọc công thức người học gõ ---------- */

/** Chuẩn hoá cách gõ ASCII: forall/exists, ! ~, & /\, | \/, ->, [ ] → ký hiệu chuẩn. */
const norm = t => String(t).replace(/[−–]/g, '-').replace(/\bfor ?all\b/gi, '∀').replace(/\bexists?\b/gi, '∃')
  .replace(/\bnot\b|[!~]/gi, '¬').replace(/\/\\|&&?/g, '∧').replace(/\\\/|\|\|?/g, '∨')
  .replace(/<?[-=]+>|⇒|⟹/g, '→').replace(/\[/g, '(').replace(/\]/g, ')');

/**
 * Đọc công thức lượng từ: ∀x ∃y (P(x, y) → (Q(y, z) ∧ R(x, z))). Lượng từ ràng buộc chặt (∀x P(x) → Q là (∀x P(x)) → Q),
 * ¬ > ∧ > ∨ > →, → kết hợp phải. Vị từ viết hoa: P(x, y); biến chữ thường. Sai cú pháp thì ném Error.
 * @returns {object} cây như ở đầu file
 */
export function parseQ(text) {
  const toks = norm(text).match(/[∀∃¬∧∨→(),]|[A-Za-z][A-Za-z0-9_]*/g) ?? [];
  const rest = norm(text).replace(/[∀∃¬∧∨→(),\s]|[A-Za-z][A-Za-z0-9_]*/g, '');
  if (!toks.length || rest) throw new Error('quant: ký tự lạ');
  let i = 0;
  const peek = () => toks[i];
  const eat = t => { if (toks[i] !== t) throw new Error('quant: thiếu ' + t); i++; };
  const isPred = t => /^[A-Z]/.test(t ?? '');
  function imply() { const a = disj(); if (peek() === '→') { i++; return imp(a, imply()); } return a; }
  function disj() { let a = conj(); while (peek() === '∨') { i++; a = or(a, conj()); } return a; }
  function conj() { let a = unary(); while (peek() === '∧') { i++; a = and(a, unary()); } return a; }
  function unary() {
    const t = peek();
    if (t === '¬') { i++; return not(unary()); }
    if (t === '∀' || t === '∃') {
      i++;
      const v = toks[i++];
      if (!v || isPred(v) || !/^[a-z]/.test(v)) throw new Error('quant: thiếu biến');
      return (t === '∀' ? all : ex)(v, unary());
    }
    if (t === '(') { i++; const f = imply(); eat(')'); return f; }
    if (isPred(t)) {
      i++;
      const args = [];
      eat('(');
      do { const a = toks[i++]; if (!a || isPred(a) || !/^[a-z]/.test(a)) throw new Error('quant: đối số'); args.push(a); } while (peek() === ',' && ++i);
      eat(')');
      return atom(t, ...args);
    }
    throw new Error('quant: không đọc được');
  }
  const f = imply();
  if (i < toks.length) throw new Error('quant: thừa ký tự');
  return f;
}

/** Dấu ¬ chỉ đứng trước vị từ riêng lẻ (yêu cầu "đẩy phủ định vào trong")? */
export function negationsOnAtoms(f) {
  if (f.t === 'not') return f.a.t === 'atom';
  if (f.t === 'atom') return true;
  if (f.t === 'all' || f.t === 'ex') return negationsOnAtoms(f.body);
  return negationsOnAtoms(f.a) && negationsOnAtoms(f.b);
}

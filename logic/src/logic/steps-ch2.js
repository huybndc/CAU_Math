/* ---------------------------------------------------------------
   LỜI GIẢI TỪNG BƯỚC — Chương 2 (thuần, không biết ngôn ngữ). Dạng dòng: xem steps-ch1.js.
   Bảng chân trị tính TỪNG TERM ở từng dòng; rút gọn đại số ghép minterm theo
   x·y + x·y′ = x; DeMorgan / dual / NAND biến đổi trên cây cú pháp (bool-ast.js).
   --------------------------------------------------------------- */

import { parseAst, formatAst, pushNot, dualAst } from './bool-ast.js';
import { exprTruthTable } from './expr-parser.js';
import { gateBits } from './logic-gates.js';
import { sopTerms } from './nand-conversion.js';
import { varNames, minimizeSOP, implicantMinterms, implicantToSOP } from './quine-mccluskey.js';
import { line as L, tableLine } from '@shared/logic/steps.js';

const bitsOf = (m, n) => m.toString(2).padStart(n, '0');
const fmt = (ast, n) => formatAst(ast, n);

/**
 * Bảng chân trị có cột cho TỪNG TERM rồi cột F — người học dò lại được từng ô.
 * `pick` = giá trị F cần chọn (1: minterm, 0: maxterm) ⇒ tô các dòng đó và thêm cột chỉ số m.
 */
function termTable(key, expr, n, pick) {
  const names = varNames(n);
  // term chỉ là một biến (vd z) đã có sẵn cột biến — không lặp thêm cột
  const terms = sopTerms(expr, n).filter(t => !names.includes(t));
  const tts = terms.map(t => exprTruthTable(t, n));
  const F = exprTruthTable(expr, n);
  const idx = pick === undefined ? [] : ['m'];
  const head = [...idx, ...names, ...(sopTerms(expr, n).length > 1 ? terms.map(t => t.replace(/'/g, '′')) : []), 'F'];
  const rows = F.map((f, m) => [...(idx.length ? [m] : []), ...bitsOf(m, n).split('').map(Number), ...(sopTerms(expr, n).length > 1 ? tts.map(c => c[m]) : []), f]);
  const lead = idx.length + n;
  return tableLine(key, { vars: names.join('') }, {
    head, rows, vars: lead, outs: [head.length - 1],
    pick: pick === undefined ? [] : F.flatMap((f, m) => (f === pick ? [m] : [])),
  });
}

/** Một nhóm minterm gộp lại: "x′y′z′ + x′y′z = x′y′(z′ + z) = x′y′". */
function mergeLine(imp, n) {
  const names = varNames(n);
  const ms = implicantMinterms(imp, n);
  const lit = m => names.map((v, k) => v + ((m >> (n - 1 - k)) & 1 ? '' : "'")).join('');
  const common = implicantToSOP(imp, n);
  if (ms.length === 1) return L('s2.noMerge', { m: ms[0], term: lit(ms[0]) });
  const free = names.filter((_, k) => (imp.d >> (n - 1 - k)) & 1);
  const combos = [...Array(1 << free.length).keys()].map(c => free.map((v, i) => v + ((c >> (free.length - 1 - i)) & 1 ? '' : "'")).join(''));
  const inner = combos.join(' + ');
  const head = ms.map(lit).join(' + ');
  return common === '1' ? `${head} = 1` : `${head} = ${common}(${inner}) = ${common}·1 = ${common}`;
}

export function stepsOf(q) {
  const m = q.meta;
  const n = m.n;
  switch (q.kind) {
    case 'identify': case 'gate': {
      const bits = gateBits(m.gate, n);
      const names = varNames(n);
      return [
        L('s2.gateRule', { gate: m.gate, rule: 'c2q.rule' + m.gate }),
        tableLine('s2.rows', { vars: names.join('') }, {
          head: [...names, '#1', 'F'], vars: n, outs: [n + 1],
          rows: [...bits].map((f, r) => [...bitsOf(r, n).split('').map(Number), [...bitsOf(r, n)].filter(x => x === '1').length, Number(f)]),
        }),
        L('s2.readColumn', {}, bits),
      ];
    }
    case 'column': case 'circuit':
      return [
        ...(q.kind === 'circuit' ? [L('s2.circuitExpr', {}, `F = ${m.expr}`)] : []),
        termTable('s2.eachTerm', m.expr, n),
        L('s2.readColumn', {}, q.answer),
      ];
    case 'minterms': case 'maxterms': {
      const min = q.kind === 'minterms';
      return [
        termTable('s2.eachTerm', m.expr, n, min ? 1 : 0),
        L(min ? 's2.pickOnes' : 's2.pickZeros', {}, `${min ? 'Σm' : 'ΠM'}(${q.answer.join(', ')})`),
      ];
    }
    case 'canon': {
      const max = (1 << n) - 1;
      return [
        L('s2.canonWhy'),
        L('s2.allIdx', {}, `0 … ${max}`),
        L('s2.minusSigma', {}, `{${[...Array(max + 1).keys()].join(', ')}} ∖ {${m.list.join(', ')}}`),
        `ΠM(${q.answer.join(', ')})`,
      ];
    }
    case 'complement': {
      const terms = sopTerms(m.expr, n);
      const neg = t => fmt(pushNot(parseAst(t, n)), n);
      const wrap = s => (s.includes('+') ? `(${s})` : s);
      return [
        L('s2.deMorganOr', {}, `F′ = (${m.expr})′ = ${terms.map(t => `(${t})′`).join('')}`),
        L('s2.deMorganAnd'),
        ...terms.map(t => `(${t})′ = ${neg(t)}`),
        L('s1.result', {}, `F′ = ${terms.map(t => wrap(neg(t))).join('')}`),
      ];
    }
    case 'dual': {
      const terms = sopTerms(m.expr, n);
      return [
        L('s2.dualRule'),
        ...terms.map(t => `${t}  →  ${fmt(dualAst(parseAst(t, n)), n)}`),
        L('s2.dualJoin', {}, q.answer),
      ];
    }
    case 'simplify': {
      const best = minimizeSOP(q.target.values, n);
      return [
        L('s2.simpIdea'),
        L('s2.simpList', {}, `F = Σm(${m.list.join(', ')})`),
        ...best.terms.map(t => mergeLine(t.imp, n)),
        L('s2.simpReuse'),
        L('s1.result', {}, `F = ${q.answer}`),
      ];
    }
    case 'nand': {
      const terms = sopTerms(m.expr, n);
      return [
        L('s2.nandTwice', {}, `F = ((${m.expr})′)′`),
        L('s2.nandDeMorgan', {}, `F = (${terms.map(t => `(${t})′`).join('')})′`),
        L('s2.nandGates', { k: terms.length }),
        L('s1.result', {}, `F = ${q.answer}`),
      ];
    }
    default: return [];
  }
}

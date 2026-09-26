/* ---------------------------------------------------------------
   BIẾN THỂ SAI CỦA MỘT BIỂU THỨC BOOLEAN — làm phương án nhiễu cho đề trắc nghiệm.
   Mỗi biến thể chỉ khác gốc MỘT bước hay sai: bù nhầm một literal, đổi nhầm một
   biến, đổi + ↔ ·, bỏ một literal / một term. Làm trên cây (bool-ast.js), không trên chuỗi.
   --------------------------------------------------------------- */

import { parseAst, formatAst, dualAst, complementLiteralsAst, pushNot } from './bool-ast.js';
import { minimizeSOP, implicantToSOP } from './quine-mccluskey.js';
import { shuffle } from '@shared/logic/shuffle.js';

function* mutants(ast, n) {
  switch (ast.t) {
    case 'var':
      yield { t: 'not', x: ast };                                            // quên / thừa dấu ′
      for (let k = 0; k < n; k++) if (k !== ast.k) yield { t: 'var', k };    // nhầm biến
      break;
    case 'not':
      yield ast.x;
      for (const m of mutants(ast.x, n)) yield { t: 'not', x: m };
      break;
    case 'and': case 'or': {
      yield { t: ast.t === 'and' ? 'or' : 'and', parts: ast.parts };         // đổi + ↔ ·
      for (let i = 0; i < ast.parts.length; i++) {
        for (const m of mutants(ast.parts[i], n)) yield { ...ast, parts: ast.parts.map((x, j) => (j === i ? m : x)) };
        const rest = ast.parts.filter((_, j) => j !== i);                    // bỏ một thành phần
        yield rest.length === 1 ? rest[0] : { ...ast, parts: rest };
      }
      break;
    }
    default: break;
  }
}

/** Nút AND/OR có cùng một biến hai lần (yy′, y′ + y′…): biểu thức vô nghĩa, nhìn là loại được ngay. */
function degenerate(ast) {
  if (ast.t === 'not') return ast.x.t === 'not' || degenerate(ast.x);           // (z′)′: phủ định kép, nhìn là loại
  if (ast.t !== 'and' && ast.t !== 'or') return false;
  const vars = ast.parts.flatMap(p => (p.t === 'var' ? [p.k] : p.t === 'not' && p.x.t === 'var' ? [p.x.k] : []));
  return new Set(vars).size < vars.length || ast.parts.some(degenerate);
}

/** Các biểu thức (chuỗi) sai một bước so với `expr`, đã xáo, không trùng gốc, không vô nghĩa. */
export function mutantsOf(expr, n, rnd, max = 12) {
  const ast = parseAst(expr, n);
  const base = formatAst(ast, n);
  const out = new Set();
  for (const m of mutants(ast, n)) {
    if (degenerate(m)) continue;
    try { const s = formatAst(m, n); if (s !== base) out.add(s); } catch { /* biến thể rỗng */ }
  }
  return shuffle([...out], rnd).slice(0, max);
}

/** Những lỗi kinh điển khi đổi F sang dual / bù: giữ nguyên F, chỉ bù literal, chỉ đổi phép toán… */
export function classicWrong(expr, n) {
  const ast = parseAst(expr, n);
  const f = a => { try { return formatAst(a, n); } catch { return null; } };
  return {
    same: f(ast),                              // không làm gì
    literals: f(complementLiteralsAst(ast)),   // chỉ bù từng literal, giữ nguyên + và ·
    dual: f(dualAst(ast)),                     // chỉ đổi + ↔ · (không bù)
    complement: f(pushNot(ast)),               // bù đúng (F′)
  };
}

/**
 * "Đúng nhưng chưa tối giản": đáp án tối giản + một prime implicant thừa (không cần trong phủ tối thiểu).
 * values: hàm 0/1/2(X) theo minterm.
 */
export function redundantSops(values, n, answer) {
  const best = minimizeSOP(values, n);
  const used = new Set(best.terms.map(t => t.text));
  return best.pis.map(p => implicantToSOP(p, n)).filter(t => !used.has(t)).map(t => `${answer} + ${t}`);
}

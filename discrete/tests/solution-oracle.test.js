import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch1 from '../src/logic/ch1-quiz.js';

/* ---------------------------------------------------------------
   KIỂM ĐỘC LẬP LỜI GIẢI D1 (người học, 2026-09-25: "đảm bảo solution luôn đúng, check kĩ trước khi ra đề").
   Bộ phân tích + tính công thức DƯỚI ĐÂY viết riêng, không import gì từ prop-logic.js. Nó chỉ đọc CHỮ của đề
   (thứ người học thấy) rồi tính lại: đáp án, và TỪNG Ô của bảng chân trị in trong lời giải.
   Hai bộ tính độc lập lệch nhau ở bất kỳ câu nào ⇒ test đỏ ⇒ câu đó không được ra.
   --------------------------------------------------------------- */

// ưu tiên thấp → cao: ↔ · → (kết hợp phải) · ∨ · ⊕ · ∧ · ¬
const LEVELS = [['↔'], ['→'], ['∨'], ['⊕'], ['∧']];
const OPS = { '↔': (a, b) => a === b, '→': (a, b) => !a || b, '∨': (a, b) => a || b, '⊕': (a, b) => a !== b, '∧': (a, b) => a && b };

function parse(text) {
  const toks = text.match(/[a-zTF]|[¬∧∨⊕→↔()]/g);
  let i = 0;
  const level = k => {
    if (k === LEVELS.length) return unary();
    let left = level(k + 1);
    while (LEVELS[k].includes(toks[i])) {
      const op = toks[i++];
      const right = op === '→' ? level(k) : level(k + 1);     // → kết hợp phải
      const [a, b] = [left, right];
      left = env => OPS[op](a(env), b(env));
      if (op === '→') break;
    }
    return left;
  };
  const unary = () => {
    const t = toks[i++];
    if (t === '¬') { const a = unary(); return env => !a(env); }
    if (t === '(') { const a = level(0); if (toks[i++] !== ')') throw new Error('thiếu ) trong ' + text); return a; }
    if (t === 'T' || t === 'F') return () => t === 'T';
    if (/^[a-z]$/.test(t)) return env => { if (!(t in env)) throw new Error(`biến ${t} không có trong dòng`); return env[t]; };
    throw new Error(`không đọc được "${t}" trong ${text}`);
  };
  const f = level(0);
  if (i !== toks.length) throw new Error('thừa ký hiệu trong ' + text);
  return f;
}

const varsIn = text => [...new Set(text.match(/[p-z]/g))].sort();
/** Dòng m: biến đầu là bit cao, dòng 0 = mọi biến sai. */
const envOf = (vars, m) => Object.fromEntries(vars.map((v, k) => [v, ((m >> (vars.length - 1 - k)) & 1) === 1]));
const column = (text, vars) => Array.from({ length: 1 << vars.length }, (_, m) => (parse(text)(envOf(vars, m)) ? '1' : '0')).join('');

/** Mọi ô của bảng trong lời giải phải khớp với bộ tính độc lập; rowsAt = chỉ số dòng thật của từng dòng in ra. */
function checkTable(t, vars, rowsAt = t.rows.map((_, k) => k)) {
  expect(t.head.slice(0, t.vars)).toEqual(vars);
  t.rows.forEach((r, k) => {
    const env = envOf(vars, rowsAt[k]);
    t.head.forEach((h, j) => {
      const want = j < t.vars ? env[h] : parse(h)(env);
      expect(r[j], `ô (${rowsAt[k]}, ${h})`).toBe(want ? 1 : 0);
    });
  });
}

const SEEDS = 300;
const each = (kind, fn) => it(kind, () => { for (let s = 1; s <= SEEDS; s++) fn(ch1.makeQuestion(kind, seededRandom(s)), s); });

describe('D1: bộ tính độc lập xác nhận đáp án và từng ô bảng chân trị trong lời giải', () => {
  each('table', q => {
    const vars = q.meta.vars;
    expect(q.answer).toBe(column(q.textParams.f, vars));
    const t = q.work.find(w => w.table).table;
    checkTable(t, vars);
    expect(t.rows.map(r => r[t.outs[0]]).join('')).toBe(q.answer);
  });

  each('value', q => {
    const env = Object.fromEntries(q.textParams.env.split(', ').map(s => s.split(' = ')).map(([v, b]) => [v, b === 'T']));
    const vars = Object.keys(env);
    expect(q.answer).toBe(parse(q.textParams.f)(env) ? 0 : 1);
    const m = vars.reduce((acc, v) => acc * 2 + (env[v] ? 1 : 0), 0);
    checkTable(q.work.find(w => w.table).table, vars, [m]);
  });

  each('classify', q => {
    const col = column(q.textParams.f, varsIn(q.textParams.f));
    const cls = /^1+$/.test(col) ? 'tautology' : /^0+$/.test(col) ? 'contradiction' : 'contingent';
    expect(q.choices[q.answer]).toBe('c1q.cls.' + cls);
    checkTable(q.work.find(w => w.table).table, varsIn(q.textParams.f));
  });

  each('equiv', q => {
    const vars = varsIn(q.textParams.a + q.textParams.b);
    const ca = column(q.textParams.a, vars), cb = column(q.textParams.b, vars);
    expect(q.answer).toBe(ca === cb ? 0 : 1);
    const t = q.work.find(w => w.table).table;
    checkTable(t, vars);
    expect(t.mark).toEqual([...ca].flatMap((c, i) => (c !== cb[i] ? [i] : [])));   // đúng các dòng hai vế khác nhau
  });

  each('contra', q => {
    // f = X → Y ở mức ngoài cùng: tách tại mũi tên không nằm trong ngoặc
    const f = q.textParams.f;
    let depth = 0, at = -1;
    [...f].forEach((c, i) => { if (c === '(') depth++; if (c === ')') depth--; if (c === '→' && depth === 0 && at < 0) at = i; });
    const X = f.slice(0, at).trim(), Y = f.slice(at + 1).trim();
    const neg = s => `¬(${s})`;
    const want = { contrapositive: [neg(Y), neg(X)], converse: [Y, X], inverse: [neg(X), neg(Y)] }[q.meta.ask];
    const vars = ['p', 'q', 'r'];
    const same = (a, b) => column(a, vars) === column(b, vars);
    const ans = q.choices[q.answer];
    let d = 0, cut = -1;
    [...ans].forEach((c, i) => { if (c === '(') d++; if (c === ')') d--; if (c === '→' && d === 0 && cut < 0) cut = i; });
    expect(cut, `${ans} phải là một phép kéo theo`).toBeGreaterThan(0);
    expect(same(ans.slice(0, cut), want[0]) && same(ans.slice(cut + 1), want[1]), `${q.meta.ask} của ${f}: ${ans}`).toBe(true);
  });
});

describe('bộ tính độc lập tự kiểm (tránh hai bộ cùng sai một kiểu)', () => {
  it('khớp các luật sách', () => {
    const v = ['p', 'q', 'r'];
    expect(column('p → q', v)).toBe(column('¬p ∨ q', v));
    expect(column('¬(p ∧ q)', v)).toBe(column('¬p ∨ ¬q', v));
    expect(column('p → q → r', v)).toBe(column('p → (q → r)', v));
    expect(column('p ⊕ q', ['p', 'q'])).toBe('0110');
    expect(column('p ↔ q', ['p', 'q'])).toBe('1001');
    expect(column('(q ∧ r) → p', ['p', 'q', 'r'])).toBe('11101111');     // câu người học hỏi 2026-09-25
    expect(column('(q → r) ∧ (p → r)', ['p', 'q', 'r'])).toBe('11010101');
  });
});

import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch4 from '../src/logic/ch4-quiz.js';
import { mano, NAMES, envOf, column, GATES } from './oracle-kit.js';

/* ---------------------------------------------------------------
   KIỂM ĐỘC LẬP LỜI GIẢI Logic Ch4 — mạch tổ hợp (D41, D45).
   Không import combinational.js: cộng bit bằng số nguyên thường, tràn số suy từ KHOẢNG GIÁ TRỊ (−8…7) chứ không
   từ C₄ ⊕ C₃, MUX/decoder đọc từ chữ của đề. Mạch "phân tích" đọc từ HÌNH (danh sách cổng) và dò từng ô bảng chân trị.
   --------------------------------------------------------------- */

const SEEDS = 300;
const textOf = w => (typeof w === 'string' ? w : w.m ?? '');
const plain = s => s.replace(/′/g, "'").replace(/−/g, '-');
const bitsOf = (v, w = 4) => v.toString(2).padStart(w, '0');
const bit = (v, i) => (v >> i) & 1;
const fromSub = s => Number([...s].map(c => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).join(''));
const signed4 = v => (v >= 8 ? v - 16 : v);
const onesOf = col => col.flatMap((v, m) => (v ? [m] : []));
const setText = list => `Σm(${list.join(', ')})`;

/** Cộng từng bit như người làm tay: trả carries C₀…C₄ và tổng S₃…S₀. */
function add4(a, b, c0) {
  const c = [c0], s = [];
  for (let i = 0; i < 4; i++) { const t = bit(a, i) + bit(b, i) + c[i]; s[i] = t & 1; c[i + 1] = t >> 1; }
  return { c, s };
}
/** Dòng "bit i: a + b + c ⇒ Sᵢ = s, Cᵢ₊₁ = c" khớp phép cộng tay. */
function checkAdderRows(q, a, b, r) {
  const rows = q.work.map(textOf).filter(t => t.startsWith('bit '));
  expect(rows).toHaveLength(4);
  rows.forEach(t => {
    const [, i, x, y, cin, si, s, ci, c] = /^bit (\d): (\d) \+ (\d) \+ (\d) ⇒ S([₀-₉]) = (\d), C([₀-₉]) = (\d)$/.exec(t);
    const k = Number(i);
    expect([+x, +y, +cin, fromSub(si), +s, fromSub(ci), +c], t).toEqual([bit(a, k), bit(b, k), r.c[k], k, r.s[k], k + 1, r.c[k + 1]]);
  });
}

function each(kind, fn) {
  it(kind, () => { for (let s = 1; s <= SEEDS; s++) fn(ch4.makeQuestion(kind, seededRandom(s))); });
}

describe('Logic Ch4: đáp án tính lại từ đề/hình, dò từng dòng lời giải', () => {
  each('analyze', q => {
    const names = NAMES[3], { gates } = q.figure;
    // đọc mạch trên hình: T1, T2 từ biến, F từ T1, T2 (và có thể một literal)
    const cols = [];
    for (const g of gates) {
      cols.push([...Array(8).keys()].map(m => {
        const env = envOf(names, m);
        const ins = g.ins.map(s => (s === 'T1' ? cols[0][m] : s === 'T2' ? cols[1][m] : +mano(s)(env)));
        return +GATES[g.op](ins.map(Boolean));
      }));
    }
    expect(q.answer).toBe(cols[2].join(''));
    // biểu thức ghi cho từng cổng (T₁ = …) đúng là cổng trên hình
    const exprs = q.work.filter(w => typeof w === 'string' && /^(T₁|T₂|F) = /.test(w));
    expect(exprs).toHaveLength(3);
    exprs.forEach((t, k) => {
      const f = mano(t.split(' = ')[1].replace(/T₁/g, 'a').replace(/T₂/g, 'b'));
      [...Array(8).keys()].forEach(m => expect(+f({ ...envOf(names, m), a: !!cols[0][m], b: !!cols[1][m] }), `${t}, dòng ${m}`).toBe(cols[k][m]));
    });
    // từng ô bảng chân trị
    const t = q.work.find(w => w.table).table;
    expect(t.head).toEqual([...names, 'T₁', 'T₂', 'F']);
    t.rows.forEach((r, m) => expect(r, `dòng ${m}`).toEqual([...bitsOf(m, 3)].map(Number).concat(cols.map(c => c[m]))));
  });

  each('ripple', q => {
    const a = parseInt(q.textParams.a, 2), b = parseInt(q.textParams.b, 2), r = add4(a, b, 0);
    expect(q.answer).toBe([4, 3, 2, 1].map(i => r.c[i]).join(''));
    checkAdderRows(q, a, b, r);
  });

  each('addsub', q => {
    const a = parseInt(q.textParams.a, 2), b = parseInt(q.textParams.b, 2), { m } = q.textParams;
    const bx = m ? b ^ 15 : b, r = add4(a, bx, m);
    expect(q.answer).toBe(r.c[4] + [3, 2, 1, 0].map(i => r.s[i]).join(''));
    expect((a + (m ? -b : b) + 16) % 16, 'kết quả mod 16 đúng phép cộng/trừ').toBe(parseInt(q.answer.slice(1), 2));
    expect(textOf(q.work[0])).toBe(`B ⊕ M = ${bitsOf(bx)},  C₀ = ${m}`);
    checkAdderRows(q, a, bx, r);
  });

  each('overflow', q => {
    const a = parseInt(q.textParams.a, 2), b = parseInt(q.textParams.b, 2), sub = q.textParams.op === '−';
    const exact = signed4(a) + (sub ? -signed4(b) : signed4(b));
    const v = exact < -8 || exact > 7 ? 1 : 0;                  // tràn = kết quả thật ra ngoài −8…7
    expect(q.choices[q.answer]).toBe(v ? 'c4q.yesOv' : 'c4q.noOv');
    const r = add4(a, sub ? b ^ 15 : b, sub ? 1 : 0);
    checkAdderRows(q, a, sub ? b ^ 15 : b, r);
    expect(textOf(q.work.find(w => w.key === 's4.vRule'))).toBe(`V = C₄ ⊕ C₃ = ${r.c[4]} ⊕ ${r.c[3]} = ${v}`);
    const [lhs, rhs] = plain(textOf(q.work.find(w => w.key === 's4.vCheck'))).split(' = ');
    const [x, op, y] = lhs.replace(/[()]/g, '').split(' ');
    expect([Number(x), op, Number(y), Number(rhs)]).toEqual([signed4(a), sub ? '-' : '+', signed4(b), exact]);
  });

  each('bcdadd', q => {
    const a = parseInt(q.textParams.a, 2), b = parseInt(q.textParams.b, 2), { cin } = q.textParams, s = a + b + cin;
    expect(a <= 9 && b <= 9).toBe(true);
    expect(q.answer).toBe((s > 9 ? '1' : '0') + bitsOf(s > 9 ? s - 10 : s));
    expect(textOf(q.work[0])).toBe(`${q.textParams.a} + ${q.textParams.b} + ${cin} = ${bitsOf(s, 5)}  (${s})`);
    const fix = q.work.find(w => w.key === 's4.bcdFix');
    expect(!!fix, 'hiệu chỉnh +0110 khi tổng > 9').toBe(s > 9);
    if (fix) expect(textOf(fix)).toBe(`${bitsOf(s, 5)} + 0110 = ${bitsOf(s + 6, 5)}`);
    expect(textOf(q.work.at(-1))).toBe(`C S₈S₄S₂S₁ = ${q.answer[0]} ${q.answer.slice(1)}  (${s})`);
  });

  each('compare', q => {
    const a = parseInt(q.textParams.a, 2), b = parseInt(q.textParams.b, 2);
    const x = [3, 2, 1, 0].map(i => +(bit(a, i) === bit(b, i))).join('');
    expect(q.answer).toBe(x);
    const rows = q.work.map(textOf).filter(t => /^A[₀-₉] = /.test(t));
    rows.forEach((t, k) => expect(t).toBe(`A${'₃₂₁₀'[k]} = ${bit(a, 3 - k)}, B${'₃₂₁₀'[k]} = ${bit(b, 3 - k)} ⇒ x${'₃₂₁₀'[k]} = ${x[k]}`));
    const last = q.work.at(-1);
    expect(textOf(last)).toBe(a > b ? 'A > B' : a < b ? 'A < B' : 'A = B');
    if (a !== b) expect(last.params.i, 'bit khác nhau đầu tiên từ bit cao').toBe(31 - Math.clz32(a ^ b));
  });

  each('decoder', q => {
    const col = column(mano(q.textParams.expr), NAMES[3]), nor = q.textKey === 'c4q.qDecoderNor';
    expect(q.answer).toEqual(nor ? col.flatMap((v, m) => (v ? [] : [m])) : onesOf(col));
    expect(plain(textOf(q.work.find(w => w.key === 's4.decMinterms')))).toBe(`F = ${q.textParams.expr} = ${setText(onesOf(col))}`);
    expect(textOf(q.work.at(-1))).toBe(`D(${q.answer.join(', ')})`);
  });

  each('encoder', q => {
    const d = [q.textParams.d0, q.textParams.d1, q.textParams.d2, q.textParams.d3];
    const hi = d.lastIndexOf(1);
    expect(q.answer).toBe(hi < 0 ? '000' : bitsOf(hi, 2) + '1');
    expect(textOf(q.work.at(-1))).toBe(`x y V = ${q.answer.split('').join(' ')}`);
    if (hi >= 0) expect(textOf(q.work[1])).toBe(`${hi} = ${bitsOf(hi, 2)}₂`);
  });

  each('mux', q => {
    const names = q.textParams.vars.split(', '), { last } = q.textParams, on = q.textParams.spec.split(', ').map(Number);
    const F = m => +on.includes(m);
    const ins = Array.from({ length: 1 << (names.length - 1) }, (_, k) => [['0', last], [last + "'", '1']][F(2 * k)][F(2 * k + 1)]);
    expect(q.textParams.size).toBe(ins.length);
    expect(names.slice(0, -1).join(', ')).toBe(q.textParams.sel);
    expect(q.answer).toBe(ins.join(', '));
    const rows = q.work.map(textOf).filter(t => t.startsWith('I'));
    rows.forEach((t, k) => expect(plain(t)).toBe(`I${'₀₁₂₃₄₅₆₇'[k]}: m${2 * k} = ${F(2 * k)}, m${2 * k + 1} = ${F(2 * k + 1)} ⇒ ${ins[k]}`));
  });

  each('muxRead', q => {
    const ins = q.textParams.ins.split(', ').map(s => plain(s.split(' = ')[1]));
    const F = [...Array(8).keys()].map(m => +mano(ins[m >> 1])({ z: !!(m & 1) }));
    expect(q.answer).toEqual(onesOf(F));
    const rows = q.work.map(textOf).filter(t => /^I[₀-₉] = /.test(t));
    rows.forEach((t, k) => expect(t.split(' ⇒ ')[1]).toBe(`F(m${2 * k}) = ${F[2 * k]}, F(m${2 * k + 1}) = ${F[2 * k + 1]}`));
    expect(textOf(q.work.at(-1))).toBe(`F = ${setText(q.answer)}`);
  });
});

describe('bộ tính Ch4 tự kiểm', () => {
  it('cộng tay và tràn số', () => {
    expect(add4(0b1011, 0b0111, 0).c).toEqual([0, 1, 1, 1, 1]);
    expect(signed4(0b1001)).toBe(-7);
    // 0111 + 0001 = 1000: 7 + 1 = 8 > 7 ⇒ tràn
    const r = add4(7, 1, 0);
    expect(r.c[4] ^ r.c[3]).toBe(1);
  });
});

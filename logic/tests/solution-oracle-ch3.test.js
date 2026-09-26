import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch3 from '../src/logic/ch3-quiz.js';
import { mano, NAMES, column } from './oracle-kit.js';

/* ---------------------------------------------------------------
   KIỂM ĐỘC LẬP LỜI GIẢI Logic Ch3 — rút gọn K-map (D41, D45).
   Không dùng Quine–McCluskey của app: VÉT CẠN mọi khối (3ⁿ tổ hợp 0/1/— của n biến) để lấy implicant nguyên tố,
   rồi tìm phủ ít literal nhất bằng quay lui. Đọc K-map người học thấy (giá trị các ô), không đọc meta.
   --------------------------------------------------------------- */

const SEEDS = 300;
const textOf = w => (typeof w === 'string' ? w : w.m ?? '');
const list = s => (s.trim() ? s.split(',').map(x => Number(x.trim())) : []);

/** Mọi khối n biến: { fixed (bit = biến có mặt), bits (giá trị các biến có mặt), cells }. */
function cubes(n) {
  const out = [];
  for (let c = 0; c < 3 ** n; c++) {
    let fixed = 0, bits = 0;
    for (let k = 0, t = c; k < n; k++, t = Math.floor(t / 3)) {
      if (t % 3 < 2) { fixed |= 1 << k; bits |= (t % 3) << k; }
    }
    const cells = [...Array(1 << n).keys()].filter(m => (m & fixed) === bits);
    out.push({ fixed, bits, cells, lits: cells.length === 1 << n ? 0 : n - Math.log2(cells.length) });
  }
  return out;
}

/** Implicant nguyên tố phủ các ô `on`, không chạm ô `off` (don't care tuỳ ý). */
function primes(n, values, on) {
  const imps = cubes(n).filter(c => c.cells.every(m => values[m] === on || values[m] === 2) && c.cells.some(m => values[m] === on));
  return imps.filter(c => !imps.some(d => d !== c && d.cells.length > c.cells.length && c.cells.every(m => d.cells.includes(m))));
}

/** Tổng literal nhỏ nhất để phủ mọi ô `need` bằng các implicant nguyên tố (quay lui, cắt nhánh). */
function minLits(need, pis) {
  let best = Infinity;
  const go = (left, cost) => {
    if (cost >= best) return;
    if (!left.length) { best = cost; return; }
    for (const p of pis.filter(p => p.cells.includes(left[0]))) go(left.filter(m => !p.cells.includes(m)), cost + p.lits);
  };
  go(need, 0);
  return best;
}
const essentials = (pis, need) => pis.filter(p => p.cells.some(m => need.includes(m) && pis.filter(o => o.cells.includes(m)).length === 1));
const cellsOf = (expr, names, target) => column(mano(expr), names).flatMap((v, m) => (v === target ? [m] : []));

function each(kind, fn) {
  it(kind, () => { for (let s = 1; s <= SEEDS; s++) fn(ch3.makeQuestion(kind, seededRandom(s))); });
}

describe('Logic Ch3: đáp án và từng nhóm trong lời giải khớp bộ vét cạn', () => {
  for (const kind of ['sop', 'pos', 'dontcare']) {
    each(kind, q => {
      const { values, n } = q.input, names = NAMES[n], pos = kind === 'pos';
      const on = pos ? 0 : 1, need = values.flatMap((v, m) => (v === on ? [m] : []));
      expect(q.textParams.vars).toBe(names.join(', '));
      // chữ Σm(…) + d(…) / ΠM(…) + d(…) in trong lời giải khớp đúng bản đồ
      const [, main, ms, ds = ''] = /^(Σm|ΠM)\(([^)]*)\)(?: \+ d\(([^)]*)\))?$/.exec(q.textParams.spec);
      expect([main, list(ms), list(ds)]).toEqual([pos ? 'ΠM' : 'Σm', need, values.flatMap((v, m) => (v === 2 ? [m] : []))]);
      if (kind === 'dontcare') expect(values.includes(2), 'dạng don\'t care phải có ít nhất một ô d').toBe(true);
      // đáp án: đúng mọi ô không phải d, và ít literal nhất
      const tt = column(mano(q.answer), names);
      values.forEach((v, m) => v !== 2 && expect(tt[m], `ô ${m} của ${q.answer}`).toBe(v));
      const pis = primes(n, values, on), best = minLits(need, pis);
      expect((q.answer.match(/[a-z]/g) || []).length, `${q.answer} chưa tối giản`).toBe(best);
      expect(q.meta.lit).toBe(best);
      // từng nhóm khoanh: đúng các ô ghi kèm, là implicant nguyên tố, nhãn EPI đúng
      const groups = q.work.filter(w => /^s3\.group(Pos|One)?$/.test(w.key));
      expect(groups.length).toBeGreaterThan(0);
      for (const { params: p } of groups) {
        const cells = list(p.cells);
        expect(cellsOf(p.term, names, pos ? 0 : 1), `nhóm ${p.term}`).toEqual(cells);
        expect(pis.some(c => String(c.cells) === String(cells)), `${p.term} phải là implicant nguyên tố`).toBe(true);
        const ess = essentials(pis, need).some(c => String(c.cells) === String(cells));
        expect(p.ess, `${p.term}: nhãn EPI`).toBe(ess ? 's3.ess' : 's3.noEss');
        if (p.keep) {
          const keep = p.keep === '—' ? [] : p.keep.split(', ').map(s => s.split(' = '));
          for (const [v, b] of keep) expect(cells.every(m => ((m >> (n - 1 - names.indexOf(v))) & 1) === Number(b)), `${p.term}: ${v} = ${b}`).toBe(true);
          expect([...keep.map(k => k[0]), ...(p.drop === '—' ? [] : p.drop.split(', '))].sort()).toEqual([...names].sort());
        }
      }
      expect(textOf(q.work.at(-1))).toBe(`F = ${q.answer}`);
    });
  }

  for (const kind of ['pis', 'epis']) {
    each(kind, q => {
      const { values, n } = q.figure;
      const need = values.flatMap((v, m) => (v === 1 ? [m] : []));
      expect(q.textParams.spec).toBe(`Σm(${need.join(', ')})`);
      const pis = primes(n, values, 1), ess = essentials(pis, need);
      expect(q.answer).toBe(kind === 'pis' ? pis.length : ess.length);
      const rows = q.work.filter(w => w.key === 's3.piEss' || w.key === 's3.piNotEss');
      expect(rows).toHaveLength(pis.length);
      for (const { params: p } of rows) {
        const cells = list(p.cells);
        expect(cellsOf(p.term, NAMES[n], 1), p.term).toEqual(cells);
        const only = cells.filter(m => pis.filter(o => o.cells.includes(m)).length === 1);
        expect(list(p.only), `${p.term}: ô chỉ nhóm này phủ`).toEqual(only);
      }
    });
  }

  each('cell', q => {
    const { n, m } = q.meta.find ? q.input : { n: q.figure.n, m: q.figure.mark };
    expect(q.answer).toBe(q.meta.find ? q.textParams.m : m);
    const codes = q.work.find(w => w.key === 's3.cellCodes').params;
    expect(parseInt(codes.row + codes.col, 2), 'mã hàng + mã cột của ô').toBe(q.answer);
    expect(codes.rows + codes.cols).toBe(NAMES[n].join(''));
    const [lhs, rhs] = textOf(q.work.at(-1)).split(' = ');
    expect(lhs.split(' + ').reduce((s, t) => s + t.split('·').map(Number).reduce((a, b) => a * b), 0)).toBe(Number(rhs));
    expect(Number(rhs)).toBe(q.answer);
  });

  each('xor', q => {
    const lits = q.textParams.expr.split(' ⊕ ');
    const names = NAMES[lits.length];
    const cols = lits.map(l => column(mano(l), names));
    const f = cols[0].map((_, m) => (cols.reduce((s, c) => s ^ c[m], 0) ^ (q.textKey === 'c3q.qXnor' ? 1 : 0)));
    expect(q.answer).toEqual(f.flatMap((v, m) => (v ? [m] : [])));
    expect(textOf(q.work.at(-1))).toBe(`Σm(${q.answer.join(', ')})`);
  });
});

describe('bộ vét cạn Ch3 tự kiểm', () => {
  it('ví dụ sách', () => {
    // F = Σm(0, 2, 4, 5, 6) (Mano 3.2): F = z′ + xy′ — 3 literal, 2 PI đều cốt yếu
    const v = [1, 0, 1, 0, 1, 1, 1, 0];
    const pis = primes(3, v, 1);
    expect(pis.map(p => p.cells)).toEqual(expect.arrayContaining([[0, 2, 4, 6], [4, 5]]));
    expect(minLits([0, 2, 4, 5, 6], pis)).toBe(3);
    expect(essentials(pis, [0, 2, 4, 5, 6])).toHaveLength(2);
  });
});

/* ---------------------------------------------------------------
   KIỂM PHÉP TÍNH TRONG CÂU KHÁI NIỆM (D27) — thuần.
   Câu do Gemini soạn mà đáp án dựa trên một phép tính thì phải kèm `check`;
   pipeline (scripts/gen/) chạy lại phép tính bằng CHÍNH các hàm giải của app —
   sai là loại câu, không cần người đọc mới phát hiện.
     equiv      { a, b, same }              a ≡ b ? (bảng chân trị)
     minterms   { expr, list }              các minterm hàm bằng 1
     literals   { minterms, dontcares?, n, form: 'sop'|'pos', count }   số literal tối giản
     convert    { value, from, to, result } đổi cơ số
     complement { value, radix, diminished, result }   bù r / bù (r−1)
     signed     { bits, format, value }     đọc số có dấu (magnitude | ones | twos)
     gray       { bin, gray }               nhị phân ↔ Gray
   Số biến n tự suy từ tên biến theo Mano (x,y → 2; có z → 3; có w → 4; có v → 5).
   --------------------------------------------------------------- */

import { exprTruthTable, varsCount } from './expr-parser.js';
import { minimizeSOP, minimizePOS, totalLiterals } from './quine-mccluskey.js';
import { convertBase } from './number-systems.js';
import { radixComplement, diminishedComplement } from './complements.js';
import { decode } from './signed-binary.js';
import { binToGray } from './gray.js';

const same = (a, b) => String(a).trim().toUpperCase().replace(/^0+(?=[0-9A-F])/, '') === String(b).trim().toUpperCase().replace(/^0+(?=[0-9A-F])/, '');
const listEq = (a, b) => [...a].sort((p, q) => p - q).join() === [...b].sort((p, q) => p - q).join();
const fail = reason => ({ ok: false, reason });

const CHECKS = {
  equiv({ a, b, same: expect }) {
    const n = varsCount(a, b);
    const eq = exprTruthTable(a, n).join('') === exprTruthTable(b, n).join('');
    return eq === !!expect ? { ok: true } : fail(`${a} ${eq ? '≡' : '≢'} ${b}`);
  },
  minterms({ expr, list, n }) {
    const tt = exprTruthTable(expr, n ?? varsCount(expr));
    const ones = tt.flatMap((v, m) => (v ? [m] : []));
    return listEq(ones, list) ? { ok: true } : fail(`${expr} = Σm(${ones.join(', ')})`);
  },
  literals({ minterms, dontcares = [], n, form = 'sop', count }) {
    const values = Array.from({ length: 1 << n }, (_, m) => (dontcares.includes(m) ? 2 : minterms.includes(m) ? 1 : 0));
    const best = form === 'pos' ? minimizePOS(values, n) : minimizeSOP(values, n);
    const lit = totalLiterals(best.terms, n);
    return lit === count ? { ok: true } : fail(`minimal: ${lit} literals (${best.expr})`);
  },
  convert({ value, from, to, result }) {
    const r = convertBase(String(value), from, to);
    return same(r, result) ? { ok: true } : fail(`(${value})${from} = (${r})${to}`);
  },
  complement({ value, radix, diminished, result }) {
    const r = diminished ? diminishedComplement(String(value), radix).digits : radixComplement(String(value), radix).digits;
    return String(r) === String(result).trim().toUpperCase() ? { ok: true } : fail(`complement = ${r}`);
  },
  signed({ bits, format, value }) {
    const v = decode(String(bits), format);
    return v === Number(value) ? { ok: true } : fail(`${bits} (${format}) = ${v}`);
  },
  gray({ bin, gray }) {
    const g = binToGray(String(bin));
    return g === String(gray) ? { ok: true } : fail(`Gray(${bin}) = ${g}`);
  },
};

/** @returns {{ ok: boolean, reason?: string }} */
export function verifyCheck(check) {
  const fn = CHECKS[check?.type];
  if (!fn) return fail(`unknown check type: ${check?.type}`);
  try { return fn(check); } catch (e) { return fail(`cannot run: ${e.key ?? e.message}`); }
}

export const CHECK_TYPES = Object.keys(CHECKS);

/* ---------------------------------------------------------------
   KIỂM PHÉP TÍNH TRONG CÂU KHÁI NIỆM LinAlg (D27, D48) — thuần.
   Câu lấy từ đề/bài có lời giải (MIT OCW, lời giải của Strang) mà đáp án dựa trên phép tính thì kèm `check`;
   test chạy lại bằng CHÍNH các hàm giải của app — nguồn ghi sai là lộ ngay. Ma trận là mảng các hàng.
     dims     { A, rank?, nullDim?, leftNullDim? }   hạng và số chiều các không gian con
     system   { A, b, kind }                          Ax = b: 'none' | 'unique' | 'infinite'
     solves   { A, b?, x }                            Ax = b (b bỏ trống ⇒ Ax = 0)
     product  { A, B, C }                             AB = C
     inverse  { A, inv }                              A·inv = I
   --------------------------------------------------------------- */

import { dimensions } from './subspace.js';
import { solveSystem } from './linear-system.js';
import { multiply, matVec, identity, equals } from './matrix.js';

const fail = reason => ({ ok: false, reason });
const sameVec = (a, b) => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < 1e-9);

const CHECKS = {
  dims({ type, A, ...want }) {
    const d = dimensions(A);
    const bad = Object.entries(want).filter(([k, v]) => d[k] !== v);
    return bad.length ? fail(bad.map(([k]) => `${k} = ${d[k]}`).join(', ')) : { ok: true };
  },
  system({ A, b, kind }) {
    const r = solveSystem(A, b);
    return r.type === kind ? { ok: true } : fail(`Ax = b: ${r.type}`);
  },
  solves({ A, b = A.map(() => 0), x }) {
    const Ax = matVec(A, x);
    return sameVec(Ax, b) ? { ok: true } : fail(`Ax = (${Ax.join(', ')})`);
  },
  product({ A, B, C }) {
    const AB = multiply(A, B);
    return equals(AB, C) ? { ok: true } : fail(`AB = ${JSON.stringify(AB)}`);
  },
  inverse({ A, inv }) {
    return equals(multiply(A, inv), identity(A.length)) ? { ok: true } : fail('A·inv ≠ I');
  },
};

/** @returns {{ ok: boolean, reason?: string }} */
export function verifyCheck(check) {
  const fn = CHECKS[check?.type];
  if (!fn) return fail(`unknown check type: ${check?.type}`);
  try { return fn(check); } catch (e) { return fail(`cannot run: ${e.key ?? e.message}`); }
}

export const CHECK_TYPES = Object.keys(CHECKS);

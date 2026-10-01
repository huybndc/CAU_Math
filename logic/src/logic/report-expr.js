import { readFunction, isSpec } from './kmap-walk.js';
import { exprTruthTable, varsCount } from './expr-parser.js';
import {
  varNames, minimizeSOP, minimizePOS, splitValues, implicantToSOP, implicantMinterms,
} from './quine-mccluskey.js';
import { complementByDeMorgan, complementByDual } from './boolean-complement.js';
import { sopToNand } from './nand-conversion.js';

/* ---------------------------------------------------------------
   MÁY GIẢI BIỂU THỨC BOOLE (Chương 2–3): một hàm (biểu thức hoặc Σm/ΠM/d) → bảng chân trị, SOP/POS tối giản
   (các nhóm lớn nhất, nhóm bắt buộc), bù, và dạng toàn NAND. Thuần; chỉ khoá từ điển.
   --------------------------------------------------------------- */

const MAX_N = 5;
const KEY_TRUTH = 'ex.truth';

/** Số biến tự nhận: biểu thức ⇒ theo tên biến; Σm ⇒ đủ chứa chỉ số lớn nhất. */
export function autoVars(text) {
  if (isSpec(text)) {
    const top = Math.max(0, ...(String(text).match(/\d+/g) ?? []).map(Number));
    return Math.min(MAX_N, Math.max(2, Math.ceil(Math.log2(top + 1))));
  }
  return varsCount(String(text).replace(/^F\s*(\([^)]*\))?\s*=\s*/i, ''));
}

export function exprReport(text, n = autoVars(text)) {
  const f = readFunction(text, n);
  const N = f.n, values = f.values, names = varNames(N);
  const { ones, dcs } = splitValues(values);
  const sop = minimizeSOP(values, N), pos = minimizePOS(values, N);
  const trivial = e => e === '0' || e === '1';
  const same = s => { const t = exprTruthTable(s, N); return values.every((v, m) => v === 2 || v === t[m]); };

  const tableStep = {
      group: 'ex.tabTable', head: { key: 'ex.stTable' },
      lines: [
        { key: 'ex.minterms', m: `Σm(${ones.join(', ')})` + (dcs.length ? ` + d(${dcs.join(', ')})` : '') },
        { key: KEY_TRUTH, table: { head: [...names, 'F'], rows: values.map((v, m) => [...m.toString(2).padStart(N, '0'), v === 2 ? 'X' : v]), vars: N, outs: [N], pick: ones } },
      ],
    };
  const steps = [
    {
      group: 'ex.tabMin', head: { key: 'ex.stPrime' }, why: { key: 'ex.whyPrime' },
      lines: sop.pis.map((pi, i) => ({ key: sop.essential.includes(i) ? 'ex.piEss' : 'ex.pi', m: `${implicantToSOP(pi, N)}   (${implicantMinterms(pi, N).map(m => 'm' + m).join(', ')})` })),
    },
    {
      group: 'ex.tabMin', head: { key: 'ex.stCover' }, why: { key: 'ex.whyCover' },
      lines: [...sop.terms.map(t => ({ key: t.essential ? 'ex.ess' : 'ex.pick', m: t.text })), { key: 'ex.sop', m: sop.expr }, { key: 'ex.pos', m: pos.expr }],
    },
  ];
  if (!trivial(sop.expr) && sop.terms.length) {
    try {
      const dm = complementByDeMorgan(sop.expr, N), du = complementByDual(sop.expr, N);
      steps.push({ group: 'ex.tabCompl', head: { key: 'ex.stDeM' }, lines: dm.steps.map(s => ({ key: s.noteKey, m: s.expr })) },
        { group: 'ex.tabCompl', head: { key: 'ex.stDual' }, lines: du.steps.map(s => ({ key: s.noteKey, m: s.expr })) });
      const nd = sopToNand(sop.expr, N);
      steps.push({ group: 'ex.tabNand', head: { key: 'ex.stNand' }, lines: nd.steps.map(s => ({ key: s.noteKey, m: s.expr })) });
    } catch { /* hàm hằng hoặc dạng không chuyển được: bỏ các ngăn phụ */ }
  }
  steps.push(tableStep);
  return { answer: [{ key: 'ex.sop', m: sop.expr }, { key: 'ex.pos', m: pos.expr }], steps, check: same, n: N };
}

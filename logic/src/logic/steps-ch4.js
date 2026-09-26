/* ---------------------------------------------------------------
   LỜI GIẢI TỪNG BƯỚC — Chương 4 (thuần, không biết ngôn ngữ). Dạng dòng: xem steps-ch1.js.
   Mọi con số tính lại bằng combinational.js — lời giải và đáp án không thể lệch nhau.
   --------------------------------------------------------------- */

import { rippleAdd, addSub, signedOf, bcdAdd, compare, priorityEncode, muxOutput, evalNet, gateExpr } from './combinational.js';
import { exprTruthTable } from './expr-parser.js';
import { varNames } from './quine-mccluskey.js';
import { line as L, tableLine } from '@shared/logic/steps.js';

const b4 = v => v.toString(2).padStart(4, '0');
const sub = k => String(k).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');
const bit = (v, i) => (v >> i) & 1;
const ones = tt => tt.flatMap((v, m) => (v ? [m] : []));
const prime = s => s.replace(/'/g, '′');
/** Số có dấu trong phép tính: âm thì có ngoặc, dấu trừ thật (3 + (−7)). */
const signed = x => (x < 0 ? `(−${-x})` : String(x));

/** Từng bit của bộ cộng nối tiếp: "bit 0: 1 + 1 + 0 ⇒ S₀ = 0, C₁ = 1". */
function adderRows(a, b, r) {
  return [0, 1, 2, 3].map(i => `bit ${i}: ${bit(a, i)} + ${bit(b, i)} + ${r.carries[i]} ⇒ S${sub(i)} = ${r.sum[3 - i]}, C${sub(i + 1)} = ${r.carries[i + 1]}`);
}

export function stepsOf(q) {
  const m = q.meta;
  switch (q.kind) {
    case 'analyze': {
      // bảng chân trị x y z | T₁ T₂ F — cột cổng sau tính từ các cột trước nó, dò được từng ô (D41)
      const names = varNames(3), cols = evalNet(m.gates, names), name = ['T₁', 'T₂', 'F'];
      const rows = cols[0].map((_, r) => [...names.map((__, k) => (r >> (2 - k)) & 1), ...cols.map(c => c[r])]);
      return [
        L('s4.label'),
        ...m.gates.map((g, i) => `${name[i]} = ${gateExpr(g)}`),
        tableLine('s4.table', {}, { head: [...names, ...name], rows, vars: 3, outs: [5] }),
        L('s4.readCol', {}, `F = ${cols[2].join('')}`),
      ];
    }
    case 'ripple': {
      const r = rippleAdd(m.a, m.b, 0);
      return [L('s4.fa', {}, 'Sᵢ = Aᵢ ⊕ Bᵢ ⊕ Cᵢ,  Cᵢ₊₁ = AᵢBᵢ + Cᵢ(Aᵢ ⊕ Bᵢ)'), L('s4.lsbFirst'), ...adderRows(m.a, m.b, r),
        L('s4.carriesAre', {}, `C₄C₃C₂C₁ = ${q.answer}`)];
    }
    case 'addsub': case 'overflow': {
      const r = addSub(m.a, m.b, m.m);
      const bx = parseInt(r.bx, 2);
      const head = [L(m.m ? 's4.subMode' : 's4.addMode', {}, `B ⊕ M = ${r.bx},  C₀ = ${m.m}`), ...adderRows(m.a, bx, r)];
      if (q.kind === 'addsub') return [...head, L('s4.readOut', {}, `C₄ S₃S₂S₁S₀ = ${r.cout} ${r.sum}`)];
      const sa = signedOf(m.a), sb = signedOf(m.b), exact = m.m ? sa - sb : sa + sb;
      return [...head, L('s4.vRule', {}, `V = C₄ ⊕ C₃ = ${r.carries[4]} ⊕ ${r.carries[3]} = ${r.v}`),
        L('s4.vCheck', {}, `${signed(sa)} ${m.m ? '−' : '+'} ${signed(sb)} = ${exact < 0 ? '−' + -exact : exact}`)];
    }
    case 'bcdadd': {
      const r = bcdAdd(m.a, m.b, m.cin);
      return [
        L('s4.bcdBin', {}, `${b4(m.a)} + ${b4(m.b)} + ${m.cin} = ${r.binary}  (${r.z})`),
        r.fix ? L('s4.bcdFix', {}, `${r.binary} + 0110 = ${(r.z + 6).toString(2).padStart(5, '0')}`) : L('s4.bcdNoFix'),
        L('s4.readBcd', {}, `C S₈S₄S₂S₁ = ${r.cout} ${r.s}  (${r.z})`),
      ];
    }
    case 'compare': {
      const c = compare(m.a, m.b);
      return [
        L('s4.xRule', {}, 'xᵢ = AᵢBᵢ + Aᵢ′Bᵢ′'),
        ...[3, 2, 1, 0].map(i => `A${sub(i)} = ${bit(m.a, i)}, B${sub(i)} = ${bit(m.b, i)} ⇒ x${sub(i)} = ${c.x[3 - i]}`),
        `x₃x₂x₁x₀ = ${c.x}`,
        c.at < 0 ? L('s4.cmpEq', {}, 'A = B') : L('s4.cmpAt', { i: c.at }, c.gt ? 'A > B' : 'A < B'),
      ];
    }
    case 'decoder': {
      const tt = exprTruthTable(m.expr, 3);
      return [
        L('s4.decOut'),
        L('s4.decMinterms', {}, `F = ${prime(m.expr)} = Σm(${ones(tt).join(', ')})`),
        L(m.nor ? 's4.decNor' : 's4.decOr', {}, `D(${q.answer.join(', ')})`),
      ];
    }
    case 'encoder': {
      const e = priorityEncode(m.d);
      return [
        L('s4.encRule'),
        e.v ? L('s4.encHi', { hi: e.hi }, `${e.hi} = ${e.x}${e.y}₂`) : L('s4.encNone'),
        L('s4.readOut', {}, `x y V = ${q.answer.split('').join(' ')}`),
      ];
    }
    case 'mux': {
      const size = m.tt.length / 2;
      return [
        L('s4.muxRule', { last: m.last }),
        ...Array.from({ length: size }, (_, k) => {
          const f0 = m.tt[2 * k], f1 = m.tt[2 * k + 1], s = q.answer.split(', ')[k];
          return `I${sub(k)}: m${2 * k} = ${f0}, m${2 * k + 1} = ${f1} ⇒ ${prime(s)}`;
        }),
        L('s4.readOut', {}, q.answer),
      ];
    }
    case 'muxRead': {
      const tt = muxOutput(m.inputs);
      return [
        L('s4.muxReadRule'),
        ...m.inputs.map((s, k) => `I${sub(k)} = ${prime(s)} ⇒ F(m${2 * k}) = ${tt[2 * k]}, F(m${2 * k + 1}) = ${tt[2 * k + 1]}`),
        L('s4.readSet', {}, `F = Σm(${ones(tt).join(', ')})`),
      ];
    }
    default: return [];
  }
}

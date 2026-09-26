/* ---------------------------------------------------------------
   LỖI HAY GẶP — Chương 4 (thuần). Một danh sách cho hai việc:
   chẩn đoán khi người học gõ đúng một đáp án sai quen thuộc, và làm phương án
   nhiễu cho bản trắc nghiệm (mcq-banks.js).
   --------------------------------------------------------------- */

import { rippleAdd, bcdAdd, priorityEncode, muxOutput, evalNet } from './combinational.js';
import { varNames } from './quine-mccluskey.js';

const rev = s => [...s].reverse().join('');
const flip = s => [...s].map(c => (c === '1' ? '0' : '1')).join('');
const ones = tt => tt.flatMap((v, m) => (v ? [m] : []));
const setText = list => `Σm(${list.join(', ')})`;
const swapLast = s => (s.endsWith("'") ? s.slice(0, -1) : /^[01]$/.test(s) ? s : s + "'");

/** [{ ans, key }] — đáp án sai hay gặp của câu q, kèm khoá lời chẩn đoán. */
export function mistakesOf(q) {
  const m = q.meta;
  switch (q.kind) {
    case 'analyze': {
      const [t1, t2] = evalNet(m.gates, varNames(3));
      return [
        { ans: flip(q.answer), key: 'c4q.dBubble' },
        { ans: t1.join(''), key: 'c4q.dPartial' }, { ans: t2.join(''), key: 'c4q.dPartial' },
      ];
    }
    case 'ripple': {
      const gen = [4, 3, 2, 1].map(i => (m.a >> (i - 1)) & (m.b >> (i - 1)) & 1).join('');   // chỉ AᵢBᵢ, quên carry lan
      return [{ ans: gen, key: 'c4q.dGenOnly' }, { ans: rev(q.answer), key: 'c4q.dOrder' }];
    }
    case 'addsub': {
      const out = (a, b, c) => { const r = rippleAdd(a, b, c); return r.cout + r.sum; };
      return m.m
        ? [{ ans: out(m.a, ~m.b & 15, 0), key: 'c4q.dNoPlus1' }, { ans: out(m.a, m.b, 0), key: 'c4q.dNoInvert' }]
        : [{ ans: out(m.a, ~m.b & 15, 1), key: 'c4q.dMode' }];
    }
    case 'bcdadd': {
      const r = bcdAdd(m.a, m.b, m.cin);
      return r.fix
        ? [{ ans: r.binary, key: 'c4q.dNoFix' }]
        : [{ ans: ((r.z + 6) & 31).toString(2).padStart(5, '0'), key: 'c4q.dAlwaysFix' }];
    }
    case 'compare': return [{ ans: flip(q.answer), key: 'c4q.dXor' }, { ans: rev(q.answer), key: 'c4q.dOrder' }];
    case 'encoder': {
      const lo = [0, 1, 2, 3].find(i => m.d[i]);
      const e = priorityEncode(m.d);
      return [
        ...(lo !== undefined && lo !== e.hi ? [{ ans: `${lo >> 1}${lo & 1}1`, key: 'c4q.dLowest' }] : []),
        ...(e.v ? [{ ans: `${e.x}${e.y}0`, key: 'c4q.dValid' }] : [{ ans: '001', key: 'c4q.dValid' }]),
      ];
    }
    case 'mux': {
      const ins = q.answer.split(', ');
      const swapped = ins.map(swapLast);
      const order = ins.length === 4 ? [ins[0], ins[2], ins[1], ins[3]] : null;       // đảo thứ tự hai ngõ chọn
      const inverse = ins.map(x => (x === '0' ? '1' : x === '1' ? '0' : swapLast(x)));      // mạch của F′
      const zOne = ins.map((_, k) => String(m.tt[2 * k + 1]));                               // chỉ nhìn dòng z = 1
      return [
        { ans: swapped.join(', '), key: 'c4q.dSwapZ' },
        ...(order ? [{ ans: order.join(', '), key: 'c4q.dSelOrder' }] : []),
        { ans: inverse.join(', '), key: 'c4q.dInverse' },
        { ans: zOne.join(', '), key: 'c4q.dOnlyZ1' },
      ];
    }
    case 'muxRead': {
      const ins = m.inputs;
      return [
        { ans: setText(ones(muxOutput(ins.map(swapLast)))), key: 'c4q.dSwapZ' },
        { ans: setText(ones(muxOutput([ins[0], ins[2], ins[1], ins[3]]))), key: 'c4q.dSelOrder' },
      ];
    }
    case 'decoder': {
      const other = [...Array(8).keys()].filter(v => !q.answer.includes(v));
      return [{ ans: setText(other), key: m.nor ? 'c4q.dNorSet' : 'c4q.dOrSet' }];
    }
    default: return [];
  }
}

/** Đáp án gõ vào trùng một lỗi quen thuộc ⇒ { detailKey }; không thì {}. So sau khi bỏ khoảng trắng. */
export function diagnose(q, given) {
  const norm = s => String(s).replace(/\s+/g, '').replace(/[′’`]/g, "'");
  const hit = mistakesOf(q).find(x => norm(x.ans) === norm(given) && norm(x.ans) !== norm(q.answerText ?? q.answer));
  return hit ? { detailKey: hit.key } : {};
}

/** Phương án nhiễu cho bản trắc nghiệm. */
export function wrongOf(q) {
  if (q.format === 'choice') return null;
  const correct = q.format === 'set' ? setText(q.answer) : q.answer;
  return { correct, candidates: mistakesOf(q).map(x => x.ans) };
}

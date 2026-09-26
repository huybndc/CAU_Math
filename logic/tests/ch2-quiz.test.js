import { describe, it, expect } from 'vitest';
import { KINDS, makeQuestion, checkAnswer } from '../src/logic/ch2-quiz.js';
import { sopTerms, sopToNand } from '../src/logic/nand-conversion.js';
import { exprTruthTable } from '../src/logic/expr-parser.js';
import { gateBits, STANDARD_GATES } from '../src/logic/logic-gates.js';
import { mulberry32 } from './helpers/eval-cover.js';

describe('sopTerms / sopToNand (Fig 2.7c)', () => {
  it('tách đúng các term của biểu thức SOP', () => {
    expect(sopTerms('wx + yz', 4)).toEqual(['wx', 'yz']);
    expect(sopTerms("x + y'z", 3)).toEqual(['x', "y'z"]);
    expect(sopTerms('xy', 2)).toEqual(['xy']);
  });

  it('biểu thức có ngoặc lồng thì throw', () => {
    expect(() => sopTerms('x(y + z)', 3)).toThrow();
  });

  it('dạng NAND tương đương với biểu thức gốc', () => {
    for (const [e, n] of [['wx + yz', 4], ["x + y'z", 3], ["x'y + xy'", 2],
      ['xy + yz + zx', 3], ['xy + z', 3], ["x'y'z + xyz", 3]]) {
      const r = sopToNand(e, n);
      expect(exprTruthTable(r.result, n), e + ' → ' + r.result).toEqual(exprTruthTable(e, n));
    }
  });

  it('wx + yz ra đúng dạng trong sách', () => {
    expect(sopToNand('wx + yz', 4).result).toBe("((wx)'(yz)')'");
  });

  it('đếm đúng số cổng mỗi tầng', () => {
    expect(sopToNand('xy + yz + zx', 3).gateCount).toEqual({ level1: 3, level2: 1 });
  });

  it('có đủ 3 bước giải thích', () => {
    const r = sopToNand('wx + yz', 4);
    expect(r.steps.length).toBe(4);
    expect(r.steps.every(s => s.noteKey.length > 0)).toBe(true);
  });
});

describe('makeQuestion (Ch.2)', () => {
  it('sinh được cả 3 dạng, câu nào cũng đủ trường', () => {
    const rnd = mulberry32(31);
    for (const k of KINDS) {
      for (let i = 0; i < 40; i++) {
        const q = makeQuestion(k, rnd);
        expect(q.kind).toBe(k);
        expect(q.textKey.length).toBeGreaterThan(0);
        expect(String(q.answer).length).toBeGreaterThan(0);
        expect(q.hintKey.length).toBeGreaterThan(0);
        expect(q.meta).toBeTypeOf('object');
      }
    }
  });

  it('"mix" sinh ra đủ cả 3 dạng', () => {
    const rnd = mulberry32(32);
    const seen = new Set();
    for (let i = 0; i < 200; i++) seen.add(makeQuestion('mix', rnd).kind);
    expect([...seen].sort()).toEqual([...KINDS].sort());
  });

  it('dạng bài không hợp lệ thì throw', () => {
    expect(() => makeQuestion('zzz')).toThrow();
  });

  it('đáp án của câu nand/complement luôn tương đương với đề', () => {
    const rnd = mulberry32(33);
    for (let i = 0; i < 60; i++) {
      for (const k of ['nand', 'complement']) {
        const q = makeQuestion(k, rnd);
        const want = exprTruthTable(q.meta.expr, q.meta.n);
        const got = exprTruthTable(q.answer, q.meta.n);
        if (k === 'nand') expect(got, q.text).toEqual(want);
        else expect(got, q.text).toEqual(want.map(v => v ^ 1));
      }
    }
  });

  it('câu identify: bits khớp bảng 16 hàm hai biến (cổng 2 ngõ vào) và luật cổng (3 ngõ vào)', () => {
    const rnd = mulberry32(34);
    let two = 0, three = 0;
    for (let i = 0; i < 80; i++) {
      const q = makeQuestion('identify', rnd);
      expect(q.meta.bits).toBe(gateBits(q.meta.gate, q.meta.n));
      if (q.meta.n === 2) {
        two++;
        const fi = STANDARD_GATES.find(g => g.gate === q.meta.gate).fi;
        expect(q.meta.bits).toBe(fi.toString(2).padStart(4, '0'));
      } else three++;
    }
    expect(two).toBeGreaterThan(10);
    expect(three).toBeGreaterThan(10);
  });
});

describe('checkAnswer', () => {
  const rnd = mulberry32(41);

  it('câu identify là trắc nghiệm: chỉ phương án đúng được tính', () => {
    const q = makeQuestion('identify', rnd);
    expect(q.choices[q.answer].label).toBe(q.meta.gate);
    expect(checkAnswer(q, String(q.answer)).ok).toBe(true);
    expect(checkAnswer(q, String((q.answer + 1) % q.choices.length)).ok).toBe(false);
  });

  it('câu biểu thức chấm theo bảng chân trị: đổi thứ tự / viết khác mà tương đương vẫn đúng', () => {
    const q = { kind: 'dual', format: 'text', target: { expr: 'wx + yz' }, meta: { n: 4 } };
    expect(checkAnswer(q, 'wx + yz').ok).toBe(true);
    expect(checkAnswer(q, 'yz + wx').ok).toBe(true);
    expect(checkAnswer(q, 'wx').ok).toBe(false);
  });

  it('câu NAND: tương đương nhưng còn dấu + thì chưa phải dạng NAND', () => {
    const q = { kind: 'nand', format: 'text', target: { expr: 'wx + yz' }, meta: { n: 4 } };
    expect(checkAnswer(q, "((wx)'(yz)')'").ok).toBe(true);
    expect(checkAnswer(q, 'wx + yz').ok).toBe(false);
  });

  it('biểu thức sai cú pháp: báo lỗi để sửa (retry), chưa tính là sai', () => {
    const q = { kind: 'dual', format: 'text', target: { expr: 'wx + yz' }, meta: { n: 4 } };
    const r = checkAnswer(q, 'wx +');
    expect(r.retry).toBe(true);
    expect(r.detailKey).toBeTruthy();
  });
});

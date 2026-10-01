import { describe, it, expect } from 'vitest';
import { seededQuestion, signature } from '../logic/question-pool.js';
import { vi as sharedVi } from '../i18n/vi.js';
import { en as sharedEn } from '../i18n/en.js';
import { CHAPTERS as LOGIC } from '../../logic/src/logic/chapters.js';
import { CHAPTERS as LINALG } from '../../linalg/src/logic/chapters.js';
import { CHAPTERS as DISCRETE } from '../../discrete/src/logic/chapters.js';
import { vi as logicVi } from '../../logic/src/i18n/vi/index.js';
import { en as logicEn } from '../../logic/src/i18n/en/index.js';
import { vi as linalgVi } from '../../linalg/src/i18n/vi/index.js';
import { en as linalgEn } from '../../linalg/src/i18n/en/index.js';
import { vi as discreteVi } from '../../discrete/src/i18n/vi/index.js';
import { en as discreteEn } from '../../discrete/src/i18n/en/index.js';

/* ---------------------------------------------------------------
   HỢP ĐỒNG CHUNG CỦA MỌI NGÂN HÀNG CÂU (hub D34) — cả 3 app, bản tự luận lẫn trắc nghiệm, cả dạng "Khái niệm".
   Chạy đúng bảng chương app dùng (chapters.js). Mỗi câu: đúng dạng được hỏi, định dạng hợp lệ, có giây chuẩn, có lời giải;
   MỌI khoá từ điển câu dùng (đề, gợi ý, giải thích, hướng dẫn, phương án, lý do, từng dòng lời giải, tham số là khoá)
   có ở CẢ hai bản VI/EN, và điền tham số xong không còn "{…}" — thiếu thì người học thấy nguyên khoá "c2q.hSolve" trên màn.
   --------------------------------------------------------------- */

const APPS = {
  logic: { chapters: LOGIC, vi: { ...sharedVi, ...logicVi }, en: { ...sharedEn, ...logicEn } },
  linalg: { chapters: LINALG, vi: { ...sharedVi, ...linalgVi }, en: { ...sharedEn, ...linalgEn } },
  discrete: { chapters: DISCRETE, vi: { ...sharedVi, ...discreteVi }, en: { ...sharedEn, ...discreteEn } },
};
const FORMATS = ['text', 'number', 'set', 'choice', 'vector'];
const SEEDS = 40;
// giống tp() ở shared/ui/question.js: chuỗi dạng "c8q.yes" là khoá (số như "5.099" thì không)
const keyLike = s => typeof s === 'string' && /^[a-z][\w-]*(\.[\w-]+)+$/i.test(s);

/** Mọi [khoá, tham số] một câu đưa ra màn hình. */
function usedKeys(q) {
  // dòng hướng dẫn không có tham số riêng thì màn hình dùng tham số của đề (question.js)
  const out = [[q.textKey, q.textParams], [q.hintKey, q.hintParams], [q.explainKey, q.explainParams], [q.formatKey, q.formatParams ?? q.textParams]];
  if (q.why?.key) out.push([q.why.key, q.why.params]);
  for (const c of q.choices ?? []) { const s = typeof c === 'object' ? c.label : c; if (keyLike(s)) out.push([s]); }
  for (const w of q.work ?? []) if (typeof w === 'object' && w.key) out.push([w.key, w.params]);
  return out.filter(([k]) => k);
}

describe('hợp đồng chung của mọi ngân hàng câu', () => {
  for (const [app, { chapters, vi, en }] of Object.entries(APPS)) {
    for (const ch of chapters) {
      for (const [bank, mcq] of [[ch.bank, false], ...(ch.choiceBank ? [[ch.choiceBank, true]] : [])]) {
        it(`${app} ${ch.id}${mcq ? ' trắc nghiệm' : ''}`, () => {
          expect(bank.KINDS.length).toBeGreaterThan(0);
          for (const kind of bank.KINDS) {
            expect(bank.SECONDS?.[kind], `${kind}: giây chuẩn`).toBeGreaterThan(0);
            for (let seed = 1; seed <= SEEDS; seed++) {
              const q = seededQuestion(bank, kind, seed), at = `${app}.${ch.prefix}.${kind} #${seed}`;
              expect(q.kind, at).toBe(kind);
              expect(FORMATS, at).toContain(q.format);
              expect(() => signature(q), at).not.toThrow();
              if (q.format === 'choice') {
                expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, `${at}: chỉ số đáp án`).toBe(true);
                expect(bank.checkAnswer(q, String(q.answer)).ok, `${at}: chọn đúng phải được chấm đúng`).toBe(true);
                expect(bank.checkAnswer(q, String((q.answer + 1) % q.choices.length)).ok, `${at}: chọn sai phải bị chấm sai`).toBe(false);
              }
              if (!q.layout) expect(q.work?.length ?? 0, `${at}: lời giải`).toBeGreaterThan(0);
              for (const [key, params = {}] of usedKeys(q)) {
                for (const [lang, dict] of [['vi', vi], ['en', en]]) {
                  expect(dict[key], `${at}: thiếu khoá "${key}" (${lang})`).toBeTypeOf('string');
                  for (const name of dict[key].match(/\{(\w+)\}/g) ?? []) {
                    expect(params, `${at}: "${key}" (${lang}) thiếu tham số ${name}`).toHaveProperty(name.slice(1, -1));
                  }
                }
                for (const v of Object.values(params)) if (keyLike(v) && (v in vi || v in en)) expect([v in vi, v in en], `${at}: tham số khoá "${v}"`).toEqual([true, true]);
              }
              if (keyLike(q.answerText) && (q.answerText in vi || q.answerText in en)) expect([q.answerText in vi, q.answerText in en]).toEqual([true, true]);
            }
          }
        });
      }
    }
  }
});

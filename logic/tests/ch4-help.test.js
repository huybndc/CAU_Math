import { describe, it, expect } from 'vitest';
import { seededRandom } from '@shared/logic/shuffle.js';
import { mistakesOf } from '../src/logic/ch4-help.js';
import * as ch4 from '../src/logic/ch4-quiz.js';
import { vi } from '../src/i18n/vi/index.js';
import { en } from '../src/i18n/en/index.js';

/* Gõ đúng một lỗi quen thuộc ⇒ bị chấm sai và nhận ĐÚNG lời chẩn đoán của lỗi đó (khoá có ở cả hai bản). */
describe('chương 4: lỗi hay gặp', () => {
  it('mỗi lỗi bị chấm sai, lời chẩn đoán khớp, khoá có ở VI và EN', () => {
    const seen = new Set();
    for (const kind of ch4.KINDS) for (let seed = 1; seed <= 60; seed++) {
      const q = ch4.makeQuestion(kind, seededRandom(seed));
      const list = mistakesOf(q);
      for (const { ans, key } of list) {
        expect(vi[key] && en[key], key).toBeTruthy();
        const r = ch4.checkAnswer(q, ans);
        if (r.ok) continue;                               // lỗi trùng đáp án đúng ở đề này (vd đảo thứ tự dãy đối xứng)
        // hai lỗi có thể ra cùng một đáp án (vd đảo F trùng cột T₁) ⇒ chấp nhận lời chẩn đoán của lỗi nào cũng được
        expect(list.filter(x => x.ans === ans).map(x => x.key), `${kind} #${seed}: ${ans}`).toContain(r.detailKey);
        seen.add(key);
      }
    }
    expect(seen.size).toBeGreaterThanOrEqual(15);
  });

  it('ví dụ sách: M = 1 mà quên +1 ⇒ báo đúng lỗi bù 1', () => {
    const q = { kind: 'addsub', format: 'text', answer: '10010', meta: { a: 5, b: 3, m: 1 } };
    expect(ch4.checkAnswer(q, '10001')).toEqual({ ok: false, detailKey: 'c4q.dNoPlus1' });
  });
});

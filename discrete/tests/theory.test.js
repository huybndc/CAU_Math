import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { splitCards, visibleWords } from '@shared/logic/cards.js';
import { pointKeys, parseKey } from '@shared/logic/knowledge.js';
import { buildGraph, findCycle, danglingNeeds } from '@shared/logic/prereq.js';
import * as ch1 from '../src/logic/ch1-quiz.js';
import * as ch2 from '../src/logic/ch2-quiz.js';
import * as ch3 from '../src/logic/ch3-quiz.js';
import * as ch4 from '../src/logic/ch4-quiz.js';
import * as ch5 from '../src/logic/ch5-quiz.js';
import * as ch6 from '../src/logic/ch6-quiz.js';
import * as ch7 from '../src/logic/ch7-quiz.js';
import * as ch8 from '../src/logic/ch8-quiz.js';

const load = rel => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf-8');
const CH = [1, 2, 3, 4, 5, 6, 7, 8];
const md = (n, lang) => load(`../src/content/theory-ch${n}.${lang}.md`);
const BANKS = { c1q: ch1, c2q: ch2, c3q: ch3, c4q: ch4, c5q: ch5, c6q: ch6, c7q: ch7, c8q: ch8 };

describe('bài học Discrete', () => {
  it('VI và EN cùng số thẻ, parse được, mỗi thẻ ≤ 120 chữ đọc ngay', () => {
    for (const n of CH) {
      const vi = splitCards(md(n, 'vi')).cards, en = splitCards(md(n, 'en')).cards;
      expect(en.length, `ch${n}`).toBe(vi.length);
      for (const [lang, cards] of [['vi', vi], ['en', en]]) {
        expect(() => marked.parse(md(n, lang), { async: false })).not.toThrow();
        for (const c of cards) expect(visibleWords(c.body), `ch${n}.${lang} "${c.title}"`).toBeLessThanOrEqual(120);
      }
    }
  });

  it('mọi điểm kiến thức trỏ tới dạng câu có thật; đồ thị tiên quyết không chu trình, VI = EN', () => {
    const graphOf = lang => buildGraph(CH.map(n => ({ ch: 'ch' + n, md: md(n, lang) })));
    const vi = graphOf('vi'), en = graphOf('en');
    for (const key of vi.keys()) {
      const { prefix, kind } = parseKey(key);
      expect(BANKS[prefix]?.KINDS, key).toContain(kind);
    }
    for (const b of Object.values(BANKS)) for (const k of b.KINDS) expect([...vi.keys()].some(x => parseKey(x).kind === k && BANKS[parseKey(x).prefix] === b), `dạng ${k} chưa có thẻ`).toBe(true);
    expect(findCycle(vi)).toBeNull();
    expect(danglingNeeds(vi)).toEqual([]);
    const shape = g => [...g.values()].map(x => [x.key, x.needs, x.ch, x.card]);
    expect(shape(en)).toEqual(shape(vi));
    expect(pointKeys(md(7, 'vi'))).toContain('c7q:rsa');
  });
});

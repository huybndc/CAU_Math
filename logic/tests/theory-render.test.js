import { parseRoute, routeOf } from '../../shared/logic/route.js';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { splitCards, visibleWords, kindCards } from '@shared/logic/cards.js';
import { pointKeys, parseKey, makerFor } from '@shared/logic/knowledge.js';
import { buildGraph, findCycle, danglingNeeds, topoOrder } from '@shared/logic/prereq.js';
import { seededRandom } from '@shared/logic/shuffle.js';
import * as ch1 from '../src/logic/ch1-quiz.js';
import * as ch2 from '../src/logic/ch2-quiz.js';
import * as ch3 from '../src/logic/ch3-quiz.js';
import * as ch4 from '../src/logic/ch4-quiz.js';

const load = rel => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf-8');
const md = load('../src/content/theory-ch3.vi.md');

describe('theory-ch3.md', () => {
  const html = marked.parse(md, { async: false });

  it('có đủ các mục Mano §3.1–3.8 (kể cả don\'t care, NAND/NOR, XOR)', () => {
    for (const h of ['Gray code', 'K-map 3 biến', 'K-map 4 biến', 'Quy tắc khoanh nhóm', 'Prime implicant',
      'Rút gọn POS', 'don\'t care', 'NAND và NOR', 'Hàm XOR', 'Những chỗ hay sai']) {
      expect(md, `thiếu mục "${h}"`).toContain(h);
    }
  });

  it('giữ ví dụ ghép hai ô kề nhau', () => {
    expect(html).toContain('x′yz + xyz = yz(x′ + x) = yz');
  });

  it('không còn chỗ giữ chỗ chưa điền', () => {
    expect(md).not.toMatch(/<\.\.\.>|TODO|FIXME/);
  });
});

describe('nội dung lý thuyết cả hai ngôn ngữ', () => {
  const CHAPTERS = [1, 2, 3, 4];

  it('mỗi chương có đủ bản vi và en, đều parse được', () => {
    for (const n of CHAPTERS) {
      for (const lang of ['vi', 'en']) {
        const text = load(`../src/content/theory-ch${n}.${lang}.md`);
        expect(text.length, `ch${n}.${lang}`).toBeGreaterThan(1000);
        expect(marked.parse(text, { async: false }).length).toBeGreaterThan(1000);
      }
    }
  });

  it('bản en không còn dấu tiếng Việt', () => {
    const viChars = /[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
    for (const n of CHAPTERS) {
      const bad = load(`../src/content/theory-ch${n}.en.md`)
        .split('\n').filter(l => viChars.test(l));
      expect(bad, `theory-ch${n}.en.md`).toEqual([]);
    }
  });

  it('hai bản có cùng số heading cấp 2', () => {
    for (const n of CHAPTERS) {
      const count = lang => (load(`../src/content/theory-ch${n}.${lang}.md`).match(/^## /gm) || []).length;
      expect(count('en'), `ch${n} lệch số mục`).toBe(count('vi'));
    }
  });

  it('không còn dùng tên biến A/B/C/D cho hàm Boolean', () => {
    for (const n of CHAPTERS) {
      for (const lang of ['vi', 'en']) {
        const text = load(`../src/content/theory-ch${n}.${lang}.md`);
        expect(/\bA['′]B\b|\bB['′]D['′]\b/.test(text), `ch${n}.${lang}`).toBe(false);
      }
    }
  });

  it('mỗi thẻ ngắn: tối đa 120 chữ hiển thị (không tính phần gập, code, bảng)', () => {
    for (const n of CHAPTERS) {
      for (const lang of ['vi', 'en']) {
        const { cards } = splitCards(load(`../src/content/theory-ch${n}.${lang}.md`));
        for (const c of cards) expect(visibleWords(c.body), `ch${n}.${lang} "${c.title}"`).toBeLessThanOrEqual(120);
      }
    }
  });

  it('mọi điểm kiến thức data-check trỏ tới một dạng (và nhãn) có thật', () => {
    const banks = { c1q: ch1, c2q: ch2, c3q: ch3, c4q: ch4 };
    for (const n of CHAPTERS) {
      for (const lang of ['vi', 'en']) {
        const text = load(`../src/content/theory-ch${n}.${lang}.md`);
        const keys = splitCards(text).cards.flatMap(c => pointKeys(c.body));
        expect(keys.length, `ch${n}.${lang}`).toBeGreaterThan(3);
        for (const key of keys) {
          const { prefix, kind, tag } = parseKey(key);
          expect(banks[prefix]?.KINDS, `ch${n}.${lang} ${key}`).toContain(kind);
          // có nhãn thì bộ sinh phải ra được câu mang đúng nhãn đó (ví dụ mẫu + tự làm của thẻ)
          if (tag) expect(makerFor(banks[prefix], key)(seededRandom(7)).review, `ch${n}.${lang} ${key}`).toBe(tag);
        }
      }
    }
  });

  it('đồ thị tiên quyết (data-needs): không chu trình, không trỏ vào điểm không có, VI và EN giống nhau', () => {
    const graphOf = lang => buildGraph(CHAPTERS.map(n => ({ ch: 'ch' + n, md: load(`../src/content/theory-ch${n}.${lang}.md`) })));
    const vi = graphOf('vi'), en = graphOf('en');
    expect(findCycle(vi)).toBeNull();
    expect(danglingNeeds(vi)).toEqual([]);
    expect(topoOrder(vi)).toHaveLength(vi.size);
    const shape = g => [...g.values()].map(n => [n.key, n.needs, n.ch, n.card]);
    expect(shape(en)).toEqual(shape(vi));
    // điểm nào cũng có đường về một điểm gốc (không có điểm "treo" chỉ vì khai báo sai tên)
    expect([...vi.values()].filter(n => n.needs.length).length).toBeGreaterThan(15);
  });

  it('link trong bài chỉ trỏ tới địa chỉ có thật (#/learn/chN/…, #/practice/chN…)', () => {
    for (const n of CHAPTERS) {
      for (const lang of ['vi', 'en']) {
        const text = load(`../src/content/theory-ch${n}.${lang}.md`);
        for (const [, href] of text.matchAll(/\]\((#[^)]*)\)/g)) {
          const r = parseRoute(href, ['ch1', 'ch2', 'ch3', 'ch4']);
          expect(r, `ch${n}.${lang}: ${href}`).not.toBeNull();
          expect(routeOf(r), `ch${n}.${lang}: viết theo dạng mới`).toBe(href);
        }
      }
    }
  });
});

describe('dạng câu → thẻ để ôn lại', () => {
  const BANKS = { ch1: ['c1q', ch1], ch2: ['c2q', ch2], ch3: ['c3q', ch3], ch4: ['c4q', ch4] };
  it('mọi dạng đều có thẻ dạy nó trong bài của chương mình, cùng vị trí ở VI và EN', () => {
    for (const [ch, [prefix, bank]] of Object.entries(BANKS)) {
      const vi = kindCards(load(`../src/content/theory-${ch}.vi.md`));
      const en = kindCards(load(`../src/content/theory-${ch}.en.md`));
      for (const k of bank.KINDS) {
        expect(vi.get(`${prefix}:${k}`), `${ch} ${k}`).toBeTypeOf('number');
        expect(en.get(`${prefix}:${k}`), `${ch} ${k}`).toBe(vi.get(`${prefix}:${k}`));
      }
    }
  });
});

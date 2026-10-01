import { makeGlossary } from '@shared/ui/glossary.js';
import theoryCh1Vi from '../content/theory-ch1.vi.md?raw';
import theoryCh1En from '../content/theory-ch1.en.md?raw';
import theoryCh2Vi from '../content/theory-ch2.vi.md?raw';
import theoryCh2En from '../content/theory-ch2.en.md?raw';
import theoryCh3Vi from '../content/theory-ch3.vi.md?raw';
import theoryCh3En from '../content/theory-ch3.en.md?raw';

/* Từ điển thuật ngữ của các máy giải Logic (từ khoá `gl.*` ở i18n, solver.js) + link tới thẻ bài học. */
const THEORY = { vi: { ch1: theoryCh1Vi, ch2: theoryCh2Vi, ch3: theoryCh3Vi }, en: { ch1: theoryCh1En, ch2: theoryCh2En, ch3: theoryCh3En } };

const ENTRIES = [
  ['comp', 'ch1', /số bù|complements/i], ['endcarry', 'ch1', /trừ bằng số bù|subtraction/i], ['overflow', 'ch1', /bù 2|two's/i],
  ['signbit', 'ch1', /nhị phân có dấu|signed/i], ['group', 'ch1', /bát phân|octal/i], ['carry'],
  ['minterm', 'ch2', /minterm/i], ['canon', 'ch2', /dạng chuẩn|canonical/i], ['demorgan', 'ch2', /demorgan/i], ['dual', 'ch2', /đối ngẫu|duality/i],
  ['pi', 'ch3', /prime implicant|prime and/i], ['epi', 'ch3', /prime implicant|prime and/i], ['dc', 'ch3', /không quan tâm|don't/i],
  ['nand', 'ch3', /nand/i], ['sop', 'ch2', /sop, pos|SOP, POS/i],
];

export const glossary = makeGlossary(ENTRIES, THEORY);

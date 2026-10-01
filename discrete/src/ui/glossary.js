import { makeGlossary } from '@shared/ui/glossary.js';
import theoryCh1Vi from '../content/theory-ch1.vi.md?raw';
import theoryCh1En from '../content/theory-ch1.en.md?raw';
import theoryCh3Vi from '../content/theory-ch3.vi.md?raw';
import theoryCh3En from '../content/theory-ch3.en.md?raw';
import theoryCh4Vi from '../content/theory-ch4.vi.md?raw';
import theoryCh4En from '../content/theory-ch4.en.md?raw';
import theoryCh6Vi from '../content/theory-ch6.vi.md?raw';
import theoryCh6En from '../content/theory-ch6.en.md?raw';
import theoryCh7Vi from '../content/theory-ch7.vi.md?raw';
import theoryCh7En from '../content/theory-ch7.en.md?raw';

/* Từ điển thuật ngữ của các máy giải Discrete (khoá `gl.*` ở i18n, solver.js) + link tới thẻ bài học. */
const THEORY = { vi: { ch1: theoryCh1Vi, ch3: theoryCh3Vi, ch4: theoryCh4Vi, ch6: theoryCh6Vi, ch7: theoryCh7Vi }, en: { ch1: theoryCh1En, ch3: theoryCh3En, ch4: theoryCh4En, ch6: theoryCh6En, ch7: theoryCh7En } };

const ENTRIES = [
  ['taut', 'ch1', /hằng đúng|tautology/i], ['equiv', 'ch1', /tương đương|equivalence/i], ['minterm'],
  ['setops', 'ch3', /Đếm phần tử|Counting/i], ['closed', 'ch4', /Công thức tổng|Sum formulas/i],
  ['gcd', 'ch6', /euclid/i], ['pulv', 'ch6', /pulverizer/i], ['lcm', 'ch6', /nguyên tố|primes/i],
  ['inv', 'ch7', /nghịch đảo|inverses/i], ['cong', 'ch7', /đồng dư$|congruence/i], ['sq', 'ch7', /lũy thừa|powers/i],
];

export const glossary = makeGlossary(ENTRIES, THEORY);

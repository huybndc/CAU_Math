import { onLangChange, getLang } from './i18n/index.js';
import { setupShell } from '@shared/ui/shell.js';
import { truthFigure } from '@shared/ui/figures.js';
import { kmapFigure } from './ui/kmap-figure.js';
import { gateFigure, circuitFigure, netFigure } from './ui/gate-svg.js';
import { kmapGroup, kmapPick } from './ui/kmap-widgets.js';
import * as ch1Quiz from './logic/ch1-quiz.js';
import * as ch2Quiz from './logic/ch2-quiz.js';
import * as ch3Quiz from './logic/ch3-quiz.js';
import * as ch4Quiz from './logic/ch4-quiz.js';
import { CHOICE_BANKS } from './logic/mcq-banks.js';
import { withConcepts } from '@shared/logic/concepts.js';
import concepts from './content/concepts.json';
import { setupGrayPage } from './ui/gray-page.js';
import { setupKmapPage } from './ui/kmap-page.js';
import { mountLesson } from '@shared/ui/lesson.js';
import { setupCh1ExamplePage } from './ui/ch1-example-page.js';
import theoryCh1Vi from './content/theory-ch1.vi.md?raw';
import theoryCh1En from './content/theory-ch1.en.md?raw';
import { setupCh1CodesPage } from './ui/ch1-codes-page.js';
import { setupCh1InteractivePage } from './ui/ch1-interactive-page.js';
import { setupCh2ExamplePage } from './ui/ch2-example-page.js';
import { setupCh2InteractivePage } from './ui/ch2-interactive-page.js';
import { setupCh4Tools } from './ui/ch4-tools.js';
import theoryCh2Vi from './content/theory-ch2.vi.md?raw';
import theoryCh2En from './content/theory-ch2.en.md?raw';
import theoryCh3Vi from './content/theory-ch3.vi.md?raw';
import theoryCh3En from './content/theory-ch3.en.md?raw';
import theoryCh4Vi from './content/theory-ch4.vi.md?raw';
import theoryCh4En from './content/theory-ch4.en.md?raw';

const THEORY = {
  vi: { ch1: theoryCh1Vi, ch2: theoryCh2Vi, ch3: theoryCh3Vi, ch4: theoryCh4Vi },
  en: { ch1: theoryCh1En, ch2: theoryCh2En, ch3: theoryCh3En, ch4: theoryCh4En },
};

window.addEventListener('DOMContentLoaded', () => {
  const figures = { truth: truthFigure, kmap: kmapFigure, gate: gateFigure, circuit: circuitFigure, net: netFigure };
  const widgets = { kmapGroup, kmapPick };
  // câu khái niệm đã duyệt (D27) thành thêm một dạng "Khái niệm" ở chương có câu
  const withCq = (bank, id) => withConcepts(bank, concepts.filter(c => c.chapter === id));
  const chapters = [
    { id: 'ch1', bank: withCq(ch1Quiz, 'ch1'), prefix: 'c1q', choiceBank: withCq(CHOICE_BANKS.c1q, 'ch1') },
    { id: 'ch2', bank: withCq(ch2Quiz, 'ch2'), prefix: 'c2q', choiceBank: withCq(CHOICE_BANKS.c2q, 'ch2') },
    { id: 'ch3', bank: withCq(ch3Quiz, 'ch3'), prefix: 'c3q', choiceBank: withCq(CHOICE_BANKS.c3q, 'ch3') },
    { id: 'ch4', bank: withCq(ch4Quiz, 'ch4'), prefix: 'c4q', choiceBank: withCq(CHOICE_BANKS.c4q, 'ch4') },
  ];
  setupShell({ chapters, figures, widgets, lesson: ch => THEORY[getLang()][ch] });
  setupGrayPage();
  setupKmapPage();
  setupCh1ExamplePage();
  setupCh1CodesPage();
  setupCh1InteractivePage();
  setupCh2ExamplePage();
  setupCh2InteractivePage();
  setupCh4Tools();
  const banks = Object.fromEntries(chapters.map(c => [c.prefix, c.bank]));
  const mountAllTheory = () => chapters.forEach(({ id }) =>
    mountLesson(document.querySelector(`#theory-${id}-body`), THEORY[getLang()][id], { chapter: id, banks, figures, widgets }));
  mountAllTheory();
  onLangChange(mountAllTheory);
  console.log('%cÔn tập Logic Circuit', 'font-weight:bold');
});

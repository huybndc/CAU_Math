import { onLangChange, getLang } from './i18n/index.js';
import { setupShell } from '@shared/ui/shell.js';
import { mountLesson } from '@shared/ui/lesson.js';
import * as ch1Quiz from './logic/ch1-quiz.js';
import * as ch2Quiz from './logic/ch2-quiz.js';
import * as ch3Quiz from './logic/ch3-quiz.js';
import { CHOICE_BANKS } from './logic/mcq-banks.js';
import { withConcepts } from '@shared/logic/concepts.js';
import concepts from './content/concepts.json';
import { FIGURES, WIDGETS } from './ui/quiz-figures.js';
import { setupCh1ExamplePage } from './ui/ch1-example-page.js';
import { setupCh1InteractivePage } from './ui/ch1-interactive-page.js';
import { setupCh2ExamplePage } from './ui/ch2-example-page.js';
import { setupCh2LinesPage } from './ui/ch2-lines-page.js';
import { setupCh2InteractivePage } from './ui/ch2-interactive-page.js';
import { setupCh3ExamplePage } from './ui/ch3-example-page.js';
import { setupCh3SpacesPage } from './ui/ch3-spaces-page.js';
import { setupCh3InteractivePage } from './ui/ch3-interactive-page.js';
import theoryCh1Vi from './content/theory-ch1.vi.md?raw';
import theoryCh1En from './content/theory-ch1.en.md?raw';
import theoryCh2Vi from './content/theory-ch2.vi.md?raw';
import theoryCh2En from './content/theory-ch2.en.md?raw';
import theoryCh3Vi from './content/theory-ch3.vi.md?raw';
import theoryCh3En from './content/theory-ch3.en.md?raw';

const THEORY = {
  vi: { ch1: theoryCh1Vi, ch2: theoryCh2Vi, ch3: theoryCh3Vi },
  en: { ch1: theoryCh1En, ch2: theoryCh2En, ch3: theoryCh3En },
};
// câu khái niệm lấy từ đề/bài có lời giải (D48) thành thêm một dạng "Khái niệm" ở chương có câu
const withCq = (bank, id) => withConcepts(bank, concepts.filter(c => c.chapter === id));
const CHAPTERS = [
  { id: 'ch1', bank: withCq(ch1Quiz, 'ch1'), prefix: 'c1q', choiceBank: withCq(CHOICE_BANKS.c1q, 'ch1') },
  { id: 'ch2', bank: withCq(ch2Quiz, 'ch2'), prefix: 'c2q', choiceBank: withCq(CHOICE_BANKS.c2q, 'ch2') },
  { id: 'ch3', bank: withCq(ch3Quiz, 'ch3'), prefix: 'c3q', choiceBank: withCq(CHOICE_BANKS.c3q, 'ch3') },
];
const banks = Object.fromEntries(CHAPTERS.map(c => [c.prefix, c.bank]));

window.addEventListener('DOMContentLoaded', () => {
  setupShell({ chapters: CHAPTERS, figures: FIGURES, widgets: WIDGETS, lesson: ch => THEORY[getLang()][ch] });
  setupCh1ExamplePage();
  setupCh1InteractivePage();
  setupCh2ExamplePage();
  setupCh2LinesPage();
  setupCh2InteractivePage();
  setupCh3ExamplePage();
  setupCh3SpacesPage();
  setupCh3InteractivePage();

  const mountAllTheory = () => {
    const d = THEORY[getLang()];
    Object.keys(d).forEach(ch => mountLesson(document.querySelector(`#theory-${ch}-body`), d[ch], { chapter: ch, banks, figures: FIGURES, widgets: WIDGETS }));
  };
  mountAllTheory();
  onLangChange(mountAllTheory);
  console.log('%cÔn tập Đại số tuyến tính', 'font-weight:bold');
});

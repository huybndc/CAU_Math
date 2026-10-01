import { onLangChange, getLang } from './i18n/index.js';
import { setupShell } from '@shared/ui/shell.js';
import { mountVectorSolver, mountComboSolver, mountSystemSolver, mountMatrixSolver, mountSpaceSolver } from './ui/solvers.js';
import { mountLesson } from '@shared/ui/lesson.js';
import { foldCards } from '@shared/ui/fold-cards.js';
import { CHAPTERS } from './logic/chapters.js';
import { FIGURES, WIDGETS } from './ui/quiz-figures.js';
import { setupCh1ExamplePage } from './ui/ch1-example-page.js';
import { setupCh2ExamplePage } from './ui/ch2-example-page.js';
import { setupCh2LinesPage } from './ui/ch2-lines-page.js';
import { setupCh3ExamplePage } from './ui/ch3-example-page.js';
import { setupCh3SpacesPage } from './ui/ch3-spaces-page.js';
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
const banks = Object.fromEntries(CHAPTERS.map(c => [c.prefix, c.bank]));

window.addEventListener('DOMContentLoaded', () => {
  setupShell({ chapters: CHAPTERS, figures: FIGURES, widgets: WIDGETS, lesson: ch => THEORY[getLang()][ch] });
  setupCh1ExamplePage();
  mountVectorSolver(document.getElementById('tool-vec'));
  mountComboSolver(document.getElementById('tool-combo'));
  setupCh2ExamplePage();
  setupCh2LinesPage();
  mountSystemSolver(document.getElementById('tool-system'));
  mountMatrixSolver(document.getElementById('tool-matrix'));
  setupCh3ExamplePage();
  setupCh3SpacesPage();
  mountSpaceSolver(document.getElementById('tool-space'));

  // trang Ví dụ / Công cụ: các thẻ xếp dọc ⇒ gập, chỉ thẻ đầu mở
  document.querySelectorAll('.pane[id$="-example"], .pane[id$="-interactive"]').forEach(foldCards);

  const mountAllTheory = () => {
    const d = THEORY[getLang()];
    Object.keys(d).forEach(ch => mountLesson(document.querySelector(`#theory-${ch}-body`), d[ch], { chapter: ch, banks, figures: FIGURES, widgets: WIDGETS }));
  };
  mountAllTheory();
  onLangChange(mountAllTheory);
  console.log('%cÔn tập Đại số tuyến tính', 'font-weight:bold');
});

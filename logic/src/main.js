import { onLangChange, getLang } from './i18n/index.js';
import { setupShell, shellReady } from '@shared/ui/shell.js';
import { truthFigure } from '@shared/ui/figures.js';
import { kmapFigure } from './ui/kmap-figure.js';
import { gateFigure, circuitFigure, netFigure } from './ui/gate-svg.js';
import { kmapGroup, kmapPick } from './ui/kmap-widgets.js';
import { CHAPTERS as chapters } from './logic/chapters.js';
import { setupGrayPage } from './ui/gray-page.js';
import { setupKmapPage } from './ui/kmap-page.js';
import { mountLesson } from '@shared/ui/lesson.js';
import { setupCh1ExamplePage } from './ui/ch1-example-page.js';
import theoryCh1Vi from './content/theory-ch1.vi.md?raw';
import theoryCh1En from './content/theory-ch1.en.md?raw';
import { setupCh1CodesPage } from './ui/ch1-codes-page.js';
import { setupCh2ExamplePage } from './ui/ch2-example-page.js';
import { setupCh2InteractivePage } from './ui/ch2-interactive-page.js';
import { mountBaseSolver, mountComplementSolver, mountSignedSolver, mountExprSolver } from './ui/solvers.js';
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
  setupShell({ chapters, figures, widgets, lesson: ch => THEORY[getLang()][ch] });
  setupGrayPage();
  setupKmapPage();
  setupCh1ExamplePage();
  setupCh1CodesPage();
  shellReady.then(() => {                      // sau khi tài khoản gắn xong (đọc được ô nhập đã nhớ)
    mountBaseSolver(document.getElementById('tool-base'));
    mountComplementSolver(document.getElementById('tool-compl'));
    mountSignedSolver(document.getElementById('tool-signed'));
    mountExprSolver(document.getElementById('tool-expr'));
  });
  setupCh2ExamplePage();
  setupCh2InteractivePage();
  const banks = Object.fromEntries(chapters.map(c => [c.prefix, c.bank]));
  const mountAllTheory = () => chapters.forEach(({ id }) =>
    mountLesson(document.querySelector(`#theory-${id}-body`), THEORY[getLang()][id], { chapter: id, banks, figures, widgets }));
  mountAllTheory();
  onLangChange(mountAllTheory);
  console.log('%cÔn tập Logic Circuit', 'font-weight:bold');
});

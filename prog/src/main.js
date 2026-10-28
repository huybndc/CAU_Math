import { onLangChange, getLang } from './i18n/index.js';
import { setupShell } from '@shared/ui/shell.js';
import { mountLesson } from '@shared/ui/lesson.js';
import { CHAPTERS } from './logic/chapters.js';
import { PROG_MOCK } from './logic/mock-exam.js';
import theoryCh7Vi from './content/theory-ch7.vi.md?raw';
import theoryCh7En from './content/theory-ch7.en.md?raw';

const THEORY = { vi: { ch7: theoryCh7Vi }, en: { ch7: theoryCh7En } };
const banks = Object.fromEntries(CHAPTERS.map(c => [c.prefix, c.bank]));

window.addEventListener('DOMContentLoaded', () => {
  setupShell({ chapters: CHAPTERS, figures: {}, widgets: {}, free: [], mock: PROG_MOCK, lesson: ch => THEORY[getLang()][ch] });
  const mountAllTheory = () => {
    const d = THEORY[getLang()];
    Object.keys(d).forEach(ch => mountLesson(document.querySelector(`#theory-${ch}-body`), d[ch], { chapter: ch, banks, figures: {} }));
  };
  mountAllTheory();
  onLangChange(mountAllTheory);
});

import { common } from './common.js';
import { ch1 } from './ch1.js';
import { ch2 } from './ch2.js';
import { ch3 } from './ch3.js';
import { quiz } from './quiz.js';
import { conceptDicts } from '@shared/logic/concepts.js';
import concepts from '../../content/concepts.json';

// câu khái niệm có nguồn (D48): chữ nằm trong concepts.json, khoá sinh tự động cho cả hai bản
const conceptLabels = Object.fromEntries([...new Set(concepts.map(c => c.chapter))].map(ch => [`c${ch.slice(2)}q.concept`, 'Concepts (why?)']));

export const en = { ...common, ...ch1, ...ch2, ...ch3, ...quiz, ...conceptLabels, ...conceptDicts(concepts).en };

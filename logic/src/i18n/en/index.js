import { common } from './common.js';
import { ch1 } from './ch1.js';
import { ch2 } from './ch2.js';
import { ch3 } from './ch3.js';
import { ch4 } from './ch4.js';
import { quiz } from './quiz.js';
import { conceptDicts } from '@shared/logic/concepts.js';
import concepts from '../../content/concepts.json';

// câu khái niệm đã duyệt (D27): chữ nằm trong concepts.json, khoá sinh tự động cho cả hai bản

export const en = { ...common, ...ch1, ...ch2, ...ch3, ...ch4, ...quiz, ...conceptDicts(concepts).en };

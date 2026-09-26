/* ---------------------------------------------------------------
   PROMPT + SCHEMA gửi Gemini (D27). Thuần — test được.
   Nguyên tắc soạn (RESEARCH.md, D22): câu hỏi phải nói rõ hỏi gì; nhiễu là LỖI THẬT
   sinh viên hay mắc; mỗi phương án có một dòng vì sao đúng/sai; câu dựa trên phép
   tính thì kèm `check` để máy kiểm lại (Gemini tính sai là bị loại).
   --------------------------------------------------------------- */

import { TYPES } from '../../shared/logic/concepts.js';
import { SUBJECT_TOPICS } from './topics.js';

const TYPE_GUIDE = {
  why: 'WHY question: asks for the reason a rule/procedure works or is needed (e.g. why remainders are read bottom-up).',
  trap: 'COMMON-MISTAKE question: shows a short student claim or worked line and asks which statement about it is correct, or which of four claims is FALSE. Distractors are the misconceptions themselves.',
  apply: 'SMALL APPLICATION: a concrete case solvable in under a minute by hand, testing understanding rather than long arithmetic. MUST include a check.',
  compare: 'COMPARE question: two methods/notions side by side (e.g. dual vs complement, SOP vs POS cost) and asks what really differs.',
};

// Mỗi loại check và ví dụ — phải khớp logic/src/logic/concept-check.js
const CHECK_GUIDE = {
  logic: [
    '{"type":"equiv","a":"x + x\'y","b":"x + y","same":true}   (are two Boolean expressions equivalent)',
    '{"type":"minterms","expr":"xy + z","list":[1,3,5,6,7]}   (minterms where expr = 1; variables x,y,z)',
    '{"type":"literals","minterms":[0,2,5,7],"dontcares":[],"n":3,"form":"sop","count":4}   (literal count of the minimal SOP/POS)',
    '{"type":"convert","value":"101.01","from":2,"to":10,"result":"5.25"}',
    '{"type":"complement","value":"0110","radix":2,"diminished":false,"result":"1010"}   (diminished=true for the (r-1)\'s complement)',
    '{"type":"signed","bits":"11111010","format":"twos","value":-6}   (format: magnitude | ones | twos)',
    '{"type":"gray","bin":"1011","gray":"1110"}',
  ],
};

const LANG_SCHEMA = {
  type: 'OBJECT',
  properties: {
    q: { type: 'STRING' },
    options: { type: 'ARRAY', items: { type: 'STRING' } },
    why: { type: 'ARRAY', items: { type: 'STRING' } },
    explain: { type: 'STRING' },
  },
  required: ['q', 'options', 'why', 'explain'],
};

/** Schema trả lời (OpenAPI subset của Gemini). `check_json` là chuỗi JSON (schema Gemini không cho object tự do). */
export const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          section: { type: 'STRING' },
          type: { type: 'STRING', enum: TYPES },
          answer: { type: 'INTEGER' },
          vi: LANG_SCHEMA,
          en: LANG_SCHEMA,
          check_json: { type: 'STRING' },
        },
        required: ['section', 'type', 'answer', 'vi', 'en', 'check_json'],
      },
    },
  },
  required: ['items'],
};

/**
 * @param {{ subject: string, section: {id, title, focus}, n: number, types?: string[], avoid?: string[] }} o
 *   avoid: đề (EN) của các câu đã có ở mục này — để không soạn trùng
 */
export function buildPrompt({ subject, section, n, types = TYPES, avoid = [] }) {
  const t = SUBJECT_TOPICS[subject];
  const checks = CHECK_GUIDE[subject];
  return [
    `You write multiple-choice CONCEPT questions for a first-year university course, following the textbook ${t.book}, section ${section.id} "${section.title}".`,
    `Students often get this wrong: ${section.focus}.`,
    'An automatic generator already drills routine calculations, so your questions must test UNDERSTANDING: reasons, misconceptions, comparisons, small applications.',
    '',
    `Write exactly ${n} questions. Spread them over these types:`,
    ...types.map(k => `- ${k}: ${TYPE_GUIDE[k]}`),
    '',
    'Rules for every question:',
    '- Exactly 4 options, exactly ONE correct. "answer" is the 0-based index of the correct option.',
    '- Every wrong option is a mistake real students make (wrong rule, swapped definition, off-by-one step), never an absurd filler. No "all/none of the above".',
    '- The correct option must NOT be the longest one: keep it a short claim (the reasoning goes in "why"); options should be about the same length.',
    '- The stem says clearly what is asked. Stem <= 45 words, each option <= 20 words, each "why" line <= 35 words, "explain" <= 50 words.',
    '- why[i] explains in one sentence why option i is correct or wrong (the specific mistake). Do not start it with "Correct:" or "Wrong:" (the app adds that). "explain" gives the key idea behind the correct answer.',
    '- Write each question twice: "vi" in natural Vietnamese for Vietnamese students (keep standard English technical terms in parentheses the first time, e.g. "số bù 2 (2\'s complement)"), and "en" in English. Options must be in the SAME order in both languages. The "en" text must contain no Vietnamese.',
    `- Notation: ${t.notation}`,
    '- Do not use the characters { } < > anywhere (write sets with parentheses). Use backticks for bit strings or code, e.g. `1011`.',
    '- Your own original wording. Do not copy textbook sentences or exercises.',
    `- "section" must be "${section.id}".`,
    checks
      ? ['- If the correct answer depends on a calculation, put ONE verifiable claim in "check_json" as a JSON string, using one of these forms:',
        ...checks.map(c => '    ' + c),
        '  The check must state the TRUE fact on which the correct option rests (it is re-computed by a program; a wrong check rejects the question). Otherwise set "check_json" to "".'].join('\n')
      : '- Set "check_json" to "" (no calculation checks for this subject yet), so prefer why / trap / compare questions without arithmetic.',
    avoid.length ? `\nQuestions that ALREADY exist for this section (do not repeat their idea):\n${avoid.map(s => '- ' + s).join('\n')}` : '',
  ].join('\n');
}

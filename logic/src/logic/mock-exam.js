/* ---------------------------------------------------------------
   PRACTICE FINAL EXAM (Logic Circuit), pure. The midterm covered Ch1–4, and the final does not repeat midterm question types
   (learner, 2026-11-22). Scope = Ch5 slides only: §5.3–5.4 latches and flip-flops, §5.5 analysis of clocked circuits,
   §5.7 state reduction and assignment, §5.8 design procedure. Form follows the real midterm (D75): few questions with many parts,
   easy to hard, all-or-nothing per part. 4 questions, 200 points: flip-flop 40, state reduction 40, analysis 60, design or counter 60.
   Question makers are in mock-seq.js. The Ch3–4 questions (K-map design, BCD adder, comparator) are in git history.
   --------------------------------------------------------------- */
import { makeFlipFlop, makeSeqAnalysis, makeStateReduction, makeSeqDesign, makeCounterDesign } from './mock-seq.js';

// Each slot draws one question type.
const pick = makers => rnd => makers[Math.floor(rnd() * makers.length)](rnd);
// Scale the part points of a question to a new total. The last part takes the rounding rest.
const scaleTo = (total, maker) => rnd => {
  const q = maker(rnd), sum = q.parts.reduce((s, p) => s + p.pts, 0);
  let left = total;
  const parts = q.parts.map((p, i) => {
    const pts = i === q.parts.length - 1 ? left : Math.round((p.pts * total) / sum);
    left -= pts;
    return { ...p, pts };
  });
  return { ...q, parts };
};
// The teacher gives no partial marks: each part has one marking row that lists what must all be right.
const allOrNothing = maker => rnd => {
  const q = maker(rnd);
  return { ...q, parts: q.parts.map(p => ({ ...p, rubric: [[p.pts, `all of: ${p.rubric.map(([, step]) => step).join('; ')}`]] })) };
};

export const LOGIC_MOCK = {
  id: 'logic', title: 'Logic Circuit — Practice Final Exam',
  book: 'M. Morris Mano, Digital Design (6th ed.)',
  note: 'Marking (as on the real midterm): each part is all or nothing. Label every input, output and signal of a circuit. Write the work and the answer.',
  minutesPerPoint: 60 / 200,
  makers: [scaleTo(40, makeFlipFlop), scaleTo(40, makeStateReduction), makeSeqAnalysis, pick([makeSeqDesign, makeCounterDesign])].map(allOrNothing),
};

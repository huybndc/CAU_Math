/* Practice final exam template for Discrete Math (D75). Scope: class after the midterm, including counting rules.
   Form follows the midterm: definitions and lemmas, short answers, one applied question, and one proof. */
import { makeDefinitions, makeShortAnswers, makeAnnuity, makeSumBounds, makeCounting, makeProof } from './mock-final.js';

// Section numbers follow MCS (MIT 6.042J, 2017). Each maker gives its own refs.
export const DISCRETE_MOCK = {
  id: 'discrete', title: 'Discrete Math — Practice Final Exam',
  book: 'Lehman, Leighton, Meyer, Mathematics for Computer Science (MIT 6.042J, 2017 ed.)',
  minutesPerPoint: 60 / 200,
  makers: [makeDefinitions, makeShortAnswers, rnd => [makeAnnuity, makeSumBounds, makeCounting][Math.floor(rnd() * 3)](rnd), makeProof],
  refs: [null, null, null, null],
};

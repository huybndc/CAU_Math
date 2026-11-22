/* Practice final exam template for Discrete Math (D75). Scope: class after the midterm (networks, Euler tours, digraphs, relations, sums, integral bounds, asymptotic notation, recursion).
   Form follows the midterm: definitions, short answers, one proof: the Beneš proof by induction is favored (weight 0.4), else one of four other proofs. The midterm template is in git history before D75. */
import { makeDefinitions, makeShortAnswers, makeAnnuity, makeSumBounds, makeProof } from './mock-final.js';

// Section numbers follow MCS (MIT 6.042J, 2017). Each maker gives its own refs.
export const DISCRETE_MOCK = {
  id: 'discrete', title: 'Discrete Math — Practice Final Exam',
  book: 'Lehman, Leighton, Meyer, Mathematics for Computer Science (MIT 6.042J, 2017 ed.)',
  minutesPerPoint: 60 / 200,
  makers: [makeDefinitions, makeShortAnswers, rnd => (rnd() < 0.5 ? makeAnnuity : makeSumBounds)(rnd), makeProof],
  refs: [null, null, null, null],
};

/* Practice final exam template for Linear Algebra (D75). Scope: class after the midterm (Strang 3.5–4.3).
   The midterm template (9 questions, Ch1–3) is in git history before D75. */
import { makeIndependence, makeFourSubspaces, makeProjLine, makeProjPlane, makeLeastSquares } from './mock-final.js';

// Real exam: 120 minutes for 200 points ⇒ 0.6 minutes per point.
export const LINALG_MOCK = {
  id: 'linalg', title: 'Linear Algebra — Practice Final Exam',
  // Section numbers follow the 4th edition (2009).
  book: 'Gilbert Strang, Introduction to Linear Algebra (4th ed.)',
  minutesPerPoint: 120 / 200,
  makers: [makeIndependence, makeFourSubspaces, makeProjLine, makeProjPlane, makeLeastSquares],
  refs: [
    [['3.5', 'Independence, Basis and Dimension']],
    [['3.6', 'Dimensions of the Four Subspaces'], ['4.1', 'Orthogonality of the Four Subspaces']],
    [['4.2', 'Projections']],
    [['4.2', 'Projections']],
    [['4.3', 'Least Squares Approximations']],
  ],
};

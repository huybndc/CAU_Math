export const ch1 = {
  /* Examples — vector addition */
  'c1.addTitle': 'Adding vectors: tip to tail and the parallelogram',
  'c1.addNote': 'Change the coordinates and hit replay to watch w slide to the tip of v — where it stops is v + w, which is also the diagonal of the parallelogram.',
  'c1.step0': 'Draw v from the origin.',
  'c1.step1': 'Slide w to the tip of v (a vector does not change when you translate it).',
  'c1.step2': 'Where it stops is v + w — also the diagonal of the parallelogram built from v and w.',

  /* Examples — dot product */
  'c1.dotTitle': 'The dot product seen as a projection',
  'c1.dotNote': 'Rotate v around the origin and watch the sign of v·w. The green arrow is the projection of v onto w; the dashed line is the perpendicular drop.',
  'c1.rotate': 'Rotate v',
  'c1.signPos': 'v·w > 0 — acute angle',
  'c1.signZero': 'v·w = 0 — perpendicular',
  'c1.signNeg': 'v·w < 0 — obtuse angle',
  'c1.whyPos': 'The projection of v points the same way as w, so the dot product is positive.',
  'c1.whyZero': 'The projection shrinks to a point at the origin: v has no part running along w.',
  'c1.whyNeg': 'The projection of v points opposite to w, so the dot product is negative.',

  /* Interactive — dragging */
  'c1.exercise.title': 'Interactive exercise: find the missing vector',
  'c1.exercise.prompt': 'Given u = (2, 1) and target t = (3, 3), predict v so that u + v = t. Write your prediction before viewing the figure.',
  'c1.exercise.guess': 'Predict v',
  'c1.exercise.show': 'Compare prediction and open figure',
  'c1.exercise.invalid': 'Enter exactly two coordinates, for example 1, 2.',
  'c1.exercise.guessCorrect': 'Correct prediction. Now build the vector on the grid.',
  'c1.exercise.guessWrong': 'Not quite. You can drag the vector or reveal a hint.',
  'c1.exercise.dragHint': 'Drag the blue arrow tip or enter its coordinates below.',
  'c1.exercise.answer': 'Coordinates of v',
  'c1.exercise.check': 'Check vector',
  'c1.exercise.correct': 'Correct: u + v = t.',
  'c1.exercise.mistakeAdd': 'You added u to the target. Find the missing part by subtracting u from the target.',
  'c1.exercise.wrong': 'Not yet. Compare each coordinate of u + v with the target.',
  'c1.exercise.hint': 'Hint',
  'c1.exercise.hint1': 'Think of u + v = t as a route: u has already covered part of it.',
  'c1.exercise.hint2': 'Find the remaining part by subtracting: v = t − u.',
  'c1.exercise.hint3': 'Subtract each coordinate: v = (3 − 2, 3 − 1).',
  'c1.exercise.hintsDone': 'All hints are visible.',

  /* Interactive — linear combinations */

  /* shared readout labels */
  'c1.lblSum': 'v + w',
  'c1.lblLenV': '‖v‖',
  'c1.lblLenW': '‖w‖',
  'c1.lblDot': 'v · w',
  'c1.lblAngle': 'Angle (v, w)',
  'c1.lblCos': 'cos θ',
  'c1.lblProj': 'Projection of v onto w',
  'c1.errVec': 'Coordinates must be two numbers, for example 3, 1.',

};

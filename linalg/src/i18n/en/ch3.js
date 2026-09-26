export const ch3 = {
  /* Examples — how a span grows */
  'c3.growTitle': 'How a span grows',
  'c3.growNote': 'Step through to watch the span change shape as vectors are added. Drag on the picture to rotate, scroll to zoom.',
  'c3.orbitHint': 'Drag to rotate · scroll to zoom',
  'c3.growStep0': 'One nonzero vector: the span is a line through the origin — every multiple c·v₁ lies on it.',
  'c3.growStep1': 'Add v₂, not on the same line: the span opens into a plane through the origin, holding every combination c₁v₁ + c₂v₂.',
  'c3.growStep2': 'Add v₃ = v₁ + v₂: v₃ was already inside that plane, so the span does NOT change. Adding a dependent vector never widens a span.',
  'c3.growStep3': 'Replace v₃ with a vector off the plane: now there are three independent directions and the span fills all of R³.',

  /* Examples — column space and null space */
  'c3.spacesTitle': 'Column space and null space of one matrix',
  'c3.spacesNote': 'C(A) is the span of the columns of A, N(A) is the solution set of Ax = 0. Both are drawn in one picture to show how different they are.',
  'c3.preset': 'Sample matrix:',
  'c3.presetRank1': 'rank 1 — all three columns on one line',
  'c3.presetRank2': 'rank 2 — one redundant column',
  'c3.presetRank3': 'rank 3 — three independent columns',
  'c3.rankLaw': 'rank(A) + dim N(A) = {rank} + {nul} = {cols} = number of columns ✔',
  'c3.whyRank3': 'Three independent columns, so C(A) fills R³, and only x = 0 gives Ax = 0 — the null space shrinks to a point.',
  'c3.whyRank2': 'One column is built from the other two, so C(A) is only a plane, while the null space is the line recording exactly that dependency.',
  'c3.whyRank1': 'All three columns lie on one line, so C(A) is only a line, while the null space opens up into a plane.',
  'c3.lblColSpace': 'C(A) — column space',
  'c3.lblNullSpace': 'N(A) — null space',
  'c3.lblRank': 'rank(A)',
  'c3.lblDimCol': 'dim C(A)',
  'c3.lblDimNull': 'dim N(A)',
  'c3.lblBasisCol': 'Basis of C(A)',
  'c3.lblBasisNull': 'Basis of N(A)',
  'c3.errMatrix': 'Entries must be numbers, for example 2 or -1.5.',

  /* Interactive */
  'c3.dragTitle': 'Drag vectors in R³ and watch the span change',
  'c3.dragNote': 'Drag an arrow tip to change a vector, drag empty space to rotate the view. The vector b (green) is there to test whether it lies in the span.',
  'c3.dragHint3d': 'Drag a tip · drag the background to rotate · scroll to zoom',
  'c3.vecCount': 'Vectors:',
  'c3.showB': 'Show vector b',
  'c3.showPatch': 'Shade the span',
  'c3.inSpanYes': 'b is in the span',
  'c3.inSpanNo': 'b is not in the span',
  'c3.whyInSpan': 'c₁v₁ + … = b is solvable, with coefficients {coefs}.',
  'c3.whyNotInSpan': 'The system c₁v₁ + … = b has no solution — b sticks out of this subspace.',
  'c3.lblSpanKind': 'span',
  'c3.lblDim': 'Dimension',
  'c3.lblIndep': 'Linearly independent',
  'c3.yes': 'yes',
  'c3.no': 'no',

  /* names of the four kinds of subspace — shared across the chapter */
  'c3.kindPoint': 'a point (the origin)',
  'c3.kindLine': 'a line through the origin',
  'c3.kindPlane': 'a plane through the origin',
  'c3.kindSpace': 'all of R³',

};

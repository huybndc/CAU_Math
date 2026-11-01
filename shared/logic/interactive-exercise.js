const isPair = a => Array.isArray(a) && a.length === 2 && a.every(Number.isFinite);
const samePair = (a, b) => isPair(a) && isPair(b) && a.every((x, i) => x === b[i]);

/** Judge an answer from a data-backed interactive exercise. */
export function assessInteractiveAnswer(exercise, answer) {
  if (!isPair(answer)) return { status: 'invalid' };
  if (samePair(answer, exercise.answer)) return { status: 'correct' };
  const mistake = exercise.commonMistakes?.find(item => samePair(answer, item.answer));
  return mistake ? { status: 'misconception', feedback: mistake.feedback }
    : { status: 'incorrect' };
}

/** Return one hint at a time. Exhausting hints never changes score or progress. */
export function nextInteractiveHint(exercise, shown) {
  return exercise?.hints?.[shown] ?? null;
}

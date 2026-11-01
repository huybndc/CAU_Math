import { describe, expect, it } from 'vitest';
import { VECTOR_EXERCISES } from '../../linalg/src/content/interactive-exercises.js';
import { assessInteractiveAnswer, nextInteractiveHint } from '../logic/interactive-exercise.js';
import { vi } from '../../linalg/src/i18n/vi/index.js';
import { en } from '../../linalg/src/i18n/en/index.js';

/* Independent oracle: solve fixed + answer = target without importing app math. */
const expectedVector = ({ widget: { fixed, target } }) => [
  target[0] - fixed[0],
  target[1] - fixed[1],
];

describe('data-backed interactive exercises', () => {
  it('each exercise has a valid widget, one independently checked answer, and ordered hints', () => {
    const ids = new Set();
    for (const exercise of VECTOR_EXERCISES) {
      expect(ids.has(exercise.id)).toBe(false);
      ids.add(exercise.id);
      expect(exercise.widget.type).toBe('vector-drag');
      expect(exercise.answer).toEqual(expectedVector(exercise));
      expect(exercise.commonMistakes.every(x => x.answer.length === 2)).toBe(true);
      expect(exercise.hints.length).toBeGreaterThan(0);
      for (const key of [exercise.prompt, ...exercise.hints, ...exercise.commonMistakes.map(x => x.feedback)]) {
        expect(key in vi, `missing VI key: ${key}`).toBe(true);
        expect(key in en, `missing EN key: ${key}`).toBe(true);
      }
    }
  });

  it('distinguishes correct, common mistaken, and other answers', () => {
    const exercise = VECTOR_EXERCISES[0];
    expect(assessInteractiveAnswer(exercise, [1, 2])).toEqual({ status: 'correct' });
    expect(assessInteractiveAnswer(exercise, [5, 4])).toEqual({
      status: 'misconception', feedback: 'c1.exercise.mistakeAdd',
    });
    expect(assessInteractiveAnswer(exercise, [0, 1])).toEqual({ status: 'incorrect' });
    expect(assessInteractiveAnswer(exercise, [1])).toEqual({ status: 'invalid' });
  });

  it('reveals hints one at a time and then stops', () => {
    const exercise = VECTOR_EXERCISES[0];
    expect(nextInteractiveHint(exercise, 0)).toBe('c1.exercise.hint1');
    expect(nextInteractiveHint(exercise, 2)).toBe('c1.exercise.hint3');
    expect(nextInteractiveHint(exercise, 3)).toBeNull();
  });
});

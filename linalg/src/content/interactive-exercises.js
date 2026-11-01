/* Bài tương tác là dữ liệu. Test oracle độc lập kiểm đáp án theo phép toán. */
export const VECTOR_EXERCISES = [
  {
    id: 'vector-add-missing-part',
    prompt: 'c1.exercise.prompt',
    widget: {
      type: 'vector-drag',
      fixed: [2, 1],
      target: [3, 3],
      initial: [0, 0],
      step: 1,
    },
    answer: [1, 2],
    commonMistakes: [
      { answer: [5, 4], feedback: 'c1.exercise.mistakeAdd' },
    ],
    hints: [
      'c1.exercise.hint1',
      'c1.exercise.hint2',
      'c1.exercise.hint3',
    ],
  },
];

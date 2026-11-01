import { assessInteractiveAnswer, nextInteractiveHint } from '@shared/logic/interactive-exercise.js';
import { parseNumbers } from '../logic/answer-check.js';
import { fmtVec } from '../logic/num-format.js';
import { createBoard, clear, grid, axes } from './canvas2d.js';
import { drawHandle, drawVector } from './vector-draw.js';
import { enableDrag } from './drag.js';
import { el, renderReadout } from './dom-helpers.js';
import { onLangChange, t as T } from '../i18n/index.js';

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];

function draw(board, exercise, state) {
  const { fixed, target } = exercise.widget;
  const sum = add(fixed, state.vector);
  clear(board);
  grid(board, 1);
  axes(board, 1);
  drawVector(board, [0, 0], target, { color: '--ok', dash: [5, 4], text: 't' });
  drawVector(board, [0, 0], fixed, { color: '--warn', text: 'u' });
  drawVector(board, [0, 0], state.vector, { color: '--accent', text: 'v', width: 3 });
  drawHandle(board, state.vector, { color: '--accent' });
  drawVector(board, [0, 0], sum, { color: '--proj', text: 'u + v', width: 2, dash: [3, 4] });
  renderReadout(state.readout, [
    ['u', fmtVec(fixed)],
    ['v', fmtVec(state.vector), 'v1'],
    ['u + v', fmtVec(sum), 'sum'],
    ['t', fmtVec(target)],
  ]);
}

/** Mount one vector-drag exercise. The learner predicts before the canvas appears. */
export function mountVectorExercise(host, exercise) {
  const prompt = el('p', 'hint', T(exercise.prompt));
  const form = el('form', 'ix-prediction');
  const guessLabel = el('label', 'ix-field');
  const guessInput = el('input', 'mono');
  guessInput.type = 'text';
  guessInput.autocomplete = 'off';
  guessInput.spellcheck = false;
  guessInput.placeholder = '1, 2';
  const guessText = document.createTextNode(T('c1.exercise.guess'));
  guessLabel.append(guessText, guessInput);
  const showButton = el('button', 'btn primary', T('c1.exercise.show'));
  showButton.type = 'submit';
  form.append(guessLabel, showButton);
  const guessFeedback = el('p', 'small ix-feedback');
  guessFeedback.setAttribute('role', 'status');
  guessFeedback.setAttribute('aria-live', 'polite');

  const stage = el('div', 'ix-stage');
  stage.hidden = true;
  const instruction = el('p', 'small hint-drag', T('c1.exercise.dragHint'));
  const canvasHost = el('div', 'board ix-board');
  const canvas = el('canvas');
  canvas.setAttribute('aria-label', T('c1.exercise.dragHint'));
  canvasHost.append(canvas, instruction);
  const side = el('div', 'side ix-side');
  const readout = el('dl', 'readout ix-readout');
  const answerLabel = el('label', 'ix-field');
  const answerText = document.createTextNode(T('c1.exercise.answer'));
  const answerInput = el('input', 'mono');
  answerInput.type = 'text';
  answerInput.autocomplete = 'off';
  answerInput.spellcheck = false;
  answerInput.value = fmtVec(exercise.widget.initial);
  answerLabel.append(answerText, answerInput);
  const checkButton = el('button', 'btn primary', T('c1.exercise.check'));
  checkButton.type = 'button';
  const result = el('p', 'small ix-feedback');
  result.setAttribute('role', 'status');
  result.setAttribute('aria-live', 'polite');
  const hintButton = el('button', 'btn', T('c1.exercise.hint'));
  hintButton.type = 'button';
  const hint = el('p', 'small muted ix-feedback');
  hint.setAttribute('role', 'status');
  side.append(readout, answerLabel, checkButton, result, hintButton, hint);
  const row = el('div', 'boardrow ix-row');
  row.append(canvasHost, side);
  stage.append(row);
  host.replaceChildren(prompt, form, guessFeedback, stage);

  const state = { vector: [...exercise.widget.initial], board: null, readout, shownHints: 0 };
  const updateAnswer = vector => {
    state.vector = vector;
    answerInput.value = fmtVec(vector);
    if (state.board) draw(state.board, exercise, state);
  };
  const showStage = () => {
    if (state.board) return;
    stage.hidden = false;
    state.board = createBoard(canvas, { span: 5, onRedraw: b => draw(b, exercise, state) });
    enableDrag(state.board, () => [state.vector], (_i, vector) => updateAnswer(vector), {
      step: exercise.widget.step,
    });
    draw(state.board, exercise, state);
  };
  const assess = vector => {
    const verdict = assessInteractiveAnswer(exercise, vector);
    result.textContent = verdict.status === 'correct' ? T('c1.exercise.correct')
      : verdict.status === 'misconception' ? T(verdict.feedback) : T('c1.exercise.wrong');
    result.classList.toggle('ok', verdict.status === 'correct');
    result.classList.toggle('bad', verdict.status !== 'correct');
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    const guess = parseNumbers(guessInput.value);
    if (!guess || guess.length !== 2) {
      guessFeedback.textContent = T('c1.exercise.invalid');
      return;
    }
    const verdict = assessInteractiveAnswer(exercise, guess);
    guessFeedback.textContent = verdict.status === 'correct'
      ? T('c1.exercise.guessCorrect') : T('c1.exercise.guessWrong');
    showStage();
  });
  answerInput.addEventListener('change', () => {
    const vector = parseNumbers(answerInput.value);
    if (!vector || vector.length !== 2) {
      result.textContent = T('c1.exercise.invalid');
      return;
    }
    updateAnswer(vector);
  });
  answerInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); answerInput.blur(); }
  });
  checkButton.addEventListener('click', () => assess(state.vector));
  hintButton.addEventListener('click', () => {
    const next = nextInteractiveHint(exercise, state.shownHints);
    if (!next) { hint.textContent = T('c1.exercise.hintsDone'); return; }
    state.shownHints++;
    hint.textContent = T(next);
  });

  const updateLanguage = () => {
    prompt.textContent = T(exercise.prompt);
    guessText.textContent = T('c1.exercise.guess');
    showButton.textContent = T('c1.exercise.show');
    instruction.textContent = T('c1.exercise.dragHint');
    canvas.setAttribute('aria-label', T('c1.exercise.dragHint'));
    answerText.textContent = T('c1.exercise.answer');
    checkButton.textContent = T('c1.exercise.check');
    hintButton.textContent = T('c1.exercise.hint');
  };
  onLangChange(updateLanguage);
}

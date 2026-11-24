/* Final-exam questions for Mano Chapters 6–7: registers and memory. Pure generator data is kept in facts for independent oracle tests. */
import { table } from './mock-tex.js';

const r = String.raw;
const pick = (xs, rnd) => xs[Math.floor(rnd() * xs.length)];
const bits = n => n.toString(2).padStart(4, '0').split('').map(Number);
const word = xs => xs.join('');

const applyRegister = (state, op) => {
  if (op.mode === 'hold') return state.slice();
  if (op.mode === 'right') return [op.serial, state[0], state[1], state[2]];
  if (op.mode === 'left') return [state[1], state[2], state[3], op.serial];
  return op.parallel.slice();
};

export function makeRegister(rnd) {
  const initial = bits(Math.floor(rnd() * 16));
  const modes = ['hold', 'right', 'left', 'load'];
  const controls = { hold: '00', right: '01', left: '10', load: '11' };
  const ops = Array.from({ length: 4 }, (_, i) => {
    const mode = modes[(Math.floor(rnd() * modes.length) + i) % modes.length];
    return {
      mode,
      control: controls[mode],
      serial: Math.floor(rnd() * 2),
      parallel: bits(Math.floor(rnd() * 16)),
    };
  });
  let state = initial.slice();
  const trace = ops.map(op => {
    const before = state;
    state = applyRegister(state, op);
    return { ...op, before, after: state };
  });
  const opText = op => op.mode === 'load' ? `${op.control}: P=${word(op.parallel)}` : `${op.control}: SI=${op.serial}`;
  return {
    stem: r`A 4-bit universal register has outputs $Q_3Q_2Q_1Q_0$, two select inputs $S_1S_0$, right-shift input $SR$, left-shift input $SL$, and parallel inputs $P_3P_2P_1P_0$.`,
    parts: [
      { pts: 10, q: r`Write its operation table for $S_1S_0=00,01,10,11$: hold, shift right, shift left, and parallel load.`,
        a: [r`$${table(['S_1S_0', '\\text{operation}', 'Q_3^+Q_2^+Q_1^+Q_0^+'], [
          ['00', r`\text{hold}`, 'Q_3Q_2Q_1Q_0'],
          ['01', r`\text{shift right}`, 'SR\\,Q_3Q_2Q_1'],
          ['10', r`\text{shift left}`, 'Q_2Q_1Q_0\\,SL'],
          ['11', r`\text{parallel load}`, 'P_3P_2P_1P_0'],
        ])}$`],
        rubric: [[10, 'all four operations and next states']], facts: { kind: 'register-table' } },
      { pts: 15, q: r`Write the D-input equation for each flip-flop using one 4-to-1 multiplexer per bit.`,
        a: [
          r`$D_3=S_1'S_0'Q_3+S_1'S_0SR+S_1S_0'Q_2+S_1S_0P_3$`,
          r`$D_2=S_1'S_0'Q_2+S_1'S_0Q_3+S_1S_0'Q_1+S_1S_0P_2$`,
          r`$D_1=S_1'S_0'Q_1+S_1'S_0Q_2+S_1S_0'Q_0+S_1S_0P_1$`,
          r`$D_0=S_1'S_0'Q_0+S_1'S_0Q_1+S_1S_0'SL+S_1S_0P_0$`,
        ],
        rubric: [[15, 'all four multiplexer equations']], facts: { equations: true } },
      { pts: 15, q: r`The initial state is $Q_3Q_2Q_1Q_0=${word(initial)}$. Apply these clock operations in order: $${ops.map(opText).join(',\\ ')}$. Give the state after each edge.`,
        a: [r`$${table(['\\text{edge}', 'S_1S_0', '\\text{operation}', 'Q_3Q_2Q_1Q_0'], trace.map((t, i) => [String(i + 1), t.control, `\\text{${t.mode}}`, word(t.after)]))}$`],
        rubric: [[15, 'all four states in order']], facts: { initial, ops, trace } },
    ],
    refs: [['6.1', 'Registers'], ['6.2', 'Shift Registers']],
  };
}

const canonical = mins => mins.length ? mins.map(m => `m_${m}`).join(' + ') : '0';

export function makeMemory(rnd) {
  const addressBits = pick([4, 5, 6], rnd), width = pick([4, 8], rnd);
  const words = 2 ** addressBits, capacity = words * width;
  const chipWords = words / 2, chipWidth = width / 2, chips = 4;
  const minterms = [0, 1, 2, 3, 4, 5, 6, 7].sort(() => rnd() - 0.5);
  const y0 = minterms.slice(0, 3).sort((a, b) => a - b), y1 = minterms.slice(3, 7).sort((a, b) => a - b);
  const rows = Array.from({ length: 8 }, (_, m) => [
    String((m >> 2) & 1), String((m >> 1) & 1), String(m & 1),
    String(+y0.includes(m)), String(+y1.includes(m)),
  ]);
  return {
    stem: r`A memory system stores $${words}$ words of $${width}$ bits. Available RAM chips store $${chipWords}$ words of $${chipWidth}$ bits. A separate $8\times2$ ROM has address inputs $A_2A_1A_0$.`,
    parts: [
      { pts: 10, q: r`For the memory system, find the number of address lines, data input lines, data output lines, and the total bit capacity.`,
        a: [r`Address lines: $${addressBits}$ because $2^{${addressBits}}=${words}$. Data input lines: $${width}$; data output lines: $${width}$. Capacity: $${words}\cdot${width}=${capacity}$ bits.`],
        rubric: [[10, 'all line counts and capacity']], facts: { kind: 'memory-size', addressBits, width, words, capacity } },
      { pts: 20, q: r`Build the memory from the available chips. Give the number of chip banks, chips in parallel per bank, total chips, and the decoder or chip-select rule.`,
        a: [r`Use $2$ banks for the address depth and $2$ chips in parallel per bank for the word width: $${chips}$ chips total.`,
          r`The high address bit selects one bank through a $1$-to-$2$ decoder. The other $${addressBits - 1}$ address bits go to every chip. Both chips in the selected bank share read/write control and provide $${chipWidth}+${chipWidth}=${width}$ data bits.`],
        rubric: [[20, 'bank count, parallel chips, total chips, and select wiring']], facts: { chipWords, chipWidth, banks: 2, parallel: 2, chips } },
      { pts: 30, q: r`Program the ROM so $Y_0=\Sigma m(${y0.join(',')})$ and $Y_1=\Sigma m(${y1.join(',')})$. Write the full truth table and state how to connect a 3-to-8 decoder and OR gates.`,
        a: [r`$${table(['A_2', 'A_1', 'A_0', 'Y_0', 'Y_1'], rows)}$`,
          r`$Y_0=${canonical(y0)}$ and $Y_1=${canonical(y1)}$. Connect decoder outputs $${y0.map(m => `D_${m}`).join(',')}$ to the $Y_0$ OR gate and $${y1.map(m => `D_${m}`).join(',')}$ to the $Y_1$ OR gate.`],
        rubric: [[30, 'all truth-table rows and both decoder-to-OR connections']], facts: { y0, y1, rows } },
    ],
    refs: [['7.2', 'Random-Access Memory'], ['7.3', 'Memory Decoding'], ['7.5', 'Read-Only Memory']],
  };
}

import { el } from './dom.js';
import { t as T, onLangChange } from '../i18n/index.js';
import { stepLine } from './question.js';
import { load, save } from './store.js';

/* ---------------------------------------------------------------
   KHUNG "MÁY GIẢI" dùng chung cho mọi công cụ: ô nhập (do công cụ dựng) → đáp án lớn ở trên → các bước GẬP
   (mỗi bước một dòng tiêu đề, bấm mới mở giải thích). Giảm chữ trên màn mà vẫn mở được khi cần hiểu.
   - Che đáp án (nhớ theo trình duyệt): đáp án và bước ẩn tới khi bấm "Hiện" — để tự làm trước rồi đối chiếu.
   - Công cụ chỉ lo ô nhập + hàm tính ra { answer: dòng[], steps: { head: {key, params}, lines: dòng[] }[] };
     dòng = chuỗi toán | { key, params, m } (cùng định dạng lời giải của bộ luyện tập).
   Dùng: const s = createSolver(host, { practice: '#/practice/ch1', examples: [{ label, apply }] });
         s.inputs.append(…ô nhập…);  s.show(kết quả)  |  s.error('thông báo')  |  s.clear()
   --------------------------------------------------------------- */

const HIDE_KEY = 'solver-hide';
const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';

export function createSolver(host, { practice = null, examples = [] } = {}) {
  const exRow = el('div', { class: 'sv-ex' });
  const inputs = el('div', { class: 'sv-in' });
  const out = el('div', { class: 'sv-out', 'aria-live': 'polite' });
  host.classList.add('sv');
  host.replaceChildren(exRow, inputs, out);

  let last = null;               // { result } | { error } | null
  let revealed = false;          // đã bấm "Hiện" trong lúc đang che
  const openSteps = new Set();   // chỉ số bước đang mở — giữ qua lần tính lại / đổi ngôn ngữ

  const drawExamples = () => exRow.replaceChildren(...(examples.length ? [
    el('span', { class: 'sv-ex-l', text: T('solver.try') }),
    ...examples.map(x => el('button', { type: 'button', class: 'sv-chip', text: typeof x.label === 'function' ? x.label() : x.label, onClick: () => x.apply() })),
  ] : []));

  function draw() {
    drawExamples();
    if (!last) { out.replaceChildren(el('p', { class: 'sv-empty', text: T('solver.empty') })); return; }
    if (last.error) { out.replaceChildren(el('p', { class: 'sv-err', role: 'alert', text: last.error })); return; }
    const { answer, steps } = last.result;
    const hide = load(HIDE_KEY, false);
    const masked = hide && !revealed;

    const tools = el('div', { class: 'sv-tools' }, [
      el('label', { class: 'sv-hide' }, [
        el('input', { type: 'checkbox', checked: hide ? '' : null, onChange: e => { save(HIDE_KEY, e.target.checked); revealed = false; draw(); } }),
        T('solver.hide'),
      ]),
      !masked && steps.length > 1 && el('button', { type: 'button', class: 'sv-link', text: T(openSteps.size ? 'solver.closeAll' : 'solver.openAll'),
        onClick: () => { if (openSteps.size) openSteps.clear(); else steps.forEach((_, i) => openSteps.add(i)); draw(); } }),
      practice && el('a', { class: 'sv-link', href: practice, text: T('solver.similar') }),
    ]);
    if (masked) {
      out.replaceChildren(el('button', { type: 'button', class: 'btn sv-reveal', text: T('solver.reveal'), onClick: () => { revealed = true; draw(); } }), tools);
      return;
    }
    out.replaceChildren(
      el('div', { class: 'sv-answer' }, answer.map(stepLine)),
      el('div', { class: 'sv-steps' }, steps.map((s, i) => {
        const d = el('details', { class: 'sv-step', open: openSteps.has(i) ? '' : null }, [
          el('summary', {}, [el('span', { class: 'sv-n', text: CIRCLED[i] ?? String(i + 1) }), T(s.head.key, s.head.params)]),
          el('div', { class: 'run-lines sv-body' }, s.lines.map(stepLine)),
        ]);
        d.addEventListener('toggle', () => { if (d.open) openSteps.add(i); else openSteps.delete(i); });
        return d;
      })),
      tools,
    );
  }
  onLangChange(draw);
  draw();
  return {
    inputs,
    show(result) { last = { result }; revealed = false; draw(); },
    error(message) { last = { error: message }; draw(); },
    clear() { last = null; draw(); },
  };
}

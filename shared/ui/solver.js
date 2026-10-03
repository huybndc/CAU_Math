import { el } from './dom.js';
import { t as T, onLangChange } from '../i18n/index.js';
import { stepLine } from './question.js';
import { decorateTerms } from './terms.js';
import { load, save } from './store.js';

/* ---------------------------------------------------------------
   KHUNG "MÁY GIẢI" dùng chung cho mọi công cụ: ô nhập (do công cụ dựng) → đáp án lớn ở trên → các bước GẬP
   (mỗi bước một dòng tiêu đề, bấm mới mở giải thích). Giảm chữ trên màn mà vẫn mở được khi cần hiểu.
   - Che đáp án (nhớ theo trình duyệt): đáp án và bước ẩn tới khi bấm "Hiện" — để tự làm trước rồi đối chiếu.
   - Công cụ chỉ lo ô nhập + hàm tính ra { answer: dòng[], steps: { head: {key, params}, lines: dòng[] }[] };
     dòng = chuỗi toán | { key, params, m } (cùng định dạng lời giải của bộ luyện tập).
   - Kết quả có thể kèm `figure(): Node` (hình minh hoạ chỉ để xem, đặt dưới đáp án).
   - Bước có thể kèm `why: { key, params }` — một câu "vì sao làm thế" hiện đầu bước.
   - Kết quả có thể kèm `expect: string[]` (các cách viết đáp án chấp nhận) hoặc `check(chữ) → boolean` (so theo ý nghĩa, vd hai
     biểu thức tương đương): khi đang che, hiện ô "Đáp án của bạn" để đối chiếu đúng/sai mà chưa lộ lời giải.
   Dùng: const s = createSolver(host, { practice: '#/practice/ch1', examples: [{ label, apply }] });
         s.inputs.append(…ô nhập…);  s.show(kết quả)  |  s.error('thông báo')  |  s.clear()
   --------------------------------------------------------------- */

const HIDE_KEY = 'solver-hide';
const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';
const norm = x => String(x).toLowerCase().replace(/−/g, '-').replace(/\s+/g, '');
const lineText = w => (typeof w === 'string' ? w : [T(w.key, w.params), w.m, w.table && w.table.rows.map(r => r.join(' ')).join('; ')].filter(Boolean).join(' '));
/** Lời giải dạng chữ thuần (để dán vào ghi chú). */
const plain = ({ answer, steps }) => [
  ...answer.map(lineText),
  ...steps.flatMap((st, i) => ['', `${i + 1}. ${T(st.head.key, st.head.params)}`, ...(st.why ? [T(st.why.key, st.why.params)] : []), ...st.lines.map(l => '   ' + lineText(l))]),
].join('\n');

export function createSolver(host, { practice = null, examples = [], random = null, terms = null } = {}) {
  const exRow = el('div', { class: 'sv-ex' });
  const inputs = el('div', { class: 'sv-in' });
  const out = el('div', { class: 'sv-out', 'aria-live': 'polite' });
  const err = el('div', { class: 'sv-errbox', role: 'alert' });   // lỗi nằm ngay dưới ô nhập (cột trái), không ở cột kết quả
  const toolsEl = el('div', { class: 'sv-tools' });         // Che đáp án + Bài tương tự: nằm dưới ô nhập (cột trái trên màn rộng)
  host.classList.add('sv');
  host.replaceChildren(exRow, inputs, err, out, toolsEl);

  let last = null;               // { result } | { error } | null
  let revealed = false;          // đã bấm "Hiện" trong lúc đang che
  const openSteps = new Set();   // chỉ số bước đang mở — giữ qua lần tính lại / đổi ngôn ngữ
  let tab = null;                // ngăn đang xem (khoá nhóm) — giữ khi gõ tiếp
  let mine = '', verdict = null; // đáp án người học tự nhập khi đang che + kết quả đối chiếu (true | false | null)
  let copied = false;
  let hintN = 0;                 // số gợi ý (câu "vì sao" của các bước) đã mở khi đang che đáp án

  // MỘT nút 🎲: phần lớn ra đề ngẫu nhiên, thỉnh thoảng bốc một ví dụ mẫu có chủ ý (ca biên: vô nghiệm, nhiều nghiệm, tràn…)
  const roll = () => {
    if (examples.length && (!random || Math.random() < 0.35)) examples[Math.floor(Math.random() * examples.length)].apply();
    else random();
  };
  const drawExamples = () => exRow.replaceChildren(...(examples.length || random ? [
    el('button', { type: 'button', class: 'sv-chip sv-rand', text: '🎲 ' + T('solver.random'), onClick: roll }),
  ] : []));

  const why = st => st.why && el('details', { class: 'sv-why' }, [el('summary', { text: T('solver.why') }), el('p', { text: T(st.why.key, st.why.params) })]);   // một dòng "Vì sao?", bấm mới mở

  function paint() {
    drawExamples();
    toolsEl.replaceChildren();
    err.replaceChildren();
    if (!last) { out.replaceChildren(el('p', { class: 'sv-empty', text: T('solver.empty') })); return; }
    if (last.error) { err.append(el('p', { class: 'sv-err', text: last.error })); out.replaceChildren(); return; }
    const { answer, steps } = last.result;
    const hide = load(HIDE_KEY, false);
    const masked = hide && !revealed;

    // các bước chia NGĂN theo `group` (mặc định "Cách làm"): mỗi lúc chỉ một ngăn ⇒ không phải cuộn dài
    const groups = [...new Set(steps.map(st => st.group ?? 'solver.tabSteps'))];
    if (!groups.includes(tab)) tab = groups[0] ?? null;
    const inTab = steps.map((st, i) => ({ st, i })).filter(x => (x.st.group ?? 'solver.tabSteps') === tab);

    toolsEl.replaceChildren(...[
      el('label', { class: 'sv-hide' }, [
        el('input', { type: 'checkbox', checked: hide ? '' : null, onChange: e => { save(HIDE_KEY, e.target.checked); revealed = false; draw(); } }),
        T('solver.hide'),
      ]),
      practice && el('a', { class: 'sv-link', href: practice, text: T('solver.similar') }),
      !masked && el('button', { type: 'button', class: 'sv-link', text: T(copied ? 'solver.copied' : 'solver.copy'), onClick: () => {
        try { navigator.clipboard.writeText(plain(last.result)); copied = true; draw(); setTimeout(() => { copied = false; draw(); }, 1500); } catch { /* không có clipboard: bỏ qua */ }
      } }),
    ].filter(Boolean));
    if (masked) {
      const { expect, check } = last.result;
      const hints = steps.map(st => st.why).filter(Boolean);
      out.replaceChildren(...[
        (check || expect?.length) && el('form', { class: 'sv-check', onSubmit: e => {
          e.preventDefault();
          mine = e.target.elements.mine.value;
          verdict = mine.trim() === '' ? null : (() => { try { return check ? !!check(mine) : expect.some(x => norm(x) === norm(mine)); } catch { return false; } })();
          draw();
        } }, [
          el('input', { name: 'mine', type: 'text', value: mine, autocomplete: 'off', spellcheck: 'false', placeholder: T('solver.mine') }),
          el('button', { type: 'submit', class: 'btn', text: T('solver.check') }),
          verdict != null && el('span', { class: verdict ? 'sv-ok' : 'sv-no', role: 'status', text: T(verdict ? 'solver.right' : 'solver.wrong') }),
        ]),
        hintN > 0 && el('ol', { class: 'sv-hints' }, hints.slice(0, hintN).map(h => el('li', { text: T(h.key, h.params) }))),
        hintN < hints.length && el('button', { type: 'button', class: 'sv-link sv-hint', text: T(hintN ? 'solver.hintMore' : 'solver.hint'), onClick: () => { hintN++; draw(); } }),
        el('button', { type: 'button', class: 'btn sv-reveal', text: T('solver.reveal'), onClick: () => { revealed = true; draw(); } }),
      ].filter(Boolean));
      return;
    }
    const allOpen = inTab.length > 0 && inTab.every(x => openSteps.has(x.i));
    out.replaceChildren(...[
      el('div', { class: 'sv-answer' }, answer.map(stepLine)),
      last.result.figure && el('div', { class: 'sv-fig' }, last.result.figure()),
      steps.length > 0 && el('div', { class: 'sv-tabs', role: 'tablist' }, [
        ...groups.map(g => el('button', { type: 'button', role: 'tab', 'aria-selected': String(g === tab), text: T(g), onClick: () => { tab = g; draw(); } })),
        inTab.length > 1 && el('button', { type: 'button', class: 'sv-link sv-all', text: T(allOpen ? 'solver.closeAll' : 'solver.openAll'),
          onClick: () => { inTab.forEach(x => (allOpen ? openSteps.delete(x.i) : openSteps.add(x.i))); draw(); } }),
      ]),
      el('div', { class: 'sv-steps', role: 'tabpanel' }, inTab.length === 1
        ? el('div', { class: 'run-lines sv-body sv-solo' }, [why(inTab[0].st), ...inTab[0].st.lines.map(stepLine)])
        : inTab.map(({ st, i }, k) => {
        const d = el('details', { class: 'sv-step', open: openSteps.has(i) ? '' : null }, [
          el('summary', {}, [el('span', { class: 'sv-n', text: CIRCLED[k] ?? String(k + 1) }), T(st.head.key, st.head.params)]),
          el('div', { class: 'run-lines sv-body' }, [why(st), ...st.lines.map(stepLine)]),
        ]);
        d.addEventListener('toggle', () => { if (d.open) openSteps.add(i); else openSteps.delete(i); });
        return d;
      })),
    ].filter(Boolean));
  }
  const draw = () => { paint(); if (terms) decorateTerms(out, terms()); };   // thuật ngữ trong kết quả: bấm ⇒ định nghĩa + link bài học
  onLangChange(draw);
  draw();
  return {
    inputs,
    show(result) { last = { result }; revealed = false; verdict = null; hintN = 0; draw(); },
    error(message) { last = { error: message }; draw(); },
    clear() { last = null; draw(); },
  };
}

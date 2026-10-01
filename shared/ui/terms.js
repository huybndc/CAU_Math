import { t as T } from '../i18n/index.js';

/* ---------------------------------------------------------------
   THUẬT NGỮ BẤM ĐƯỢC: trong kết quả của máy giải, mỗi thuật ngữ (rank, trụ, độc lập…) thành chữ gạch chấm; bấm ⇒ hiện
   một câu định nghĩa + liên kết "Xem bài" tới đúng thẻ bài học. Người học không phải đoán nghĩa, cũng không phải đi tìm.
   decorateTerms(root, entries): entries = [{ words: string[], def: string, link?: { title, open() } }]
   --------------------------------------------------------------- */

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let pop = null;

function closePop() { if (pop) { pop.remove(); pop = null; } }

function openPop(btn, entry) {
  closePop();
  pop = document.createElement('div');
  pop.className = 'term-pop';
  pop.setAttribute('role', 'dialog');
  const p = document.createElement('p');
  p.textContent = entry.def;
  pop.append(p);
  if (entry.link) {
    const a = document.createElement('a');
    a.className = 'sv-link';
    a.href = entry.link.href;
    a.textContent = T('terms.openLesson', { title: entry.link.title });
    a.addEventListener('click', () => { entry.link.open?.(); closePop(); });
    pop.append(a);
  }
  document.body.append(pop);
  const r = btn.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
  const below = r.bottom + 8 + h <= innerHeight - 8;
  pop.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + 'px';
  pop.style.top = Math.max(8, below ? r.bottom + 6 : r.top - h - 6) + 'px';
}

addEventListener('pointerdown', e => { if (pop && !pop.contains(e.target) && !e.target.closest?.('.term')) closePop(); }, true);
addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); }, true);
addEventListener('scroll', closePop, { passive: true, capture: true });

/** Bọc thuật ngữ trong các nút `.term` (bỏ qua ma trận, nút, ô nhập, liên kết). */
export function decorateTerms(root, entries) {
  const words = entries.flatMap((e, i) => e.words.map(w => ({ w, i }))).sort((a, b) => b.w.length - a.w.length);
  if (!words.length) return;
  const re = new RegExp(`(?<![\\p{L}\\p{N}_])(${words.map(x => esc(x.w)).join('|')})(?![\\p{L}\\p{N}_])`, 'giu');
  const byWord = new Map(words.map(x => [x.w.toLowerCase(), x.i]));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.parentElement.closest('.term, .mat, button, a, input, textarea, [contenteditable]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
  for (const node of nodes) {
    const text = node.nodeValue;
    re.lastIndex = 0;
    if (!re.test(text)) continue;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let at = 0;
    for (const m of text.matchAll(re)) {
      frag.append(text.slice(at, m.index));
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'term';
      b.textContent = m[0];
      b.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); openPop(b, entries[byWord.get(m[0].toLowerCase())]); });
      frag.append(b);
      at = m.index + m[0].length;
    }
    frag.append(text.slice(at));
    node.replaceWith(frag);
  }
}

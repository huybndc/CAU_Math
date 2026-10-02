import { el } from '@shared/ui/dom.js';
import { t as T } from '@shared/i18n/index.js';
import { isSpec } from '../logic/kmap-walk.js';
import { netFromText, netAndOr, netNandNand } from '../logic/circuit.js';
import { netSvg } from './circuit-figure.js';

/* Bộ hình mạch của máy giải biểu thức: đúng như gõ · SOP tối giản AND–OR · NAND–NAND. Mỗi hình một khung gập. */
const isConst = e => e === '0' || e === '1';

export function exprCircuits(text, r) {
  const n = r.n, plain = String(text).replace(/^F\s*(\([^)]*\))?\s*=\s*/i, '');
  const items = [];
  const add = (key, mk) => { try { items.push([key, netSvg(mk())]); } catch { /* biểu thức không dựng được: bỏ hình này */ } };
  if (!isSpec(text) && !isConst(plain)) add('ex.figTyped', () => netFromText(plain, n));
  if (!isConst(r.sop)) {
    add('ex.figAndOr', () => netAndOr(r.sop, n));
    add('ex.figNand', () => netNandNand(r.sop, n));
  }
  if (!items.length) return null;
  return el('div', { class: 'circuit-set' }, items.map(([key, svg], i) => el('details', { class: 'card free-mod circuit-mod', open: i === 0 ? '' : null }, [
    el('summary', {}, el('h2', { text: T(key) })), el('div', { class: 'circuit-scroll' }, svg),
  ])));
}

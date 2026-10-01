import { el } from './dom.js';
import { load, save } from './store.js';

/* Hàng ô nhập cho máy giải không dùng lưới: specs = [{ id, label, value, size?, options?: [{v, t}], ph? }].
   Trả { node, get(id), set({ id: giá trị }) }; onChange chạy khi gõ / đổi lựa chọn. */
export function fieldRow(specs, onChange, key = null) {
  const inputs = {};
  const saved = key ? load(key, {}) : {};       // nhớ giá trị đã gõ theo trình duyệt
  const node = el('div', { class: 'sv-fields' }, specs.map(sp => {
    const input = sp.options
      ? el('select', {}, sp.options.map(o => el('option', { value: o.v, text: o.t, selected: String(o.v) === String(saved[sp.id] ?? sp.value) ? '' : null })))
      : el('input', { type: 'text', value: saved[sp.id] ?? sp.value ?? '', size: sp.size ?? 10, placeholder: sp.ph, autocomplete: 'off', spellcheck: 'false' });
    const fire = () => { if (key) save(key, Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, v.value]))); onChange(); };
    input.addEventListener('input', fire);
    input.addEventListener('change', fire);
    inputs[sp.id] = input;
    return el('label', { class: 'sv-f' }, [el('span', { text: sp.label }), input]);
  }));
  return { node, get: id => inputs[id].value.trim(), set: obj => { Object.entries(obj).forEach(([k, v]) => { inputs[k].value = v; }); inputs[Object.keys(inputs)[0]].dispatchEvent(new Event('change')); } };
}

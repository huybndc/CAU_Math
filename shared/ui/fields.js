import { el } from './dom.js';

/* Hàng ô nhập cho máy giải không dùng lưới: specs = [{ id, label, value, size?, options?: [{v, t}], ph? }].
   Trả { node, get(id), set({ id: giá trị }) }; onChange chạy khi gõ / đổi lựa chọn. */
export function fieldRow(specs, onChange) {
  const inputs = {};
  const node = el('div', { class: 'sv-fields' }, specs.map(sp => {
    const input = sp.options
      ? el('select', {}, sp.options.map(o => el('option', { value: o.v, text: o.t, selected: String(o.v) === String(sp.value) ? '' : null })))
      : el('input', { type: 'text', value: sp.value ?? '', size: sp.size ?? 10, placeholder: sp.ph, autocomplete: 'off', spellcheck: 'false' });
    input.addEventListener('input', onChange);
    input.addEventListener('change', onChange);
    inputs[sp.id] = input;
    return el('label', { class: 'sv-f' }, [el('span', { text: sp.label }), input]);
  }));
  return { node, get: id => inputs[id].value.trim(), set: obj => { Object.entries(obj).forEach(([k, v]) => { inputs[k].value = v; }); onChange(); } };
}

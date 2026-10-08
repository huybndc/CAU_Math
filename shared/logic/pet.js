/** Nhân vật giải trí: 'off' (mặc định) hoặc một trong ba nhân vật. Giá trị lưu cũ `true` (bản trước chỉ có một nhân vật) ⇒ 'cat'. */
export const PETS = ['off', 'cat', 'blob', 'bot'];
export const normalizePet = v => (v === true ? 'cat' : PETS.includes(v) ? v : 'off');

import { implicantMinterms } from './quine-mccluskey.js';
import { shuffle } from '@shared/logic/shuffle.js';

/** Sinh hàm ngẫu nhiên "đẹp": gieo vài nhóm rồi thêm nhiễu. */
export function randomValues(n, withDC, rnd = Math.random) {
  const size = 1 << n;
  const values = new Array(size).fill(0);
  const seeds = 1 + Math.floor(rnd() * 3);
  for (let k = 0; k < seeds; k++) {
    const d = Math.floor(rnd() * (n));                 // số biến bị loại
    let dash = 0;
    const bits = shuffle([...Array(n).keys()], rnd).slice(0, d);
    bits.forEach(b => dash |= 1 << b);
    const v = Math.floor(rnd() * size) & ~dash;
    implicantMinterms({ v, d: dash }, n).forEach(m => values[m] = 1);
  }
  for (let m = 0; m < size; m++) if (rnd() < 0.12) values[m] = values[m] ? 0 : 1;
  if (withDC) for (let m = 0; m < size; m++) if (rnd() < 0.13) values[m] = 2;
  if (values.every(v => v !== 0)) values[Math.floor(rnd() * size)] = 0;   // tránh hàm luôn bằng 1
  if (values.every(v => v !== 1)) values[Math.floor(rnd() * size)] = 1;   // tránh hàm rỗng
  return values;
}

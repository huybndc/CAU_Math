#!/usr/bin/env node
/* THỬ ĐỘT BIẾN thủ công (không cần Stryker): với mỗi file trong scripts/mutation-targets.json, lần lượt đảo từng toán tử/hằng
   (>= ↔ >, && ↔ ||, === ↔ !==, true ↔ false, +1 → -1 …) trên MỘT dòng, chạy bộ test của file đó; test vẫn xanh ⇒ biến thể
   "sống sót" ⇒ có chỗ test không canh. Thoát mã 1 nếu còn sống sót. Chạy lại khi sửa các file mục tiêu:
     node scripts/mutation-check.mjs [file ...]      (không đối số = mọi file trong targets)
   An toàn: luôn ghi lại nội dung gốc sau mỗi biến thể (và khi bị ngắt); mỗi lần chạy test có timeout 45 s (vòng lặp vô hạn = bị bắt). */
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const targets = JSON.parse(readFileSync(new URL('./mutation-targets.json', import.meta.url), 'utf8'));
const files = process.argv.length > 2 ? process.argv.slice(2) : Object.keys(targets);
const OPS = [[/>=/, '>'], [/<=/, '<'], [/&&/, '||'], [/\|\|/, '&&'], [/===/, '!=='], [/!==/, '==='], [/ \+ 1/, ' - 1'], [/\btrue\b/, 'false'], [/\bfalse\b/, 'true'], [/ > /, ' < '], [/ < /, ' > ']];
const only = (process.env.MUTATE_LINES || '').split(',').filter(Boolean);   // tuỳ chọn: chỉ chạy các dòng 'file:số', ví dụ MUTATE_LINES=a.js:12,a.js:40
let survivors = 0, total = 0, current = null;
const restore = () => current && writeFileSync(current.f, current.src);
process.on('SIGINT', () => { restore(); process.exit(130); });

for (const f of files) {
  const tests = targets[f];
  if (!tests) { console.log(`bỏ qua ${f}: chưa khai báo test trong mutation-targets.json`); continue; }
  const src = readFileSync(f, 'utf8'), lines = src.split('\n');
  current = { f, src };
  lines.forEach((ln, i) => {
    if (/^\s*(\/\/|\/\*|\*)/.test(ln) || /^import /.test(ln)) return;
    const code = ln.replace(/\/\/.*$/, '');
    if (only.length && !only.includes(`${f}:${i + 1}`)) return;
    for (const [re, to] of OPS) {
      if (!re.test(code)) continue;
      const copy = [...lines]; copy[i] = ln.replace(re, to);
      writeFileSync(f, copy.join('\n'));
      const r = spawnSync('npx', ['vitest', 'run', ...tests], { encoding: 'utf8', timeout: 45000 });
      writeFileSync(f, src);
      total++;
      if (r.status === 0) { survivors++; console.log(`SỐNG SÓT ${f}:${i + 1}  ${ln.trim().slice(0, 80)}  =>  ${copy[i].trim().slice(0, 80)}`); }
    }
  });
  current = null;
}
console.log(`${total} biến thể, ${survivors} sống sót`);
process.exit(survivors ? 1 : 0);

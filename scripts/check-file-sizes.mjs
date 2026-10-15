// Cỡ file: đếm dòng code (bỏ dòng trống và dòng chỉ có chú thích — ước lượng).
// Đỏ khi: file không có trong size-baseline.json vượt 450; hoặc file trong baseline tăng.
// File cũ đã vượt chỉ cảnh báo. Không tách file chỉ vì con số.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const LIMIT = 450;
const SKIP = new Set(['node_modules', 'dist', '.git']);
const baseline = existsSync('scripts/size-baseline.json') ? JSON.parse(readFileSync('scripts/size-baseline.json', 'utf8')) : {};

export function codeLines(text) {
  let inBlock = false, n = 0;
  for (const raw of text.split('\n')) {
    let l = raw.trim();
    if (inBlock) { if (l.includes('*/') || l.includes('-->')) inBlock = false; continue; }
    if (!l || l.startsWith('//')) continue;
    if (l.startsWith('/*') || l.startsWith('<!--')) {
      if (!/\*\/|-->/.test(l)) inBlock = true;
      continue;
    }
    n++;
  }
  return n;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|mjs|css|html)$/.test(name)) out.push(p);
  }
  return out;
}

let fail = false;
for (const f of walk(process.argv[2] || '.')) {
  const rel = f.replace(/^\.\//, '');
  const n = codeLines(readFileSync(f, 'utf8'));
  if (n <= LIMIT) continue;
  const was = baseline[rel];
  if (was === undefined) { console.log(`${n}  ${rel}  (mới, vượt ${LIMIT})`); fail = true; }
  else if (n > was) { console.log(`${n}  ${rel}  (tăng so với baseline ${was})`); fail = true; }
  else console.log(`cảnh báo: ${n}  ${rel}  (file cũ vượt ${LIMIT}, baseline ${was})`);
}
console.log(fail ? 'LỖI cỡ file.' : `OK — không file mới nào vượt ${LIMIT} dòng code.`);
process.exit(fail ? 1 : 0);

// Cỡ file: đếm dòng code (bỏ dòng trống và dòng chỉ có chú thích — ước lượng).
// Đỏ khi: file không có trong size-baseline.json vượt 450; hoặc file trong baseline tăng.
// File cũ đã vượt chỉ cảnh báo. Không tách file chỉ vì con số.
// Thêm trần _caps: tài liệu .md agent đọc (byte, trừ docs/), JSON nội dung, tổng repo git theo dõi.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const SKIP = new Set(['node_modules', 'dist', '.git', 'docs', 'test-results']);
const baseline = existsSync('scripts/size-baseline.json') ? JSON.parse(readFileSync('scripts/size-baseline.json', 'utf8')) : {};
const caps = baseline._caps ?? {};
const LIMIT = caps.codeLines ?? 450;

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
    else if (/\.(js|mjs|css|html|md|json)$/.test(name)) out.push(p);
  }
  return out;
}

let fail = false;
for (const f of walk(process.argv[2] || '.')) {
  const rel = f.replace(/^\.\//, '');
  if (/\.(md|json)$/.test(rel)) {
    const cap = rel.endsWith('.md') ? (/\/content\//.test(rel) ? undefined : caps.docBytes) : /\/content\//.test(rel) ? caps.contentJsonBytes : undefined;
    const n = statSync(f).size;
    if (cap === undefined || n <= cap) continue;
    const was = baseline[rel];
    if (was === undefined || n > was) { console.log(`${n} B  ${rel}  (vượt trần ${cap} B)`); fail = true; }
    else console.log(`cảnh báo: ${n} B  ${rel}  (file cũ vượt trần, baseline ${was})`);
    continue;
  }
  const n = codeLines(readFileSync(f, 'utf8'));
  if (n <= LIMIT) continue;
  const was = baseline[rel];
  if (was === undefined) { console.log(`${n}  ${rel}  (mới, vượt ${LIMIT})`); fail = true; }
  else if (n > was) { console.log(`${n}  ${rel}  (tăng so với baseline ${was})`); fail = true; }
  else console.log(`cảnh báo: ${n}  ${rel}  (file cũ vượt ${LIMIT}, baseline ${was})`);
}
if (caps.repoBytes && (process.argv[2] ?? '.') === '.') {
  const total = execSync('git ls-files -z', { encoding: 'utf8' }).split('\0').filter(f => f && existsSync(f)).reduce((t, f) => t + statSync(f).size, 0);
  if (total > caps.repoBytes) { console.log(`${total} B  repo  (vượt trần ${caps.repoBytes} B)`); fail = true; }
}
console.log(fail ? 'LỖI cỡ file.' : `OK — không file mới nào vượt ${LIMIT} dòng code.`);
process.exit(fail ? 1 : 0);

#!/usr/bin/env node
// Kiểm tra giao diện bằng bộ quét xác định của impeccable (không LLM, không API key). Chỉ báo lỗi MỚI so với design-baseline.json.
// Dùng: node scripts/design-check.mjs [--update] [--baseline <file>] [đường dẫn...]   (mặc định: index.html src)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const VERSION = '4.1.0'; // ghim; nâng tay sau khi chạy lại bộ quét và xem baseline
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const bi = argv.indexOf('--baseline');
const baselineFile = bi >= 0 ? argv[bi + 1] : 'design-baseline.json';
const paths = argv.filter((a, i) => !a.startsWith('--') && i !== bi + 1);
const targets = (paths.length ? paths : ['index.html', 'src']).filter(existsSync);

let out = '[]';
try { out = execFileSync('npx', ['--yes', `impeccable@${VERSION}`, 'detect', '--json', ...targets], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
catch (e) { if (e.status !== 2) { console.error(e.stderr || e.message); process.exit(1); } out = e.stdout; } // exit 2 = có phát hiện
const key = (f) => `${f.antipattern}|${relative(process.cwd(), resolve(f.file))}|${f.snippet ?? ''}`; // bỏ số dòng: sửa file không làm lệch baseline
const found = JSON.parse(out || '[]');
if (flag('--update')) { writeFileSync(baselineFile, JSON.stringify([...new Set(found.map(key))].sort(), null, 2) + '\n'); console.log(`Đã ghi ${found.length} mục vào ${baselineFile}`); process.exit(0); }
const known = new Set(existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, 'utf8')) : []);
const fresh = found.filter((f) => !known.has(key(f)));
for (const f of fresh) console.log(`[${f.severity}] ${f.antipattern} — ${relative(process.cwd(), f.file)}: ${f.snippet ?? f.description}`);
console.log(fresh.length ? `\n${fresh.length} lỗi giao diện MỚI (sửa, hoặc chạy --update nếu cố ý và ghi lý do vào PRODUCT.md/DESIGN.md)` : `OK — không có lỗi giao diện mới (${found.length} mục cũ nằm trong baseline)`);
process.exit(fresh.length ? 1 : 0);

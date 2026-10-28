// Biên dịch + chạy mọi biến thể trong prog/src/logic/c-templates.js bằng clang thật, ghi prog/src/content/c-bank.json.
// predict: out = stdout. find: line = dòng clang báo lỗi ở bản sai; bản sửa phải biên dịch được.
// Chạy: npm run gen:c  (cần clang trên máy; không chạy mã trong trình duyệt).
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { variants } from '../prog/src/logic/c-templates.js';

const FLAGS = ['-std=c11', '-Wall', '-o'];
export const hashSrc = s => createHash('sha256').update(s).digest('hex').slice(0, 16);

/** { ok, out?, line? } — dùng chung cho script này và test kiểm lại. */
export function runC(src) {
  const dir = mkdtempSync(join(tmpdir(), 'cbank-'));
  try {
    const file = join(dir, 'main.c'), bin = join(dir, 'a.out');
    writeFileSync(file, src);
    const cc = spawnSync('clang', [file, ...FLAGS, bin], { encoding: 'utf8' });
    if (cc.status !== 0) {
      const m = cc.stderr.match(/main\.c:(\d+):\d+: error/);
      return { ok: false, line: m ? Number(m[1]) : null, err: cc.stderr };
    }
    return { ok: true, out: execFileSync(bin, { encoding: 'utf8', timeout: 5000 }) };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

export function build() {
  return variants().map(v => {
    const r = runC(v.src);
    if (v.kind === 'predict') {
      if (!r.ok) throw new Error(`${v.id}: không biên dịch được\n${r.err}`);
      return { id: v.id, template: v.template, kind: v.kind, topic: v.topic, week: v.week, hash: hashSrc(v.src), out: r.out };
    }
    if (r.ok || !r.line) throw new Error(`${v.id}: bản sai phải có lỗi biên dịch`);
    if (!runC(v.fixSrc).ok) throw new Error(`${v.id}: bản sửa không biên dịch được`);
    return { id: v.id, template: v.template, kind: v.kind, topic: v.topic, week: v.week, hash: hashSrc(v.src), line: r.line };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bank = build();
  writeFileSync(new URL('../prog/src/content/c-bank.json', import.meta.url), JSON.stringify(bank, null, 1) + '\n');
  console.log(`c-bank.json: ${bank.length} câu (clang ${execFileSync('clang', ['--version'], { encoding: 'utf8' }).split('\n')[0]})`);
}

// Biên dịch + chạy mọi biến thể trong prog/src/logic/c-templates.js bằng clang thật, ghi prog/src/content/c-bank.json.
// predict: out = stdout. multi: { ok, out } hoặc { ok:false, line, why }. find: line = dòng clang báo lỗi ở bản sai; bản sửa phải biên dịch được.
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
export function runC(src, { san = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'cbank-'));
  try {
    const file = join(dir, 'main.c'), bin = join(dir, 'a.out');
    writeFileSync(file, src);
    const cc = spawnSync('clang', [file, ...(san ? ['-g', '-fsanitize=address'] : []), ...FLAGS, bin], { encoding: 'utf8' });
    if (cc.status !== 0) {
      const m = cc.stderr.match(/main\.c:(\d+):\d+: error/);
      const why = cc.stderr.match(/error: ([^\n]*)/);
      return { ok: false, line: m ? Number(m[1]) : null, why: why ? why[1] : '', err: cc.stderr };
    }
    if (san) { const run = spawnSync(bin, { encoding: 'utf8', timeout: 5000 }); return { ok: true, crashed: run.status !== 0, out: run.stdout }; }
    return { ok: true, out: execFileSync(bin, { encoding: 'utf8', timeout: 5000 }) };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

export function build() {
  return variants().map(v => {
    const r = runC(v.src);
    if (v.badSrc && !runC(v.badSrc, { san: true }).crashed) throw new Error(`${v.id}: bản sai phải sập khi chạy`);
    if (v.kind === 'multi') {
      if (!r.ok && !r.line) throw new Error(`${v.id}: lỗi không rõ dòng\n${r.err}`);
      const res = r.ok ? { ok: true, out: r.out } : { ok: false, line: r.line, why: r.why };
      return { id: v.id, template: v.template, kind: v.kind, type: v.type, topic: v.topic, week: v.week, hash: hashSrc(v.src), ...res };
    }
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

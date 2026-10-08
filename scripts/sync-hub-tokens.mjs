// Sinh shared/style/tokens-hub.css từ shared/style/design-tokens.json (bản chụp token của Study_Hub).
// Hub đổi token → chép design-tokens.json mới từ Study_Hub (main) rồi chạy: node scripts/sync-hub-tokens.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const dir = new URL('../shared/style/', import.meta.url);
export function render(snap) {
  const decl = o => Object.entries(o).map(([k, v]) => `  --${k}:${v};`).join('\n');
  return `/* SINH TỰ ĐỘNG từ design-tokens.json (token của Study_Hub) bằng scripts/sync-hub-tokens.mjs — đừng sửa tay. */\n`
    + `:root{\n${decl(snap.light)}\n}\n:root[data-theme="dark"]{\n${decl(snap.dark)}\n}\n`;
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  writeFileSync(new URL('tokens-hub.css', dir), render(JSON.parse(readFileSync(new URL('design-tokens.json', dir), 'utf8'))));
}

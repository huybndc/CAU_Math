// Chép bản xuất của Study_Hub (repo cùng thư mục cha): design-tokens.json (+ sinh tokens-hub.css), semester.js, môn practice.
// Chạy: npm run sync:hub. Test shared/tests/hub-sync.test.js báo lệch (bỏ qua khi không có repo Hub).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

export const HUB = new URL('../../Study_Hub/', import.meta.url);
const here = new URL('../', import.meta.url);
export const SEMESTER_HEAD = '// Nguồn: Study_Hub/semester.js (npm run semester:export). Không sửa tay: Hub đổi thì npm run sync:hub.\n';

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!existsSync(HUB)) { console.error(`Không thấy repo Study_Hub: ${HUB.pathname}`); process.exit(1); }
  writeFileSync(new URL('shared/style/design-tokens.json', here), readFileSync(new URL('design-tokens.json', HUB)));
  writeFileSync(new URL('shared/logic/semester.js', here), SEMESTER_HEAD + readFileSync(new URL('semester.js', HUB), 'utf8'));
  for (const s of ['shared/style/render-tokens.mjs', 'scripts/sync-subjects.mjs']) execFileSync('node', [new URL(s, here).pathname], { stdio: 'inherit' });
  console.log('sync:hub: đã chép design-tokens, semester, môn practice');
}

// Sinh phần theo môn từ shared/subjects.json: màu môn trong tokens.css (giữa hai dấu gen:subjects) và link ở index.html gốc.
// Chạy: npm run gen:subjects. Test shared/tests/subjects-gen.test.js báo đỏ khi file lệch danh sách.
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const SUBJECTS = JSON.parse(readFileSync(new URL('shared/subjects.json', root), 'utf8')).filter(s => s.app !== false);
const BEGIN = '/* gen:subjects — sinh từ shared/subjects.json, đừng sửa tay */', END = '/* end gen:subjects */';

export const tokensBlock = (subs = SUBJECTS) => [BEGIN,
  ...subs.map(s => `[data-subject="${s.id}"]{ --accent:${s.accent.light}; }`),
  ...subs.map(s => `:root[data-theme="dark"][data-subject="${s.id}"]{--accent:${s.accent.dark}}`),
  END].join('\n');
export const rootLinks = (subs = SUBJECTS) => `<body>${subs.map(s => `<a href="/${s.id}/">${s.vi}</a>`).join(' · ')}</body>`;

const between = (text, a, b, mid) => text.slice(0, text.indexOf(a)) + mid + text.slice(text.indexOf(b) + b.length);
export const files = () => ({
  'shared/style/tokens.css': t => between(t, BEGIN, END, tokensBlock()),
  'index.html': t => t.replace(/<body>.*<\/body>/, rootLinks()),
});

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [f, fix] of Object.entries(files())) {
    const u = new URL(f, root);
    writeFileSync(u, fix(readFileSync(u, 'utf8')));
  }
  console.log(`gen:subjects: ${SUBJECTS.length} môn`);
}

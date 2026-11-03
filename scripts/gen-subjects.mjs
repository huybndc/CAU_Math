// Generate course parts from shared/subjects.json: course colors in tokens.css (between the gen:subjects marks), and links and the redirect in the root index.html.
// A course with app: false is hidden: it is not built, and its folder and learning data stay.
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
export const rootRedirect = (page, subs = SUBJECTS) => page.replace(/url=\/[^/]*\//, `url=/${subs[0].id}/`);

const between = (text, a, b, mid) => text.slice(0, text.indexOf(a)) + mid + text.slice(text.indexOf(b) + b.length);
export const files = () => ({
  'shared/style/tokens.css': t => between(t, BEGIN, END, tokensBlock()),
  'index.html': t => rootRedirect(t).replace(/<body>.*<\/body>/, rootLinks()),
});

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [f, fix] of Object.entries(files())) {
    const u = new URL(f, root);
    writeFileSync(u, fix(readFileSync(u, 'utf8')));
  }
  console.log(`gen:subjects: ${SUBJECTS.length} môn`);
}

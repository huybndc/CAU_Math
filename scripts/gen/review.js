/* ---------------------------------------------------------------
   DUYỆT CÂU TRONG HÀNG CHỜ (D27) — chỉ câu người học giữ mới vào app.
     npm run gen:review -- --subject logic
   Mỗi câu: [g] giữ · [b] bỏ · [e] xem bản EN · [s] để sau · [q] thoát.
   Giữ ⇒ ghi vào <app>/src/content/concepts.json (được commit, app đọc lúc chạy).
   Muốn sửa chữ trước khi giữ: sửa thẳng scripts/gen/out/<môn>.drafts.json rồi chạy lại.
   Lưu sau MỖI lựa chọn — thoát giữa chừng không mất gì.
   --------------------------------------------------------------- */

import { createInterface } from 'node:readline/promises';
import { SUBJECTS, draftsPath, rejectedPath, readJson, writeJson, parseArgs } from './subjects.js';

const args = parseArgs(process.argv.slice(2));
const subject = args.subject ?? 'logic';
const cfg = SUBJECTS[subject];
if (!cfg) { console.error(`Môn lạ: ${subject}`); process.exit(1); }

let drafts = readJson(draftsPath(subject), []);
const approved = readJson(cfg.store, []);
const rejected = readJson(rejectedPath(subject), []);
if (!drafts.length) { console.log(`Hàng chờ ${subject} trống. Soạn thêm: npm run gen -- --subject ${subject}`); process.exit(0); }

const B = s => `\x1b[1m${s}\x1b[0m`, G = s => `\x1b[32m${s}\x1b[0m`, D = s => `\x1b[2m${s}\x1b[0m`;

function show(it, lang) {
  const L = it[lang];
  console.log(`\n${D(`${it.id} · §${it.section} · ${it.type} · ${it.source ?? ''}`)}`);
  console.log(B(L.q));
  L.options.forEach((o, i) => {
    const mark = i === it.answer ? G('✓') : ' ';
    console.log(` ${mark} ${'ABCD'[i]}. ${i === it.answer ? G(o) : o}`);
    console.log(D(`      ${L.why[i]}`));
  });
  console.log(`${B(lang === 'vi' ? 'Giải thích:' : 'Explain:')} ${L.explain}`);
  if (it.check) console.log(D(`check (máy đã kiểm đúng): ${JSON.stringify(it.check)}`));
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
let kept = 0, dropped = 0;
const queue = [...drafts];
for (const it of queue) {
  let lang = 'vi';
  let act = '';
  while (!['g', 'b', 's', 'q'].includes(act)) {
    show(it, lang);
    act = (await rl.question(`\n[g] giữ  [b] bỏ  [e] ${lang === 'vi' ? 'xem EN' : 'xem VI'}  [s] để sau  [q] thoát  (${queue.indexOf(it) + 1}/${queue.length}) › `)).trim().toLowerCase();
    if (act === 'e') lang = lang === 'vi' ? 'en' : 'vi';
  }
  if (act === 'q') break;
  if (act === 's') continue;
  drafts = drafts.filter(x => x.id !== it.id);
  if (act === 'g') { approved.push({ ...it, approved: new Date().toISOString().slice(0, 10) }); kept++; writeJson(cfg.store, approved); }
  else { rejected.push({ item: it, errors: ['người học bỏ khi duyệt'], at: new Date().toISOString() }); dropped++; writeJson(rejectedPath(subject), rejected.slice(-300)); }
  writeJson(draftsPath(subject), drafts);
}
rl.close();
console.log(`\nĐã giữ ${kept}, bỏ ${dropped}. Còn ${drafts.length} câu trong hàng chờ. Trong app: ${approved.length} câu khái niệm (${subject}).`);
if (kept) console.log('Chạy `npm test` rồi commit file concepts.json để lưu lại.');

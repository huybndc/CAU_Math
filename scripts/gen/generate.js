/* ---------------------------------------------------------------
   SOẠN CÂU KHÁI NIỆM BẰNG GEMINI (D27) — chạy tay, theo lô, không chạy trong app.
     npm run gen -- --subject logic                   8 câu cho mục đang ít câu nhất
     npm run gen -- --subject logic --chapter ch3 --calls 3
     npm run gen -- --subject logic --section 1.5 --n 6 --types why,trap
     npm run gen -- --subject logic --dry             chỉ in prompt, không gọi API
   Tuỳ chọn: --model (mặc định GEMINI_MODEL hoặc gemini-2.5-flash), --temperature.
   Câu qua kiểm tra vào hàng chờ scripts/gen/out/<môn>.drafts.json → `npm run gen:review`.
   --------------------------------------------------------------- */

import { callGemini, DEFAULT_MODEL } from './gemini.js';
import { buildPrompt, RESPONSE_SCHEMA } from './prompt.js';
import { pickSection, avoidFor, processBatch } from './pipeline.js';
import { TYPES } from '../../shared/logic/concepts.js';
import { SUBJECTS, draftsPath, rejectedPath, readJson, writeJson, parseArgs, loadEnv } from './subjects.js';

const args = parseArgs(process.argv.slice(2));
const subject = args.subject ?? 'logic';
const cfg = SUBJECTS[subject];
if (!cfg) { console.error(`Môn lạ: ${subject} (logic | linalg | discrete)`); process.exit(1); }
loadEnv();
const model = args.model ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
const n = Number(args.n ?? 8);
const calls = Number(args.calls ?? 1);
const types = args.types ? String(args.types).split(',').filter(t => TYPES.includes(t)) : TYPES;

const approved = readJson(cfg.store, []);
let drafts = readJson(draftsPath(subject), []);
const rejectedLog = readJson(rejectedPath(subject), []);

for (let c = 0; c < calls; c++) {
  const existing = [...approved, ...drafts];
  const section = pickSection(subject, { chapter: args.chapter, section: args.section }, existing);
  const prompt = buildPrompt({ subject, section, n, types, avoid: avoidFor(section.id, existing) });
  if (args.dry) { console.log(prompt); break; }

  console.log(`→ ${subject} §${section.id} ${section.title} · ${n} câu · ${model}`);
  let raw;
  try {
    raw = await callGemini({ apiKey: process.env.GEMINI_API_KEY, model, prompt, schema: RESPONSE_SCHEMA,
      temperature: args.temperature ? Number(args.temperature) : undefined });
  } catch (e) {
    console.error('  ✗', e.message);
    process.exitCode = 1;
    break;
  }
  const { accepted, rejected } = processBatch(raw.items ?? [], {
    subject, chapter: section.chapter, idPrefix: cfg.idPrefix, source: model, verify: cfg.verify,
    existing, stamp: Date.now().toString(36),
  });
  drafts = [...drafts, ...accepted];
  rejectedLog.push(...rejected.map(r => ({ ...r, at: new Date().toISOString() })));
  console.log(`  ✓ ${accepted.length} câu vào hàng chờ · ✗ ${rejected.length} câu bị loại`);
  for (const r of rejected) console.log(`    - ${r.item.en?.q?.slice(0, 70) ?? r.item.id}: ${r.errors.join('; ')}`);
}

if (!args.dry) {
  writeJson(draftsPath(subject), drafts);
  writeJson(rejectedPath(subject), rejectedLog.slice(-300));
  console.log(`\nHàng chờ ${subject}: ${drafts.length} câu. Duyệt: npm run gen:review -- --subject ${subject}`);
}

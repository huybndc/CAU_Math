// Chép môn có luyện (practice) từ file export của Study_Hub vào shared/subjects.json.
// Chỉ THÊM môn thiếu (app:false = chưa có thư mục môn); không đổi màu, ngăn nháp, tên của môn đã có.
// Chạy: npm run sync:subjects [đường dẫn file Hub]. Mặc định: ../Study_Hub/subjects.json (repo cùng thư mục cha).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

export const HUB_FILE = new URL('../../Study_Hub/subjects.json', import.meta.url);
const OURS = new URL('../shared/subjects.json', import.meta.url);

export const hubPractice = hub => hub.subjects.filter(s => s.practice).map(s => s.id);

/** Danh sách mới: giữ nguyên môn đã có, thêm môn practice thiếu ở cuối. */
export function merge(ours, hub) {
  const have = new Set(ours.map(s => s.id));
  const add = hub.subjects.filter(s => s.practice && !have.has(s.id)).map(s => ({ id: s.id, vi: s.name, en: s.name, app: false }));
  return [...ours, ...add];
}

export const render = list => '[\n' + list.map(s => '  ' + JSON.stringify(s)).join(',\n') + '\n]\n';

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2] ? new URL(process.argv[2], `file://${process.cwd()}/`) : HUB_FILE;
  if (!existsSync(file)) { console.error(`Không thấy file Hub: ${file.pathname}`); process.exit(1); }
  const ours = JSON.parse(readFileSync(OURS, 'utf8'));
  const next = merge(ours, JSON.parse(readFileSync(file, 'utf8')));
  writeFileSync(OURS, render(next));
  console.log(`sync:subjects: thêm ${next.length - ours.length} môn (${next.slice(ours.length).map(s => s.id).join(', ') || 'không có'})`);
}

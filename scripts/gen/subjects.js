/* ---------------------------------------------------------------
   MÔN ↔ NƠI LƯU + BỘ KIỂM PHÉP TÍNH (D27). Chạy bằng vite-node (npm run gen) nên
   import được module của app. Câu đã duyệt nằm trong app (được commit); nháp và
   câu bị loại nằm ở scripts/gen/out/ (không commit).
   --------------------------------------------------------------- */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { verifyCheck } from '../../logic/src/logic/concept-check.js';

export const SUBJECTS = {
  logic: { idPrefix: 'l', store: 'logic/src/content/concepts.json', verify: verifyCheck },
  // LinAlg / Discrete: câu duyệt được lưu sẵn, app dùng tới khi có ngân hàng câu (Phase 4, 5);
  // chưa có bộ kiểm phép tính ⇒ chỉ nhận câu không kèm check.
  linalg: { idPrefix: 'a', store: 'linalg/src/content/concepts.json' },
  discrete: { idPrefix: 'd', store: 'discrete/src/content/concepts.json' },
};

export const OUT = 'scripts/gen/out';
export const draftsPath = subject => `${OUT}/${subject}.drafts.json`;
export const rejectedPath = subject => `${OUT}/${subject}.rejected.json`;

export function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

/** --subject logic --n 5 --dry → { subject: 'logic', n: '5', dry: true } */
export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const m = argv[i].match(/^--([\w-]+)$/);
    if (!m) continue;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[m[1]] = true;
    else { out[m[1]] = next; i++; }
  }
  return out;
}

/** Nạp .env ở gốc repo (Node ≥ 20.12 có sẵn process.loadEnvFile). */
export function loadEnv() {
  if (existsSync('.env') && process.loadEnvFile) process.loadEnvFile('.env');
}

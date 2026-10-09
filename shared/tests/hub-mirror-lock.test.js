import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { MIRRORED, sha } from '../../scripts/update-hub-mirror-lock.mjs';

describe('file chép từ Study_Hub không bị sửa tay', () => {
  const lock = JSON.parse(readFileSync(new URL('../logic/hub-mirror.lock', import.meta.url), 'utf8'));
  it('lock liệt kê đúng các file chép', () => expect(Object.keys(lock)).toEqual(MIRRORED));
  for (const p of MIRRORED) {
    it(`${p} khớp lock`, () => expect(sha(p), `${p} đã đổi: nếu vừa chép bản mới từ Hub thì chạy \`node scripts/update-hub-mirror-lock.mjs\`; nếu không thì hoàn tác — Hub làm chủ file này`).toBe(lock[p]));
  }
});

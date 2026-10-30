// Danh sách môn của Exlab khớp môn có luyện của Study_Hub (lệch ⇒ npm run sync:subjects). Không có repo Hub cạnh bên thì bỏ qua.
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { HUB_FILE, hubPractice, merge } from '../../scripts/sync-subjects.mjs';
import OURS from '../subjects.json';

const hub = existsSync(HUB_FILE) ? JSON.parse(readFileSync(HUB_FILE, 'utf8')) : null;

describe('môn đồng bộ với Study_Hub', () => {
  it.skipIf(!hub)('id môn của Exlab = id môn practice của Hub', () => {
    expect(OURS.map(s => s.id).sort()).toEqual(hubPractice(hub).sort());
  });
  it('merge chỉ thêm môn thiếu, giữ nguyên môn đã có', () => {
    const ours = [{ id: 'a', vi: 'A', accent: { light: '#111' }, tabs: ['notes'] }];
    const fake = { subjects: [{ id: 'a', name: 'Đổi tên', practice: true }, { id: 'b', name: 'B', practice: true }, { id: 'c', name: 'C', practice: false }] };
    expect(merge(ours, fake)).toEqual([ours[0], { id: 'b', vi: 'B', en: 'B', app: false }]);
  });
});

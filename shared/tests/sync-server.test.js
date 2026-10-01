import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';
import { findSyncDir, readSnapshots, writeSnapshot, SYNC_FOLDER } from '../vite-plugin-sync.js';

let home;
const mk = (...p) => fs.mkdirSync(join(home, ...p), { recursive: true });
beforeEach(() => { home = fs.mkdtempSync(join(os.tmpdir(), 'sync-')); });

describe('tìm thư mục đồng bộ', () => {
  const find = env => findSyncDir({ env, home, platform: 'darwin' });

  it('không có dịch vụ đám mây nào ⇒ tắt', () => {
    expect(find({})).toEqual({ dir: null, label: null });
  });

  it('ưu tiên iCloud Drive, rồi Google Drive (tên thư mục theo ngôn ngữ máy)', () => {
    mk('Library', 'CloudStorage', 'GoogleDrive-user@example.com', 'Drive của tôi');
    mk('Library', 'CloudStorage', 'GoogleDrive-user@example.com', 'Shared drives');
    expect(find({})).toEqual({ dir: join(home, 'Library/CloudStorage/GoogleDrive-user@example.com/Drive của tôi', SYNC_FOLDER), label: 'Google Drive' });
    mk('Library', 'Mobile Documents', 'com~apple~CloudDocs');
    expect(find({}).label).toBe('iCloud Drive');
  });

  it('gốc nào đã có CAU_Math-sync thì dùng gốc đó (hai máy chắc chắn cùng chỗ)', () => {
    mk('Library', 'Mobile Documents', 'com~apple~CloudDocs');
    mk('Dropbox', SYNC_FOLDER);
    expect(find({})).toEqual({ dir: join(home, 'Dropbox', SYNC_FOLDER), label: 'Dropbox' });
  });

  it('STUDY_SYNC_DIR: đường dẫn tự chọn, hoặc off để tắt', () => {
    mk('Dropbox');
    expect(find({ STUDY_SYNC_DIR: '/data/sync' })).toEqual({ dir: '/data/sync', label: 'STUDY_SYNC_DIR' });
    expect(find({ STUDY_SYNC_DIR: 'off' }).dir).toBeNull();
  });
});

describe('đọc / ghi file của từng máy', () => {
  it('ghi rồi đọc lại; bỏ file hỏng và file lạ', () => {
    const dir = join(home, 'sync');
    const a = '11111111-1111-1111-1111-111111111111';
    const b = '22222222-2222-2222-2222-222222222222';
    writeSnapshot(dir, a, { device: 'mac-a1b2', entries: { k: { v: '1', t: 1 } } });
    writeSnapshot(dir, a, { device: 'mac-c3d4', entries: {} });
    writeSnapshot(dir, b, { device: 'mac-b9e8', entries: { k: { v: 'other', t: 2 } } });
    fs.writeFileSync(join(dir, a, 'broken.json'), '{"app":"cau-ma');
    fs.writeFileSync(join(dir, a, 'other.json'), '{"app":"khac"}');
    const snapsA = readSnapshots(dir, a);
    expect(snapsA.map(s => s.device).sort()).toEqual(['mac-a1b2', 'mac-c3d4']);
    expect(snapsA.find(s => s.device === 'mac-a1b2').entries).toEqual({ k: { v: '1', t: 1 } });
    expect(readSnapshots(dir, b).map(s => s.device)).toEqual(['mac-b9e8']);
    expect(readSnapshots(dir)).toEqual([]);
    expect(fs.readdirSync(join(dir, a)).some(n => n.endsWith('.tmp'))).toBe(false);
  });

  it('từ chối tên máy lạ (không cho ghi ra ngoài thư mục)', () => {
    const scope = '33333333-3333-3333-3333-333333333333';
    expect(() => writeSnapshot(home, '../../x', { device: 'ok-device', entries: {} })).toThrow();
    expect(() => writeSnapshot(home, scope, { device: '../../x', entries: {} })).toThrow();
    expect(readSnapshots(home, '../../x')).toEqual([]);
  });

  it('thư mục chưa có ⇒ chưa máy nào', () => {
    expect(readSnapshots(join(home, 'nope'), '44444444-4444-4444-4444-444444444444')).toEqual([]);
  });
});

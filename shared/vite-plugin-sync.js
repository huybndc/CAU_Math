import fs from 'node:fs';
import os from 'node:os';
import { join, isAbsolute } from 'node:path';
import { SYNC_APP } from './logic/sync.js';

/* ---------------------------------------------------------------
   ĐỒNG BỘ QUA THƯ MỤC ĐÁM MÂY (D37) — không deploy.
   Máy chủ Vite ghi/đọc CAU_Math-sync/<tài khoản Supabase>/<máy>.json.
   Mỗi tài khoản một namespace nên dùng chung thư mục đám mây vẫn không tự trộn progress.
   GET /__sync?scope=<user-id> và PUT /__sync?scope=<user-id>.
   --------------------------------------------------------------- */

export const SYNC_FOLDER = 'CAU_Math-sync';
const DEVICE_RE = /^[\w-]{4,64}$/;
const SCOPE_RE = /^[A-Za-z0-9_-]{4,128}$/;
const MAX_BODY = 8 << 20;

/** Các gốc đám mây có thể có trên máy, theo thứ tự ưu tiên. */
function cloudRoots(home, platform, fsx) {
  const ls = dir => { try { return fsx.readdirSync(dir); } catch { return []; } };
  const cs = join(home, 'Library', 'CloudStorage');          // macOS 12+: mọi dịch vụ đặt ở đây
  const roots = [['iCloud Drive', join(home, 'Library', 'Mobile Documents', 'com~apple~CloudDocs')]];
  for (const d of ls(cs).filter(n => n.startsWith('GoogleDrive'))) {
    // "My Drive" / "Drive của tôi"… tuỳ ngôn ngữ máy — lấy thư mục con có chữ Drive, trừ ổ dùng chung
    const mine = ls(join(cs, d)).find(n => /drive/i.test(n) && !/shared|chia sẻ|other/i.test(n));
    if (mine) roots.push(['Google Drive', join(cs, d, mine)]);
  }
  roots.push(['Google Drive', join(home, 'Google Drive', 'My Drive')]);
  if (platform === 'win32') roots.push(['Google Drive', 'G:\\My Drive']);
  for (const d of ls(cs).filter(n => n.startsWith('OneDrive'))) roots.push(['OneDrive', join(cs, d)]);
  roots.push(['OneDrive', join(home, 'OneDrive')]);
  for (const d of ls(cs).filter(n => n.startsWith('Dropbox'))) roots.push(['Dropbox', join(cs, d)]);
  roots.push(['Dropbox', join(home, 'Dropbox')], ['iCloud Drive', join(home, 'iCloudDrive')]);
  return roots.filter(([, p]) => fsx.existsSync(p));
}

/**
 * Thư mục đồng bộ của máy này.
 * @returns {{ dir: string|null, label: string|null }}
 */
export function findSyncDir({ env = process.env, home = os.homedir(), platform = process.platform, fsx = fs } = {}) {
  const pick = (env.STUDY_SYNC_DIR || '').trim();
  if (pick.toLowerCase() === 'off') return { dir: null, label: null };
  if (pick && isAbsolute(pick)) return { dir: pick, label: 'STUDY_SYNC_DIR' };
  const roots = cloudRoots(home, platform, fsx);
  const [label, root] = roots.find(([, p]) => fsx.existsSync(join(p, SYNC_FOLDER))) || roots[0] || [];
  return root ? { dir: join(root, SYNC_FOLDER), label } : { dir: null, label: null };
}

/** Đọc bản chụp của mọi máy trong thư mục; file hỏng (đám mây đang tải dở) thì bỏ qua. */
export function readSnapshots(dir, scope, fsx = fs) {
  if (!SCOPE_RE.test(scope || '')) return [];
  const scoped = join(dir, scope);
  let names = [];
  try { names = fsx.readdirSync(scoped).filter(n => n.endsWith('.json')); } catch { return []; }
  const out = [];
  for (const n of names) {
    try {
      const s = JSON.parse(fsx.readFileSync(join(scoped, n), 'utf-8'));
      if (s?.app === SYNC_APP) out.push(s);
    } catch { /* file dở dang */ }
  }
  return out;
}

/** Ghi file của một máy: ghi file tạm rồi đổi tên ⇒ app đồng bộ không bao giờ chép nửa file. */
export function writeSnapshot(dir, scope, { device, entries }, fsx = fs, now = Date.now()) {
  if (!SCOPE_RE.test(scope || '') || !DEVICE_RE.test(device || '') || !entries || typeof entries !== 'object') throw new Error('bad snapshot');
  const scoped = join(dir, scope);
  fsx.mkdirSync(scoped, { recursive: true });
  const file = join(scoped, device + '.json');
  const body = JSON.stringify({ app: SYNC_APP, version: 1, device, host: os.hostname(), savedAt: now, entries });
  fsx.writeFileSync(file + '.tmp', body);
  fsx.renameSync(file + '.tmp', file);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('too large')); req.destroy(); } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

export function syncPlugin(env = process.env) {
  const handle = async (req, res) => {
    const send = (code, obj) => {
      res.statusCode = code;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(obj));
    };
    // tìm lại mỗi lần: cài Google Drive / tạo thư mục xong là dùng được, khỏi khởi động lại máy chủ
    const { dir, label } = findSyncDir({ env });
    try {
      const scope = new URL(req.url, 'http://localhost').searchParams.get('scope');
      if (!SCOPE_RE.test(scope || '')) return send(200, { dir: null, label: null, snapshots: [] });
      if (req.method === 'GET') return send(200, { dir, label, snapshots: dir ? readSnapshots(dir, scope) : [] });
      if (req.method === 'PUT') {
        if (!dir) return send(200, { dir: null });
        writeSnapshot(dir, scope, JSON.parse(await readBody(req)));
        return send(200, { dir, label });
      }
      send(405, { error: 'method' });
    } catch (e) {
      send(400, { error: String(e.message || e) });
    }
  };
  return {
    name: 'study-sync',
    configureServer: server => { server.middlewares.use('/__sync', handle); },
    configurePreviewServer: server => { server.middlewares.use('/__sync', handle); },
  };
}

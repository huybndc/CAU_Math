import { currentUser, adoptAccount, accountStorageKey, accountDataEntries, hubHref } from '@host';
import { reconcile, trackLocal, validEntries, isSyncKey, isSyncableKey } from '../logic/sync.js';
import { t as T, onLangChange } from '../i18n/index.js';

/* ---------------------------------------------------------------
   ĐỒNG BỘ TỰ ĐỘNG GIỮA CÁC MÁY (D37).
   Mỗi tài khoản Supabase có một namespace riêng: CAU_Math-sync/<user-id>/.
   Vì vậy hai tài khoản dùng chung code không tự nhận progress của nhau.
   --------------------------------------------------------------- */

const META = 'sync:meta';
const RELOADED = 'sync:reloaded';
const PUSH_EVERY = 10000;

let meta = null;
let lastSent = '';
let info = { state: 'wait' };
let btn = null;
let busy = null;
let accountId = null;

function readLocal() {
  return Object.fromEntries(
    Object.entries(accountDataEntries()).filter(([k]) => isSyncableKey(k) && !isSyncKey(k))
  );
}

function loadMeta() {
  let m = null;
  try { m = JSON.parse(localStorage.getItem(accountStorageKey(META))); } catch { /* hỏng thì làm lại */ }
  if (!m?.device || typeof m.base !== 'object') {
    m = { device: 'b' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4), base: {} };
  }
  return m;
}

const saveMeta = () => {
  try { localStorage.setItem(accountStorageKey(META), JSON.stringify(meta)); } catch { /* đầy */ }
};

function refreshMeta() {
  const m = loadMeta();
  if (!meta || m.device === meta.device) meta = m;
}

function setInfo(next) {
  info = { ...info, ...next };
  if (!btn) return;
  btn.dataset.state = info.state;
  const time = info.at ? new Date(info.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '–';
  const text = info.state === 'ok' ? T('sync.ok', { label: info.label, dir: info.dir, time, n: info.devices })
    : info.state === 'off' ? T(hubHref ? 'sync.hub' : 'sync.off')
      : info.state === 'err' ? T('sync.err', { msg: info.msg }) : T('sync.wait');
  btn.title = text;
  btn.setAttribute('aria-label', text);
}

/** Lấy UUID tài khoản hiện tại. Đổi tài khoản trên cùng trình duyệt thì chuyển sang namespace mới; không đọc dữ liệu của tài khoản cũ. */
async function syncScope() {
  const user = await currentUser();
  if (!user?.id) {
    accountId = null;
    return null;
  }
  if (accountId !== user.id) {
    adoptAccount(user.id);
    accountId = user.id;
    meta = loadMeta();
    lastSent = '';
  }
  return user.id;
}

/** Gửi bản chụp của máy này (chỉ khi có đổi, trừ khi force). */
async function push({ force = false, leaving = false } = {}) {
  const scope = await syncScope();
  if (!scope) {
    setInfo({ state: 'off' });
    return false;
  }
  if (info.state !== 'ok' && info.state !== 'err') return false;
  refreshMeta();
  const tracked = trackLocal(meta.base, readLocal(), Date.now());
  meta.base = tracked.base;
  if (tracked.changed) saveMeta();
  const body = JSON.stringify({ device: meta.device, entries: meta.base });
  if (!force && body === lastSent) return true;
  const res = await fetch('/__sync?scope=' + encodeURIComponent(scope), {
    method: 'PUT', body, headers: { 'Content-Type': 'application/json' }, keepalive: leaving && body.length < 60000,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.status);
  lastSent = body;
  setInfo({ state: 'ok', at: Date.now() });
  return true;
}

/** Lấy bản các máy khác, gộp, gửi lại bản đã gộp. */
async function pull() {
  const scope = await syncScope();
  if (!scope) {
    setInfo({ state: 'off' });
    return false;
  }
  const res = await fetch('/__sync?scope=' + encodeURIComponent(scope), { cache: 'no-store' });
  const data = res.ok ? await res.json().catch(() => null) : null;
  if (!data?.dir) { setInfo({ state: 'off' }); return false; }
  refreshMeta();
  const others = data.snapshots.filter(s => s.device !== meta.device).map(validEntries).filter(Boolean);
  const { base, writes } = reconcile(meta.base, readLocal(), others, Date.now());
  for (const [k, v] of Object.entries(writes)) {
    const storageKey = accountStorageKey(k);
    try { if (v == null) localStorage.removeItem(storageKey); else localStorage.setItem(storageKey, v); } catch { /* đầy */ }
  }
  meta.base = base;
  saveMeta();
  const devices = new Set([meta.device, ...data.snapshots.map(s => s.device)]).size;
  setInfo({ state: 'ok', label: data.label, dir: data.dir, devices });
  await push({ force: !lastSent });
  return Object.keys(writes).length > 0;
}

function syncNow() {
  busy ||= pull()
    .then(changed => {
      if (!changed) return;
      let last = 0;
      try { last = Number(sessionStorage.getItem(accountStorageKey(RELOADED))) || 0; sessionStorage.setItem(accountStorageKey(RELOADED), String(Date.now())); } catch { /* riêng tư */ }
      if (Date.now() - last > 10000) location.reload();
    })
    .catch(e => setInfo({ state: 'err', msg: String(e.message || e) }))
    .finally(() => { busy = null; });
  return busy;
}

const pushQuiet = opts => push(opts).catch(e => setInfo({ state: 'err', msg: String(e.message || e) }));

export function startSync() {
  try { meta = loadMeta(); } catch { return; }
  const anchor = document.getElementById('theme-toggle');
  if (anchor) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sync-btn';
    btn.addEventListener('click', () => syncNow());
    anchor.after(btn);
  }
  setInfo({});
  onLangChange(() => setInfo({}));
  syncNow();
  setInterval(() => { if (!busy) pushQuiet(); }, PUSH_EVERY);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncNow(); else pushQuiet();
  });
  window.addEventListener('pagehide', () => pushQuiet({ leaving: true }));
}

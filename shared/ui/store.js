import { pushProgress } from './progress-push.js';
import { currentUser, loadMathAnswerEvents, pushHubEvents, accountStorageKey } from '@host';

/* ---------------------------------------------------------------
   LƯU TRONG TRÌNH DUYỆT — 3 app chung một origin nên khoá luôn có tên môn
   (`progress:logic`, `exam:linalg`…) như CLAUDE.md yêu cầu. Chế độ riêng tư /
   đầy bộ nhớ thì lặng lẽ bỏ qua: app vẫn chạy, chỉ không nhớ.
   --------------------------------------------------------------- */

export const subjectOf = () => document.documentElement.dataset.subject || 'home';

export function load(key, fallback, subject = subjectOf()) {
  try {
    const v = localStorage.getItem(accountStorageKey(`${key}:${subject}`));
    return v == null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}

export function save(key, value, subject = subjectOf()) {
  try { localStorage.setItem(accountStorageKey(`${key}:${subject}`), JSON.stringify(value)); } catch { /* riêng tư / đầy */ }
}

export function drop(key, subject = subjectOf()) {
  try { localStorage.removeItem(accountStorageKey(`${key}:${subject}`)); } catch { /* riêng tư */ }
}

/** Nhật ký làm bài của môn (shared/logic/progress.js đọc). */
export const loadEvents = (subject) => load('progress', [], subject);

const MATH_DEVICE_KEY = 'math:device';

function mathDeviceId() {
  let id = load(MATH_DEVICE_KEY, null);
  if (!id) save(MATH_DEVICE_KEY, id = 'm' + crypto.randomUUID());
  return id;
}

function eventId(subject, e, index) {
  if (e?.id) return e.id;
  return ['legacy', subject, e?.ts ?? 0, e?.prefix ?? '', e?.kind ?? '', e?.ok ? 1 : 0, e?.mode ?? 'practice', index].join('|');
}

function withIds(subject, events) {
  let changed = false;
  const out = events.map((e, i) => {
    const id = eventId(subject, e, i);
    if (e.id === id) return e;
    changed = true;
    return { id, ...e };
  });
  return { events: out, changed };
}

const toHubEvent = (subject, e) => ({
  id: e.id,
  ts: Number(e.ts) || Date.now(),
  type: 'math.answer',
  payload: {
    subject,
    prefix: e.prefix,
    kind: e.kind,
    ok: Boolean(e.ok),
    mode: e.mode || 'practice',
    ...(e.tag ? { tag: e.tag } : {}),
  },
});

async function pushRemote(subject, events) {
  events = events.filter(e => !String(e.id).startsWith('snap|'));   // sự kiện lấy từ ảnh chụp Mac: đã ở máy chủ, không đẩy ngược
  if (!events.length) return;
  try {
    if (!(await currentUser())) return;
    await pushHubEvents(events.map(e => toHubEvent(subject, e)), mathDeviceId());
  } catch (e) {
    console.warn('Math progress sync failed:', e?.message || e);
  }
}

/** Nhập lịch sử math.answer từ Supabase vào localStorage của app hiện tại (M23). */
export async function hydrateProgress(subject = subjectOf()) {
  const user = await currentUser();
  if (!user?.id) return false;
  const remote = (await loadMathAnswerEvents())
    .filter(e => e.payload?.subject === subject)
    .map(e => ({
      id: e.id,
      ts: e.ts,
      prefix: e.payload.prefix,
      kind: e.payload.kind,
      ok: Boolean(e.payload.ok),
      mode: e.payload.mode || 'practice',
      ...(e.payload.tag ? { tag: e.payload.tag } : {}),
    }));
  const local0 = loadEvents(subject);
  const normalized = withIds(subject, local0);
  const merged = new Map();
  for (const e of normalized.events) merged.set(e.id, e);
  const sig = e => `${e.ts}|${e.prefix}|${e.kind}|${e.ok ? 1 : 0}|${e.mode}`;
  const seen = new Set([...merged.values()].map(sig));
  for (const e of remote) if (merged.has(e.id) || !seen.has(sig(e))) { merged.set(e.id, e); seen.add(sig(e)); }   // trùng chữ ký (cùng câu, id khác) chỉ tính một
  const events = [...merged.values()].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));
  const changed = normalized.changed || events.length !== local0.length || events.some((e, i) => JSON.stringify(e) !== JSON.stringify(local0[i]));
  if (changed) save('progress', events, subject);
  await pushRemote(subject, events);
  return changed;
}

/** Ghi một hoặc nhiều sự kiện { prefix, kind, ok, mode } — thêm dấu thời gian. */
export function record(list) {
  const subject = subjectOf();
  const all = loadEvents(subject);
  const now = Date.now();
  const added = [].concat(list).map((e, i) => ({ id: crypto.randomUUID(), ts: now + i, ...e }));
  all.push(...added);
  save('progress', all, subject);
  pushProgress(subject, all);
  pushRemote(subject, added);
}

/** Đẩy nhật ký sẵn có sau khi migrate ID + nhập lịch sử remote. */
export const syncProgress = async () => {
  const subject = subjectOf();
  const { events, changed } = withIds(subject, loadEvents(subject));
  if (changed) save('progress', events, subject);
  pushProgress(subject, events);
  await pushRemote(subject, events);
};

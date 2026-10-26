import { accountStorageKey } from '@host';

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

/** Ghi một hoặc nhiều sự kiện { prefix, kind, ok, mode } — thêm dấu thời gian. */
export function record(list) {
  const subject = subjectOf();
  const all = loadEvents(subject);
  const now = Date.now();
  const added = [].concat(list).map((e, i) => ({ id: crypto.randomUUID(), ts: now + i, ...e }));
  all.push(...added);
  save('progress', all, subject);
}

/** Gắn id cho sự kiện cũ (bản trước chưa có id); chỉ ở máy này. */
export const syncProgress = () => {
  const subject = subjectOf();
  const { events, changed } = withIds(subject, loadEvents(subject));
  if (changed) save('progress', events, subject);
};

/** Mọi khoá từ điển một kết quả máy giải dùng (tiêu đề, nhóm, why, dòng) — test dùng để chắc không khoá nào thiếu. */
export function keysOf({ answer, steps }) {
  const ks = new Set();
  const line = w => { if (typeof w !== 'string') ks.add(w.key); };
  answer.forEach(line);
  steps.forEach(st => { if (st.group) ks.add(st.group); ks.add(st.head.key); if (st.why) ks.add(st.why.key); st.lines.forEach(line); });
  return [...ks];
}

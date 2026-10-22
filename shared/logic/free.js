/* ---------------------------------------------------------------
   TỰ LUẬN (đề giống bộ đề giáo trình) — thuần. Máy KHÔNG chấm: mỗi bài có gợi ý theo thang, lời giải mẫu chia ý, các ý chấm
   (rubric) để NGƯỜI HỌC tự tích, và chỗ hay sai. Người học tự đánh giá ok / near / bad; kết quả chỉ để xếp lịch ôn.
   Bài = { id, ch, level 1–3, source: { name, license, url? }, vi: Text, en: Text }
   Text = { title, q, hints[2+] (phương pháp → điểm xuất phát → bước then chốt), solution[2+] (mỗi ý một chuỗi markdown),
            rubric[3–6], pitfalls[1+] }
   --------------------------------------------------------------- */

const TEXT_FIELDS = { title: 1, q: 1, hints: 2, solution: 2, rubric: 3, pitfalls: 1 };

/** Sự kiện math.answer khi người học tự đánh giá một bài tự luận (đã thống nhất với Study_Hub): đúng = tự đánh giá 'ok'. */

/** Danh sách lỗi của một bài (rỗng = hợp lệ). */
export function validateProblem(p) {
  const errs = [];
  const bad = m => errs.push(`${p?.id ?? '?'}: ${m}`);
  if (!p || typeof p.id !== 'string' || !/^[a-z0-9-]+$/.test(p.id)) return [`id không hợp lệ: ${p?.id}`];
  if (!/^ch\d+$/.test(p.ch ?? '')) bad('thiếu ch');
  if (![1, 2, 3].includes(p.level)) bad('level phải là 1, 2 hoặc 3');
  if (!p.source?.name || !p.source?.license) bad('thiếu nguồn (source.name, source.license)');
  for (const lang of ['vi', 'en']) {
    const t = p[lang];
    if (!t) { bad(`thiếu bản ${lang}`); continue; }
    for (const [k, min] of Object.entries(TEXT_FIELDS)) {
      const v = t[k];
      if (min === 1 && k !== 'pitfalls' ? !(typeof v === 'string' && v.trim()) : !(Array.isArray(v) && v.length >= min && v.every(s => typeof s === 'string' && s.trim()))) bad(`${lang}.${k} thiếu hoặc quá ít`);
    }
    if (t.rubric?.length > 6) bad(`${lang}.rubric tối đa 6 ý`);
  }
  if (p.vi && p.en && ['hints', 'solution', 'rubric'].some(k => p.vi[k]?.length !== p.en[k]?.length)) bad('vi và en phải cùng số gợi ý / ý lời giải / ý chấm');
  return errs;
}

/** Bài ngay sau bài hiện tại trong cùng danh sách (hết danh sách thì null). */
export function following(problems, id) {
  const i = problems.findIndex(p => p.id === id);
  return problems[i + 1] ?? null;
}

/** Gộp kết quả import.meta.glob('./content/free/*.json') thành một mảng bài (theo tên file rồi thứ tự trong file). */
export const freeFromGlob = mods => Object.keys(mods).sort().flatMap(k => mods[k].default ?? mods[k]);

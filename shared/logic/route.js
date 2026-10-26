/* ---------------------------------------------------------------
   ĐỊA CHỈ TRONG MỘT APP — menu theo VIỆC (RESEARCH U-R1):
     #/                        Tổng quan
     #/learn                   Học: danh sách chương
     #/learn/ch3/interactive   một khung của chương (theory | example | interactive)
     #/learn/ch3/interactive/1 … và cuộn tới công cụ thứ 2 trong khung (mở từ màn Công cụ)
     #/tools                   Công cụ: mọi công cụ bấm thử + ví dụ giải sẵn của các chương
     #/free  ·  #/free/<id>    Tự luận: danh sách · một bài
     #/mock                    Đề thi thử: chọn mã seed, in đề và đáp án (shared/ui/mock-screen.js)
   Địa chỉ cũ #/ch3/<mục con> (link trong bài học, bản trước) vẫn đọc được.
   Thuần (không đụng window) để test được; ui/router.js dùng.
   --------------------------------------------------------------- */

export const LEARN_SUBS = ['theory', 'example', 'interactive'];

/**
 * @param {string} hash
 * @param {string[]} chapters - vd ['ch1','ch2','ch3']
 * @returns {{view:string, ch?:string, sub?:string, at?:number, id?:string} | null}
 *   null = địa chỉ không có thật ⇒ nơi gọi về Tổng quan, không mở trang trống.
 */
export function parseRoute(hash, chapters) {
  const parts = String(hash ?? '').replace(/^#\/?/, '').split('/').filter(Boolean);
  const [head, a, b, c] = parts;
  if (!head) return { view: 'home' };
  if (chapters.includes(head)) {                       // địa chỉ cũ
    const sub = a ?? 'theory';
    return LEARN_SUBS.includes(sub) ? { view: 'learn', ch: head, sub } : null;
  }
  switch (head) {
    case 'learn':
      if (!a) return { view: 'learn' };
      if (!chapters.includes(a)) return null;
      if (!LEARN_SUBS.includes(b ?? 'theory')) return null;
      if (c === undefined) return { view: 'learn', ch: a, sub: b ?? 'theory' };
      return /^\d+$/.test(c) ? { view: 'learn', ch: a, sub: b, at: Number(c) } : null;
    case 'tools':
      return a ? null : { view: 'tools' };
    case 'free':
      return !a ? { view: 'free' } : /^[a-z0-9-]+$/.test(a) && !b ? { view: 'free', id: a } : null;
    case 'mock':
      return a ? null : { view: 'mock' };
    default:
      return null;
  }
}

/** Dựng địa chỉ chuẩn từ kết quả parseRoute (đổi địa chỉ cũ sang dạng mới). */
export function routeOf(r) {
  switch (r.view) {
    case 'learn': return r.ch ? `#/learn/${r.ch}/${r.sub ?? 'theory'}${r.at != null ? `/${r.at}` : ''}` : '#/learn';
    case 'tools': return '#/tools';
    case 'free': return r.id ? `#/free/${r.id}` : '#/free';
    case 'mock': return '#/mock';
    default: return '#/';
  }
}

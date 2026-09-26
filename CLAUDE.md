# CLAUDE.md — Quy tắc chung của repo (3 app ôn tập)

Claude Code đọc file này đầu mỗi phiên. Quy ước riêng của từng app nằm ở `logic/CLAUDE.md`,
`linalg/CLAUDE.md`, `discrete/CLAUDE.md`.

## Bối cảnh
- Chủ repo tự học các môn này. Trả lời bằng **tiếng Việt**.
- **Người học giao toàn quyền quyết định (2026-09-24):** tự cân nhắc ưu/nhược các cách, chọn rồi làm luôn, ghi lý do vào
  `DECISIONS.md` — **không hỏi lại** người học trước khi triển khai.
- Ba app ôn tập chạy localhost:5180 trên Mac; bản online do **Study Hub** deploy (D47): khi build, Study Hub tải repo này
  (đúng commit ghi trong `math.lock` của Study Hub) và đặt `/logic/ /linalg/ /discrete/` vào cùng worker. Giáo trình theo
  syllabus từng môn (xem `PLAN.md`).
- Tài liệu gốc: `PLAN.md` (lộ trình), `DECISIONS.md` (quyết định + lý do), `PROGRESS.md` (bàn giao).
- Repo `toeic-app` của người học **chỉ để tham khảo** cách tổ chức/UX. Không import chéo, không commit vào đó.

## Repo công khai — không để lộ thông tin cá nhân (2026-09-26)
- Không ghi tên thật, email, trường/lớp, đường dẫn trên máy (`/Users/…`, `~/Desktop/…`), tên máy, link riêng (worker,
  Supabase, Study Hub) vào code, tài liệu, commit hay PR. Gọi chủ repo là "người học". Dữ liệu test dùng `user@example.com`.
- Commit bằng tên `huybndc` + email noreply của GitHub (đã đặt trong `git config` của repo) — kiểm `git config user.email` trước khi commit.

## Giao thức phiên làm việc
**Đầu phiên:** đọc `PROGRESS.md` → `git status` + `git log --oneline -5` → tóm tắt 3–5 dòng: đang ở
đâu, hôm nay làm gì.

**Sau mỗi bước con:**
1. `npm test` pass (chạy ở gốc repo — test cả 3 app).
2. `npm run check` — không file nào vượt 450 dòng.
3. Tắt máy chủ dev/tiến trình nền không còn cần.
4. Cập nhật `PROGRESS.md`: vừa xong gì, bước tiếp theo cụ thể, vướng mắc.
5. `git remote -v` phải là `https://github.com/huybndc/CAU_Math.git` → rồi mới commit.
   Push lên **nhánh làm việc của phiên** sau mỗi commit (phiên cloud mất máy là mất việc chưa push — người học cho phép
   2026-09-24). Không push thẳng `main` hay nhánh người khác; gộp vào `main` qua PR.

**Chống mất việc khi phiên dừng đột ngột (người học, 2026-09-24):**
- Usage chạm **~95%** (giới hạn phiên / ngữ cảnh) ⇒ dừng việc đang làm, **commit ngay** (kể cả dở dang: `wip: …`) và push
  lên nhánh làm việc, cập nhật `PROGRESS.md` một dòng "đang dở ở đâu". Nếu phiên Claude đã dừng, người học dùng **opencode**
  để commit phần còn lại.
- Claude không tự đo được % usage ⇒ luôn commit sau **mỗi bước con** đã test xong, đừng dồn nhiều việc vào một commit.

**Nên gói khoảng 2 milestone mỗi phiên** để test và xem thật kỹ từng phần — đây là khuyến nghị, KHÔNG bắt buộc
(Người học, 2026-09-24): còn việc người học giao thì làm tiếp. Điều bắt buộc: không sang milestone mới khi test đang fail.

## Kiến trúc (D01, D02)
- Một máy chủ Vite ở gốc: `npm run dev` → `localhost:5180` (`/`, `/logic/`, `/linalg/`, `/discrete/`).
- `shared/` = phần dùng chung, import bằng `@shared/...`. Chỉ đưa vào `shared/` thứ **ít nhất 2 app dùng**.
- Mỗi app: `index.html` (shell) + `src/{logic,ui,pages,content,i18n}` + `tests/`.
- `src/logic/` là hàm thuần, không đụng `document`/`window`; `logic/` không import từ `ui/`.
- Cùng một origin cho cả 3 app → khoá localStorage phải có tiền tố app hoặc trường `subject`.

## Quy tắc code
- Một file một việc; ~400 dòng, trần 450.
- Hàm sinh ra phải dùng được ở nhiều nơi; hàm chỉ gọi một chỗ thì viết thẳng tại chỗ. Thấy hai nơi
  làm cùng một việc thì gom lại ngay.
- Trước khi tạo file mới: đã có helper chưa? nhét vào module đang có được không?
- Code và tên biến tiếng Anh; comment và tài liệu `.md` tiếng Việt.
- Commit dạng `type: mô tả ngắn` (feat, fix, test, docs, chore, refactor, content, style).

## Nội dung học tập (D05)
- Bám syllabus + sách của từng môn. Tự diễn đạt lại, ghi nguồn. Không commit slide/PDF/syllabus.
- Song ngữ VI/EN: hai từ điển cùng tập khoá, cùng tham số — test canh.
- Chữ trên màn hình ngắn: một thẻ một ý; chữ dài bỏ vào "Xem thêm".
- Lời giải phải DÒ LẠI ĐƯỢC: dạng có bảng chân trị thì vẽ bảng (`tableLine`), không chỉ in chuỗi bit. Đáp án + lời giải
  của dạng tính toán được kiểm bằng một bộ tính ĐỘC LẬP viết riêng trong test (`tests/solution-oracle*.test.js`), đọc đúng
  chữ/hình người học thấy và dò từng dòng lời giải (D41). Cả 3 app đã phủ mọi dạng tính toán (D44–D46): thêm dạng mới thì
  thêm kiểm độc lập cùng lúc, và thử đột biến (cố làm sai lời giải) để chắc test đỏ.

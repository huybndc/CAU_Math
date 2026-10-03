# Quy tắc chung của repo (3 app ôn tập)

## Bối cảnh
- Trả lời người học bằng **tiếng Việt**.
- Người học giao toàn quyền quyết định: tự cân nhắc, chọn cách làm, ghi lý do vào `DECISIONS.md`, không hỏi lại.
- Ba app ôn tập chạy localhost:5180; bản online do **Study Hub** deploy — hiện build từ bản mirror trong Study_Hub (`math.lock` ghim commit repo này mới là kế hoạch, chưa có; xem PROGRESS "Tự soi"). Giáo trình theo syllabus từng môn (`PLAN.md`).
- Tài liệu gốc: `PLAN.md` (lộ trình), `DECISIONS.md` (quyết định + lý do), `PROGRESS.md` (bàn giao).
- Repo `toeic-app` chỉ để tham khảo cách tổ chức/UX. Không import chéo, không commit vào đó.

## Repo công khai — không để lộ thông tin cá nhân
- Không ghi tên thật, email, trường/lớp, đường dẫn trên máy (`/Users/…`, `~/Desktop/…`), tên máy, link riêng (worker, Supabase, Study Hub) vào code, tài liệu, commit hay PR. Gọi chủ repo là "người học". Dữ liệu test dùng `user@example.com`.
- Commit bằng tên `huybndc` + email noreply GitHub; kiểm `git config user.email` trước khi commit.

## Giao thức phiên làm việc
**Đầu phiên:** đọc `PROGRESS.md` → `git status` + `git log --oneline -5` → tóm tắt 3–5 dòng: đang ở đâu, hôm nay làm gì.

**Sau mỗi bước con:**
1. `npm test` pass ở gốc repo (test cả 3 app).
2. `npm run check` — không file nào vượt 450 dòng.
3. Tắt máy chủ dev/tiến trình nền không còn cần.
4. Cập nhật `PROGRESS.md`: vừa xong gì, bước tiếp theo cụ thể, vướng mắc.
5. `git remote -v` phải là `https://github.com/huybndc/CAU_Math_App.git` → rồi mới commit. Push lên nhánh làm việc của phiên; không push thẳng `main` hay nhánh người khác; gộp vào `main` qua PR.

**Chống mất việc khi phiên dừng đột ngột:**
- Usage chạm ~95% ⇒ dừng việc, commit ngay (kể cả dở dang: `wip: …`) và push lên nhánh làm việc; cập nhật `PROGRESS.md` một dòng "đang dở ở đâu". Nếu phiên đã dừng, người học tự commit phần còn lại.
- Không tự đo được % usage ⇒ commit sau mỗi bước con đã test xong, đừng dồn nhiều việc vào một commit.
- Nên gói khoảng 2 milestone mỗi phiên (khuyến nghị, không bắt buộc); không sang milestone mới khi test đang fail.

## Kiến trúc (D01, D02)
- Một máy chủ Vite ở gốc: `npm run dev` → `localhost:5180` (`/`, `/logic/`, `/linalg/`, `/discrete/`).
- `shared/` = phần dùng chung, import bằng `@shared/...`. Chỉ đưa vào `shared/` thứ ít nhất 2 app dùng.
- Mỗi app: `index.html` (shell) + `src/{logic,ui,pages,content,i18n}` + `tests/`.
- `src/logic/` là hàm thuần, không đụng `document`/`window`; `logic/` không import từ `ui/`.
- Cùng một origin cho cả 3 app → khoá localStorage phải có tiền tố app hoặc trường `subject`.

## Quy tắc code
- Một file một việc; mục tiêu khoảng 400 dòng, trần 450.
- Hàm sinh ra phải dùng được ở nhiều nơi; hàm chỉ gọi một chỗ thì viết thẳng tại chỗ. Thấy hai nơi làm cùng một việc thì gom lại.
- Trước khi tạo file mới: đã có helper chưa? nhét vào module đang có được không?
- Code và tên biến tiếng Anh; comment và tài liệu `.md` tiếng Việt.
- Commit dạng `type: mô tả ngắn` (feat, fix, test, docs, chore, refactor, content, style).

## Nội dung học tập (D05)
- Bám syllabus + sách của từng môn. Tự diễn đạt lại, ghi nguồn. Không commit slide/PDF/syllabus.
- Câu khái niệm: ưu tiên đề/bài có lời giải bên ngoài (MIT OCW, lời giải của tác giả sách), đáp án kiểm bằng `check` chạy bộ giải của app; chỉ sửa khi nguồn sai; AI phái sinh chỉ lấp chỗ trống (D48).
- Song ngữ VI/EN: hai từ điển cùng tập khoá, cùng tham số — test canh.
- Chữ trên màn hình ngắn: một thẻ một ý; chữ dài bỏ vào "Xem thêm".
- Lời giải phải dò lại được: dạng có bảng chân trị thì vẽ bảng (`tableLine`), không chỉ in chuỗi bit. Đáp án + lời giải của dạng tính toán được kiểm bằng một bộ tính độc lập viết riêng trong test (`tests/solution-oracle*.test.js`), đọc đúng chữ/hình người học thấy và dò từng dòng lời giải (D41). Cả 3 app đã phủ mọi dạng tính toán (D44–D46): thêm dạng mới thì thêm kiểm độc lập cùng lúc và thử đột biến để chắc test đỏ.

Quy tắc riêng của môn: `logic/AGENTS.md`, `linalg/AGENTS.md`, `discrete/AGENTS.md`.

## Phạm vi repo và quy trình
- Đọc `REPO_BOUNDARY.md` trước khi sửa. CAU_Math_App là nguồn chuẩn cho syllabus/nội dung toán, câu hỏi, bộ giải, oracle và UI toán; Study_Hub sở hữu Hub, tài khoản, vault và tổng hợp liên môn.
- Không thêm logic Hub vào CAU_Math_App, không sửa toán trong bản mirror ở Study_Hub, và không import source trực tiếp giữa hai repo.
- Tài liệu lịch sử có thể mô tả kiến trúc repo cũ; xem đó là lịch sử trừ khi mâu thuẫn với `REPO_BOUNDARY.md`.
- Tích hợp qua contract/event; sự kiện `math.answer` gồm `subject`, `prefix`, `kind`, `ok`, `mode`, có thể có `tag`. Không thay đổi phạm vi này nếu không có yêu cầu contract rõ ràng.
- Đầu việc: đọc `REPO_BOUNDARY.md` và `PROGRESS.md`, xem status và commit gần nhất. Giữ thay đổi nhỏ, chạy test phần ảnh hưởng rồi `npm test` và `npm run check`; cập nhật `PROGRESS.md` sau thay đổi có ý nghĩa.
- Không commit tài liệu môn học riêng, bí mật hoặc dữ liệu cá nhân.

## Đề thi thử (D53)
- Kiểu TOPIK: chia theo Part (mỗi chương một Part, số câu cố định, dễ → khó) hoặc trộn ngẫu nhiên không hiện tên chương; 80% tự luận · 20% trắc nghiệm, áp dụng cho mọi môn. Môn mới: ngân hàng phải có `choiceBank` và đủ dạng tự luận.

## Layout and help rules
- Each screen must fit one viewport (about 1280×720). Do not add page-level vertical scroll. A long list scrolls inside its own card.
- Put help on the screen where the problem occurs, as the `?` button (`shared/ui/screen-help.js`). Do not add a separate help page or help link.
- When you add a feature, add one row to the `HELP` entry of its screen, in Vietnamese and English.

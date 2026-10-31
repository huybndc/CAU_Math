# Quy tắc chung của repo

## Bối cảnh
- Trả lời người học bằng **tiếng Việt**.
- Người học giao toàn quyền quyết định: tự cân nhắc, chọn cách làm, sửa/commit/merge, ghi lý do vào `DECISIONS.md`, không hỏi lại. Việc khó hoàn tác: chuẩn bị đường lui và báo.
- Ba app ôn tập chạy localhost:5180; bản online chạy riêng ở Worker `cau-math`, deploy bằng `npm run deploy` từ `main` sau mỗi merge có code, kiểm bằng `verify-deploy.sh CAU_Math` ("ĐÃ LÊN"). Không đăng nhập, không đồng bộ giữa máy. Study Hub chỉ link sang (bỏ mirror từ 2026-10-26). Giáo trình theo syllabus từng môn (`PLAN.md`).
- Tài liệu gốc: `PLAN.md` (lộ trình), `DECISIONS.md` (quyết định + lý do), `PROGRESS.md` (bàn giao).
- `toeic-app` chỉ để tham khảo UX; không import, không commit vào đó.

## Repo công khai — không để lộ thông tin cá nhân
- Không ghi tên thật, email, trường/lớp, đường dẫn trên máy (`/Users/…`, `~/Desktop/…`), tên máy, link riêng (worker, Supabase, Study Hub) vào code, tài liệu, commit hay PR. Gọi chủ repo là "người học". Dữ liệu test dùng `user@example.com`.
- Commit bằng tên `huybndc` + email noreply GitHub; kiểm `git config user.email` trước khi commit.

## Giao thức phiên làm việc
**Đầu phiên:** đọc `PROGRESS.md` → `git status` + `git log --oneline -5` → tóm tắt 3–5 dòng: đang ở đâu, hôm nay làm gì.

**Sau mỗi bước con:** `npm test` và `npm run check` (trần cỡ file: `scripts/size-baseline.json`) xanh → tắt máy chủ dev thừa → cập nhật `PROGRESS.md` (vừa xong, bước tiếp, vướng mắc) → `git remote -v` phải là `https://github.com/huybndc/CAU_Math_App.git` rồi mới commit. Push nhánh làm việc; vào `main` chỉ qua PR.

**Chống mất việc:** commit sau mỗi bước con đã test xong. Usage ~95% ⇒ commit ngay (`wip: …`), push nhánh làm việc, ghi 1 dòng "đang dở ở đâu" vào `PROGRESS.md`. Không sang milestone mới khi test đang fail.

## Kiến trúc (D01, D02)
- Một máy chủ Vite ở gốc: `npm run dev` → `localhost:5180` (`/logic/`, `/linalg/`, `/discrete/`; `/` chuyển hướng tới `/logic/`).
- `shared/` = phần dùng chung, import bằng `@shared/...`. Chỉ đưa vào `shared/` thứ ít nhất 2 app dùng.
- Mỗi app: `index.html` (shell) + `src/{logic,ui,pages,content,i18n}` + `tests/`.
- `src/logic/` là hàm thuần, không đụng `document`/`window`; `logic/` không import từ `ui/`.
- Cùng một origin cho cả 3 app → khoá localStorage phải có tiền tố app hoặc trường `subject`.

## Quy tắc code
- Một file một việc; mục tiêu khoảng 400 dòng code, trần 450 cho file mới. Không tách file chỉ vì con số.
- Hàm sinh ra phải dùng được ở nhiều nơi; hàm chỉ gọi một chỗ thì viết thẳng tại chỗ. Thấy hai nơi làm cùng một việc thì gom lại.
- Trước khi tạo file mới: đã có helper chưa? nhét vào module đang có được không?
- Đổi UI (thêm file `src/ui`/`shared/ui`, đổi `data-testid`) thì sửa `FEATURES.md` trong cùng PR — `shared/tests/features-sync.test.js` canh. Gỡ tính năng thì thêm chuỗi vào danh sách `REMOVED` trong test đó.
- Code và tên biến tiếng Anh; comment và tài liệu `.md` tiếng Việt.
- Commit dạng `type: mô tả ngắn` (feat, fix, test, docs, chore, refactor, content, style).

## Nội dung học tập (D05)
- Bám syllabus + sách của từng môn. Tự diễn đạt lại, ghi nguồn. Không commit slide/PDF/syllabus.
- Câu khái niệm: ưu tiên đề/bài có lời giải bên ngoài (MIT OCW, lời giải của tác giả sách), đáp án kiểm bằng `check` chạy bộ giải của app; chỉ sửa khi nguồn sai; AI phái sinh chỉ lấp chỗ trống (D48).
- Song ngữ VI/EN: hai từ điển cùng tập khoá, cùng tham số — test canh.
- Chữ trên màn hình ngắn: một thẻ một ý; chữ dài bỏ vào "Xem thêm".
- Lời giải phải dò lại được: dạng có bảng chân trị thì vẽ bảng (`tableLine`), không chỉ in chuỗi bit. Đáp án + lời giải của dạng tính toán được kiểm bằng một bộ tính độc lập viết riêng trong test (`tests/solution-oracle*.test.js`), đọc đúng chữ/hình người học thấy và dò từng dòng lời giải (D41). Cả 3 app đã phủ mọi dạng tính toán (D44–D46): thêm dạng mới thì thêm kiểm độc lập cùng lúc và thử đột biến để chắc test đỏ.

## Phạm vi repo và quy trình
- Đọc `REPO_BOUNDARY.md` trước khi sửa. CAU_Math_App là nguồn chuẩn cho syllabus/nội dung toán, câu hỏi, bộ giải, oracle và UI toán; Study_Hub sở hữu Hub, tài khoản, vault và tổng hợp liên môn.
- Không thêm logic Hub vào CAU_Math_App, và không import source trực tiếp giữa hai repo.
- Tài liệu lưu trữ (`docs/*-ARCHIVE.md`) là lịch sử; mâu thuẫn thì theo `REPO_BOUNDARY.md`.
- Không còn tích hợp event với Study_Hub (2026-10-26): Hub chỉ link sang bản chạy riêng. Muốn nối lại ⇒ cần contract mới, hỏi Study_Hub trước.

## Thêm môn mới (đo 2026-10-30)
- Bản chép từ Study_Hub (token, kỳ học, môn practice): `npm run sync:hub`; test `hub-sync` đỏ khi lệch. Môn có luyện riêng: `npm run sync:subjects` thêm môn thiếu với `app: false` (chưa có thư mục, mọi nơi bỏ qua). Có thư mục rồi thì bỏ `app: false`, điền màu + ngăn nháp.
- Thêm 1 dòng vào `shared/subjects.json` (id, tên vi/en, `accent` sáng/tối, `tabs` nháp) → `npm run gen:subjects` (màu trong tokens.css, link ở index.html gốc).
- Tạo thư mục `<id>/` theo mẫu một môn có sẵn (index.html có `data-subject`, `src/{i18n,logic,content}`, `tests/`). Vite, nút chọn môn, design:check, Playwright tự đọc danh sách.
- Chỉ cần thêm code khi môn có bộ giải riêng (vd `scripts/gen-c-bank.mjs` cho C). Cập nhật `FEATURES.md`.

## Đề thi thử (D53)
- Kiểu TOPIK: chia theo Part (mỗi chương một Part, số câu cố định, dễ → khó) hoặc trộn ngẫu nhiên không hiện tên chương; 80% tự luận · 20% trắc nghiệm, áp dụng cho mọi môn. Môn mới: ngân hàng phải có `choiceBank` và đủ dạng tự luận.

## Bố cục và trợ giúp
- Mỗi màn vừa một khung (~1280×720), không cuộn cả trang; danh sách dài cuộn trong thẻ của nó. Không bỏ thông tin để né cuộn: dùng bố cục, thu gọn, cuộn trong thẻ.
- Trợ giúp là nút `?` ngay trên màn đó (`shared/ui/screen-help.js`), không làm trang/link trợ giúp riêng. Thêm tính năng ⇒ thêm 1 dòng vi + en vào `HELP` của màn.

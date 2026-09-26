# Hướng dẫn: học trên nhiều máy bằng đám mây — hiệu quả, tốn ít dung lượng

> Hướng dẫn cài (2026-09-25). Làm lần lượt từ Bước 1; mỗi bước có dòng **Xong khi** để tự kiểm.
> Thời gian: lần đầu ~20 phút cho hai máy; về sau mỗi ngày gần như không phải làm gì.

---

## Tóm tắt: cái gì để ở đâu

| Thứ | Để ở | Đồng bộ bằng | Tốn chỗ trên máy | Vì sao |
|---|---|---|---|---|
| Code 3 app ôn tập | `~/Claude_projects/CAU_Math` | **GitHub** (`git pull`) | ~40 MB (gồm `node_modules`) | Git hiểu phiên bản, không bao giờ ra "file 2"; `node_modules` tự tạo lại bằng `npm install`, không cần đồng bộ |
| Tiến độ học trong app | `iCloud Drive/CAU_Math-sync/` | **app tự làm** (D37) | vài chục KB | Máy chủ app tự ghi/đọc file, không phải bấm gì |
| Ghi chú Obsidian | `iCloud Drive/Obsidian/CAU_1st` | **iCloud** | vài MB | Chữ thuần, nhỏ; mở được cả trên iPhone |
| PDF, slide, syllabus | `iCloud Drive/CAU-tai-lieu` | **iCloud**, để trên mây | ~0 (chỉ tải khi mở) | File nặng nhất ⇒ không giữ sẵn trong máy |

**Vì sao chọn iCloud Drive** mà không phải Google Drive / OneDrive / Dropbox: có sẵn trong macOS (không phải cài app
đồng bộ riêng — app Google Drive tự nó đã tốn vài trăm MB và một bộ nhớ đệm), 5 GB miễn phí là thừa cho ghi chú + tiến độ,
và Obsidian trên iPhone chỉ đọc được vault nằm trong iCloud.
Có một máy chạy **Windows** hoặc cần nhiều chỗ hơn 5 GB ⇒ xem [Phụ lục A — Google Drive](#phụ-lục-a--dùng-google-drive-thay-icloud).

**Tuyệt đối không** đặt thư mục code (`CAU_Math`, có `.git` và `node_modules`) vào iCloud/Google Drive: dịch vụ đồng bộ
chép từng file lẻ, không hiểu Git ⇒ dễ sinh `index 2.js`, hỏng `.git`, và "tối ưu dung lượng" có thể đẩy file lên mây làm app
không chạy được.

---

## Bước 1 — Bật iCloud Drive trên CẢ HAI máy

1. **Cài đặt hệ thống** (System Settings) → bấm **tên của bạn** trên cùng → **iCloud**.
2. **iCloud Drive** → bật **Đồng bộ hoá máy Mac này** (Sync this Mac).
3. **Thư mục Màn hình nền & Tài liệu** (Desktop & Documents): **để TẮT** — không cần, và bật lên thì mọi thứ lặt vặt trên
   Desktop cũng chiếm 5 GB.
4. **Tối ưu dung lượng máy Mac** (Optimize Mac Storage): **BẬT** — file lâu không mở sẽ chỉ còn trên mây, máy tự dọn khi đầy.
   (Thư mục cần luôn có sẵn thì ghim riêng ở Bước 3 và Bước 4.)
5. Làm y hệt trên máy thứ hai, **cùng một Apple ID**.

**Xong khi:** Finder → thanh bên trái có mục **iCloud Drive** trên cả hai máy.

---

## Bước 2 — Code: GitHub (máy đang dùng + máy mới)

**Máy đã có repo** (máy chính): chỉ cần đưa về bản mới nhất.

```bash
cd ~/Claude_projects/CAU_Math
git checkout main
git pull
npm install
```

**Máy thứ hai** (chưa có repo) — cần Git và Node.js (≥ 20):

```bash
# Chưa có Node.js: tải bản LTS ở https://nodejs.org rồi cài.
# Chưa có git: chạy "xcode-select --install" (macOS tự hỏi cài Command Line Tools).
mkdir -p ~/Claude_projects
git clone https://github.com/huybndc/CAU_Math.git ~/Claude_projects/CAU_Math
cd ~/Claude_projects/CAU_Math
npm install
npm run launcher        # tạo app "Ôn tập" trong ~/Applications — mở bằng ⌘ Space
```

**Hằng ngày:** trước khi học, nếu có bản mới (Claude vừa làm thêm tính năng) thì `git pull`. Không có gì mới thì bỏ qua.

**Xong khi:** mở app "Ôn tập" (hoặc `npm run dev`) trên cả hai máy, vào được `localhost:5180` và thấy đủ 3 môn.

---

## Bước 3 — Tiến độ học: tự đồng bộ (không phải cài gì thêm)

App đã có sẵn tính năng này (D37): máy chủ của app tự tìm iCloud Drive, ghi tiến độ vào thư mục `CAU_Math-sync/`, mỗi máy
một file; iCloud chép sang máy kia; mở app ở máy kia là tự gộp — câu đã làm ở cả hai máy đều được giữ, không mất câu nào.

1. Trên **máy chính**, mở app, làm thử 1–2 câu.
2. Nhìn **nút đám mây** cạnh nút sáng/tối ở menu trái: **chấm xanh** = đã đồng bộ. Rê chuột lên để xem đường dẫn thư mục —
   phải là `…/iCloud Drive/CAU_Math-sync` (hoặc `Mobile Documents/com~apple~CloudDocs/CAU_Math-sync`).
3. **Ghim thư mục cho luôn có sẵn** (quan trọng khi đã bật Tối ưu dung lượng ở Bước 1):
   Finder → iCloud Drive → chuột phải **CAU_Math-sync** → **Giữ lại bản đã tải về** (Keep Downloaded).
   Làm trên cả hai máy. Thư mục chỉ vài chục KB nên ghim không tốn gì.
4. Sang **máy thứ hai**, mở app ⇒ chờ vài giây ⇒ trang tự tải lại một lần và hiện tiến độ của máy kia.

**Lưu ý**
- Tiến độ chỉ đồng bộ khi **app đang chạy bằng máy chủ của nó** (app "Ôn tập" hoặc `npm run dev`) — mở file HTML trực tiếp thì không.
- Máy có nhiều dịch vụ đám mây: app ưu tiên chỗ nào **đã có** `CAU_Math-sync`. Muốn chỉ định hẳn:
  tạo file `.env` ở gốc repo (chép từ `.env.example`) và ghi
  `STUDY_SYNC_DIR=/Users/<tên>/Library/Mobile Documents/com~apple~CloudDocs/CAU_Math-sync`. Muốn tắt: `STUDY_SYNC_DIR=off`.
- Hai máy phải dùng **cùng một** dịch vụ (cùng iCloud, hoặc cùng Google Drive).

**Xong khi:** làm 1 câu ở máy A → mở app ở máy B → ở Tổng quan số câu 7 ngày qua tăng đúng 1.

---

## Bước 4 — Ghi chú Obsidian: vault trong iCloud

1. **Trên iPhone** (nếu muốn đọc ghi chú trên điện thoại): cài Obsidian → **Create new vault** → bật **Store in iCloud** → đặt tên
   tạm. Việc này tạo thư mục **Obsidian** trong iCloud Drive. (Không dùng iPhone thì trên Mac tạo thư mục
   `iCloud Drive/Obsidian` bằng tay cũng được.)
2. **Trên Mac chính:** Finder → iCloud Drive → **Obsidian** → **kéo thả (chuyển, không chép)** thư mục vault `CAU_1st` vào đây.
3. Mở Obsidian → biểu tượng vault góc dưới trái → **Open folder as vault** → chọn `iCloud Drive/Obsidian/CAU_1st`.
4. Chuột phải thư mục `CAU_1st` → **Giữ lại bản đã tải về** (ghi chú phải mở được cả khi mất mạng; vault chữ thuần rất nhỏ).
5. **Máy thứ hai / iPhone:** mở Obsidian → mở vault `CAU_1st` (chờ iCloud tải xong lần đầu).

**Nguyên tắc để không sinh "Note 2.md":** đừng sửa **cùng một note** trên hai máy trong cùng lúc. Học xong ở máy này, chờ
biểu tượng đám mây trên file hết quay (vài giây) rồi mới mở máy kia.

**Xong khi:** sửa một note ở máy A, vài giây sau thấy thay đổi ở máy B.

---

## Bước 5 — PDF, slide, syllabus: để trên mây, chỉ tải khi mở

Đây là phần **nặng nhất** (sách PDF vài chục MB mỗi cuốn) ⇒ đừng giữ sẵn trong máy.

1. Tạo thư mục `iCloud Drive/CAU-tai-lieu/` với các thư mục con `Logic`, `LinAlg`, `Discrete`.
2. Chuyển PDF/slide vào đây (từ thư mục tài liệu của bạn).
3. Tài liệu **đang dùng tuần này**: chuột phải → **Giữ lại bản đã tải về**.
4. Tài liệu **đã học xong / ít mở**: chuột phải → **Xoá bản tải về** (Remove Download) — file vẫn nằm trên iCloud, máy lấy lại chỗ
   ngay; bấm đúp là tự tải về khi cần.

**Biểu tượng trong Finder:** ☁︎↓ = chỉ có trên mây · vòng tròn quay = đang tải · không biểu tượng = có sẵn trong máy.

**Xong khi:** Finder hiện ☁︎ cạnh các PDF cũ, và "Giới thiệu máy Mac này → Dung lượng" thấy chỗ trống tăng.

---

## Bước 6 — Dọn dung lượng phía code (tuỳ chọn, làm khi máy đầy)

| Lệnh | Giải phóng | An toàn? |
|---|---|---|
| `du -sh ~/.npm` rồi `npm cache clean --force` | bộ nhớ đệm npm, thường vài trăm MB | ✓ — `npm install` tự tải lại khi cần |
| `rm -rf ~/Claude_projects/CAU_Math/dist` | bản build cũ (nếu có) | ✓ — app chạy bằng `npm run dev`, không cần `dist` |
| `rm -rf ~/Claude_projects/CAU_Math/node_modules` | ~34 MB | ✓ nhưng phải `npm install` lại trước khi mở app |

Không cần dọn `.git` (~5 MB): đó là toàn bộ lịch sử code, nhỏ và có ích.

---

## Mỗi ngày học: checklist 10 giây

1. (Nếu Claude vừa thêm tính năng) `cd ~/Claude_projects/CAU_Math && git pull`.
2. Mở app "Ôn tập" ⇒ thấy **chấm xanh** ở nút đám mây.
3. Học. Đổi máy thì cứ mở app ở máy kia — tiến độ tự sang.
4. Ghi chú Obsidian: sửa xong ở máy này rồi mới mở máy kia.

---

## Khi có trục trặc

| Hiện tượng | Nguyên nhân hay gặp | Cách xử lý |
|---|---|---|
| Nút đám mây không có chấm xanh | Chưa bật iCloud Drive, hoặc mở app không qua máy chủ | Làm lại Bước 1; mở bằng app "Ôn tập" / `npm run dev` |
| Máy B không thấy tiến độ máy A | Hai máy dùng hai dịch vụ khác nhau, hoặc iCloud chưa tải xong | Rê chuột nút đám mây ở hai máy, so đường dẫn; ghim `CAU_Math-sync` (Bước 3.3); đặt `STUDY_SYNC_DIR` giống nhau |
| Có file `Note 2.md`, `Note (1).md` | Sửa cùng note trên hai máy lúc chưa đồng bộ xong | Mở cả hai, chép phần khác biệt sang một file, xoá file thừa |
| iCloud báo đầy 5 GB | Ảnh iPhone / Desktop & Documents đang chiếm | Tắt đồng bộ Ảnh hoặc Desktop & Documents; PDF chuyển sang Google Drive (Phụ lục A) |
| `git pull` báo "conflict" | Có sửa tay trong repo trên máy đó | `git stash` rồi `git pull` (hoặc nhờ Claude xem) |
| iCloud không đồng bộ gì cả | Lỗi phiên đăng nhập | Tắt rồi bật lại **Đồng bộ hoá máy Mac này**; khởi động lại máy. File đã lên mây không mất |

---

## Phụ lục A — Dùng Google Drive thay iCloud

Chọn Google Drive khi **một máy chạy Windows**, hoặc cần hơn 5 GB (Google cho 15 GB miễn phí).

1. Cài **Google Drive for desktop** trên cả hai máy, đăng nhập cùng tài khoản Google.
2. Trong cài đặt Google Drive → **Tuỳ chọn** (Preferences) → **Google Drive** → chọn **Truyền trực tuyến tệp** (Stream files):
   file chỉ nằm trên mây, mở mới tải ⇒ ít tốn chỗ nhất. (Không chọn "Phản chiếu tệp" / Mirror — nó chép mọi thứ về máy.)
3. Thư mục cần luôn có sẵn (`CAU_Math-sync`, vault Obsidian): chuột phải → **Tuỳ chọn ngoại tuyến** → **Có sẵn ngoại tuyến**.
4. App tự tìm `Google Drive/My Drive` (hoặc `Drive của tôi`). Nếu máy vẫn còn iCloud và bạn muốn dùng Google Drive, đặt
   `STUDY_SYNC_DIR` trong `.env` trỏ tới `…/My Drive/CAU_Math-sync` trên **cả hai** máy.
5. Obsidian trên iPhone không mở được vault trong Google Drive ⇒ nếu cần đọc ghi chú trên điện thoại thì giữ vault ở iCloud.

---

## Phụ lục B — Những thứ KHÔNG nên đồng bộ và lý do

| Thứ | Lý do |
|---|---|
| `node_modules/` | Hàng chục nghìn file nhỏ, đồng bộ rất chậm; `npm install` tạo lại trong một phút |
| `.git/` | Dịch vụ đồng bộ chép từng file lẻ ⇒ có thể làm hỏng kho Git; GitHub mới là "đám mây" của code |
| `.env` | Chứa khoá Gemini — không đưa lên đâu cả (repo cũng đã chặn bằng `.gitignore`) |
| Dữ liệu trình duyệt (localStorage) | Không cần: app đã tự đồng bộ tiến độ qua `CAU_Math-sync` |

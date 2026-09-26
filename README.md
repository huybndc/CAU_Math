# CAU Math

Bộ ba app ôn tập cho các môn toán – máy tính năm nhất đại học:
**Logic Circuit · Linear Algebra · Discrete Math**. Học theo đúng syllabus từng tuần, luyện bằng
thao tác trực quan thay vì gõ chữ, và làm bài full 60–90 phút như thi thật.

*A self-study companion for three first-year CAU courses — lessons as short cards, auto-generated
practice graded on the spot, and timed mock exams. Runs locally; no account, no tracking.*

| Môn | Giáo trình | Trạng thái |
|---|---|---|
| Logic Circuit | Mano & Ciletti, *Digital Design* (6th ed.) | Ch.1–3 · 28 dạng câu tự sinh |
| Linear Algebra | Strang, *Introduction to Linear Algebra* (4th ed.) | Ch.1–3 · bài luyện tự chấm |
| Discrete Math | Lehman–Leighton–Meyer, *Mathematics for Computer Science* (MIT 6.042J, 2017) | đang xây dựng |

## Tính năng

- **Menu theo việc:** Tổng quan · Học · Luyện tập · Thi thử — mỗi màn một việc chính, chọn chương bằng thanh chương.
- **Tổng quan:** dải 16 tuần của học kỳ + số ngày tới giữa kỳ, gợi ý "hôm nay làm gì" kèm lý do, số liệu 7 ngày.
- **Bài học dạng thẻ:** mỗi thẻ một ý (≤ 120 chữ), câu thử nhanh ngay trong thẻ.
- **Luyện tập theo dạng:** 10 câu tự sinh, chấm ngay, có gợi ý và lời giải. Mỗi dạng ghi trước thời
  gian và % đúng 7 ngày qua, đánh dấu dạng **cần luyện nhất**.
- **Bài full 60–90 phút:** chọn chương + thời lượng; *Thi thử* (tính giờ, nộp mới chấm, hết giờ tự nộp) hoặc
  *Bài tập dài* (chấm từng câu). F5 không mất bài; kết quả theo chương, dạng còn sai, xem lại từng câu.
- **Trả lời bằng thao tác:** bấm bit, điền bảng chân trị, **khoanh nhóm trực tiếp trên K-map**,
  chọn ký hiệu cổng, đọc mạch AND–OR.
- **Tự luận hoặc trắc nghiệm** (Luyện tập): trắc nghiệm có nhiễu là lỗi thật, không phải đáp án bừa — khó ngang tự luận.
- **Chấm theo giá trị, không so chuỗi:** biểu thức tương đương đều đúng; câu rút gọn chấm thêm độ
  tối giản (so với Quine–McCluskey).
- **Nháp** tích hợp, song ngữ **VI / EN**, sáng / tối. Thiết kế cho máy tính (chạy localhost).

## Chạy thử

Yêu cầu: Node.js 20+.

```bash
git clone https://github.com/huybndc/CAU_Math.git
cd CAU_Math
npm install
npm run dev          # mở http://localhost:5180
```

Trên Mac có thể tạo app mở nhanh: `npm run launcher` (⌘ Space → "On tap").

| Địa chỉ | Nội dung |
|---|---|
| `localhost:5180/` | Tổng quan cả ba môn: tuần học, giữa kỳ, tiến độ |
| `localhost:5180/logic/` | Logic Circuit |
| `localhost:5180/linalg/` | Linear Algebra |
| `localhost:5180/discrete/` | Discrete Math (D1–D7) |

Luôn dùng cổng **5180**: tiến độ lưu trong trình duyệt theo địa chỉ, đổi cổng sẽ thấy trống.

### Học trên 2 máy (tự đồng bộ, D37)
Hướng dẫn từng bước (GitHub cho code, iCloud cho tiến độ + ghi chú + PDF, cách đỡ tốn dung lượng): [`docs/huong-dan-dam-may.md`](docs/huong-dan-dam-may.md).

Máy chủ tự tìm iCloud Drive / Google Drive / OneDrive / Dropbox và lưu tiến độ vào thư mục `CAU_Math-sync/` trong đó.
Mở app trên máy kia là tự nhận phần đã học. Nút mây cạnh nút sáng/tối có chấm xanh là đang đồng bộ; rê chuột để xem thư mục.
Hai máy cần dùng **cùng một** dịch vụ đám mây. Muốn chọn thư mục khác thì đặt `STUDY_SYNC_DIR=/đường/dẫn` trong `.env`
(`off` để tắt).

## Kiểm thử

```bash
npm test             # ~800 test: mọi dạng câu × 200 hạt giống, i18n VI/EN, định tuyến, nhật ký
npm run check        # không file nào vượt 450 dòng
```

Mỗi dạng câu tự sinh có **test tính chất**: đáp án của chính câu được chấm đúng, đáp án bị sửa bị
chấm sai, mọi chuỗi hiển thị có đủ ở cả hai ngôn ngữ.

## Soạn câu khái niệm bằng Gemini (tuỳ chọn)

Câu "vì sao / chỗ hay sai" do Gemini soạn theo lô; máy kiểm lại phép tính, bạn duyệt từng câu rồi mới vào app (D27).
App chạy không cần khoá — chỉ bước soạn mới cần.

```bash
cp .env.example .env                               # điền GEMINI_API_KEY (file .env không được commit)
npm run gen -- --subject logic --dry               # xem prompt, chưa gọi API
npm run gen -- --subject logic --chapter ch3 --calls 2
npm run gen:review -- --subject logic              # [g] giữ · [b] bỏ · [e] xem EN
```

## Cấu trúc

```
CAU_Math/
├── index.html · home/        trang Tổng quan chung
├── shared/                   khung giao diện, bộ chạy luyện tập, widget, i18n, nhật ký, lịch học kỳ
│   ├── logic/                hàm thuần (định tuyến, chấm điểm, tiến độ, syllabus) — có test
│   ├── ui/                   màn hình, bộ chạy, widget trả lời, nháp
│   └── style/                token màu/chữ, khung, thành phần
├── logic/  linalg/           mỗi thư mục là một app: index.html + src/{logic,ui,pages,content,i18n} + tests/
└── scripts/                  kiểm tra độ dài file, tạo app khởi động nhanh
```

JavaScript thuần + Vite, không framework. `src/logic/` luôn là hàm thuần (không đụng DOM, không biết
ngôn ngữ) để test được; `src/ui/` lo phần hiển thị.

## Tài liệu dự án

| File | Nội dung |
|---|---|
| [`PLAN.md`](PLAN.md) | Lộ trình theo syllabus và các phase |
| [`DECISIONS.md`](DECISIONS.md) | Quyết định thiết kế kèm lý do |
| [`RESEARCH.md`](RESEARCH.md) | Khảo sát UX: toeic-app, Khan Academy, Math Academy, Brilliant, Bluebook |
| [`PROGRESS.md`](PROGRESS.md) | Trạng thái bàn giao giữa các phiên làm việc |
| [`CLAUDE.md`](CLAUDE.md) | Quy tắc làm việc trong repo |

## Nguồn

Nội dung học tập được diễn đạt lại và ghi nguồn theo từng giáo trình ở trên. Repo không chứa slide,
PDF, syllabus hay đề thi của môn học.

# CAU Math App

CAU Math App là repo source of truth cho 3 môn toán của học kỳ hiện tại:

- Logic Circuit
- Linear Algebra
- Discrete Math

Repo này tập trung vào nội dung và công cụ học toán. Study_Hub là repo khác, giữ vai trò khung quản lý học tập.

## Ranh giới với Study_Hub

CAU_Math_App sở hữu:
- syllabus và nội dung 3 môn;
- concepts, lessons, question generators;
- answer checkers và solution oracles;
- math-specific UI, tools và exam/practice flow;
- lịch sử/progress của câu toán và bridge event khi integration hoàn chỉnh.

Study_Hub sở hữu:
- Today / queue / stats tổng hợp;
- Notes / Obsidian / vault;
- Auth, Supabase/RLS và Hub sync;
- course registry và integration adapters.

Không thêm Hub logic vào CAU_Math_App. Không sửa thuật toán/content toán trong Study_Hub.

Chi tiết: REPO_BOUNDARY.md.

## Cấu trúc

    CAU_Math_App/
    ├── logic/       Logic Circuit
    ├── linalg/      Linear Algebra
    ├── discrete/    Discrete Math
    ├── shared/      framework dùng chung cho 3 app toán
    ├── home/        tổng quan riêng của bộ 3 môn
    └── scripts/     tooling / content generation

Mỗi app có logic thuần, UI, content, i18n và tests. shared chỉ chứa code thật sự dùng chung cho từ hai app trở lên.

## Chạy

Yêu cầu Node.js 20+.

    git clone https://github.com/huybndc/CAU_Math_App.git
    cd CAU_Math_App
    npm install
    npm run dev

Mặc định: http://localhost:5180.

    npm test
    npm run check

## Kết hợp với Study_Hub

Hai repo không import source trực tiếp.

Luồng mục tiêu:

    CAU_Math_App
        ↓
    math events / course data
        ↓
    Study_Hub
        ↓
    Today / Progress / Stats

Event lịch sử câu toán chuẩn là math.answer:

    subject, prefix, kind, ok, mode, optional tag

Study_Hub đọc/aggregate. CAU_Math_App quyết định câu hỏi, đáp án và UI.

Trạng thái hiện tại:
- 3 app toán đang phát triển độc lập trong repo này.
- Study_Hub đã có phía đọc math.answer.
- Bridge ghi math.answer từ CAU_Math_App là phần đang tách khỏi Study_Hub.
- Sau bridge, các bản copy math trong Study_Hub sẽ được loại bỏ.

## Tài liệu cho AI

1. REPO_BOUNDARY.md
2. CLAUDE.md
3. PROGRESS.md
4. PLAN.md
5. DECISIONS.md — lịch sử thiết kế, có thể chứa mô tả cũ về việc gộp repo.

Không commit PDF/slide/syllabus riêng của lớp, secret hoặc dữ liệu cá nhân.

# Struct, union, typedef

*Theo slide tuần 7 (구조체와 공용체) và Perfect C. Mọi kết quả in ra trong bài đã chạy thật bằng clang.*

**Sau bài này bạn làm được:**
- Khai báo struct, khởi tạo, truy cập thành viên bằng `.` và `->`.
- Biết struct được chép khi gán và khi truyền vào hàm; khi nào cần con trỏ.
- Dùng typedef, struct lồng nhau, mảng struct; hiểu union dùng chung bộ nhớ.

## Khai báo và truy cập

**struct** gom nhiều biến khác kiểu thành một kiểu mới.

```c
struct Point { int x; int y; };
struct Point pt = {1, 2};   // khởi tạo theo thứ tự thành viên
pt.x = 5;                   // biến struct: dùng dấu chấm
```

Con trỏ tới struct dùng `->`: `p->x` bằng `(*p).x`. Viết `pt->x` khi `pt` không phải con trỏ là **lỗi biên dịch**.

## Gán và truyền vào hàm là chép

`struct Point b = a;` chép **toàn bộ** a sang b, kể cả mảng bên trong. Sửa b không đổi a.

Truyền struct vào hàm theo giá trị: hàm nhận **bản sao**, sửa không ảnh hưởng biến gốc. Muốn sửa biến gốc thì truyền con trỏ.

```c
void moveX(struct Point p)  { p.x += 1; }   // không đổi pt
void moveY(struct Point *p) { p->y += 4; }  // đổi pt
```

Với `pt = {1, 2}`: gọi `moveX(pt); moveY(&pt);` rồi in ra `1 6`.

## Mảng char trong struct

Không gán chuỗi cho mảng: `s.name = "Kim";` là **lỗi**. Dùng `strcpy(s.name, "Kim");` hoặc khởi tạo lúc khai báo.

So sánh hai chuỗi bằng `strcmp`, không bằng `==`. So sánh hai struct cũng **không** dùng `==` được: so từng thành viên.

## typedef và struct lồng nhau

`typedef struct { int h, m; } Time;` đặt tên mới `Time`, khỏi viết `struct` mỗi lần.

Không có typedef thì phải viết `struct Node n;`. Viết `Node n;` là **lỗi**.

Struct lồng: `e.t.m` = thành viên m của thành viên t. Mảng struct với con trỏ: `p++` nhảy sang **phần tử struct kế tiếp**.

## union

**union** cho mọi thành viên dùng **chung một vùng nhớ**. `sizeof(union)` bằng thành viên lớn nhất (có thể thêm phần đệm).

```c
union Data { int i; unsigned char b[4]; };
d.i = 258;   // 258 = 1·256 + 2
```

Trên máy little-endian (x86, Apple Silicon), `d.b[0]` là byte thấp: in `d.b[0], d.b[1]` được `2 1`.

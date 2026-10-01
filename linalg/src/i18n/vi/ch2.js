export const ch2 = {
  /* Ví dụ — khử Gauss từng bước */
  'c2.elimTitle': 'Khử Gauss từng bước',
  'c2.elimNote': 'Sửa hệ số rồi bấm từng bước. Mỗi bước là một phép biến đổi hàng, kèm một câu lý do vì sao làm phép đó.',
  'c2.preset': 'Hệ mẫu:',
  'c2.presetUnique2': '2 ẩn — nghiệm duy nhất',
  'c2.presetUnique3': '3 ẩn — nghiệm duy nhất',
  'c2.presetInfinite': 'Vô số nghiệm',
  'c2.presetNone': 'Vô nghiệm',
  'c2.random': 'Hệ ngẫu nhiên',
  'c2.errMatrix': 'Hệ số phải là số, ví dụ 2 hoặc -1.5.',
  'c2.stepStart': 'Ma trận mở rộng ban đầu [A | b].',
  'c2.stepStartWhy': 'Gộp A và b lại để mọi phép biến đổi hàng tự động áp dụng cho cả vế phải.',
  'c2.phaseForward': 'Giai đoạn 1 — khử xuôi',
  'c2.phaseBackward': 'Giai đoạn 2 — khử ngược',
  'c2.phaseDone': 'Đã xong',

  /* lý do từng bước (logic/elimination.js trả về khoá này) */
  'c2.whySwap': 'Vị trí trụ ở cột {col} đang là 0, nên đổi lên hàng {row} có hệ số khác 0.',
  'c2.whyEliminate': 'Tạo số 0 ở cột {col} của hàng {target}, để hàng đó không còn chứa ẩn thứ {col}.',
  'c2.whyNormalize': 'Chia hàng {row} cho trụ của nó để trụ bằng 1 — bước đầu của dạng rút gọn.',
  'c2.whyClearAbove': 'Khử nốt số phía trên trụ ở cột {col} (hàng {target}), để cột đó chỉ còn đúng một số 1.',
  'c2.whyFreeCol': 'Cột {col} không còn hệ số khác 0 nào để làm trụ — ẩn thứ {col} là biến tự do.',

  /* kết luận */
  'c2.concUnique': 'Nghiệm: {sol}',
  'c2.concInfinite': 'Tập nghiệm: {sol}',
  'c2.concNone': 'Xuất hiện hàng dạng 0 = {value} — mâu thuẫn, không số nào thoả.',
  'c2.rankLine': 'rank(A) = {rank}, số ẩn = {n}, số biến tự do = {free}.',
  'c2.rankLineNone': 'rank(A) = {rank} nhưng rank([A | b]) = {rankAug} — hai hạng khác nhau nên hệ vô nghiệm.',
  'c2.checkLine': 'Thử lại: thay nghiệm vào hệ ban đầu, sai lệch lớn nhất = {res}.',
  'c2.lblType': 'Kết luận',

  /* Ví dụ — hình hai đường thẳng */
  'c2.rowPicTitle': 'Nhìn bằng hình: mỗi phương trình là một đường thẳng',
  'c2.rowPicNote': 'Với hệ 2 ẩn, nghiệm chính là giao điểm hai đường thẳng. Hình này đi theo hệ đang chọn ở card trên.',
  'c2.rowPic3': 'Hệ 3 ẩn thì mỗi phương trình là một mặt phẳng trong không gian — phần vẽ 3D để dành cho Chương 3. Ở đây chỉ cần đọc kết luận bằng số.',
  'c2.linesCross': 'Hai đường cắt nhau tại đúng một điểm.',
  'c2.linesParallel': 'Hai đường song song, không có điểm chung.',
  'c2.linesSame': 'Hai đường trùng nhau, mọi điểm trên đường đều là nghiệm.',
  'c2.lblEq1': 'Phương trình 1',
  'c2.lblEq2': 'Phương trình 2',
  'c2.lblCross': 'Giao điểm',

  /* Tương tác — tự chọn phép biến đổi */

};

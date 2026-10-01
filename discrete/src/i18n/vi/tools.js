/* Máy giải Discrete (ui/solvers.js + logic/report-tools.js): tiêu đề công cụ, bước gập, câu dẫn, thuật ngữ. {…} phải khớp bản EN. */
export const tools = {
  'tool.truth': 'Bảng chân trị & tương đương', 'tool.euclid': 'Euclid & Pulverizer: gcd, lcm, nghịch đảo', 'tool.congr': 'Phương trình đồng dư ax ≡ b (mod n)', 'tool.pow': 'Lũy thừa mod (bình phương liên tiếp)',
  'tool.optional': 'bỏ trống nếu không so', 't1.tooMany': 'Tối đa {n} biến.',
  // bảng chân trị
  'dr.stTable': 'Bảng chân trị từng bước', 'dr.whyTable': 'Mỗi công thức con một cột, tính từ trong ra ngoài; cột cuối là kết quả.', 'dr.truth': 'Bảng:',
  'dr.stMinterms': 'Các dòng F đúng', 'dr.notEquiv': 'Không tương đương — khác nhau ở dòng {rows} (tô đỏ).',
  // Euclid
  'dr.gcdIs': 'gcd:', 'dr.lcmIs': 'lcm:', 'dr.invIs': 'Nghịch đảo:', 'dr.tabEuclid': 'Euclid', 'dr.tabPulv': 'Pulverizer',
  'dr.stEuclid': 'Chia liên tiếp', 'dr.whyEuclid': 'Lấy số trước chia số sau, giữ dư; lặp tới khi dư = 0. gcd là số chia cuối cùng.', 'dr.lastNonzero': 'Dư khác 0 cuối cùng = gcd =',
  'dr.stPulv': 'Bảng s, t', 'dr.whyPulv': 'Mỗi dòng giữ r = s·a + t·b; dòng mới = dòng trên-nữa − q × dòng trên. Dòng xanh cho gcd.', 'dr.pulvTable': 'Bảng:',
  'dr.stCheck': 'Kiểm lại',
  // đồng dư
  'dr.stGcdDiv': 'gcd có chia hết b không?', 'dr.whyGcdDiv': 'ax ≡ b (mod n) có nghiệm khi và chỉ khi gcd(a, n) chia hết b.', 'dr.divides': 'chia hết:', 'dr.notDivides': 'không chia hết:',
  'dr.noSol': 'Vô nghiệm (gcd không chia hết b).', 'dr.solIs': 'Nghiệm:', 'dr.allSol': 'Có {g} nghiệm trong 0 … {n} − 1:',
  'dr.stReduce': 'Chia cả ba số cho gcd', 'dr.whyReduce': 'Chia a, b, n cho gcd = {g} được phương trình có a nguyên tố cùng nhau với n.',
  'dr.stInv': 'Nhân với nghịch đảo của a', 'dr.whyInv': 'Nghịch đảo của a mod n tìm bằng Pulverizer; nhân hai vế với nó để còn lại x.', 'dr.trivialMod': 'Mod 1: mọi số đều thoả.',
  // lũy thừa
  'dr.powIs': 'Kết quả:', 'dr.stBits': 'Viết k ở hệ 2', 'dr.whyBits': 'k = tổng các luỹ thừa của 2 ứng với bit 1; aᵏ = tích các a^(2ⁱ) tương ứng.',
  'dr.stSquares': 'Bình phương liên tiếp mod n', 'dr.whySquares': 'Mỗi dòng = bình phương dòng trước, rồi lấy mod n — số luôn nhỏ. Dòng xanh là bit 1.', 'dr.sqTable': 'Bảng:', 'dr.stProduct': 'Nhân các dòng xanh',
  // thuật ngữ bấm được
  'gl.taut': 'hằng đúng|tautology|hằng sai|khả thỏa', 'gl.taut.d': 'Hằng đúng: đúng ở mọi dòng. Hằng sai: sai ở mọi dòng. Còn lại là khả thỏa nhưng không hằng đúng.',
  'gl.equiv': 'tương đương', 'gl.equiv.d': 'Hai công thức tương đương khi cột kết quả giống hệt nhau trên mọi dòng.', 'gl.minterm': 'Σm', 'gl.minterm.d': 'Liệt kê số thứ tự các dòng (từ 0) mà công thức đúng.',
  'gl.gcd': 'gcd|Euclid', 'gl.gcd.d': 'Ước chung lớn nhất. Euclid: gcd(a, b) = gcd(b, a mod b) cho tới khi dư = 0.',
  'gl.pulv': 'Pulverizer|s·a + t·b', 'gl.pulv.d': 'Euclid mở rộng: tìm s, t nguyên để gcd = s·a + t·b.', 'gl.lcm': 'lcm', 'gl.lcm.d': 'Bội chung nhỏ nhất: lcm = a·b / gcd.',
  'gl.inv': 'nghịch đảo', 'gl.inv.d': 'a⁻¹ mod n thoả a·a⁻¹ ≡ 1 (mod n); có khi và chỉ khi gcd(a, n) = 1.', 'gl.cong': 'đồng dư|≡', 'gl.cong.d': 'a ≡ b (mod n) nghĩa là n chia hết a − b, tức a và b cùng số dư khi chia cho n.',
  'gl.sq': 'bình phương liên tiếp', 'gl.sq.d': 'Tính aᵏ mod n nhanh: lập a, a², a⁴, … (mod n), nhân những ô ứng với bit 1 của k.',
};

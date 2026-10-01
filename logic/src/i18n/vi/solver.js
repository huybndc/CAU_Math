/* Máy giải Logic (ui/solvers.js + logic/report-number.js, report-expr.js): tiêu đề công cụ, bước gập, câu dẫn, thuật ngữ. */
export const solver = {
  'tool.base': 'Đổi cơ số', 'tool.complement': 'Trừ bằng số bù', 'tool.signed': 'Số nhị phân có dấu', 'tool.expr': 'Biểu thức Boole: rút gọn, bù, NAND',
  'ln.number': 'Số', 'ln.fromBase': 'Cơ số của số này', 'ln.base': 'Cơ số', 'ln.op': 'Phép', 'ln.bits': 'Số bit', 'ln.vars': 'Số biến', 'ln.auto': 'tự nhận',
  // đổi cơ số
  'ln.tabDec': '→ thập phân', 'ln.tab2': '→ nhị phân', 'ln.tab8': '→ bát phân', 'ln.tab16': '→ thập lục',
  'ln.stPos': 'Khai triển theo vị trí', 'ln.whyPos': 'Mỗi chữ số nhân với {r} mũ vị trí của nó rồi cộng lại.',
  'ln.stGroup': 'Gộp mỗi {k} bit', 'ln.whyGroup': 'Tính từ dấu chấm ra hai phía, mỗi nhóm {k} bit là một chữ số (thiếu thì thêm 0).',
  'ln.stSpread': 'Mỗi chữ số bung thành {k} bit', 'ln.whySpread': 'Mỗi chữ số viết lại bằng đúng {k} bit nhị phân.',
  'ln.readAll': 'Kết quả', 'ln.stDiv': 'Phần nguyên: chia liên tiếp cho {r}', 'ln.whyDiv': 'Chia cho {r} tới khi thương = 0, đọc số dư từ dưới lên.',
  'ln.readUp': 'Đọc dư từ dưới lên:', 'ln.stMul': 'Phần lẻ: nhân liên tiếp với {r}', 'ln.whyMul': 'Nhân phần lẻ với {r}, lấy phần nguyên làm chữ số, đọc từ trên xuống.',
  'ln.readDown': 'Đọc từ trên xuống:', 'ln.noEnd': 'Không dừng — lấy tới đây:',
  // số bù
  'ln.diffIs': 'M − N (cơ số {r}) =', 'ln.decIs': 'Thập phân:', 'ln.stComp': 'Số bù của N', 'ln.whyComp': 'Lấy {r} − 1 trừ từng chữ số rồi cộng 1 là ra số bù của N.',
  'ln.dimIs': "{r1}'s complement của N:", 'ln.plus1': "+1 → {r}'s complement:", 'ln.stAdd': 'Cộng M với số bù', 'ln.whyAdd': 'Có nhớ ra ngoài ⇒ bỏ nhớ, kết quả dương. Không nhớ ⇒ kết quả âm, lấy bù của tổng.',
  'ln.stCheck': 'Kiểm bằng thập phân', 'ln.mismatch': 'Không khớp — kiểm lại đầu vào.',
  // số có dấu
  'ln.tabRepr': 'Biểu diễn', 'ln.tabOp': 'Cộng / trừ', 'ln.stRepr': '{a} ở {w} bit', 'ln.rangeTwos': "Khoảng của 2's complement {w} bit: {min} … {max}",
  'ln.stAdd2': 'Cộng hai số 2\'s complement', 'ln.stSub2': 'Trừ: cộng với bù 2 của B', 'ln.whyAdd2': 'Cộng như số không dấu, bỏ nhớ ra ngoài; tràn khi hai số cùng dấu mà tổng khác dấu.',
  'ln.whySub2': 'A − B = A + (−B); −B là 2\'s complement của B.', 'ln.resultIs': 'Kết quả:',
  // biểu thức
  'ex.sop': 'SOP tối giản:', 'ex.pos': 'POS tối giản:', 'ex.tabTable': 'Bảng chân trị', 'ex.stTable': 'Bảng chân trị và minterm', 'ex.minterms': 'Các minterm:', 'ex.truth': 'Bảng chân trị',
  'ex.tabMin': 'Rút gọn', 'ex.stPrime': 'Các nhóm lớn nhất (prime implicant)', 'ex.whyPrime': 'Ghép các ô 1 (và X) kề nhau thành nhóm 2, 4, 8… lớn nhất có thể; nhóm càng lớn càng ít literal.',
  'ex.piEss': 'bắt buộc:', 'ex.pi': 'tuỳ chọn:', 'ex.stCover': 'Chọn nhóm phủ hết các ô 1', 'ex.whyCover': 'Nhóm bắt buộc (essential) là nhóm duy nhất phủ một ô 1 nào đó — phải chọn; rồi thêm nhóm ít nhất cho đủ.',
  'ex.ess': 'chọn (bắt buộc):', 'ex.pick': 'chọn thêm:', 'ex.tabCompl': 'Bù / dual', 'ex.stDeM': 'Bù bằng DeMorgan', 'ex.stDual': 'Bù qua dual', 'ex.tabNand': 'Toàn NAND', 'ex.stNand': 'Chuyển SOP thành toàn NAND',
  // thuật ngữ bấm được (ui/glossary.js)
  'gl.comp': "số bù|complement|r's|1's|2's", 'gl.comp.d': "Số bù của N: (r − 1) trừ từng chữ số (số bù r − 1) rồi cộng 1 (số bù r). Dùng để đổi phép trừ thành phép cộng.",
  'gl.endcarry': 'nhớ ra ngoài|end carry', 'gl.endcarry.d': 'Bit nhớ tràn ra khỏi chữ số cao nhất khi cộng. Trừ bằng số bù: có nhớ ⇒ kết quả dương.',
  'gl.overflow': 'tràn số|overflow', 'gl.overflow.d': 'Kết quả vượt khoảng biểu diễn của w bit. Nhận biết: hai số cùng dấu mà tổng khác dấu.',
  'gl.signbit': 'bit dấu', 'gl.signbit.d': 'Bit trái nhất của số có dấu: 0 là dương, 1 là âm.',
  'gl.group': 'gộp mỗi|gộp nhóm', 'gl.group.d': 'Nhị phân ↔ bát/thập lục: 3 bit = 1 chữ số bát phân, 4 bit = 1 chữ số thập lục, không cần đi qua thập phân.',
  'gl.carry': 'nhớ', 'gl.carry.d': 'Khi một cột cộng ≥ cơ số, viết phần dư và mang 1 sang cột bên trái.',
  'gl.minterm': 'minterm', 'gl.minterm.d': 'Tích của đủ mọi biến (biến bù nếu bằng 0) cho đúng một dòng bảng chân trị có F = 1.',
  'gl.canon': 'Σm|ΠM', 'gl.canon.d': 'Σm(…) liệt kê các dòng F = 1; ΠM(…) liệt kê các dòng F = 0.',
  'gl.demorgan': 'DeMorgan', 'gl.demorgan.d': "(A + B)′ = A′B′ và (AB)′ = A′ + B′: đổi + ↔ ·, bù từng literal.",
  'gl.dual': 'dual', 'gl.dual.d': 'Đổi + ↔ · và 0 ↔ 1, giữ nguyên các biến.',
  'gl.pi': 'prime implicant|nhóm lớn nhất', 'gl.pi.d': 'Nhóm ô 1 (có thể thêm X) lớn nhất có thể, không nằm trọn trong nhóm khác.',
  'gl.epi': 'bắt buộc|essential', 'gl.epi.d': 'Nhóm là cách duy nhất phủ một ô 1 nào đó — bắt buộc có mặt trong đáp án.',
  'gl.dc': "don't care|không quan tâm", 'gl.dc.d': 'Ô X: muốn coi là 0 hay 1 tuỳ, miễn giúp nhóm lớn hơn.',
  'gl.nand': 'NAND', 'gl.nand.d': 'NAND = AND rồi đảo. Mạch SOP hai tầng đổi được thành toàn NAND.',
  'gl.sop': 'SOP|POS', 'gl.sop.d': 'SOP: tổng các tích. POS: tích các tổng.',
};

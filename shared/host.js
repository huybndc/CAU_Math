/* ---------------------------------------------------------------
   ĐIỂM NỐI VỚI NƠI CHỨA APP (host adapter) — bản mặc định cho app chạy riêng (localhost / build tĩnh).
   Mọi mã trong shared/ cần tài khoản / đám mây của Study Hub đều import từ '@host', KHÔNG import chéo repo.
   Study Hub đặt alias '@host' → file adapter riêng của nó (cùng tên export); repo này không biết Hub tồn tại.
   Hợp đồng:
     accountStorageKey(key)   khoá localStorage đã gắn tài khoản (riêng: nguyên khoá)
     accountDataEntries()     { khoá: giá trị } dữ liệu của tài khoản đang dùng (riêng: toàn bộ localStorage)
     adoptAccount(id)         gắn localStorage với tài khoản mới đăng nhập
     currentUser()            { id } | null — id dùng làm namespace đồng bộ thư mục đám mây
     loadMathAnswerEvents()   sự kiện math.answer từ máy chủ (riêng: không có)
     pushHubEvents(list, deviceId)  đẩy sự kiện math.answer lên máy chủ (riêng: không làm gì)
     hubHref                  địa chỉ trang chủ Hub để hiện nút quay về (riêng: null = không hiện)
   --------------------------------------------------------------- */

export const accountStorageKey = key => key;

export function accountDataEntries() {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); out[k] = localStorage.getItem(k); }
  } catch { /* riêng tư */ }
  return out;
}

export const adoptAccount = () => false;
/** App chạy riêng không có tài khoản: một namespace cố định để đồng bộ giữa các máy qua thư mục đám mây vẫn chạy. */
export const currentUser = async () => ({ id: 'standalone' });
export const loadMathAnswerEvents = async () => [];
export const pushHubEvents = async () => {};
export const hubHref = null;

import snap from './exam-target.json';

/** Mục tiêu % đúng khi thi của một môn (từ exam-target.json, bản chụp của Study_Hub); null nếu môn chưa có. */
export const targetOf = subject => snap.target[subject] ?? null;
export { snap as examTarget };

/** Số câu đúng LIÊN TIẾP cần thêm để % đúng chạm mục tiêu t (0 nếu đã đạt): (c + x) / (n + x) ≥ t/100. */
export const needCorrect = ({ attempts, correct }, t) => Math.max(0, Math.ceil((t * attempts - 100 * correct) / (100 - t)));

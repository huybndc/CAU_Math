import snap from './exam-target.json';

/** Mục tiêu % đúng khi thi của một môn (từ exam-target.json, bản chụp của Study_Hub); null nếu môn chưa có. */
export const targetOf = subject => snap.target[subject] ?? null;
export { snap as examTarget };

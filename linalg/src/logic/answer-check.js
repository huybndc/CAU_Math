/* ---------------------------------------------------------------
   CHẤM BÀI THEO GIÁ TRỊ SỐ, KHÔNG SO CHUỖI.
   Đại số tuyến tính hay ra đáp án lẻ (√5, góc 63.43°), nên chấm bằng
   sai số cho phép. Người học viết "3, -2" hay "(3; -2)" hay "3 -2" đều
   phải được chấp nhận — cách viết không phải cái đang kiểm tra.
   --------------------------------------------------------------- */

import { evaluate } from '@shared/logic/calc.js';

/**
 * Đổi một mẩu chữ thành số bằng máy tính dùng chung (shared/logic/calc.js, hệ 10) — cùng bộ tính với ngăn Nháp:
 * "3", "-1.5", "3/4", "√5", "sqrt(5)", "2√3", "1/sqrt(2)", "2^3", dấu trừ Unicode. Không đọc được ⇒ null.
 */
export function parseNumber(piece) {
  const s = String(piece ?? '').trim().replace(/[−–—]/g, '-').replace(/°/g, '');
  if (!s) return null;
  const r = evaluate(s, 10);
  return r.error || r.value === null ? null : r.value;
}

/** s bắt đầu bằng ngoặc mở và ngoặc đó đóng đúng ở ký tự cuối (bao trọn cả chuỗi)? */
function wraps(s) {
  if (s[0] !== '(') return false;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    if (s[i] === ')' && --depth === 0) return i === s.length - 1;
  }
  return false;
}

/**
 * Bóc danh sách số từ câu trả lời: "3, -2", "(3; -2)", "[1 2 3]", "(1/sqrt(2), 1/sqrt(2))".
 * Tách ở dấu , ; | … và khoảng trắng NẰM NGOÀI ngoặc (ngoặc của sqrt(…) không bị cắt); "3 - 2" vẫn là hai số.
 * Có mẩu không phải số thì trả null.
 */
export function parseNumbers(text) {
  let s = String(text ?? '').trim().replace(/[[{]/g, '(').replace(/[\]}]/g, ')').replace(/[−–—]/g, '-');
  if (wraps(s)) s = s.slice(1, -1).trim();
  s = s.replace(/\s*([*/^+×÷])\s*/g, '$1');                 // "sqrt(2) / 2" là một số
  const parts = [];
  let depth = 0, cur = '';
  for (const c of s) {
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (depth === 0 && /[\s,;|…]/.test(c)) { if (cur) parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur) parts.push(cur);
  if (!parts.length) return null;
  const nums = parts.map(parseNumber);
  return nums.some(n => n === null) ? null : nums;
}

/** So một số với sai số cho phép. */
export function checkNumber(given, expected, tol = 1e-6) {
  const nums = parseNumbers(given);
  if (!nums || nums.length !== 1) return false;
  return Math.abs(nums[0] - expected) <= tol;
}

/** So một vector theo từng toạ độ, sai số cho phép. */
export function checkVector(given, expected, tol = 1e-6) {
  const nums = parseNumbers(given);
  if (!nums || nums.length !== expected.length) return false;
  return nums.every((x, i) => Math.abs(x - expected[i]) <= tol);
}

/** So một lựa chọn (phân loại nghiệm…): bỏ hoa thường và khoảng trắng thừa. */
export function checkChoice(given, expected) {
  const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
  return norm(given) === norm(expected);
}

/**
 * Chấm một câu bất kỳ dựa vào dạng đáp án của nó.
 * answer là mảng → chấm theo vector; là số → chấm theo số; còn lại → lựa chọn.
 */
export function checkAnswer(given, answer, tol = 1e-6) {
  if (Array.isArray(answer)) return checkVector(given, answer, tol);
  if (typeof answer === 'number') return checkNumber(given, answer, tol);
  return checkChoice(given, answer);
}

// Canh FEATURES.md: đổi data-testid hoặc thêm file src/ui mà không sửa FEATURES.md thì đỏ.
// Chỉ chạy ở CAU_Math_App (bản mirror trong Study_Hub không có git/FEATURES.md của repo này → bỏ qua).
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const UI_FILE = /(^|\/)(src|shared)\/ui\/[^/]+\.js$/;
const TESTID = /data-testid/;

/** Trả về lý do vi phạm (mảng chuỗi); rỗng = ổn. Thuần, để test được. */
export function featuresViolations({ added, patch, changed }) {
  if (changed.includes('FEATURES.md')) return [];
  const out = added.filter((f) => UI_FILE.test(f)).map((f) => `thêm file UI: ${f}`);
  const touched = patch.split('\n').some((l) => /^[+-][^+-]/.test(l) && TESTID.test(l));
  if (touched) out.push('thêm/xoá/đổi tên data-testid');
  return out;
}

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
function repoState() {
  try {
    if (JSON.parse(readFileSync('package.json', 'utf8')).name !== 'study-apps' || !existsSync('FEATURES.md')) return null;
    const base = process.env.FEATURES_BASE || git('merge-base', 'HEAD', 'origin/main').trim();
    const ns = git('diff', '--name-status', base).split('\n').filter(Boolean).map((l) => l.split('\t'));
    const untracked = git('ls-files', '-o', '--exclude-standard').split('\n').filter(Boolean);
    return {
      added: [...ns.filter((r) => r[0][0] === 'A' || r[0][0] === 'R').map((r) => r[r.length - 1]), ...untracked],
      changed: [...ns.map((r) => r[r.length - 1]), ...untracked],
      patch: git('diff', '-U0', base, '--', '*.js', '*.html', ':(exclude)*/tests/*'), // bỏ test và tài liệu: chỉ mã giao diện
    };
  } catch { return null; }
}

describe('FEATURES.md khớp thay đổi UI', () => {
  it('quy tắc: file UI mới / data-testid đổi ⇒ phải sửa FEATURES.md', () => {
    const ok = { added: [], patch: '', changed: [] };
    expect(featuresViolations(ok)).toEqual([]);
    expect(featuresViolations({ ...ok, added: ['shared/ui/new.js'] })).toHaveLength(1);
    expect(featuresViolations({ ...ok, added: ['logic/src/ui/x.js'] })).toHaveLength(1);
    expect(featuresViolations({ ...ok, added: ['shared/style/x.css', 'shared/logic/x.js'] })).toEqual([]);
    expect(featuresViolations({ ...ok, patch: '+<b data-testid="a">' })).toHaveLength(1);
    expect(featuresViolations({ ...ok, patch: '-<b data-testid="a">' })).toHaveLength(1);
    expect(featuresViolations({ ...ok, patch: '+++ b/x\n context data-testid' })).toEqual([]);
    expect(featuresViolations({ added: ['shared/ui/new.js'], patch: '+data-testid', changed: ['FEATURES.md'] })).toEqual([]);
  });

  it('nhánh hiện tại so với main', () => {
    const s = repoState();
    if (!s) return; // không có git/base (mirror, clone nông): bỏ qua
    expect(featuresViolations(s), 'sửa FEATURES.md trong cùng PR').toEqual([]);
  });
});

// Tính năng đã gỡ: mỗi dòng = một chuỗi không được còn trong mã nguồn. Gỡ tính năng thì thêm dòng vào đây.
const REMOVED = [
  ['practice.old', 'bài luyện chương cũ (PR #91)'],
  ['/practice`', 'route #/learn/chN/practice (PR #91)'],
  ['home/index.html', 'trang tổng quan chung / (PR #91)'],
  ['freeEvent', 'Tự luận tự đánh giá + math.answer mode free (2026-10-22)'],
  ['free-rubric', 'Tự luận: ý chấm tự tích (2026-10-22)'],
  ['free.rate', 'Tự luận: nút tự đánh giá (2026-10-22)'],
  ['PRACTICE_HIDDEN', 'cờ ẩn Luyện tập (đã gỡ hẳn, 2026-10-22)'],
  ['screen-practice', 'màn Luyện tập (2026-10-22)'],
  ['screen-exam', 'màn Thi thử (2026-10-22)'],
  ['markMistake', 'Sổ câu sai (2026-10-22)'],
  ['mock.list', 'Đề như thật: danh sách câu gập, thay bằng xem trước nguyên tờ (2026-10-22)'],
  ['mock-qs', 'Đề như thật: danh sách câu gập (2026-10-22)'],
  ['petBlock', 'bạn đồng hành pet (2026-10-26)'],
  ['pet.css', 'bạn đồng hành pet (2026-10-26)'],
  ['home-week', 'khối Tuần này ở Tổng quan (2026-10-26)'],
  ['pushHubEvents', 'gửi math.answer sang Study_Hub (bỏ khi tách app, 2026-10-26)'],
  ['hub-back', 'nút quay về Study Hub (2026-10-26)'],
  ['progress-export', 'xuất tiến độ cho Hub (2026-10-26)'],
  ['gradeCircuit', 'Đề như thật: ô Kiểm mạch đã vẽ (2026-10-22)'],
  ['mock.check', 'Đề như thật: ô Kiểm mạch đã vẽ (2026-10-22)'],
];
function srcFiles(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (['node_modules', 'dist', 'tests', '.git'].includes(n)) continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) srcFiles(p, out);
    else if (/\.(js|mjs|css|html|json)$/.test(n)) out.push(p);
  }
  return out;
}
describe('tính năng đã gỡ không còn tham chiếu', () => {
  const dirs = ['shared', 'logic', 'linalg', 'discrete'].filter(existsSync);
  const files = dirs.flatMap((d) => srcFiles(d));
  for (const [needle, why] of REMOVED) {
    it(`${why}`, () => {
      const hits = files.filter((f) => readFileSync(f, 'utf8').includes(needle));
      expect(hits).toEqual([]);
    });
  }
});

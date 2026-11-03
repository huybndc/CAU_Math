// File sinh từ shared/subjects.json phải khớp danh sách (lệch ⇒ npm run gen:subjects).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { files, rootRedirect } from '../../scripts/gen-subjects.mjs';
import ALL from '../subjects.json';
const SUBJECTS = ALL.filter(s => s.app !== false);

describe('cấu hình môn một nguồn', () => {
  it('tokens.css và index.html gốc khớp subjects.json', () => {
    for (const [f, fix] of Object.entries(files())) {
      const t = readFileSync(f, 'utf8');
      expect(fix(t), f).toBe(t);
    }
  });
  it('the root page goes to the first active course', () => {
    const page = readFileSync('index.html', 'utf8');
    const out = rootRedirect(page, [{ id: 'linalg' }, { id: 'prog' }]);
    expect(out).toContain('content="0;url=/linalg/"');
    expect(out).not.toContain('url=/logic/');
    // An inline script needs a CSP hash for each target. The root page must not have one.
    expect(page).not.toMatch(/<script/);
  });
  it('mỗi môn có màu sáng/tối và ngăn nháp', () => {
    for (const s of SUBJECTS) {
      expect(s.accent?.light && s.accent?.dark, s.id).toBeTruthy();
      expect(s.tabs?.[0], s.id).toBe('notes');
    }
  });
});

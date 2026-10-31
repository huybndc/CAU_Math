// Địa chỉ online đổi cau-math → exlab (2026-10-31). Nguồn không còn tên Worker cũ.
// SYNC_APP = 'cau-math' là mã tệp đồng bộ, không phải địa chỉ: đổi sẽ mất dữ liệu cũ.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

describe('tên Worker', () => {
  it('wrangler dùng exlab', () => {
    expect(readFileSync('wrangler.jsonc', 'utf8')).toMatch(/"name": "exlab"/);
  });
  it('nguồn không còn địa chỉ/Worker cau-math', () => {
    const files = execSync('git ls-files', { encoding: 'utf8' }).split('\n')
      .filter(f => f && !f.startsWith('docs/') && f !== 'shared/tests/worker-name.test.js');
    const hits = files.filter(f => /cau-math\.|Worker `cau-math`|"name": "cau-math"/.test(readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });
});

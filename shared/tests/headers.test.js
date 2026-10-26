/* public/_headers phải cho phép đúng mọi script nội tuyến trong các trang (CSP chặn script lệch hash ⇒ trang trắng). */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = f => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');
const headers = read('public/_headers');

describe('CSP của bản chạy riêng', () => {
  it('mỗi script nội tuyến có hash trong script-src; không gọi máy chủ ngoài', () => {
    for (const f of ['index.html', 'logic/index.html', 'linalg/index.html', 'discrete/index.html']) {
      for (const m of read(f).matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
        const h = `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`;
        expect(headers, f).toContain(h);
      }
    }
    expect(headers).toMatch(/connect-src 'self';/);
    expect(headers).not.toMatch(/supabase|https:\/\//);
  });
});

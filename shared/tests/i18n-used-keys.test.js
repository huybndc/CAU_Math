import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { vi as logic } from '../../logic/src/i18n/vi/index.js';
import { vi as linalg } from '../../linalg/src/i18n/vi/index.js';
import { vi as discrete } from '../../discrete/src/i18n/vi/index.js';
import { vi as shared } from '../i18n/vi.js';

/* Khoá từ điển dùng trong mã (chuỗi 'ns.tên') mà từ điển không có ⇒ người học thấy chữ thô như "ds.union". */
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : []; });

for (const [app, dict] of [['logic', logic], ['linalg', linalg], ['discrete', discrete]]) {
  it(`${app}: mọi khoá 'ns.x' trong mã có trong từ điển`, () => {
    const all = { ...shared, ...dict };
    const ns = new Set(Object.keys(all).map(k => k.split('.')[0]));
    const missing = new Set();
    for (const f of walk(`${app}/src`).filter(f => !f.includes('/i18n/') && !f.includes('/content/'))) {
      for (const m of readFileSync(f, 'utf8').matchAll(/(?<![\w./-])'((?:ds|dg|tool|cc|ln|dr)\.[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*)'/g)) {
        if (m[1] !== 'dg.euler' && ns.has(m[1].split('.')[0]) && !(m[1] in all)) missing.add(`${f}: ${m[1]}`);
      }
    }
    expect([...missing]).toEqual([]);
  });
}

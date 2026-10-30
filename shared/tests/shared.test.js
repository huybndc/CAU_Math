import { describe, it, expect } from 'vitest';
import ALL from '../subjects.json';
const SUBJECTS = ALL.filter(s => s.app !== false);
import { vi } from '../i18n/vi.js';
import { en } from '../i18n/en.js';
import { parseRoute, routeOf } from '../logic/route.js';

describe('từ điển phần khung', () => {
  it('VI và EN cùng tập khoá, cùng tham số', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort());
    const slots = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
    for (const k of Object.keys(vi)) expect(slots(en[k]), k).toEqual(slots(vi[k]));
  });
});

describe('địa chỉ theo việc #/learn · #/tools · #/free · #/mock', () => {
  const CH = ['ch1', 'ch2', 'ch3'];
  it('đọc đúng địa chỉ hợp lệ', () => {
    expect(parseRoute('', CH)).toEqual({ view: 'home' });
    expect(parseRoute('#/', CH)).toEqual({ view: 'home' });
    expect(parseRoute('#/learn', CH)).toEqual({ view: 'learn' });
    expect(parseRoute('#/learn/ch3/interactive', CH)).toEqual({ view: 'learn', ch: 'ch3', sub: 'interactive' });
    expect(parseRoute('#/learn/ch2', CH)).toEqual({ view: 'learn', ch: 'ch2', sub: 'theory' });
    expect(parseRoute('#/learn/ch3/interactive/1', CH)).toEqual({ view: 'learn', ch: 'ch3', sub: 'interactive', at: 1 });
    expect(parseRoute('#/learn/ch3/interactive/x', CH)).toBeNull();
    expect(parseRoute('#/tools', CH)).toEqual({ view: 'tools' });
  });
  it('địa chỉ cũ #/chN/mục-con vẫn mở đúng chỗ', () => {
    expect(parseRoute('#/ch3/interactive', CH)).toEqual({ view: 'learn', ch: 'ch3', sub: 'interactive' });
    expect(parseRoute('#/ch2', CH)).toEqual({ view: 'learn', ch: 'ch2', sub: 'theory' });
  });
  it('địa chỉ lạ thì trả null (nơi gọi tự về Tổng quan)', () => {
    for (const h of ['#/ch9/theory', '#/ch1/nope', '#/learn/ch9', '#/learn/ch1/nope', '#/ch1/practice', '#/practice', '#/practice/ch1', '#/exam', '#/zzz']) {
      expect(parseRoute(h, CH), h).toBeNull();
    }
  });
  it('routeOf là nghịch đảo của parseRoute, và đổi địa chỉ cũ sang dạng mới', () => {
    for (const h of ['#/', '#/learn', '#/learn/ch1/example', '#/learn/ch1/example/2', '#/tools', '#/free', '#/free/l-pascal', '#/mock']) {
      expect(routeOf(parseRoute(h, CH)), h).toBe(h);
    }
    expect(routeOf(parseRoute('#/ch1/interactive', CH))).toBe('#/learn/ch1/interactive');
  });
});

describe('icon menu', () => {
  // thiếu --ico thì mask rỗng ⇒ ô vuông khi thu gọn menu
  it('mọi mục menu (data-nav ở index.html, data-app ở shell.js) có icon trong shell.css', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(new URL('../style/shell.css', import.meta.url), 'utf8');
    const html = SUBJECTS.map(x => x.id).map(a => readFileSync(new URL(`../../${a}/index.html`, import.meta.url), 'utf8')).join('');
    const js = readFileSync(new URL('../ui/shell.js', import.meta.url), 'utf8');
    const navs = [...new Set([...html.matchAll(/data-nav="(\w+)"/g)].map(m => m[1]))];
    const apps = [...js.matchAll(/'shell\.\w+', '(\w+)'\]/g)].map(m => m[1]);
    expect(navs.length).toBeGreaterThan(2);
    expect(apps).toEqual(['hub', 'live']);
    for (const n of navs) expect(css, n).toContain(`.tab[data-nav="${n}"]{--ico:`);
    for (const a of apps) expect(css, a).toContain(`.tab[data-app="${a}"]{--ico:`);
  });
});

describe('bộ icon chung (icons.css)', () => {
  it('mọi var(--i-…) được dùng đều có trong icons.css; không còn SVG dán thẳng ngoài icons.css', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const dir = new URL('../style/', import.meta.url);
    const icons = readFileSync(new URL('icons.css', dir), 'utf8');
    const defined = new Set([...icons.matchAll(/--i-([\w-]+):/g)].map(m => m[1]));
    for (const f of readdirSync(dir).filter(f => f.endsWith('.css') && f !== 'icons.css')) {
      const css = readFileSync(new URL(f, dir), 'utf8');
      expect(css, f).not.toContain('data:image/svg');
      for (const [, n] of css.matchAll(/var\(--i-([\w-]+)\)/g)) expect(defined.has(n), `${f}: --i-${n}`).toBe(true);
    }
    expect(icons).toContain("stroke-width='1.5'");
  });
});

describe('danh sách môn (subjects.json)', () => {
  it('mỗi môn có thư mục app với index.html đúng data-subject; mỗi index.html có data-subject đều có trong danh sách', async () => {
    const { readFileSync, readdirSync, existsSync } = await import('node:fs');
    const root = new URL('../../', import.meta.url);
    for (const s of SUBJECTS) {
      expect(s.vi && s.en, s.id).toBeTruthy();
      expect(readFileSync(new URL(`${s.id}/index.html`, root), 'utf8'), s.id).toContain(`data-subject="${s.id}"`);
    }
    const apps = readdirSync(root).filter(d => existsSync(new URL(`${d}/index.html`, root)) && /data-subject="/.test(readFileSync(new URL(`${d}/index.html`, root), 'utf8')));
    expect(apps.sort()).toEqual(SUBJECTS.map(s => s.id).sort());
  });
});

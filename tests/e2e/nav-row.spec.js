import { test, expect } from '@playwright/test';
import SUBJECTS from '../../shared/subjects.json' with { type: 'json' };

/* Hàng công cụ thanh bên (tìm kiếm, VI/EN, sáng/tối, mây) nằm trên một dòng khi menu mở (lỗi: mây rớt dòng ở giao diện tối). */
for (const theme of ['light', 'dark']) for (const w of [1280]) test(`hàng công cụ một dòng ${theme} ${w}`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: theme });
  await page.setViewportSize({ width: w, height: 720 });
  await page.goto('/logic/');
  await page.waitForSelector('#screen-home h1');
  const tops = await page.evaluate(() => [...document.querySelectorAll('.appnav-foot > *')]
    .filter(e => e.getClientRects().length).map(e => (r => Math.round(r.top + r.height / 2))(e.getBoundingClientRect())));
  expect(tops.length).toBeGreaterThanOrEqual(4);
  expect(Math.max(...tops) - Math.min(...tops), `tâm: ${tops}`).toBeLessThanOrEqual(2);
  // còn dư chỗ: font thay thế (chưa tải font web) rộng hơn vài px vẫn không rớt dòng
  const slack = await page.evaluate(() => { const f = document.querySelector('.appnav-foot'), cs = getComputedStyle(f), kids = [...f.children].filter(e => e.getClientRects().length);
    return f.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - kids.reduce((s, e) => s + e.getBoundingClientRect().width, 0) - parseFloat(cs.columnGap) * (kids.length - 1); });
  expect(slack).toBeGreaterThanOrEqual(8);
});

/* Thứ tự thanh bên như Live_Lecture: ☰ + tên app · công cụ · mục chính · (trống) · link 2 app kia ghim đáy. */
for (const min of [false, true]) test(`thứ tự thanh bên, link app ở đáy${min ? ' (thu gọn)' : ''}`, async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(m => localStorage.setItem('study-nav', m ? 'min' : ''), min);
  await page.goto('/logic/');
  await page.waitForSelector('.nav-apps .app-link');
  const r = await page.evaluate(() => {
    const top = s => document.querySelector(s).getBoundingClientRect().top;
    const nav = document.querySelector('.appnav').getBoundingClientRect();
    return { head: top('.nav-head'), tools: top('.appnav-foot'), tabs: top('.tabs'), apps: top('.nav-apps'), mid: nav.top + nav.height / 2,
      appsBottom: document.querySelector('.nav-apps').getBoundingClientRect().bottom, navBottom: nav.bottom };
  });
  expect(r.head).toBeLessThan(r.tools);
  expect(r.tools).toBeLessThan(r.tabs);
  expect(r.tabs).toBeLessThan(r.apps);
  expect(r.apps, 'nhóm link ở nửa dưới').toBeGreaterThan(r.mid);
  expect(r.navBottom - r.appsBottom, 'ghim sát đáy').toBeLessThan(40);
});

test('nút chọn môn: danh sách các môn khác (không có môn đang mở), bấm chuyển môn', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/logic/');
  await page.waitForSelector('#screen-home h1');
  await expect(page.locator('.subject-menu')).toBeHidden();
  await page.click('.subject-switch');
  const links = page.locator('.subject-menu a');
  await expect(links).toHaveCount(SUBJECTS.filter(s => s.app !== false).length - 1);
  await expect(page.locator('.subject-menu a[href="/logic/"]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('.subject-menu')).toBeHidden();
  await page.click('.subject-switch');
  await page.click('.subject-menu a[href="/prog/"]');
  await page.waitForURL('**/prog/**');
  await expect(page.locator('html')).toHaveAttribute('data-subject', 'prog');
});

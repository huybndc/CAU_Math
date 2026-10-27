import { test, expect } from '@playwright/test';

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

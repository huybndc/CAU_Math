import { test, expect } from '@playwright/test';
import { measure, THR } from './ui-measure.js';

/* Gate UI (skill huy-ui-review). Đặt cạnh ui-measure.js trong tests/e2e. Đổi ROUTES/READY theo app.
   `fail` làm gate đỏ; `warn` chỉ in ra và đính kèm trong báo cáo. */
const ROUTES = (process.env.UI_AUDIT_ROUTES || '/').split(',');
const READY = process.env.UI_AUDIT_READY || 'main';

for (const theme of ['light', 'dark']) for (const route of ROUTES) {
  test(`ui-audit ${theme} ${route} 1280×720`, async ({ page }, info) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(route);
    await page.waitForSelector(READY);
    await page.waitForTimeout(400);
    const r = await page.evaluate(measure, THR);
    await info.attach(`ui-audit-${theme}.json`, { body: JSON.stringify(r, null, 2), contentType: 'application/json' });
    console.log(`UIAUDIT ${theme} ${route} warn=${r.warn.length}\n${r.warn.slice(0, 8).join('\n')}`);
    expect(r.fail, r.fail.join('\n')).toEqual([]);
  });
}

test('ui-audit tự kiểm: bắt lỗi đã biết (nút trắng trên màu nhạt, tiêu đề bị nút đè, chữ nhỏ, vùng bấm nhỏ)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.setContent(`<body style="margin:0"><h1 style="position:absolute;left:20px;top:20px;font-size:32px">Tiêu đề dài</h1><button style="position:absolute;left:60px;top:24px;width:80px;height:30px;background:#c58aaf;color:#fff;font-size:14px;border:0">Đọc</button><p style="position:absolute;top:200px;font-size:10px">chữ nhỏ</p><a href="#" style="position:absolute;top:300px;display:block;width:60px;height:14px">x</a></body>`);
  const all = (await page.evaluate(measure, THR)).fail.join('\n');
  for (const k of ['tương phản', 'đè nhau', 'chữ 10px', 'vùng bấm']) expect(all, `phải bắt: ${k}`).toContain(k);
});

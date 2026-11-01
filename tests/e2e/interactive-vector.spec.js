import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) test(`vector exercise works on desktop in ${theme} mode`, async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/linalg/#/learn/ch1/interactive/2');
  await expect(page.locator('#pane-ch1-interactive > .card h2').last()).toHaveText('Bài tương tác: tìm phần vector còn thiếu');
  await expect(page.locator('.ix-stage')).toBeHidden();

  await page.getByLabel('Dự đoán v').fill('5, 4');
  await page.getByRole('button', { name: 'So sánh dự đoán và mở hình' }).click();
  await expect(page.locator('.ix-stage')).toBeVisible();
  await expect(page.locator('#vector-exercise > .ix-feedback')).toContainText('Dự đoán chưa đúng');

  await page.getByRole('button', { name: 'Gợi ý' }).click();
  await expect(page.locator('.ix-stage .ix-feedback').last()).toContainText('một hành trình');
  await page.getByRole('button', { name: 'Gợi ý' }).click();
  await expect(page.locator('.ix-stage .ix-feedback').last()).toContainText('v = t − u');

  const canvas = page.locator('#vector-exercise canvas');
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.3, { steps: 5 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Kiểm tra vector' }).click();
  await expect(page.locator('.ix-stage .ix-feedback').first()).toHaveText('Đúng: u + v = t.');
  await page.screenshot({ path: testInfo.outputPath(`interactive-${theme}-1280.png`) });
  const content = await page.locator('#pane-ch1-interactive > .card:has(#vector-exercise)').boundingBox();
  expect(content.x + content.width).toBeLessThanOrEqual(1280);
  expect(content.y + content.height).toBeLessThanOrEqual(723);
});

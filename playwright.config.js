import { defineConfig } from '@playwright/test';
import SUBJECTS from './shared/subjects.json' with { type: 'json' };

/* Gate UI (skill huy-ui-review): đo bản build thật (dist) qua vite preview, sáng + tối, 1280×720. Chạy sau `vite build` trong `npm run gate`. */
const PORT = 5198;
process.env.UI_AUDIT_ROUTES ??= SUBJECTS.map(s => `/${s.id}/`).join(',');
process.env.UI_AUDIT_READY ??= '#screen-home h1';

export default defineConfig({
  testDir: 'tests/e2e',
  workers: 2,
  timeout: 30_000,
  use: { baseURL: `http://localhost:${PORT}`, locale: 'vi-VN' },
  webServer: { command: `npx vite preview --port ${PORT} --strictPort`, port: PORT, reuseExistingServer: false },
});

import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { htmlInclude } from './shared/vite-plugin-include.js';
import { syncPlugin } from './shared/vite-plugin-sync.js';
import { progressSink } from './shared/vite-plugin-progress.js';

/*
 * MỘT máy chủ Vite cho cả 3 app (quyết định D01 — phương án B):
 *   /           Tổng quan chung        (index.html)
 *   /logic/     Logic Circuit          (logic/index.html)
 *   /linalg/    Linear Algebra         (linalg/index.html)
 *   /discrete/  Discrete Math          (discrete/index.html)
 * Cổng cố định + strictPort: tiến độ lưu localStorage theo origin, đổi cổng là "mất" tiến độ.
 * syncPlugin: đồng bộ tiến độ giữa các máy qua thư mục đám mây (D37); STUDY_SYNC_DIR đọc từ .env.
 * Build: 4 trang (D47) — Study Hub tải repo này khi deploy, lấy /logic/ /linalg/ /discrete/ đặt vào cùng worker.
 */
const page = p => fileURLToPath(new URL(p, import.meta.url));
export default defineConfig(({ mode }) => ({
  plugins: [htmlInclude(), syncPlugin({ ...process.env, ...loadEnv(mode, process.cwd(), 'STUDY_') }), progressSink()],
  resolve: { alias: { '@shared': fileURLToPath(new URL('./shared', import.meta.url)) } },
  server: { port: 5180, strictPort: true },
  build: { rollupOptions: { input: { home: page('index.html'), logic: page('logic/index.html'), linalg: page('linalg/index.html'), discrete: page('discrete/index.html') } } },
  test: { include: ['{shared,home,logic,linalg,discrete}/tests/**/*.test.js'] },
}));

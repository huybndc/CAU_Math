import { vi } from './vi/index.js';
import { en } from './en/index.js';
import { initI18n } from '@shared/i18n/index.js';

/* Từ điển của app này nạp vào lõi dùng chung (shared/i18n). Các trang vẫn
   import từ đây như cũ nên không phải sửa hàng loạt. */
initI18n({ vi, en });

export * from '@shared/i18n/index.js';

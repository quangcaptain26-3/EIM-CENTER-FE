/**
 * Đối chiếu RoutePaths với khai báo path trong `src/app/router/index.tsx`.
 * Chạy: `npm run test:routes` (từ thư mục eim-center-frontend).
 *
 * Khi thêm route mới: dùng `path: RoutePaths.KEY` hoặc `RoutePaths.KEY` trong Navigate;
 * nếu key không xuất hiện trong file router, bổ sung vào `KEYS_NOT_REFERENCED_IN_ROUTER`
 * kèm comment lý do (alias, index route, modal, v.v.).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function extractRoutePathKeys(routePathsSource) {
  const start = routePathsSource.indexOf('export const RoutePaths = {');
  const end = routePathsSource.indexOf('} as const', start);
  if (start < 0 || end < 0) {
    throw new Error('Không tìm thấy khối `export const RoutePaths = { ... } as const` trong route-paths.ts');
  }
  const block = routePathsSource.slice(start, end);
  const keys = [...block.matchAll(/\n  ([A-Z][A-Z0-9_]*):/g)].map((m) => m[1]);
  return [...new Set(keys)];
}

/** Key có trong RoutePaths nhưng không bắt buộc xuất hiện trong index.tsx — cập nhật khi thêm ngoại lệ mới. */
const KEYS_NOT_REFERENCED_IN_ROUTER = new Set([
  'NOT_FOUND', // catch-all dùng path: '*'
  'DASHBOARD', // trang chủ sau đăng nhập: `index: true` dưới layout `/`, không dùng path: RoutePaths.DASHBOARD
  'USER_EDIT', // chỉnh user qua modal (user-management / user-detail), không có route riêng
  'USER_MANAGEMENT', // alias cùng URL với USERS — tránh lặp object route
  'PAYMENT_STATUS', // alias cùng URL với STUDENT_PAYMENT_STATUS — router chỉ khai STUDENT_PAYMENT_STATUS
]);

function keysReferencedInRouter(routerSource) {
  const set = new Set();
  for (const m of routerSource.matchAll(/RoutePaths\.([A-Z][A-Z0-9_]*)/g)) {
    set.add(m[1]);
  }
  return set;
}

function main() {
  const routePathsSrc = readFileSync(join(root, 'src/app/router/route-paths.ts'), 'utf8');
  const routerSrc = readFileSync(join(root, 'src/app/router/index.tsx'), 'utf8');

  const allKeys = extractRoutePathKeys(routePathsSrc);
  const referenced = keysReferencedInRouter(routerSrc);

  const missing = allKeys.filter((k) => !KEYS_NOT_REFERENCED_IN_ROUTER.has(k) && !referenced.has(k));
  if (missing.length) {
    console.error('[check-router-paths] Thiếu tham chiếu RoutePaths trong index.tsx:', missing.join(', '));
    console.error('→ Thêm route hoặc ghi nhận ngoại lệ trong KEYS_NOT_REFERENCED_IN_ROUTER (scripts/check-router-paths.mjs).');
    process.exit(1);
  }

  for (const k of KEYS_NOT_REFERENCED_IN_ROUTER) {
    if (!allKeys.includes(k)) {
      console.error(`[check-router-paths] KEYS_NOT_REFERENCED_IN_ROUTER chứa key không tồn tại: ${k}`);
      process.exit(1);
    }
  }

  if (!routerSrc.includes("path: '*'")) {
    console.error("[check-router-paths] Thiếu catch-all route `path: '*'` (NOT_FOUND).");
    process.exit(1);
  }

  console.log(`[check-router-paths] OK — ${allKeys.length} keys RoutePaths, ${KEYS_NOT_REFERENCED_IN_ROUTER.size} ngoại lệ có chủ đích.`);
}

main();

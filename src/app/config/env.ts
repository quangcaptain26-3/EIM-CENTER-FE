// env.ts
// Đọc và export các biến môi trường của ứng dụng.
// Sử dụng import.meta.env của Vite để truy cập biến từ file .env.
// Có giá trị mặc định an toàn để tránh lỗi khi biến chưa được đặt.

// Helper: lấy chuỗi từ env, nếu trống thì dùng fallback
const getString = (value: string | undefined, fallback: string): string => {
  return value && value.trim() !== '' ? value.trim() : fallback;
};

const apiUrl = getString(
  import.meta.env['VITE_API_URL'] ?? import.meta.env['VITE_API_BASE_URL'],
  'http://localhost:3000/api/v1',
);

// Đối tượng env tập trung – import từ đây thay vì dùng import.meta.env trực tiếp
export const env = {
  /** Base URL API (ưu tiên VITE_API_URL, fallback VITE_API_BASE_URL) — khớp axios */
  API_URL: apiUrl,
  /** @deprecated dùng API_URL */
  API_BASE_URL: apiUrl,

  APP_NAME: getString(import.meta.env['VITE_APP_NAME'], 'EIM Center'),

  APP_VERSION: getString(import.meta.env['VITE_APP_VERSION'], '0.0.0'),

  APP_ENV: getString(import.meta.env['VITE_APP_ENV'], 'development'),
} as const;

// Helper kiểm tra môi trường
export const isDev = env.APP_ENV === 'development';
export const isProd = env.APP_ENV === 'production';

// Sửa [A5-1]: Cảnh báo rõ ràng khi VITE_API_BASE_URL chưa được cấu hình ở môi trường production
// Tránh silent fallback về localhost:3000 gây toàn bộ API call thất bại khi deploy
if (isProd && !import.meta.env['VITE_API_URL'] && !import.meta.env['VITE_API_BASE_URL']) {
  console.error(
    '[env] CẢNH BÁO: Chưa cấu hình VITE_API_URL (hoặc VITE_API_BASE_URL) cho production. ' +
      'Kiểm tra file .env hoặc biến CI/CD.',
  );
}

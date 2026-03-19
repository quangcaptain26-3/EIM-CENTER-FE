// env.ts
// Đọc và export các biến môi trường của ứng dụng.
// Sử dụng import.meta.env của Vite để truy cập biến từ file .env.
// Có giá trị mặc định an toàn để tránh lỗi khi biến chưa được đặt.

// Helper: lấy chuỗi từ env, nếu trống thì dùng fallback
const getString = (value: string | undefined, fallback: string): string => {
  return value && value.trim() !== '' ? value.trim() : fallback;
};

// Đối tượng env tập trung – import từ đây thay vì dùng import.meta.env trực tiếp
export const env = {
  // URL gốc của API backend
  API_BASE_URL: getString(import.meta.env['VITE_API_BASE_URL'], 'http://localhost:3000'),

  // Tên hiển thị của ứng dụng
  APP_NAME: getString(import.meta.env['VITE_APP_NAME'], 'EIM Center'),

  // Môi trường chạy: development | staging | production
  APP_ENV: getString(import.meta.env['VITE_APP_ENV'], 'development'),
} as const;

// Helper kiểm tra môi trường
export const isDev = env.APP_ENV === 'development';
export const isProd = env.APP_ENV === 'production';

// Sửa [A5-1]: Cảnh báo rõ ràng khi VITE_API_BASE_URL chưa được cấu hình ở môi trường production
// Tránh silent fallback về localhost:3000 gây toàn bộ API call thất bại khi deploy
if (isProd && !import.meta.env['VITE_API_BASE_URL']) {
  console.error(
    '[env] CẢNH BÁO NGHIÊM TRỌNG: Biến VITE_API_BASE_URL chưa được cấu hình cho môi trường production! ' +
    'Tất cả API call sẽ hướng tới localhost:3000 và thất bại. ' +
    'Vui lòng thêm VITE_API_BASE_URL vào file .env hoặc biến môi trường CI/CD.'
  );
}

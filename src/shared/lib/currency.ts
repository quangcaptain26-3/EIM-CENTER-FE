/**
 * @file currency.ts
 * @description Các hàm tiện ích để xử lý định dạng tiền tệ (VND).
 */

/**
 * Định dạng số thành chuỗi tiền tệ VND.
 * Ví dụ: 1500000 -> "1.500.000 ₫"
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Chuyển một chuỗi định dạng tiền tệ ngược lại thành số.
 * Ví dụ: "1.500.000 ₫" -> 1500000
 */
export function parseVND(str: string): number {
  // Loại bỏ các ký tự không phải số (giữ lại dấu âm nếu có)
  const cleanStr = str.replace(/[^\d-]/g, "");
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? 0 : num;
}

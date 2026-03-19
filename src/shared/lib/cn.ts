// cn.ts
// Tiện ích nối CSS class sạch sẽ, đặc biệt khi build các thẻ Shared UI phức tạp dùng Tailwind v4.

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Nối mảng class và xử lý xung đột của Tailwind (bỏ phần đè sau).
 * Vd: cn('px-4', 'px-8') -> 'px-8'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

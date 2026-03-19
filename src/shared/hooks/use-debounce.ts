import { useState, useEffect } from 'react';

/**
 * Hook debounce: Trì hoãn việc cập nhật giá trị sau một khoảng thời gian (delay)
 * Rất hữu ích khi làm chức năng search/gõ phím
 */
export const useDebounce = <T>(value: T, delayMs: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cài đặt timer cập nhật debounce sau delayMs
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Xoá timer nếu value thay đổi lại liên tục chưa đến delayMs (cleanup)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
};

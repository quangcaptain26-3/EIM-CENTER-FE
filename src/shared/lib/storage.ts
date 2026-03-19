// storage.ts
// Helper làm việc với localStorage, bao bọc bằng try/catch
// giúp ứng dụng không bị crash nếu trình duyệt chặn storage (vd: Incognito mode).

export const getStorageItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error(`[Storage] Lỗi khi đọc key "${key}":`, error);
    return null;
  }
};

export const setStorageItem = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[Storage] Lỗi khi lưu key "${key}":`, error);
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[Storage] Lỗi khi xoá key "${key}":`, error);
  }
};

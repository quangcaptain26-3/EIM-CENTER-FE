/**
 * src/shared/lib/excel.ts
 * Tiện ích hỗ trợ tải file Excel từ API trả về Blob.
 * Sử dụng apiClient (axios) để đảm bảo Authorization header được gửi kèm tự động.
 */
import { apiClient } from '@/app/config/axios';

const tryExtractFilenameFromContentDisposition = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim() === '') return null;

  // Ví dụ header:
  // - attachment; filename="feedback-123-2026-03-17.xlsx"
  // - attachment; filename=feedback.xlsx
  // - attachment; filename*=UTF-8''feedback%20report.xlsx
  const filenameStar = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(value);
  if (filenameStar?.[1]) {
    try {
      return decodeURIComponent(filenameStar[1].trim());
    } catch {
      // Nếu decode lỗi thì fallback xuống filename thường
    }
  }

  const filename = /filename\s*=\s*("?)([^";]+)\1/i.exec(value);
  if (!filename?.[2]) return null;

  return filename[2].trim();
};

/**
 * Hàm tải file Excel từ API.
 * - Dùng axios (apiClient) nên Authorization header được interceptor tự động đính vào.
 * - Phát hiện và parse lỗi khi BE trả JSON thay vì Blob (tránh tạo file xlsx rỗng/lỗi).
 * - Edge case "không có data": BE trả file hợp lệ với sheet báo "Không có dữ liệu",
 *   FE vẫn download bình thường — người dùng thấy sheet trống kèm thông báo.
 *
 * @param url      Đường dẫn API (không bao gồm /api/v1 vì baseURL đã config trong apiClient)
 * @param params   Tham số query params (object key-value)
 * @param filename Tên file lưu trên máy người dùng
 */
export async function downloadExcelFromApi(
  url: string,
  params: Record<string, unknown> = {},
  filename: string,
): Promise<void> {
  // Lọc bỏ các params undefined/null để tránh gửi query string thừa
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );

  const response = await apiClient.get(url, {
    params: cleanParams,
    responseType: 'blob', // Bắt buộc để axios không parse body thành text/json
  }).catch(async (error) => {
    // Axios throws khi status >= 4xx — data vẫn là Blob chứa JSON lỗi
    if (error.response?.data instanceof Blob) {
      const text = await (error.response.data as Blob).text();
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Lỗi khi tải báo cáo Excel');
      } catch {
        throw new Error('Lỗi khi tải báo cáo Excel');
      }
    }
    throw new Error(error.message || 'Lỗi mạng khi xuất file Excel');
  });

  const fileBlob = response.data as Blob;
  const contentType = response.headers?.['content-type'] || '';
  const headerFilename = tryExtractFilenameFromContentDisposition(response.headers?.['content-disposition']);
  const finalFilename = headerFilename || filename;

  // Nếu BE trả về JSON lỗi nhưng với status 200 (ít gặp nhưng cần handle)
  if (fileBlob.type === 'application/json' || contentType.includes('application/json')) {
    const text = await fileBlob.text();
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || 'Lỗi không xác định khi xuất file');
    } catch {
      throw new Error('Lỗi không xác định khi xuất file Excel');
    }
  }

  // Tạo link ảo để trigger download trên trình duyệt
  const downloadUrl = window.URL.createObjectURL(new Blob([fileBlob]));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();

  // Dọn dẹp DOM và giải phóng object URL
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

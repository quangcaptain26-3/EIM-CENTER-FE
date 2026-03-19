/**
 * src/shared/types/common.type.ts
 * Các kiểu dữ liệu tiện ích (Utility Types) dùng chung cho toàn bộ dự án.
 */

/** 
 * Một kiểu giá trị có thể mang theo Null thích hợp cho đối chiếu / xử lý API 
 */
export type Nullable<T> = T | null;

/** 
 * Kiểu biến thể rộng hơn dùng cho optional props / state 
 */
export type Maybe<T> = T | null | undefined;

/**
 * Kiểu đối tượng dạng Key-Value dictionary chung
 */
export type Dictionary<T = any> = Record<string, T>;

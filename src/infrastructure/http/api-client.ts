// api-client.ts
// Khởi tạo instance axios nền tảng với base configuration.

import axios from 'axios';
import { env } from '@/app/config/env';

// Khởi tạo axios instance dùng chung trên toàn ứng dụng.
export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  // 15 giây chờ, tránh treo app vĩnh viễn
  timeout: 15_000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

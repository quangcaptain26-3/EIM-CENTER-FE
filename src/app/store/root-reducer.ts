// root-reducer.ts
// Kết hợp tất cả slice reducer thành một rootReducer duy nhất.
// Thêm slice mới vào đây khi mở rộng tính năng.

import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/infrastructure/store/auth.slice';
import uiReducer from '@/infrastructure/store/ui.slice';

const rootReducer = combineReducers({
  // Quản lý trạng thái xác thực (access token, user info)
  auth: authReducer,
  // Quản lý trạng thái giao diện (sidebar, theme)
  ui: uiReducer,
});

export default rootReducer;

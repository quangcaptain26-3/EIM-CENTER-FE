// store/index.ts
// Cấu hình Redux store cho toàn ứng dụng.
// Export store, RootState và AppDispatch để dùng trong hooks.

import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './root-reducer';

// Tạo store từ rootReducer
export const store = configureStore({
  reducer: rootReducer,
  // middleware mặc định của Redux Toolkit (bao gồm thunk) đã được thêm tự động
});

// Kiểu trạng thái toàn bộ store – dùng trong useAppSelector
export type RootState = ReturnType<typeof store.getState>;

// Kiểu dispatch – dùng trong useAppDispatch
export type AppDispatch = typeof store.dispatch;

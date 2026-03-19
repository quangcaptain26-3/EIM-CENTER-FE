// store/hooks.ts
// Cung cấp các typed hooks để tương tác với Redux store.
// Luôn dùng useAppDispatch / useAppSelector thay vì useDispatch / useSelector gốc.

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Hook dispatch có kiểu – hỗ trợ thunk và type check
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Hook selector có kiểu – tự động biết kiểu state
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector<RootState, T>(selector);

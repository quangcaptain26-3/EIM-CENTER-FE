import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setTheme, toggleTheme, type ThemeMode } from '@/app/store/ui.slice';

/**
 * Theme mặc định: `dark` (localStorage `eim-theme`). Light: bỏ class `dark` trên `<html>` (xem `ThemeSync`).
 */
export function useTheme() {
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();
  return {
    theme,
    setTheme: (mode: ThemeMode) => dispatch(setTheme(mode)),
    toggleTheme: () => dispatch(toggleTheme()),
  };
}

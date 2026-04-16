import { useLayoutEffect } from 'react';
import { useAppSelector } from '@/app/store/hooks';

/** Đồng bộ `theme` Redux → class `dark` trên `<html>` (light = không có class). */
export function ThemeSync() {
  const theme = useAppSelector((s) => s.ui.theme);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');

    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      root.style.removeProperty('transition');
      return;
    }
    root.style.transition =
      'background-color 0.32s ease, color 0.28s ease, border-color 0.28s ease';
  }, [theme]);

  return null;
}

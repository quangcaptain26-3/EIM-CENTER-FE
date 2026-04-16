import { useAppSelector } from '@/app/store/hooks';

/** Màu biểu đồ Recharts — đồng bộ light/dark, đọc rõ trên nền sáng/tối */
export function useChartColors() {
  const isDark = useAppSelector((s) => s.ui.theme === 'dark');

  return {
    isDark,
    brand: isDark ? '#818cf8' : '#6c63ff',
    success: isDark ? '#34d399' : '#10b981',
    warning: isDark ? '#fbbf24' : '#f59e0b',
    danger: isDark ? '#f87171' : '#ef4444',

    brandFill: isDark ? 'rgba(129,140,248,0.15)' : 'rgba(108,99,255,0.08)',
    successFill: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(16,185,129,0.07)',

    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(108,99,255,0.08)',
    axis: isDark ? '#5A5A72' : '#8B88BB',
    axisLine: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(108,99,255,0.12)',

    tooltipBg: isDark ? '#1A1A24' : '#FFFFFF',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(108,99,255,0.15)',
    tooltipText: isDark ? '#F0F0F5' : '#1A1740',
    tooltipMuted: isDark ? '#9898B0' : '#8B88BB',

    barColors: isDark
      ? ['#818cf8', '#34d399', '#06b6d4', '#fbbf24', '#a78bfa']
      : ['#6c63ff', '#10b981', '#0891b2', '#f59e0b', '#8b5cf6'],
  } as const;
}

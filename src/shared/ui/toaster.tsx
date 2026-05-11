import { Toaster } from 'sonner';
import { useAppSelector } from '@/app/store/hooks';

/** Sonner — richColors + theme theo Redux */
export function AppToaster() {
  const theme = useAppSelector((s) => s.ui.theme);

  return (
    <Toaster
      position="top-right"
      richColors
      theme={theme === 'dark' ? 'dark' : 'light'}
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]',
        },
      }}
    />
  );
}

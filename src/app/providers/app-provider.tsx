// Provider tổng hợp: Store → Query → Toast → App (init auth + router)

import type { ReactNode } from 'react';
import App from '@/App';
import StoreProvider from './store-provider';
import QueryProvider from './query-provider';
import ToastProvider from './toast-provider';
import { ThemeSync } from './theme-sync';

interface AppProviderProps {
  children?: ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <StoreProvider>
      <ThemeSync />
      <QueryProvider>
        <ToastProvider>{children ?? <App />}</ToastProvider>
      </QueryProvider>
    </StoreProvider>
  );
};

export default AppProvider;

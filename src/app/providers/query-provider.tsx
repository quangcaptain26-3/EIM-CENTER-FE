// query-provider.tsx
// Provider cung cấp TanStack Query client cho toàn bộ component tree.
// Tất cả hook như useQuery, useMutation đều phụ thuộc vào provider này.

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/app/config/query-client";
import type { ReactNode } from "react";

// TODO: Cài @tanstack/react-query-devtools để debug query trong môi trường dev
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryProviderProps {
  children: ReactNode;
}

const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default QueryProvider;

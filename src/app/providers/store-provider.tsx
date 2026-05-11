// store-provider.tsx
// Provider bao ngoài toàn bộ app để cung cấp Redux store.
// Tất cả component con đều có thể dùng useAppSelector / useAppDispatch.

import { Provider } from "react-redux";
import { store } from "@/app/store";
import type { ReactNode } from "react";

interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider = ({ children }: StoreProviderProps) => {
  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;

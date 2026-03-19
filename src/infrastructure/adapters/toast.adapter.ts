// toast.adapter.ts
// Wrapper chuẩn hoá thư viện Sonner. Mọi File logic (API) hay UI Component 
// chỉ được Import từ file này để tránh bị lock-in thư viện thứ 3.

import { toast } from 'sonner';

export const toastAdapter = {
  success: (message: string) => {
    toast.success(message);
  },
  
  error: (message: string) => {
    toast.error(message);
  },
  
  info: (message: string) => {
    toast.info(message);
  },
  
  warning: (message: string) => {
    toast.warning(message);
  }
};

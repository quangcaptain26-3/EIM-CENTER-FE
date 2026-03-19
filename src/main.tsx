// main.tsx
// Điểm khởi chạy của ứng dụng React.
// Bọc <App /> trong <AppProvider /> để cung cấp store, query, toast, router.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Import CSS nền tảng của app (reset, variables, utilities)
import "@/styles/index.css";

import AppProvider from "@/app/providers/app-provider";

// Tìm phần tử root trong index.html và mount ứng dụng
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "[main.tsx] Không tìm thấy phần tử #root trong DOM. Kiểm tra lại index.html.",
  );
}

createRoot(rootElement).render(
  <StrictMode>
    {/* AppProvider bọc toàn bộ: Store → Query → Toast → Router */}
    <AppProvider />
  </StrictMode>,
);

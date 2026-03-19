// router-provider.tsx
// Cầu nối giữa cấu hình router và React component tree.
// Sử dụng RouterProvider của React Router DOM.

import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";

const RouterProviderWrapper = () => {
  // Render toàn bộ cây route được định nghĩa trong app/router/index.tsx
  return <RouterProvider router={router} />;
};

export default RouterProviderWrapper;

// App.tsx
// Component gốc của ứng dụng.
// Ở giai đoạn FE-0A, App chỉ đơn giản render RouterProviderWrapper.
// Logic layout, auth guard sẽ được thêm ở FE-0B trở đi.

import RouterProviderWrapper from "@/app/providers/router-provider";

const App = () => {
  // Render toàn bộ cây route – router tự quản lý URL matching
  return <RouterProviderWrapper />;
};

export default App;

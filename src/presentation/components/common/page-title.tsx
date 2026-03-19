// page-title.tsx
// Header thông tin đầu mỗi trang (Ví dụ: Danh sách học viên, Dashboard...)

import type { ReactNode } from "react";

export interface PageTitleProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode; // Khối Nút chức năng bên góc phải
}

export const PageTitle = ({ title, subtitle, actions }: PageTitleProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 pb-2">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

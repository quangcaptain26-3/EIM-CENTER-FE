// page-shell.tsx
// Shell layout tái sử dụng cho các trang nội dung, dùng Tailwind.

import type { ReactNode } from "react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const PageShell = ({ title, subtitle, actions, children }: PageShellProps) => {
  return (
    <div className="w-full px-6 pt-8 pb-12">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="shrink-0 flex items-center gap-2">{actions}</div>
        )}
      </div>

      {/* Nội dung trang */}
      {children}
    </div>
  );
};

export default PageShell;

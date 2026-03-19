// breadcrumb.tsx
// Điều hướng "Trang chủ / Khóa học / React-101"

import { Link } from "react-router-dom";
import { RoutePaths } from "@/app/router/route-paths";
import { cn } from "@/shared/lib/cn";
import { Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  return (
    <nav
      className={cn(
        "flex text-sm text-[var(--color-text-muted)] mb-4",
        className,
      )}
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-1.5">
        {/* Item đầu tiên giả định là Home/Dashboard */}
        <li className="inline-flex items-center">
          <Link
            to={RoutePaths.DASHBOARD}
            className="text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 p-1.5 rounded-md border border-slate-100/50 hover:bg-indigo-50 hover:border-indigo-100"
          >
            <Home className="w-[14px] h-[14px]" strokeWidth={2.5} />
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <span className="mx-1 text-slate-300 font-bold">/</span>
              {item.href && !item.active ? (
                <Link
                  to={item.href}
                  className="hover:text-indigo-600 font-medium transition-colors ml-1"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-700 font-bold ml-1 tracking-tight">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

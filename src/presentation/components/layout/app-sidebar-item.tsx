import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/cn";

interface AppSidebarItemProps {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  isSidebarOpen: boolean;
  onClick?: () => void;
}

export const AppSidebarItem = ({
  label,
  to,
  icon: Icon,
  isSidebarOpen,
  onClick,
}: AppSidebarItemProps) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "relative flex items-center py-3 my-1 rounded-2xl transition-all duration-300 ease-out font-medium group overflow-hidden",
          isSidebarOpen
            ? "px-4 mx-3 justify-start"
            : "px-0 mx-2 justify-center",
          isActive
            ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30"
            : "text-slate-500 hover:bg-slate-100/80 hover:text-indigo-700",
        )
      }
      title={isSidebarOpen ? undefined : label}
    >
      <Icon
        className={cn(
          "shrink-0 transition-transform duration-300 group-hover:scale-110 z-10",
          isSidebarOpen ? "mr-4 h-5 w-5" : "h-6 w-6",
        )}
      />

      <span
        className={cn(
          "truncate z-10 transition-all duration-300 tracking-wide font-semibold",
          isSidebarOpen
            ? "w-full opacity-100 translate-x-0"
            : "w-0 opacity-0 -translate-x-4 hidden",
        )}
      >
        {label}
      </span>

      {/* Light overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-white/10 opacity-0 transition-opacity rounded-2xl pointer-events-none",
          "group-hover:opacity-100",
        )}
      />
    </NavLink>
  );
};

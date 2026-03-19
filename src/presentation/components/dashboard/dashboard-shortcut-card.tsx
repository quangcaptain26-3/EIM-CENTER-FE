/**
 * src/presentation/components/dashboard/dashboard-shortcut-card.tsx
 * Component card truy cập nhanh các tính năng
 */
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface DashboardShortcutCardProps {
  title: string;
  description: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DashboardShortcutCard = ({
  title,
  description,
  to,
  icon: Icon,
}: DashboardShortcutCardProps) => {
  return (
    <Link
      to={to}
      className="group relative flex flex-col p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.15)] hover:border-indigo-100 min-h-[160px] overflow-hidden"
    >
      {/* Decorative gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

      <div className="flex items-start justify-between mb-5 z-10 relative">
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 shadow-inner group-hover:shadow-indigo-100/50">
          <Icon className="h-7 w-7" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 bg-indigo-600 p-2 rounded-full text-white -translate-x-4 group-hover:translate-x-0 shadow-lg shadow-indigo-200">
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
        </div>
      </div>

      <div className="mt-auto text-left z-10 relative">
        <h3 className="font-extrabold text-lg text-slate-800 tracking-tight leading-snug group-hover:text-indigo-900 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </Link>
  );
};

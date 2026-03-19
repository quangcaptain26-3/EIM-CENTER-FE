/**
 * src/presentation/components/common/nav-section-title.tsx
 * Tiêu đề phân đoạn trong menu sidebar (ví dụ: TÀI CHÍNH, HỆ THỐNG)
 */
import { cn } from "@/shared/lib/cn";

interface NavSectionTitleProps {
  label: string;
  className?: string;
}

export const NavSectionTitle = ({ label, className }: NavSectionTitleProps) => {
  return (
    <div
      className={cn(
        "text-[10px] font-extrabold text-slate-400 mt-6 mb-2 px-6 uppercase tracking-[0.2em] flex items-center gap-3",
        className,
      )}
    >
      <span className="whitespace-nowrap">{label}</span>
      <div className="h-[1px] w-full bg-slate-100/80" />
    </div>
  );
};

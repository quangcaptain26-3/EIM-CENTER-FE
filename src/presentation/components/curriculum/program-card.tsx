import type { ReactNode } from "react";
import type { ProgramModel } from "@/domain/curriculum/models/program.model";
import { getProgramLevelLabel } from "@/domain/curriculum/rules/curriculum.rule";

export interface ProgramCardProps {
  program: ProgramModel;
  onView?: (id: string) => void;
  actions?: ReactNode;
}

/**
 * Component thẻ (Card) hiển thị tóm tắt thông tin của 1 chương trình học (Program)
 */
export const ProgramCard = ({ program, onView, actions }: ProgramCardProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md mb-2">
            {program.code}
          </span>
          <h3 className="text-lg font-bold text-slate-800 line-clamp-2">
            {program.name}
          </h3>
        </div>
        {/* Actions slot ở góc phải trên cùng (nếu có context menu) */}
      </div>

      {/* Thông tin chi tiết */}
      <div className="space-y-2 mb-6 flex-1">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Cấp độ:</span>
          <span className="font-medium text-slate-700">
            {getProgramLevelLabel(program.level)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Tổng số Units:</span>
          <span className="font-medium text-slate-700">
            {program.totalUnits}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Bài học / Unit:</span>
          <span className="font-medium text-slate-700">
            {program.lessonsPerUnit} bài
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Thời lượng:</span>
          <span className="font-medium text-slate-700">
            {program.sessionsPerWeek} buổi / tuần
          </span>
        </div>
      </div>

      {/* Nút hành động ở dưới cùng */}
      <div className="pt-4 border-t border-slate-100 flex gap-2 items-center justify-end mt-auto">
        {actions}

        {onView && (
          <button
            onClick={() => onView(program.id)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-150"
          >
            Xem chi tiết
          </button>
        )}
      </div>
    </div>
  );
};

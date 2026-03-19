import type { ProgramModel } from "@/domain/curriculum/models/program.model";
import { getProgramLevelLabel } from "@/domain/curriculum/rules/curriculum.rule";

export interface ProgramSummaryProps {
  program: ProgramModel;
}

/**
 * Component hiển thị tóm tắt chi tiết của 1 chương trình học ở đầu trang Detail
 */
export const ProgramSummary = ({ program }: ProgramSummaryProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">
            Mã chương trình
          </p>
          <p className="text-base font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded inline-block">
            {program.code}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Cấp độ</p>
          <p className="text-base font-semibold text-slate-900">
            {getProgramLevelLabel(program.level)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">
            Thời lượng học
          </p>
          <p className="text-base font-semibold text-slate-900">
            {program.sessionsPerWeek} buổi / tuần
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Cấu trúc</p>
          <p className="text-base font-semibold text-slate-900">
            {program.totalUnits} Units
            <span className="text-slate-400 font-normal mx-1">·</span>
            {program.lessonsPerUnit} bài / Unit
          </p>
        </div>
      </div>
    </div>
  );
};

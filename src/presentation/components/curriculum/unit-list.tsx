import type { UnitModel } from "../../../domain/curriculum/models/unit.model";
import { EmptyState } from "../../../shared/ui/feedback/empty";

export interface UnitListProps {
  units: UnitModel[];
  onViewUnit?: (unitId: string) => void;
  onEditUnit?: (unitId: string) => void;
}

/**
 * Component hiển thị danh sách các Units trong trang chi tiết Program
 */
export const UnitList = ({ units, onViewUnit, onEditUnit }: UnitListProps) => {
  if (!units || units.length === 0) {
    return (
      <EmptyState
        title="Chưa có Unit nào"
        description="Chương trình này hiện chưa được cấu hình danh sách Unit."
        className="bg-white border text-sm py-8"
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4 w-24">Unit No.</th>
              <th className="px-6 py-4">Tiêu đề Unit</th>
              <th className="px-6 py-4 text-center">Tổng số bài học</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {units.map((unit) => (
              <tr
                key={unit.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4 font-semibold text-slate-900">
                  Unit {unit.unitNo}
                </td>
                <td className="px-6 py-4 text-slate-700">{unit.title}</td>
                <td className="px-6 py-4 text-center text-slate-500">
                  {unit.totalLessons} bài học
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {onEditUnit && (
                      <button
                        onClick={() => onEditUnit(unit.id)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Sửa
                      </button>
                    )}
                    {onViewUnit && (
                      <button
                        onClick={() => onViewUnit(unit.id)}
                        className="text-slate-600 hover:text-slate-900 font-medium bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        Xem Lessons
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

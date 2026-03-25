import { useState } from "react";
import { Calendar, Sparkles } from "lucide-react";
import { useClassSessions } from "@/presentation/hooks/sessions";
import { SessionTimelineList } from "@/presentation/components/sessions/session-timeline-list";
import { useGenerateSessions } from "@/presentation/hooks/sessions/use-session-mutations";
import { ConfirmDialog } from "@/presentation/components/common/confirm-dialog";
import { ProtectedAction } from "@/presentation/components/common/protected-action";
import { AppRoles } from "@/shared/constants/roles";
import type { ClassScheduleModel } from "@/domain/classes/models/class.model";

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
  7: "CN",
};

export interface ClassSchedulesTabProps {
  classId: string;
  /** Lịch cố định của lớp (từ GET /classes/:id). */
  schedules: ClassScheduleModel[];
}

/**
 * Tab hiển thị thống kê danh sách trạng thái của từng buổi học
 */
export const ClassSchedulesTab = ({ classId, schedules }: ClassSchedulesTabProps) => {
  const { data: sessions, isLoading, isError } = useClassSessions(classId);
  const { mutate: generateSessions, isPending: isGenerating } = useGenerateSessions(classId);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);

  const hasSchedules = schedules.length > 0;
  const sessionCount = sessions?.length ?? 0;
  const canGenerate = hasSchedules;

  const handleGenerateFirst = () => {
    generateSessions({});
  };

  const handleConfirmReplace = () => {
    generateSessions({ replaceExisting: true }, { onSuccess: () => setConfirmReplaceOpen(false) });
  };

  if (isError) {
    return (
      <div className="py-10 text-center text-red-500 bg-red-50 rounded-lg">
        Đã có lỗi xảy ra khi tải danh sách buổi học.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Lịch các buổi học (Sessions)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách các buổi học được sinh từ lịch cố định và chương trình. Có thể đổi lịch, gán giáo viên thay ở module chi tiết buổi học.
          </p>
          {hasSchedules && (
            <p className="text-xs text-gray-500 mt-2 flex flex-wrap items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              Lịch tuần:{" "}
              {schedules
                .map(
                  (s) =>
                    `${WEEKDAY_LABELS[s.weekday] ?? `T${s.weekday}`} ${s.startTime?.slice(0, 5)}–${s.endTime?.slice(0, 5)}`,
                )
                .join(" · ")}
            </p>
          )}
        </div>

        <ProtectedAction allowedRoles={[AppRoles.ROOT, AppRoles.ACADEMIC]}>
          {canGenerate && sessionCount === 0 && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateFirst}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Đang sinh…" : "Sinh buổi học"}
            </button>
          )}
          {canGenerate && sessionCount > 0 && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => setConfirmReplaceOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              Sinh lại buổi học
            </button>
          )}
        </ProtectedAction>
      </div>

      {!hasSchedules && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Lớp chưa có lịch học cố định. Cập nhật lịch qua API{" "}
          <code className="rounded bg-amber-100 px-1">PUT /classes/:id/schedules</code> hoặc thêm khi tạo lớp mới, sau đó dùng &quot;Sinh buổi học&quot;.
        </div>
      )}

      <SessionTimelineList sessions={sessions || []} isLoading={isLoading} />

      <ConfirmDialog
        isOpen={confirmReplaceOpen}
        title="Sinh lại toàn bộ buổi học?"
        message="Thao tác này sẽ xóa tất cả buổi học hiện tại của lớp và sinh lại theo chương trình. Dữ liệu nhận xét/điểm gắn buổi cũ sẽ mất. Bạn có chắc chắn?"
        confirmLabel="Sinh lại"
        cancelLabel="Hủy"
        isDangerous
        isLoading={isGenerating}
        onConfirm={handleConfirmReplace}
        onCancel={() => setConfirmReplaceOpen(false)}
      />
    </div>
  );
};

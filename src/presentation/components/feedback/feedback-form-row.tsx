/**
 * src/presentation/components/feedback/feedback-form-row.tsx
 * Dòng (row) trong bảng danh sách học viên, cho phép nhập đánh giá và điểm số nội tuyến (inline save).
 */
import { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { useUpsertFeedback, useUpsertScore } from '@/presentation/hooks/feedback/use-feedback-mutations';
import { requiresScore, scoreTypeForSessionType } from '@/domain/feedback/rules/feedback.rule';
import { AttendanceSelect } from './attendance-select';
import { MetricInput } from './metric-input';
import { ScoreInput } from './score-input';

import { HomeworkStatus } from '@/domain/feedback/models/feedback.model';
import type { FeedbackRowModel, AttendanceStatus, FeedbackMetric } from '@/domain/feedback/models/feedback.model';
import type { ScoreModel } from '@/domain/feedback/models/score.model';
import type { SessionType } from '@/domain/sessions/models/session.model';

export interface FeedbackFormRowProps {
  sessionId: string;
  studentId: string;
  studentName: string;
  sessionType: SessionType;
  existingFeedback?: FeedbackRowModel | null;
  existingScore?: ScoreModel | null;
  disabled?: boolean;
}

export const FeedbackFormRow = ({
  sessionId,
  studentId,
  studentName,
  sessionType,
  existingFeedback,
  existingScore,
  disabled
}: FeedbackFormRowProps) => {
  // State quản lý giá trị Feedback
  const [attendance, setAttendance] = useState<AttendanceStatus | null>(existingFeedback?.attendance ?? null);
  const [homework, setHomework] = useState<HomeworkStatus | null>(existingFeedback?.homework ?? null);
  const [participation, setParticipation] = useState<FeedbackMetric | null>(existingFeedback?.participation ?? null);
  const [behavior, setBehavior] = useState<FeedbackMetric | null>(existingFeedback?.behavior ?? null);
  const [languageUsage, setLanguageUsage] = useState<FeedbackMetric | null>(existingFeedback?.languageUsage ?? null);
  const [comment, setComment] = useState<string | null>(existingFeedback?.comment ?? null);

  // State quản lý giá trị Score (4 kỹ năng)
  const [listening, setListening] = useState<number | null>(existingScore?.listening ?? null);
  const [reading, setReading] = useState<number | null>(existingScore?.reading ?? null);
  const [writing, setWriting] = useState<number | null>(existingScore?.writing ?? null);
  const [speaking, setSpeaking] = useState<number | null>(existingScore?.speaking ?? null);
  const [note, setNote] = useState<string | null>(existingScore?.note ?? null);

  // Trạng thái lưu
  const [isDirtyFb, setIsDirtyFb] = useState(false);
  const [isDirtyScore, setIsDirtyScore] = useState(false);

  // Mutations
  const { mutate: upsertFb, isPending: isSavingFb } = useUpsertFeedback();
  const { mutate: upsertSc, isPending: isSavingScore } = useUpsertScore();

  const isSaving = isSavingFb || isSavingScore;
  const isDirty = isDirtyFb || isDirtyScore;
  const showScoreSection = requiresScore(sessionType);

  // Theo dõi sự thay đổi để đánh dấu 'isDirty'
  useEffect(() => {
    const origFb = existingFeedback;
    if (
      attendance !== (origFb?.attendance ?? null) ||
      homework !== (origFb?.homework ?? null) ||
      participation !== (origFb?.participation ?? null) ||
      behavior !== (origFb?.behavior ?? null) ||
      languageUsage !== (origFb?.languageUsage ?? null) ||
      comment !== (origFb?.comment ?? null)
    ) {
      setIsDirtyFb(true);
    } else {
      setIsDirtyFb(false);
    }
  }, [attendance, homework, participation, behavior, languageUsage, comment, existingFeedback]);

  useEffect(() => {
    const origSc = existingScore;
    if (
      listening !== (origSc?.listening ?? null) ||
      reading !== (origSc?.reading ?? null) ||
      writing !== (origSc?.writing ?? null) ||
      speaking !== (origSc?.speaking ?? null) ||
      note !== (origSc?.note ?? null)
    ) {
      setIsDirtyScore(true);
    } else {
      setIsDirtyScore(false);
    }
  }, [listening, reading, writing, speaking, note, existingScore]);

  /** 
   * Hàm lưu dữ liệu
   */
  const handleSave = () => {
    if (isDirtyFb) {
      upsertFb({
        sessionId,
        studentId,
        payload: {
          attendance,
          homework,
          participation,
          behavior,
          languageUsage,
          comment: comment,
        }
      });
    }

    if (isDirtyScore && showScoreSection) {
      // Tính toán Total điểm trung bình (có thể BE tự tính, nhưng gửi lên để đồng bộ)
      const valid = [listening, reading, writing, speaking].filter((s): s is number => s !== null);
      const total = valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;

      upsertSc({
        sessionId,
        studentId,
        scoreType: scoreTypeForSessionType(sessionType),
        payload: {
          listening,
          reading,
          writing,
          speaking,
          total,
          note: note,
        }
      });
    }
  };

  return (
    <div className={cn('p-4 rounded-lg border bg-white flex flex-col gap-4 shadow-sm w-full', (isDirty) && 'border-blue-300 ring-1 ring-blue-100')}>
      
      {/* HEADER ROW: Học viên - Điểm danh - Bài tập - Lưu */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-gray-900 w-44 truncate" title={studentName}>
            {studentName}
          </div>
          
          <AttendanceSelect
            value={attendance}
            onChange={setAttendance}
            disabled={disabled || isSaving}
            className="w-[140px]"
          />

          <select
            value={homework || ''}
            onChange={(e) => setHomework(e.target.value ? e.target.value as HomeworkStatus : null)}
            disabled={disabled || isSaving}
            className="h-8 px-2 py-1 text-sm rounded border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
            aria-label="Chọn trạng thái bài tập về nhà"
          >
            <option value="" disabled>-- Bài tập VN --</option>
            <option value={HomeworkStatus.DONE}>Đã làm đủ</option>
            <option value={HomeworkStatus.NOT_DONE}>Chưa làm</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {isSaving && <Badge variant="warning" className="animate-pulse">Đang lưu...</Badge>}
          {!isSaving && isDirty && <Badge variant="info">Chưa lưu</Badge>}
          {!isSaving && !isDirty && <Badge variant="success">Đã lưu</Badge>}
          
          <button
            type="button"
            onClick={handleSave}
            disabled={disabled || !isDirty || isSaving}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              isDirty && !isSaving 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
            aria-label={`Lưu đánh giá cho học viên ${studentName}`}
          >
            Lưu
          </button>
        </div>
      </div>

      {/* BODY ROW: Metrics & Comment */}
      <div className="flex flex-wrap items-start gap-4">
        {/* Metrics Section */}
        <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-md border border-gray-100 flex-wrap">
          <MetricInput
            label="Tham gia bài giảng"
            value={participation}
            onChange={setParticipation}
            disabled={disabled || isSaving}
          />
          <MetricInput
            label="Kỷ luật / Hành vi"
            value={behavior}
            onChange={setBehavior}
            disabled={disabled || isSaving}
          />
          <MetricInput
            label="Kỹ năng Ngôn ngữ"
            value={languageUsage}
            onChange={setLanguageUsage}
            disabled={disabled || isSaving}
          />
        </div>

        {/* Comment Section */}
        <div className="flex-1 min-w-[250px] flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-700">Nhận xét chi tiết</span>
          <textarea
            value={comment ?? ''}
            onChange={(e) => setComment(e.target.value || null)}
            disabled={disabled || isSaving}
            placeholder="Viết nhận xét về biểu hiện của học viên..."
            className="w-full text-sm p-2 rounded-md border border-gray-200 min-h-[66px] resize-y outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            aria-label="Nhập nhận xét chi tiết"
          />
        </div>
      </div>

      {/* FOOTER ROW: Score (Conditional) */}
      {showScoreSection && (
        <div className="flex items-center pt-3 border-t border-dashed border-gray-200">
          <ScoreInput
            values={{ listening, reading, writing, speaking }}
            noteValue={note}
            onChange={(field, val) => {
              if (field === 'listening') setListening(val);
              if (field === 'reading') setReading(val);
              if (field === 'writing') setWriting(val);
              if (field === 'speaking') setSpeaking(val);
            }}
            onNoteChange={setNote}
            disabled={disabled || isSaving}
            className="bg-amber-50/50 p-3 rounded-md w-full border border-amber-100"
          />
        </div>
      )}

    </div>
  );
};

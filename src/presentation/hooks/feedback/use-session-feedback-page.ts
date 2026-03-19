import { useMemo } from "react";
import type { SessionModel } from "@/domain/sessions/models/session.model";
import type { FeedbackRowModel } from "@/domain/feedback/models/feedback.model";
import { useSession } from "@/presentation/hooks/sessions/use-sessions";
import { useSessionFeedback } from "@/presentation/hooks/feedback/use-feedback";

/**
 * Gom state dữ liệu của trang Session Feedback về một nguồn sự thật.
 * Mục tiêu: page chỉ render theo state này, không phải tự ghép nhiều query rời rạc.
 */
export const useSessionFeedbackPageState = (sessionId: string): {
  session: SessionModel | undefined;
  rows: FeedbackRowModel[];
  isLoading: boolean;
  isError: boolean;
  refetchAll: () => void;
} => {
  const sessionQuery = useSession(sessionId);
  const feedbackQuery = useSessionFeedback(sessionId);

  const isLoading = sessionQuery.isLoading || feedbackQuery.isLoading;
  const isError = sessionQuery.isError || feedbackQuery.isError;

  const rows = useMemo(() => feedbackQuery.data ?? [], [feedbackQuery.data]);

  const refetchAll = () => {
    // Chủ động refetch thay vì reload cả trang.
    sessionQuery.refetch();
    feedbackQuery.refetch();
  };

  return {
    session: sessionQuery.data,
    rows,
    isLoading,
    isError,
    refetchAll,
  };
};

